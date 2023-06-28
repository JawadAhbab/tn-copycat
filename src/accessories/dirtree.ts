import { readdirSync } from 'fs-extra'
import { join } from 'path'

export const dirtree = (folder: string, ignored: string[] = []): string[] => {
  return readdirSync(folder, { withFileTypes: true })
    .map((ff) => {
      const fullpath = join(folder, ff.name)
      if (ignored.includes(fullpath)) return

      if (ff.isFile()) return fullpath
      return [fullpath, ...dirtree(fullpath, ignored)]
    })
    .flat()
    .filter((i) => i)
    .sort((a, b) => a.length - b.length)
}
