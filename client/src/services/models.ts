export interface BookInfo {
  id: string
  title: string
}

export interface Book {
  head: BookInfo
  pages: string[]
}

export interface SeriesInfo {
  id: string
  title: string
  books: BookInfo[]
}
