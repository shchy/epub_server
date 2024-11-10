import { BookAPIParams, procedure } from '../router'
import { loadIndexFile } from './getBooks'
import { z } from 'zod'
import fs from 'fs'
import path from 'path'

const loadEpub = (bookId: string, prms: BookAPIParams) => {
  const books = loadIndexFile(prms.indexFilePath)
  const book = books.find((x) => x.id === bookId)
  if (!book) {
    return
  }

  const epubFile = fs.readFileSync(path.join(prms.epubFileDir, book.filePath))
  return epubFile
}

export const getEpub = (prms: BookAPIParams) => {
  return procedure
    .input(z.object({ bookId: z.string() }))
    .query(async ({ input }) => {
      const epub = loadEpub(input.bookId, prms)
      if (!epub) {
        return undefined
      }

      return epub
    })
}
