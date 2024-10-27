import { watch } from 'chokidar'
import fs from 'fs-extra'
import { join, relative } from 'path'
import rimraf from 'rimraf'
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
    const excludes = config.excludes?.map((p) => join(copyfrom, p)) || []
    const includes = config.includes?.map((p) => join(copyfrom, p)) || []

    fs.ensureDirSync(copyto)
    const has = dirtree(copyto).map((p) => relative(copyto, p))
    const mayhave = dirtree(copyfrom, excludes, includes).map((p) => relative(copyfrom, p))
    const orphaned = has.filter((p) => !mayhave.includes(p))
    orphaned.forEach((path) => {
      logger(idx, 'unlink', path)
      rimraf(join(copyto, path), () => null)
    })

    watch(copyfrom).on('all', (event, frompath) => {
      const relpath = relative(copyfrom, frompath)
      const topath = join(copyto, relpath)
      logger(idx, event, relpath)
      execWatch(event, frompath, topath, config.readonly)
    })
  })
}
