import { initTRPC } from '@trpc/server'
import * as trpcExpress from '@trpc/server/adapters/express'
import { getBooks } from './handlers'
import { BookCache } from './cache'

const t = initTRPC.create()
export const router = t.router
export const procedure = t.procedure

export interface BookAPIParams {
  bookCache: BookCache
  indexFilePath: string
  epubFileDir: string
}

export const createTrpcRouter = (prms: BookAPIParams) => {
  // const createContext = async (
  //   opt?: trpcExpress.CreateExpressContextOptions,
  // ) => {
  //   return {}
  // }
  // type Context = Awaited<ReturnType<typeof createContext>>

  const appRouter = router({
    book: getBooks(prms),
    // getBookPage: getBookPage(prms),
  })

  const trpcHandler = trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext: async () => ({}),
  })

  return {
    appRouter,
    trpcHandler,
  }
}

export type AppRouter = ReturnType<typeof createTrpcRouter>['appRouter']
