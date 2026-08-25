#!/bin/sh
# Уведомление поисковиков об обновлении, затем запуск serve
node scripts/notify-indexnow.js || true
exec serve -s build -l 3000
