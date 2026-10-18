const http = require('node:http');
const { readFile, stat } = require('node:fs/promises');
const path = require('node:path');
const { previews } = require('./previewLanguagePack.json');

const port = Number(process.env.PORT || 3000);
const buildDirectory = path.join(__dirname, 'build');
const publicUrl = (process.env.PUBLIC_SITE_URL || 'https://baxic.ru').replace(/\/$/, '');
const rtlLanguages = new Set(['ar', 'he', 'fa', 'ur', 'yi']);

const contentTypes = {
    '.css': 'text/css; charset=utf-8',
    '.gif': 'image/gif',
    '.html': 'text/html; charset=utf-8',
    '.ico': 'image/x-icon',
    '.jpeg': 'image/jpeg',
    '.jpg': 'image/jpeg',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.map': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp',
};

const escapeHtml = (value) => String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');

const normalizeLanguage = (value) => {
    const raw = String(value || '').trim().replace('_', '-');
    if (previews[raw]) return raw;
    const lower = raw.toLowerCase();
    if (lower === 'zh-tw' || lower === 'zh-hk' || lower.includes('hant')) return 'zh-TW';
    if (previews[lower]) return lower;
    const base = lower.split('-', 1)[0];
    return previews[base] ? base : 'en';
};

const requestLanguage = (request, url) => {
    const fromUrl = url.searchParams.get('lang');
    if (fromUrl) return normalizeLanguage(fromUrl);

    const cookie = request.headers.cookie
        ?.split(';')
        .map((item) => item.trim().split('='))
        .find(([name]) => name === 'businesscard_locale')?.[1];
    if (cookie) return normalizeLanguage(decodeURIComponent(cookie));

    return normalizeLanguage(request.headers['accept-language']?.split(',')[0]);
};

const replaceMeta = (html, attribute, name, content) => {
    const expression = new RegExp(
        `(<meta\\s+${attribute}="${name}"\\s+content=")[^"]*(")`,
        'i',
    );
    return html.replace(expression, `$1${escapeHtml(content)}$2`);
};

const renderIndex = (template, request, url) => {
    const language = requestLanguage(request, url);
    const preview = previews[language] || previews.en;
    const pageUrl = `${publicUrl}${url.pathname}${url.search}`;
    const imageUrl = `${publicUrl}/businesscard-og-preview-v1.jpg`;
    const htmlLanguage = language === 'zh' ? 'zh-CN' : language;
    const direction = rtlLanguages.has(language) ? 'rtl' : 'ltr';

    let html = template.replace(
        /<html\s+lang="[^"]*"/i,
        `<html lang="${escapeHtml(htmlLanguage)}" dir="${direction}"`,
    );
    html = html.replace(/<title>[^<]*<\/title>/i, `<title>${escapeHtml(preview.title)}</title>`);
    html = replaceMeta(html, 'property', 'og:title', preview.title);
    html = replaceMeta(html, 'property', 'og:description', preview.description);
    html = replaceMeta(html, 'property', 'og:url', pageUrl);
    html = replaceMeta(html, 'property', 'og:image', imageUrl);
    html = replaceMeta(html, 'property', 'og:image:secure_url', imageUrl);
    html = replaceMeta(html, 'property', 'og:locale', language);
    html = replaceMeta(html, 'name', 'description', preview.description);
    html = replaceMeta(html, 'name', 'twitter:title', preview.title);
    html = replaceMeta(html, 'name', 'twitter:description', preview.description);
    html = replaceMeta(html, 'name', 'twitter:image', imageUrl);
    html = html.replace(
        /(<link\s+rel="canonical"\s+href=")[^"]*(")/i,
        `$1${escapeHtml(pageUrl)}$2`,
    );
    html = html.replace(
        /(<link\s+rel="image_src"\s+href=")[^"]*(")/i,
        `$1${escapeHtml(imageUrl)}$2`,
    );
    return html;
};

const staticFile = async (pathname) => {
    let decoded;
    try {
        decoded = decodeURIComponent(pathname);
    } catch {
        return null;
    }
    const relative = decoded.replace(/^\/+/, '');
    const candidate = path.resolve(buildDirectory, relative);
    if (!candidate.startsWith(`${buildDirectory}${path.sep}`)) return null;

    try {
        const info = await stat(candidate);
        return info.isFile() ? candidate : null;
    } catch {
        return null;
    }
};

const handle = async (request, response) => {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
        response.writeHead(405, { Allow: 'GET, HEAD' });
        response.end();
        return;
    }

    const url = new URL(request.url, publicUrl);
    const file = await staticFile(url.pathname);
    if (file) {
        const body = await readFile(file);
        response.writeHead(200, {
            'Cache-Control': 'public, max-age=31536000, immutable',
            'Content-Type': contentTypes[path.extname(file).toLowerCase()] || 'application/octet-stream',
        });
        response.end(request.method === 'HEAD' ? undefined : body);
        return;
    }

    const template = await readFile(path.join(buildDirectory, 'index.html'), 'utf8');
    const body = renderIndex(template, request, url);
    response.writeHead(200, {
        'Cache-Control': 'public, max-age=300',
        'Content-Type': 'text/html; charset=utf-8',
        Vary: 'Accept-Language, Cookie',
    });
    response.end(request.method === 'HEAD' ? undefined : body);
};

const server = http.createServer((request, response) => {
    handle(request, response).catch((error) => {
        console.error(error);
        response.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        response.end('Internal Server Error');
    });
});

server.listen(port, '0.0.0.0', () => {
    console.log(`BusinessCard client listening on port ${port}`);
});
