<template>
  <section class="success" aria-labelledby="success-title" role="status">
    <div class="success-heading">
      <img src="/images/paywall/success.svg" width="40" height="40" alt="" aria-hidden="true">
      <h1 id="success-title">Доступ открыт!</h1>
    </div>
    <p>Все уровни, персонажи и игровые задания теперь доступны без ограничений</p>
  </section>
</template>
<style scoped>
.success { display: flex; flex-direction: column; align-items: center; gap: 24px; padding: 48px 8px 24px; min-height: 428px; flex: 1; text-align: center; }
.success-heading { display: flex; align-items: center; justify-content: center; gap: 12px; }
.success-heading img { flex-shrink: 0; }
h1 { font-size: 28px; line-height: 34px; font-weight: 700; letter-spacing: -.6px; }
p { color: var(--muted); font-size: 15px; line-height: 22px; }
@media (max-width: 359px) { .success-heading { flex-wrap: wrap; } }
@media (min-width: 360px) { h1 { width: 225px; text-align: left; } }
</style>
