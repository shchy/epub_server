import { Epub } from './epub';
import { useDB } from './store';

export interface EpubStoreItem {
  name: string;
  epub: Epub;
}

export const useEpubStore = () => {
  const { get, put } = useDB<EpubStoreItem>({
    dbName: 'bookDB',
    storeName: 'books',
    keyPath: 'name',
  });

  return {
    getBook: get,
    putBook: put,
  };
};
