import { getGuildCache } from 'discord-bot-shared'
import { GuildMember } from 'discord.js'
import bot from '../index.js'

bot.on('guildMemberAdd', (member: GuildMember) => {
  void welcomeNewMember(member)
  void applyValarjar(member)
})

async function applyValarjar(member: GuildMember) {
  const guildCache = await getGuildCache().catch(console.error)
  if (!guildCache) return
  const { roles } = guildCache

  const valarjarRole = roles.find((role) => role.name === 'Valarjar')
  if (!valarjarRole) return

  await member.roles.add(valarjarRole).catch(console.error)
}

async function welcomeNewMember(member: GuildMember) {
  const welcomeMessage =
    member.displayName +
    ", welcome to **Skyhold**! Please go over the server rules in #welcome. Before asking a question, go over all of the available guides and resources in #guides-resources-faq; many frequently asked questions are answered there. Remember to check the Pinned Messages in each text channel for additional information. You can do so by clicking the Pin icon at the top right of your Discord window: <http://i.imgur.com/TuYQkjJ.png>. If you're unable to find an answer to your question or if you need clarification on something, please ask! That's what we're here for. :smile: We hope you enjoy your time in Skyhold!"

  const DMChannel = await member.createDM().catch(console.error)
  if (!DMChannel) return
  await DMChannel.send(welcomeMessage).catch(console.error)
}
