import { MakeContext } from './contextHelper'
import { BookSeries, createBookRepository } from './bookRepository'
import { useCallback, useMemo, useState } from 'react'
import { Book, CreateEpub, Epub } from '@epub/lib'
import path from 'path-browserify-esm'
import { createCache, Cache } from './cache'

interface Page {
  index: number
  html: string
}
interface PageCache {
  bookId: string
  epub: Epub
  pages: Cache<Page>
}

export const CreateBookLibrary = () => {
  const BOOK_CACHE_SIZE = 1
  const PAGE_CACHE_SIZE = 12
  const [seriesList, setSeriesList] = useState<BookSeries[]>()
  const repo = useMemo(() => createBookRepository(), [])
  const pageCache = useMemo(
    () => createCache<PageCache>({ cacheSize: BOOK_CACHE_SIZE }),
    [],
  )
  const domParser = new DOMParser()

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
    const item = pageCache.get((x) => x.bookId === bookId)
    if (!item) {
      return
    }

    let page = item.pages.get((x) => x.index === pageIndex)
    if (!page) {
      const html = await item.epub.getPage(pageIndex)
      if (!html) return

      page = {
        index: pageIndex,
        html: html,
      }
      item.pages.set(page)
    }
    return page?.html
  }

  const downloadProgressRasio = 1
  const _getEpub = async (bookId: string, setProgress: (v: number) => void) => {
    const res = await fetch('/api/book/' + bookId)
    if (!res.body) throw new Error('body not found')
    if (!res.headers) throw new Error('headers not found')
    const reader = res.body.getReader()
    const contentLength = +(res.headers.get('Content-Length') ?? '0')

    const data = new Uint8Array(contentLength)
    let receivedLength = 0
    let lastProgress = 0
    const diffOnUpdate = 0.05
    while (true) {
      const { done, value } = await reader.read()
      if (done) {
        break
      }
      data.set(value, receivedLength)
      receivedLength += value.length
      const p = (receivedLength / contentLength) * downloadProgressRasio
      if (p - lastProgress > diffOnUpdate) {
        setProgress(p)
        lastProgress = p
      }
    }
    return data
  }

  const epubDownload = async (
    bookId: string,
    setProgress: (v: number) => void,
  ) => {
    try {
      const bin = await _getEpub(bookId, setProgress)

      const epub = CreateEpub({
        epubFile: bin,
        domParser,
        path,
      })

      pageCache.set({
        bookId: bookId,
        pages: createCache<Page>({ cacheSize: PAGE_CACHE_SIZE }),
        epub: epub,
      })

      setProgress(1)
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
    PAGE_CACHE_SIZE,
  }
}

export const { provider: BookLibraryProvider, use: useBookLibrary } =
  MakeContext(CreateBookLibrary)
export type BookLibrary = ReturnType<typeof CreateBookLibrary>
