import { MakeContext } from './contextHelper'
import { BookSeries, createBookRepository, EpubDBItem } from './bookRepository'
import { useCallback, useMemo, useState } from 'react'
import {
  Book,
  CreateEpub,
  CreateEpubController,
  EpubController,
} from '@epub/lib'
import path from 'path-browserify-esm'
import { createCache } from './cache'

interface Page {
  index: number
  html: string
}
interface PageCache {
  bookId: string
  ctrl: EpubController
  pages: Page[]
}

export const CreateBookLibrary = () => {
  const [seriesList, setSeriesList] = useState<BookSeries[]>()
  const repo = useMemo(() => createBookRepository(), [])
  const pageCache = useMemo(() => createCache<PageCache>({ cacheSize: 1 }), [])

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
    const item = pageCache.get((x) => x.bookId === bookId)?.item
    if (!item) {
      return
    }

    let page = item.pages.find((x) => x.index === pageIndex)
    if (!page) {
      const html = await item.ctrl.getPage(pageIndex)
      if (!html) return
      page = {
        index: pageIndex,
        html: html,
      }
      item.pages.push(page)
    }
    return page?.html
  }

  const downloadProgressRasio = 0.99
  const _getEpub = async (bookId: string, setProgress: (v: number) => void) => {
    const res = await fetch('/api/book/' + bookId)
    if (!res.body) return
    if (!res.headers) return
    const reader = res.body.getReader()
    const contentLength = +(res.headers.get('Content-Length') ?? '0')
    let receivedLength = 0
    const chunks: Uint8Array[] = []
    while (true) {
      const { done, value } = await reader.read()
      if (done) {
        break
      }
      chunks.push(value)
      receivedLength += value.length
      setProgress((receivedLength / contentLength) * downloadProgressRasio)
    }
    return chunks
  }

  const epubDownload = async (
    bookId: string,
    setProgress: (v: number) => void,
  ) => {
    try {
      const bin = await repo
        .getEpub(bookId)
        .then((epubItem) => {
          if (epubItem) {
            setProgress(downloadProgressRasio)
            return epubItem.data.arrayBuffer()
          } else {
            return _getEpub(bookId, setProgress)
              .then((chunks) => {
                return new Blob(chunks)
              })
              .then((blob) => {
                return {
                  id: bookId,
                  data: blob,
                } satisfies EpubDBItem
              })
              .then((item) => {
                return repo.putEpub(item)
              })
              .then((item) => {
                return item.data.arrayBuffer()
              })
          }
        })
        .then((buffer) => {
          return new Uint8Array(buffer)
        })

      const epub = CreateEpub(bin)
      const ctrl = CreateEpubController(epub, new DOMParser(), path)

      // const book = await repo.getBook(bookId)
      // if (!book) return

      // const pages: Uint8Array[] = []
      // const enc = new TextEncoder()
      // for (let pageIndex = 0; pageIndex < book.pageCount; pageIndex++) {
      //   const progress = (pageIndex + 1) / book.pageCount
      //   const p = downloadProgressRasio + progress * (1 - downloadProgressRasio)
      //   console.log('page', pageIndex, p)
      //   setProgress(p)

      //   const page = await ctrl.getPage(pageIndex)
      //   if (!page) {
      //     continue
      //   }
      //   console.log('zip', pageIndex)
      //   const zipped = zlibSync(enc.encode(page))
      //   pages.push(zipped)
      //   console.log('zipped', pageIndex)

      //   // const item = await repo.getPage(bookId, pageIndex)
      //   // if (!item) {
      //   //   const html = await ctrl.getPage(pageIndex)
      //   //   if (!html) continue
      //   //   await repo.putPage(bookId, pageIndex, html)
      //   // }
      // }
      pageCache.set({
        bookId: bookId,
        pages: [],
        ctrl: ctrl,
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
  }
}

export const { provider: BookLibraryProvider, use: useBookLibrary } =
  MakeContext(CreateBookLibrary)

export type BookLibrary = ReturnType<typeof CreateBookLibrary>
