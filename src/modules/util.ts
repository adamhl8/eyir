import fs from 'fs'
import {Role, GuildMember, DMChannel, Message} from 'discord.js'
import {excludedRoles} from './excluded-roles.js'
import ObjectCache from './object-cache.js'

// Set up global error handlers
process.on('unhandledRejection', (error) => {
	console.log('unhandledRejection:', error)
})

export function welcomeNewMember(member: GuildMember) {
	const welcomeMessage =
		member.displayName +
		", welcome to **Skyhold**! Please go over the server rules in #welcome. Before asking a question, go over all of the available guides and resources in #guides-resources-faq; many frequently asked questions are answered there. Remember to check the Pinned Messages in each text channel for additional information. You can do so by clicking the Pin icon at the top right of your Discord window: <http://i.imgur.com/TuYQkjJ.png>. If you're unable to find an answer to your question or if you need clarification on something, please ask! That's what we're here for. :smile: We hope you enjoy your time in Skyhold!"

	member
		.createDM()
		.then((channel: DMChannel) => {
			channel
				.send(welcomeMessage)
				.then(() => {
					console.log('Sent welcome message to ' + member.user.tag)
				})
				.catch(console.error)
		})
		.catch(console.error)
}

export async function sass(message: Message) {
	await respondToWords(['eyir', 'sucks'], `fuk u <@${message.author.id}>`)
	await respondToWords(['eyir', 'rocks'], `thank u <@${message.author.id}>`)
	await respondToWords(['eyir', 'socks'], '🧦')
	await respondToWords(['eyir', 'cocks'], '<:yep:703420923625078804>')

	async function respondToWords(words: string[], response: string) {
		let shouldSend = false

		for (const word of words) {
			if (message.content.toLowerCase().includes(word)) {
				shouldSend = true
			} else {
				shouldSend = false
				break
			}
		}

		if (shouldSend) await message.channel.send(response)
	}
}

export function faqset(dir: string, file: string, message: Message) {
	fs.readFile('./faq/' + dir + file, 'utf8', async (error, data: string) => {
		await message.edit(data)
	})
}

export function isMod(member: GuildMember, roleCache: ObjectCache<Role>) {
	const roles = member.roles.cache
	return roles.has(roleCache.getOrThrow("Val'kyr (Mod)").id)
}

export function isExcluded(member: GuildMember, roleCache: ObjectCache<Role>) {
	let isExcluded = false
	const roles = member.roles.cache
	for (const role of excludedRoles) {
		if (roles.has(roleCache.getOrThrow(role).id)) {
			isExcluded = true
			break
		}
	}

	return isExcluded
}
