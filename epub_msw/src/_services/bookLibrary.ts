import { useEffect, useState } from 'react';
import { MakeContext } from './contextHelper';

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
  getBook: (id: string) => Book | undefined;
}

export const APIPath = {
  getSeries: '/api/series',
  getBookPage: '/api/book/:id/:page',
} as const;

export const CreateBookLibrary = (): BookLibrary => {
  const [series, setSeries] = useState<BookSeries[]>([]);

  useEffect(() => {
    (async () => {
      await load();
    })();
  }, []);

  const load = async () => {
    const res = await fetch(APIPath.getSeries);
    const xs = (await res.json()) as BookSeries[];
    setSeries(xs);
  };

  const getBook = (id: string) =>
    series.flatMap((x) => x.books).find((x) => x.id === id);

  return {
    series,
    getBook,
  };
};

export const { provider: BookLibraryProvider, use: useBookLibrary } =
  MakeContext(CreateBookLibrary);
