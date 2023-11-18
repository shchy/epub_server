import { computed, watch, type ComputedGetter, ref } from 'vue'

export const asyncComputed = <T, U>(
  getter: ComputedGetter<T>,
  asyncGetter: (v: T) => Promise<U>
) => {
  const value = ref<U>()
  const native = computed(getter)
  watch(native, async (v) => {
    value.value = await asyncGetter(v)
  })
  asyncGetter(native.value).then((v) => (value.value = v))

  return value
}
