<script setup lang="ts">
import { useAPI } from '@/services/inject'
import HomeHeader from '../components/HomeHeader.vue'
import BookList from '../components/BookList.vue'

import { onMounted, ref } from 'vue'
import type { BookInfo } from '@/services/models'

const api = useAPI()
const books = ref<BookInfo[]>([])
const searchWord = ref('')

onMounted(async () => {
  const xs = await api.getBooks()
  books.value = xs
})
</script>

<template>
  <main v-if="books">
    <HomeHeader class="header" v-model="searchWord"></HomeHeader>
    <BookList :books="books" :search-word="searchWord"></BookList>
  </main>
</template>

<style scoped>
main {
  height: 100%;
  width: 100%;
  overflow-y: auto;
}
.header {
  position: sticky;
  top: 0;
  height: 4rem;
  background-color: #333333;
  color: white;
}
</style>
