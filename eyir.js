require('dotenv').config({path: process.argv[2]});

process.setMaxListeners(20);

const Discord = require("discord.js");
const ObjectCache = require("./ObjectCache.js");

const bot = new Discord.Client();
bot.login(process.env.TOKEN);

bot.on('ready', () => {
  console.log('I am ready!');

  run();
});

let roleCache = null;

let guild = null;

function run() {

  guild = bot.guilds.first();

  guild.fetchMembers()
    .then(g => {
      roleCache = new ObjectCache(g.roles);
    });

    applyVrykul();
}

function applyVrykul() {

  guild.fetchMembers()
      .then(g => g.members.array())
      .then(members => {
        members.forEach(member => {

          if (shouldApplyVrykul(member.roles)) {
            addRole(member, "Vrykul");
          }
        })
      })
      .catch(console.error);
}

function shouldApplyVrykul(memberRoles) {

  for (var i = 0; i < excludedRoles.length; i++) {
    if (memberRoles.findKey('id', excludedRoles[i]) == excludedRoles[i]) {
      return false;
    }
  }

  return true;
}

let excludedRoles = [
  "201785195441946624", // Odyn
  "148893703207911433", // Val'kyr (non-mod)
  "197179529360310272", // Theorycrafter
  "225683487162630145", // Stormforged
  "448628418603515904", // Patreon Bot
  "475726900019331092", // Bots
  "397114195608469514", // GiveawayBot
  "269363541570617345", // Vrykul
];

bot.on("guildMemberAdd", member => {
  newMemberMessage(member);
  addRole(member, "Vrykul");
});

function newMemberMessage(member) {
  
  const welcomeMessage = member.displayName + ", welcome to **Skyhold**! Please go over the server rules in #welcome. Before asking a question, go over all of the available guides and resources in #guides-resources-faq; many frequently asked questions are answered there. Remember to check the Pinned Messages in each text channel for additional information. You can do so by clicking the Pin icon at the top right of your Discord window: <http://i.imgur.com/TuYQkjJ.png>. If you're unable to find an answer to your question or if you need clarification on something, please ask! That's what we're here for. :smile: We hope you enjoy your time in Skyhold!"

  member.createDM()
    .then(channel => {
      channel.send(welcomeMessage)
        .catch(console.error);
      console.log("Sent welcome message to " + member.displayName)
    });
  
}

function addRole(member, roleName) {

  const role = roleCache.getByName(roleName);
  member.addRole(role[0])
    .catch(console.error);
  console.log("Added " + role[0].name + " to " + member.displayName)
}

bot.on("message", msg => {

  let prefix = "!";

  if(!msg.content.startsWith(prefix)) return;
  if(msg.author.bot) return;

  if (msg.content.startsWith(prefix + "listbots")) {

    let bots = [];

    guild.fetchMembers()
    .then(g => g.members.array())
    .then(members => {
      members.forEach(member => {

        if (member.user.bot) {
          bots.push(member);
        }
      })
    })
    .catch(console.error);

    bots.forEach(bot => {
      msg.channel.send("<@" + bot.user.id + ">");
    });
  }
});

function listBots() {

}