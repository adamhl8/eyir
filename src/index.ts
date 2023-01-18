import login from "discord-bot-shared"
import { ClientOptions, GatewayIntentBits as Intents } from "discord.js"
import commands from "./commands/_commands.js"
import events from "./events/_events.js"

const botIntents: ClientOptions = {
  intents: [Intents.Guilds, Intents.GuildMembers, Intents.GuildMessages, Intents.MessageContent],
}

const { GuildCollection } = await login(botIntents, commands, events)

const getGuildCollection = () => GuildCollection

export { getGuildCollection }
