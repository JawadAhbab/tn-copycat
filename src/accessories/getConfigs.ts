import chalk from 'chalk'
import fs from 'fs-extra'
import path from 'path'
type CopycatConfigs = { readonly: boolean; copyfrom: string; copyto: string; excludes: string[] }[]

export const getConfigs = async () => {
  const configpath = path.join(process.cwd(), 'copycat.configs.json')
  if (!fs.existsSync(configpath)) {
    return console.log(
      chalk.bgRed.whiteBright(' ERROR '),
      chalk.visible('Could not find'),
      chalk.yellow.bold.italic('copycat.configs.json'),
      chalk.visible('file into the'),
      chalk.cyan.bold.italic('root'),
      chalk.visible('folder\n')
    )
  }

  let config: CopycatConfigs
  try {
    config = fs.readJSONSync(configpath)
  } catch {
    return console.log(
      chalk.bgRed.whiteBright(' ERROR '),
      chalk.visible('Invalid config file'),
      chalk.red.bold.italic('backup.configs.json\n')
    )
  }

  return config
}
