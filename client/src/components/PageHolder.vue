<script setup lang="ts">
import { onMounted, watch, ref } from 'vue'

const props = defineProps<{
  bookId: string
  pageHref: string
}>()
const holder = ref<HTMLDivElement>()
const frame = ref<HTMLIFrameElement>()

watch(props, () => {
  updateScale()
})

const updateScale = () => {
  const innerDoc = frame.value?.contentDocument
  if (!holder.value || !innerDoc || !innerDoc.body) {
    return
  }

  const frameSize = {
    w: holder.value.scrollWidth,
    h: holder.value.scrollHeight
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
  holder.value.style.width = `${frameSize.h * aspectR}px`

  const r = frameSize.h / innerSize.h
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
onMounted(async () => {
  if (frame.value) {
    frame.value.addEventListener('load', () => {
      updateScale()
    })
  }
  if (holder.value) {
    resizeObserver.observe(holder.value)
  }
})
</script>

<template>
  <div ref="holder" class="holder">
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
  height: 100%;
}
.holder iframe {
  width: 100%;
  height: 100%;
}
</style>
