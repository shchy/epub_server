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
      cache.sort((a, b) => (a.lastAt.getTime() - b.lastAt.getTime() ? -1 : 1))
      cache.splice(cacheSize)
    }
  }

  const get = (predicate: (item: T) => boolean) => {
    const findOne = cache.find((x) => predicate(x.item))
    if (!findOne) {
      return
    }
    findOne.lastAt = new Date()
    return findOne.item
  }

  return {
    set,
    get,
  }
}

export type Cache<T> = ReturnType<typeof createCache<T>>
