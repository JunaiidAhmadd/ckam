import { useEffect } from 'react';
import { useI18n } from '../context/I18nContext.jsx';

export default function ContactPage() {
  const { t } = useI18n();

  useEffect(() => {
    document.title = t('contact.title', 'Contact');
  }, [t]);

  const agreeHtml = t(
    'contact.form.agree_html',
    'I agree to the <a class="link style1" href="/terms-of-service">terms &amp; conditions</a> and <a class="link style1" href="/privacy-policy">privacy policy</a>'
  )
    .replace(/terms-of-service\.html/g, '/terms-of-service')
    .replace(/privacy-policy\.html/g, '/privacy-policy');

  return (
    <main className="content-wrapper react-contact-page">
      <section className="contact-us-wrap pt-200 pb-100" data-builder-section="hero">
        <div className="container">
          <div className="row gx-5">
            <div className="col-lg-6 col-12">
              <div className="contact-content" data-builder-section="contact-info">
                <div className="content-title">
                  <h1 data-builder-field="title">{t('contact.page_title', 'Get In Touch With Us')}</h1>
                  <p data-builder-field="subtitle">{t('contact.description', '')}</p>
                </div>
                <ul className="contact-info list-style">
                  <li>
                    <i className="ri-map-pin-fill" />
                    <p data-builder-field="address">{t('contact.info.address', '')}</p>
                  </li>
                  <li>
                    <i className="ri-phone-fill" />
                    <a href="tel:13454567877" data-builder-field="phone">+1-3454-5678-77</a>
                  </li>
                  <li>
                    <i className="ri-mail-open-fill" />
                    <a href="mailto:support@ckam.io" data-builder-field="email">support@ckam.io</a>
                  </li>
                </ul>
                <div className="social-link">
                  <h6>{t('contact.follow_us', 'Follow Us:')}</h6>
                  <ul className="social-profile style4 list-style">
                    <li><a target="_blank" rel="noreferrer" href="https://facebook.com/"><i className="ri-facebook-fill" /></a></li>
                    <li><a target="_blank" rel="noreferrer" href="https://twitter.com/"><i className="ri-twitter-fill" /></a></li>
                    <li><a target="_blank" rel="noreferrer" href="https://instagram.com/"><i className="ri-instagram-fill" /></a></li>
                    <li><a target="_blank" rel="noreferrer" href="https://linkedin.com/"><i className="ri-linkedin-fill" /></a></li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="col-lg-6 col-12">
              <div className="contact-form" data-builder-section="form">
                <form className="form-wrap" id="contactForm" onSubmit={(e) => e.preventDefault()}>
                  <div className="form-group">
                    <input type="text" name="name" placeholder={t('contact.form.name', 'Your Name*')} required />
                  </div>
                  <div className="form-group">
                    <input type="email" name="email" placeholder={t('contact.form.email', 'Your Email*')} required />
                  </div>
                  <div className="form-group">
                    <input type="text" name="msg_subject" placeholder={t('contact.form.subject', 'Subject*')} required />
                  </div>
                  <div className="form-group v1">
                    <textarea name="message" placeholder={t('contact.form.message', 'Your Message..')} cols="30" rows="10" required />
                  </div>
                  <div className="form-group">
                    <div className="form-check checkbox">
                      <input name="gridCheck" className="form-check-input" type="checkbox" id="gridCheck" required />
                      <label className="form-check-label" htmlFor="gridCheck">
                        <span dangerouslySetInnerHTML={{ __html: agreeHtml }} />
                      </label>
                    </div>
                  </div>
                  <div className="col-md-12">
                    <button type="submit" className="btn style1 w-100 d-block" data-builder-field="submitLabel" data-builder-bind="text" data-builder-button="primary">{t('contact.form.send_message', 'SEND MESSAGE')}</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}




