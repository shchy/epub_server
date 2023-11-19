<script setup lang="ts">
import { useAPI } from '@/services/inject'
import HomeHeader from '../components/HomeHeader.vue'
import BookFace from '../components/BookFace.vue'
import { computed, onMounted, ref, watch } from 'vue'
import type { BookInfo } from '@/services/models'

const api = useAPI()
const books = ref<BookInfo[]>([])
const searchWord = ref('')
const filteredList = computed(() => {
  if (searchWord.value == '') return books.value
  const xs = books.value.filter((x) =>
    x.title.toLocaleLowerCase().includes(searchWord.value.toLocaleLowerCase())
  )
  return xs
})

const pageSize = 20
const neighborPageSize = 2
const pageCount = computed(() => {
  const a = filteredList.value.length / pageSize
  const b = Math.ceil(a)
  return b
})
const currentPageIndex = ref(0)
const neighborPages = computed(() => {
  const size = neighborPageSize * 2 + 1
  // 表示範囲に満たなければ全件返す
  if (pageCount.value < size) {
    return [...new Array(pageCount.value).keys()]
  }

  let s = 0
  // 現在位置を真ん中にしたとき終端が表示範囲まで届かないときは終端から逆算
  const preLast = currentPageIndex.value + neighborPageSize
  if (pageCount.value <= preLast) {
    const e = pageCount.value
    s = e - size
  } else {
    s = fix(currentPageIndex.value - neighborPageSize)
  }
  const xs = [...new Array(size).keys()].map((x) => s + x)
  return xs
})
const fix = (n: number) => {
  if (pageCount.value <= n) {
    n = pageCount.value - 1
  }
  if (n < 0) {
    n = 0
  }
  return n
}

const toPage = (index: number) => {
  currentPageIndex.value = fix(index)
}

onMounted(async () => {
  const xs = await api.getBooks()
  books.value = xs
})
</script>

<template>
  <main v-if="books">
    <HomeHeader class="header" v-model="searchWord"></HomeHeader>
    <div class="pager">
      <span><a @click.prevent="toPage(0)">&lt;&lt;</a></span>
      <span v-for="i in neighborPages" :key="i">
        <a v-if="i != currentPageIndex" @click.prevent="toPage(i)">{{ i + 1 }}</a>
        <template v-if="i == currentPageIndex">{{ i + 1 }}</template>
      </span>
      <span><a @click.prevent="toPage(pageCount)">&gt;&gt;</a></span>
    </div>
    <div class="shelf">
      <BookFace
        v-for="book in filteredList.slice(
          currentPageIndex * pageSize,
          currentPageIndex * pageSize + pageSize
        )"
        :key="book.id"
        class="face"
        :book-id="book.id"
      ></BookFace>
    </div>
    <div class="pager">
      <span><a @click.prevent="toPage(0)">&lt;&lt;</a></span>
      <span v-for="i in neighborPages" :key="i">
        <a v-if="i != currentPageIndex" @click.prevent="toPage(i)">{{ i + 1 }}</a>
        <template v-if="i == currentPageIndex">{{ i + 1 }}</template>
      </span>
      <span><a @click.prevent="toPage(pageCount)">&gt;&gt;</a></span>
    </div>
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
.shelf {
  height: calc(100% - 8rem);
  width: 90%;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  margin: 1rem auto;
}
.pager {
  height: 4rem;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 0 1em;
}
.face {
  min-width: 19%;
  max-width: 19%;
  min-height: 25%;
  max-height: 25%;
}

@media (max-width: 1024px) {
  .shelf {
  }
  .face {
    min-width: 100%;
    max-width: 100%;
    min-height: 60%;
    max-height: 60%;
  }
}
</style>
