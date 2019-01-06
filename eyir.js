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
    applyVrykul(g);
  })
  .catch(console.error)
}

function applyVrykul(g) {
  
    g.members.array().forEach(member => {

      memberRoleCache = ObjectCache.build(member.roles);

      if (!memberRoleCache.props.excluded) {
        member.addRole(roleCache["Vrykul"]);
        console.log("Added Vrykul to " + member.user.tag);
      }
    })
}

let faqMessage = null;

gaze("./modules/faq.txt", (err, watcher) => {
  
  watcher.on("changed", fp => {
    if (faqMessage) {
      Util.faqset(faqMessage);
    }
  });
});

exports.setFaqMessage = function(msg) {
  faqMessage = msg;
}

bot.on("guildMemberAdd", member => {
  Util.welcomeNewMember(member);
  member.addRole(roleCache["Vrykul"]);
});

bot.on("message", msg => {

  Util.sass(msg);

  let prefix = "!";

  if (!msg.content.startsWith(prefix)) return;
  if (msg.author.bot) return;

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