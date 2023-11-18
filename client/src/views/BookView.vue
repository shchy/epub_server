<script setup lang="ts">
import { onMounted, computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAPI, useStore } from '@/services/inject'
import PageHolder from '@/components/PageHolder.vue'
import { asyncComputed } from '@/components/asyncComputed'
import { resizeComputed } from '@/components/ResizeComputed'

const pageCacheSize = 6

const api = useAPI()
const store = useStore()
const route = useRoute()
const router = useRouter()

const pageviewer = ref<HTMLDivElement>()
const isLandscape = resizeComputed(pageviewer, () => {
  if (!pageviewer.value) {
    return false
  }

  const h = pageviewer.value.scrollHeight
  const twoPageWidth = h * (1264 / 1680) * 2
  const isLand = twoPageWidth < pageviewer.value.scrollWidth
  return isLand && currentPage.value != 0
})

const book = asyncComputed(
  () => route.params.id as string,
  (id) => api.getBook(id)
)
watch(book, () => {
  if (!book.value) return
  const bookmark = store.loadBookmark(book.value.head.id)
  if (!bookmark) return
  currentPage.value = fixPage(bookmark.index)
})
const currentPage = ref(0)
watch(currentPage, () => {
  if (!book.value) return
  store.saveBookmark({ id: book.value?.head.id, index: currentPage.value })
})

const cachePages = computed(() => {
  const startIndex = fixPage(currentPage.value - pageCacheSize)
  const endIndex = fixPage(currentPage.value + pageCacheSize)
  const range = [...new Array(endIndex - startIndex).keys()].map((i) => startIndex + i)
  return range
})
const fixPage = (index: number) => {
  const pageLength = book.value?.pages.length ?? 0
  if (pageLength <= index) {
    index = pageLength - 1
  }
  if (index < 0) {
    index = 0
  }
  return index
}
const toNext = () => {
  const move = isLandscape.value ? 2 : 1
  const toIndex = fixPage(currentPage.value + move)
  currentPage.value = toIndex
}
const toPrev = () => {
  const move = isLandscape.value ? 2 : 1
  const toIndex = fixPage(currentPage.value - move)
  currentPage.value = toIndex
}

const toLeft = () => {
  toNext()
}

const toRight = () => {
  toPrev()
}

onMounted(() => {
  if (pageviewer.value) {
    pageviewer.value.focus()
  }
})
</script>

<template>
  <main>
    <div></div>
    <div
      ref="pageviewer"
      class="pageviewer"
      tabindex="-1"
      @keydown.left="toLeft"
      @keydown.right="toRight"
    >
      <div v-if="book" class="frame-wrapper">
        <PageHolder
          v-for="pageIndex in cachePages"
          :key="pageIndex"
          :book-id="book.head.id"
          :page-href="book.pages[pageIndex]"
          v-show="currentPage <= pageIndex && pageIndex < currentPage + (isLandscape ? 2 : 1)"
        ></PageHolder>
      </div>
      <div class="leftside" @click="toLeft"></div>
      <div class="rightside" @click="toRight"></div>
    </div>
    <div></div>
  </main>
</template>

<style scoped>
.pageviewer {
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: 50% 50%;
  z-index: 0;
  outline: none;
}
.leftside {
  grid-row: 1;
  grid-column: 1;
  z-index: 1;
}
.rightside {
  grid-row: 1;
  grid-column: 2;
  z-index: 1;
}
.frame-wrapper {
  grid-row: 1;
  grid-column: 1/3;
  position: relative;
  overflow: hidden;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row-reverse;
  justify-content: center;
}
</style>
