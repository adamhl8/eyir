"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.collectionToCacheByName = exports.isExcluded = exports.isMod = exports.faqset = exports.sass = exports.welcomeNewMember = void 0;
const fs_1 = __importDefault(require("fs"));
const excludedRoles_1 = require("./excludedRoles");
const ObjectCache_1 = __importDefault(require("./ObjectCache"));
function welcomeNewMember(member) {
    const welcomeMessage = member.displayName +
        ", welcome to **Skyhold**! Please go over the server rules in #welcome. Before asking a question, go over all of the available guides and resources in #guides-resources-faq; many frequently asked questions are answered there. Remember to check the Pinned Messages in each text channel for additional information. You can do so by clicking the Pin icon at the top right of your Discord window: <http://i.imgur.com/TuYQkjJ.png>. If you're unable to find an answer to your question or if you need clarification on something, please ask! That's what we're here for. :smile: We hope you enjoy your time in Skyhold!";
    member
        .createDM()
        .then((channel) => {
        channel
            .send(welcomeMessage)
            .then(() => console.log("Sent welcome message to " + member.user.tag))
            .catch(console.error);
    })
        .catch(console.error);
}
exports.welcomeNewMember = welcomeNewMember;
function sass(msg) {
    respondToWords(["eyir", "sucks"], "fuk u " + "<@" + msg.author.id + ">");
    respondToWords(["eyir", "rocks"], "thank u " + "<@" + msg.author.id + ">");
    function respondToWords(words, response) {
        let shouldSend = false;
        for (const word of words) {
            if (msg.content.toLowerCase().includes(word)) {
                shouldSend = true;
            }
            else {
                shouldSend = false;
                break;
            }
        }
        if (shouldSend)
            msg.channel.send(response);
    }
}
exports.sass = sass;
function faqset(dir, file, msg) {
    fs_1.default.readFile("./faq/" + dir + file, "utf8", (err, data) => {
        msg.edit(data);
    });
}
exports.faqset = faqset;
function isMod(member, roleCache) {
    const roles = member.roles.cache;
    return roles.has(roleCache.getOrThrow("Val'kyr (Mod)").id);
}
exports.isMod = isMod;
function isExcluded(member, roleCache) {
    let isExcluded = false;
    const roles = member.roles.cache;
    for (const role of excludedRoles_1.excludedRoles) {
        if (roles.has(roleCache.getOrThrow(role).id)) {
            isExcluded = true;
            break;
        }
    }
    return isExcluded;
}
exports.isExcluded = isExcluded;
function collectionToCacheByName(collection) {
    const entries = collection.entries();
    const byName = Array.from(entries).map(([, item]) => [item.name, item]);
    return new ObjectCache_1.default(byName);
}
exports.collectionToCacheByName = collectionToCacheByName;
//# sourceMappingURL=util.js.map