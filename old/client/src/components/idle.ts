import { ref } from 'vue'

export const detectIdel = () => {
  const lastWorking = ref(Date.now())
  const isIdle = () => {
    return Date.now() - lastWorking.value > 1000
  }

  const po = new PerformanceObserver((xs) => {
    lastWorking.value = Date.now()
  })
  po.observe({ entryTypes: ['resource'] })

  return {
    isIdle
  }
}
