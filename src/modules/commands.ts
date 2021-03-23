import Discord, { Message, Collection, GuildMember } from "discord.js"
import fs from "fs"
import * as Util from "./util"
import * as Main from "../index"

export interface Command {
  reqMod: boolean
  run: (msg: Message) => void
}

export const listbots: Command = {
  reqMod: true,

  run: (msg) => {
    if (!msg.guild) {
      throw Error(`there is no guild attached to message ${msg.id}`)
    }

    msg.guild.members.cache
      .array()
      .filter((member) => member.user.bot)
      .forEach((bot) => {
        msg.channel.send("<@" + bot.user.id + ">").catch(console.log)
      })
  },
}

export const sarriFact: Command = {
  reqMod: false,

  run: async (msg) => {
    await msg.channel.send("<@139773837121159168>").catch(console.error)
  },
}

export const thoughtsOnXeos: Command = {
  reqMod: false,

  run: async (msg) => {
    await msg.channel.send(`free austin "candy seller" chase michaels`).catch(console.error)
  },
}

let faqMessages: Record<string, Message> = {}
const faqDirOrder = ["resources", "faq", "arms", "fury", "protection", "pvp"]
let faqSectionOrder: Array<string> = []
let initMessage: Message

export const faqinit: Command = {
  reqMod: true,

  run: async msg => {
    if (msg.channel.type != "text") return
    if (msg.channel.name != "guides-resources-faq") return await msg.channel.send("!faqinit cannot be run in this channel.").catch(console.error)
    const messages = await msg.channel.messages.fetch()
    messages.each(async message => {
      await message.delete().catch(console.error)
    })
    initMessage = msg
    handleOrder = faqDirOrder
    sendHeader()
  },
}

let header = new Discord.MessageEmbed()
let headerMessage: Message

function sendHeader() {
  header.setTitle("Click a link below to jump to that section of this channel.")
  header.setColor("#fcc200")

  initMessage.channel
    .send(header)
    .then((msg) => {
      headerMessage = msg
      readFaqDirs()
    })
    .catch(console.error)
}

let handleOrder: Array<string>

function readFaqDirs() {
  if (handleOrder.length > 0) {
    let currentDir = handleOrder[0]

    fs.readdir("./faq/" + currentDir, (err, files) => {
      files.forEach((file) => {
        faqSectionOrder.push(file)
      })

      handleOrder.shift()
      readFaqDirs()
    })
  } else {
    sendSections()
  }
}

function sendSections() {
  if (faqSectionOrder.length > 0) {
    let currentSection = faqSectionOrder[0]
    let currentDir = currentSection.match(/[a-zA-Z]+/) + "/"

    if (currentSection.endsWith(".png")) {
      initMessage.channel
        .send({
          files: [
            {
              attachment: "./faq/" + currentDir + currentSection,
              name: currentSection,
            },
          ],
        })
        .then((msg) => {
          faqMessages[currentSection] = msg
          faqSectionOrder.shift()
          sendSections()
        })
        .catch(console.error)
    } else {
      initMessage.channel
        .send(currentSection)
        .then((msg) => {
          faqMessages[currentSection] = msg
          Util.faqset(currentDir, currentSection, faqMessages[currentSection])
          faqSectionOrder.shift()
          sendSections()
        })
        .catch(console.error)
    }
  } else {
    Main.setFaqMessages(faqMessages)
    editHeader()
    initMessage.channel.send(header).catch(console.error)
  }
}

function editHeader() {
  header.setDescription(
    `[Resources](https://discordapp.com/channels/148872210742771712/268491842637660160/${faqMessages["resources.png"].id})
    [FAQ](https://discordapp.com/channels/148872210742771712/268491842637660160/${faqMessages["faq.png"].id})
    [Arms](https://discordapp.com/channels/148872210742771712/268491842637660160/${faqMessages["arms.png"].id})
    [Fury](https://discordapp.com/channels/148872210742771712/268491842637660160/${faqMessages["fury.png"].id})
    [Protection](https://discordapp.com/channels/148872210742771712/268491842637660160/${faqMessages["protection.png"].id})
    [PvP](https://discordapp.com/channels/148872210742771712/268491842637660160/${faqMessages["pvp.png"].id})`
  )
  headerMessage.edit(header)
}
