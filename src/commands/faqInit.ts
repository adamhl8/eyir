import chokidar from 'chokidar'
import { Command, getGuildCache, isTextChannel, throwError } from 'discord-bot-shared'
import { EmbedBuilder, Message, SlashCommandBuilder } from 'discord.js'
import fsp from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { moderatorRole } from '../util.js'

const faqDirectory = fileURLToPath(new URL('../../faq', import.meta.url)) + '/'
const faqDirectoryOrder = ['resources', 'faq', 'arms', 'fury', 'protection', 'pvp']
const faqMessages: Record<string, Message> = {}

export const faqInit: Command = {
  requiredRoles: [moderatorRole],
  command: new SlashCommandBuilder().setName('faq-init').setDescription('Initialize the FAQ channel.'),
  run: async (interaction) => {
    await interaction.deferReply()

    const { channels, guild } = (await getGuildCache()) || throwError('Unable to get guild cache.')

    const faqChannel =
      channels.find((channel) => channel.name === 'guides-resources-faq') || throwError('Unable to get faq channel.')
    if (!isTextChannel(faqChannel)) throwError('Channel is not a text channel.')

    await faqChannel.permissionOverwrites.edit(guild.id, { ViewChannel: false })

    const faqChannelMessages = await faqChannel.messages.fetch()
    faqChannelMessages.each((message) => void message.delete().catch(console.error))

    const header = new EmbedBuilder()
      .setTitle('Click a link below to jump to that section of this channel.')
      .setColor('#fcc200')
    const headerMessage = await faqChannel.send({ embeds: [header] })

    for (const directory of faqDirectoryOrder) {
      const files = await fsp.readdir(faqDirectory + directory)
      for (const file of files) {
        const path = `${faqDirectory + directory}/${file}`
        if (file.endsWith('.png'))
          faqMessages[file] = await faqChannel.send({ files: [{ attachment: path, name: file }] })
        else faqMessages[file] = await faqChannel.send(await fsp.readFile(path, { encoding: 'utf8' }))
      }
    }

    editHeader(header)
    await headerMessage.edit({ embeds: [header] })
    await faqChannel.send({ embeds: [header] })
    // eslint-disable-next-line unicorn/no-null
    await faqChannel.permissionOverwrites.edit(guild.id, { ViewChannel: null })
    await interaction.editReply(`Initialized ${faqChannel.toString()}`)
  },
}

function editHeader(header: EmbedBuilder) {
  header.setDescription(
    `[Resources](${faqMessages['resources.png'].url})
    [FAQ](${faqMessages['faq.png'].url})
    [Arms](${faqMessages['arms.png'].url})
    [Fury](${faqMessages['fury.png'].url})
    [Protection](${faqMessages['protection.png'].url})
    [PvP](${faqMessages['pvp.png'].url})`,
  )
}

const watcher = chokidar.watch(`${faqDirectory}*/*`)

// eslint-disable-next-line @typescript-eslint/no-misused-promises
watcher.on('change', async (path) => {
  const data = await fsp.readFile(path, { encoding: 'utf8' }).catch(console.error)
  if (!data) return console.error('Unable to get file data.')

  const file = path.split('/').pop()
  if (!file) return console.error('Unable to get file name.')
  await faqMessages[file].edit(data).catch(console.error)
})

export default faqInit
