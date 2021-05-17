import dotenv from 'dotenv'
import Discord, {Guild, Role, Message, GuildMember, PartialGuildMember} from 'discord.js'
import gaze from 'gaze'
import * as Util from './modules/util.js'
import * as Commands from './modules/commands.js'
import ObjectCache from './modules/object-cache.js'

dotenv.config({path: process.argv[2]})

const bot = new Discord.Client()
await bot.login(process.env.TOKEN)

bot.on('ready', () => {
	console.log('I am ready!')

	run()
})

let roleCache = ObjectCache.empty<Role>()

function run() {
	const skyhold = bot.guilds.cache.first()
	if (!skyhold) {
		throw new Error('failed to init guild')
	}

	roleCache = ObjectCache.fromCollection(skyhold.roles.cache)
	bot.on('roleUpdate', () => {
		roleCache = ObjectCache.fromCollection(skyhold.roles.cache)
	})
	bot.on('roleCreate', () => {
		roleCache = ObjectCache.fromCollection(skyhold.roles.cache)
	})
	bot.on('roleDelete', () => {
		roleCache = ObjectCache.fromCollection(skyhold.roles.cache)
	})
	applyValarjar(skyhold)
}

function applyValarjar(guild: Guild) {
	for (const member of guild.members.cache.array()) {
		if (!Util.isExcluded(member, roleCache)) {
			member.roles
				.add(roleCache.getOrThrow('Valarjar').id)
				.then((member) => {
					console.log('Added Valarjar to ' + member.user.tag)
				})
				.catch(console.log)
		}
	}
}

let faqMessages: Record<string, Message> = {}

// @ts-expect-error
gaze('./faq/*/*', (error, watcher) => {
	watcher.on('changed', (fp: string) => {
		const parseFilepath = /.+faq\/(.+\/)(.+)/.exec(fp)
		if (!parseFilepath) {
			throw new Error(`failed to parse file path: ${fp}`)
		}

		const currentDir = parseFilepath[1]
		const currentFile = parseFilepath[2]

		Util.faqset(currentDir, currentFile, faqMessages[currentFile])
	})
})

export function setFaqMessages(object: Record<string, Message>) {
	faqMessages = object
}

bot.on('guildMemberAdd', async (member: GuildMember | PartialGuildMember) => {
	if (isPartial(member)) {
		// PartialGuildMember
		try {
			const m = await member.fetch()
			Util.welcomeNewMember(m)
		} catch {
			console.log('failed to fecth partial member on guildMemberAdd')
		}
	} else {
		// GuildMember
		Util.welcomeNewMember(member)
	}

	member.roles.add(roleCache.getOrThrow('Valarjar').id).catch(console.log)
})

function isPartial(member: GuildMember | PartialGuildMember): member is PartialGuildMember {
	return member.partial
}

bot.on('message', async (message: Message) => {
	if (message.author.bot) return

	await Util.sass(message)

	const prefix = '!'

	if (!message.content.startsWith(prefix)) return

	const match = /!(\S+)/g.exec(message.content)
	let command = 'none'
	if (match) {
		command = match[1]
	}

	if (!message.member) {
		throw new Error(`there is no member attached to message ${message.id}`)
	}

	const commands: Record<string, Commands.Command> = Commands

	if (Object.prototype.hasOwnProperty.call(commands, command)) {
		if (commands[command].reqMod && !Util.isMod(message.member, roleCache)) {
			message.channel
				.send('You do not have the required moderator role to run this command.')
				.catch(console.log)
		} else {
			commands[command].run(message)
		}
	}
})
