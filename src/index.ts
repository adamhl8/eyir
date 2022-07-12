import login from 'discord-bot-shared'
import { ClientOptions, Intents } from 'discord.js'

const botIntents: ClientOptions = {
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_MESSAGES],
  partials: ['USER'],
}

const bot = await login(botIntents, import.meta.url)

export default bot
