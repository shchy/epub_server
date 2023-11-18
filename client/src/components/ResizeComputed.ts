import { watch, ref, type Ref, computed } from 'vue'

export const resizeComputed = <T>(
  element: Ref<HTMLElement | undefined>,
  getter: (elm: HTMLElement) => T
) => {
  const resizeTrigger = ref(0)
  const native = computed(() => {
    if (!element.value) return
    resizeTrigger.value
    return getter(element.value)
  })

  const resizeObserver = new ResizeObserver(() => resizeTrigger.value++)
  watch(element, () => {
    if (!element.value) return
    resizeObserver.observe(element.value)
  })
  return native
}
