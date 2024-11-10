import { MakeContext } from './contextHelper'
import { BookSeries, createBookRepository } from './bookRepository'
import { useCallback, useMemo, useState } from 'react'
import { trpc } from './trpc'

export const CreateBookLibrary = () => {
  const [seriesList, setSeriesList] = useState<BookSeries[]>()
  const repo = useMemo(() => createBookRepository(), [])

  const getSeries = useCallback(async () => {
    if (seriesList !== undefined) {
      return seriesList
    }

    const bookIndex = await trpc.book.query()

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
  }, [repo, seriesList])

  const getBook = async (id: string) => {
    const book = await repo.getBook(id)
    if (!book) return
    return book
  }

  const getBookPage = async (bookId: string, pageIndex: number) => {
    let page = await repo.getPage(bookId, pageIndex)
    if (!page) {
      page = await trpc.getBookPage.query({ bookId, pageIndex })
      if (page) {
        repo.putPage(bookId, pageIndex, page)
      }
    }
    return page
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

      for (let pageIndex = 0; pageIndex < book.pageCount; pageIndex++) {
        const progress = (pageIndex + 1) / book.pageCount
        setProgress(progress)

        const item = await repo.getPage(bookId, pageIndex)
        if (!item) {
          const html = await trpc.getBookPage.query({
            bookId: book.id,
            pageIndex: pageIndex,
          })
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
