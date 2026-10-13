<script setup lang="ts">
defineProps<{ label: string; disabled?: boolean; busy?: boolean; loadingOffers?: boolean }>()
defineEmits<{ activate: [] }>()
</script>
<template>
  <button type="button" class="primary-button" :class="{ 'loading-offers': loadingOffers && !busy }" :disabled="disabled" :aria-busy="busy || loadingOffers" @click="$emit('activate')">
    <img v-if="busy" class="spinner" src="/images/paywall/spinner.svg" width="20" height="20" alt="" aria-hidden="true">
    <span>{{ label }}</span>
  </button>
</template>
<style scoped>
.loading-offers { background: var(--border); color: var(--disabled-text); }
.spinner { animation: spin .9s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) { .spinner { animation: none; } }
</style>
