import chokidar, { FSWatcher } from "chokidar"
import { throwError } from "discord-bot-shared"
import { TextChannel } from "discord.js"
import fsp from "node:fs/promises"
import { FaqMessages } from "./initialize-faq.js"

let watcher: FSWatcher | null = null

async function watchForFaqChanges(
  faqDirectory: string,
  faqChannel: TextChannel,
  faqLogChannel: TextChannel,
  faqMessages: FaqMessages,
) {
  if (watcher) {
    await watcher.close()
  }

  watcher = chokidar.watch(`${faqDirectory}*/*`, { ignoreInitial: true })

  watcher
    .on("ready", () => {
      console.log("Watching for FAQ changes.")
    })
    .on("change", (path) => {
      void (async () => {
        try {
          await updateFaqMessage(path, faqChannel, faqMessages)
        } catch (error) {
          const message =
            error instanceof Error ? error.message : `An unknown error occurred while updating FAQ message at: ${path}`
          await logFaqMessageUpdate(faqLogChannel, message)
        }
      })()
    })
    .on("add", (path) => {
      const file = getFilenameFromPath(path)
      const message = `Detected new file: \`${file}\`\n${faqChannel.toString()} has not been initialized with that file. Please have a moderator run \`/faq-refresh\`.`
      void logFaqMessageUpdate(faqLogChannel, message)
    })
    .on("unlink", (path) => {
      const file = getFilenameFromPath(path)
      const message = `Detected deletion of file: \`${file}\`\nPlease have a moderator run \`/faq-refresh\` to update ${faqChannel.toString()}.`
      void logFaqMessageUpdate(faqLogChannel, message)
    })
}

async function updateFaqMessage(path: string, faqChannel: TextChannel, faqMessages: FaqMessages) {
  const file = path.split("/").pop() ?? throwError(`Failed to get file name from path: ${path}`)
  const data = await fsp.readFile(path, { encoding: "utf8" })

  if (data.length >= 2000)
    throwError(
      `Changes detected in \`${file}\`, but unable to update ${faqChannel.toString()}. \`${file}\` is over 2000 characters.`,
    )

  if (!faqMessages[file])
    throwError(
      `Changes detected in \`${file}\`, but ${faqChannel.toString()} has not been initialized with that file. Please have a moderator run \`/faq-refresh\`.`,
    )

  await faqMessages[file]?.edit(data)
}

async function logFaqMessageUpdate(faqLogChannel: TextChannel, message: string) {
  await faqLogChannel.send(message).catch(console.error)
}

function getFilenameFromPath(path: string) {
  return path.split("/").pop() ?? `Failed to get file name from path: ${path}`
}

export default watchForFaqChanges
