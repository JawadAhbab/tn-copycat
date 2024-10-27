type F = string[]
type IncExc = { excludes: F; includes: F }

export const isExcluded = (path: string, { excludes, includes }: IncExc) => {
  const exc = excludes.includes(path)
  const inc = includes.includes(path)
  return exc && !inc
}
