import { useEffect, useState } from 'react';
import { MakeContext } from './contextHelper';
import { CreateEpub, CreateEpubController } from './epub';
import { createDB } from './store';

const VERSION = 'v1';
interface bookIndex {
  version: string;
  series: BookSeries[];
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

export interface EpubStoreItem {
  id: string;
  page: string;
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

  const seriesStore = createDB<bookIndex>({
    dbName: 'seriesDB',
    storeName: 'series',
    keyPath: 'version',
  });

  const pageStore = createDB<EpubStoreItem>({
    dbName: 'pageDB2',
    storeName: 'pages',
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
      console.log('epubDownload', bookId);
      const book = series.flatMap((x) => x.books).find((x) => x.id === bookId);
      if (!book) return;
      console.log('epubDownload findBook', bookId, book);

      const response = await fetch(`/books/${book.filePath}`);
      console.log('epubDownload fetch epub', bookId);
      const data = await response.arrayBuffer();
      console.log('epubDownload to buffer', bookId);

      const epub = CreateEpub(new Uint8Array(data));
      console.log('epubDownload read epub', bookId);
      const ctrl = CreateEpubController(epub);
      console.log('epubDownload create controller', bookId);

      for (const index of [...Array(epub.spine.length).keys()]) {
        const pageKey = `${bookId}!${index}`;
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
    await epubDownload(id);
    return series.flatMap((x) => x.books).find((x) => x.id === id);
  };

  const getBookPage = async (bookId: string, pageIndex: number) => {
    const item = await pageStore.get(`${bookId}!${pageIndex}`);
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
