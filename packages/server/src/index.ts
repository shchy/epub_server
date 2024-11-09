import path from 'path'
import express from 'express'
import cors from 'cors'
import { createTrpcRouter } from './trpc'
import { createCache } from './trpc/cache'

const app = express()
app.options('*', cors())
app.use(
  '/trpc',
  createTrpcRouter({
    indexFilePath: './public/books/index.json',
    epubFileDir: './public/books',
    bookCache: createCache(),
  }).trpcHandler,
)
app.use(
  '/',
  express
    .Router()
    .use(express.static('public'))
    .get('*', (_, res) => {
      res.sendFile(path.join(__dirname, './public/index.html'))
    }),
)

/* 3000番ポートで待ち受け */
const server = app.listen(3000, function () {
  const address = server.address()
  if (!address) return

  let url = ''
  if (typeof address === 'string') {
    url = address
  } else {
    url = `${address.family} ${address.address}:${address.port}`
  }
  console.log(`Node.js is listening to ${url}`)
})
