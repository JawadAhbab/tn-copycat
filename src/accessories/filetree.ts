import { readdirSync } from 'fs-extra'
import { join } from 'path'
import { isExcluded } from './isExcluded'
type F = string[]

export const filetree = (folder: string, excludes: F = [], includes: F = []): F => {
  return readdirSync(folder, { withFileTypes: true })
    .map((ff) => {
      const fullpath = join(folder, ff.name)
      const path = isExcluded(fullpath, { excludes, includes }) ? null : fullpath
      if (ff.isFile()) return path
      return filetree(fullpath, excludes, includes)
    })
    .flat()
    .filter((i) => i)
    .sort((a, b) => a.length - b.length)
}
