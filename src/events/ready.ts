import { getGuildCache } from 'discord-bot-shared'
import bot from '../index.js'
import { isExcluded } from '../util.js'

bot.once('ready', () => {
  void applyValarjarToAll()
})

async function applyValarjarToAll() {
  const guildCache = await getGuildCache().catch(console.error)
  if (!guildCache) return
  const { members, roles } = guildCache

  const valarjarRole = roles.find((role) => role.name === 'Valarjar')
  if (!valarjarRole) return

  for (const member of members.values()) {
    if (!isExcluded(member)) {
      const processedMember = await member.roles.add(valarjarRole).catch(console.error)
      if (processedMember) console.log(`Added Valarjar to ${member.user.tag}`)
    }
  }
}
