import {
  readdirSync,
  statSync,
  readFileSync,
  writeFileSync,
  existsSync,
  mkdirSync,
} from 'fs';
import path from 'path';
import sharp from 'sharp';
import { Book, CreateEpub, CreateEpubController } from './src/_services';

const run = async () => {
  const bookDir = './public/books';
  const thumbnailDir = './public/thumbnail';
  const indexFilePath = path.join(bookDir, 'index.json');
  const beforeBooks = existsSync(indexFilePath)
    ? (JSON.parse(readFileSync(indexFilePath).toString('utf8')) as Book[])
    : [];
  if (!existsSync(thumbnailDir)) {
    mkdirSync(thumbnailDir);
  }

  const epubList = readdirSync(bookDir)
    .map((fspath) => {
      const fullPath = path.join(bookDir, fspath);
      return fullPath;
    })
    .filter((filepath) => {
      const stat = statSync(filepath);
      return stat.isFile();
    })
    .filter((filepath) => filepath.endsWith('.epub'));

  // 存在しなくなったepubを除外して初期値とする
  const fileNames = epubList.map((x) => path.basename(x));
  const books: Book[] = beforeBooks.filter((x) =>
    fileNames.includes(x.filePath)
  );
  const save = () =>
    writeFileSync(indexFilePath, JSON.stringify(books, undefined, 2));

  // base64なthumbnailが存在したらファイルに吐いてパスにする
  for (const book of books) {
    if (!book.faceB64) {
      continue;
    }
    const thumbnailPath = path.join(thumbnailDir, `${book.id}.png`);
    writeFileSync(thumbnailPath, Buffer.from(book.faceB64, 'base64'));
    book.faceB64 = undefined;
    book.thumbnailPath = thumbnailPath.replace('public', '');
  }

  // raspberrypiがすぐ落ちるから一旦セーブ
  save();

  for (const epubFilepath of epubList) {
    try {
      const epubFileName = path.basename(epubFilepath);
      // 登録済みならスキップ
      const findOne = books.find((x) => x.filePath === epubFileName);
      if (findOne) {
        continue;
      }

      console.log('epubFilepath', epubFilepath);
      const book = await new Promise<Buffer>((resolve) =>
        resolve(readFileSync(epubFilepath))
      )
        .then((fileData) => CreateEpub(fileData))
        .then((epub) => CreateEpubController(epub))
        .then((ctrl) => {
          return {
            coverImage: ctrl.getCoverImage(),
            id: ctrl.epub.metaData.identifier,
            name: ctrl.epub.metaData.title,
            pageCount: ctrl.epub.spine.length,
          };
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
            }))
        );

      const thumbnailPath = path.join(thumbnailDir, `${book.id}.png`);
      writeFileSync(thumbnailPath, book.thumbnail);

      books.push({
        id: book.id,
        name: book.name,
        filePath: epubFileName,
        pageCount: book.pageCount,
        thumbnailPath: thumbnailPath.replace('public', ''),
        addDate: new Date().getTime(),
      });

      save();
    } catch (err) {
      console.error('error', err);
    }
  }
};

run();
