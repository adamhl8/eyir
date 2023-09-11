import { Event } from "discord-bot-shared"
import { Events, GuildMember } from "discord.js"
import { getFirstGuild, getRoleByName, moderatorRole } from "../util.js"

// Members that have any of these roles will not have Valarjar applied to them.
const excludedRoles = new Set([moderatorRole, "Theorycrafter", "Bot", "Valarjar"])

function isExcluded(member: GuildMember) {
  return member.roles.cache.some((role) => excludedRoles.has(role.name))
}

const applyValarjar: Event = {
  event: Events.ClientReady,
  async handler(client) {
    const guild = await getFirstGuild(client)
    const valarjarRole = await getRoleByName(guild, "Valarjar")

    const members = await guild.members.fetch()
    for (const member of members.values()) {
      if (!isExcluded(member)) {
        await member.roles.add(valarjarRole)
        console.log(`Added Valarjar to ${member.user.tag}`)
      }
    }
  },
}

export default applyValarjar
