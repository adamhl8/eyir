import { GuildMember } from "discord.js"

const moderatorRole = "Val'kyr (Mod)"

// Members that have any of these roles will not have Valarjar applied to them.
const excludedRoles = new Set([moderatorRole, "Theorycrafter", "Bot", "Valarjar"])

function isExcluded(member: GuildMember) {
  return member.roles.cache.some((role) => excludedRoles.has(role.name))
}

export { moderatorRole, isExcluded }
