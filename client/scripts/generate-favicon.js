/**
 * Генерирует фавиконку 120×120 из public/logo.png для Яндекса и сниппетов.
 * Запуск: node scripts/generate-favicon.js  или  yarn favicon
 */
const path = require('path');
const fs = require('fs');

const publicDir = path.join(__dirname, '..', 'public');
const input = path.join(publicDir, 'logo.png');
const output120 = path.join(publicDir, 'favicon-120.png');
const output32 = path.join(publicDir, 'favicon-32.png');

if (!fs.existsSync(input)) {
  console.error('Файл public/logo.png не найден. Положите logo.png в папку public/ и запустите снова.');
  process.exit(1);
}

async function run() {
  const sharp = require('sharp');
  await sharp(input)
    .resize(120, 120, { fit: 'cover' })
    .png()
    .toFile(output120);
  console.log('Создан:', output120);

  await sharp(input)
    .resize(32, 32, { fit: 'cover' })
    .png()
    .toFile(output32);
  console.log('Создан:', output32);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
