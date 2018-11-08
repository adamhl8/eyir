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

let entries = {
  "zeeklunke": [1, "220955360587022336"],
  "kleptik": [2, "114210824528068611"],
  "bastu": [2, "176049779795558401"],
  "erttu": [2, "203903165987422208"],
  "apple pai": [3, "166565045914959872"],
  "nimchip": [3, "131897531251556352"],
  "loothore": [3, "300793374447763456"],
  "slinky": [3, "202961834360176641"],
  "burrito boi": [5, "133091064507531264"],
  "lexpatrona": [5, "247107919064203265"],
  "talgryf": [5, "269145186032943104"],
  "demon": [5, "221111180125667330"],
  "brakthir": [5, "119637578050699264"],
  "zeroblade": [5, "195605929637445633"],
  "exid": [5, "140487553970208768"],
  "phem0r": [5, "239543641197117441"]
};

bot.on("message", msg => {

  let prefix = "!";

  if (!msg.content.startsWith(prefix)) return;
  if (msg.author.bot) return;

  msg.guild
  .fetchMember(msg.author)
  .then(member => {
    if (!member.roles.has("257983573498265600")) {
      console.log(member.displayName + " tried to run command: " + msg.content);
      return
    }

    if (msg.content.startsWith(prefix + "pgiveaway")) {

      let giveawayString = msg.content.match(/!pgiveaway \d+/g);

      if (giveawayString) {

        let numWinners = giveawayString[0].match(/\d+/g);

        if (numWinners >= Object.keys(entries).length) {
          msg.channel.send("Number of winners exceeds total number of eliglble entrants.")
          return
        }

        let pool = [];

        for (var key in entries) {

          if (entries.hasOwnProperty(key)) {
        
            for (var i = 0; i < entries[key][0]; i++) {
              pool.push(key);
            }
          }
        }

        let winners = [];

        for (var i = 0; i < numWinners; i++) {

          let winner = pool[getRandomInt(0, pool.length)];

          while (winners.includes(winner)) {

            winner = pool[getRandomInt(0, pool.length)];
          }

          winners.push(winner);
        }
        
        msg.channel.send("Drawing in...")

        let countdown = 5

        let interval = setInterval(() => {
         
          if (countdown > 0) {
            msg.channel.send(countdown);
          }
          
          countdown--;

          if (countdown < 0) {

            clearInterval(interval);

            msg.channel.send("Congrats to...")

            winners.forEach(winner => {

              let winnerID = entries[winner][1];
    
              msg.channel.send("<@" + winnerID + ">");
            });

            msg.channel.send("🎉     🎊     🎉     🎊     🎉     🎊")
          }
        }, 2000);
      }

      else {
        msg.channel.send("Reenter command with the number of winners. '!pgiveaway 5'")
      }
    }

    if (msg.content.startsWith(prefix + "listbots")) {

      return guild
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

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}