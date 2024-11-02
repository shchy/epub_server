import axios, { type AxiosInstance } from 'axios'
import type { Book, BookInfo, SeriesInfo } from './models'

const apiService = (baseURL: string) => {
  const getClient = (): AxiosInstance => {
    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
    const client = axios.create({
      baseURL: baseURL,
      withCredentials: true,
      headers: headers
    })
    client.interceptors.response.use(
      (res) => res,
      (error) => {
        if (error.response?.status === 401) {
          // todo logout
        }
        return Promise.reject(error.response)
      }
    )
    return client
  }

  const getBooks = (seriesId: string): Promise<BookInfo[]> => {
    return getClient()
      .get('/api/books', {
        params: {
          seriesid: seriesId
        }
      })
      .then((res) => res.data)
  }
  const getBook = (id: string): Promise<Book> => {
    return getClient()
      .get(`/api/book/${id}`)
      .then((res) => res.data)
  }
  const getBookContent = (id: string, href: string): Promise<string> => {
    return getClient()
      .get(`/api/book/${id}/${href}`)
      .then((res) => res.data)
  }
  const getSeries = (): Promise<SeriesInfo[]> => {
    return getClient()
      .get('/api/series')
      .then((res) => res.data)
  }

  return {
    getBooks,
    getBook,
    getBookContent,
    getSeries
  }
}

export default apiService
