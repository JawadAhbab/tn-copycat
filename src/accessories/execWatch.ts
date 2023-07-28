import { chmodSync, copyFileSync, ensureDirSync, existsSync } from 'fs-extra'
import rimraf from 'rimraf'
type Event = 'add' | 'addDir' | 'change' | 'unlink' | 'unlinkDir'

export const execWatch = (event: Event, frompath: string, topath: string, readonly: boolean) => {
  setTimeout(() => {
    if (event === 'addDir') return ensureDirSync(topath)
    if (event === 'unlink' || event === 'unlinkDir') return rimraf(topath, () => null)
    if (event === 'add' || event === 'change') {
      if (existsSync(topath)) chmodSync(topath, 0o666)
      copyFileSync(frompath, topath)
      chmodSync(topath, readonly ? 0o444 : 0o666)
    }
  }, 100)
}
