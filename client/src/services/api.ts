import axios, { type AxiosInstance } from 'axios'
import type { BookInfo } from './models'

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

  return {
    getBooks
  }
}

export default apiService
