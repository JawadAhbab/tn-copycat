import { readdirSync, statSync } from 'fs-extra'
import { join } from 'path'

export const getBlankFolders = (folder: string) => {
  const blanks = []

  function isEmpty(dir: string) {
    const items = readdirSync(dir)
    if (items.length === 0) return true
    return items.every((item) => {
      const itemPath = join(dir, item)
      return statSync(itemPath).isDirectory() && isEmpty(itemPath)
    })
  }

  function traverse(dir: string) {
    if (isEmpty(dir)) {
      blanks.push(dir)
      return true
    }
    const items = readdirSync(dir)
    items.forEach((item) => {
      const itemPath = join(dir, item)
      if (statSync(itemPath).isDirectory()) traverse(itemPath)
    })
    return false
  }

  traverse(folder)
  return blanks
}
