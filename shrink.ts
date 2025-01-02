import * as fflate from 'fflate'
import sharp from 'sharp'
import fs from 'fs'
import path from 'path'

const repack = async (filePath: string) => {
  const file = await fs.readFileSync(filePath)
  const unziped = fflate.unzipSync(file)

  const imgFiles = Object.keys(unziped).filter((x) => x.endsWith('.png'))
  for (const { imgFilePath, index } of imgFiles.map((imgFilePath, index) => ({
    imgFilePath,
    index,
  }))) {
    const bytes = unziped[imgFilePath]
    const edited = await sharp(bytes)
      .png({
        adaptiveFiltering: true,
        compressionLevel: 9,
        quality: 100,
      })
      .toBuffer()
    unziped[imgFilePath] = new Uint8Array(edited)
    console.log(
      `${index + 1}/${imgFiles.length}\t${imgFilePath}\t${bytes.length} -> ${edited.length}(${(edited.length / bytes.length).toFixed(2)})`,
    )
  }

  const zipped = fflate.zipSync(unziped)
  const { dir, name, ext } = path.parse(filePath)
  fs.writeFileSync(path.join(dir, `${name}${ext}`), zipped)
}

const run = async () => {
  const rootDir = process.argv.slice(2)[0]
  if (!rootDir) return

  for (const filePath of fs.readdirSync(rootDir)) {
    if (!path.extname(filePath).endsWith('epub')) {
      continue
    }

    repack(path.join(rootDir, filePath))
    break
  }
}
run()
