import path from 'path'
import express from 'express'

const app = express()
const router = express.Router()

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

// 静的ファイルのルーティング
router.use(express.static('public'))

router.get('*', (req, res, next) => {
  res.sendFile(path.join(__dirname, './public/index.html'))
})

app.use('/', router)
