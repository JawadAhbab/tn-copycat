import chalk from 'chalk'
import { capitalize } from 'tn-capitalize'
const negetypes = ['unlinkDir', 'unlink', 'clean']
let processid = 0

export const logger = (idx: number, event: string, relpath: string) => {
  const etype = capitalize(event).replace(':', '')
  relpath = relpath.replaceAll('\\', '/') || '.'
  const negtype = negetypes.includes(event)
  const bgcolor = negtype ? 'bgRedBright' : 'bgGreenBright'
  const color = negtype ? 'redBright' : 'greenBright'
  const gap = ' '.repeat(Math.max(9 - etype.length, 0))
  console.log(
    chalk.bgGray(` ${idx} `) + chalk[bgcolor].black(` ${etype} `),
    gap + chalk.yellow.bold(`${++processid}`),
    chalk[color](relpath)
  )
}
