import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../context/I18nContext.jsx';

const provideOptions = [
  {
    key: 'index.sections.provide.item_1',
    image: '/assets/img/project/project-6.jpg',
    accent: '#f47e42',
    icon: 'ri-folder-image-line'
  },
  {
    key: 'index.sections.provide.item_2',
    image: '/assets/img/project/project-8.jpg',
    accent: '#11a4ba',
    icon: 'ri-secure-payment-line'
  },
  {
    key: 'index.sections.provide.item_3',
    image: '/assets/img/project/project-10.jpg',
    accent: '#5a75d9',
    icon: 'ri-database-2-line'
  },
  {
    key: 'index.sections.provide.item_4',
    image: '/assets/img/project/project-12.jpg',
    accent: '#8f6fdd',
    icon: 'ri-calendar-check-line'
  },
  {
    key: 'index.sections.provide.item_5',
    image: '/assets/img/project/project-14.jpg',
    accent: '#ef8a4e',
    icon: 'ri-camera-lens-line'
  }
];

const testimonialItems = [
  {
    quote: 'index.sections.testimonials.quote_1',
    author: 'index.sections.testimonials.author_1'
  },
  {
    quote: 'index.sections.testimonials.quote_2',
    author: 'index.sections.testimonials.author_2'
  }
];

const faqItems = [
  {
    question: 'index.sections.faq.q1.question',
    answer: 'index.sections.faq.q1.answer'
  },
  {
    question: 'index.sections.faq.q2.question',
    answer: 'index.sections.faq.q2.answer'
  },
  {
    question: 'index.sections.faq.q3.question',
    answer: 'index.sections.faq.q3.answer'
  },
  {
    question: 'index.sections.faq.q4.question',
    answer: 'index.sections.faq.q4.answer'
  }
];

export default function HomePage() {
  const { t, isRtl } = useI18n();
  const [activeProvideIndex, setActiveProvideIndex] = useState(0);
  const [activeTestimonialIndex, setActiveTestimonialIndex] = useState(0);
  const [activeFaqIndex, setActiveFaqIndex] = useState(0);

  const activeProvide = provideOptions[activeProvideIndex];

  useEffect(() => {
    document.title = t('index.title', 'C-KAM');
  }, [t]);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTestimonialIndex((prev) => (prev + 1) % testimonialItems.length);
    }, 6200);

    return () => clearInterval(timer);
  }, []);

  const nextIconClass = useMemo(() => (isRtl ? 'ri-arrow-left-s-line' : 'ri-arrow-right-s-line'), [isRtl]);
  const prevIconClass = useMemo(() => (isRtl ? 'ri-arrow-right-s-line' : 'ri-arrow-left-s-line'), [isRtl]);

  const moveTestimonial = (direction) => {
    setActiveTestimonialIndex((prev) => {
      const nextIndex = prev + direction;
      if (nextIndex < 0) return testimonialItems.length - 1;
      if (nextIndex >= testimonialItems.length) return 0;
      return nextIndex;
    });
  };

  return (
    <main className="client-sections">
      <section className="client-block" data-builder-section="hero">
        <div className="container">
          <div className="growth-card">
            <div className="growth-media" />
            <div className="growth-outline" />
            <div className="growth-content">
              <h1 className="growth-title" data-builder-field="title">{t('index.sections.growth.title', 'Your destination to grow your business')}</h1>
              <ul className="growth-points">
                <li>{t('index.sections.growth.point_1', 'Client database')}</li>
                <li>{t('index.sections.growth.point_2', 'Account management')}</li>
                <li>{t('index.sections.growth.point_3', 'Online payments')}</li>
                <li>{t('index.sections.growth.point_4', 'Client gallery')}</li>
              </ul>
              <a href="https://ckam-photographer.cyphersol.com/auth/login" className="client-btn" data-builder-field="primaryButtonText" data-builder-bind="text" data-builder-button="primary">
                {t('index.sections.growth.cta', 'Subscribe for free now')}
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="client-block pt-0" data-builder-section="growth">
        <div className="container">
          <h2 className="provide-title" data-builder-field="title">{t('index.sections.provide.title', 'What do we provide?')}</h2>
          <div className="provide-wrap">
            <div className="provide-mock" style={{ '--provide-accent': activeProvide.accent }}>
              <div className="mock-browser">
                <div className="mock-top-dots">
                  <span />
                  <span />
                  <span />
                </div>
                <div className="mock-stage">
                  <aside className="mock-sidebar">
                    <i className="ri-layout-grid-line" />
                    <i className="ri-pen-nib-line" />
                    <i className="ri-image-line" />
                    <i className="ri-settings-3-line" />
                    <i className="ri-camera-line" />
                    <i className="ri-palette-line" />
                    <i className="ri-links-line" />
                  </aside>
                  <div className="mock-main">
                    <div className="mock-nav">
                      <strong>M-Studio</strong>
                      <ul>
                        <li>{t('index.sections.provide.nav_home', 'Home')}</li>
                        <li>{t('index.sections.provide.nav_services', 'Services')}</li>
                        <li>{t('index.sections.provide.nav_gallery', 'Gallery')}</li>
                        <li>{t('index.sections.provide.nav_about', 'About')}</li>
                        <li>{t('index.sections.provide.nav_contact', 'Contact')}</li>
                      </ul>
                    </div>
                    <div className="mock-lock-chip">
                      <i className="ri-lock-line" />
                      <span>https://www.domain.com</span>
                    </div>
                    <div className="mock-gallery">
                      <div className="mock-blur left" />
                      <div className="mock-blur right" />
                      <img src={activeProvide.image} alt="Studio preview" />
                    </div>
                    <div className="mock-cta">{t('index.sections.provide.preview_cta', 'Book now')}</div>
                  </div>
                </div>
              </div>
              <div className="mock-palette">
                <div className="mock-palette-title">COLOUR</div>
                <div className="mock-palette-grid">
                  {Array.from({ length: 16 }).map((_, index) => (
                    <span key={`palette-${index}`} />
                  ))}
                </div>
              </div>
              <div className="mock-star">
                <i className="ri-star-fill" />
              </div>
              <div className="provide-preview-meta">
                <span className="provide-meta-dot" />
                <span>{t(activeProvide.key, 'Private showcase page for your work')}</span>
              </div>
            </div>
            <ul className="provide-list">
              {provideOptions.map((option, index) => (
                <li key={option.key}>
                  <button
                    type="button"
                    className={`provide-item provide-option ${activeProvideIndex === index ? 'active' : ''}`}
                    onClick={() => setActiveProvideIndex(index)}
                  >
                    <span className="provide-arrow">
                      <i className={nextIconClass} />
                    </span>
                    <span>{t(option.key, 'Service option')}</span>
                    <i className={option.icon} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="how-wrap" data-builder-section="services">
        <div className="container">
          <h2 className="how-title" data-builder-field="title">{t('index.sections.how.title', 'How can C-KAM help you?')}</h2>
          <p className="how-subtitle" data-builder-field="subtitle">{t('index.sections.how.subtitle', 'Our goal is to help you create a smooth and premium experience for you and your clients.')}</p>
          <div className="how-grid">
            <div className="how-pill"><span>{t('index.sections.how.card_1', 'Start selling while focused on clients')}</span><i className="ri-lightbulb-flash-line" /></div>
            <div className="how-pill"><span>{t('index.sections.how.card_2', 'Protect your rights and client payment rights')}</span><i className="ri-bank-card-line" /></div>
            <div className="how-pill"><span>{t('index.sections.how.card_3', 'Earn client respect with pro management')}</span><i className="ri-medal-2-line" /></div>
            <div className="how-pill"><span>{t('index.sections.how.card_4', 'Develop your relationship with every client')}</span><i className="ri-user-heart-line" /></div>
            <div className="how-pill"><span>{t('index.sections.how.card_5', 'Track costs and study your profits')}</span><i className="ri-money-dollar-circle-line" /></div>
            <div className="how-pill"><span>{t('index.sections.how.card_6', 'Get more time for creativity')}</span><i className="ri-line-chart-line" /></div>
          </div>
          <Link to="/features" className="client-btn" data-builder-field="primaryButtonText" data-builder-bind="text" data-builder-button="primary">{t('index.sections.how.more', 'More')}</Link>
        </div>
      </section>

      <section className="client-block" data-builder-section="faq">
        <div className="container">
          <h2 className="testi-title" data-builder-field="title">{t('index.sections.testimonials.title', 'Subscriber Reviews')}</h2>
          <div className="testi-frame">
            <div className="testi-card">
              <p>{t(testimonialItems[activeTestimonialIndex].quote, '')}</p>
              <h5>{t(testimonialItems[activeTestimonialIndex].author, '')}</h5>
            </div>
            <button className="testi-nav prev" type="button" onClick={() => moveTestimonial(-1)}>
              <i className={prevIconClass} />
            </button>
            <button className="testi-nav next" type="button" onClick={() => moveTestimonial(1)}>
              <i className={nextIconClass} />
            </button>
          </div>
          <div className="testi-line" />
          <div className="testi-cta">
            <a href="https://ckam-photographer.cyphersol.com/auth/login" className="client-btn" data-builder-field="primaryButtonText" data-builder-bind="text" data-builder-button="primary">{t('index.sections.testimonials.cta', 'Subscribe for free now')}</a>
          </div>

          <div className="faq-divider" />
          <h2 className="faq-title">{t('index.sections.faq.title', 'Frequently Asked Questions')}</h2>
          <div className="faq-drop"><i className="ri-arrow-down-s-line" /></div>
          <div className="faq-wrap">
            <div className="accordion faq-accordion">
              {faqItems.map((item, index) => {
                const expanded = activeFaqIndex === index;
                return (
                  <div className="accordion-item" key={item.question}>
                    <h3 className="accordion-header">
                      <button
                        className={`accordion-button ${expanded ? '' : 'collapsed'}`}
                        type="button"
                        aria-expanded={expanded}
                        onClick={() => setActiveFaqIndex((prev) => (prev === index ? -1 : index))}
                      >
                        <span className="faq-q-text">{t(item.question, '')}</span>
                        <span className="faq-toggle-icon" aria-hidden="true"><i className="ri-add-line" /></span>
                      </button>
                    </h3>
                    <div className={`accordion-collapse collapse ${expanded ? 'show' : ''}`}>
                      <div className="accordion-body">{t(item.answer, '')}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}


