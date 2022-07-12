let faqMessages: Record<string, Message> = {}

const gaze = new Gaze('./faq/*/*')

gaze.on('changed', (fp: string) => {
  const parseFilepath = /.+faq\/(.+\/)(.+)/.exec(fp)
  if (!parseFilepath) {
    throw new Error(`failed to parse file path: ${fp}`)
  }

  const currentDirectory = parseFilepath[1]
  const currentFile = parseFilepath[2]

  Util.faqset(currentDirectory, currentFile, faqMessages[currentFile])
})

export function setFaqMessages(object: Record<string, Message>): void {
  faqMessages = object
}
