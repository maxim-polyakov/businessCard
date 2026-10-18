import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { applyDocumentLanguage, normalizeLanguage, resolveLanguage, STORAGE_KEY, withLang } from './locale';
import { translations } from './translations';

const LocaleContext = createContext(null);

const setMetaContent = (selector, content) => {
    const element = document.querySelector(selector);
    if (element) element.setAttribute('content', content);
};

const setLinkHref = (selector, href) => {
    const element = document.querySelector(selector);
    if (element) element.setAttribute('href', href);
};

export const LocaleProvider = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [language, setLanguageState] = useState(() => resolveLanguage());

    useEffect(() => {
        const resolved = resolveLanguage({ search: location.search });
        setLanguageState((current) => current === resolved ? current : resolved);
    }, [location.search]);

    useEffect(() => {
        const messages = translations[language] || translations.en;
        localStorage.setItem(STORAGE_KEY, language);
        document.cookie = `${STORAGE_KEY}=${encodeURIComponent(language)}; Path=/; Max-Age=31536000; SameSite=Lax; Secure`;
        applyDocumentLanguage(language);
        document.title = messages.metaTitle;
        setMetaContent('meta[name="description"]', messages.metaDescription);
        setMetaContent('meta[property="og:title"]', messages.metaTitle);
        setMetaContent('meta[property="og:description"]', messages.metaDescription);
        setMetaContent('meta[property="og:locale"]', language);
        setMetaContent('meta[name="twitter:title"]', messages.metaTitle);
        setMetaContent('meta[name="twitter:description"]', messages.metaDescription);

        const urlLanguage = normalizeLanguage(new URLSearchParams(location.search).get('lang'));
        const localizedLocation = withLang(`${location.pathname}${location.search}${location.hash}`, language);
        const publicUrl = new URL(
            `${localizedLocation.pathname}${localizedLocation.search}${localizedLocation.hash}`,
            window.location.origin
        ).toString();
        setMetaContent('meta[property="og:url"]', publicUrl);
        setLinkHref('link[rel="canonical"]', publicUrl);
        if (!urlLanguage) {
            navigate(localizedLocation, { replace: true });
        }
    }, [language, location.pathname, location.search, location.hash, navigate]);

    const setLanguage = useCallback((code) => {
        localStorage.setItem(STORAGE_KEY, code);
        setLanguageState(code);
        navigate(withLang(`${location.pathname}${location.search}${location.hash}`, code), { replace: true });
    }, [location.pathname, location.search, location.hash, navigate]);

    const value = useMemo(() => ({
        language,
        setLanguage,
        t: (key) => (translations[language] || translations.en)[key],
        messages: translations[language] || translations.en,
        localize: (destination) => withLang(destination, language),
    }), [language, setLanguage]);

    return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
};

export const useLocale = () => {
    const context = useContext(LocaleContext);
    if (!context) throw new Error('useLocale must be used inside LocaleProvider');
    return context;
};
