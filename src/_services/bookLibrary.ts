import { MakeContext } from './contextHelper';
import { CreateEpub, CreateEpubController } from './epub';
import { Book, BookSeries, createBookRepository } from './bookRepository';
import { useState } from 'react';

export interface BookLibrary {
  getSeries: () => Promise<BookSeries[]>;
  getBook: (bookId: string) => Promise<Book | undefined>;
  getBookPage: (
    bookId: string,
    pageIndex: number
  ) => Promise<string | undefined>;
  epubDownload: (
    bookId: string,
    setProgress: (v: number) => void
  ) => Promise<void>;
}

export const CreateBookLibrary = (): BookLibrary => {
  const [seriesList, setSeriesList] = useState<BookSeries[]>([]);
  const repo = createBookRepository();

  const getSeries = async () => {
    if (seriesList.length !== 0) {
      return seriesList;
    }

    const res = await fetch(`/books/index.json`);
    const bookIndex = await res.json();

    const xs = await repo.getSeries();
    const books = xs.flatMap((x) => x.books);
    for (const book of bookIndex) {
      const exists = books.some((x) => x.id === book.id);
      if (exists) continue;
      await repo.putBook(book);
    }

    const newList = await repo.getSeries();
    setSeriesList(newList);
    return newList;
  };

  const getBook = async (id: string) => {
    const book = await repo.getBook(id);
    if (!book) return;
    return book;
  };

  const getBookPage = async (bookId: string, pageIndex: number) => {
    return await repo.getPage(bookId, pageIndex);
  };

  const epubDownload = async (
    bookId: string,
    setProgress: (v: number) => void
  ) => {
    try {
      const book = await repo.getBook(bookId);
      if (!book) return;
      if (book.isCached) {
        console.log(`${book.id} downloaded`);
        return;
      }

      console.log('will fetch epub', bookId);
      const response = await fetch(`/books/${book.filePath}`);
      const data = await response.arrayBuffer();
      console.log('done fetch epub', bookId);

      console.log('will read epub', bookId);
      const epub = CreateEpub(new Uint8Array(data));
      console.log('done read epub', bookId);

      const ctrl = CreateEpubController(epub);
      const count = epub.spine.length;
      for (const index of [...Array(count).keys()]) {
        const progress = (index + 1) / count;
        setProgress(progress);
        console.log('will save page', bookId, index);
        const item = await repo.getPage(bookId, index);
        if (!item) {
          const html = await ctrl.getPage(index);
          if (!html) continue;
          await repo.putPage(bookId, index, html);
        }
        console.log('done save page', bookId, index);
      }
      await repo.setCached(bookId);
    } catch (err) {
      console.log('epubDownload error', err);
    }
  };

  return {
    getSeries,
    getBook,
    getBookPage,
    epubDownload,
  };
};

export const { provider: BookLibraryProvider, use: useBookLibrary } =
  MakeContext(CreateBookLibrary);
