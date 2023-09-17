import { Command } from "discord-bot-shared"
import { SlashCommandBuilder } from "discord.js"

const sarrifact: Command = {
  command: new SlashCommandBuilder().setName("sarrifact").setDescription("Get a fun fact from Sarri.").toJSON(),
  async run(interaction) {
    await interaction.reply("<@139773837121159168>")
  },
}

export default sarrifact
