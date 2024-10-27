type F = string[]
type IncExc = { excludes: F; includes: F }

export const isExcluded = (path: string, { excludes, includes }: IncExc) => {
  const exc = excludes.some((i) => path.startsWith(i))
  const inc = includes.some((i) => path.startsWith(i))
  return exc && !inc
}
