import { watch } from 'chokidar'
import { join, relative } from 'path'
import rimraf from 'rimraf'
import fs from 'fs-extra'
import { dirtree } from './accessories/dirtree'
import { execWatch } from './accessories/execWatch'
import { getConfigs } from './accessories/getConfigs'
import { logger } from './accessories/logger'

console.clear()
run()

async function run() {
  const configs = await getConfigs()
  if (!configs) return

  configs.forEach((config, idx) => {
    const copyfrom = join(process.cwd(), config.copyfrom)
    const copyto = join(process.cwd(), config.copyto)
    const ignored = config.excludes.map((p) => join(copyfrom, p))

    fs.ensureDirSync(copyto)
    const has = dirtree(copyto).map((p) => relative(copyto, p))
    const mayhave = dirtree(copyfrom, ignored).map((p) => relative(copyfrom, p))
    const orphaned = has.filter((p) => !mayhave.includes(p))
    orphaned.forEach((path) => {
      logger(idx, 'unlink', path)
      rimraf(join(copyto, path), () => null)
    })

    watch(copyfrom, { ignored }).on('all', (event, frompath) => {
      const relpath = relative(copyfrom, frompath)
      const topath = join(copyto, relpath)
      logger(idx, event, relpath)
      execWatch(event, frompath, topath, config.readonly)
    })
  })
}
