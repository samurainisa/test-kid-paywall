<script setup lang="ts">
defineProps<{ text: string; error: boolean }>()
</script>
<template>
  <div class="inline-message" :class="{ error }" :role="error ? 'alert' : 'status'">
    <span v-if="error" class="error-icon" aria-hidden="true">!</span>
    <p>{{ text }}</p>
  </div>
</template>
<style scoped>
.inline-message { display: flex; align-items: center; gap: 8px; min-height: 56px; padding: 8px 12px; border-radius: 16px; background: var(--selected); color: var(--muted); }
.error { background: var(--error-background); color: var(--error); }
.error-icon { display: flex; align-items: center; justify-content: center; flex: 0 0 20px; height: 20px; border-radius: 50%; background: var(--error); color: var(--white); font-size: 14px; line-height: 17px; font-weight: 700; }
p { flex: 1; font-size: 13px; line-height: 19px; }
</style>
