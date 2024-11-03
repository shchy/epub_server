import {
  readdirSync,
  statSync,
  readFileSync,
  writeFileSync,
  existsSync,
} from 'fs';
import path from 'path';
import sharp from 'sharp';
import { Book, CreateEpub, CreateEpubController } from './src/_services';

const bookDir = './public/books';
const indexFilePath = path.join(bookDir, 'index.json');

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

const books: Book[] = [];
const beforeIndex = existsSync(indexFilePath)
  ? (JSON.parse(readFileSync(indexFilePath).toString('utf8')) as Book[])
  : [];

for (const epubFilepath of epubList) {
  const epubFileName = path.basename(epubFilepath);
  const findOne = beforeIndex.find((x) => x.filePath === epubFileName);
  if (findOne) {
    books.push(findOne);
    continue;
  }

  console.log('epubFilepath', epubFilepath);
  const fileData = readFileSync(epubFilepath);
  const epub = CreateEpub(fileData);
  const ctrl = CreateEpubController(epub);
  const coverImage = ctrl.getCoverImage();
  const thumbnail = coverImage
    ? await sharp(coverImage).resize(150).toBuffer()
    : undefined;

  books.push({
    id: epub.metaData.identifier,
    name: epub.metaData.title,
    filePath: epubFileName,
    pageCount: epub.spine.length,
    faceB64: thumbnail ? thumbnail.toString('base64') : '',
  });
}

writeFileSync(indexFilePath, JSON.stringify(books, undefined, 2));
