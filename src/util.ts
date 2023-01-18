import { Guild, throwError } from "discord-bot-shared"
import { GuildMember } from "discord.js"
import { getGuildCollection } from "./index.js"

function getGuild(guildId: string): Guild {
  const GuildCollection = getGuildCollection()
  return GuildCollection.get(guildId) || throwError("Unable to get guild.")
}

const moderatorRole = "Val'kyr (Mod)"

// Members that have any of these roles will not have Valarjar applied to them.
const excludedRoles = new Set([moderatorRole, "Theorycrafter", "Bot", "Valarjar"])

function isExcluded(member: GuildMember) {
  return member.roles.cache.some((role) => excludedRoles.has(role.name))
}

export { getGuild, moderatorRole, isExcluded }
