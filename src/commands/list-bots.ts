import { Command, getGuildCache, throwError } from "discord-bot-shared"
import { CommandInteraction, SlashCommandBuilder } from "discord.js"
import { moderatorRole } from "../util.js"

const listBots: Command = {
  requiredRoles: [moderatorRole],
  command: new SlashCommandBuilder().setName("list-bots").setDescription("List all the Discord bots in the server."),
  run: async (interaction: CommandInteraction) => {
    const { members } = (await getGuildCache()) || throwError("Unable to get guild cache.")

    const bots = members.filter((member) => member.user.bot).values()

    let message = ""
    for (const bot of bots) {
      message += `${bot.toString()}\n`
    }
    if (!message) message = "No bots found."
    await interaction.reply(message)
  },
}

export default listBots
