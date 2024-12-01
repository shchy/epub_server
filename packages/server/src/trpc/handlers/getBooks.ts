import { BookAPIParams, procedure } from '../router'
import { Book } from '@epub/lib'
import { z } from 'zod'
import fs from 'fs'

export const loadIndexFile = (indexFilePath: string) => {
  if (!fs.existsSync(indexFilePath)) {
    return []
  }
  const books = JSON.parse(
    fs.readFileSync(indexFilePath).toString('utf8'),
  ) as Book[]
  return books
}

export const getBooks = ({ indexFilePath }: BookAPIParams) => {
  return procedure.input(z.string().optional()).query(async ({ input }) => {
    const books = loadIndexFile(indexFilePath)
    return books.filter((x) => (input ? x.id === input : true))
  })
}
