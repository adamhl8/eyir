import { GuildMember, Message } from 'discord.js'
import fs from 'node:fs'

const moderatorRole = "Val'kyr (Mod)"

export function faqset(directory: string, file: string, message: Message): void {
  fs.readFile('./faq/' + directory + file, 'utf8', (error, data: string) => {
    void message.edit(data)
  })
}

// Members that have any of these roles will not have Valarjar applied to them.
const excludedRoles = new Set([moderatorRole, 'Theorycrafter', 'Bot', 'Valarjar'])

function isExcluded(member: GuildMember) {
  return member.roles.cache.some((role) => excludedRoles.has(role.name))
}

export { moderatorRole, isExcluded }
