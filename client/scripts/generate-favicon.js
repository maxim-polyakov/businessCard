/**
 * Генерирует public favicon-набор по именам как в avicena-project.
 * Запуск: node scripts/generate-favicon.js  или  yarn favicon
 */
const path = require('path');
const fs = require('fs');

const publicDir = path.join(__dirname, '..', 'public');
const input = path.join(publicDir, 'favicon.png');
const output192 = path.join(publicDir, 'favicon-192x192.png');
const output48 = path.join(publicDir, 'favicon-48x48.png');
const outputAppleTouch = path.join(publicDir, 'apple-touch-icon.png');
const outputIco = path.join(publicDir, 'favicon.ico');

if (!fs.existsSync(input)) {
  console.error('Файл public/favicon.png не найден. Положите favicon.png в папку public/ и запустите снова.');
  process.exit(1);
}

async function run() {
  const sharp = require('sharp');
  await sharp(input)
    .resize(192, 192, { fit: 'cover' })
    .png()
    .toFile(output192);
  console.log('Создан:', output192);

  await sharp(input)
    .resize(48, 48, { fit: 'cover' })
    .png()
    .toFile(output48);
  console.log('Создан:', output48);

  await sharp(input)
    .resize(180, 180, { fit: 'cover' })
    .png()
    .toFile(outputAppleTouch);
  console.log('Создан:', outputAppleTouch);

  fs.copyFileSync(input, outputIco);
  console.log('Создан:', outputIco);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
