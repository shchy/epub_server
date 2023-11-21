<script setup lang="ts">
import type { BookInfo } from '@/services/models'
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import BookFace from '../components/BookFace.vue'
import { detectIdel } from './idle'

const pageSize = 20
const props = defineProps<{
  searchWord: string
  books: BookInfo[]
}>()

const filteredList = computed(() => {
  if (props.searchWord == '') return props.books
  const xs = props.books.filter((x) =>
    x.title.toLocaleLowerCase().includes(props.searchWord.toLocaleLowerCase())
  )
  return xs
})

const displayedList = ref<BookInfo[]>([])
const load = () => {
  if (filteredList.value.length <= displayedList.value.length) return
  const next = filteredList.value.slice(
    displayedList.value.length,
    displayedList.value.length + pageSize
  )
  displayedList.value.push(...next)
}

watch(props, () => {
  displayedList.value = []
  load()
})

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
</script>

<template>
  <div class="list">
    <div class="shelf">
      <BookFace
        v-for="book in displayedList"
        :key="book.id"
        class="face"
        :book-id="book.id"
      ></BookFace>
      <div ref="lastOne"></div>
    </div>
  </div>
</template>

<style scoped>
.list {
  height: 100%;
  width: 100%;
}
.shelf {
  height: calc(100% - 8rem);
  width: 100%;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  margin: 1rem auto;
}
.face {
  min-width: 30%;
  max-width: 30%;
  min-height: calc(100vw * 0.3 / 0.7);
  max-height: calc(100vw * 0.3 / 0.7);
}

@media (min-width: 1024px) {
  .face {
    min-width: 20%;
    max-width: 20%;
    min-height: calc(100vw * 0.2 / 0.7);
    max-height: calc(100vw * 0.2 / 0.7);
  }
}
</style>
