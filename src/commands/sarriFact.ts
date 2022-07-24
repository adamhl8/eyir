import { Command } from 'discord-bot-shared'
import { CommandInteraction, SlashCommandBuilder } from 'discord.js'

const sarriFact: Command = {
  command: new SlashCommandBuilder().setName('sarrifact').setDescription('Get a fun fact from Sarri.'),
  run: async (interaction: CommandInteraction) => {
    await interaction.reply('<@139773837121159168>')
  },
}

export default sarriFact
