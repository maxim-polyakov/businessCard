import { normalizeLanguage, resolveLanguage, withLang } from './locale';

describe('locale URL behavior', () => {
    test('uses URL before storage and browser language', () => {
        expect(resolveLanguage({
            search: '?page=2&lang=ja',
            stored: 'de',
            browser: 'ar-SA',
        })).toBe('ja');
    });

    test('falls through storage, browser language, and English', () => {
        expect(resolveLanguage({ search: '', stored: 'de-DE', browser: 'ja-JP' })).toBe('de');
        expect(resolveLanguage({ search: '', stored: 'unsupported', browser: 'ar-SA' })).toBe('ar');
        expect(resolveLanguage({ search: '', stored: null, browser: 'xx-ZZ' })).toBe('en');
    });

    test('normalizes regional and Chinese variants', () => {
        expect(normalizeLanguage('pt-BR')).toBe('pt');
        expect(normalizeLanguage('zh-Hant-TW')).toBe('zh-TW');
        expect(normalizeLanguage('zh-CN')).toBe('zh');
    });

    test('preserves query parameters and hash when adding language', () => {
        expect(withLang('/?project=1#contacts', 'haw')).toEqual({
            pathname: '/',
            search: '?project=1&lang=haw',
            hash: '#contacts',
        });
    });
});
