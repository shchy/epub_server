import { createDB } from './store';

export interface BookSeries {
  id: string;
  name: string;
  books: Book[];
}

export interface Book {
  id: string;
  name: string;
  thumbnailPath?: string;
  pageCount: number;
  filePath: string;
  isCached?: boolean;
  addDate?: number;
}

// 本のページ情報
interface PageDBItem {
  id: string;
  html: string;
}
const createPageDBItemKey = (bookId: string, pageIndex: number) =>
  `${bookId}!${pageIndex}`;
// 本のページ情報保存済みかどうかを保持する

// 最近読んだ本
export interface OpenRecent {
  bookId: string;
  pageIndex: number;
  date: number;
}

export const createBookRepository = () => {
  const bookStore = createDB<Book>({
    dbName: 'bookDB',
    storeName: 'books',
    keyPath: 'id',
  });

  const pageStore = createDB<PageDBItem>({
    dbName: 'pageDB',
    storeName: 'pages',
    keyPath: 'id',
  });

  const recentStore = createDB<OpenRecent>({
    dbName: 'recentDB',
    storeName: 'recents',
    keyPath: 'bookId',
  });

  const getSeries = async () => {
    const books = await bookStore.list();

    // _で区切ったidでシリーズをまとめる
    const agg = books.reduce((ps: BookSeries[], book: Book) => {
      const [seriesId] = book.id.split('_');
      const seriesName = (() => {
        const ns = book.name.split(' ');
        if (ns.length === 1) {
          return ns[0];
        }
        return ns.slice(0, -1).join(' ');
      })();

      let series = ps.find((p) => p.id === seriesId);
      if (!series) {
        series = {
          id: seriesId,
          name: seriesName,
          books: [],
        };
        ps.push(series);
      }
      series.books.push(book);
      return ps;
    }, [] as BookSeries[]);

    return agg;
  };

  const putBook = async (book: Book) => {
    await bookStore.put(book);
  };

  const getBook = async (bookId: string) => {
    return await bookStore.get(bookId);
  };

  const getPage = async (bookId: string, pageIndex: number) => {
    const item = await pageStore.get(createPageDBItemKey(bookId, pageIndex));
    return item?.html;
  };

  const putPage = async (bookId: string, pageIndex: number, html: string) => {
    await pageStore.put({
      id: createPageDBItemKey(bookId, pageIndex),
      html: html,
    });
  };

  const setCached = async (bookId: string) => {
    const book = await bookStore.get(bookId);
    if (!book) return;
    book.isCached = true;
    await bookStore.put(book);
  };

  const saveRecent = async (bookId: string, index: number) => {
    await recentStore.put({
      bookId: bookId,
      pageIndex: index,
      date: new Date().getTime(),
    });
  };

  const listRecents = async () => {
    return await recentStore.list();
  };

  return {
    getSeries,
    getBook,
    putBook,
    getPage,
    putPage,
    setCached,
    saveRecent,
    listRecents,
  };
};
