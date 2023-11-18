<script setup lang="ts">
import { useAPI } from '@/services/inject'
import HomeHeader from '../components/HomeHeader.vue'
import { onMounted, ref } from 'vue'
import type { BookInfo } from '@/services/models'
import { useRouter } from 'vue-router'
import { routeNames } from '@/router'

const api = useAPI()
const router = useRouter()
const books = ref<BookInfo[]>([])

onMounted(async () => {
  const xs = await api.getBooks()
  books.value = xs
})

const openBook = (book: BookInfo) => {
  router.push({ name: routeNames.Book, params: { id: book.id } })
}
</script>

<template>
  <HomeHeader></HomeHeader>
  <main>
    <div v-for="book in books" :key="book.id">
      <a href="#" @click.prevent="openBook(book)">{{ book.title }}</a>
    </div>
  </main>
</template>
