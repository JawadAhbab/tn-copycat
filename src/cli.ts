import fs from 'fs-extra'
import { join, relative } from 'path'
import { filetree } from './accessories/filetree'
import { getBlankFolders } from './accessories/getBlankFolders'
import { getConfigs } from './accessories/getConfigs'
import { logger } from './accessories/logger'
import { rimrafAsync } from './accessories/rimrafAsync'

console.clear()
run()

async function run() {
  const configs = await getConfigs()
  if (!configs) return

  configs.forEach(async (config, idx) => {
    const copyfrom = join(process.cwd(), config.copyfrom)
    const copyto = join(process.cwd(), config.copyto)
    const excludes = config.excludes?.map((p) => join(copyfrom, p)) || []
    const includes = config.includes?.map((p) => join(copyfrom, p)) || []

    fs.ensureDirSync(copyto)
    const has = filetree(copyto).map((p) => relative(copyto, p))
    const mayhave = filetree(copyfrom, excludes, includes).map((p) => relative(copyfrom, p))
    const orphaned = has.filter((p) => !mayhave.includes(p))
    for (const path of orphaned) {
      logger(idx, 'unlink', path)
      await rimrafAsync(join(copyto, path))
    }

    const blanks = getBlankFolders(copyto)
    blanks.forEach((blank) => rimrafAsync(blank))

    // watch(copyfrom).on('all', (event, frompath) => {
    //   const relpath = relative(copyfrom, frompath)
    //   const topath = join(copyto, relpath)
    //   logger(idx, event, relpath)
    //   execWatch(event, frompath, topath, config.readonly)
    // })
  })
}
