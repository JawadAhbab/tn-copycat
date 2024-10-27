import rimraf from 'rimraf'

export const rimrafAsync = (path: string) => {
  return new Promise((resolve) => {
    rimraf(path, () => resolve(true))
  })
}
