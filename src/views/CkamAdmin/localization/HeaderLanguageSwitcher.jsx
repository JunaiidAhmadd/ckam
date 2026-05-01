import React from 'react';
import { Dropdown } from 'react-bootstrap';
import { useCkamAdmin } from '../context';
import { adminCopy } from './i18n';

const LanguageToggle = React.forwardRef(({ children, onClick }, ref) => (
    <button
        ref={ref}
        type="button"
        className="ckam-language-toggle"
        onClick={(event) => {
            event.preventDefault();
            onClick(event);
        }}
    >
        {children}
    </button>
));

LanguageToggle.displayName = 'LanguageToggle';

const HeaderLanguageSwitcher = () => {
    const { locale, setLocale, isArabic } = useCkamAdmin();
    const copy = adminCopy[locale];
    const languages = [
        {
            value: 'en',
            label: adminCopy.en.localeLabel,
            short: adminCopy.en.localeShort,
            flagClass: 'flag-icon-us',
        },
        {
            value: 'ar',
            label: adminCopy.ar.localeLabel,
            short: adminCopy.ar.localeShort,
            flagClass: 'flag-icon-sa',
        },
    ];
    const activeLanguage = languages.find((item) => item.value === locale) || languages[0];

    return (
        <Dropdown align={isArabic ? 'start' : 'end'} className="ckam-header-language ckam-language-dropdown">
            <Dropdown.Toggle as={LanguageToggle}>
                <span className="ckam-language-toggle-code">{activeLanguage.short}</span>
                <i className="bi bi-chevron-down" />
            </Dropdown.Toggle>
            <Dropdown.Menu className="ckam-language-menu">
                <div className="ckam-language-menu-label">{copy.switcherLabel}</div>
                {languages.map((item) => (
                    <Dropdown.Item
                        as="button"
                        key={item.value}
                        type="button"
                        onClick={() => setLocale(item.value)}
                        className={`ckam-language-option${locale === item.value ? ' active' : ''}`}
                    >
                        <span className="ckam-language-option-content">
                            <span className={`flag-icon ${item.flagClass}`} />
                            <span>{item.label}</span>
                        </span>
                        {locale === item.value ? (
                            <span className="ckam-language-option-badge">
                                {locale === 'ar' ? 'نشط' : 'Active'}
                            </span>
                        ) : null}
                    </Dropdown.Item>
                ))}
            </Dropdown.Menu>
        </Dropdown>
    );
};

export default HeaderLanguageSwitcher;

