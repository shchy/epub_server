import { HttpResponse, http } from 'msw';
import { SetupWorker, setupWorker } from 'msw/browser';
import {
  APIPath,
  BookSeries,
  CreateEpub,
  CreateEpubController,
  Epub,
  createDB,
} from '../_services';

const VERSION = 'v1';
interface bookIndex {
  version: string;
  series: BookSeries[];
}

export interface EpubStoreItem {
  id: string;
  epub: Epub;
}

const seriesStore = createDB<bookIndex>({
  dbName: 'seriesDB',
  storeName: 'series',
  keyPath: 'version',
});
const bookStore = createDB<EpubStoreItem>({
  dbName: 'bookDB',
  storeName: 'books',
  keyPath: 'id',
});

const getEpub = async (bookId: string) => {
  let bookData = await bookStore.get(bookId);
  if (!bookData) {
    const series = await seriesStore.get(VERSION);
    const book = series?.series
      .flatMap((x) => x.books)
      .find((x) => x.id === bookId);

    if (!book) return;

    const response = await fetch(`/books/${book.filePath}`);
    const data = await response.arrayBuffer();
    const epub = CreateEpub(new Uint8Array(data));
    bookData = {
      id: book.id,
      epub: epub,
    };
    await bookStore.put(bookData);
  }
  return bookData;
};

export const worker: SetupWorker = setupWorker(
  ...[
    http.get(APIPath.getSeries, async () => {
      console.log(APIPath.getSeries);
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
      return HttpResponse.json(series.series);
    }),

    http.get(APIPath.getBookPage, async ({ params }) => {
      console.log(APIPath.getBookPage);
      const { id, page } = params;
      const pageIndex = parseInt(page as string);

      const epub = await getEpub(id as string);
      if (!epub) return;

      const ctrl = CreateEpubController(epub.epub);
      const pageHtml = await ctrl.getPage(pageIndex);
      if (!pageHtml) return;

      return HttpResponse.html(pageHtml.outerHTML);
    }),
  ]
);
