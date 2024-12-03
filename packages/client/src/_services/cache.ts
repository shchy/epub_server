export interface CacheItem<T> {
  item: T
  lastAt: Date
}
export const createCache = <T>({ cacheSize }: { cacheSize: number }) => {
  const cache: CacheItem<T>[] = []

  const set = (item: T) => {
    cache.push({
      item: item,
      lastAt: new Date(),
    })

    if (cacheSize < cache.length) {
      console.warn(`will remove cache ${cache.length}`)
      cache.sort((a, b) => (a.lastAt.getTime() - b.lastAt.getTime() ? -1 : 1))
      cache.splice(cacheSize)
      console.warn(`done remove cache ${cache.length}`)
    }
  }

  const get = (predicate: (item: T) => boolean) => {
    const findOne = cache.find((x) => predicate(x.item))
    if (!findOne) {
      return
    }
    findOne.lastAt = new Date()
    return findOne
  }

  return {
    set,
    get,
  }
}

export type BookCache = ReturnType<typeof createCache>
