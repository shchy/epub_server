<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps<{
  modelValue: string
}>()
const emit = defineEmits(['update:modelValue'])
const router = useRouter()
const searchWord = ref(props.modelValue)
watch(searchWord, () => {
  emit('update:modelValue', searchWord.value)
})

const back = () => {
  router.back()
}
const canBack = () => {
  return !!window.history.state.back
}
</script>

<template>
  <header>
    <div class="wrapper">
      <a v-if="canBack()" class="left" href="#" @click.prevent="back">&lt;</a>
      <input class="center" type="text" v-model="searchWord" />
    </div>
  </header>
</template>

<style scoped>
header {
  line-height: 1.5;
}

.wrapper {
  height: 100%;
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 6fr 1fr;
  align-items: center;
  justify-content: center;
}
.wrapper > * {
  grid-row: 1;
}
.left {
  grid-column: 1;
  text-align: center;
}
.center {
  grid-column: 2;
}

input {
  font-size: x-large;
}
</style>
