import path from 'path'
import express from 'express'
import cors from 'cors'
import https from 'https'
import dotenv from 'dotenv'
import fs from 'fs'
import { createApiRoute } from './api'

dotenv.config()

const app = express()
app.options('*', cors())

app.use(
  '/api',
  createApiRoute({
    indexFilePath: process.env.indexFilePath as string,
    epubFileDir: process.env.epubFileDir as string,
  }),
)
app.use(express.static(process.env.publicDir as string))
app.get('*', (_, res) => {
  res.sendFile(path.join(__dirname, './public/index.html'))
})

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
