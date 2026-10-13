import type { Offer, OfferId, PurchaseResponse, RestoreResponse } from '#shared/types/paywall'
import { formatRubles } from '#shared/utils/price'

export function usePaywall() {
  const { data, status: offersStatus, error: offersError, refresh } = useFetch<{ offers: Offer[] }>('/api/offers', {
    server: false, lazy: true, retry: 0,
  })
  const selectedOfferId = ref<OfferId | null>(null)
  const operation = ref<'idle' | 'purchase' | 'restore'>('idle')
  const operationError = ref('')
  const information = ref('')
  const purchaseResult = useState<PurchaseResponse | null>('paywall-purchase', () => null)
  const pendingRequest = ref<{ offerId: OfferId; requestId: string } | null>(null)
  const offers = computed(() => data.value?.offers ?? [])
  const offersLoading = computed(() => !data.value && (offersStatus.value === 'idle' || offersStatus.value === 'pending'))
  const busy = computed(() => operation.value !== 'idle')
  const selectedOffer = computed(() => offers.value.find(item => item.id === selectedOfferId.value))
  watch(offers, (items) => {
    if (items.length && !items.some(item => item.id === selectedOfferId.value)) {
      selectedOfferId.value = items.find(item => item.id === 'yearly')?.id ?? items[0]!.id
    }
  }, { immediate: true })

  const buttonLabel = computed(() => {
    if (operation.value === 'purchase') return 'Обрабатываем…'
    if (operation.value === 'restore') return 'Восстанавливаем…'
    if (offersError.value) return 'Повторить загрузку'
    if (offersLoading.value || !selectedOffer.value) return 'Загружаем тарифы…'
    const offer = selectedOffer.value
    return `Открыть за ${formatRubles(offer.priceMinor)} в ${offer.period === 'year' ? 'год' : 'месяц'}`
  })
  const message = computed(() => operationError.value || (offersError.value ? 'Не удалось загрузить тарифы. Попробуйте ещё раз' : '') || information.value)
  const messageIsError = computed(() => Boolean(operationError.value || offersError.value))

  function selectOffer(id: OfferId) {
    if (busy.value || purchaseResult.value || !offers.value.some(item => item.id === id)) return
    if (selectedOfferId.value !== id) pendingRequest.value = null
    selectedOfferId.value = id
    operationError.value = ''
    information.value = ''
  }
  async function purchase() {
    if (busy.value || purchaseResult.value || !selectedOffer.value) return
    operation.value = 'purchase' // Lock synchronously before the first await.
    operationError.value = ''
    information.value = ''
    try {
      if (!pendingRequest.value || pendingRequest.value.offerId !== selectedOffer.value.id) {
        pendingRequest.value = { offerId: selectedOffer.value.id, requestId: crypto.randomUUID() }
      }
      purchaseResult.value = await $fetch<PurchaseResponse>('/api/purchase', { method: 'POST', body: pendingRequest.value, retry: 0 })
      pendingRequest.value = null
    } catch {
      // Keep the key: a lost response may already have committed the purchase.
      operationError.value = 'Не удалось выполнить покупку. Попробуйте ещё раз'
    } finally {
      operation.value = 'idle'
    }
  }
  async function restore() {
    if (busy.value || purchaseResult.value) return
    operation.value = 'restore'
    operationError.value = ''
    information.value = ''
    try {
      const result = await $fetch<RestoreResponse>('/api/restore', { method: 'POST', retry: 0 })
      if (result.found && result.purchase) purchaseResult.value = result.purchase
      else information.value = 'Покупок для этого устройства пока нет'
    } catch {
      operationError.value = 'Не удалось восстановить покупки. Попробуйте ещё раз'
    } finally {
      operation.value = 'idle'
    }
  }
  async function primaryAction() {
    if (busy.value || purchaseResult.value) return
    if (offersError.value) { operationError.value = ''; information.value = ''; await refresh(); return }
    await purchase()
  }
  return { offers, offersStatus, offersError, offersLoading, selectedOfferId, operation, busy, buttonLabel,
    message, messageIsError, purchaseResult, selectOffer, primaryAction, restore }
}
