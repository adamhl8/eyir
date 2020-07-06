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
exports.setFaqMessages = void 0;
require("dotenv").config({ path: process.argv[2] });
const discord_js_1 = __importDefault(require("discord.js"));
const gaze_1 = __importDefault(require("gaze"));
const Util = __importStar(require("./modules/util"));
const Commands = __importStar(require("./modules/commands"));
const bot = new discord_js_1.default.Client();
bot.login(process.env.TOKEN);
bot.on("ready", () => {
    console.log("I am ready!");
    run();
});
let skyhold;
let roleCache;
function run() {
    skyhold = bot.guilds.cache.first();
    roleCache = Util.collectionToCacheByName(skyhold.roles.cache);
    bot.on("roleUpdate", () => (roleCache = Util.collectionToCacheByName(skyhold.roles.cache)));
    bot.on("roleCreate", () => (roleCache = Util.collectionToCacheByName(skyhold.roles.cache)));
    bot.on("roleDelete", () => (roleCache = Util.collectionToCacheByName(skyhold.roles.cache)));
    applyValarjar();
}
function applyValarjar() {
    skyhold.members.cache.array().forEach((member) => {
        if (!Util.isExcluded(member, roleCache)) {
            member.roles
                .add(roleCache.get("Valarjar").id)
                .then((member) => console.log("Added Valarjar to " + member.user.tag))
                .catch(console.log);
        }
    });
}
let faqMessages = {};
//@ts-ignore
gaze_1.default("./faq/*/*", (err, watcher) => {
    watcher.on("changed", (fp) => {
        let parseFilepath = /.+faq\/(.+\/)(.+)/.exec(fp);
        let currentDir = parseFilepath[1];
        let currentFile = parseFilepath[2];
        Util.faqset(currentDir, currentFile, faqMessages[currentFile]);
    });
});
function setFaqMessages(obj) {
    faqMessages = obj;
}
exports.setFaqMessages = setFaqMessages;
bot.on("guildMemberAdd", (member) => {
    Util.welcomeNewMember(member);
    member.roles.add(roleCache.get("Valarjar").id).catch(console.log);
});
bot.on("message", (msg) => {
    if (msg.author.bot)
        return;
    Util.sass(msg);
    const prefix = "!";
    if (!msg.content.startsWith(prefix))
        return;
    let match = /!(\S+)/g.exec(msg.content);
    let command = "none";
    if (match) {
        command = match[1];
    }
    const commands = Commands;
    if (commands.hasOwnProperty(command)) {
        if (commands[command].reqMod && !Util.isMod(msg.member, roleCache)) {
            msg.channel
                .send("You do not have the required moderator role to run this command.")
                .catch(console.log);
        }
        else {
            commands[command].run(msg);
        }
    }
});
//# sourceMappingURL=eyir.js.map