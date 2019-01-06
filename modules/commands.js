const Giveaway = require("./giveaway.js");
const Util = require("./util.js");
const Main = require("../eyir");

exports.pgiveaway = {
    reqMod: true,
    
    run: msg => {
        Giveaway.draw(msg);
    }
}

exports.listbots = {
    reqMod: true,

    run: msg => {

        msg.guild
        .fetchMembers()
        .then(g => g.members.array())
        .then(members => members.filter(member => member.user.bot))
        .then(bots => {
            bots.forEach(bot => {
                msg.channel.send("<@" + bot.user.id + ">")
            })
        })
        .catch(console.error);
    }
}

exports.faqinit = {
    reqMod: true,

    run: msg => {
        return msg.channel.send("init")
        .then(message => {
            Main.setFaqMessage(message);
            Util.faqset(message);
        })
        .catch(console.error);
    }
}