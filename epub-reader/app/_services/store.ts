import { useCallback } from 'react';

export const useDB = <T extends object>({
  dbName,
  storeName,
  keyPath,
}: {
  dbName: string;
  storeName: string;
  keyPath: keyof T;
}) => {
  const openDB = useCallback(() => {
    return new Promise<IDBDatabase>((resolve, reject) => {
      const req = indexedDB.open(dbName, 1);
      req.onupgradeneeded = (e) => {
        const db = (e.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, { keyPath: keyPath.toString() });
        }
      };
      req.onsuccess = (e) => resolve((e.target as IDBOpenDBRequest).result);
      req.onerror = () => reject(`open db error db:${dbName}`);
    });
  }, [dbName, storeName, keyPath]);

  const getStore = useCallback(
    async (mode?: IDBTransactionMode) => {
      const db = await openDB();
      return new Promise<IDBObjectStore>((resolve) => {
        const transaction = db.transaction([storeName], mode);
        const store = transaction.objectStore(storeName);
        resolve(store);
      });
    },
    [storeName, openDB]
  );

  const get = useCallback(
    async (key: IDBValidKey) => {
      const store = await getStore('readonly');
      return new Promise<T | undefined>((resolve) => {
        const req = store.get(key);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => resolve(undefined);
      });
    },
    [getStore]
  );

  const put = useCallback(
    async (value: T) => {
      const store = await getStore('readwrite');
      return new Promise<T>((resolve, reject) => {
        const req = store.put(value);
        req.onsuccess = () => resolve(value);
        req.onerror = () => reject();
      });
    },
    [getStore]
  );

  return {
    get,
    put,
  };
};
