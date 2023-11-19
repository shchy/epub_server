<script setup lang="ts">
import { useAPI } from '@/services/inject'
import { useRouter } from 'vue-router'
import { asyncComputed } from './asyncComputed'
import PageHolder from '@/components/PageHolder.vue'
import { routeNames } from '@/router'

const props = defineProps<{
  bookId: string
}>()
const api = useAPI()
const router = useRouter()
const book = asyncComputed(
  () => props.bookId,
  (id) => api.getBook(id)
)
const openBook = () => {
  if (!book.value) return
  router.push({ name: routeNames.Book, params: { id: book.value.head.id } })
}
</script>

<template>
  <div class="face-card">
    <div class="thumbnail" @click.prevent="openBook">
      <PageHolder v-if="book" :book-id="book.head.id" :page-href="book.pages[0]"></PageHolder>
    </div>
    <p class="title">{{ book?.head.title }}</p>
  </div>
</template>

<style scoped>
.face-card {
  height: 100%;
  width: 100%;
  display: grid;
  grid-template-columns: auto;
  grid-template-rows: 1fr auto;
  gap: 0.5em 1em;
}
.thumbnail {
  grid-row: 1;
  grid-column: 1;
}
.title {
  grid-row: 2;
  grid-column: 1;
}
</style>
