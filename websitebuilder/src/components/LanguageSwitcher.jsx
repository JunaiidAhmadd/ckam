import { useState } from 'react';
import { useI18n } from '../context/I18nContext.jsx';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useI18n();
  const [open, setOpen] = useState(false);
  const isArabic = language === 'ar';

  const chooseLanguage = (nextLanguage) => {
    setLanguage(nextLanguage);
    setOpen(false);
  };

  return (
    <div className={`language-selector ${open ? 'active' : ''}`}>
      <button className="language-btn" type="button" onClick={() => setOpen((value) => !value)}>
        <span className="language-flag">{isArabic ? 'AR' : 'EN'}</span>
        <span className="language-text">{isArabic ? 'العربية' : 'English'}</span>
        <i className="ri-arrow-down-s-line" />
      </button>
      <div className="language-dropdown">
        <button className="language-option" type="button" onClick={() => chooseLanguage('en')}>
          <span className="flag">EN</span>
          <span>English</span>
        </button>
        <button className="language-option" type="button" onClick={() => chooseLanguage('ar')}>
          <span className="flag">AR</span>
          <span>العربية</span>
        </button>
      </div>
    </div>
  );
}
