/**
 * Уведомление Яндекса (и Bing) об обновлении страницы через IndexNow.
 * Запуск после деплоя: node scripts/notify-indexnow.js
 * Или: yarn indexnow
 */
const KEY = 'IndexNowBaxic2026KeyA1B2C3D4E5';
const SITE_URL = 'https://baxic.ru';
const PAGES = [`${SITE_URL}/`];

async function notifyYandex() {
  const url = new URL('https://yandex.com/indexnow');
  url.searchParams.set('url', PAGES[0]);
  url.searchParams.set('key', KEY);
  const res = await fetch(url.toString());
  console.log('Yandex IndexNow:', res.status, res.statusText);
}

async function notifyBing() {
  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      host: 'baxic.ru',
      key: KEY,
      keyLocation: `https://baxic.ru/${KEY}.txt`,
      urlList: PAGES,
    }),
  });
  console.log('Bing IndexNow:', res.status, res.statusText);
}

async function main() {
  await notifyYandex();
  await notifyBing();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
