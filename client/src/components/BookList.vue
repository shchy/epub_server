<script setup lang="ts">
import type { BookInfo } from '@/services/models'
import { computed } from 'vue'
import BookFace from '../components/BookFace.vue'
import IntersectionList from '@/components/IntersectionList.vue'

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
</script>

<template>
  <IntersectionList class="shelf" :list="filteredList" :page-size="15" v-slot="{ item }">
    <BookFace class="face" :book-id="item.id"></BookFace>
  </IntersectionList>
</template>

<style scoped>
.shelf {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-evenly;
}
.face {
  padding-top: 2%;
  min-width: 30%;
  max-width: 30%;
  min-height: calc(100vw * 0.3 / 0.7);
  max-height: calc(100vw * 0.3 / 0.7);
}

@media (min-width: 1024px) {
  .face {
    min-width: 19%;
    max-width: 19%;
    min-height: calc(100vw * 0.19 / 0.7);
    max-height: calc(100vw * 0.19 / 0.7);
  }
}
</style>
