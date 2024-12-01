import express, { Router } from 'express'
import fs from 'fs'
import path from 'path'
import { Book } from '@epub/lib'

export interface BookAPIParams {
  indexFilePath: string
  epubFileDir: string
}

export const loadIndexFile = (indexFilePath: string) => {
  if (!fs.existsSync(indexFilePath)) {
    return []
  }
  const books = JSON.parse(
    fs.readFileSync(indexFilePath).toString('utf8'),
  ) as Book[]
  return books
}

export const createApiRoute = ({
  epubFileDir,
  indexFilePath,
}: BookAPIParams): Router => {
  const router = express.Router()

  router.get('/book/:id', async (req, res) => {
    const { id } = req.params
    const books = loadIndexFile(indexFilePath)
    const book = books.find((x) => x.id === id)
    if (!book) {
      return
    }
    const filePath = path.join(epubFileDir, book.filePath)
    const absPath = path.resolve(filePath)
    res.sendFile(absPath)
  })
  router.get('/book', async (req, res) => {
    const books = loadIndexFile(indexFilePath)
    res.json(books)
  })
  return router
}
