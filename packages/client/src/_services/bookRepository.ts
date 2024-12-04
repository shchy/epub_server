import { Book } from '@epub/lib'
import { createDB } from './store'

export interface BookSeries {
  id: string
  name: string
  books: Book[]
}

// Epubバイナリ
export interface EpubDBItem {
  id: string
  data: Blob
}

// 最近読んだ本
export interface OpenRecent {
  bookId: string
  pageIndex: number
  date: number
}

export const createBookRepository = () => {
  const bookStore = createDB<Book>({
    dbName: 'bookDB',
    storeName: 'books',
    keyPath: 'id',
  })

  const epubStore = createDB<EpubDBItem>({
    dbName: 'epubDB',
    storeName: 'epub',
    keyPath: 'id',
  })

  const recentStore = createDB<OpenRecent>({
    dbName: 'recentDB',
    storeName: 'recents',
    keyPath: 'bookId',
  })

  const getSeries = async () => {
    const books = await bookStore.list()

    // _で区切ったidでシリーズをまとめる
    const agg = books.reduce((ps: BookSeries[], book: Book) => {
      const [seriesId] = book.id.split('_')
      const seriesName = (() => {
        const ns = book.name.split(' ')
        if (ns.length === 1) {
          return ns[0]
        }
        return ns.slice(0, -1).join(' ')
      })()

      let series = ps.find((p) => p.id === seriesId)
      if (!series) {
        series = {
          id: seriesId,
          name: seriesName,
          books: [],
        }
        ps.push(series)
      }
      series.books.push(book)
      return ps
    }, [] as BookSeries[])

    return agg
  }

  const putBook = async (book: Book) => {
    await bookStore.put(book)
  }

  const getBook = async (bookId: string) => {
    return await bookStore.get(bookId)
  }

  const putEpub = async (item: EpubDBItem) => {
    await epubStore.put(item)
    return item
  }

  const getEpub = async (bookId: string) => {
    return await epubStore.get(bookId)
  }

  const saveRecent = async (bookId: string, index: number) => {
    await recentStore.put({
      bookId: bookId,
      pageIndex: index,
      date: new Date().getTime(),
    })
  }

  const listRecents = async () => {
    return await recentStore.list()
  }

  return {
    getSeries,
    getBook,
    putBook,
    getEpub,
    putEpub,
    saveRecent,
    listRecents,
  }
}
