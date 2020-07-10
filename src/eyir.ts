require("dotenv").config({ path: process.argv[2] })

import Discord, { Guild, Role, Message, GuildMember, PartialGuildMember } from "discord.js"
import gaze from "gaze"
import * as Util from "./modules/util"
import * as Commands from "./modules/commands"
import { Command } from "./modules/commands"
import ObjectCache from "./modules/ObjectCache"

const bot = new Discord.Client()
bot.login(process.env.TOKEN)

bot.on("ready", () => {
  console.log("I am ready!")

  run()
})

let roleCache: ObjectCache<Role> = new ObjectCache()

function run() {
  const skyhold = bot.guilds.cache.first()
  if (!skyhold) {
    throw Error("failed to init guild")
  }

  roleCache = Util.collectionToCacheByName(skyhold.roles.cache)
  bot.on("roleUpdate", () => (roleCache = Util.collectionToCacheByName(skyhold.roles.cache)))
  bot.on("roleCreate", () => (roleCache = Util.collectionToCacheByName(skyhold.roles.cache)))
  bot.on("roleDelete", () => (roleCache = Util.collectionToCacheByName(skyhold.roles.cache)))
  applyValarjar(skyhold)
}

function applyValarjar(guild: Guild) {
  guild.members.cache.array().forEach((member) => {
    if (!Util.isExcluded(member, roleCache)) {
      member.roles
        .add(roleCache.getOrThrow("Valarjar").id)
        .then((member) => console.log("Added Valarjar to " + member.user.tag))
        .catch(console.log)
    }
  })
}

let faqMessages: Record<string, Message> = {}

//@ts-ignore
gaze("./faq/*/*", (err, watcher) => {
  watcher.on("changed", (fp: string) => {
    const parseFilepath = /.+faq\/(.+\/)(.+)/.exec(fp)
    if (!parseFilepath) {
      throw Error(`failed to parse file path: ${fp}`)
    }

    const currentDir = parseFilepath[1]
    const currentFile = parseFilepath[2]

    Util.faqset(currentDir, currentFile, faqMessages[currentFile])
  })
})

export function setFaqMessages(obj: Record<string, Message>) {
  faqMessages = obj
}

bot.on("guildMemberAdd", async (member: GuildMember | PartialGuildMember) => {
  if (isPartial(member)) {
    // PartialGuildMember
    try {
      const m = await member.fetch()
      Util.welcomeNewMember(m)
    } catch (e) {
      console.log("failed to fecth partial member on guildMemberAdd")
    }
  } else {
    // GuildMember
    Util.welcomeNewMember(member)
  }

  member.roles.add(roleCache.getOrThrow("Valarjar").id).catch(console.log)
})

function isPartial(member: GuildMember | PartialGuildMember): member is PartialGuildMember {
  return member.partial
}

bot.on("message", (msg: Message) => {
  if (msg.author.bot) return

  Util.sass(msg)

  const prefix = "!"

  if (!msg.content.startsWith(prefix)) return

  let match = /!(\S+)/g.exec(msg.content)
  let command = "none"
  if (match) {
    command = match[1]
  }

  if (!msg.member) {
    throw Error(`there is no member attached to message ${msg.id}`)
  }

  const commands: Record<string, Command> = Commands

  if (commands.hasOwnProperty(command)) {
    if (commands[command].reqMod && !Util.isMod(msg.member, roleCache)) {
      msg.channel
        .send("You do not have the required moderator role to run this command.")
        .catch(console.log)
    } else {
      commands[command].run(msg)
    }
  }
})
