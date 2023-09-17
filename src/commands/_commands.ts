import Bot from "discord-bot-shared"
import faqInit from "./faq-init.js"
import faqRefresh from "./faq-refresh.js"
import listBots from "./list-bots.js"
import sarrifact from "./sarrifact.js"

function addCommands(bot: Bot) {
  bot.commands.add(faqInit)
  bot.commands.add(faqRefresh)
  bot.commands.add(listBots)
  bot.commands.add(sarrifact)
}

export default addCommands
