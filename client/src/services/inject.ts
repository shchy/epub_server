import { inject, type InjectionKey } from 'vue'
import apiService from './api'
import storeService from './store'

export type APIService = ReturnType<typeof apiService>
export const apiServiceKey: InjectionKey<APIService> = Symbol('APIService')
export const useAPI = () => {
  const service = inject(apiServiceKey)
  if (!service) {
    throw new Error(`${apiServiceKey} is not provided`)
  }
  return service
}

export type StoreService = ReturnType<typeof storeService>
export const storeServiceKey: InjectionKey<StoreService> = Symbol('StoreService')
export const useStore = () => {
  const service = inject(storeServiceKey)
  if (!service) {
    throw new Error(`${storeServiceKey} is not provided`)
  }
  return service
}
