const Giveaway = require("./giveaway.js");
const Discord = require("discord.js");
const Util = require("./util.js");
const Main = require("../eyir");
const fs = require("fs");

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

let faqMessages = {};
let faqDirOrder = ["resources", "faq", "arms", "fury", "protection"];
let faqSectionOrder = [];
let initMessage = null;

exports.faqinit = {
    reqMod: true,

    run: msg => {

        initMessage = msg;
        handleOrder = faqDirOrder;
        sendHeader();
    }
}

let header = new Discord.RichEmbed();
let headerMessage = null;

function sendHeader() {

    header.setTitle("Click a link below to jump to that section of this channel.")
    initMessage.channel.send(header)
    .then(msg => {
        headerMessage = msg;
    })
    .catch(console.error);
    readFaqDirs();
}

let handleOrder = null;

function readFaqDirs() {

    if (handleOrder.length > 0) {

        let currentDir = handleOrder[0];

        fs.readdir("./faq/" + currentDir, (err, files) => {
            
            files.forEach(file => {
                faqMessages[file] = null;
            });

            handleOrder.shift();
            readFaqDirs();
        });
    }

    else {
        faqSectionOrder = Object.keys(faqMessages);
        sendSections();
    }
}

function sendSections() {
    
    if (faqSectionOrder.length > 0) {

        let currentSection = faqSectionOrder[0];
        let currentDir = currentSection.match(/[a-zA-Z]+/) + "/";

        if (currentSection.endsWith(".png")) {

            initMessage.channel.send({
                files: [ {
                    attachment: "./faq/" + currentDir + currentSection,
                    name: currentSection
                }]
            })
            .then(msg => {
                faqMessages[currentSection] = msg;
                faqSectionOrder.shift();
                sendSections();
            })
            .catch(console.error);
        }

        else {

            initMessage.channel.send(currentSection)
            .then(msg => {
                faqMessages[currentSection] = msg;
                Util.faqset(currentDir, currentSection, faqMessages[currentSection])
                faqSectionOrder.shift();
                sendSections();
            })
            .catch(console.error);
        }
    }

    else {
        Main.setFaqMessages(faqMessages);
        editHeader();
    }
}

function editHeader() {

    console.log(faqMessages);
    header.setDescription
    ("[Resources](https://discordapp.com/channels/148872210742771712/268491842637660160/" + faqMessages["resources.png"].id + ")\n\
    [FAQ](https://discordapp.com/channels/148872210742771712/268491842637660160/" + faqMessages["faq.png"].id  + ")\n\
    [Arms](https://discordapp.com/channels/148872210742771712/268491842637660160/" + faqMessages["arms.png"].id  + ")\n\
    [Fury](https://discordapp.com/channels/148872210742771712/268491842637660160/" + faqMessages["fury.png"].id  + ")\n\
    [Protection](https://discordapp.com/channels/148872210742771712/268491842637660160/" + faqMessages["protection.png"].id  + ")");
    headerMessage.edit(header);
}