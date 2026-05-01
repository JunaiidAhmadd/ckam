import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../context/I18nContext.jsx';

export default function TermsPage() {
  const { t } = useI18n();

  useEffect(() => {
    document.title = t('terms_page.title', 'Terms of Service');
  }, [t]);

  const privacyHtml = t('terms_page.side.privacy_html', 'See also our <a href="/privacy-policy">Privacy Policy</a>.')
    .replace(/privacy-policy\.html/g, '/privacy-policy')
    .replace(/terms-of-service\.html/g, '/terms-of-service');

  const contactHtml = t('terms_page.sections.contact.body_html', 'For legal questions, contact us at <a href="mailto:support@ckam.io">support@ckam.io</a>.')
    .replace(/privacy-policy\.html/g, '/privacy-policy')
    .replace(/terms-of-service\.html/g, '/terms-of-service');

  return (
    <main className="content-wrapper react-legal-page">
      <section className="legal-hero" data-builder-section="hero">
        <div className="container">
          <span className="legal-kicker"><i className="ri-article-line" /><span>{t('terms_page.kicker', 'Legal')}</span></span>
          <h1 className="legal-title" data-builder-field="title">{t('terms_page.hero_title', 'Terms of Service')}</h1>
          <p className="legal-subtitle" data-builder-field="subtitle">{t('terms_page.hero_subtitle', '')}</p>
        </div>
      </section>

      <section className="legal-shell" data-builder-section="content">
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-8">
              <div className="legal-card">
                <div className="legal-meta">
                  <span className="legal-chip">{t('terms_page.meta.updated', '')}</span>
                  <span className="legal-chip">{t('terms_page.meta.scope', '')}</span>
                </div>
                <p className="legal-content" data-builder-field="description">{t('terms_page.intro', '')}</p>

                <div className="legal-section" id="acceptance">
                  <h3>{t('terms_page.sections.acceptance.title', '')}</h3>
                  <p>{t('terms_page.sections.acceptance.body', '')}</p>
                </div>

                <div className="legal-section" id="services">
                  <h3>{t('terms_page.sections.services.title', '')}</h3>
                  <p>{t('terms_page.sections.services.body', '')}</p>
                </div>

                <div className="legal-section" id="account">
                  <h3>{t('terms_page.sections.account.title', '')}</h3>
                  <ul>
                    <li>{t('terms_page.sections.account.li1', '')}</li>
                    <li>{t('terms_page.sections.account.li2', '')}</li>
                    <li>{t('terms_page.sections.account.li3', '')}</li>
                  </ul>
                </div>

                <div className="legal-section" id="billing">
                  <h3>{t('terms_page.sections.billing.title', '')}</h3>
                  <p>{t('terms_page.sections.billing.body', '')}</p>
                </div>

                <div className="legal-section" id="cancellation">
                  <h3>{t('terms_page.sections.cancellation.title', '')}</h3>
                  <p>{t('terms_page.sections.cancellation.body', '')}</p>
                </div>

                <div className="legal-section" id="content">
                  <h3>{t('terms_page.sections.content.title', '')}</h3>
                  <p>{t('terms_page.sections.content.body', '')}</p>
                </div>

                <div className="legal-section" id="prohibited">
                  <h3>{t('terms_page.sections.prohibited.title', '')}</h3>
                  <ul>
                    <li>{t('terms_page.sections.prohibited.li1', '')}</li>
                    <li>{t('terms_page.sections.prohibited.li2', '')}</li>
                    <li>{t('terms_page.sections.prohibited.li3', '')}</li>
                  </ul>
                </div>

                <div className="legal-section" id="liability">
                  <h3>{t('terms_page.sections.liability.title', '')}</h3>
                  <p>{t('terms_page.sections.liability.body', '')}</p>
                </div>

                <div className="legal-section" id="termination">
                  <h3>{t('terms_page.sections.termination.title', '')}</h3>
                  <p>{t('terms_page.sections.termination.body', '')}</p>
                </div>

                <div className="legal-section" id="law">
                  <h3>{t('terms_page.sections.law.title', '')}</h3>
                  <p>{t('terms_page.sections.law.body', '')}</p>
                </div>

                <div className="legal-section" id="contact">
                  <h3>{t('terms_page.sections.contact.title', '')}</h3>
                  <p dangerouslySetInnerHTML={{ __html: contactHtml }} />
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="legal-card legal-side">
                <h4>{t('terms_page.side.title', 'On this page')}</h4>
                <ul className="legal-nav">
                  <li><a href="#acceptance">{t('terms_page.side.i1', 'Acceptance')}</a></li>
                  <li><a href="#services">{t('terms_page.side.i2', 'Services')}</a></li>
                  <li><a href="#account">{t('terms_page.side.i3', 'Account')}</a></li>
                  <li><a href="#billing">{t('terms_page.side.i4', 'Billing')}</a></li>
                  <li><a href="#content">{t('terms_page.side.i5', 'Content & IP')}</a></li>
                  <li><a href="#liability">{t('terms_page.side.i6', 'Liability')}</a></li>
                </ul>
                <div className="legal-link-card">
                  <p className="legal-content" dangerouslySetInnerHTML={{ __html: privacyHtml }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}


