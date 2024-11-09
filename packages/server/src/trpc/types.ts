export interface Book {
  id: string
  name: string
  thumbnailPath?: string
  pageCount: number
  filePath: string
  isCached?: boolean
  addDate?: number
}
