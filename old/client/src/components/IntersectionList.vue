<script setup lang="ts" generic="T extends any">
import { nextTick, onMounted, ref, watch, type Ref } from 'vue'
import { detectIdel } from './idle'

const props = defineProps<{
  list: Array<T>
  pageSize: number
}>()

const displayedList = ref<Array<T>>([]) as Ref<Array<T>>
const load = () => {
  if (props.list.length <= displayedList.value.length) return
  const startIndex = displayedList.value.length
  const endIndex = displayedList.value.length + props.pageSize
  const next = props.list.slice(startIndex, endIndex)
  displayedList.value.push(...next)
}

const sleep = async (milliseconds: number = 1): Promise<void> => {
  return new Promise((resolve) =>
    setTimeout(() => {
      resolve()
    }, milliseconds)
  )
}

const idle = detectIdel()
const lastOne = ref()
const io = new IntersectionObserver(async (xs) => {
  if (!lastOne.value) return
  if (!xs[0].isIntersecting) return

  io.disconnect()
  load()
  do {
    await sleep(100)
    await nextTick()
  } while (!idle.isIdle())
  io.observe(lastOne.value)
})

onMounted(() => {
  io.observe(lastOne.value)
})

watch(props, () => {
  displayedList.value = []
  load()
})
</script>

<template>
  <div class="list">
    <slot v-for="item in displayedList" :item="item"></slot>

    <div ref="lastOne" class="spinner-box">
      <div class="pulse-container">
        <div class="pulse-bubble pulse-bubble-1"></div>
        <div class="pulse-bubble pulse-bubble-2"></div>
        <div class="pulse-bubble pulse-bubble-3"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.list {
  height: 100%;
  width: 100%;
}
.spinner-box {
  width: 300px;
  height: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: transparent;
}

@keyframes pulse {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0.25;
    transform: scale(0.75);
  }
}
.pulse-container {
  width: 120px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pulse-bubble {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: #333333;
}

.pulse-bubble-1 {
  animation: pulse 0.4s ease 0s infinite alternate;
}
.pulse-bubble-2 {
  animation: pulse 0.4s ease 0.2s infinite alternate;
}
.pulse-bubble-3 {
  animation: pulse 0.4s ease 0.4s infinite alternate;
}
</style>
