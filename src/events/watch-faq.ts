import { Event, getChannel, throwError } from "discord-bot-shared"
import { ChannelType, Events } from "discord.js"
import { getFaqMessages, getFaqSettings } from "../faq/faq-db.js"
import { faqDirectory } from "../faq/initialize-faq.js"
import watchForFaqChanges from "../faq/watcher.js"
import { getFirstGuild } from "../util.js"

const watchFaq: Event = {
  event: Events.ClientReady,
  async handler(client) {
    const guild = await getFirstGuild(client)
    const faqSettings = await getFaqSettings(guild.id)
    if (!faqSettings)
      throwError(`Unable to start watching for FAQ changes. Failed to find existing settings for guild: ${guild.name}`)

    const [faqChannel, faqLogChannel] = await Promise.all([
      getChannel(guild, faqSettings.faqChannelId, ChannelType.GuildText),
      getChannel(guild, faqSettings.faqLogChannelId, ChannelType.GuildText),
    ])
    const faqMessages = await getFaqMessages(faqChannel)
    await watchForFaqChanges(faqDirectory, faqChannel, faqLogChannel, faqMessages)
  },
}

export default watchFaq
