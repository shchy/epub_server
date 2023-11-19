<script setup lang="ts">
import { useAPI } from '@/services/inject'
import HomeHeader from '../components/HomeHeader.vue'
import BookFace from '../components/BookFace.vue'
import { onMounted, ref } from 'vue'
import type { BookInfo } from '@/services/models'

const api = useAPI()
const books = ref<BookInfo[]>([])

onMounted(async () => {
  const xs = await api.getBooks()
  books.value = xs
})
</script>

<template>
  <HomeHeader></HomeHeader>
  <main v-if="books">
    <div class="shelf">
      <BookFace
        v-for="book in books.slice(0, 20)"
        :key="book.id"
        class="face"
        :book-id="book.id"
      ></BookFace>
    </div>
  </main>
</template>

<style scoped>
main {
  height: 100%;
  width: 100%;
}
.shelf {
  height: 100%;
  width: 80%;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 1%;
  margin: auto;
}
.face {
  min-width: 19%;
  max-width: 19%;
  min-height: 25%;
  max-height: 25%;
}
</style>
