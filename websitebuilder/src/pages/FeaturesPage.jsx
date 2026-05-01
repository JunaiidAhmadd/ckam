import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../context/I18nContext.jsx';

const topTabItems = [
  {
    key: 'features_page.journey.tabs.private_showcase',
    titleKey: 'features_page.journey.board.private_showcase_title',
    subtitleKey: 'features_page.journey.board.private_showcase_subtitle',
    images: [
      '/assets/img/project/project-6.jpg',
      '/assets/img/project/project-12.jpg',
      '/assets/img/project/project-8.jpg',
      '/assets/img/project/project-10.jpg',
      '/assets/img/project/project-14.jpg'
    ]
  },
  {
    key: 'features_page.journey.tabs.booking_flow',
    titleKey: 'features_page.journey.board.booking_flow_title',
    subtitleKey: 'features_page.journey.board.booking_flow_subtitle',
    images: [
      '/assets/img/project/project-2.jpg',
      '/assets/img/project/project-3.jpg',
      '/assets/img/project/project-4.jpg',
      '/assets/img/project/project-5.jpg',
      '/assets/img/project/project-7.jpg'
    ]
  },
  {
    key: 'features_page.journey.tabs.delivery_contact',
    titleKey: 'features_page.journey.board.delivery_contact_title',
    subtitleKey: 'features_page.journey.board.delivery_contact_subtitle',
    images: [
      '/assets/img/project/project-8.jpg',
      '/assets/img/project/project-9.jpg',
      '/assets/img/project/project-10.jpg',
      '/assets/img/project/project-12.jpg',
      '/assets/img/project/project-13.jpg'
    ]
  },
  {
    key: 'features_page.journey.tabs.session_feedback',
    titleKey: 'features_page.journey.board.session_feedback_title',
    subtitleKey: 'features_page.journey.board.session_feedback_subtitle',
    images: [
      '/assets/img/project/project-6.jpg',
      '/assets/img/project/project-12.jpg',
      '/assets/img/project/project-8.jpg',
      '/assets/img/project/project-10.jpg',
      '/assets/img/project/project-14.jpg'
    ]
  },
  {
    key: 'features_page.journey.tabs.project_tracking',
    titleKey: 'features_page.journey.board.project_tracking_title',
    subtitleKey: 'features_page.journey.board.project_tracking_subtitle',
    images: [
      '/assets/img/project/project-15.jpg',
      '/assets/img/project/project-14.jpg',
      '/assets/img/project/project-13.jpg',
      '/assets/img/project/project-12.jpg',
      '/assets/img/project/project-10.jpg'
    ]
  }
];

const sideItems = [
  {
    key: 'features_page.journey.side.project_tracking',
    titleKey: 'features_page.journey.board.project_tracking_title',
    subtitleKey: 'features_page.journey.board.project_tracking_subtitle',
    images: [
      '/assets/img/project/project-15.jpg',
      '/assets/img/project/project-14.jpg',
      '/assets/img/project/project-13.jpg',
      '/assets/img/project/project-12.jpg',
      '/assets/img/project/project-10.jpg'
    ]
  },
  {
    key: 'features_page.journey.side.live_reports',
    titleKey: 'features_page.journey.board.live_reports_title',
    subtitleKey: 'features_page.journey.board.live_reports_subtitle',
    images: [
      '/assets/img/project/project-2.jpg',
      '/assets/img/project/project-3.jpg',
      '/assets/img/project/project-4.jpg',
      '/assets/img/project/project-5.jpg',
      '/assets/img/project/project-6.jpg'
    ]
  },
  {
    key: 'features_page.journey.side.client_database',
    titleKey: 'features_page.journey.board.client_database_title',
    subtitleKey: 'features_page.journey.board.client_database_subtitle',
    images: [
      '/assets/img/project/project-7.jpg',
      '/assets/img/project/project-8.jpg',
      '/assets/img/project/project-9.jpg',
      '/assets/img/project/project-10.jpg',
      '/assets/img/project/project-12.jpg'
    ]
  },
  {
    key: 'features_page.journey.side.auto_delivery',
    titleKey: 'features_page.journey.board.auto_delivery_title',
    subtitleKey: 'features_page.journey.board.auto_delivery_subtitle',
    images: [
      '/assets/img/project/project-10.jpg',
      '/assets/img/project/project-9.jpg',
      '/assets/img/project/project-12.jpg',
      '/assets/img/project/project-13.jpg',
      '/assets/img/project/project-14.jpg'
    ]
  },
  {
    key: 'features_page.journey.side.expense_log',
    titleKey: 'features_page.journey.board.expense_log_title',
    subtitleKey: 'features_page.journey.board.expense_log_subtitle',
    images: [
      '/assets/img/project/project-1.jpg',
      '/assets/img/project/project-2.jpg',
      '/assets/img/project/project-3.jpg',
      '/assets/img/project/project-4.jpg',
      '/assets/img/project/project-5.jpg'
    ]
  },
  {
    key: 'features_page.journey.side.project_calculator',
    titleKey: 'features_page.journey.board.project_calculator_title',
    subtitleKey: 'features_page.journey.board.project_calculator_subtitle',
    images: [
      '/assets/img/project/project-6.jpg',
      '/assets/img/project/project-7.jpg',
      '/assets/img/project/project-8.jpg',
      '/assets/img/project/project-9.jpg',
      '/assets/img/project/project-10.jpg'
    ]
  }
];

function HtmlText({ text }) {
  return <span dangerouslySetInnerHTML={{ __html: text }} />;
}

export default function FeaturesPage() {
  const { t, isRtl } = useI18n();
  const [activeTopIndex, setActiveTopIndex] = useState(3);
  const [activeSideIndex, setActiveSideIndex] = useState(0);
  const [previewSource, setPreviewSource] = useState(topTabItems[3]);

  useEffect(() => {
    document.title = t('features_page.title', 'Features');
  }, [t]);

  const flowHead = useMemo(() => {
    if (isRtl) {
      return {
        leftKey: 'features_page.flow.you',
        leftIcon: 'ri-user-3-line',
        rightKey: 'features_page.flow.client',
        rightIcon: 'ri-user-heart-line'
      };
    }
    return {
      leftKey: 'features_page.flow.client',
      leftIcon: 'ri-user-heart-line',
      rightKey: 'features_page.flow.you',
      rightIcon: 'ri-user-3-line'
    };
  }, [isRtl]);

  const activateTopTab = (index) => {
    setActiveTopIndex(index);
    setPreviewSource(topTabItems[index]);
  };

  const activateSideItem = (index) => {
    setActiveSideIndex(index);
    setPreviewSource(sideItems[index]);
  };

  return (
    <main className="features-page-wrap">
      <section className="features-hero" data-builder-section="hero">
        <div className="container">
          <div className="features-hero-layout">
            <div className="features-visual">
              <div className="feature-device back">
                <div className="feature-screen">
                  <div className="feature-screen-top">
                    <span>M-Studio</span>
                    <div className="feature-screen-menu">
                      <span>{t('features_page.hero.menu_contact', 'Contact')}</span>
                      <span>{t('features_page.hero.menu_gallery', 'Gallery')}</span>
                    </div>
                  </div>
                  <div className="feature-screen-copy">
                    <h4>{t('features_page.hero.welcome', 'Welcome to C-KAM')}</h4>
                    <p>{t('features_page.hero.who_are_you', 'Who are you?')}</p>
                    <div className="feature-screen-actions">
                      <span>{t('features_page.hero.photographer', 'Photographer')}</span>
                      <span>{t('features_page.hero.client', 'Client')}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="feature-device front">
                <div className="feature-screen">
                  <div className="feature-screen-top">
                    <span>M-Studio</span>
                    <div className="feature-screen-menu">
                      <span>{t('features_page.hero.menu_home', 'Home')}</span>
                      <span>{t('features_page.hero.menu_services', 'Services')}</span>
                      <span>{t('features_page.hero.menu_gallery', 'Gallery')}</span>
                    </div>
                  </div>
                  <div className="feature-screen-copy">
                    <h4>{t('features_page.hero.welcome', 'Welcome to C-KAM')}</h4>
                    <p>{t('features_page.hero.who_are_you', 'Who are you?')}</p>
                    <div className="feature-screen-actions">
                      <span>{t('features_page.hero.photographer', 'Photographer')}</span>
                      <span>{t('features_page.hero.client', 'Client')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="feature-content">
              <h1 data-builder-field="title">{t('features_page.hero.title', 'Elevate your client experience')}</h1>
              <p data-builder-field="subtitle">{t('features_page.hero.subtitle', 'Our goal in C-KAM is to help you create a premium and easy experience for you and your client.')}</p>
              <a href="https://ckam-photographer.cyphersol.com/auth/login" className="hero-btn" data-builder-field="primaryButtonText" data-builder-bind="text" data-builder-button="primary">{t('features_page.hero.cta', 'Subscribe for free now')}</a>
            </div>
          </div>
        </div>
        <div className="features-hero-wave" />
        <div className="features-hero-down"><i className="ri-arrow-down-s-line" /></div>
      </section>

      <section className="journey-section" data-builder-section="feature-grid">
        <div className="container">
          <h2 className="journey-title" data-builder-field="title">{t('features_page.journey.title', 'Features that serve every stage of your work')}</h2>
          <ul className="journey-top-tabs">
            {topTabItems.map((item, index) => (
              <li
                key={item.key}
                className={activeTopIndex === index ? 'active' : ''}
                onClick={() => activateTopTab(index)}
              >
                {t(item.key, '')}
              </li>
            ))}
          </ul>

          <p className="journey-subtitle" data-builder-field="subtitle">{t(previewSource.subtitleKey, '')}</p>

          <div className="journey-content">
            <div className="journey-board">
              <div className="journey-board-top">
                <span className="journey-submit">{t('features_page.journey.submit', 'SUBMIT')}</span>
              </div>
              <div className="journey-board-inner">
                <h3 data-builder-field="description">{t(previewSource.titleKey, '')}</h3>
                <p data-builder-field="eyebrow">{t('features_page.journey.by_line', 'BY SANDER DESIGN')}</p>
                <div className="journey-photo-grid">
                  {previewSource.images.map((imagePath, index) => (
                    <img key={`${imagePath}-${index}`} src={imagePath} alt={`Journey ${index + 1}`} />
                  ))}
                </div>
              </div>
            </div>

            <ul className="journey-right-list">
              {sideItems.map((item, index) => (
                <li
                  key={item.key}
                  className={activeSideIndex === index ? 'active' : ''}
                  onClick={() => activateSideItem(index)}
                >
                  <HtmlText text={t(item.key, '')} />
                </li>
              ))}
            </ul>
          </div>

          <div className="journey-cta-wrap">
            <a href="https://ckam-photographer.cyphersol.com/auth/login" className="journey-cta" data-builder-field="primaryButtonText" data-builder-bind="text" data-builder-button="primary">{t('features_page.journey.cta', 'Subscribe for free now')}</a>
          </div>
        </div>
      </section>

      <section className="flow-section" data-builder-section="workflow">
        <div className="container">
          <h2 className="flow-title" data-builder-field="title">{t('features_page.flow.title', 'The easiest way to communicate with your client')}</h2>

          <div className="flow-head">
            <div className="flow-head-item left">
              <span className="flow-head-circle"><i className={flowHead.leftIcon} /></span>
              <p>{t(flowHead.leftKey, '')}</p>
            </div>
            <div className="flow-head-item right">
              <span className="flow-head-circle"><i className={flowHead.rightIcon} /></span>
              <p>{t(flowHead.rightKey, '')}</p>
            </div>
          </div>

          <div className="flow-diagram">
            <span className="flow-center-line" />
            <span className="flow-right-track" />
            <span className="flow-dot dot-1" />
            <span className="flow-dot dot-2" />
            <span className="flow-dot dot-3" />
            <span className="flow-dot dot-4" />
            <span className="flow-dot dot-5" />

            <div className="flow-card flow-card-top">
              <div className="flow-card-head">
                <i className="ri-camera-2-line" />
                <span>{t('features_page.flow.card_top', 'Bookings')}</span>
              </div>
              <img src="/assets/img/project/project-12.jpg" alt="Flow top" />
            </div>

            <div className="flow-card flow-card-mid">
              <div className="flow-card-head">
                <i className="ri-camera-2-line" />
                <span>{t('features_page.flow.card_mid', 'Session photos - Session feedback')}</span>
              </div>
              <img src="/assets/img/project/project-10.jpg" alt="Flow middle" />
            </div>

            <div className="flow-card flow-card-small">
              <img src="/assets/img/project/project-14.jpg" alt="Flow small" />
            </div>

            <div className="flow-phone">
              <div className="flow-phone-screen">
                <div className="flow-check"><i className="ri-check-line" /></div>
                <h4 data-builder-field="subtitle">{t('features_page.flow.phone_title', 'Thank you, Peter!')}</h4>
                <p data-builder-field="description" data-builder-bind="html" dangerouslySetInnerHTML={{ __html: t('features_page.flow.phone_sub', "Let's create<br>something special") }} />
              </div>
            </div>

            <span className="flow-connector flow-connector-a" />
            <span className="flow-connector flow-connector-b" />
            <span className="flow-connector flow-connector-c" />

            <div className="flow-money-wrap">
              <div className="flow-money-bag"><i className="ri-money-dollar-circle-line" /></div>
            </div>
          </div>

          <div className="flow-cta-wrap">
            <a href="https://ckam-photographer.cyphersol.com/auth/login" className="flow-cta" data-builder-field="primaryButtonText" data-builder-bind="text" data-builder-button="primary">{t('features_page.flow.cta', 'Start now')}</a>
          </div>
        </div>
      </section>

      <section className="fields-section" data-builder-section="fields-extra">
        <div className="container">
          <h2 className="fields-title" data-builder-field="title">{t('features_page.fields.title', 'For photographers in every niche')}</h2>
          <p className="fields-subtitle" data-builder-field="subtitle">{t('features_page.fields.subtitle', 'Whatever your niche is, C-KAM supports you with exclusive features')}</p>

          <div className="fields-grid fields-grid-top">
            <article className="field-card">
              <img data-builder-field="image" data-builder-bind="src" src="/assets/img/project/project-7.jpg" alt="Portrait photography" />
            </article>
            <article className="field-card">
              <img src="/assets/img/project/project-5.jpg" alt="Food photography" />
            </article>
            <article className="field-card">
              <img src="/assets/img/project/project-10.jpg" alt="Wedding photography" />
            </article>
            <article className="field-card field-card-overlay">
              <img src="/assets/img/project/project-4.jpg" alt="Fashion photography" />
              <div className="field-overlay">
                <span data-builder-field="description">{t('features_page.fields.overlay', 'Fashion & beauty photography')}</span>
              </div>
            </article>
          </div>

          <div className="fields-grid fields-grid-bottom">
            <article className="field-card">
              <img src="/assets/img/project/project-9.jpg" alt="Product photography" />
            </article>
            <article className="field-card">
              <img src="/assets/img/project/project-2.jpg" alt="Studio photography" />
            </article>
            <article className="field-card">
              <img src="/assets/img/project/project-6.jpg" alt="Family photography" />
            </article>
          </div>
        </div>
      </section>

      <section className="difference-section" data-builder-section="difference-extra">
        <div className="difference-intro">
          <div className="container">
            <h2 className="difference-title" data-builder-field="title">{t('features_page.difference.title', 'How does using C-KAM make a difference?')}</h2>
            <p className="difference-subtitle" data-builder-field="subtitle">{t('features_page.difference.subtitle', 'Our goal in C-KAM is to help you create a premium and easy experience for you and your client.')}</p>
            <div className="difference-down"><i className="ri-arrow-down-s-line" /></div>
          </div>
        </div>
        <div className="difference-list-wrap">
          <div className="container">
            <div className="difference-list-grid">
              <ul className="difference-list">
                <li><span>{t('features_page.difference.items.item_1', '')}</span><i className="ri-lightbulb-flash-line" /></li>
                <li><span>{t('features_page.difference.items.item_2', '')}</span><i className="ri-bank-card-line" /></li>
                <li><span>{t('features_page.difference.items.item_3', '')}</span><i className="ri-medal-2-line" /></li>
              </ul>
              <ul className="difference-list">
                <li><span>{t('features_page.difference.items.item_4', '')}</span><i className="ri-user-heart-line" /></li>
                <li><span>{t('features_page.difference.items.item_5', '')}</span><i className="ri-money-dollar-circle-line" /></li>
                <li><span>{t('features_page.difference.items.item_6', '')}</span><i className="ri-line-chart-line" /></li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="outcomes-section" data-builder-section="cta">
        <div className="container">
          <h2 className="outcomes-title" data-builder-field="title">{t('features_page.outcomes.title', 'With C-KAM you will get ..')}</h2>

          <div className="outcomes-grid">
            <ul className="outcomes-list">
              <li><span>{t('features_page.outcomes.items.item_1', '')}</span><i className="ri-send-plane-line" /></li>
              <li><span>{t('features_page.outcomes.items.item_2', '')}</span><i className="ri-file-list-3-line" /></li>
              <li><span>{t('features_page.outcomes.items.item_3', '')}</span><i className="ri-money-dollar-box-line" /></li>
            </ul>
            <ul className="outcomes-list">
              <li><span>{t('features_page.outcomes.items.item_4', '')}</span><i className="ri-bar-chart-box-line" /></li>
              <li><span>{t('features_page.outcomes.items.item_5', '')}</span><i className="ri-hand-coin-line" /></li>
              <li><span>{t('features_page.outcomes.items.item_6', '')}</span><i className="ri-file-shield-2-line" /></li>
            </ul>
            <ul className="outcomes-list">
              <li><span>{t('features_page.outcomes.items.item_7', '')}</span><i className="ri-timer-flash-line" /></li>
              <li><span>{t('features_page.outcomes.items.item_8', '')}</span><i className="ri-camera-lens-line" /></li>
              <li><span>{t('features_page.outcomes.items.item_9', '')}</span><i className="ri-briefcase-4-line" /></li>
            </ul>
          </div>

          <div className="outcomes-cta-wrap">
            <a href="https://ckam-photographer.cyphersol.com/auth/login" className="outcomes-cta" data-builder-field="primaryButtonText" data-builder-bind="text" data-builder-button="primary">{t('features_page.outcomes.cta', 'Subscribe now')}</a>
          </div>
        </div>
      </section>
    </main>
  );
}


