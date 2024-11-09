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

const options = {
  key: fs.readFileSync(process.env.keyfile as string),
  cert: fs.readFileSync(process.env.certfile as string),
}
const server = https.createServer(options, app)
const port = process.env.listenport ? parseInt(process.env.listenport) : 443
server.listen(port, () => {
  console.log(`listening to ${port}`)
})
// const server = app.listen(port, function () {
//   const address = server.address()
//   if (!address) return

//   let url = ''
//   if (typeof address === 'string') {
//     url = address
//   } else {
//     url = `${address.family} ${address.address}:${address.port}`
//   }
//   console.log(`Node.js is listening to ${url}`)
// })
