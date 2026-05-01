import { useEffect } from 'react';
import { useI18n } from '../context/I18nContext.jsx';

export default function PrivacyPage() {
  const { t } = useI18n();

  useEffect(() => {
    document.title = t('privacy_page.title', 'Privacy Policy');
  }, [t]);

  const termsHtml = t('privacy_page.side.terms_html', 'See also our <a href="/terms-of-service">Terms of Service</a>.')
    .replace(/privacy-policy\.html/g, '/privacy-policy')
    .replace(/terms-of-service\.html/g, '/terms-of-service');

  const contactHtml = t('privacy_page.sections.contact.body_html', 'For privacy inquiries, contact us at <a href="mailto:support@ckam.io">support@ckam.io</a>.')
    .replace(/privacy-policy\.html/g, '/privacy-policy')
    .replace(/terms-of-service\.html/g, '/terms-of-service');

  return (
    <main className="content-wrapper react-legal-page">
      <section className="legal-hero" data-builder-section="hero">
        <div className="container">
          <span className="legal-kicker"><i className="ri-shield-keyhole-line" /><span>{t('privacy_page.kicker', 'Legal')}</span></span>
          <h1 className="legal-title" data-builder-field="title">{t('privacy_page.hero_title', 'Privacy Policy')}</h1>
          <p className="legal-subtitle" data-builder-field="subtitle">{t('privacy_page.hero_subtitle', '')}</p>
        </div>
      </section>

      <section className="legal-shell" data-builder-section="content">
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-8">
              <div className="legal-card">
                <div className="legal-meta">
                  <span className="legal-chip">{t('privacy_page.meta.updated', '')}</span>
                  <span className="legal-chip">{t('privacy_page.meta.scope', '')}</span>
                </div>
                <p className="legal-content" data-builder-field="description">{t('privacy_page.intro', '')}</p>

                <div className="legal-section" id="collect">
                  <h3>{t('privacy_page.sections.collect.title', '')}</h3>
                  <ul>
                    <li>{t('privacy_page.sections.collect.li1', '')}</li>
                    <li>{t('privacy_page.sections.collect.li2', '')}</li>
                    <li>{t('privacy_page.sections.collect.li3', '')}</li>
                  </ul>
                </div>

                <div className="legal-section" id="use">
                  <h3>{t('privacy_page.sections.use.title', '')}</h3>
                  <p>{t('privacy_page.sections.use.body', '')}</p>
                </div>

                <div className="legal-section" id="share">
                  <h3>{t('privacy_page.sections.share.title', '')}</h3>
                  <p>{t('privacy_page.sections.share.body', '')}</p>
                </div>

                <div className="legal-section" id="cookies">
                  <h3>{t('privacy_page.sections.cookies.title', '')}</h3>
                  <p>{t('privacy_page.sections.cookies.body', '')}</p>
                </div>

                <div className="legal-section" id="retention">
                  <h3>{t('privacy_page.sections.retention.title', '')}</h3>
                  <p>{t('privacy_page.sections.retention.body', '')}</p>
                </div>

                <div className="legal-section" id="security">
                  <h3>{t('privacy_page.sections.security.title', '')}</h3>
                  <p>{t('privacy_page.sections.security.body', '')}</p>
                </div>

                <div className="legal-section" id="rights">
                  <h3>{t('privacy_page.sections.rights.title', '')}</h3>
                  <ul>
                    <li>{t('privacy_page.sections.rights.li1', '')}</li>
                    <li>{t('privacy_page.sections.rights.li2', '')}</li>
                    <li>{t('privacy_page.sections.rights.li3', '')}</li>
                  </ul>
                </div>

                <div className="legal-section" id="updates">
                  <h3>{t('privacy_page.sections.updates.title', '')}</h3>
                  <p>{t('privacy_page.sections.updates.body', '')}</p>
                </div>

                <div className="legal-section" id="contact">
                  <h3>{t('privacy_page.sections.contact.title', '')}</h3>
                  <p dangerouslySetInnerHTML={{ __html: contactHtml }} />
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="legal-card legal-side">
                <h4>{t('privacy_page.side.title', 'On this page')}</h4>
                <ul className="legal-nav">
                  <li><a href="#collect">{t('privacy_page.side.i1', 'Information collected')}</a></li>
                  <li><a href="#use">{t('privacy_page.side.i2', 'How we use data')}</a></li>
                  <li><a href="#share">{t('privacy_page.side.i3', 'Sharing')}</a></li>
                  <li><a href="#security">{t('privacy_page.side.i4', 'Security')}</a></li>
                  <li><a href="#rights">{t('privacy_page.side.i5', 'Your rights')}</a></li>
                  <li><a href="#updates">{t('privacy_page.side.i6', 'Updates')}</a></li>
                </ul>
                <div className="legal-link-card">
                  <p className="legal-content" dangerouslySetInnerHTML={{ __html: termsHtml }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

