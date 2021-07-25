import Discord, { Message } from 'discord.js'
import fs from 'node:fs'
import * as Main from '../index'
import * as Util from './util'

export interface Command {
  reqMod: boolean
  run: (message: Message) => void
}

export const listBots: Command = {
  reqMod: true,

  run: (message) => {
    if (!message.guild) {
      throw new Error(`there is no guild attached to message ${message.id}`)
    }

    for (const bot of message.guild.members.cache.array().filter((member) => member.user.bot)) {
      message.channel.send('<@' + bot.user.id + '>').catch(console.log)
    }
  },
}

export const sarriFact: Command = {
  reqMod: false,

  run: async (message) => {
    await message.channel.send('<@139773837121159168>').catch(console.error)
  },
}

export const thoughtsOnXeos: Command = {
  reqMod: false,

  run: async (message) => {
    await message.channel.send(`free austin "candy seller" chase michaels`).catch(console.error)
  },
}

const faqMessages: Record<string, Message> = {}
const faqDirectoryOrder = ['resources', 'faq', 'arms', 'fury', 'protection', 'pvp']
const faqSectionOrder: string[] = []
let initMessage: Message

export const faqInit: Command = {
  reqMod: true,

  run: async (message) => {
    if (message.channel.type !== 'text') return
    if (message.channel.name !== 'guides-resources-faq') {
      await message.channel.send('!faqInit cannot be run in this channel.').catch(console.error)
      return
    }

    await message.channel.bulkDelete(await message.channel.messages.fetch())
    initMessage = message
    handleOrder = faqDirectoryOrder
    sendHeader()
  },
}

const header = new Discord.MessageEmbed()
let headerMessage: Message

function sendHeader() {
  header.setTitle('Click a link below to jump to that section of this channel.')
  header.setColor('#fcc200')

  initMessage.channel
    .send(header)
    .then(async (message) => {
      headerMessage = message
      await readFaqDirectories()
    })
    .catch(console.error)
}

let handleOrder: string[] = []

async function handleDirectoryFiles(files: string[]) {
  for (const file of files) {
    faqSectionOrder.push(file)
  }

  handleOrder.shift()
  await readFaqDirectories()
}

async function readFaqDirectories() {
  if (handleOrder.length > 0) {
    const currentDirectory = handleOrder[0]

    fs.readdir('./faq/' + currentDirectory, (error, files: string[]) => {
      void handleDirectoryFiles(files)
    })
  } else {
    await sendSections()
  }
}

async function sendSections() {
  if (faqSectionOrder.length > 0) {
    const currentSection = faqSectionOrder[0]
    const currentDirectoryArray = /[A-Za-z]+/.exec(currentSection)
    if (!currentDirectoryArray) return
    const currentDirectory = `${currentDirectoryArray[0]}/`

    if (currentSection.endsWith('.png')) {
      initMessage.channel
        .send({
          files: [
            {
              attachment: './faq/' + currentDirectory + currentSection,
              name: currentSection,
            },
          ],
        })
        .then(async (message) => {
          faqMessages[currentSection] = message
          faqSectionOrder.shift()
          await sendSections()
        })
        .catch(console.error)
    } else {
      initMessage.channel
        .send(currentSection)
        .then(async (message) => {
          faqMessages[currentSection] = message
          Util.faqset(currentDirectory, currentSection, faqMessages[currentSection])
          faqSectionOrder.shift()
          await sendSections()
        })
        .catch(console.error)
    }
  } else {
    Main.setFaqMessages(faqMessages)
    await editHeader()
    await initMessage.channel.send(header).catch(console.error)
  }
}

async function editHeader() {
  header.setDescription(
    `[Resources](https://discordapp.com/channels/148872210742771712/268491842637660160/${faqMessages['resources.png'].id})
    [FAQ](https://discordapp.com/channels/148872210742771712/268491842637660160/${faqMessages['faq.png'].id})
    [Arms](https://discordapp.com/channels/148872210742771712/268491842637660160/${faqMessages['arms.png'].id})
    [Fury](https://discordapp.com/channels/148872210742771712/268491842637660160/${faqMessages['fury.png'].id})
    [Protection](https://discordapp.com/channels/148872210742771712/268491842637660160/${faqMessages['protection.png'].id})
    [PvP](https://discordapp.com/channels/148872210742771712/268491842637660160/${faqMessages['pvp.png'].id})`,
  )
  await headerMessage.edit(header)
}
