import { throwError } from "discord-bot-shared"
import { ChannelType, ChatInputCommandInteraction, EmbedBuilder, Message, TextChannel } from "discord.js"
import fsp from "node:fs/promises"
import { fileURLToPath } from "node:url"
import { saveFaqMessages, saveFaqSettings } from "./faq-db.js"
import watchForFaqChanges from "./watcher.js"

const faqDirectory = fileURLToPath(new URL("../../faq", import.meta.url)) + "/"
const faqDirectoryOrder = ["resources", "faq", "arms", "fury", "protection", "pvp"]
type FaqMessages = Record<string, Message>
const faqMessages: FaqMessages = {}

async function initializeFaq(interaction: ChatInputCommandInteraction<"cached">) {
  await interaction.deferReply()

  const guild = await interaction.guild.fetch()
  const faqChannel = interaction.options.getChannel("faq-channel", true, [ChannelType.GuildText])
  const faqLogChannel = interaction.options.getChannel("faq-log-channel", true, [ChannelType.GuildText])

  await saveFaqSettings({ guildId: guild.id, faqChannelId: faqChannel.id, faqLogChannelId: faqLogChannel.id })
  await populateFaqChannel(faqChannel)
  await interaction.editReply(`Initialized ${faqChannel.toString()}`)
  await watchForFaqChanges(faqDirectory, faqChannel, faqLogChannel, faqMessages)
}

async function populateFaqChannel(faqChannel: TextChannel) {
  const guild = await faqChannel.guild.fetch()
  await faqChannel.permissionOverwrites.edit(guild.id, { ViewChannel: false })

  const faqChannelMessages = await faqChannel.messages.fetch()
  faqChannelMessages.each((message) => void message.delete().catch(console.error))

  const header = new EmbedBuilder()
    .setTitle("Click a link below to jump to that section of this channel.")
    .setColor("#fcc200")
  const headerMessage = await faqChannel.send({ embeds: [header] })

  for (const directory of faqDirectoryOrder) {
    const files = await fsp.readdir(faqDirectory + directory)
    for (const file of files) {
      const path = `${faqDirectory + directory}/${file}`

      if (file.endsWith(".png"))
        faqMessages[file] = await faqChannel.send({ files: [{ attachment: path, name: file }] })
      else {
        const data = await fsp.readFile(path, { encoding: "utf8" })
        if (data.length >= 2000)
          throwError(`Unable to initialize ${faqChannel.toString()}. \`${file}\` is over 2000 characters.`)
        faqMessages[file] = await faqChannel.send(data)
      }
    }
  }

  editHeader(header)
  await headerMessage.edit({ embeds: [header] })
  await faqChannel.send({ embeds: [header] })
  await faqChannel.permissionOverwrites.edit(guild.id, { ViewChannel: null })

  await saveFaqMessages(faqMessages, faqChannel.id)
}

function editHeader(header: EmbedBuilder) {
  header.setDescription(
    `[Resources](${faqMessages["resources.png"]?.url ?? ""})
    [FAQ](${faqMessages["faq.png"]?.url ?? ""})
    [Arms](${faqMessages["arms.png"]?.url ?? ""})
    [Fury](${faqMessages["fury.png"]?.url ?? ""})
    [Protection](${faqMessages["protection.png"]?.url ?? ""})
    [PvP](${faqMessages["pvp.png"]?.url ?? ""})`,
  )
}

export default initializeFaq
export { faqDirectory, populateFaqChannel }
export type { FaqMessages }
