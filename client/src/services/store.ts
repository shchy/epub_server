export interface Bookmark {
  id: string
  index: number
}

const storeService = () => {
  const saveBookmark = (v: Bookmark) => {
    localStorage.setItem(v.id, JSON.stringify(v))
  }

  const loadBookmark = (id: string) => {
    const v = localStorage.getItem(id)
    if (!v) return
    return JSON.parse(v) as Bookmark
  }

  return {
    saveBookmark,
    loadBookmark
  }
}
export default storeService
