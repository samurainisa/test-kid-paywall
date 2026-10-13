<template>
  <div v-for="(width, index) in [88, 64]" :key="index" class="skeleton-card" aria-hidden="true">
    <img src="/images/paywall/radio-skeleton.svg" width="24" height="24" alt="">
    <span class="skeleton-title" :style="{ width: `${width}px` }" />
    <span class="skeleton-prices"><span class="skeleton-price" /><span class="skeleton-caption" /></span>
  </div>
</template>
<style scoped>
.skeleton-card { position: relative; display: flex; align-items: center; gap: 16px; min-height: 96px; padding: 16px; border-radius: 20px; background: var(--white); }
.skeleton-card::before { content: ''; position: absolute; inset: 0; border: 1px solid var(--border); border-radius: inherit; }
.skeleton-card img { flex: 0 0 24px; }
.skeleton-title, .skeleton-price, .skeleton-caption { display: block; background: var(--skeleton); border-radius: 6px; }
.skeleton-title { height: 16px; max-width: 100%; }
.skeleton-prices { display: flex; flex: 0 0 88px; margin-left: auto; flex-direction: column; align-items: flex-end; gap: 8px; }
.skeleton-price { width: 88px; height: 24px; }
.skeleton-caption { width: 72px; height: 12px; }
</style>
