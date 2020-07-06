"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.faqinit = exports.listbots = void 0;
const discord_js_1 = __importDefault(require("discord.js"));
const fs_1 = __importDefault(require("fs"));
const Util = __importStar(require("./util"));
const Main = __importStar(require("../eyir"));
exports.listbots = {
    reqMod: true,
    run: (msg) => {
        msg.guild.members.cache
            .array()
            .filter((member) => member.user.bot)
            .forEach((bot) => {
            msg.channel.send("<@" + bot.user.id + ">").catch(console.log);
        });
    },
};
let faqMessages = {};
let faqDirOrder = ["resources", "faq", "arms", "fury", "protection"];
let faqSectionOrder = [];
let initMessage;
exports.faqinit = {
    reqMod: true,
    run: (msg) => {
        initMessage = msg;
        handleOrder = faqDirOrder;
        sendHeader();
    },
};
let header = new discord_js_1.default.MessageEmbed();
let headerMessage;
function sendHeader() {
    header.setTitle("Click a link below to jump to that section of this channel.");
    header.setColor("#fcc200");
    initMessage.channel
        .send(header)
        .then((msg) => {
        headerMessage = msg;
        readFaqDirs();
    })
        .catch(console.error);
}
let handleOrder;
function readFaqDirs() {
    if (handleOrder.length > 0) {
        let currentDir = handleOrder[0];
        fs_1.default.readdir("./faq/" + currentDir, (err, files) => {
            files.forEach((file) => {
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
            initMessage.channel
                .send({
                files: [
                    {
                        attachment: "./faq/" + currentDir + currentSection,
                        name: currentSection,
                    },
                ],
            })
                .then((msg) => {
                faqMessages[currentSection] = msg;
                faqSectionOrder.shift();
                sendSections();
            })
                .catch(console.error);
        }
        else {
            initMessage.channel
                .send(currentSection)
                .then((msg) => {
                faqMessages[currentSection] = msg;
                Util.faqset(currentDir, currentSection, faqMessages[currentSection]);
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
    header.setDescription("[Resources](https://discordapp.com/channels/148872210742771712/268491842637660160/" +
        faqMessages["resources.png"].id +
        ")\n\
    [FAQ](https://discordapp.com/channels/148872210742771712/268491842637660160/" +
        faqMessages["faq.png"].id +
        ")\n\
    [Arms](https://discordapp.com/channels/148872210742771712/268491842637660160/" +
        faqMessages["arms.png"].id +
        ")\n\
    [Fury](https://discordapp.com/channels/148872210742771712/268491842637660160/" +
        faqMessages["fury.png"].id +
        ")\n\
    [Protection](https://discordapp.com/channels/148872210742771712/268491842637660160/" +
        faqMessages["protection.png"].id +
        ")");
    headerMessage.edit(header);
}
//# sourceMappingURL=commands.js.map