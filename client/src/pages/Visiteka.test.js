import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { useLocale } from '../i18n/LocaleContext';
import { translations } from '../i18n/translations';
import Visiteka from './Visiteka';

jest.mock('../i18n/LocaleContext', () => ({
    useLocale: jest.fn(),
}));

global.IS_REACT_ACT_ENVIRONMENT = true;

describe('Visiteka', () => {
    let container;
    let root;

    beforeEach(() => {
        localStorage.clear();
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
    });

    afterEach(() => {
        act(() => root.unmount());
        container.remove();
    });

    const renderPage = (language = 'ru') => {
        useLocale.mockReturnValue({
            language,
            setLanguage: jest.fn(),
            t: (key) => translations[language][key],
        });
        act(() => root.render(<Visiteka />));
    };

    it('renders profile name and contact email', () => {
        renderPage();

        expect(container.textContent).toContain('Поляков Максим');
        expect(container.textContent).toContain('maxim7012@gmail.com');
    });

    it('renders the contact form', () => {
        renderPage();

        expect(container.querySelector('form')).not.toBeNull();
    });

    it('renders English from the lang URL and exposes the full language selector', () => {
        renderPage('en');

        expect(container.textContent).toContain('Contact me');
        expect(container.querySelector('.business-language-selector select').value).toBe('en');
        expect(container.querySelectorAll('.business-language-selector option')).toHaveLength(76);
    });
});
