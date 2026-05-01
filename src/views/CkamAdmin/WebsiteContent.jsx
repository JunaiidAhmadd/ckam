import React, { useEffect, useState } from 'react';
import { Button, Col, Form, Row } from 'react-bootstrap';
import { useCkamAdmin } from './context';
import { adminCopy, getLocalizedValue, getStatusLabel } from './localization/i18n';
import {
    MetricCard,
    normalizeTranslationLocale,
    SectionCard,
    StatusPill,
    TranslationViewSelect,
    useAdminPageSetup,
} from './shared';

const CONTENT_MODULES = [
    { value: 'hero', label: { en: 'Hero section', ar: 'قسم البطل' } },
    { value: 'trust-bar', label: { en: 'Trust bar', ar: 'شريط الثقة' } },
    { value: 'feature-grid', label: { en: 'Feature grid', ar: 'شبكة المزايا' } },
    { value: 'pricing-grid', label: { en: 'Pricing grid', ar: 'شبكة التسعير' } },
    { value: 'comparison-strip', label: { en: 'Comparison strip', ar: 'شريط المقارنة' } },
    { value: 'stats-band', label: { en: 'Stats band', ar: 'نطاق الإحصائيات' } },
    { value: 'story-block', label: { en: 'Story block', ar: 'كتلة القصة' } },
    { value: 'faq-strip', label: { en: 'FAQ block', ar: 'كتلة الأسئلة الشائعة' } },
    { value: 'waitlist-strip', label: { en: 'Waitlist block', ar: 'كتلة قائمة الانتظار' } },
    { value: 'contact-form', label: { en: 'Contact form', ar: 'نموذج التواصل' } },
    { value: 'cta-panel', label: { en: 'CTA panel', ar: 'لوحة الدعوة للإجراء' } },
];

const THEME_OPTIONS = [
    { value: 'warm-sand', label: { en: 'Warm Sand', ar: 'رملي دافئ' } },
    { value: 'editorial-night', label: { en: 'Editorial Night', ar: 'ليلة تحريرية' } },
    { value: 'premium-pricing', label: { en: 'Premium Pricing', ar: 'تسعير مميز' } },
    { value: 'minimal-studio', label: { en: 'Minimal Studio', ar: 'استوديو بسيط' } },
    { value: 'contact-warm', label: { en: 'Contact Warm', ar: 'تواصل دافئ' } },
];

const toMultilineText = (value) => {
    if (Array.isArray(value)) {
        return value.join('\n');
    }

    return value || '';
};

const toList = (value) => {
    if (Array.isArray(value)) {
        return value.filter(Boolean);
    }

    return String(value || '')
        .split('\n')
        .map((item) => item.trim())
        .filter(Boolean);
};

const getLocalizedOptionLabel = (options, value, locale) => {
    const option = options.find((item) => item.value === value);
    return option?.label?.[locale] || option?.label?.en || value;
};

const getEditorInitialState = (section) => ({
    ...section,
    highlights: {
        en: toMultilineText(section?.highlights?.en),
        ar: toMultilineText(section?.highlights?.ar),
    },
});

const WebsiteContent = () => {
    useAdminPageSetup();

    const {
        locale,
        brandSettings,
        contentSections,
        saveBrand,
        saveContentSection,
        updateWaitlistStatus,
        waitlist,
    } = useCkamAdmin();

    const copy = adminCopy[locale].websiteContentPage;
    const common = adminCopy[locale].common;
    const isArabic = locale === 'ar';
    const activeLocale = isArabic ? 'ar' : 'en';

    const [selectedSectionId, setSelectedSectionId] = useState(contentSections[0]?.id || '');
    const [sectionForm, setSectionForm] = useState(getEditorInitialState(contentSections[0] || {}));
    const [brandForm, setBrandForm] = useState(brandSettings);
    const [contentTranslationLocale, setContentTranslationLocale] = useState(activeLocale);
    const [brandTranslationLocale, setBrandTranslationLocale] = useState(activeLocale);
    const contentLabelAlignClass = contentTranslationLocale === 'ar' ? 'text-end d-block' : 'text-start d-block';
    const brandLabelAlignClass = brandTranslationLocale === 'ar' ? 'text-end d-block' : 'text-start d-block';
    const localizedEyebrowLabel = contentTranslationLocale === 'ar' ? 'النص العلوي' : 'Eyebrow';
    const localizedHeadlineLabel = contentTranslationLocale === 'ar' ? 'العنوان الرئيسي' : 'Headline';
    const localizedSubheadlineLabel = contentTranslationLocale === 'ar' ? 'العنوان الفرعي' : 'Subheadline';
    const localizedBodyLabel = contentTranslationLocale === 'ar' ? 'النص' : 'Body copy';
    const localizedHighlightsLabel = contentTranslationLocale === 'ar' ? 'النقاط المميزة' : 'Highlight bullets';
    const localizedCtaLabel = contentTranslationLocale === 'ar' ? 'نص الزر الأساسي' : 'Primary CTA label';
    const localizedSecondaryCtaLabel = contentTranslationLocale === 'ar' ? 'نص الزر الثانوي' : 'Secondary CTA label';
    const localizedSeoTitleLabel = contentTranslationLocale === 'ar' ? 'عنوان SEO' : 'SEO title';
    const localizedSeoDescriptionLabel = contentTranslationLocale === 'ar' ? 'وصف SEO' : 'SEO description';
    const localizedLogoTextLabel = brandTranslationLocale === 'ar' ? 'نص الشعار' : 'Logo text';
    const localizedHeaderAnnouncementLabel = brandTranslationLocale === 'ar' ? 'إعلان الرأس' : 'Header announcement';
    const localizedHeaderCtaLabel = brandTranslationLocale === 'ar' ? 'نص زر الرأس' : 'Header CTA label';
    const localizedFooterSummaryLabel = brandTranslationLocale === 'ar' ? 'ملخص التذييل' : 'Footer summary';
    const localizedFooterCtaLabel = brandTranslationLocale === 'ar' ? 'نص زر التذييل' : 'Footer CTA label';
    const localizedWaitlistHeadlineLabel = brandTranslationLocale === 'ar' ? 'عنوان قائمة الانتظار' : 'Waiting list headline';

    const selectedSection = contentSections.find((section) => section.id === selectedSectionId) || contentSections[0];
    const livePages = contentSections.filter((section) => section.status === 'live').length;
    const draftPages = contentSections.filter((section) => section.status === 'draft').length;
    const waitlistOpen = waitlist.filter((entry) => entry.status !== 'contacted').length;
    const contentBlocks = contentSections.reduce((total, section) => total + (section.modules?.length || 0), 0);

    useEffect(() => {
        if (selectedSection) {
            setSectionForm(getEditorInitialState(selectedSection));
        }
    }, [selectedSection]);

    useEffect(() => {
        setBrandForm(brandSettings);
    }, [brandSettings]);

    useEffect(() => {
        const nextLocale = normalizeTranslationLocale(locale);
        setContentTranslationLocale(nextLocale);
        setBrandTranslationLocale(nextLocale);
    }, [locale]);

    const updateLocalizedField = (field, localeKey, value) => {
        setSectionForm((current) => ({
            ...current,
            [field]: {
                ...current[field],
                [localeKey]: value,
            },
        }));
    };

    const updateBrandLocalizedField = (field, localeKey, value) => {
        setBrandForm((current) => ({
            ...current,
            [field]: {
                ...current[field],
                [localeKey]: value,
            },
        }));
    };

    const updateSectionField = (field, value) => {
        setSectionForm((current) => ({ ...current, [field]: value }));
    };

    const updateBrandField = (field, value) => {
        setBrandForm((current) => ({ ...current, [field]: value }));
    };

    const toggleSectionModule = (moduleValue) => {
        setSectionForm((current) => {
            const modules = current.modules || [];
            const hasModule = modules.includes(moduleValue);

            return {
                ...current,
                modules: hasModule ? modules.filter((item) => item !== moduleValue) : [...modules, moduleValue],
            };
        });
    };

    const handleSectionSubmit = (event) => {
        event.preventDefault();
        saveContentSection(sectionForm.id, sectionForm);
    };

    const handleBrandSubmit = (event) => {
        event.preventDefault();
        saveBrand(brandForm);
    };

    const previewHighlights = toList(sectionForm.highlights?.[locale]);
    const previewModules = (sectionForm.modules || []).map((item) => getLocalizedOptionLabel(CONTENT_MODULES, item, locale));
    const listHelper = isArabic ? 'أدخل نقطة تمييز واحدة في كل سطر.' : 'Enter one highlight per line.';
    const blocksLabel = isArabic ? 'كتل' : 'blocks';

    return (
        <div className="container ckam-admin-page ckam-content-page ckam-website-content-page">
            <div className="hk-pg-header pt-7">
                <div className="ckam-page-header ckam-page-header-title-only d-flex align-items-center">
                    <h1 className="pg-title mb-0">{adminCopy[locale].sidebar.content}</h1>
                </div>
            </div>

            <div className="hk-pg-body">
                <Row className="g-3 mb-4">
                    <Col xl={3} md={6}>
                        <MetricCard title={copy.livePages} value={livePages} subtitle={copy.livePagesSubtitle} />
                    </Col>
                    <Col xl={3} md={6}>
                        <MetricCard title={copy.draftUpdates} value={draftPages} subtitle={copy.draftUpdatesSubtitle} />
                    </Col>
                    <Col xl={3} md={6}>
                        <MetricCard title={copy.openWaitlistLeads} value={waitlistOpen} subtitle={copy.openWaitlistLeadsSubtitle} />
                    </Col>
                    <Col xl={3} md={6}>
                        <MetricCard title={copy.contentBlocks} value={contentBlocks} subtitle={copy.contentBlocksSubtitle} />
                    </Col>
                </Row>

                <Row className="g-3 mb-4 align-items-start">
                    <Col xl={3}>
                        <SectionCard title={copy.pageSections} subtitle={copy.pageSectionsSubtitle}>
                            <div className="d-flex flex-column gap-3">
                                {contentSections.map((section) => (
                                    <button
                                        key={section.id}
                                        type="button"
                                        className={`ckam-content-map-item ${selectedSectionId === section.id ? 'is-active' : ''}`}
                                        onClick={() => setSelectedSectionId(section.id)}
                                    >
                                        <div className="d-flex justify-content-between align-items-start gap-2">
                                            <div>
                                                <div className="fw-semibold text-dark">{getLocalizedValue(section.name, locale)}</div>
                                                <div className="fs-8 text-muted mt-1">{section.pagePath}</div>
                                            </div>
                                            <StatusPill label={getStatusLabel(section.status, locale)} tone={section.status} />
                                        </div>
                                        <div className="fs-8 text-muted mt-3">{getLocalizedValue(section.headline, locale)}</div>
                                        <div className="ckam-content-map-meta mt-3">
                                            <span className="ckam-preview-chip">{getLocalizedOptionLabel(THEME_OPTIONS, section.theme, locale)}</span>
                                            <span className="ckam-preview-chip">{section.modules?.length || 0} {blocksLabel}</span>
                                            <span className="ckam-preview-chip">{copy.updatedOn}: {section.updatedAt}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </SectionCard>
                    </Col>

                    <Col xl={6}>
                        <SectionCard title={copy.editPageTitle} subtitle={copy.editPageSubtitle}>
                            <Form onSubmit={handleSectionSubmit}>
                                <div className="d-flex justify-content-between align-items-center gap-2 flex-wrap mb-3">
                                    <div className="ckam-route-pill">{sectionForm.pagePath || '/'}</div>
                                    <div className="d-flex align-items-center gap-2 flex-wrap">
                                        <StatusPill label={getStatusLabel(sectionForm.status || 'draft', locale)} tone={sectionForm.status || 'draft'} />
                                        <span className="ckam-preview-chip">{copy.updatedOn}: {sectionForm.updatedAt || selectedSection?.updatedAt}</span>
                                    </div>
                                </div>

                                <div className="rounded-3 border p-3 bg-light-subtle mb-4" dir={contentTranslationLocale === 'ar' ? 'rtl' : 'ltr'}>
                                    <TranslationViewSelect
                                        locale={locale}
                                        value={contentTranslationLocale}
                                        onChange={setContentTranslationLocale}
                                        controlId="website-content-translation-view"
                                    />
                                    <Form.Label className={contentLabelAlignClass}>{localizedEyebrowLabel}</Form.Label>
                                    <Form.Control value={sectionForm.eyebrow?.[contentTranslationLocale] || ''} onChange={(event) => updateLocalizedField('eyebrow', contentTranslationLocale, event.target.value)} required />
                                    <Form.Label className={`mt-3 ${contentLabelAlignClass}`}>{localizedHeadlineLabel}</Form.Label>
                                    <Form.Control value={sectionForm.headline?.[contentTranslationLocale] || ''} onChange={(event) => updateLocalizedField('headline', contentTranslationLocale, event.target.value)} required />
                                    <Form.Label className={`mt-3 ${contentLabelAlignClass}`}>{localizedSubheadlineLabel}</Form.Label>
                                    <Form.Control value={sectionForm.subheadline?.[contentTranslationLocale] || ''} onChange={(event) => updateLocalizedField('subheadline', contentTranslationLocale, event.target.value)} required />
                                    <Form.Label className={`mt-3 ${contentLabelAlignClass}`}>{localizedBodyLabel}</Form.Label>
                                    <Form.Control as="textarea" rows={4} value={sectionForm.body?.[contentTranslationLocale] || ''} onChange={(event) => updateLocalizedField('body', contentTranslationLocale, event.target.value)} required />
                                    <Form.Label className={`mt-3 ${contentLabelAlignClass}`}>{localizedHighlightsLabel}</Form.Label>
                                    <Form.Control as="textarea" rows={4} value={sectionForm.highlights?.[contentTranslationLocale] || ''} onChange={(event) => updateLocalizedField('highlights', contentTranslationLocale, event.target.value)} required />
                                    <div className="fs-8 text-muted mt-2">{listHelper}</div>
                                    <Form.Label className={`mt-3 ${contentLabelAlignClass}`}>{localizedCtaLabel}</Form.Label>
                                    <Form.Control value={sectionForm.ctaLabel?.[contentTranslationLocale] || ''} onChange={(event) => updateLocalizedField('ctaLabel', contentTranslationLocale, event.target.value)} required />
                                    <Form.Label className={`mt-3 ${contentLabelAlignClass}`}>{localizedSecondaryCtaLabel}</Form.Label>
                                    <Form.Control value={sectionForm.secondaryCtaLabel?.[contentTranslationLocale] || ''} onChange={(event) => updateLocalizedField('secondaryCtaLabel', contentTranslationLocale, event.target.value)} required />
                                    <Form.Label className={`mt-3 ${contentLabelAlignClass}`}>{localizedSeoTitleLabel}</Form.Label>
                                    <Form.Control value={sectionForm.seoTitle?.[contentTranslationLocale] || ''} onChange={(event) => updateLocalizedField('seoTitle', contentTranslationLocale, event.target.value)} required />
                                    <Form.Label className={`mt-3 ${contentLabelAlignClass}`}>{localizedSeoDescriptionLabel}</Form.Label>
                                    <Form.Control as="textarea" rows={3} value={sectionForm.seoDescription?.[contentTranslationLocale] || ''} onChange={(event) => updateLocalizedField('seoDescription', contentTranslationLocale, event.target.value)} required />
                                </div>

                                <Row className="g-3">
                                    <Col md={6}>
                                        <Form.Label>{copy.pagePath}</Form.Label>
                                        <Form.Control value={sectionForm.pagePath || ''} onChange={(event) => updateSectionField('pagePath', event.target.value)} required />
                                    </Col>
                                    <Col md={6}>
                                        <Form.Label>{copy.status}</Form.Label>
                                        <Form.Select value={sectionForm.status || 'draft'} onChange={(event) => updateSectionField('status', event.target.value)}>
                                            <option value="draft">{common.draft}</option>
                                            <option value="live">{common.live}</option>
                                        </Form.Select>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Label>{copy.ctaLink}</Form.Label>
                                        <Form.Control value={sectionForm.ctaLink || ''} onChange={(event) => updateSectionField('ctaLink', event.target.value)} required />
                                    </Col>
                                    <Col md={6}>
                                        <Form.Label>{copy.secondaryCtaLink}</Form.Label>
                                        <Form.Control value={sectionForm.secondaryCtaLink || ''} onChange={(event) => updateSectionField('secondaryCtaLink', event.target.value)} required />
                                    </Col>
                                    <Col md={12}>
                                        <Form.Label>{copy.visualTheme}</Form.Label>
                                        <Form.Select value={sectionForm.theme || THEME_OPTIONS[0].value} onChange={(event) => updateSectionField('theme', event.target.value)}>
                                            {THEME_OPTIONS.map((option) => (
                                                <option key={option.value} value={option.value}>{option.label[locale]}</option>
                                            ))}
                                        </Form.Select>
                                    </Col>
                                    <Col md={12}>
                                        <div className="rounded-3 border p-3 bg-light-subtle">
                                            <div className="fw-semibold mb-3">{copy.contentModules}</div>
                                            <Row className="g-2">
                                                {CONTENT_MODULES.map((module) => (
                                                    <Col sm={6} key={module.value}>
                                                        <Form.Check
                                                            type="checkbox"
                                                            id={`module-${module.value}`}
                                                            className="ckam-module-check"
                                                            label={module.label[locale]}
                                                            checked={(sectionForm.modules || []).includes(module.value)}
                                                            onChange={() => toggleSectionModule(module.value)}
                                                        />
                                                    </Col>
                                                ))}
                                            </Row>
                                            <div className="fs-8 text-muted mt-3">{copy.contentModulesHelper}</div>
                                        </div>
                                    </Col>
                                    <Col md={12}>
                                        <Button type="submit" variant="primary">{copy.savePageContent}</Button>
                                    </Col>
                                </Row>
                            </Form>
                        </SectionCard>
                    </Col>

                    <Col xl={3}>
                        <SectionCard title={copy.livePreview} subtitle={copy.livePreviewSubtitle}>
                            <div className={`ckam-site-preview theme-${sectionForm.theme || 'warm-sand'}`} dir={isArabic ? 'rtl' : 'ltr'}>
                                <div className="ckam-site-preview-browser">
                                    <span />
                                    <span />
                                    <span />
                                    <div>{sectionForm.pagePath || '/'}</div>
                                </div>
                                <div className="ckam-site-preview-surface">
                                    <div className="ckam-site-preview-nav">
                                        <div className="ckam-site-preview-brand">{getLocalizedValue(brandForm.logoText, locale)}</div>
                                        <div className="ckam-site-preview-nav-cta">{getLocalizedValue(brandForm.headerCtaLabel, locale)}</div>
                                    </div>
                                    <div className="ckam-site-preview-announcement">{getLocalizedValue(brandForm.headerAnnouncement, locale)}</div>
                                    <div className="ckam-site-preview-hero">
                                        <div className="ckam-site-preview-eyebrow">{getLocalizedValue(sectionForm.eyebrow, locale)}</div>
                                        <h4>{getLocalizedValue(sectionForm.headline, locale)}</h4>
                                        <p>{getLocalizedValue(sectionForm.subheadline, locale)}</p>
                                        <div className="ckam-site-preview-copy">{getLocalizedValue(sectionForm.body, locale)}</div>
                                    </div>
                                    <div className="ckam-site-preview-highlights">
                                        {previewHighlights.slice(0, 3).map((item) => (
                                            <span key={item} className="ckam-preview-chip is-solid">{item}</span>
                                        ))}
                                    </div>
                                    <div className="ckam-site-preview-actions">
                                        <Button size="sm" variant="primary">{getLocalizedValue(sectionForm.ctaLabel, locale)}</Button>
                                        <Button size="sm" variant="light">{getLocalizedValue(sectionForm.secondaryCtaLabel, locale)}</Button>
                                    </div>
                                    <div className="ckam-site-preview-modules">
                                        {previewModules.map((item) => (
                                            <span key={item} className="ckam-preview-chip">{item}</span>
                                        ))}
                                    </div>
                                    <div className="ckam-site-preview-footer">
                                        <div className="ckam-site-preview-footer-copy">{getLocalizedValue(brandForm.footerSummary, locale)}</div>
                                        <div className="ckam-site-preview-contact">{brandForm.supportEmail} • {brandForm.contactNumber}</div>
                                        <div className="ckam-site-preview-footer-cta">{getLocalizedValue(brandForm.footerCtaLabel, locale)}</div>
                                    </div>
                                </div>
                            </div>
                        </SectionCard>
                    </Col>
                </Row>

                <Row className="g-3 mb-4 align-items-start">
                    <Col xl={5}>
                        <SectionCard title={copy.brandTitle} subtitle={copy.brandSubtitle}>
                            <Form onSubmit={handleBrandSubmit}>
                                <div className="rounded-3 border p-3 bg-light-subtle mb-4" dir={brandTranslationLocale === 'ar' ? 'rtl' : 'ltr'}>
                                    <TranslationViewSelect
                                        locale={locale}
                                        value={brandTranslationLocale}
                                        onChange={setBrandTranslationLocale}
                                        controlId="website-brand-translation-view"
                                    />
                                    <Form.Label className={brandLabelAlignClass}>{localizedLogoTextLabel}</Form.Label>
                                    <Form.Control value={brandForm.logoText?.[brandTranslationLocale] || ''} onChange={(event) => updateBrandLocalizedField('logoText', brandTranslationLocale, event.target.value)} required />
                                    <Form.Label className={`mt-3 ${brandLabelAlignClass}`}>{localizedHeaderAnnouncementLabel}</Form.Label>
                                    <Form.Control value={brandForm.headerAnnouncement?.[brandTranslationLocale] || ''} onChange={(event) => updateBrandLocalizedField('headerAnnouncement', brandTranslationLocale, event.target.value)} required />
                                    <Form.Label className={`mt-3 ${brandLabelAlignClass}`}>{localizedHeaderCtaLabel}</Form.Label>
                                    <Form.Control value={brandForm.headerCtaLabel?.[brandTranslationLocale] || ''} onChange={(event) => updateBrandLocalizedField('headerCtaLabel', brandTranslationLocale, event.target.value)} required />
                                    <Form.Label className={`mt-3 ${brandLabelAlignClass}`}>{localizedFooterSummaryLabel}</Form.Label>
                                    <Form.Control as="textarea" rows={3} value={brandForm.footerSummary?.[brandTranslationLocale] || ''} onChange={(event) => updateBrandLocalizedField('footerSummary', brandTranslationLocale, event.target.value)} required />
                                    <Form.Label className={`mt-3 ${brandLabelAlignClass}`}>{localizedFooterCtaLabel}</Form.Label>
                                    <Form.Control value={brandForm.footerCtaLabel?.[brandTranslationLocale] || ''} onChange={(event) => updateBrandLocalizedField('footerCtaLabel', brandTranslationLocale, event.target.value)} required />
                                    <Form.Label className={`mt-3 ${brandLabelAlignClass}`}>{localizedWaitlistHeadlineLabel}</Form.Label>
                                    <Form.Control value={brandForm.waitingListHeadline?.[brandTranslationLocale] || ''} onChange={(event) => updateBrandLocalizedField('waitingListHeadline', brandTranslationLocale, event.target.value)} required />
                                </div>

                                <Row className="g-3">
                                    <Col md={12}>
                                        <Form.Label>{copy.logoUrl}</Form.Label>
                                        <Form.Control dir="ltr" value={brandForm.logoUrl || ''} onChange={(event) => updateBrandField('logoUrl', event.target.value)} required />
                                    </Col>
                                    <Col md={6}>
                                        <Form.Label>{copy.supportEmail}</Form.Label>
                                        <Form.Control dir="ltr" value={brandForm.supportEmail || ''} onChange={(event) => updateBrandField('supportEmail', event.target.value)} required />
                                    </Col>
                                    <Col md={6}>
                                        <Form.Label>{copy.contactNumber}</Form.Label>
                                        <Form.Control dir="ltr" value={brandForm.contactNumber || ''} onChange={(event) => updateBrandField('contactNumber', event.target.value)} required />
                                    </Col>
                                    <Col md={12}>
                                        <Form.Label>{copy.footerCtaLink}</Form.Label>
                                        <Form.Control value={brandForm.footerCtaLink || ''} onChange={(event) => updateBrandField('footerCtaLink', event.target.value)} required />
                                    </Col>
                                    <Col md={12}>
                                        <Button type="submit" variant="primary">{copy.saveBrandSettings}</Button>
                                    </Col>
                                </Row>
                            </Form>
                        </SectionCard>
                    </Col>
                    <Col xl={7}>
                        <SectionCard title={copy.waitlistTitle} subtitle={copy.waitlistSubtitle}>
                            <div className="table-responsive">
                                <table className="table align-middle mb-0">
                                    <thead>
                                        <tr>
                                            <th>{copy.lead}</th>
                                            <th>{adminCopy[locale].dashboard.interest}</th>
                                            <th>{adminCopy[locale].dashboard.source}</th>
                                            <th>{copy.notes}</th>
                                            <th>{copy.status}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {waitlist.map((entry) => (
                                            <tr key={entry.id}>
                                                <td>
                                                    <div className="fw-medium">{entry.name}</div>
                                                    <div className="fs-8 text-muted">{entry.email}</div>
                                                </td>
                                                <td>{entry.interest}</td>
                                                <td>{entry.source}</td>
                                                <td className="text-muted">{entry.notes}</td>
                                                <td className="mw-180p">
                                                    <Form.Select size="sm" value={entry.status} onChange={(event) => updateWaitlistStatus(entry.id, event.target.value)}>
                                                        <option value="new">{common.new}</option>
                                                        <option value="reviewed">{common.reviewed}</option>
                                                        <option value="contacted">{common.contacted}</option>
                                                    </Form.Select>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </SectionCard>
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default WebsiteContent;
