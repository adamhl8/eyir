# eyir

A Discord bot for the Warrior Discord Community, [Skyhold](https://discord.gg/Skyhold).

## Installation

```
docker run -d \
  --name=eyir \
  -e BOT_TOKEN=<YOUR_BOT_TOKEN>
  -e CLIENT_ID=<YOUR_BOT_CLIENT_ID>
  --restart unless-stopped \
  ghcr.io/adamhl8/eyir:latest
```

## Features

Most of the following is hardcoded and not easily configurable. You should be able to pretty easily change what you need to in the source though. I'll make it more configurable eventually (maybe). :)

- Automatically applies the Valarjar role to all server members, both retroactively and to new members.
- Sends a welcome message (DM) to new server members.
- Responds to pre-defined words with pre-defined responses.
- Allows you to set up a channel where the bot will read .txt files and images from a folder and push it to a channel. Primarily used for maintaining a FAQ/resources channel. See the Commands section for more info.

## Commands

`/list-bots` - Prints a list of all the bots in the server.

### faq-init

`/faq-init`

Needs to be run in a channel named `guides-resources-faq`. Every time the command is run, all previous messages in the channel are deleted.

Looks for a folder called `faq` in the root of the project directory. Loops through each folder in the `faq` directory where each folder will end up being a section of the faq. Folder names and order are defined at `faqDirectoryOrder` in `faqInit.ts`.

Loops through each file in alphabetical order in each folder. Looks for `.png` or `.txt` files. For every file, a message is pushed to the channel. Intended purpose for images is to add headers to sections. Supports multiple text files so you can split your content out if it's over 2000 characters. e.g. `content.txt`, `content2.txt`.

The bot also creates a header and footer embed that links to each section so they can be easily jumped to.

The `faq` folder is monitored for any changes and will automatically edit the appropriate message with the new content when any of the text files are changed. This is so multiple people can easily edit/contribute to the faq by submitting pull requests or pushing to the repo.

It's intended that you automate updating your local installation whenever there is a commit to the repo. That way the bot picks up changes and automatically updates the faq with the new content. For example, I use [n8n](https://n8n.io) to automatically run `git pull` whenever there is a new commit to the main branch.
