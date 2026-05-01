import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useI18n } from '../context/I18nContext.jsx';
import LanguageSwitcher from './LanguageSwitcher.jsx';

const AUTH_URL = 'https://ckam-photographer.cyphersol.com/auth/login';

const navItems = [
  { to: '/', key: 'header.nav.home', label: 'Home' },
  { to: '/features', key: 'header.nav.features', label: 'Features' },
  { to: '/pricing', key: 'header.nav.pricing', label: 'Pricing' },
  { to: '/blogs', key: 'header.nav.blogs', label: 'Blogs' },
  { to: '/contact', key: 'header.nav.contact_us', label: 'Contact Us' }
];

export default function Header() {
  const { t } = useI18n();
  const [isSticky, setIsSticky] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setIsSticky(window.scrollY > 40);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <header className={`header-wrap style1 ${isSticky ? 'sticky' : ''}`}>
      <div className="container">
        <nav className="navbar navbar-expand-md navbar-light">
          <NavLink className="navbar-brand" to="/" onClick={closeMobileMenu}>
            <img className="logo-light" src="/assets/img/logo.png" alt="C-KAM" />
            <img className="logo-dark" src="/assets/img/logo-white.png" alt="C-KAM" />
          </NavLink>

          <div className="mobile-bar-wrap">
            <div className="mobile-menu">
              <a
                href="#menu"
                aria-label="Toggle menu"
                onClick={(e) => {
                  e.preventDefault();
                  setIsMobileMenuOpen((prev) => !prev);
                }}
              >
                <i className={isMobileMenuOpen ? 'ri-close-line' : 'ri-menu-line'} />
              </a>
            </div>
          </div>

          <div className={`navbar-collapse main-menu-wrap ${isMobileMenuOpen ? 'open' : ''}`}>
            <div className="menu-close">
              <i
                className="ri-close-line"
                role="button"
                tabIndex={0}
                aria-label="Close menu"
                onClick={closeMobileMenu}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    closeMobileMenu();
                  }
                }}
              />
            </div>

            <ul className="navbar-nav mx-auto">
              {navItems.map((item) => (
                <li className="nav-item" key={item.to}>
                  <NavLink className="nav-link" to={item.to} onClick={closeMobileMenu}>
                    {t(item.key, item.label)}
                  </NavLink>
                </li>
              ))}
            </ul>

            <div className="other-options">
              <div className="option-item">
                <a href={AUTH_URL} className="btn style1 btn-outline btn-login">
                  {t('header.nav.login', 'Login')}
                </a>
              </div>
              <div className="option-item">
                <LanguageSwitcher />
              </div>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}
