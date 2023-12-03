<script setup lang="ts">
import { useAPI } from '@/services/inject'
import HomeHeader from '../components/HomeHeader.vue'
import BookList from '../components/BookList.vue'

import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { asyncComputed } from '@/components/asyncComputed'

const route = useRoute()
const seriesId = computed(() => route.params.id as string)

const api = useAPI()
const books = asyncComputed(
  () => api.getBooks(seriesId.value),
  async (v) => await v
)
const searchWord = ref('')
</script>

<template>
  <main v-if="books">
    <HomeHeader class="header" v-model="searchWord"></HomeHeader>
    <BookList :books="books" :search-word="searchWord"></BookList>
  </main>
</template>

<style scoped>
main {
  height: 100vh;
  width: 100%;
}
.header {
  position: sticky;
  top: 0;
  height: 4rem;
  background-color: #333333;
  color: white;
}
</style>
