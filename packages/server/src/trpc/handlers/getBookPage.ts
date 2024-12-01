// import { BookAPIParams, procedure } from '../router'
// import { loadIndexFile } from './getBooks'
// import { z } from 'zod'
// import fs from 'fs'
// import { CreateEpub, CreateEpubController } from '../../epub'
// import path from 'path'

// const loadEpub = (bookId: string, prms: BookAPIParams) => {
//   const cache = prms.bookCache.get(bookId)
//   if (cache) {
//     return cache.epub
//   }

//   const books = loadIndexFile(prms.indexFilePath)
//   const book = books.find((x) => x.id === bookId)
//   if (!book) {
//     return
//   }

//   const epubFile = fs.readFileSync(path.join(prms.epubFileDir, book.filePath))
//   const epub = CreateEpub(epubFile)
//   const ctrl = CreateEpubController(epub)
//   prms.bookCache.set(ctrl)
//   return ctrl
// }

// export const getBookPage = (prms: BookAPIParams) => {
//   return procedure
//     .input(z.object({ bookId: z.string(), pageIndex: z.number() }))
//     .query(async ({ input }) => {
//       // キャッシュにあればそれ使う
//       const ctrl = loadEpub(input.bookId, prms)
//       if (!ctrl) {
//         return undefined
//       }

//       return ctrl.getPage(input.pageIndex)
//     })
// }
