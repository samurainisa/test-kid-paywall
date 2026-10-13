<script setup lang="ts">
import type { PurchaseResponse, RestoreResponse } from '#shared/types/paywall'
const purchase = useState<PurchaseResponse | null>('paywall-purchase', () => null)
const loading = ref(!purchase.value)
const error = ref('')
async function checkAccess() {
  loading.value = true
  error.value = ''
  try {
    const result = await $fetch<RestoreResponse>('/api/restore', { method: 'POST', retry: 0 })
    purchase.value = result.purchase
  } catch { error.value = 'Не удалось проверить доступ. Попробуйте ещё раз' }
  finally { loading.value = false }
}
onMounted(() => { if (!purchase.value) void checkAccess() })
useHead({ title: 'Мир приключений — игра' })
</script>
<template>
  <main class="game">
    <PaywallHero />
    <h1>{{ loading ? 'Проверяем доступ…' : purchase ? 'Игра открыта' : 'Доступ не открыт' }}</h1>
    <p v-if="error" role="alert">{{ error }}</p>
    <p v-else>{{ purchase ? 'Все приключения доступны. Это тестовый экран игры.' : 'Открой полный доступ к приключениям.' }}</p>
    <button v-if="error" type="button" class="primary-button" @click="checkAccess">Повторить проверку</button>
    <NuxtLink to="/" class="primary-button">{{ purchase ? 'Вернуться к экрану покупки' : 'Открыть экран покупки' }}</NuxtLink>
  </main>
</template>
<style scoped>
.game { display: flex; flex-direction: column; align-items: center; gap: 24px; max-width: 430px; margin: auto; padding: 48px 16px; text-align: center; }
h1 { font-size: 28px; line-height: 34px; letter-spacing: -.6px; }
p { color: var(--muted); font-size: 15px; line-height: 22px; }
a { text-decoration: none; }
</style>
