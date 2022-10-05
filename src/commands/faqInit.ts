import chokidar from "chokidar"
import { Command, getChannel, getGuildCache, throwError } from "discord-bot-shared"
import { ChannelType, EmbedBuilder, Message, SlashCommandBuilder, TextChannel } from "discord.js"
import fsp from "node:fs/promises"
import { fileURLToPath } from "node:url"
import { moderatorRole } from "util.js"

const faqDirectory = fileURLToPath(new URL("../../faq", import.meta.url)) + "/"
const faqDirectoryOrder = ["resources", "faq", "arms", "fury", "protection", "pvp"]
const faqMessages: Record<string, Message> = {}
let faqChannelIsInitialized = false

export const faqInit: Command = {
  requiredRoles: [moderatorRole],
  command: new SlashCommandBuilder().setName("faq-init").setDescription("Initialize the FAQ channel."),
  run: async (interaction) => {
    await interaction.deferReply()
    faqChannelIsInitialized = false

    const { guild } = (await getGuildCache()) || throwError("Unable to get guild cache.")

    const faqChannel =
      (await getChannel<TextChannel>("guides-resources-faq", ChannelType.GuildText)) || throwError("Unable to get faq channel.")

    await faqChannel.permissionOverwrites.edit(guild.id, { ViewChannel: false })

    const faqChannelMessages = await faqChannel.messages.fetch()
    faqChannelMessages.each((message) => void message.delete().catch(console.error))

    const header = new EmbedBuilder().setTitle("Click a link below to jump to that section of this channel.").setColor("#fcc200")
    const headerMessage = await faqChannel.send({ embeds: [header] })

    for (const directory of faqDirectoryOrder) {
      const files = await fsp.readdir(faqDirectory + directory)
      for (const file of files) {
        const path = `${faqDirectory + directory}/${file}`

        if (file.endsWith(".png")) faqMessages[file] = await faqChannel.send({ files: [{ attachment: path, name: file }] })
        else {
          const data = await fsp.readFile(path, { encoding: "utf8" })
          if (data.length >= 2000) throwError(`Unable to initialize ${faqChannel.toString()}. \`${file}\` is over 2000 characters.`)
          faqMessages[file] = await faqChannel.send(data)
        }
      }
    }

    editHeader(header)
    await headerMessage.edit({ embeds: [header] })
    await faqChannel.send({ embeds: [header] })
    // eslint-disable-next-line unicorn/no-null
    await faqChannel.permissionOverwrites.edit(guild.id, { ViewChannel: null })
    await interaction.editReply(`Initialized ${faqChannel.toString()}`)
    faqChannelIsInitialized = true
  },
}

function editHeader(header: EmbedBuilder) {
  header.setDescription(
    `[Resources](${faqMessages["resources.png"].url})
    [FAQ](${faqMessages["faq.png"].url})
    [Arms](${faqMessages["arms.png"].url})
    [Fury](${faqMessages["fury.png"].url})
    [Protection](${faqMessages["protection.png"].url})
    [PvP](${faqMessages["pvp.png"].url})`,
  )
}

const watcher = chokidar.watch(`${faqDirectory}*/*`)

// eslint-disable-next-line @typescript-eslint/no-misused-promises
watcher.on("change", async (path) => {
  const stormforgedChannel = await getChannel<TextChannel>("stormforged", ChannelType.GuildText)
  if (!stormforgedChannel) return console.error("Unable to get stormforged channel.")
  const faqChannel = await getChannel<TextChannel>("guides-resources-faq", ChannelType.GuildText)
  if (!faqChannel) return console.error("Unable to get faq channel.")

  const file = path.split("/").pop()
  if (!file) return console.error("Unable to get file name.")

  if (!faqChannelIsInitialized)
    return await stormforgedChannel
      .send(`Changes detected in \`${file}\`, but ${faqChannel.toString()} is not initialized. Please have a moderator run \`/faq-init\`.`)
      .catch(console.error)

  const data = await fsp.readFile(path, { encoding: "utf8" }).catch(console.error)
  if (!data) return console.error("Unable to get file data.")

  if (data.length >= 2000)
    return await stormforgedChannel
      .send(`Changes detected in \`${file}\`, but unable to update ${faqChannel.toString()}. \`${file}\` is over 2000 characters.`)
      .catch(console.error)

  if (!faqMessages[file])
    return await stormforgedChannel
      .send(
        `Changes detected in \`${file}\`, but ${faqChannel.toString()} has not been initialized with that file. Please have a moderator run \`/faq-init\`.`,
      )
      .catch(console.error)

  await faqMessages[file].edit(data).catch(console.error)
})

export default faqInit
