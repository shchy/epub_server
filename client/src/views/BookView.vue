<script setup lang="ts">
import { onMounted, computed, watch, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAPI } from '@/services/api.inject'
import type { Book } from '@/services/models'
import PageHolder from '@/components/PageHolder.vue'
import { asyncComputed } from '@/components/asyncComputed'

const api = useAPI()
const route = useRoute()
const router = useRouter()

const book = asyncComputed(
  () => route.params.id as string,
  (id) => api.getBook(id)
)
const currentPage = ref(0)
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

const pageviewer = ref<HTMLDivElement>()
const resizeTrigger = ref(0)
const isLandscape = computed(() => {
  if (!pageviewer.value) {
    return false
  }
  resizeTrigger.value

  const h = pageviewer.value.scrollHeight
  const twoPageWidth = h * (1264 / 1680) * 2
  const isLand = twoPageWidth < pageviewer.value.scrollWidth
  return isLand && currentPage.value != 0
})
const resizeObserver = new ResizeObserver(() => resizeTrigger.value++)
onMounted(() => {
  if (!pageviewer.value) return
  resizeObserver.observe(pageviewer.value)
})

const toLeft = () => {
  toNext()
}

const toRight = () => {
  toPrev()
}
</script>

<template>
  <main>
    <div></div>
    <div ref="pageviewer" class="pageviewer">
      <div v-if="book" class="frame-wrapper">
        <PageHolder
          v-for="pageHref in book.pages.slice(
            currentPage,
            isLandscape ? currentPage + 2 : currentPage + 1
          )"
          :key="pageHref"
          :book-id="book.head.id"
          :page-href="pageHref"
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
