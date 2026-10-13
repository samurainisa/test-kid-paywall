# TestKidTask

Nuxt **4.6.1**, Vue 3, TypeScript, SQLite (`better-sqlite3`); Node **22.23.1** закреплён для локальной работы и обеих стадий Docker. Покупка тестовая, деньги не списываются.

[Живой сервис](https://test-kid-paywall-production.up.railway.app) · [GitHub](https://github.com/samurainisa/test-kid-paywall) · [Figma](https://www.figma.com/design/7VigLCRaHdb6H4SG1h8VnM/TestKidTask)

```sh
npm ci
npm run dev                 # http://localhost:3000
npm run typecheck
npm run build
npm start                   # собранный Node-сервер
npx playwright install chromium
npm test                    # API, SQLite, браузер, пять эталонов
docker build -t test-kid-paywall:local .
npm run test:docker         # пересоздание контейнера с тестовым volume
docker compose up -d --build
node scripts/verify-live.mjs https://test-kid-paywall-production.up.railway.app
```

Фронт — `app/`, общие типы — `shared/`, маршруты — `server/api/` (`offers`, `purchase`, `restore`, `health`). SQLite лениво создаёт начальную схему без удаления данных: `SQLITE_PATH`, по умолчанию `./data/paywall.sqlite`. Production-запуск не читает `.env` автоматически: передайте переменные окружения процессу; для разработки можно скопировать `.env.example`. SQLite подходит одному небольшому Node-процессу и хранит реальные записи, включая уникальный ключ операции. Восстановление работает только в том же браузере с cookie `paywall_device`; после удаления cookie и между устройствами оно недоступно.

**Размещение:** Railway, Dockerfile, одна реплика, HTTPS и `/api/health`; `NITRO_PRESET=node-server` задан при сборке. Для постоянной SQLite подключите volume к сервису с mount path `/data`, задайте `SQLITE_PATH=/data/paywall.sqlite`, `NODE_ENV=production`, `NITRO_HOST=0.0.0.0`; оставьте назначенный платформой `PORT`. [Документация volume](https://docs.railway.com/volumes). Сервис опубликован владельцем; агент проверил публичные API и сохранность исходной покупки после успешного Railway redeploy. Настройки volume в аккаунте напрямую не инспектировались. Compose использует именованный диск: `docker compose down` сохраняет его, `down -v` удаляет покупки.

**Проведено агентом:** TypeScript, Windows/Linux production-сборки, реальные API и чтение SQLite, повтор/конфликт requestId, ошибки сети и INSERT, потеря ответа после COMMIT, восстановление после нового процесса/релиза и пересоздания Linux-контейнера. Playwright проверил пять состояний на 390×844, шесть размеров из ТЗ плюс 320×640, клавиатуру и текст 200%. Отчёты, снимки, наложения и diff — `test-results/`, галерея `comparison.html`; подробности в [VERIFICATION.md](VERIFICATION.md). SVG и шрифт сохранены без изменений. Локальный Inter немного отличается шириной текста от экспорта Figma; точного пиксельного совпадения нет. `npm audit --omit=dev`: 0; полный audit: 11 high в зависимостях инструментов сборки без доступного совместимого исправления. Nuxt при сборке также выдаёт upstream DEP0155.

**Публичная версия:** прошли реальные health/offers/purchase/restore, ошибки 400, идемпотентность 201/200 и конфликт 409, изоляция cookie, пять состояний UI, переход в игру, восстановление после reload и шесть мобильных размеров. Результаты — `test-results/live/`. После redeploy: `node scripts/verify-live.mjs https://test-kid-paywall-production.up.railway.app --restore-only` использует сохранённую тестовую cookie и проверяет исходную покупку.

Использованы Codex и навык Figma design-to-code; Figma MCP вернул лимит Starter, поэтому реализация опирается на приложенные JSON, SVG и PNG. Физический телефон агент не проверял. Упрощений из-за времени нет; `/game` — предусмотренная ТЗ заглушка. Следующие два часа: довести совпадение Inter с Figma, проверить Safari/iOS и настроить резервную копию SQLite.

**Владельцу перед отправкой:**
- Проверить экран на физическом телефоне и визуально оценить отличия Inter.
- Подтвердить volume `/data`, купить/восстановить после redeploy, проверить доступ к Figma по ссылке.
- Пересмотреть audit при обновлении Nuxt; отметить свои ручные проверки отдельно от проверок агента.
