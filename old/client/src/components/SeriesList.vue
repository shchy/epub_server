<script setup lang="ts">
import type { SeriesInfo } from '@/services/models'
import { computed } from 'vue'
import BookFace from '../components/BookFace.vue'
import IntersectionList from '@/components/IntersectionList.vue'
import { routeNames } from '@/router'
import { useRouter } from 'vue-router'
import { useStore } from '@/services/inject'
import type { Bookmark } from '@/services/store'

const props = defineProps<{
  searchWord: string
  series: SeriesInfo[]
}>()

const store = useStore()

const filteredList = computed(() => {
  let xs = props.series
  if (props.searchWord) {
    xs = props.series.filter((x) =>
      x.title.toLocaleLowerCase().includes(props.searchWord.toLocaleLowerCase())
    )
  }
  const sorted = xs.sort((a, b) => {
    const getLastTime = (series: SeriesInfo) => {
      const lastTime = series.books
        .map((book) => store.loadBookmark(book.id))
        .reduce((unix: number, b: Bookmark | undefined) => {
          if (!b) return unix
          const time = b.timestamp
          return Math.max(unix, time)
        }, -1)
      return lastTime
    }
    const alast = getLastTime(a)
    const blast = getLastTime(b)
    const descTime = blast - alast
    if (descTime != 0) {
      return descTime
    }
    return a.id > b.id ? 1 : -1
  })
  return sorted
})

const router = useRouter()
const openSeries = (seriesId: string) => {
  router.push({ name: routeNames.Series, params: { id: seriesId } })
}
</script>

<template>
  <IntersectionList class="shelf" :list="filteredList" :page-size="15" v-slot="{ item }">
    <div class="face-card">
      <BookFace
        class="face"
        :book-id="item.books.sort((a, b) => (a.id > b.id ? 1 : -1))[0].id"
        @click="openSeries(item.id)"
      ></BookFace>
      <p class="title">{{ item.title }}</p>
      <!-- <p class="author">{{ item.author }}</p> -->
    </div>
  </IntersectionList>
</template>

<style scoped>
.shelf {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.face-card {
  border: 1px solid #333333;
  border-radius: 6px;
  margin: 0.5em;
  padding: 0.5em;
  width: 80%;
  min-height: 250px;
  max-height: 250px;
  display: grid;
  grid-template-columns: auto 1fr;
  grid-template-rows: auto auto 1fr;
  gap: 1em;
}
.face {
  grid-row: 1/4;
  grid-column: 1;

  min-height: calc(250px - 1em);
  max-height: calc(250px - 1em);
  min-width: calc(250px * 0.7);
  max-width: calc(250px * 0.7);
}
</style>
