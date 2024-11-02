import { readdirSync, statSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { Book, CreateEpub, CreateEpubController } from './src/_services';

const bookDir = './public/books';

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
for (const epubFilepath of epubList) {
  console.log('epubFilepath', epubFilepath);
  const fileData = readFileSync(epubFilepath);
  const epub = CreateEpub(fileData);
  const ctrl = CreateEpubController(epub);
  const coverImage = ctrl.getCoverImage();

  books.push({
    id: epub.metaData.identifier,
    name: epub.metaData.title,
    filePath: path.basename(epubFilepath),
    pageCount: epub.spine.length,
    faceB64: coverImage ? Buffer.from(coverImage).toString('base64') : '',
  });
}

writeFileSync(
  path.join(bookDir, 'index.json'),
  JSON.stringify(books, undefined, 2)
);
