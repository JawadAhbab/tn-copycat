import { readdirSync } from 'fs-extra'
import { join } from 'path'
import { isExcluded } from './isExcluded'
type F = string[]

export const dirtree = (folder: string, excludes: F = [], includes: F = []): F => {
  return readdirSync(folder, { withFileTypes: true })
    .map((ff) => {
      const fullpath = join(folder, ff.name)
      if (isExcluded(fullpath, { excludes, includes })) return
      if (ff.isFile()) return fullpath
      return [fullpath, ...dirtree(fullpath, excludes, includes)]
    })
    .flat()
    .filter((i) => i)
    .sort((a, b) => a.length - b.length)
}
