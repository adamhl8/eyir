import { SlashCommandBuilder } from '@discordjs/builders'
import { Command, getGuildCache } from 'discord-bot-shared'
import { CommandInteraction, Message, MessageEmbed, TextChannel } from 'discord.js'
import fsp from 'node:fs/promises'
import { moderatorRole } from '../util.js'

const faqMessages: Record<string, Message> = {}
const faqDirectoryOrder = ['resources', 'faq', 'arms', 'fury', 'protection', 'pvp']
const faqSectionOrder: string[] = []
let faqChannel: TextChannel

export const faqInit: Command = {
  requiredRoles: [moderatorRole],
  command: new SlashCommandBuilder().setName('faq-init').setDescription('Initialize the FAQ channel.'),
  run: async (interaction: CommandInteraction) => {
    const guildCache = await getGuildCache()
    if (!guildCache) throw new Error('Unable to get guild cache.')
    const { channels } = guildCache

    const getFaqChannel = channels.find((channel) => channel.name === 'guides-resources-faq')
    if (!getFaqChannel || getFaqChannel.type !== 'GUILD_TEXT') throw new Error('Unable to get faq channel.')
    faqChannel = getFaqChannel

    const faqChannelMessages = await faqChannel.messages.fetch()

    try {
      await faqChannel.bulkDelete(faqChannelMessages, true)
    } catch {
      faqChannelMessages.each((message) => void message.delete().catch(console.error))
    }

    handleOrder = faqDirectoryOrder
    await sendHeader()
    await interaction.reply(`Initialized ${faqChannel.name}`)
  },
}

const header = new MessageEmbed()
let headerMessage: Message

async function sendHeader() {
  header.setTitle('Click a link below to jump to that section of this channel.')
  header.setColor('#fcc200')

  const message = await faqChannel.send({ embeds: [header] }).catch(console.error)
  if (!message) return
  headerMessage = message

  await readFaqDirectories()
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
    const files = await fsp.readdir('../../faq/' + currentDirectory)
    void handleDirectoryFiles(files)
  } else await sendSections()
}

async function sendSections() {
  if (faqSectionOrder.length > 0) {
    const currentSection = faqSectionOrder[0]
    const currentDirectoryArray = /[A-Za-z]+/.exec(currentSection)
    if (!currentDirectoryArray) return
    const currentDirectory = `${currentDirectoryArray[0]}/`

    if (currentSection.endsWith('.png')) {
      const message = await faqChannel
        .send({
          files: [
            {
              attachment: './faq/' + currentDirectory + currentSection,
              name: currentSection,
            },
          ],
        })
        .catch(console.error)
      if (!message) return

      faqMessages[currentSection] = message
      faqSectionOrder.shift()
      await sendSections()
    } else {
      faqChannel
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
