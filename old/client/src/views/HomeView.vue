<script setup lang="ts">
import { useAPI } from '@/services/inject'
import HomeHeader from '../components/HomeHeader.vue'
import SeriesList from '../components/SeriesList.vue'

import { onMounted, ref } from 'vue'
import type { SeriesInfo } from '@/services/models'

const api = useAPI()
const series = ref<SeriesInfo[]>([])
const searchWord = ref('')

onMounted(async () => {
  const xs = await api.getSeries()
  series.value = xs
})
</script>

<template>
  <main v-if="series">
    <HomeHeader class="header" v-model="searchWord"></HomeHeader>
    <SeriesList :series="series" :search-word="searchWord"></SeriesList>
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
