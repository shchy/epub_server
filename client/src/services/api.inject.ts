import { inject, type InjectionKey } from 'vue'
import apiService from './api'

export default apiService
export type APIService = ReturnType<typeof apiService>
export const apiServiceKey: InjectionKey<APIService> = Symbol('APIService')
export const useAPI = () => {
  const service = inject(apiServiceKey)
  if (!service) {
    throw new Error(`${apiServiceKey} is not provided`)
  }
  return service
}
