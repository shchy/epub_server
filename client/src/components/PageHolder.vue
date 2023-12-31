<script setup lang="ts">
import { onMounted, ref } from 'vue'

defineProps<{
  bookId: string
  pageHref: string
}>()
const holder = ref<HTMLDivElement>()
const frame = ref<HTMLIFrameElement>()

const updateScale = () => {
  const innerDoc = frame.value?.contentDocument
  if (!holder.value || !holder.value.parentElement || !frame.value || !innerDoc || !innerDoc.body) {
    return
  }

  const maxSize = {
    w: window.innerWidth,
    h: window.innerHeight
  }
  const holderSize = {
    w: holder.value.parentElement.scrollWidth,
    h: holder.value.parentElement.scrollHeight
  }

  if (
    holderSize.w == 0 ||
    holderSize.h == 0 ||
    maxSize.w < holderSize.w ||
    maxSize.h < holderSize.h
  ) {
    holderSize.w = maxSize.w
    holderSize.h = maxSize.h
  }
  const innerSize = {
    w: innerDoc.body.scrollWidth,
    h: innerDoc.body.scrollHeight
  }

  const viewport = innerDoc.head.querySelector('meta[name="viewport"]')
  if (viewport) {
    const viewportContent = viewport?.attributes.getNamedItem('content')
    const viewportSize = JSON.parse(
      `{${viewportContent?.value
        .replace(new RegExp('=', 'g'), ':')
        .replace('width', '"w"')
        .replace('height', '"h"')}}`
    )
    innerSize.w = viewportSize.w
    innerSize.h = viewportSize.h
  }
  let aspectR = innerSize.w / innerSize.h

  // 縦と横どちらに合わせるか
  const wr = holderSize.w / innerSize.w
  const hr = holderSize.h / innerSize.h
  const isFitH = 1 - wr <= 1 - hr

  if (isFitH) {
    holder.value.style.width = `${holderSize.h * aspectR}px`
    holder.value.style.height = `${holderSize.h}px`
  } else {
    holder.value.style.width = `${holderSize.w}px`
    holder.value.style.height = `${holderSize.w / aspectR}px`
  }
  frame.value.style.width = holder.value.style.width
  frame.value.style.height = holder.value.style.height

  const r = isFitH ? holderSize.h / innerSize.h : holderSize.w / innerSize.w
  const style = innerDoc.body.style
  style.width = `${innerSize.w * r}px`
  style.height = `${innerSize.h * r}px`
  style.transform = `scale(${r})`
  style.transformOrigin = 'top left'
  style.overflow = 'hidden'
}

const resizeObserver = new ResizeObserver(() => {
  updateScale()
})
const isLoaded = ref(false)
onMounted(async () => {
  if (frame.value) {
    frame.value.addEventListener('load', () => {
      updateScale()
      frame.value?.contentDocument?.addEventListener('click', () => {
        holder.value?.click()
      })

      isLoaded.value = true
    })
  }
  if (holder.value && holder.value.parentElement) {
    resizeObserver.observe(holder.value.parentElement)
  }
})
</script>

<template>
  <div ref="holder" class="holder" v-show="isLoaded">
    <iframe
      ref="frame"
      :src="`/api/book/${bookId}/${pageHref}`"
      frameborder="0"
      allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
      allowfullscreen
    >
    </iframe>
  </div>
</template>

<style scoped>
.holder {
  /* width: 100%; */
  /* height: 100%; */
}
.holder iframe {
  /* width: 100%;
  height: 100%; */
}
</style>
