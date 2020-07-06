require('dotenv').config({path: process.argv[2]});

import Discord, { Guild, Role } from "discord.js";
import gaze from "gaze";
import * as Util from "./modules/util";
import * as Commands from "./modules/commands";

const bot = new Discord.Client();
bot.login(process.env.TOKEN);

bot.on('ready', () => {
  
  console.log('I am ready!');

  run();
});

let skyhold: Guild;
let roleCache: Map<string, Role>;

function run() {

  skyhold = bot.guilds.cache.first();
  
  roleCache = Util.collectionToCacheByName(skyhold.roles.cache);
  bot.on('roleUpdate', () => roleCache = Util.collectionToCacheByName(skyhold.roles.cache));
  bot.on('roleCreate', () => roleCache = Util.collectionToCacheByName(skyhold.roles.cache));
  bot.on('roleDelete', () => roleCache = Util.collectionToCacheByName(skyhold.roles.cache));
  applyValarjar();
}

function applyValarjar() {
  
  skyhold.members.cache
    .array()
    .forEach(member => {
      if (!Util.isExcluded(member)) {
        member.roles.add(roleCache.get("Valarjar").id)
          .catch(console.log);
        console.log("Added Valarjar to " + member.user.tag);
    }
  })
}

let faqMessages: Record<string, string>;

//@ts-ignore
gaze("./faq/*/*", (err, watcher) => {

  watcher.on("changed", (fp: string) => {

    let parseFilepath = /.+faq\/(.+\/)(.+)/.exec(fp);
    let currentDir = parseFilepath[1];
    let currentFile = parseFilepath[2];

    Util.faqset(currentDir, currentFile, faqMessages[currentFile]);
  });
});

export function setFaqMessages(obj: Record<string, string>) {
  faqMessages = obj;
}

bot.on("guildMemberAdd", member => {
  Util.welcomeNewMember(member);
  member.roles.add(roleCache.get("Valarjar").id);
});

bot.on("message", msg => {

  if (msg.author.bot) return;

  Util.sass(msg);

  const prefix = "!";

  if (!msg.content.startsWith(prefix)) return;

  let match = /!(\S+)/g.exec(msg.content);
  let command = "none";
  if (match) {
    command = match[1];
  }

  if (Commands.hasOwnProperty(command)) {
    
    if ((Commands[command].reqMod && !Util.isMod(msg.member, roleCache)))  {
      msg.channel.send("You do not have the required moderator role to run this command.");
    } else {
      Commands[command].run(msg)
    }
  }
});