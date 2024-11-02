<script setup lang="ts">
import { onMounted, computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAPI, useStore } from '@/services/inject'
import PageHolder from '@/components/PageHolder.vue'
import { asyncComputed } from '@/components/asyncComputed'
import { resizeComputed } from '@/components/ResizeComputed'
import { swipeGesture } from '@/components/swipe'

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
  store.saveBookmark(book.value?.head.id, currentPage.value)
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

const isShowMenu = ref(false)
const toggleShowMenu = () => {
  isShowMenu.value = !isShowMenu.value
}
const back = () => {
  router.back()
}

onMounted(() => {
  if (pageviewer.value) {
    pageviewer.value.focus()
    const swipe = swipeGesture(pageviewer.value)
    swipe.register('left', toRight)
    swipe.register('right', toLeft)
  }
})
</script>

<template>
  <main>
    <div class="book-menu" v-show="isShowMenu">
      <a @click.prevent="back">戻る</a>
    </div>
    <div
      ref="pageviewer"
      class="pageviewer"
      tabindex="-1"
      @keydown.left="toLeft"
      @keydown.right="toRight"
    >
      <div v-if="book" class="page">
        <PageHolder
          v-for="pageIndex in cachePages"
          :key="pageIndex"
          :book-id="book.head.id"
          :page-href="book.pages[pageIndex]"
          :class="{
            'is-not-show': !(
              currentPage <= pageIndex && pageIndex < currentPage + (isLandscape ? 2 : 1)
            )
          }"
        ></PageHolder>
      </div>
      <div
        :class="{ 'is-showmenu': isShowMenu }"
        class="overlay-lb"
        @click="isShowMenu ? toggleShowMenu() : toLeft()"
      ></div>
      <div :class="{ 'is-showmenu': isShowMenu }" class="overlay-lt" @click="toggleShowMenu"></div>
      <div
        :class="{ 'is-showmenu': isShowMenu }"
        class="overlay-center"
        @click="toggleShowMenu"
      ></div>
      <div :class="{ 'is-showmenu': isShowMenu }" class="overlay-rt" @click="toggleShowMenu"></div>
      <div
        :class="{ 'is-showmenu': isShowMenu }"
        class="overlay-rb"
        @click="isShowMenu ? toggleShowMenu() : toRight()"
      ></div>
    </div>
    <div class="seek" v-show="isShowMenu">{{ currentPage + 1 }} / {{ book?.pages.length }}</div>
  </main>
</template>

<style>
body {
  min-height: auto !important;
}
</style>

<style scoped>
main {
  height: auto;
  width: 100vw;
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto 1fr auto;
}
.book-menu {
  grid-row: 1;
  grid-column: 1;
  line-height: 1.5rem;
  padding: 1rem;
  padding-right: 1rem;
  z-index: 3;
  text-align: end;
  background-color: white;
}
.seek {
  grid-row: 3;
  grid-column: 1;
  line-height: 1.5rem;
  padding: 1rem;
  z-index: 3;
  text-align: center;
  background-color: white;
}
.pageviewer {
  grid-row: 1/4;
  grid-column: 1;
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: 1fr 20% 1fr;
  grid-template-rows: 30% 1fr;
  z-index: 0;
  outline: none;
}
.overlay-lt {
  grid-row: 1;
  grid-column: 1;
  z-index: 1;
}
.overlay-lb {
  grid-row: 2;
  grid-column: 1;
  z-index: 1;
}
.overlay-center {
  grid-row: 1/3;
  grid-column: 2;
  z-index: 1;
}
.overlay-rt {
  grid-row: 1;
  grid-column: 3;
  z-index: 1;
}
.overlay-rb {
  grid-row: 2;
  grid-column: 3;
  z-index: 1;
}

.is-showmenu {
  background-color: black;
  opacity: 0.5;
}
.page {
  grid-row: 1/3;
  grid-column: 1/4;
  position: relative;
  overflow: hidden;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row-reverse;
  justify-content: center;
}
.is-not-show {
  display: none;
}
</style>
