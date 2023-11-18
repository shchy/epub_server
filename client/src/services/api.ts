import axios, { type AxiosInstance } from 'axios'
import type { Book, BookInfo } from './models'

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

  const getBooks = (): Promise<BookInfo[]> => {
    return getClient()
      .get('/api/books')
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

  return {
    getBooks,
    getBook,
    getBookContent
  }
}

export default apiService
