import { Link } from 'react-router-dom';
import { useI18n } from '../context/I18nContext.jsx';

const socialLinks = [
  { href: 'https://facebook.com/', icon: 'ri-facebook-line', label: 'Facebook' },
  { href: 'https://twitter.com/', icon: 'ri-twitter-line', label: 'Twitter' },
  { href: 'https://instagram.com/', icon: 'ri-instagram-line', label: 'Instagram' },
  { href: 'https://linkedin.com/', icon: 'ri-linkedin-line', label: 'LinkedIn' }
];

export default function Footer() {
  const { t } = useI18n();

  return (
    <footer className="footer-wrap style1">
      <img src="/assets/img/footer-shape-1.png" alt="" className="footer-shape-one" />
      <img src="/assets/img/footer-shape-2.png" alt="" className="footer-shape-two" />
      <div className="container">
        <div className="row pt-100 pb-75 ckam-footer-row-compact">
          <div className="col-xl-4 col-lg-4 col-md-6 col-sm-6">
            <div className="footer-widget">
              <Link to="/" className="footer-logo">
                <img src="/assets/img/logo-white.png" alt="C-KAM" />
              </Link>
              <p className="comp-desc">{t('footer.newsletter_text', 'Subscribe to our newsletter for discounts and more latest offer.')}</p>
              <form className="newsletter-form" onSubmit={(event) => event.preventDefault()}>
                <input type="email" placeholder={t('footer.email_placeholder', 'Enter Your Email')} />
                <button type="submit">{t('footer.subscribe_now', 'SUBSCRIBE NOW')}</button>
              </form>
              <ul className="social-profile style1 list-style">
                {socialLinks.map((link) => (
                  <li key={link.href}>
                    <a target="_blank" rel="noreferrer" href={link.href} aria-label={link.label}>
                      <i className={link.icon} />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="col-xl-2 col-lg-2 col-md-6 col-sm-6">
            <div className="footer-widget">
              <h3 className="footer-widget-title">{t('footer.quick_links', 'Quick Links')}</h3>
              <ul className="footer-menu list-style">
                <li><Link to="/">{t('header.nav.home', 'Home')}</Link></li>
                <li><Link to="/features">{t('header.nav.features', 'Features')}</Link></li>
                <li><Link to="/pricing">{t('header.nav.pricing', 'Pricing')}</Link></li>
                <li><Link to="/blogs">{t('header.nav.blogs', 'Blogs')}</Link></li>
                <li><Link to="/contact">{t('footer.contact_us', 'Contact Us')}</Link></li>
              </ul>
            </div>
          </div>
          <div className="col-xl-3 col-lg-3 col-md-6 col-sm-6 ps-xl-4">
            <div className="footer-widget">
              <h3 className="footer-widget-title">{t('footer.follow_instagram', 'Follow Instagram')}</h3>
              <div className="insta-gallery">
                {[1, 2, 3, 4].map((item) => (
                  <a key={item} href={`/assets/img/instagram/insta-${item}.jpg`}>
                    <img src={`/assets/img/instagram/insta-${item}.jpg`} alt="" />
                  </a>
                ))}
              </div>
            </div>
          </div>
          <div className="col-xl-3 col-lg-3 col-md-6 col-sm-6">
            <div className="footer-widget">
              <h3 className="footer-widget-title">{t('footer.contact_us', 'Contact Us')}</h3>
              <ul className="contact-info list-style">
                <li>
                  <i className="ri-map-pin-fill" />
                  <p>{t('footer.address', '5961 De Santa Ave, Huntington Park, CA 90255, USA')}</p>
                </li>
                <li>
                  <i className="ri-phone-fill" />
                  <a href="tel:13454567877">+1-3454-5678-77</a>
                </li>
                <li>
                  <i className="ri-mail-open-fill" />
                  <a href="mailto:hello@ckam.io">hello@ckam.io</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <p className="copyright-text">
        <i className="ri-copyright-line" /> <span>C-KAM</span>. All Rights Reserved.
      </p>
    </footer>
  );
}


