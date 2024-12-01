// import { EpubController } from '../epub'

// const cacheSize = 5
// interface BookCacheItem {
//   epub: EpubController
//   lastAt: Date
// }
// export const createCache = () => {
//   const cache: BookCacheItem[] = []

//   const set = (epub: EpubController) => {
//     const findOne = cache.find(
//       (x) => x.epub.epub.metaData.identifier === epub.epub.metaData.identifier,
//     )
//     if (findOne) {
//       findOne.lastAt = new Date()
//     } else {
//       cache.push({
//         epub: epub,
//         lastAt: new Date(),
//       })
//     }

//     if (cacheSize < cache.length) {
//       console.warn(`will remove cache ${cache.length}`)
//       cache.sort((a, b) => (a.lastAt.getTime() - b.lastAt.getTime() ? -1 : 1))
//       cache.splice(cacheSize)
//       console.warn(`done remove cache ${cache.length}`)
//     }
//   }

//   const get = (bookId: string) => {
//     const findOne = cache.find(
//       (x) => x.epub.epub.metaData.identifier === bookId,
//     )
//     if (!findOne) {
//       return
//     }
//     findOne.lastAt = new Date()
//     return findOne
//   }

//   return {
//     set,
//     get,
//   }
// }

// export type BookCache = ReturnType<typeof createCache>
