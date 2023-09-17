import { throwError } from "discord-bot-shared"
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  ChatInputCommandInteraction,
  EmbedBuilder,
  Message,
  TextChannel,
} from "discord.js"
import fsp from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { saveFaqMessages, saveFaqSettings } from "./faq-db.js"
import watchForFaqChanges from "./watcher.js"

const faqDirectory = fileURLToPath(new URL("../../faq", import.meta.url)) + "/"
const faqDirectoryOrder = ["resources", "faq", "arms", "fury", "protection", "pvp"]
type FaqMessages = Record<string, Message>
const faqMessages: FaqMessages = {}

async function initializeFaq(interaction: ChatInputCommandInteraction<"cached">) {
  const guild = await interaction.guild.fetch()
  const faqChannel = interaction.options.getChannel("faq-channel", true, [ChannelType.GuildText])
  const faqLogChannel = interaction.options.getChannel("faq-log-channel", true, [ChannelType.GuildText])

  if (!(await isFaqChannelConfirmed(interaction, faqChannel))) return

  await saveFaqSettings({ guildId: guild.id, faqChannelId: faqChannel.id, faqLogChannelId: faqLogChannel.id })
  await populateFaqChannel(faqChannel)
  await interaction.editReply(`Initialized ${faqChannel.toString()}`)
  await watchForFaqChanges(faqDirectory, faqChannel, faqLogChannel, faqMessages)
}

async function isFaqChannelConfirmed(interaction: ChatInputCommandInteraction<"cached">, faqChannel: TextChannel) {
  const cancel = new ButtonBuilder().setCustomId("cancel").setLabel("Cancel").setStyle(ButtonStyle.Secondary)
  const confirm = new ButtonBuilder().setCustomId("confirm").setLabel("Confirm").setStyle(ButtonStyle.Danger)
  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(cancel, confirm)

  const response = await interaction.reply({
    content: `**ALL MESSAGES IN ${faqChannel.toString()} WILL BE *DELETED*.** ARE YOU SURE THIS IS THE RIGHT CHANNEL?`,
    components: [row],
  })

  const confirmation = await response
    .awaitMessageComponent({
      filter: (i) => i.user.id === interaction.user.id,
      time: 30_000,
    })
    .catch(() => {
      console.error("faq-init confirmation timed out.")
    })

  if (!confirmation) {
    await interaction.editReply({ content: "Did not receive response. Cancelled FAQ initialization.", components: [] })
    return false
  }

  if (confirmation.customId !== "confirm") {
    await confirmation.update({
      content: `Cancelled FAQ initialization.`,
      components: [row.setComponents(cancel.setDisabled(true))],
    })
    return false
  }

  await confirmation.update({
    content: `Using ${faqChannel.toString()} as FAQ channel.\nInitializing FAQ...`,
    components: [row.setComponents(confirm.setDisabled(true))],
  })

  return true
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

  const processFaqDirectory = async (directory: string) => {
    const files = await fsp.readdir(path.join(faqDirectory, directory))
    for (const file of files) {
      const filePath = path.join(faqDirectory, directory, file)

      if (file.endsWith(".png")) {
        faqMessages[file] = await faqChannel.send({ files: [{ attachment: filePath, name: file }] })
      } else {
        const data = await fsp.readFile(filePath, { encoding: "utf8" })
        if (data.length >= 2000) {
          throwError(`Unable to initialize ${faqChannel.toString()}. \`${file}\` is over 2000 characters.`)
        }
        faqMessages[file] = await faqChannel.send(data)
      }
    }
  }

  for (const directory of faqDirectoryOrder) {
    await processFaqDirectory(directory)
  }

  editHeader(header)
  await Promise.all([headerMessage.edit({ embeds: [header] }), faqChannel.send({ embeds: [header] })])
  await Promise.all([
    faqChannel.permissionOverwrites.edit(guild.id, { ViewChannel: null }),
    saveFaqMessages(faqMessages, faqChannel.id),
  ])
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
