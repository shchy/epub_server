import { idText } from 'typescript'

export interface Bookmark {
  id: string
  index: number
  timestamp: number
}

const storeService = () => {
  const saveBookmark = (bookId: string, index: number) => {
    const v: Bookmark = {
      id: bookId,
      index: index,
      timestamp: Math.floor(new Date().getTime() / 1000)
    }
    localStorage.setItem(v.id, JSON.stringify(v))
  }

  const loadBookmark = (id: string) => {
    const v = localStorage.getItem(id)
    if (!v) return
    const bookmark = JSON.parse(v) as Bookmark
    if (!bookmark.timestamp) {
      bookmark.timestamp = 0
    }
    return bookmark
  }

  return {
    saveBookmark,
    loadBookmark
  }
}
export default storeService
