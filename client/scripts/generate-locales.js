/* eslint-disable no-console */
const fs = require('fs');
const https = require('https');
const path = require('path');

const OUTPUT = path.join(__dirname, '..', 'src', 'i18n', 'translations.js');
const PREVIEW_OUTPUT = path.join(__dirname, '..', '..', 'server', 'businesscard-previews.json');
const LANGUAGE_CODES = [
    'en', 'ru', 'de', 'ar', 'sq', 'am', 'hy', 'az', 'eu', 'be', 'bn', 'bg', 'my', 'ca',
    'zh', 'zh-TW', 'hr', 'cs', 'da', 'nl', 'et', 'fi', 'fr', 'gl', 'ka', 'el', 'he', 'hi',
    'hu', 'is', 'id', 'ga', 'it', 'ja', 'kn', 'kk', 'km', 'ko', 'lo', 'lv', 'lt', 'mk',
    'ms', 'ml', 'mt', 'mr', 'mn', 'ne', 'nb', 'fa', 'pl', 'pt', 'pa', 'ro', 'sr', 'si',
    'sk', 'sl', 'es', 'sw', 'tl', 'tg', 'th', 'tr', 'uk', 'ur', 'uz', 'vi', 'cy', 'xh',
    'yi', 'yo', 'zu', 'gu', 'haw', 'ig',
];

const ENGLISH = {
    language: 'Language',
    homeAria: 'Home',
    navServices: 'Services',
    navProjects: 'Projects',
    navContacts: 'Contacts',
    heroEyebrow: '[ Custom development ]',
    heroTitle: 'I build IT solutions for businesses and personal products',
    profileDescription: 'I design and develop web applications, AI services, e-commerce and backend systems. I take a task from idea and prototype to launch, integrations and support.',
    discussProject: 'Discuss a project',
    viewWork: 'View my work',
    developerLabel: 'Developer',
    profileName: 'Maxim Polyakov',
    profilePosition: 'Full Stack Developer',
    profileLocation: 'Nizhny Novgorod, Russia',
    statProjects: 'launched projects',
    statFullstack: 'frontend + backend',
    statOnline: 'website available online',
    servicesEyebrow: '[ Services ]',
    servicesTitle: 'What I can build',
    serviceWebTitle: 'Web development and integrations',
    serviceWebDescription: 'I create websites, personal dashboards and services with clear architecture, responsive interfaces and external API integrations.',
    serviceBackendTitle: 'Backend and business logic',
    serviceBackendDescription: 'I develop server-side applications, authentication, databases, admin panels and reliable data-processing flows.',
    serviceAiTitle: 'AI products and automation',
    serviceAiDescription: 'I integrate AI tools into products: chatbots, image generation, routine-process automation and MVP prototypes.',
    portfolioEyebrow: '[ Portfolio ]',
    portfolioTitle: 'Projects',
    misaDescription: 'An AI chat with ChatGPT, DALL-E and WebSocket messaging.',
    galleryDescription: 'A convenient gallery for images generated with DALL-E.',
    ecommerceDescription: 'An online store with a cart, authentication, REST API and a Spring Boot backend.',
    canbanTitle: 'Kanban',
    canbanDescription: 'A client-server task board application with quests and levels.',
    lotusDescription: 'A game project with client-side and server-side components.',
    projectLink: 'Project',
    contactEyebrow: '[ Discuss, consult, ask ]',
    contactTitle: 'Contact me',
    contactDescription: 'Describe your task in a few sentences. If you already have specifications, mockups or briefs, attach them to the request.',
    formNameLabel: 'My name is',
    formNamePlaceholder: 'Your name',
    formCompanyLabel: 'I work at',
    formCompanyPlaceholder: 'Company name',
    formEmailLabel: 'Contact me by email',
    formEmailPlaceholder: 'Your email',
    formPhoneLabel: 'Call me',
    formPhonePlaceholder: 'Your phone number',
    formMessageLabel: 'Message',
    formMessagePlaceholder: 'Describe your task',
    attachFiles: 'Attach specifications or files',
    selectedFiles: 'Files selected: {count}',
    fileTypes: 'jpg, jpeg, png, bmp, gif, pdf, doc, docx, txt',
    consent: 'I consent to the processing of my personal data in order to receive a response',
    sending: 'Sending...',
    send: 'Send',
    submitSuccess: 'Your request has been sent. I will contact you soon.',
    submitError: 'Could not send the request. Please try again later.',
    invalidApiResponse: 'The backend API returned an invalid response. Check the /api proxy configuration.',
    metaTitle: 'Maxim Polyakov — Full Stack Developer | Portfolio',
    metaDescription: 'Maxim Polyakov is a Full Stack Developer specializing in React, Node.js, Java and Python. Web applications, AI, e-commerce, portfolio and contacts.',
};

const RUSSIAN = {
    language: 'Язык',
    homeAria: 'На главную',
    navServices: 'Услуги',
    navProjects: 'Проекты',
    navContacts: 'Контакты',
    heroEyebrow: '[ Персональная разработка ]',
    heroTitle: 'Реализую IT-решения для бизнеса и личных продуктов',
    profileDescription: 'Проектирую и разрабатываю веб-приложения, AI-сервисы, e-commerce и backend-системы. Беру задачу от идеи и прототипа до запуска, интеграций и поддержки.',
    discussProject: 'Обсудить проект',
    viewWork: 'Смотреть работы',
    developerLabel: 'Разработчик',
    profileName: 'Поляков Максим',
    profilePosition: 'Full Stack Developer',
    profileLocation: 'Нижний Новгород, Россия',
    statProjects: 'запущенных проектов',
    statFullstack: 'фронтенд + backend',
    statOnline: 'сайт доступен онлайн',
    servicesEyebrow: '[ Услуги ]',
    servicesTitle: 'Что могу закрыть',
    serviceWebTitle: 'Веб-разработка и интеграции',
    serviceWebDescription: 'Создаю сайты, личные кабинеты и сервисы с понятной архитектурой, адаптивным интерфейсом и подключением внешних API.',
    serviceBackendTitle: 'Backend и бизнес-логика',
    serviceBackendDescription: 'Разрабатываю серверную часть, авторизацию, базы данных, административные панели и надежные сценарии обработки данных.',
    serviceAiTitle: 'AI-продукты и автоматизация',
    serviceAiDescription: 'Интегрирую AI-инструменты в продукты: чат-боты, генерацию изображений, автоматизацию рутинных процессов и прототипы MVP.',
    portfolioEyebrow: '[ Портфолио ]',
    portfolioTitle: 'Проекты',
    misaDescription: 'AI-чат с поддержкой ChatGPT, DALL-E и WebSocket-обмена сообщениями.',
    galleryDescription: 'Галерея изображений, сгенерированных через DALL-E, с удобной витриной работ.',
    ecommerceDescription: 'Интернет-магазин с корзиной, авторизацией, REST API и backend на Spring Boot.',
    canbanTitle: 'Канбан',
    canbanDescription: 'Клиент-серверное приложение с доской задач, квестами и уровнями.',
    lotusDescription: 'Игровой проект с клиентской и серверной частью.',
    projectLink: 'Проект',
    contactEyebrow: '[ Обсудить, посоветоваться, спросить ]',
    contactTitle: 'Связаться со мной',
    contactDescription: 'Опишите задачу в пару предложений. Если уже есть ТЗ, макеты или брифы, приложите файлы к заявке.',
    formNameLabel: 'Меня зовут',
    formNamePlaceholder: 'Ваше имя',
    formCompanyLabel: 'Я работаю в компании',
    formCompanyPlaceholder: 'Название компании',
    formEmailLabel: 'Связаться со мной по e-mail',
    formEmailPlaceholder: 'Ваш e-mail',
    formPhoneLabel: 'Позвонить мне',
    formPhonePlaceholder: 'Ваш номер телефона',
    formMessageLabel: 'Сообщение',
    formMessagePlaceholder: 'Опишите задачу',
    attachFiles: 'Прикрепить ТЗ или файлы',
    selectedFiles: 'Выбрано файлов: {count}',
    fileTypes: 'jpg, jpeg, png, bmp, gif, pdf, doc, docx, txt',
    consent: 'Я согласен на обработку персональных данных для ответа на заявку',
    sending: 'Отправляю...',
    send: 'Отправить',
    submitSuccess: 'Заявка отправлена. Я свяжусь с вами в ближайшее время.',
    submitError: 'Не удалось отправить заявку. Попробуйте позже.',
    invalidApiResponse: 'Backend API вернул некорректный ответ. Проверьте проксирование /api на сервер.',
    metaTitle: 'Поляков Максим — Fullstack-разработчик | Портфолио',
    metaDescription: 'Поляков Максим — Fullstack-разработчик. React, Node.js, Java и Python. Веб-приложения, AI, e-commerce, портфолио и контакты.',
};

const get = (url) => new Promise((resolve, reject) => {
    https.get(url, (response) => {
        if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
            get(response.headers.location).then(resolve, reject);
            return;
        }
        let body = '';
        response.setEncoding('utf8');
        response.on('data', (chunk) => { body += chunk; });
        response.on('end', () => response.statusCode === 200
            ? resolve(body)
            : reject(new Error(`HTTP ${response.statusCode}: ${url}`)));
    }).on('error', reject);
});

const translateBatch = async (code, entries) => {
    const query = encodeURIComponent(entries.map(([, value]) => value).join('\n'));
    const target = code === 'zh-TW' ? 'zh-TW' : code;
    const url = `https://clients5.google.com/translate_a/t?client=dict-chrome-ex&sl=en&tl=${encodeURIComponent(target)}&q=${query}`;
    const payload = JSON.parse(await get(url));
    const values = payload[0].split(/\r?\n/);
    if (values.length !== entries.length) {
        throw new Error(`Unexpected translation count for ${code}: ${values.length}/${entries.length}`);
    }
    return Object.fromEntries(entries.map(([key], index) => [key, values[index]]));
};

const translate = async (code) => {
    if (code === 'en') return ENGLISH;
    if (code === 'ru') return RUSSIAN;
    const entries = Object.entries(ENGLISH);
    const translated = {};
    for (let index = 0; index < entries.length; index += 10) {
        Object.assign(translated, await translateBatch(code, entries.slice(index, index + 10)));
    }
    translated.selectedFiles = translated.selectedFiles.replace(/\{[^}]+\}/g, '{count}');
    return translated;
};

const run = async () => {
    const result = {};
    const pending = [...LANGUAGE_CODES];
    const workers = Array.from({ length: 4 }, async () => {
        while (pending.length > 0) {
            const code = pending.shift();
            console.log(`Translating ${code}`);
            result[code] = await translate(code);
        }
    });
    await Promise.all(workers);

    const orderedResult = {};
    for (const code of LANGUAGE_CODES) {
        orderedResult[code] = result[code];
    }

    const contents = '// Generated by scripts/generate-locales.js.\n'
        + '// Run: node scripts/generate-locales.js\n'
        + `export const translations = ${JSON.stringify(orderedResult, null, 4)};\n\n`
        + `export const REQUIRED_TRANSLATION_KEYS = ${JSON.stringify(Object.keys(ENGLISH), null, 4)};\n`;
    fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
    fs.writeFileSync(OUTPUT, contents, 'utf8');
    fs.writeFileSync(PREVIEW_OUTPUT, `${JSON.stringify({
        previews: Object.fromEntries(Object.entries(orderedResult).map(([code, messages]) => [
            code,
            { title: messages.metaTitle, description: messages.metaDescription },
        ])),
    }, null, 2)}\n`, 'utf8');
    console.log(`Wrote ${OUTPUT}`);
    console.log(`Wrote ${PREVIEW_OUTPUT}`);
};

run().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
