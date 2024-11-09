import path from 'path'
import express from 'express'
import cors from 'cors'
import https from 'https'
import dotenv from 'dotenv'
import { createTrpcRouter } from './trpc'
import { createCache } from './trpc/cache'
import fs from 'fs'

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

const isHttps = process.env.keyfile && process.env.certfile
const port = process.env.listenport ? parseInt(process.env.listenport) : 443

if (isHttps) {
  const options = {
    key: fs.readFileSync(process.env.keyfile as string),
    cert: fs.readFileSync(process.env.certfile as string),
  }
  https.createServer(options, app).listen(port, () => {
    console.log(`https listening to ${port}`)
  })
} else {
  app.listen(port, function () {
    console.log(`http listening to ${port}`)
  })
}
