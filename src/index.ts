import login from 'discord-bot-shared'
import { ClientOptions, GatewayIntentBits as Intents } from 'discord.js'

const botIntents: ClientOptions = {
  intents: [Intents.Guilds, Intents.GuildMembers, Intents.GuildMessages, Intents.MessageContent],
}

const bot = await login(botIntents, import.meta.url)

export default bot
