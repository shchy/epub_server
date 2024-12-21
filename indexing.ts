import {
  readdirSync,
  statSync,
  readFileSync,
  writeFileSync,
  existsSync,
  mkdirSync,
} from 'fs'
import path from 'path'
import sharp from 'sharp'
import { JSDOM } from 'jsdom'
import { Book, CreateEpub } from './packages/lib'

const run = async () => {
  const rootDir = process.argv.slice(2)[0]
  if (!rootDir) return

  const staticRoot = rootDir
  const bookDir = path.join(staticRoot, 'books')
  const thumbnailDir = path.join(staticRoot, 'thumbnail')

  const indexFilePath = path.join(bookDir, 'index.json')
  const beforeBooks =
    existsSync(indexFilePath) ?
      (JSON.parse(readFileSync(indexFilePath).toString('utf8')) as Book[])
    : []
  if (!existsSync(thumbnailDir)) {
    mkdirSync(thumbnailDir)
  }

  const epubList = readdirSync(bookDir)
    .map((fspath) => {
      const fullPath = path.join(bookDir, fspath)
      return fullPath
    })
    .filter((filepath) => {
      const stat = statSync(filepath)
      return stat.isFile()
    })
    .filter((filepath) => filepath.endsWith('.epub'))

  // 存在しなくなったepubを除外して初期値とする
  const fileNames = epubList.map((x) => path.basename(x))
  const books: Book[] = beforeBooks.filter((x) =>
    fileNames.includes(x.filePath),
  )
  const save = () =>
    writeFileSync(indexFilePath, JSON.stringify(books, undefined, 2))

  // raspberrypiがすぐ落ちるから一旦セーブ
  save()

  for (const epubFilepath of epubList) {
    try {
      const epubFileName = path.basename(epubFilepath)
      // 登録済みならスキップ
      const findOne = books.find((x) => x.filePath === epubFileName)
      if (findOne) {
        continue
      }

      const book = await new Promise<Buffer>((resolve) =>
        resolve(readFileSync(epubFilepath)),
      )
        .then((fileData) =>
          CreateEpub({
            epubFile: fileData,
            domParser: new new JSDOM().window.DOMParser(),
            path: path,
          }),
        )
        .then((ctrl) => {
          return {
            coverImage: ctrl.getCoverImage(),
            id: ctrl.metaData.identifier,
            name: ctrl.metaData.title,
            pageCount: ctrl.spine.length,
          }
        })
        .then((x) =>
          sharp(x.coverImage)
            .resize(150)
            .toBuffer()
            .then((thumbnail) => ({
              thumbnail,
              id: x.id,
              name: x.name,
              pageCount: x.pageCount,
            })),
        )

      const thumbnailPath = path.join(thumbnailDir, `${book.id}.png`)
      writeFileSync(thumbnailPath, book.thumbnail)

      books.push({
        id: book.id,
        name: book.name,
        filePath: epubFileName,
        pageCount: book.pageCount,
        thumbnailPath: thumbnailPath.replace(staticRoot, ''),
        addDate: new Date().getTime(),
      })

      save()
    } catch (err) {
      console.error('error', err)
    }
  }
}

run()
