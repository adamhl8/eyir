const Giveaway = require("./giveaway.js");
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
        readFaqDirs();
    }
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
    }
}