import { Command, getChannel, throwUserError } from "discord-bot-shared"
import { ChannelType, SlashCommandBuilder } from "discord.js"
import { getFaqSettings } from "../faq/faq-db.js"
import { populateFaqChannel } from "../faq/initialize-faq.js"
import { moderatorRole } from "../util.js"

const faqRefresh: Command = {
  requiredRoles: [moderatorRole],
  command: new SlashCommandBuilder().setName("faq-refresh").setDescription("Refresh the FAQ channel.").toJSON(),

  async run(interaction) {
    await interaction.deferReply()

    const guild = await interaction.guild.fetch()
    const faqSettings = await getFaqSettings(guild.id)
    if (!faqSettings)
      throwUserError(`Unable to refresh the FAQ channel. Failed to find existing settings. Run \`/faq-init\` first.`)

    const faqChannel = await getChannel(guild, faqSettings.faqChannelId, ChannelType.GuildText)
    await populateFaqChannel(faqChannel)

    await interaction.editReply(`Refreshed ${faqChannel.toString()}`)
  },
}

export default faqRefresh
