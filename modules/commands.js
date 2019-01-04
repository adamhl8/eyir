const Giveaway = require("./giveaway.js");

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
        .catch(console.error)
    }
}