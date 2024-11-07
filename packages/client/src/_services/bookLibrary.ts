import { MakeContext } from './contextHelper'
import { CreateEpub, CreateEpubController } from './epub'
import { BookSeries, createBookRepository } from './bookRepository'
import { useState } from 'react'

export const CreateBookLibrary = () => {
  const [seriesList, setSeriesList] = useState<BookSeries[]>([])
  const repo = createBookRepository()

  const getSeries = async () => {
    if (seriesList.length !== 0) {
      return seriesList
    }

    const res = await fetch(`/books/index.json`)
    const bookIndex = await res.json()

    const xs = await repo.getSeries()
    const books = xs.flatMap((x) => x.books)
    for (const book of bookIndex) {
      const exists = books.some((x) => x.id === book.id)
      if (exists) continue
      await repo.putBook({
        ...book,
        addDate: book.addDate ?? new Date().getTime(),
      })
    }

    const newList = await repo.getSeries()
    setSeriesList(newList)
    return newList
  }

  const getBook = async (id: string) => {
    const book = await repo.getBook(id)
    if (!book) return
    return book
  }

  const getBookPage = async (bookId: string, pageIndex: number) => {
    return await repo.getPage(bookId, pageIndex)
  }

  const epubDownload = async (
    bookId: string,
    setProgress: (v: number) => void,
  ) => {
    try {
      const book = await repo.getBook(bookId)
      if (!book) return
      if (book.isCached) {
        return
      }

      const response = await fetch(`/books/${book.filePath}`)
      const data = await response.arrayBuffer()
      const epub = CreateEpub(new Uint8Array(data))
      const ctrl = CreateEpubController(epub)
      const count = epub.spine.length
      for (const index of [...Array(count).keys()]) {
        const progress = (index + 1) / count
        setProgress(progress)
        const item = await repo.getPage(bookId, index)
        if (!item) {
          const html = await ctrl.getPage(index)
          if (!html) continue
          await repo.putPage(bookId, index, html)
        }
      }
      await repo.setCached(bookId)
    } catch (err) {
      console.error('epubDownload error', err)
    }
  }

  const saveRecent = repo.saveRecent

  const listRecents = repo.listRecents

  return {
    getSeries,
    getBook,
    getBookPage,
    epubDownload,
    saveRecent,
    listRecents,
  }
}

export const { provider: BookLibraryProvider, use: useBookLibrary } =
  MakeContext(CreateBookLibrary)

export type BookLibrary = ReturnType<typeof CreateBookLibrary>
