<script setup lang="ts">
import type { Offer, OfferId } from '#shared/types/paywall'
import { formatRubles, offerCaption } from '#shared/utils/price'
defineProps<{ offer: Offer; selected: boolean; disabled: boolean }>()
const emit = defineEmits<{ select: [id: OfferId] }>()
</script>
<template>
  <label class="offer-card" :class="{ selected, disabled }" :data-offer="offer.id">
    <input class="visually-hidden" type="radio" name="offer" :value="offer.id" :checked="selected" :disabled="disabled" @change="emit('select', offer.id)">
    <span class="indicator" aria-hidden="true">
      <img v-if="selected" src="/images/paywall/radio-selected.svg" width="24" height="24" alt="">
    </span>
    <span class="offer-title">{{ offer.title }}</span>
    <span class="offer-price">
      <span class="price">{{ formatRubles(offer.priceMinor) }}</span>
      <span class="caption">{{ offerCaption(offer) }}</span>
    </span>
    <span v-if="offer.recommended" class="badge">Выгоднее</span>
  </label>
</template>
<style scoped>
.offer-card { position: relative; display: flex; align-items: center; gap: 16px; width: 100%; min-height: 96px; padding: 16px; border-radius: 20px; background: var(--white); cursor: pointer; }
.offer-card::before { content: ''; position: absolute; inset: 0; border: 1px solid var(--border); border-radius: inherit; pointer-events: none; }
.offer-card.selected { background: var(--selected); }
.offer-card.selected::before { border: 2px solid var(--primary); }
.offer-card:has(input:focus-visible) { outline: 3px solid var(--primary); outline-offset: 4px; }
.disabled { cursor: default; }
.indicator { flex: 0 0 24px; height: 24px; background: var(--white); border: 2px solid var(--border); border-radius: 50%; }
.selected .indicator { border: 0; background: transparent; }
.offer-title { flex: 1; min-width: 0; overflow-wrap: anywhere; font-size: 17px; font-weight: 600; line-height: 21px; }
.offer-price { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; flex-shrink: 0; white-space: nowrap; }
.price { font-size: 24px; line-height: 29px; font-weight: 700; }
.caption { font-size: 13px; line-height: 20px; color: var(--muted); }
.badge { position: absolute; right: 16px; top: -12px; display: flex; align-items: center; justify-content: center; min-width: 84px; width: max-content; min-height: 24px; padding: 0 12px; border-radius: 100px; background: var(--badge); font-size: 12px; line-height: 15px; font-weight: 700; }
</style>
