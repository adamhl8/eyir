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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
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
const ObjectCache_1 = __importDefault(require("./modules/ObjectCache"));
const bot = new discord_js_1.default.Client();
bot.login(process.env.TOKEN);
bot.on("ready", () => {
    console.log("I am ready!");
    run();
});
let roleCache = new ObjectCache_1.default();
function run() {
    const skyhold = bot.guilds.cache.first();
    if (!skyhold) {
        throw Error("failed to init guild");
    }
    roleCache = Util.collectionToCacheByName(skyhold.roles.cache);
    bot.on("roleUpdate", () => (roleCache = Util.collectionToCacheByName(skyhold.roles.cache)));
    bot.on("roleCreate", () => (roleCache = Util.collectionToCacheByName(skyhold.roles.cache)));
    bot.on("roleDelete", () => (roleCache = Util.collectionToCacheByName(skyhold.roles.cache)));
    applyValarjar(skyhold);
}
function applyValarjar(guild) {
    guild.members.cache.array().forEach((member) => {
        if (!Util.isExcluded(member, roleCache)) {
            member.roles
                .add(roleCache.getOrThrow("Valarjar").id)
                .then((member) => console.log("Added Valarjar to " + member.user.tag))
                .catch(console.log);
        }
    });
}
let faqMessages = {};
//@ts-ignore
gaze_1.default("./faq/*/*", (err, watcher) => {
    watcher.on("changed", (fp) => {
        const parseFilepath = /.+faq\/(.+\/)(.+)/.exec(fp);
        if (!parseFilepath) {
            throw Error(`failed to parse file path: ${fp}`);
        }
        const currentDir = parseFilepath[1];
        const currentFile = parseFilepath[2];
        Util.faqset(currentDir, currentFile, faqMessages[currentFile]);
    });
});
function setFaqMessages(obj) {
    faqMessages = obj;
}
exports.setFaqMessages = setFaqMessages;
bot.on("guildMemberAdd", (member) => __awaiter(void 0, void 0, void 0, function* () {
    if (isPartial(member)) {
        // PartialGuildMember
        try {
            const m = yield member.fetch();
            Util.welcomeNewMember(m);
        }
        catch (e) {
            console.log("failed to fecth partial member on guildMemberAdd");
        }
    }
    else {
        // GuildMember
        Util.welcomeNewMember(member);
    }
    member.roles.add(roleCache.getOrThrow("Valarjar").id).catch(console.log);
}));
function isPartial(member) {
    return member.partial;
}
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
    if (!msg.member) {
        throw Error(`there is no member attached to message ${msg.id}`);
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