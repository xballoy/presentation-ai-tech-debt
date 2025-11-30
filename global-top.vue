<template>
  <a
    v-if="isProduction"
    :href="otherLangUrl"
    class="absolute top-4 right-4 z-50 px-2 py-1 text-sm rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
  >
    {{ otherLangLabel }}
  </a>
</template>

<script setup>
import { computed } from 'vue'
import { useSlideContext } from '@slidev/client'

const { $slidev } = useSlideContext()

const base = computed(() => $slidev.configs.base || '/')
const isProduction = computed(() => base.value !== '/')
const isFr = computed(() => base.value.includes('/fr'))

const baseRoot = computed(() => base.value.replace(/\/(en|fr)\/$/, '/'))

const otherLangUrl = computed(() => `${baseRoot.value}${isFr.value ? 'en' : 'fr'}/`)
const otherLangLabel = computed(() => (isFr.value ? 'EN' : 'FR'))
</script>
