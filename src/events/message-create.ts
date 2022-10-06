import { Message } from "discord.js"
import bot from "../index.js"

bot.on("messageCreate", (message: Message) => {
  void sass(message).catch(console.error)
})

async function sass(message: Message) {
  await respondToWords(["eyir", "sucks"], `fuk u ${message.author.toString()}`)
  await respondToWords(["eyir", "rocks"], `thank u ${message.author.toString()}`)
  await respondToWords(["eyir", "socks"], "🧦")
  await respondToWords(["eyir", "cocks"], "<:yep:703420923625078804>")

  async function respondToWords(words: string[], response: string) {
    if (words.every((word) => message.content.toLowerCase().includes(word))) await message.channel.send(response)
  }
}
