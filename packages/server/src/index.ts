import path from 'path'
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { createTrpcRouter } from './trpc'
import { createCache } from './trpc/cache'

dotenv.config()

const app = express()
app.options('*', cors())
app.use(
  '/trpc',
  createTrpcRouter({
    indexFilePath: process.env.indexFilePath as string,
    epubFileDir: process.env.epubFileDir as string,
    bookCache: createCache(),
  }).trpcHandler,
)
app.use(
  '/',
  express
    .Router()
    .use(express.static(process.env.publicDir as string))
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
