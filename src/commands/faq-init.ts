import { Command } from "discord-bot-shared"
import { SlashCommandBuilder } from "discord.js"
import initializeFaq from "../faq/initialize-faq.js"
import { moderatorRole } from "../util.js"

const faqInit: Command = {
  requiredRoles: [moderatorRole],
  command: new SlashCommandBuilder()
    .setName("faq-init")
    .setDescription("Initialize the FAQ channel.")
    .addChannelOption((option) =>
      option.setName("faq-channel").setDescription("Select the channel to be used for the FAQ.").setRequired(true),
    )
    .addChannelOption((option) =>
      option
        .setName("faq-log-channel")
        .setDescription("Select the channel that warning/error messages will be sent to.")
        .setRequired(true),
    )
    .toJSON(),
  run: initializeFaq,
}

export default faqInit
