<script setup lang="ts">
import { useAPI } from '@/services/api.inject';
import HomeHeader from '../components/HomeHeader.vue'

const api = useAPI()

const test = async ()=>{
  const books = await api.getBooks()
  console.log('books', books)
}
</script>

<template>
  <HomeHeader></HomeHeader>
  <main>
    <button @click="test">test</button>
  </main>
</template>
