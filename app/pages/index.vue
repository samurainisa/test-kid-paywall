<script setup lang="ts">
const { offers, offersStatus, offersError, offersLoading, selectedOfferId, operation, busy, buttonLabel,
  message, messageIsError, purchaseResult, selectOffer, primaryAction, restore } = usePaywall()
function close() { if (!busy.value) return navigateTo('/game') }
</script>
<template>
  <main class="paywall">
    <div class="close-panel">
      <button type="button" class="close-button" aria-label="Закрыть экран покупки" :disabled="busy" @click="close">
        <img src="/images/paywall/close.svg" width="44" height="44" alt="" aria-hidden="true">
      </button>
    </div>
    <PaywallHero />
    <template v-if="!purchaseResult">
      <section class="description" aria-labelledby="paywall-title">
        <h1 id="paywall-title">Открой весь мир приключений</h1>
        <p>Получи все уровни, персонажей и игровые задания без ограничений</p>
      </section>
      <div class="offers" role="group" aria-label="Выберите тариф" :aria-busy="offersStatus === 'pending' || offersLoading">
        <PaywallOffersSkeleton v-if="!offers.length" />
        <PaywallOfferCard v-for="offer in offers" v-else :key="offer.id" :offer="offer" :selected="selectedOfferId === offer.id" :disabled="busy" @select="selectOffer" />
      </div>
      <div class="message-area">
        <PaywallInlineMessage v-if="message" :text="message" :error="messageIsError" />
      </div>
      <div class="actions">
        <PaywallPurchaseButton :label="buttonLabel" :disabled="busy || (offersLoading && !offersError)" :busy="busy" :loading-offers="offersLoading" @activate="primaryAction" />
        <button type="button" class="restore-button" :disabled="busy" @click="restore">Восстановить покупки</button>
      </div>
    </template>
    <template v-else>
      <PaywallPurchaseSuccess />
      <div class="actions">
        <PaywallPurchaseButton label="Начать играть" @activate="navigateTo('/game')" />
      </div>
    </template>
    <footer class="disclaimer"><p>Тестовая покупка без списания денежных средств</p></footer>
  </main>
</template>
<style scoped>
.paywall { display: flex; flex-direction: column; width: 100%; max-width: 430px; margin-inline: auto; min-height: max(844px, 100dvh); padding: calc(16px + env(safe-area-inset-top, 0px)) 16px calc(16px + env(safe-area-inset-bottom, 0px)); }
.close-panel { display: flex; justify-content: flex-end; flex: 0 0 44px; }
.close-button { width: 44px; height: 44px; }
.description { display: flex; flex-direction: column; gap: 12px; padding-bottom: 24px; text-align: center; }
.description h1 { font-size: 28px; line-height: 34px; font-weight: 700; letter-spacing: -.6px; }
.description p { color: var(--muted); font-size: 15px; line-height: 22px; }
.offers { display: flex; flex-direction: column; gap: 16px; }
.message-area { display: flex; flex-direction: column; justify-content: flex-end; min-height: 72px; padding-block: 8px; flex: 1; }
.actions { display: flex; flex-direction: column; gap: 8px; min-height: 108px; flex-shrink: 0; }
.restore-button { width: 100%; min-height: 44px; font-size: 14px; line-height: 17px; font-weight: 500; color: var(--primary); }
.disclaimer { display: flex; align-items: center; justify-content: center; min-height: 88px; padding-inline: 24px; text-align: center; flex-shrink: 0; }
.disclaimer p { width: 100%; color: var(--muted); font-size: 12px; line-height: 18px; }
</style>
