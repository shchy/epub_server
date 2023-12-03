<script setup lang="ts">
import { useAPI } from '@/services/inject'

import { asyncComputed } from './asyncComputed'
import PageHolder from '@/components/PageHolder.vue'

const props = defineProps<{
  bookId: string
}>()
const emit = defineEmits(['click'])
const api = useAPI()
const book = asyncComputed(
  () => props.bookId,
  (id) => api.getBook(id)
)
const openBook = () => {
  if (!book.value) return
  emit('click', props.bookId)
}
</script>

<template>
  <div class="thumbnail" @click.prevent="openBook">
    <PageHolder v-if="book" :book-id="book.head.id" :page-href="book.pages[0]"></PageHolder>
  </div>
</template>

<style scoped>
.thumbnail {
  min-width: 100%;
  max-width: 100%;
  min-height: 100%;
  max-height: 100%;
}
</style>
