var Discord = require("discord.js");
var bot = new Discord.Client();

bot.on("message", msg => {
  
  let prefix = "!!!";
  
  if(!msg.content.startsWith(prefix)) return;

  if(msg.author.bot) return;

  if (msg.content.startsWith(prefix + "valarjar")) {
    let guild = msg.guild
        
    let roleID = "269363541570617345"
    
    guild.fetchMembers()
      .then(g => g.members.array())
      .then(members => {
        members.forEach(member => {
          
          if (shouldApplyValarjar(member.roles)) {
            console.log("adding role to ", member.displayName);
            member.addRole(roleID)
              .catch(console.error);
          }
        })
      })
      .catch(console.error);
  }
});

function shouldApplyValarjar(memberRoles) {
  
  for (var i = 0; i < excludedRoles.length; i++) {
    if (memberRoles.findKey('id', excludedRoles[i]) == excludedRoles[i]) {
      return false;
    }
  }
  
  return true;
}

let excludedRoles = [
  "269363541570617345", // Valarjar
  "148893703207911433", // Val'kyr
  "257983573498265600", // Val'kyr
  "197179529360310272", // Theorycrafter
  "201785195441946624", // Odyn
  "257988415704924162" // Odny's Minions
];

bot.on('ready', () => {
  console.log('I am ready!');
});

bot.login("MjY5MDU3NjYyNzQwNzI1NzYw.C1j1_g.wdc6MwjFpI_RQ_o_S8MEUH9Pqoo");