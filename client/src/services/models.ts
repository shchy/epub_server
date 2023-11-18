export interface BookInfo {
  id: string
  title: string
}

export interface Book {
  head: BookInfo
  pages: string[]
}
