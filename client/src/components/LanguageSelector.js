import { LANGUAGES } from '../i18n/locale';
import { useLocale } from '../i18n/LocaleContext';
import './LanguageSelector.css';

const LanguageSelector = () => {
    const { language, setLanguage, t } = useLocale();

    return (
        <label className="business-language-selector">
            <span className="visually-hidden">{t('language')}</span>
            <span aria-hidden="true">🌐</span>
            <select
                value={language}
                onChange={(event) => setLanguage(event.target.value)}
                aria-label={t('language')}
            >
                {LANGUAGES.map(({ code, label }) => (
                    <option key={code} value={code}>{label}</option>
                ))}
            </select>
        </label>
    );
};

export default LanguageSelector;
