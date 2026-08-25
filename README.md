# Сайт-визитка (baxic.ru)

Проект разделён на клиентскую часть и backend:

- `client` — React-сайт-визитка.
- `server` — FastAPI backend для контактной формы.

**Продакшен:** [https://baxic.ru](https://baxic.ru)

## Стек

### Client

- **React 19** + Create React App
- **React Router** — маршрутизация
- **React Bootstrap** — UI
- **MobX** — состояние (observer-компоненты)
- **Docker** + `serve` — production-сборка и раздача статики

### Server

- **FastAPI** — API контактной формы
- **Uvicorn** — ASGI-сервер
- **python-multipart** — приём файлов из формы
- **SQLAlchemy Async ORM** + **PostgreSQL** — хранение заявок
- **S3-compatible storage** — хранение вложений формы

## Возможности

- Профиль, контакты и блок проектов с ссылками на демо и GitHub
- SEO: canonical, keywords, Open Graph, Twitter Card, schema.org `Person`
- `robots.txt`, `sitemap.xml`
- Уведомление поисковиков через [IndexNow](https://www.indexnow.org/) (Яндекс и Bing) при деплое
- Backend endpoint для заявок: `POST /api/contact`

## Быстрый старт

### Client

```bash
cd client
yarn install
yarn start
```

Приложение откроется на [http://localhost:3000](http://localhost:3000).

### Сборка

```bash
cd client
yarn build
```

Артефакты попадают в папку `client/build/`.

### Server

```bash
cd server
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

API будет доступен на [http://localhost:8000](http://localhost:8000).
Строка подключения к базе задаётся в `server/.env` через `DATABASE_URL`.

### Docker

```bash
docker compose up -d --build
```

Сайт будет доступен на порту **3015** (внутри контейнера — 3000).
FastAPI backend будет доступен на порту **3016** (внутри контейнера — 8000).

Проверка backend:

```bash
curl http://localhost:3016/api/health
```

При старте контейнера выполняется `yarn indexnow` (уведомление поисковиков), затем `serve -s build`.

> Не монтируйте исходники в `/app` без готовой папки `build/` на хосте — иначе вместо сайта может отдаваться листинг каталога.

## Скрипты

| Команда | Описание |
|---------|----------|
| `cd client && yarn start` | Dev-сервер с hot reload |
| `cd client && yarn build` | Production-сборка |
| `cd client && yarn test` | Тесты (Jest) |
| `cd client && yarn favicon` | Генерация `favicon-120.png` из исходника |
| `cd client && yarn indexnow` | Отправка URL в Яндекс и Bing (IndexNow) |

## Структура проекта

```
├── client/
│   ├── public/           # index.html, SEO, robots.txt, sitemap.xml, ключ IndexNow
│   ├── src/
│   │   ├── pages/        # Visiteka.js — основная страница
│   │   ├── components/   # AppRouter.js
│   │   └── App.js
│   ├── scripts/
│   │   ├── docker-entrypoint.sh
│   │   ├── notify-indexnow.js
│   │   └── generate-favicon.js
│   ├── Dockerfile
│   └── package.json
├── server/
│   ├── main.py
│   ├── Dockerfile
│   ├── requirements.txt
│   └── README.md
└── docker-compose.yml
```

## Редактирование контента

Данные профиля, проекты и соцсети задаются в `client/src/pages/Visiteka.js`. Мета-теги и JSON-LD — в `client/public/index.html`.

## Лицензия

Приватный репозиторий.
