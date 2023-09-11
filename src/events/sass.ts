import { Event } from "discord-bot-shared"
import { Events } from "discord.js"

const sass: Event = {
  event: Events.MessageCreate,
  async handler(_, message) {
    await respondToWords(["eyir", "sucks"], `fuk u ${message.author.toString()}`)
    await respondToWords(["eyir", "rocks"], `thank u ${message.author.toString()}`)
    await respondToWords(["eyir", "socks"], "🧦")
    await respondToWords(["eyir", "cocks"], "<:yep:703420923625078804>")
    await respondToWords(["eyir", "cooks"], "Yes chef!")

    async function respondToWords(words: string[], response: string) {
      if (words.every((word) => message.content.toLowerCase().includes(word))) await message.channel.send(response)
    }
  },
}

export default sass
