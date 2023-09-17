import { Event } from "discord-bot-shared"
import { Events } from "discord.js"
import { getRoleByName } from "../util.js"

const memberJoin: Event = {
  event: Events.GuildMemberAdd,
  async handler(_, member) {
    const guild = await member.guild.fetch()
    const valarjarRole = await getRoleByName(guild, "Valarjar")

    await member.roles.add(valarjarRole)

    const welcomeMessage =
      member.displayName +
      ", welcome to **Skyhold**! Please go over the server rules in #welcome. Before asking a question, go over all of the available guides and resources in #guides-resources-faq; many frequently asked questions are answered there. Remember to check the Pinned Messages in each text channel for additional information. If you're unable to find an answer to your question or if you need clarification on something, please ask! That's what we're here for. :smile: We hope you enjoy your time in Skyhold!"
    const DMChannel = await member.createDM()
    await DMChannel.send(welcomeMessage)
  },
}

export default memberJoin
