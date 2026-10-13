export default defineNuxtConfig({
  compatibilityDate: '2026-10-13',
  devtools: { enabled: false },
  css: ['~/assets/css/main.css'],
  nitro: { preset: 'node-server', externals: { external: ['better-sqlite3'] } },
  app: {
    head: {
      htmlAttrs: { lang: 'ru' },
      title: 'Мир приключений',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'theme-color', content: '#F7F7FF' },
        { name: 'description', content: 'Тестовая покупка доступа к миру приключений без списания денег.' },
      ],
      link: [{ rel: 'preload', href: '/fonts/InterVariable.woff2', as: 'font', type: 'font/woff2', crossorigin: 'anonymous' }],
    },
  },
})
