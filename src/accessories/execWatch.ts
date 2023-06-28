import { copyFileSync, ensureDirSync } from 'fs-extra'
import rimraf from 'rimraf'
type Event = 'add' | 'addDir' | 'change' | 'unlink' | 'unlinkDir'

export const execWatch = (event: Event, frompath: string, topath: string) => {
  setTimeout(() => {
    if (event === 'addDir') return ensureDirSync(topath)
    if (event === 'unlink' || event === 'unlinkDir') return rimraf(topath, () => null)
    if (event === 'add' || event === 'change') return copyFileSync(frompath, topath)
  }, 100)
}
