import { getGuildCache, throwError } from "discord-bot-shared"
import bot from "index.js"
import { isExcluded } from "util.js"

bot.once("ready", () => {
  void applyValarjarToAll().catch(console.error)
})

async function applyValarjarToAll() {
  const { members, roles } = (await getGuildCache()) || throwError("Unable to get guild cache.")
  const valarjarRole = roles.find((role) => role.name === "Valarjar")
  if (!valarjarRole) return

  for (const member of members.values()) {
    if (!isExcluded(member)) {
      await member.roles.add(valarjarRole)
      console.log(`Added Valarjar to ${member.user.tag}`)
    }
  }
}
