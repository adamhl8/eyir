import { throwError } from "discord-bot-shared"
import { Client, Guild } from "discord.js"

const moderatorRole = "Val'kyr (Mod)"

async function getFirstGuild(client: Client) {
  const guilds = await client.guilds.fetch()
  return (await guilds.first()?.fetch()) ?? throwError("Failed to fetch first guild.")
}

async function getRoleByName(guild: Guild, roleName: string) {
  const roles = await guild.roles.fetch()
  return roles.find((role) => role.name === roleName) ?? throwError(`Failed to find role with name: ${roleName}`)
}

export { getFirstGuild, getRoleByName, moderatorRole }
