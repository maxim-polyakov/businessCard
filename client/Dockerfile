FROM node:24-alpine

WORKDIR /app

# Копируем package.json, yarn.lock и ставим зависимости
COPY package*.json yarn.lock ./
RUN yarn --frozen-lockfile

# Копируем весь код и собираем production-версию
COPY . .
RUN yarn build
RUN yarn global add serve

EXPOSE 3000

# При старте контейнера: yarn indexnow (уведомление Яндекса/Bing), затем serve
RUN chmod +x scripts/docker-entrypoint.sh
CMD ["sh", "scripts/docker-entrypoint.sh"]