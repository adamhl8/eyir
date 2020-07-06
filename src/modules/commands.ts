import Discord, { Message, Collection, GuildMember } from "discord.js";
import fs from "fs";
import * as Giveaway from "./giveaway";
import * as Util from "./util";
import * as Main from "../eyir";

interface Command {
    reqMod: boolean
    run: (msg: Message) => void
}

const pgiveaway: Command = {
    reqMod: true,
    
    run: (msg: Message) => {
        Giveaway.draw(msg);
    }
}

const listbots: Command = {
    reqMod: true,

    run: (msg: Message) => {

        msg.guild.members.cache
            .array()
            .filter(member => member.user.bot)
            .forEach(bot => {
                msg.channel.send("<@" + bot.user.id + ">")
                    .catch(console.log)
            })
    }
}

let faqMessages = {};
let faqDirOrder = ["resources", "faq", "arms", "fury", "protection"];
let faqSectionOrder: Array<string> = [];
let initMessage: Message;

export const faqinit = {
    reqMod: true,

    run: msg => {

        initMessage = msg;
        handleOrder = faqDirOrder;
        sendHeader();
    }
}

let header = new Discord.MessageEmbed();
let headerMessage = null;

function sendHeader() {

    header.setTitle("Click a link below to jump to that section of this channel.");
    header.setColor("#fcc200");
    initMessage.channel.send(header)
    .then(msg => {
        headerMessage = msg;
        readFaqDirs();
    })
    .catch(console.error);
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
        initMessage.channel.send(header).catch(console.error);
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