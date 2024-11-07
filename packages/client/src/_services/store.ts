export const createDB = <T extends object>({
  dbName,
  storeName,
  keyPath,
}: {
  dbName: string
  storeName: string
  keyPath: keyof T
}) => {
  const openDB = async () => {
    return new Promise<IDBDatabase>((resolve, reject) => {
      const req = indexedDB.open(dbName, 1)
      req.onupgradeneeded = (e) => {
        const db = (e.target as IDBOpenDBRequest).result
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, {
            keyPath: keyPath.toString(),
          })
        }
      }
      req.onsuccess = (e) => resolve((e.target as IDBOpenDBRequest).result)
      req.onerror = () => reject(`open db error db:${dbName}`)
    })
  }

  const getStore = async (mode?: IDBTransactionMode) => {
    const db = await openDB()
    return new Promise<IDBObjectStore>((resolve) => {
      const transaction = db.transaction([storeName], mode)
      const store = transaction.objectStore(storeName)
      resolve(store)
    })
  }

  const get = async (key: IDBValidKey) => {
    const store = await getStore('readonly')
    return new Promise<T | undefined>((resolve) => {
      try {
        const req = store.get(key)
        req.onsuccess = () => resolve(req.result)
        req.onerror = () => {
          console.error(
            `get error=${req.error} dbName=${dbName} storeName=${storeName}`,
          )
          resolve(undefined)
        }
      } catch (err) {
        console.error(
          `get error=${err} dbName=${dbName} storeName=${storeName}`,
        )
      }
    })
  }

  const put = async (value: T) => {
    const store = await getStore('readwrite')
    return new Promise<T>((resolve, reject) => {
      try {
        const req = store.put(value)
        req.onsuccess = () => {
          resolve(value)
        }
        req.onerror = () => {
          console.error(
            `put error=${req.error} dbName=${dbName} storeName=${storeName}`,
          )
          reject()
        }
      } catch (err) {
        console.error(
          `put error=${err} dbName=${dbName} storeName=${storeName}`,
        )
        reject()
      }
    })
  }

  const list = async () => {
    const store = await getStore('readonly')
    return new Promise<T[]>((resolve) => {
      try {
        const req = store.getAll()
        req.onsuccess = () => resolve(req.result ?? [])
        req.onerror = () => {
          console.error(
            `get error=${req.error} dbName=${dbName} storeName=${storeName}`,
          )
          resolve([])
        }
      } catch (err) {
        console.error(
          `get error=${err} dbName=${dbName} storeName=${storeName}`,
        )
      }
    })
  }

  return {
    get,
    put,
    list,
  }
}
