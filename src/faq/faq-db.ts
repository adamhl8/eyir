import { FaqMessage, FaqSettings } from "@prisma/client"
import { TextChannel } from "discord.js"
import prisma from "../db.js"
import { FaqMessages } from "./initialize-faq.js"

async function getFaqSettings(guildId: string) {
  return await prisma.faqSettings.findUnique({
    where: {
      guildId,
    },
    include: {
      faqMessages: true,
    },
  })
}

async function saveFaqSettings(faqSettings: FaqSettings) {
  await prisma.faqSettings.upsert({
    where: {
      guildId: faqSettings.guildId,
    },
    update: {
      ...faqSettings,
    },
    create: {
      ...faqSettings,
    },
  })
}

async function getFaqMessages(faqChannel: TextChannel) {
  const faqMessagesData = await prisma.faqMessage.findMany({
    where: {
      faqChannelId: faqChannel.id,
    },
  })

  const faqMessages: FaqMessages = {}
  for (const faqMessage of faqMessagesData) {
    const message = await faqChannel.messages.fetch(faqMessage.id)
    faqMessages[faqMessage.fileName] = message
  }

  return faqMessages
}

async function saveFaqMessages(faqMessages: FaqMessages, faqChannelId: string) {
  const faqMessagesData: FaqMessage[] = []
  for (const [fileName, message] of Object.entries(faqMessages)) {
    faqMessagesData.push({ fileName, id: message.id, faqChannelId })
  }

  await prisma.faqMessage.deleteMany({ where: { faqChannelId } })

  await Promise.all(
    faqMessagesData.map(async (faqMessage) => {
      await prisma.faqMessage.create({
        data: faqMessage,
      })
    }),
  )
}

export { getFaqMessages, getFaqSettings, saveFaqMessages, saveFaqSettings }
