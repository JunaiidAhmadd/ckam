import { useEffect } from 'react';
import { useI18n } from '../context/I18nContext.jsx';

export default function AboutPage() {
  const { t } = useI18n();

  useEffect(() => {
    document.title = t('about.title', 'About');
  }, [t]);

  return (
    <main className="content-wrapper react-about-page">
      <section className="features-wrap style2 pt-120 pb-90" data-builder-section="hero">
        <div className="container">
          <div className="section-title style2 text-center mb-40">
            <span className="sub-title" data-builder-field="eyebrow">{t('about.hero_kicker', 'About')}</span>
            <h1 data-builder-field="title">{t('about.hero_title', 'Building Better Client Experiences')}</h1>
            <p data-builder-field="subtitle">{t('about.hero_subtitle', 'Our story, values, and what drives us forward.')}</p>
            <a
              href="/contact"
              className="btn style1 mt-2"
              data-builder-button="primary"
              data-builder-field="primaryButtonText"
              data-builder-bind="text"
            >
              {t('about.hero_cta', 'Contact Us')}
            </a>
          </div>
        </div>
      </section>

      <section className="ptb-100" data-builder-section="content">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-xl-8 col-lg-10">
              <div className="content-title text-center mb-30">
                <h2 data-builder-field="title">{t('about.content_title', 'Who We Are')}</h2>
              </div>
              <p className="text-center mb-4" data-builder-field="description">
                {t('about.content_body', 'We help teams launch polished digital experiences with confidence and speed.')}
              </p>
              <div className="text-center">
                <a
                  href="/features"
                  className="btn style2"
                  data-builder-button="secondary"
                  data-builder-field="secondaryButtonText"
                  data-builder-bind="text"
                >
                  {t('about.secondary_cta', 'Explore Features')}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
