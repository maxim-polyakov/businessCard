FROM node:24-alpine

WORKDIR /app

# Копируем package.json, yarn.lock и ставим зависимости
COPY package*.json yarn.lock ./
RUN yarn --frozen-lockfile

# Копируем весь код и собираем production-версию
COPY . .
RUN yarn build
# Копия index.html как 404.html для SPA (на случай статического хостинга)
RUN cp build/index.html build/404.html
# Устанавливаем serve для отдачи статики
RUN yarn global add serve

EXPOSE 3000

# SPA: -s (--single) + serve.json с rewrites ** → /index.html
CMD ["serve", "-s", "build", "-l", "3000"]