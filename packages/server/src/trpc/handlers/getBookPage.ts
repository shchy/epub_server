import { BookAPIParams, procedure } from '../router'
import { loadIndexFile } from './getBooks'
import { z } from 'zod'
import fs from 'fs'
import { CreateEpub, CreateEpubController } from '../../epub'
import path from 'path'

export const getBookPage = ({
  bookCache,
  epubFileDir,
  indexFilePath,
}: BookAPIParams) => {
  const loadEpub = (bookId: string) => {
    const cache = bookCache.get(bookId)
    if (cache) {
      return cache.epub
    }

    const books = loadIndexFile(indexFilePath)
    const book = books.find((x) => x.id === bookId)
    if (!book) {
      return
    }

    const epubFile = fs.readFileSync(path.join(epubFileDir, book.filePath))
    const epub = CreateEpub(epubFile)
    const ctrl = CreateEpubController(epub)
    bookCache.set(ctrl)
    return ctrl
  }

  return procedure
    .input(z.object({ bookId: z.string(), pageIndex: z.number() }))
    .query(async ({ input }) => {
      // キャッシュにあればそれ使う
      const ctrl = loadEpub(input.bookId)
      if (!ctrl) {
        return undefined
      }

      return ctrl.getPage(input.pageIndex)
    })
}
