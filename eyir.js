require('dotenv').config({path: process.argv[2]});

const Discord = require("discord.js");
const Giveaway = require("./modules/giveaway.js");
const RoleCache = require("./modules/roleCache.js");
const Util = require("./modules/util.js");

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

  let prefix = "!";

  if ((msg.content.includes("eyir") || msg.content.includes("Eyir")) && msg.content.includes("sucks")) {
    msg.channel.send("fuk u " + "<@" + msg.author.id + ">");
  }

  if (!msg.content.startsWith(prefix)) return;
  if (msg.author.bot) return;

  msg.guild
  .fetchMember(msg.author)
  .then(member => {
    if (!member.roles.has()) {
      console.log(member.displayName + " tried to run command: " + msg.content);
      return
    }

    if (msg.content.startsWith(prefix + "pgiveaway")) {
      giveaway.draw(msg);
    }

    if (msg.content.startsWith(prefix + "listbots")) {

      return skyhold
      .fetchMembers()
      .then(g => g.members.array())
      .then(members => members.filter(member => member.user.bot))
      .then(bots => {
        let messages = bots.map(bot => {
          msg.channel.send("<@" + bot.user.id + ">")
        })
        return Promise.all(messages);
      });
    }
  })
  .catch(console.error);
});

