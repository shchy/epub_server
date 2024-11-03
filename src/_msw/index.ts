// import { HttpResponse, http } from 'msw';
// import { SetupWorker, setupWorker } from 'msw/browser';
// import {
//   BookSeries,
//   CreateEpub,
//   CreateEpubController,
//   createDB,
// } from '../_services';

// export const APIPath = {
//   getSeries: '/api/series',
//   getBookPage: '/api/book/:id/:page',
// } as const;

// const VERSION = 'v1';
// interface bookIndex {
//   version: string;
//   series: BookSeries[];
// }

// export interface EpubStoreItem {
//   id: string;
//   epub: ArrayBuffer;
// }

// const seriesStore = createDB<bookIndex>({
//   dbName: 'seriesDB',
//   storeName: 'series',
//   keyPath: 'version',
// });
// const bookStore = createDB<EpubStoreItem>({
//   dbName: 'bookDB5',
//   storeName: 'books',
//   keyPath: 'id',
// });

// const getEpub = async (bookId: string) => {
//   try {
//     let bookData = await bookStore.get(bookId);

//     if (!bookData) {
//       const series = await seriesStore.get(VERSION);
//       const book = series?.series
//         .flatMap((x) => x.books)
//         .find((x) => x.id === bookId);
//       if (!book) return;

//       const response = await fetch(`/books/${book.filePath}`);
//       const data = await response.arrayBuffer();
//       bookData = {
//         id: book.id,
//         epub: data,
//       };

//       await bookStore.put(bookData);
//     }
//     const epub = CreateEpub(new Uint8Array(bookData.epub));
//     return epub;
//   } catch (err) {
//     console.error('getEpub error', err);
//   }
// };

// export const worker: SetupWorker = setupWorker(
//   ...[
//     http.get(APIPath.getSeries, async () => {
//       console.log(APIPath.getSeries);
//       let series = await seriesStore.get(VERSION);
//       if (!series) {
//         series = {
//           version: VERSION,
//           series: [
//             {
//               id: '618908',
//               name: 'SPY×FAMILY',
//               books: [
//                 {
//                   id: '618908_001',
//                   name: 'SPY×FAMILY 1',
//                   faceB64: '',
//                   pageCount: 20,
//                   filePath: '618908_001_SPY×FAMILY 1.epub',
//                 },
//               ],
//             },
//           ],
//         };
//         await seriesStore.put(series);
//       }
//       return HttpResponse.json(series.series);
//     }),

//     http.get(APIPath.getBookPage, async ({ params }) => {
//       console.log(APIPath.getBookPage);
//       const { id, page } = params;
//       const pageIndex = parseInt(page as string);

//       const epub = await getEpub(id as string);
//       if (!epub) return;

//       const ctrl = CreateEpubController(epub);
//       const pageHtml = await ctrl.getPage(pageIndex);
//       if (!pageHtml) return;

//       return HttpResponse.html(pageHtml);
//     }),
//   ]
// );
