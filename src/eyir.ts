require("dotenv").config({ path: process.argv[2] })

import Discord, { Guild, Role, Message, GuildMember } from "discord.js"
import gaze from "gaze"
import * as Util from "./modules/util"
import * as Commands from "./modules/commands"
import { Command } from "./modules/commands"

const bot = new Discord.Client()
bot.login(process.env.TOKEN)

bot.on("ready", () => {
  console.log("I am ready!")

  run()
})

let skyhold: Guild
let roleCache: Map<string, Role>

function run() {
  skyhold = bot.guilds.cache.first()

  roleCache = Util.collectionToCacheByName(skyhold.roles.cache)
  bot.on("roleUpdate", () => (roleCache = Util.collectionToCacheByName(skyhold.roles.cache)))
  bot.on("roleCreate", () => (roleCache = Util.collectionToCacheByName(skyhold.roles.cache)))
  bot.on("roleDelete", () => (roleCache = Util.collectionToCacheByName(skyhold.roles.cache)))
  applyValarjar()
}

function applyValarjar() {
  skyhold.members.cache.array().forEach((member) => {
    if (!Util.isExcluded(member, roleCache)) {
      member.roles
        .add(roleCache.get("Valarjar").id)
        .then((member) => console.log("Added Valarjar to " + member.user.tag))
        .catch(console.log)
    }
  })
}

let faqMessages: Record<string, Message> = {}

//@ts-ignore
gaze("./faq/*/*", (err, watcher) => {
  watcher.on("changed", (fp: string) => {
    let parseFilepath = /.+faq\/(.+\/)(.+)/.exec(fp)
    let currentDir = parseFilepath[1]
    let currentFile = parseFilepath[2]

    Util.faqset(currentDir, currentFile, faqMessages[currentFile])
  })
})

export function setFaqMessages(obj: Record<string, Message>) {
  faqMessages = obj
}

bot.on("guildMemberAdd", (member: GuildMember) => {
  Util.welcomeNewMember(member)
  member.roles.add(roleCache.get("Valarjar").id).catch(console.log)
})

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
