import { MakeContext } from './contextHelper'
import { BookSeries, createBookRepository } from './bookRepository'
import { useCallback, useMemo, useState } from 'react'
import { Book, CreateEpub, CreateEpubController } from '@epub/lib'
import path from 'path-browserify-esm'

export const CreateBookLibrary = () => {
  const [seriesList, setSeriesList] = useState<BookSeries[]>()
  const repo = useMemo(() => createBookRepository(), [])

  const getSeries = useCallback(async () => {
    if (seriesList !== undefined) {
      return seriesList
    }
    const xs = await repo.getSeries()

    try {
      const bookIndex = (await (await fetch('/api/book')).json()) as Book[]
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
    } catch {
      setSeriesList(xs)
      return xs
    }
  }, [repo, seriesList])

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

      const res = await fetch('/api/book/' + book.id)
      const epubData = await res.arrayBuffer()
      const epub = CreateEpub(new Uint8Array(epubData))
      const ctrl = CreateEpubController(epub, new DOMParser(), path)

      for (let pageIndex = 0; pageIndex < book.pageCount; pageIndex++) {
        const progress = (pageIndex + 1) / book.pageCount
        setProgress(progress)

        const item = await repo.getPage(bookId, pageIndex)
        if (!item) {
          const html = await ctrl.getPage(pageIndex)
          if (!html) continue
          await repo.putPage(bookId, pageIndex, html)
        }
      }
      await repo.setCached(bookId)

      // const response = await fetch(`/books/${book.filePath}`)
      // const data = await response.arrayBuffer()
      // const epub = CreateEpub(new Uint8Array(data))
      // const ctrl = CreateEpubController(epub)
      // const count = epub.spine.length
      // for (const index of [...Array(count).keys()]) {
      //   const progress = (index + 1) / count
      //   setProgress(progress)
      //   const item = await repo.getPage(bookId, index)
      //   if (!item) {
      //     const html = await ctrl.getPage(index)
      //     if (!html) continue
      //     await repo.putPage(bookId, index, html)
      //   }
      // }
      // await repo.setCached(bookId)
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
