# eyir

Bot for the Warrior Discord Community, [Skyhold](https://discord.gg/Skyhold).

## Installation

1. Install prerequisites. [Yarn](https://classic.yarnpkg.com/lang/en/) is used as the package manager. [pm2](https://github.com/Unitech/pm2) is used to handle running the Node process.

```
npm install -g yarn pm2
```

2. Clone the repo.

```
git clone https://github.com/Genshii8/eyir.git
```

3. Install dependencies.

```
yarn install
```

4. Create a [Discord Developer Application](https://discord.com/developers/applications) for your bot.
    - Make sure to turn on Server Members Intent in the Bot menu.

5. Add the bot to your server using this link: `https://discord.com/api/oauth2/authorize?client_id=APP_ID&permissions=8&scope=bot`
    - Replace "APP_ID" in the URL with your bot's Application ID (General Information menu).

6. Create a file named `.env` in the root of the project directory and paste your bot's token (found in the Bot menu) in the file like this:

```
TOKEN=yourtokenhere
```

7. Start the bot.

```
yarn start
```

## Features

Most of the following is hardcoded and not easily configurable. You should be able to pretty easily change what you need to in the source though. I'll make it more configurable eventually (maybe). :)

- Automatically applies the Valarjar role to all server members, both retroactively and to new members. See `applyValarjar()` and the `guildMemberAdd` event in `index.tx`.
    - Members with *any* role from `excluded-roles.ts` will be skipped.
- Sends a welcome message (DM) to new server members. See `welcomeNewMember()` in `util.ts`.
- Responds to pre-defined words with pre-defined responses. See `sass()` in `util.ts`.
- Allows you to set up a channel where the bot will read .txt files and images from a folder and push it to a channel. Primarily used for maintaining a FAQ/resources channel. See the Commands section for more info.

## Commands

- `!listbots` - Prints a list of all the bots in the server.

### faqinit

- `!faqinit`

Needs to be run in a channel named `guides-resources-faq`. Every time the command is run, all previous messages in the channel are deleted.

Looks for a folder called `faq` in the root of the project directory. Loops through each folder in the `faq` directory where each folder will end up being a section of the faq. Folder names and order are defined at `faqDirOrder` in `commands.ts`.

Loops through each file in alphabetical order in each folder. Looks for `.png` or `.txt` files. For every file, a message is pushed to the channel. Intended purpose for images is to add headers to sections. Supports multiple text files so you can split your content out if it's over 2000 characters. e.g. `content.txt`, `content2.txt`.

The bot also creates a header and footer embed that links to each section so they can be easily jumped to. See `editHeader()` in `commands.ts`.

The `faq` folder is monitored for any changes and will automatically edit the appropriate message with the new content when any of the text files are changed. This is so multiple people can easily edit/contribute to the faq by submitting pull requests or pushing to the repo.

It's intended that you automate updating your local installation whenever there is a commit to the repo. That way the bot picks up changes and automatically updates the faq with the new content. For example, I use [CodeShip](https://www.cloudbees.com/products/codeship) to automatically SSH into my server and run `git pull` whenever there is a new commit to the main branch.