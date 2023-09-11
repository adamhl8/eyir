import Bot from "discord-bot-shared"
import { ClientOptions, GatewayIntentBits as Intents } from "discord.js"
import addCommands from "./commands/_commands.js"
import addEvents from "./events/_events.js"

const applicationId = process.env.APPLICATION_ID ?? ""
const token = process.env.BOT_TOKEN ?? ""

const clientOptions: ClientOptions = {
  intents: [Intents.Guilds, Intents.GuildMembers, Intents.GuildMessages, Intents.MessageContent],
}

const bot = new Bot({ applicationId, token, clientOptions })

addCommands(bot)
addEvents(bot)

await bot.commands.unregisterGuildCommands()
await bot.commands.unregisterApplicationCommands()
await bot.commands.register()
await bot.login()
