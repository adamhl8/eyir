require('dotenv').config({path: process.argv[2]});

const Discord = require("discord.js");
const RoleCache = require("./modules/roleCache.js");
const Util = require("./modules/util.js");
const Commands = require("./modules/commands.js");

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

  if (skyhold.available) {
    roleCache = RoleCache.build(skyhold.roles)
    applyVrykul();
  } 
}

function applyVrykul() {

  skyhold.fetchMembers()
      .then(g => g.members.array())
      .then(members => {
        members.forEach(member => {

          memberRoleCache = RoleCache.build(member.roles);
          let shouldApply = true;
          for (var role in memberRoleCache) {
            if (role.excluded) {
              shouldApply = false;
              break;
            }
          }

          if (shouldApply) {
            member.addRole(roleCache["Vrykul"].role);
          }
        })
      })
      .catch(console.error);
}

bot.on("guildMemberAdd", member => {
  Util.welcomeNewMember(member);
  member.addRole(roleCache["Vrykul"].role);
});

bot.on("message", msg => {

  Util.sass(msg);

  let prefix = "!";

  if (!msg.content.startsWith(prefix)) return;
  if (msg.author.bot) return;

  let match = /!(\S+)/g.exec(msg.content);
  let command = match[1];

  if (Commands.hasOwnProperty(command)) {

    let isMod = false;
    msg.guild
    .fetchMember(msg.author)
    .then(member => {

      if (member.roles.find(role => {
        role.id === roleCache["Val'kyr"].role.id
      })) {
        isMod = true;
      }
    })
    .catch(console.error)

    console.log(Commands[command]);

    if (Commands[command].reqMod && isMod) {
      Commands[command].run();
    }
    else if (!Commands[command].reqMod) {
      Commands[command].run();
    }
    else {
      console.log(msg.author.tag + " tried to run command: " + msg.content);
    }
  }
});