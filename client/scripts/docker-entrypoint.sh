#!/bin/sh
# Уведомление поисковиков об обновлении, затем запуск SPA-сервера с локализованными meta-тегами
node scripts/notify-indexnow.js || true
exec node server.cjs
