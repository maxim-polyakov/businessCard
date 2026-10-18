import { LANGUAGES } from './locale';
import { REQUIRED_TRANSLATION_KEYS, translations } from './translations';

describe('translations', () => {
    test('contains the complete 76-language pack', () => {
        expect(LANGUAGES).toHaveLength(76);
        expect(Object.keys(translations)).toHaveLength(76);
        expect(new Set(Object.keys(translations))).toEqual(
            new Set(LANGUAGES.map(({ code }) => code))
        );
    });

    test.each(LANGUAGES.map(({ code }) => code))(
        '%s has every required non-empty key',
        (code) => {
            for (const key of REQUIRED_TRANSLATION_KEYS) {
                expect(typeof translations[code][key]).toBe('string');
                expect(translations[code][key].trim()).not.toBe('');
            }
            expect(translations[code].selectedFiles).toContain('{count}');
        }
    );

    test('keeps verified Russian and English business-card terminology', () => {
        expect(translations.en.navProjects).toBe('Projects');
        expect(translations.en.canbanTitle).toBe('Kanban');
        expect(translations.ru.navProjects).toBe('Проекты');
        expect(translations.ru.canbanTitle).toBe('Канбан');
    });
});
