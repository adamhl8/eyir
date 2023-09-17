import Bot from "discord-bot-shared"
import applyValarjar from "./apply-valarjar.js"
import memberJoin from "./member-join.js"
import sass from "./sass.js"
import watchFaq from "./watch-faq.js"

function addEvents(bot: Bot) {
  bot.events.add(applyValarjar)
  bot.events.add(memberJoin)
  bot.events.add(sass)
  bot.events.add(watchFaq)
}

export default addEvents
