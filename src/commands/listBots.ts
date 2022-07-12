import { SlashCommandBuilder } from '@discordjs/builders'
import { Command, getGuildCache } from 'discord-bot-shared'
import { CommandInteraction } from 'discord.js'
import { moderatorRole } from '../util.js'

const listBots: Command = {
  requiredRoles: [moderatorRole],
  command: new SlashCommandBuilder().setName('list-bots').setDescription('List all the Discord bots in the server.'),
  run: async (interaction: CommandInteraction) => {
    const guildCache = await getGuildCache()
    if (!guildCache) throw new Error('Unable to get guild cache.')
    const { members } = guildCache

    const bots = members.filter((member) => member.user.bot).values()

    let message = ''
    for (const bot of bots) {
      message += `${bot.toString()}\n`
    }
    if (!message) message = 'No bots found.'
    await interaction.reply(message).catch(console.error)
  },
}

export default listBots
