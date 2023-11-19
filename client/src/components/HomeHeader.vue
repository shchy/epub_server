<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  modelValue: string
}>()
const emit = defineEmits(['update:modelValue'])

const searchWord = ref(props.modelValue)

watch(searchWord, () => {
  emit('update:modelValue', searchWord.value)
})
</script>

<template>
  <header>
    <div class="wrapper">
      <input type="text" v-model="searchWord" />
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
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
input {
  font-size: x-large;
}
</style>
