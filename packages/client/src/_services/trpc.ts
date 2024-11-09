import { createTRPCClient, httpBatchLink } from '@trpc/client'
import type { AppRouter } from '@epub/server/src/trpc'

export const trpc = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: '/trpc/',
    }),
  ],
})
