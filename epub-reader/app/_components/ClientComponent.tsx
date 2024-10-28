'use client';
import { useEffect, useState } from 'react';
import { BookComponent } from './BookComponent';
import { useDB } from '../_services/store';
import { CreateEpub, Epub } from '../_services';

const epubFileName = '618908_001_SPY×FAMILY 1.epub';

export const ClientComponent = () => {
  const [epub, setEpub] = useState<Epub>();
  const { get, put } = useDB<Epub>({
    dbName: 'bookDB',
    storeName: 'books',
    keyPath: 'identifier',
  });

  useEffect(() => {
    (async () => {
      let file = await get(epubFileName);
      if (!file) {
        console.log('fetch');
        const s = performance.now();
        const response = await fetch(`/books/${epubFileName}`);
        const data = await response.arrayBuffer();
        file = CreateEpub(new Uint8Array(data));
        const e = performance.now();
        console.log('create epub', e - s);
        await put(file);
      } else {
        console.log('not fetch');
      }
      setEpub(file);
    })();
  }, [setEpub, get, put]);

  return epub ? <BookComponent epub={epub} /> : <></>;
};
