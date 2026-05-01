import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../context/I18nContext.jsx';

const AUTH_URL = 'https://ckam-photographer.cyphersol.com/auth/login';

export default function PricingPage() {
  const { t } = useI18n();
  const [billingMode, setBillingMode] = useState('monthly');

  useEffect(() => {
    document.title = t('pricing_plan.title', 'Pricing');
  }, [t]);

  const isYearly = billingMode === 'yearly';
  const priceValue = isYearly ? '$374' : '$39';
  const pricePeriod = isYearly
    ? t('pricing_plan.pro.period_yearly', '/ year')
    : t('pricing_plan.pro.period_monthly', '/ month');
  const priceSave = isYearly
    ? t('pricing_plan.pro.save_yearly', 'You save $94 compared to monthly')
    : t('pricing_plan.pro.save_monthly', 'Save 20% with yearly billing');

  return (
    <main className="content-wrapper react-pricing-page">
      <section className="single-pricing-wrap" data-builder-section="hero">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8 col-xl-10">
              <div className="single-pricing-card">
                <div className="single-pricing-layout">
                  <div className="single-pricing-main" data-builder-section="plans">
                    <span className="single-pricing-badge">
                      <i className="ri-flashlight-line" />
                      <span>{t('pricing_plan.pro.badge', 'Recommended')}</span>
                    </span>
                    <h1 className="single-pricing-title" data-builder-field="title">{t('pricing_plan.pro.title', 'Pro Plan')}</h1>
                    <p className="single-pricing-subtitle" data-builder-field="subtitle">
                      {t(
                        'pricing_plan.pro.subtitle',
                        'One complete plan for photographers to manage bookings, clients, delivery, payments, and daily workflow.'
                      )}
                    </p>
                    <p className="single-pricing-trial">
                      {t('pricing_plan.pro.trial_highlight', '14-day free trial - no setup fees, cancel anytime.')}
                    </p>

                    <div className="single-pricing-points">
                      <div className="single-point-card">
                        <i className="ri-shield-check-line" />
                        <span>{t('pricing_plan.pro.point_1', 'No setup fees or hidden costs')}</span>
                      </div>
                      <div className="single-point-card">
                        <i className="ri-customer-service-2-line" />
                        <span>{t('pricing_plan.pro.point_2', 'Priority support for your workflow')}</span>
                      </div>
                    </div>

                    <div className="billing-switch" role="tablist" aria-label="Billing cycle switch">
                      <button
                        className={!isYearly ? 'active' : ''}
                        type="button"
                        onClick={() => setBillingMode('monthly')}
                      >
                        {t('pricing_plan.pro.monthly_label', 'Monthly')}
                      </button>
                      <button
                        className={isYearly ? 'active' : ''}
                        type="button"
                        onClick={() => setBillingMode('yearly')}
                      >
                        {t('pricing_plan.pro.yearly_label', 'Yearly')}
                      </button>
                    </div>

                    <div className="single-price-row">
                      <div className="single-price-value">{priceValue}</div>
                      <div className="single-price-period">{pricePeriod}</div>
                    </div>
                    <p className="single-price-save">{priceSave}</p>

                    <div className="single-pricing-actions">
                      <a href={AUTH_URL} className="single-pricing-cta" data-builder-field="primaryButtonText" data-builder-bind="text" data-builder-button="primary">{t('pricing_plan.pro.cta', 'Start Free Trial')}</a>
                      <Link to="/features" className="single-pricing-secondary" data-builder-field="secondaryButtonText" data-builder-bind="text" data-builder-button="secondary">{t('pricing_plan.pro.secondary_cta', 'View Features')}</Link>
                    </div>
                  </div>

                  <div className="single-pricing-feature-panel" data-builder-section="features">
                    <div className="single-feature-head">
                      <h2 data-builder-field="title">{t('pricing_plan.pro.panel_title', 'Everything included in one plan')}</h2>
                      <p data-builder-field="subtitle">{t('pricing_plan.pro.panel_subtitle', 'All core tools are active from day one.')}</p>
                    </div>
                    <ul className="single-pricing-features">
                      <li><i className="ri-checkbox-circle-fill" /><span>{t('pricing_plan.pro.features.f1', '')}</span></li>
                      <li><i className="ri-checkbox-circle-fill" /><span>{t('pricing_plan.pro.features.f2', '')}</span></li>
                      <li><i className="ri-checkbox-circle-fill" /><span>{t('pricing_plan.pro.features.f3', '')}</span></li>
                      <li><i className="ri-checkbox-circle-fill" /><span>{t('pricing_plan.pro.features.f4', '')}</span></li>
                      <li><i className="ri-checkbox-circle-fill" /><span>{t('pricing_plan.pro.features.f5', '')}</span></li>
                      <li><i className="ri-checkbox-circle-fill" /><span>{t('pricing_plan.pro.features.f6', '')}</span></li>
                      <li><i className="ri-checkbox-circle-fill" /><span>{t('pricing_plan.pro.features.f7', '')}</span></li>
                      <li><i className="ri-checkbox-circle-fill" /><span>{t('pricing_plan.pro.features.f8', '')}</span></li>
                      <li><i className="ri-checkbox-circle-fill" /><span>{t('pricing_plan.pro.features.f9', '')}</span></li>
                      <li><i className="ri-checkbox-circle-fill" /><span>{t('pricing_plan.pro.features.f10', '')}</span></li>
                    </ul>

                    <div className="single-feature-chips" data-builder-section="faq">
                      <span>{t('pricing_plan.pro.chip_1', 'Cancel anytime')}</span>
                      <span>{t('pricing_plan.pro.chip_2', 'Bilingual ready (EN/AR)')}</span>
                      <span>{t('pricing_plan.pro.chip_3', 'Professional booking flow')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
