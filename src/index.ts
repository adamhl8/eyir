import Discord, { Guild, GuildMember, Message, PartialGuildMember, Role } from 'discord.js'
import dotenv from 'dotenv'
import { Gaze } from 'gaze'
import * as Commands from './modules/commands.js'
import ObjectCache from './modules/object-cache.js'
import * as Util from './modules/util.js'

dotenv.config()

const bot = new Discord.Client()
void bot.login(process.env.TOKEN)

bot.on('ready', () => {
  console.log('I am ready!')

  run()
})

let roleCache = ObjectCache.empty<Role>()

function run() {
  const skyhold = bot.guilds.cache.first()
  if (!skyhold) {
    throw new Error('failed to init guild')
  }

  roleCache = ObjectCache.fromCollection(skyhold.roles.cache)
  bot.on('roleUpdate', () => {
    roleCache = ObjectCache.fromCollection(skyhold.roles.cache)
  })
  bot.on('roleCreate', () => {
    roleCache = ObjectCache.fromCollection(skyhold.roles.cache)
  })
  bot.on('roleDelete', () => {
    roleCache = ObjectCache.fromCollection(skyhold.roles.cache)
  })
  applyValarjarToAll(skyhold)
}

function applyValarjarToAll(guild: Guild) {
  for (const member of guild.members.cache.array()) {
    if (!Util.isExcluded(member, roleCache)) {
      member.roles
        .add(roleCache.getOrThrow('Valarjar').id)
        .then((member) => {
          console.log('Added Valarjar to ' + member.user.tag)
        })
        .catch(console.log)
    }
  }
}

let faqMessages: Record<string, Message> = {}

const gaze = new Gaze('./faq/*/*')

// @ts-expect-error Type definitions aren't written properly. on() doesn't exist.
// eslint-disable-next-line @typescript-eslint/no-unsafe-call
gaze.on('changed', (fp: string) => {
  const parseFilepath = /.+faq\/(.+\/)(.+)/.exec(fp)
  if (!parseFilepath) {
    throw new Error(`failed to parse file path: ${fp}`)
  }

  const currentDirectory = parseFilepath[1]
  const currentFile = parseFilepath[2]

  Util.faqset(currentDirectory, currentFile, faqMessages[currentFile])
})

export function setFaqMessages(object: Record<string, Message>): void {
  faqMessages = object
}

async function applyValarjar(member: GuildMember | PartialGuildMember) {
  if (isPartial(member)) {
    // PartialGuildMember
    try {
      const m = await member.fetch()
      Util.welcomeNewMember(m)
    } catch {
      console.log('failed to fetch partial member on guildMemberAdd')
    }
  } else {
    // GuildMember
    Util.welcomeNewMember(member)
  }

  member.roles.add(roleCache.getOrThrow('Valarjar').id).catch(console.log)
}

function isPartial(member: GuildMember | PartialGuildMember): member is PartialGuildMember {
  return member.partial
}

async function handleMessage(message: Message) {
  if (message.author.bot) return

  await Util.sass(message)

  const prefix = '!'

  if (!message.content.startsWith(prefix)) return

  const match = /!(\S+)/g.exec(message.content)
  let command = 'none'
  if (match) {
    command = match[1]
  }

  if (!message.member) {
    throw new Error(`there is no member attached to message ${message.id}`)
  }

  const commands: Record<string, Commands.Command> = Commands

  if (Object.prototype.hasOwnProperty.call(commands, command)) {
    if (commands[command].reqMod && !Util.isModerator(message.member, roleCache)) {
      message.channel.send('You do not have the required moderator role to run this command.').catch(console.log)
    } else {
      commands[command].run(message)
    }
  }
}

bot.on('message', (message: Message) => {
  void handleMessage(message)
})

bot.on('guildMemberAdd', (member: GuildMember | PartialGuildMember) => {
  void applyValarjar(member)
})
