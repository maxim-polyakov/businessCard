export const STORAGE_KEY = 'businesscard_locale';

export const LANGUAGES = [
    ['en', 'English'], ['ru', 'Русский'], ['de', 'Deutsch'], ['ar', 'العربية'],
    ['sq', 'Shqip'], ['am', 'አማርኛ'], ['hy', 'Հայերեն'], ['az', 'Azərbaycan'],
    ['eu', 'Euskara'], ['be', 'Беларуская'], ['bn', 'বাংলা'], ['bg', 'Български'],
    ['my', 'မြန်မာဘာသာ'], ['ca', 'Català'], ['zh', '简体中文'], ['zh-TW', '繁體中文'],
    ['hr', 'Hrvatski'], ['cs', 'Čeština'], ['da', 'Dansk'], ['nl', 'Nederlands'],
    ['et', 'Eesti'], ['fi', 'Suomi'], ['fr', 'Français'], ['gl', 'Galego'],
    ['ka', 'ქართული'], ['el', 'Ελληνικά'], ['he', 'עברית'], ['hi', 'हिन्दी'],
    ['hu', 'Magyar'], ['is', 'Íslenska'], ['id', 'Bahasa Indonesia'], ['ga', 'Gaeilge'],
    ['it', 'Italiano'], ['ja', '日本語'], ['kn', 'ಕನ್ನಡ'], ['kk', 'Қазақша'],
    ['km', 'ភាសាខ្មែរ'], ['ko', '한국어'], ['lo', 'ພາສາລາວ'], ['lv', 'Latviešu'],
    ['lt', 'Lietuvių'], ['mk', 'Македонски'], ['ms', 'Bahasa Melayu'], ['ml', 'മലയാളം'],
    ['mt', 'Malti'], ['mr', 'मराठी'], ['mn', 'Монгол'], ['ne', 'नेपाली'],
    ['nb', 'Norsk (bokmål)'], ['fa', 'فارسی'], ['pl', 'Polski'], ['pt', 'Português'],
    ['pa', 'ਪੰਜਾਬੀ'], ['ro', 'Română'], ['sr', 'Српски'], ['si', 'සිංහල'],
    ['sk', 'Slovenčina'], ['sl', 'Slovenščina'], ['es', 'Español'], ['sw', 'Kiswahili'],
    ['tl', 'Tagalog'], ['tg', 'Тоҷикӣ'], ['th', 'ภาษาไทย'], ['tr', 'Türkçe'],
    ['uk', 'Українська'], ['ur', 'اردو'], ['uz', 'Oʻzbek'], ['vi', 'Tiếng Việt'],
    ['cy', 'Cymraeg'], ['xh', 'isiXhosa'], ['yi', 'ייִדיש'], ['yo', 'Yorùbá'],
    ['zu', 'isiZulu'], ['gu', 'ગુજરાતી'], ['haw', 'ʻŌlelo Hawaiʻi'], ['ig', 'Igbo'],
].map(([code, label]) => ({ code, label }));

const supportedCodes = new Set(LANGUAGES.map(({ code }) => code));
export const RTL_CODES = new Set(['ar', 'he', 'fa', 'ur', 'yi']);

export const normalizeLanguage = (value) => {
    if (!value) return null;
    const normalized = String(value).replace('_', '-');
    const exact = LANGUAGES.find(({ code }) => code.toLowerCase() === normalized.toLowerCase());
    if (exact) return exact.code;
    const base = normalized.split('-')[0].toLowerCase();
    if (base === 'zh') {
        return /(?:tw|hk|mo|hant)/i.test(normalized) ? 'zh-TW' : 'zh';
    }
    return LANGUAGES.find(({ code }) => code.toLowerCase() === base)?.code || null;
};

export const resolveLanguage = ({
    search = typeof window !== 'undefined' ? window.location.search : '',
    stored = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null,
    browser = typeof navigator !== 'undefined' ? navigator.language : null,
} = {}) => {
    const fromUrl = normalizeLanguage(new URLSearchParams(search).get('lang'));
    return fromUrl || normalizeLanguage(stored) || normalizeLanguage(browser) || 'en';
};

export const withLang = (destination, language) => {
    const target = typeof destination === 'string' ? { pathname: destination } : { ...destination };
    const [pathnameAndSearch, hash = ''] = (target.pathname || '/').split('#');
    const [pathname, inlineSearch = ''] = pathnameAndSearch.split('?');
    const params = new URLSearchParams(target.search || inlineSearch);
    params.set('lang', supportedCodes.has(language) ? language : 'en');
    return {
        ...target,
        pathname,
        search: `?${params.toString()}`,
        hash: target.hash || (hash ? `#${hash}` : ''),
    };
};

export const applyDocumentLanguage = (language) => {
    document.documentElement.lang = language;
    document.documentElement.dir = RTL_CODES.has(language) ? 'rtl' : 'ltr';
};
