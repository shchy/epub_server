<script setup lang="ts" generic="T extends any">
import { nextTick, onMounted, ref, watch, type Ref } from 'vue'
import { detectIdel } from './idle'

const props = defineProps<{
  list: Array<T>
  pageSize: number
}>()

const displayedList = ref<Array<T>>([]) as Ref<Array<T>>
const load = () => {
  if (props.list.length <= displayedList.value.length) return
  const startIndex = displayedList.value.length
  const endIndex = displayedList.value.length + props.pageSize
  const next = props.list.slice(startIndex, endIndex)
  displayedList.value.push(...next)
}

const sleep = async (milliseconds: number = 1): Promise<void> => {
  return new Promise((resolve) =>
    setTimeout(() => {
      resolve()
    }, milliseconds)
  )
}

const idle = detectIdel()
const lastOne = ref()
const io = new IntersectionObserver(async (xs) => {
  if (!lastOne.value) return
  if (!xs[0].isIntersecting) return

  io.disconnect()
  load()
  do {
    await sleep(100)
    await nextTick()
  } while (!idle.isIdle())
  io.observe(lastOne.value)
})

onMounted(() => {
  io.observe(lastOne.value)
})

watch(props, () => {
  displayedList.value = []
  load()
})
</script>

<template>
  <div class="list">
    <slot v-for="item in displayedList" :item="item"></slot>
    <div ref="lastOne"></div>
  </div>
</template>

<style scoped>
.list {
  height: 100%;
  width: 100%;
}
</style>
