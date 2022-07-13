import { SlashCommandBuilder } from '@discordjs/builders'
import chokidar from 'chokidar'
import { Command, getGuildCache } from 'discord-bot-shared'
import { CommandInteraction, Message, MessageEmbed, TextChannel } from 'discord.js'
import fsp from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { moderatorRole } from '../util.js'

const faqDirectory = fileURLToPath(new URL('../../faq', import.meta.url)) + '/'
const faqMessages: Record<string, Message> = {}
const faqDirectoryOrder = ['resources', 'faq', 'arms', 'fury', 'protection', 'pvp']
const faqSectionOrder: string[] = []
let faqChannel: TextChannel
let guildId: string

export const faqInit: Command = {
  requiredRoles: [moderatorRole],
  command: new SlashCommandBuilder().setName('faq-init').setDescription('Initialize the FAQ channel.'),
  run: async (interaction: CommandInteraction) => {
    const guildCache = await getGuildCache()
    if (!guildCache) throw new Error('Unable to get guild cache.')
    const { channels, guild } = guildCache

    const getFaqChannel = channels.find((channel) => channel.name === 'guides-resources-faq')
    if (!getFaqChannel || getFaqChannel.type !== 'GUILD_TEXT') throw new Error('Unable to get faq channel.')
    faqChannel = getFaqChannel

    guildId = guild.id
    await faqChannel.permissionOverwrites.create(guildId, { VIEW_CHANNEL: false }).catch(console.error)

    const faqChannelMessages = await faqChannel.messages.fetch()
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    faqChannelMessages.each(async (message) => await message.delete().catch(console.error))

    handleOrder = [...faqDirectoryOrder]
    await sendHeader()
    await interaction.reply(`Initialized ${faqChannel.toString()}`)
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
    const files = await fsp.readdir(faqDirectory + currentDirectory)
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
              attachment: faqDirectory + currentDirectory + currentSection,
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
      const message = await faqChannel.send(await getSectionData(currentDirectory, currentSection)).catch(console.error)
      if (!message) return

      faqMessages[currentSection] = message
      faqSectionOrder.shift()
      await sendSections()
    }
  } else {
    await editHeader().catch(console.error)
    await faqChannel.send({ embeds: [header] }).catch(console.error)
    // eslint-disable-next-line unicorn/no-null
    await faqChannel.permissionOverwrites.edit(guildId, { VIEW_CHANNEL: null }).catch(console.error)
  }
}

async function editHeader() {
  header.setDescription(
    `[Resources](${faqMessages['resources.png'].url})
    [FAQ](${faqMessages['faq.png'].url})
    [Arms](${faqMessages['arms.png'].url})
    [Fury](${faqMessages['fury.png'].url})
    [Protection](${faqMessages['protection.png'].url})
    [PvP](${faqMessages['pvp.png'].url})`,
  )
  await headerMessage.edit({ embeds: [header] }).catch(console.error)
}

async function getSectionData(directory: string, file: string) {
  return await fsp.readFile(faqDirectory + directory + file, { encoding: 'utf8' })
}

const watcher = chokidar.watch(`${faqDirectory}*/*`)

// eslint-disable-next-line @typescript-eslint/no-misused-promises
watcher.on('change', async (path) => {
  const parsePath = /.+faq\/(.+\/)(.+)/.exec(path)
  if (!parsePath) return console.error('Unable to parse path.')

  const currentDirectory = parsePath[1]
  const currentFile = parsePath[2]

  const sectionData = await getSectionData(currentDirectory, currentFile).catch(console.error)
  if (!sectionData) return console.error('Unable to get section data.')

  await faqMessages[currentFile].edit(sectionData).catch(console.error)
})

export default faqInit
