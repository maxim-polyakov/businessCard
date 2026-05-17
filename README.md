# Сайт-визитка (baxic.ru)

Одностраничное портфолио Fullstack-разработчика: контакты, проекты и ссылки на соцсети. Сайт оптимизирован под SEO (мета-теги, Open Graph, JSON-LD, sitemap, IndexNow).

**Продакшен:** [https://baxic.ru](https://baxic.ru)

## Стек

- **React 19** + Create React App
- **React Router** — маршрутизация
- **React Bootstrap** — UI
- **MobX** — состояние (observer-компоненты)
- **Docker** + `serve` — production-сборка и раздача статики

## Возможности

- Профиль, контакты и блок проектов с ссылками на демо и GitHub
- SEO: canonical, keywords, Open Graph, Twitter Card, schema.org `Person`
- `robots.txt`, `sitemap.xml`
- Уведомление поисковиков через [IndexNow](https://www.indexnow.org/) (Яндекс и Bing) при деплое

## Быстрый старт

### Локальная разработка

```bash
yarn install
yarn start
```

Приложение откроется на [http://localhost:3000](http://localhost:3000).

### Сборка

```bash
yarn build
```

Артефакты попадают в папку `build/`.

### Docker

```bash
docker compose up -d --build
```

Сайт будет доступен на порту **3015** (внутри контейнера — 3000).

При старте контейнера выполняется `yarn indexnow` (уведомление поисковиков), затем `serve -s build`.

> Не монтируйте исходники в `/app` без готовой папки `build/` на хосте — иначе вместо сайта может отдаваться листинг каталога.

## Скрипты

| Команда | Описание |
|---------|----------|
| `yarn start` | Dev-сервер с hot reload |
| `yarn build` | Production-сборка |
| `yarn test` | Тесты (Jest) |
| `yarn favicon` | Генерация `favicon-120.png` из исходника |
| `yarn indexnow` | Отправка URL в Яндекс и Bing (IndexNow) |

## Структура проекта

```
├── public/           # index.html, SEO, robots.txt, sitemap.xml, ключ IndexNow
├── src/
│   ├── pages/        # Visiteka.js — основная страница
│   ├── components/   # AppRouter.js
│   └── App.js
├── scripts/
│   ├── docker-entrypoint.sh
│   ├── notify-indexnow.js
│   └── generate-favicon.js
├── Dockerfile
└── docker-compose.yml
```

## Редактирование контента

Данные профиля, проекты и соцсети задаются в `src/pages/Visiteka.js`. Мета-теги и JSON-LD — в `public/index.html`.

## Лицензия

Приватный репозиторий.
