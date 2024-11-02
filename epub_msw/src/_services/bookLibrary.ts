import { useEffect, useState } from 'react';
import { MakeContext } from './contextHelper';
import { CreateEpub, CreateEpubController } from './epub';
import { createDB } from './store';

const VERSION = 'v1';
// 本の索引情報 1レコードしかない
interface SeriesDBItem {
  version: string;
  series: BookSeries[];
}
// 本のページ情報
interface PageDBItem {
  id: string;
  page: string;
}
const createPageDBItemKey = (bookId: string, pageIndex: number) =>
  `${bookId}!${pageIndex}`;
// 本のページ情報保存済みかどうかを保持する
interface BookDBItem {
  id: string;
  name: string;
  count: number;
}

export interface BookSeries {
  id: string;
  name: string;
  books: Book[];
}

export interface Book {
  id: string;
  name: string;
  faceB64: string;
  pageCount: number;
  filePath: string;
}

export interface BookLibrary {
  series: BookSeries[];
  getBook: (id: string) => Promise<Book | undefined>;
  getBookPage: (
    bookId: string,
    pageIndex: number
  ) => Promise<string | undefined>;
  // getEpub: (id: string) => Promise<EpubController | undefined>;
  clearCache: () => Promise<void>;
}

export const CreateBookLibrary = (): BookLibrary => {
  const [series, setSeries] = useState<BookSeries[]>([]);

  const seriesStore = createDB<SeriesDBItem>({
    dbName: 'seriesDB',
    storeName: 'series',
    keyPath: 'version',
  });

  const pageStore = createDB<PageDBItem>({
    dbName: 'pageDB',
    storeName: 'pages',
    keyPath: 'id',
  });

  const bookStore = createDB<BookDBItem>({
    dbName: 'bookDB',
    storeName: 'books',
    keyPath: 'id',
  });

  const clearCache = async () => {
    const dbs = await indexedDB.databases();
    for (const db of dbs) {
      console.log(`will delete db=${db.name} version=${db.version}`);
      if (db.name) {
        indexedDB.deleteDatabase(db.name);
      }
      console.log(`done delete db=${db.name} version=${db.version}`);
    }
  };

  const epubDownload = async (bookId: string) => {
    try {
      const book = series.flatMap((x) => x.books).find((x) => x.id === bookId);
      if (!book) return;

      const stored = await bookStore.get(bookId);
      if (stored) {
        console.log(`${book.id} downloaded`);
        return;
      }

      const response = await fetch(`/books/${book.filePath}`);
      console.log('epubDownload fetch epub', bookId);
      const data = await response.arrayBuffer();
      console.log('epubDownload to buffer', bookId);

      const epub = CreateEpub(new Uint8Array(data));
      console.log('epubDownload read epub', bookId);
      const ctrl = CreateEpubController(epub);
      console.log('epubDownload create controller', bookId);

      for (const index of [...Array(epub.spine.length).keys()]) {
        const pageKey = createPageDBItemKey(bookId, index);
        let item = await pageStore.get(pageKey);
        if (!item) {
          const page = await ctrl.getPage(index);
          if (!page) continue;
          item = {
            id: pageKey,
            page: page,
          };
          await pageStore.put(item);
        }
        console.log('epubDownload save page', bookId, index);
      }
      await bookStore.put({
        id: bookId,
        name: book.name,
        count: book.pageCount,
      });
      console.log('epubDownload end', bookId);
      return epub;
    } catch (err) {
      console.log('epubDownload error', err);
    }
  };

  useEffect(() => {
    (async () => {
      await load();
    })();
  }, []);

  const load = async () => {
    let series = await seriesStore.get(VERSION);
    if (!series) {
      series = {
        version: VERSION,
        series: [
          {
            id: '618908',
            name: 'SPY×FAMILY',
            books: [
              {
                id: '618908_001',
                name: 'SPY×FAMILY 1',
                faceB64: '',
                pageCount: 20,
                filePath: '618908_001_SPY×FAMILY 1.epub',
              },
            ],
          },
        ],
      };
      await seriesStore.put(series);
    }
    setSeries(series.series);
  };

  const getBook = async (id: string) => {
    const book = series.flatMap((x) => x.books).find((x) => x.id === id);
    if (!book) return;
    await epubDownload(id);
    return book;
  };

  const getBookPage = async (bookId: string, pageIndex: number) => {
    const item = await pageStore.get(createPageDBItemKey(bookId, pageIndex));
    return item?.page;
  };

  return {
    clearCache,
    series,
    getBook,
    getBookPage,
    // getEpub,
  };
};

export const { provider: BookLibraryProvider, use: useBookLibrary } =
  MakeContext(CreateBookLibrary);
