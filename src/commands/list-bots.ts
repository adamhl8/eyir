import { Command } from "discord-bot-shared"
import { SlashCommandBuilder } from "discord.js"
import { moderatorRole } from "../util.js"

const listBots: Command = {
  requiredRoles: [moderatorRole],
  command: new SlashCommandBuilder()
    .setName("list-bots")
    .setDescription("List all the Discord bots in the server.")
    .toJSON(),
  run: async (interaction) => {
    await interaction.deferReply()

    const guild = await interaction.guild.fetch()
    const members = await guild.members.fetch()

    const bots = members.filter((member) => member.user.bot).values()

    let message = ""
    for (const bot of bots) {
      message += `${bot.toString()}\n`
    }
    if (!message) message = "No bots found."
    await interaction.editReply(message)
  },
}

export default listBots
