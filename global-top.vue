<template>
  <a
    v-if="showSwitcher"
    :href="otherLangUrl"
    class="absolute top-4 right-4 z-50 px-2 py-1 text-sm rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
  >
    {{ otherLangLabel }}
  </a>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'

const pathname = ref('')
const showSwitcher = ref(false)

onMounted(() => {
  pathname.value = window.location.pathname
  showSwitcher.value = pathname.value.includes('/fr/') || pathname.value.includes('/en/')
})

const isFr = computed(() => pathname.value.includes('/fr/'))

const otherLangUrl = computed(() => {
  if (isFr.value) {
    return pathname.value.replace('/fr/', '/en/')
  }
  return pathname.value.replace('/en/', '/fr/')
})

const otherLangLabel = computed(() => (isFr.value ? 'EN' : 'FR'))
</script>
