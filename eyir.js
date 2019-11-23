require('dotenv').config({path: process.argv[2]});

const Discord = require("discord.js");
const ObjectCache = require("./modules/objectCache.js");
const Util = require("./modules/util.js");
const Commands = require("./modules/commands.js");
const gaze = require("gaze");

const bot = new Discord.Client();
bot.login(process.env.TOKEN);

bot.on('ready', () => {
  
  console.log('I am ready!');

  run();
});

let skyhold = null;
let roleCache = null;

function run() {

  skyhold = bot.guilds.first();
  skyhold.fetchMembers()
  .then(g => {
    roleCache = ObjectCache.build(g.roles)
    applyValarjar(g);
  })
  .catch(console.error)
}

function applyValarjar(g) {

    g.members.array().forEach(member => {

      memberRoleCache = ObjectCache.build(member.roles);

      if (!memberRoleCache.props.excluded) {
        member.addRole(roleCache["Valarjar"]);
        console.log("Added Valarjar to " + member.user.tag);
      }
    })
}

let faqMessages = null;

gaze("./faq/*/*", (err, watcher) => {

  watcher.on("changed", fp => {

    let parseFilepath = /.+faq\/(.+\/)(.+)/.exec(fp);
    let currentDir = parseFilepath[1];
    let currentFile = parseFilepath[2];

    Util.faqset(currentDir, currentFile, faqMessages[currentFile]);
  });
});

exports.setFaqMessages = function(obj) {
  faqMessages = obj;
}

bot.on("guildMemberAdd", member => {
  Util.welcomeNewMember(member);
  member.addRole(roleCache["Valarjar"]);
});

bot.on("message", msg => {

  if (msg.author.bot) return;

  Util.sass(msg);

  let prefix = "!";

  if (!msg.content.startsWith(prefix)) return;

  let match = /!(\S+)/g.exec(msg.content);
  let command = match[1];

  if (Commands.hasOwnProperty(command)) {

    msg.guild
    .fetchMember(msg.author)
    .then(member => {

      let isMod = ObjectCache.build(member.roles).props.isMod

      if ((Commands[command].reqMod && isMod) || !Commands[command].reqMod)  {
        Commands[command].run(msg)
      }
      else {
        msg.channel.send("You do not have the required moderator role to run this command.");
      }
    })
    .catch(console.error)
  }
});