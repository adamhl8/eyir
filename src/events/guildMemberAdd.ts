import { getGuildCache, throwError } from 'discord-bot-shared'
import { GuildMember } from 'discord.js'
import bot from '../index.js'

bot.on('guildMemberAdd', (member: GuildMember) => {
  void welcomeNewMember(member).catch(console.error)
  void applyValarjar(member).catch(console.error)
})

async function applyValarjar(member: GuildMember) {
  const { roles } = (await getGuildCache()) || throwError('Unable to get guild cache.')
  const valarjarRole = roles.find((role) => role.name === 'Valarjar')
  if (!valarjarRole) return
  await member.roles.add(valarjarRole)
}

async function welcomeNewMember(member: GuildMember) {
  const welcomeMessage =
    member.displayName +
    ", welcome to **Skyhold**! Please go over the server rules in #welcome. Before asking a question, go over all of the available guides and resources in #guides-resources-faq; many frequently asked questions are answered there. Remember to check the Pinned Messages in each text channel for additional information. If you're unable to find an answer to your question or if you need clarification on something, please ask! That's what we're here for. :smile: We hope you enjoy your time in Skyhold!"
  const DMChannel = await member.createDM()
  await DMChannel.send(welcomeMessage)
}
