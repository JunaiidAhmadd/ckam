import React, { useMemo, useState } from 'react';
import { Button, Card, Col, Form, Modal, Row } from 'react-bootstrap';
import { DollarSign, Edit2, Percent, Trash2, X } from 'react-feather';
import { toast } from 'react-toastify';
import { useCkamAdmin } from './context';
import { adminCopy, getAdminIntl, getLocalizedList, getLocalizedValue, getStatusLabel } from './localization/i18n';
import {
    MetricCard,
    normalizeTranslationLocale,
    SectionCard,
    StatusPill,
    formatCurrency,
    TranslationViewSelect,
    useAdminPageSetup,
} from './shared';

const getCycleOptions = (copy) => [
    { value: 'monthly', label: copy.common.monthly, billingLabel: { en: copy.subscriptionsPage.billedMonthly, ar: adminCopy.ar.subscriptionsPage.billedMonthly } },
    { value: 'quarterly', label: copy.common.quarterly, billingLabel: { en: copy.subscriptionsPage.billedQuarterly, ar: adminCopy.ar.subscriptionsPage.billedQuarterly } },
    { value: 'annual', label: copy.common.annual, billingLabel: { en: copy.subscriptionsPage.billedYearly, ar: adminCopy.ar.subscriptionsPage.billedYearly } },
    { value: 'custom', label: copy.common.custom, billingLabel: { en: copy.subscriptionsPage.billedCustom, ar: adminCopy.ar.subscriptionsPage.billedCustom } },
];

const getBlankPlan = () => ({
    id: '',
    name: { en: 'New Plan', ar: '\u062e\u0637\u0629 \u062c\u062f\u064a\u062f\u0629' },
    price: 49,
    billingCycle: 'monthly',
    billingLabel: { en: adminCopy.en.subscriptionsPage.billedMonthly, ar: adminCopy.ar.subscriptionsPage.billedMonthly },
    trialDays: 14,
    activeSubscribers: 0,
    status: 'published',
    description: { en: 'Plan description', ar: '\u0648\u0635\u0641 \u0627\u0644\u062e\u0637\u0629' },
    features: {
        en: '1 team seat\nBasic onboarding\nLead capture',
        ar: '\u0645\u0642\u0639\u062f \u0641\u0631\u064a\u0642 \u0648\u0627\u062d\u062f\n\u062a\u0647\u064a\u0626\u0629 \u0623\u0633\u0627\u0633\u064a\u0629\n\u0627\u0644\u062a\u0642\u0627\u0637 \u0627\u0644\u0639\u0645\u0644\u0627\u0621 \u0627\u0644\u0645\u062d\u062a\u0645\u0644\u064a\u0646',
    },
});

const getBlankPromoCode = () => ({
    id: '',
    code: '',
    type: 'percent',
    value: 10,
    appliesTo: ['all'],
    startsOn: '',
    endsOn: '',
    usageLimit: 100,
    usedCount: 0,
    status: 'draft',
    description: { en: 'Promo code description', ar: '\u0648\u0635\u0641 \u0631\u0645\u0632 \u0627\u0644\u062e\u0635\u0645' },
});

const Subscriptions = () => {
    useAdminPageSetup();

    const { locale, plans, promoCodes, savePlan, deletePlan, savePromoCode, deletePromoCode } = useCkamAdmin();
    const copy = adminCopy[locale];
    const pageCopy = copy.subscriptionsPage;
    const formCopy = copy.subscriptionsPage;
    const formCommon = copy.common;
    const activeLocale = locale === 'ar' ? 'ar' : 'en';
    const isArabic = activeLocale === 'ar';
    const intl = useMemo(() => getAdminIntl(locale), [locale]);
    const formCycleOptions = useMemo(() => getCycleOptions(copy), [copy]);
    const [formState, setFormState] = useState(getBlankPlan());
    const [showPlanModal, setShowPlanModal] = useState(false);
    const [isSavingPlan, setIsSavingPlan] = useState(false);
    const [deletingPlanId, setDeletingPlanId] = useState(null);
    const [promoFormState, setPromoFormState] = useState(getBlankPromoCode());
    const [showPromoModal, setShowPromoModal] = useState(false);
    const [planTranslationLocale, setPlanTranslationLocale] = useState(activeLocale);
    const [promoTranslationLocale, setPromoTranslationLocale] = useState(activeLocale);
    const planLabelAlignClass = planTranslationLocale === 'ar' ? 'text-end d-block' : 'text-start d-block';
    const promoLabelAlignClass = promoTranslationLocale === 'ar' ? 'text-end d-block' : 'text-start d-block';
    const localizedPlanNameLabel = planTranslationLocale === 'ar' ? '\u0627\u0633\u0645 \u0627\u0644\u062e\u0637\u0629' : 'Plan name';
    const localizedDescriptionLabel = planTranslationLocale === 'ar' ? '\u0627\u0644\u0648\u0635\u0641' : 'Description';
    const localizedFeaturesLabel = planTranslationLocale === 'ar' ? '\u0627\u0644\u0645\u0632\u0627\u064a\u0627' : 'Features';
    const localizedOnePerLineHint = planTranslationLocale === 'ar' ? '\u0623\u0636\u0641 \u0645\u064a\u0632\u0629 \u0648\u0627\u062d\u062f\u0629 \u0641\u064a \u0643\u0644 \u0633\u0637\u0631.' : 'Add one feature per line.';
    const localizedBillingLabel = planTranslationLocale === 'ar' ? '\u062a\u0633\u0645\u064a\u0629 \u0627\u0644\u0641\u0648\u062a\u0631\u0629' : 'Billing label';
    const localizedPromoDescriptionLabel = promoTranslationLocale === 'ar' ? '\u0648\u0635\u0641 \u0631\u0645\u0632 \u0627\u0644\u062e\u0635\u0645' : 'Promo code description';

    const publishedPlans = plans.filter((plan) => plan.status === 'published').length;
    const yearlyPlans = plans.filter((plan) => plan.billingCycle === 'annual').length;
    const projectedRevenue = plans.reduce((total, plan) => total + (plan.price * plan.activeSubscribers), 0);

    React.useEffect(() => {
        const nextLocale = normalizeTranslationLocale(locale);
        setPlanTranslationLocale(nextLocale);
        setPromoTranslationLocale(nextLocale);
    }, [locale]);

    const handleChange = (field, value) => {
        setFormState((current) => ({ ...current, [field]: value }));
    };

    const handleLocalizedChange = (field, localeKey, value) => {
        setFormState((current) => ({
            ...current,
            [field]: {
                ...current[field],
                [localeKey]: value,
            },
        }));
    };

    const handleCycleChange = (value) => {
        const selectedOption = formCycleOptions.find((option) => option.value === value);

        setFormState((current) => ({
            ...current,
            billingCycle: value,
            billingLabel: selectedOption ? selectedOption.billingLabel : current.billingLabel,
        }));
    };

    const handleCreatePlan = () => {
        setFormState(getBlankPlan());
        setPlanTranslationLocale(activeLocale);
        setShowPlanModal(true);
    };

    const handleEdit = (plan) => {
        setFormState({
            ...plan,
            features: {
                en: plan.features.en.join('\n'),
                ar: plan.features.ar.join('\n'),
            },
        });
        setPlanTranslationLocale(activeLocale);
        setShowPlanModal(true);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (isSavingPlan) return;

        const savingText = locale === 'ar' ? '\u062c\u0627\u0631\u064d \u062d\u0641\u0638 \u0627\u0644\u062e\u0637\u0629...' : 'Saving plan...';
        const successText = formState.id ? formCopy.updatePlan : formCopy.createPlanAction;
        const defaultErrorText = locale === 'ar' ? '\u062a\u0639\u0630\u0631 \u062d\u0641\u0638 \u0627\u0644\u062e\u0637\u0629.' : 'Unable to save plan.';
        const toastId = toast.loading(savingText);

        setIsSavingPlan(true);
        const result = await savePlan(formState);

        if (result?.ok) {
            toast.update(toastId, {
                render: successText,
                type: 'success',
                isLoading: false,
                autoClose: 2500,
            });
            setFormState(getBlankPlan());
            setShowPlanModal(false);
        } else {
            toast.update(toastId, {
                render: result?.error || defaultErrorText,
                type: 'error',
                isLoading: false,
                autoClose: 4500,
            });
        }

        setIsSavingPlan(false);
    };

    const handleCloseModal = () => {
        setFormState(getBlankPlan());
        setShowPlanModal(false);
    };

    const handleDeletePlan = async (plan) => {
        const planName = getLocalizedValue(plan?.name, locale) || (locale === 'ar' ? '\u0627\u0644\u062e\u0637\u0629' : 'this plan');
        const warningText = locale === 'ar'
            ? `\u0647\u0644 \u0623\u0646\u062a \u0645\u062a\u0623\u0643\u062f \u0645\u0646 \u062d\u0630\u0641 "${planName}"\u061f`
            : `Are you sure you want to delete "${planName}"?`;

        const confirmed = window.confirm(warningText);
        if (!confirmed) return;

        try {
            setDeletingPlanId(plan.id);
            await deletePlan(plan.id);
        } finally {
            setDeletingPlanId(null);
        }
    };

    const handlePromoChange = (field, value) => {
        setPromoFormState((current) => ({ ...current, [field]: value }));
    };

    const handlePromoLocalizedChange = (localeKey, value) => {
        setPromoFormState((current) => ({
            ...current,
            description: {
                ...current.description,
                [localeKey]: value,
            },
        }));
    };

    const handlePromoAllPlansToggle = () => {
        handlePromoChange('appliesTo', ['all']);
    };

    const handlePromoPlanToggle = (planId, checked) => {
        setPromoFormState((current) => {
            const currentValues = Array.isArray(current.appliesTo) ? current.appliesTo : [];
            const nextValues = new Set(currentValues.filter((value) => value !== 'all'));

            if (checked) {
                nextValues.add(planId);
            } else {
                nextValues.delete(planId);
            }

            return {
                ...current,
                appliesTo: nextValues.size ? Array.from(nextValues) : ['all'],
            };
        });
    };

    const handleCreatePromoCode = () => {
        setPromoFormState(getBlankPromoCode());
        setPromoTranslationLocale(activeLocale);
        setShowPromoModal(true);
    };

    const handleEditPromoCode = (promoCode) => {
        setPromoFormState({
            ...promoCode,
            description: {
                en: promoCode.description?.en || '',
                ar: promoCode.description?.ar || '',
            },
        });
        setPromoTranslationLocale(activeLocale);
        setShowPromoModal(true);
    };

    const handlePromoSubmit = (event) => {
        event.preventDefault();
        savePromoCode(promoFormState);
        setPromoFormState(getBlankPromoCode());
        setShowPromoModal(false);
    };

    const handleClosePromoModal = () => {
        setPromoFormState(getBlankPromoCode());
        setShowPromoModal(false);
    };

    const getPromoDiscountLabel = (promoCode) => (
        promoCode.type === 'fixed'
            ? `${formatCurrency(promoCode.value, locale)}`
            : `${promoCode.value}%`
    );

    const getPromoAppliedPlans = (promoCode) => {
        if (!Array.isArray(promoCode.appliesTo) || promoCode.appliesTo.includes('all')) {
            return pageCopy.allPlans;
        }

        const names = promoCode.appliesTo
            .map((planId) => plans.find((plan) => plan.id === planId))
            .filter(Boolean)
            .map((plan) => getLocalizedValue(plan.name, locale));

        return names.length ? names.join(', ') : pageCopy.allPlans;
    };

    const getPromoValidity = (promoCode) => {
        if (!promoCode.startsOn && !promoCode.endsOn) {
            return '--';
        }

        const startLabel = promoCode.startsOn ? intl.date.format(new Date(promoCode.startsOn)) : '--';
        const endLabel = promoCode.endsOn ? intl.date.format(new Date(promoCode.endsOn)) : '--';
        return `${startLabel} - ${endLabel}`;
    };

    const promoAppliesToAll = Array.isArray(promoFormState.appliesTo) ? promoFormState.appliesTo.includes('all') : true;

    React.useEffect(() => {
        const isModalOpen = showPlanModal || showPromoModal;
        const htmlElement = document.documentElement;
        const bodyElement = document.body;
        const wrappers = document.querySelectorAll('.hk-wrapper, .hk-pg-wrapper');

        htmlElement?.classList.toggle('ckam-modal-open', isModalOpen);
        bodyElement?.classList.toggle('ckam-modal-open', isModalOpen);
        wrappers.forEach((node) => node.classList.toggle('ckam-modal-open', isModalOpen));

        return () => {
            htmlElement?.classList.remove('ckam-modal-open');
            bodyElement?.classList.remove('ckam-modal-open');
            wrappers.forEach((node) => node.classList.remove('ckam-modal-open'));
        };
    }, [showPlanModal, showPromoModal]);

    return (
        <div className="container ckam-admin-page ckam-content-page ckam-subscriptions-page">
            <div className="hk-pg-header pt-7">
                <div className="ckam-page-header ckam-page-header-title-only d-flex align-items-center">
                    <h1 className="pg-title mb-0">{adminCopy[locale].sidebar.subscriptions}</h1>
                </div>
            </div>

            <div className="hk-pg-body">
                <Row className="g-3 mb-4">
                    <Col lg={4}>
                        <MetricCard title={pageCopy.publishedPlans} value={publishedPlans} subtitle={pageCopy.publishedPlansSubtitle} />
                    </Col>
                    <Col lg={4}>
                        <MetricCard title={pageCopy.annualBilling} value={yearlyPlans} subtitle={pageCopy.annualBillingSubtitle} />
                    </Col>
                    <Col lg={4}>
                        <MetricCard title={pageCopy.projectedRevenue} value={formatCurrency(projectedRevenue, locale)} subtitle={pageCopy.projectedRevenueSubtitle} />
                    </Col>
                </Row>

                <Row className="g-3 mb-0">
                    <Col xl={12}>
                        <SectionCard
                            title={pageCopy.currentPlans}
                            subtitle={pageCopy.currentPlansSubtitle}
                            action={(
                                <Button variant="primary" onClick={handleCreatePlan}>
                                    {pageCopy.createPlanAction}
                                </Button>
                            )}
                        >
                            <Row className="g-3 g-xl-2 mb-0">
                                {plans.map((plan) => (
                                    <Col md={6} lg={4} key={plan.id}>
                                        <Card className="border h-100 shadow-none">
                                            <Card.Body>
                                                <div className="d-flex justify-content-between align-items-start mb-3 gap-2">
                                                    <div>
                                                        <h5 className="mb-1">{getLocalizedValue(plan.name, locale)}</h5>
                                                        <div className="text-muted fs-7">{getLocalizedValue(plan.billingLabel, locale)}</div>
                                                    </div>
                                                    <StatusPill label={getStatusLabel(plan.status, locale)} tone={plan.status} />
                                                </div>
                                                <div className="d-flex align-items-end gap-2 mb-2 flex-wrap">
                                                    <h3 className="mb-0">{formatCurrency(plan.price, locale)}</h3>
                                                    <StatusPill label={getStatusLabel(plan.billingCycle, locale)} tone={plan.billingCycle} />
                                                </div>
                                                <p className="text-muted">{getLocalizedValue(plan.description, locale)}</p>
                                                <div className="fs-7 text-muted mb-3">
                                                    {plan.activeSubscribers} {pageCopy.subscribers} • {plan.trialDays} {pageCopy.dayTrial}
                                                </div>
                                                <div className="d-flex flex-column gap-2 mb-4">
                                                    {getLocalizedList(plan.features, locale).map((feature, featureIndex) => (
                                                        <div key={`${plan.id}-feature-${featureIndex}`} className="d-flex align-items-center gap-2">
                                                            <span className="badge badge-soft-primary">+</span>
                                                            <span>{feature}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="d-flex flex-wrap gap-2">
                                                    <Button variant="outline-light" size="sm" onClick={() => handleEdit(plan)}>
                                                        <span className="d-inline-flex align-items-center gap-2"><Edit2 size={14} />{pageCopy.edit}</span>
                                                    </Button>
                                                    <Button
                                                        variant="outline-danger"
                                                        size="sm"
                                                        onClick={() => handleDeletePlan(plan)}
                                                        disabled={deletingPlanId === plan.id}
                                                    >
                                                        <span className="d-inline-flex align-items-center gap-2"><Trash2 size={14} />{pageCopy.delete}</span>
                                                    </Button>
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                        </SectionCard>
                    </Col>
                </Row>

                <Row className="g-3 mt-1 mb-0">
                    <Col xl={12}>
                        <SectionCard
                            title={pageCopy.promoCodesTitle}
                            subtitle={pageCopy.promoCodesSubtitle}
                            action={(
                                <Button variant="outline-primary" onClick={handleCreatePromoCode}>
                                    {pageCopy.createPromoCode}
                                </Button>
                            )}
                        >
                            {promoCodes.length ? (
                                <Row className="g-3 g-xl-2 mb-0">
                                    {promoCodes.map((promoCode) => (
                                        <Col md={6} lg={4} key={promoCode.id}>
                                            <Card className="border h-100 shadow-none">
                                                <Card.Body>
                                                    <div className="d-flex justify-content-between align-items-start mb-3 gap-2">
                                                        <div>
                                                            <h5 className="mb-1">{promoCode.code}</h5>
                                                            <div className="text-muted fs-7">
                                                                {pageCopy.discountType}: {promoCode.type === 'fixed' ? pageCopy.discountFixed : pageCopy.discountPercent}
                                                            </div>
                                                        </div>
                                                        <StatusPill label={getStatusLabel(promoCode.status, locale)} tone={promoCode.status} />
                                                    </div>
                                                    <div className="d-flex align-items-center gap-2 mb-2">
                                                        <span className="text-primary">
                                                            {promoCode.type === 'fixed' ? <DollarSign size={16} /> : <Percent size={16} />}
                                                        </span>
                                                        <strong>{getPromoDiscountLabel(promoCode)}</strong>
                                                    </div>
                                                    <p className="mb-2 fs-7">
                                                        <span className="text-muted">{pageCopy.appliesToPlans}: </span>
                                                        {getPromoAppliedPlans(promoCode)}
                                                    </p>
                                                    <p className="mb-2 fs-7">
                                                        <span className="text-muted">{pageCopy.validity}: </span>
                                                        {getPromoValidity(promoCode)}
                                                    </p>
                                                    <p className="mb-2 fs-7">
                                                        <span className="text-muted">{pageCopy.redemptions}: </span>
                                                        {promoCode.usedCount}/{promoCode.usageLimit || '8'}
                                                    </p>
                                                    <p className="text-muted mb-3">{getLocalizedValue(promoCode.description, locale)}</p>
                                                    <div className="d-flex flex-wrap gap-2">
                                                        <Button variant="outline-light" size="sm" onClick={() => handleEditPromoCode(promoCode)}>
                                                            <span className="d-inline-flex align-items-center gap-2"><Edit2 size={14} />{pageCopy.edit}</span>
                                                        </Button>
                                                        <Button variant="outline-danger" size="sm" onClick={() => deletePromoCode(promoCode.id)}>
                                                            <span className="d-inline-flex align-items-center gap-2"><Trash2 size={14} />{pageCopy.delete}</span>
                                                        </Button>
                                                    </div>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    ))}
                                </Row>
                            ) : (
                                <p className="mb-0 text-muted">{pageCopy.noPromoCodes}</p>
                            )}
                        </SectionCard>
                    </Col>
                </Row>
            </div>

            <Modal show={showPlanModal} onHide={isSavingPlan ? undefined : handleCloseModal} size="lg" centered className="ckam-plan-modal">
                <Form onSubmit={handleSubmit} className="ckam-modal-form-ltr">
                    <Modal.Header closeButton className="ckam-modal-header">
                        <Modal.Title>{formState.id ? formCopy.editPlan : formCopy.createPlan}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="rounded-3 border p-3 bg-light-subtle mb-4" dir={planTranslationLocale === 'ar' ? 'rtl' : 'ltr'}>
                            <TranslationViewSelect
                                locale={locale}
                                value={planTranslationLocale}
                                onChange={setPlanTranslationLocale}
                                controlId="subscriptions-plan-translation-view"
                            />
                            <Form.Label className={planLabelAlignClass}>{localizedPlanNameLabel}</Form.Label>
                            <Form.Control
                                value={formState.name?.[planTranslationLocale] || ''}
                                onChange={(event) => handleLocalizedChange('name', planTranslationLocale, event.target.value)}
                                required
                            />
                            <Form.Label className={`mt-3 ${planLabelAlignClass}`}>{localizedDescriptionLabel}</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={formState.description?.[planTranslationLocale] || ''}
                                onChange={(event) => handleLocalizedChange('description', planTranslationLocale, event.target.value)}
                                required
                            />
                            <Form.Label className={`mt-3 ${planLabelAlignClass}`}>{localizedFeaturesLabel}</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={4}
                                value={formState.features?.[planTranslationLocale] || ''}
                                onChange={(event) => handleLocalizedChange('features', planTranslationLocale, event.target.value)}
                                required
                            />
                            <div className={`fs-8 text-muted mt-2 ${planLabelAlignClass}`}>{localizedOnePerLineHint}</div>
                            <Form.Label className={`mt-3 ${planLabelAlignClass}`}>{localizedBillingLabel}</Form.Label>
                            <Form.Control
                                value={formState.billingLabel?.[planTranslationLocale] || ''}
                                onChange={(event) => handleLocalizedChange('billingLabel', planTranslationLocale, event.target.value)}
                                required
                            />
                        </div>

                        <Row className="g-3">
                            <Col md={6}>
                                <Form.Label>{formCopy.price}</Form.Label>
                                <Form.Control type="number" min="0" value={formState.price} onChange={(event) => handleChange('price', event.target.value)} required />
                            </Col>
                            <Col md={6}>
                                <Form.Label>{formCopy.trialDays}</Form.Label>
                                <Form.Control type="number" min="0" value={formState.trialDays} onChange={(event) => handleChange('trialDays', event.target.value)} required />
                            </Col>
                            <Col md={6}>
                                <Form.Label>{formCopy.billingCycle}</Form.Label>
                                <Form.Select value={formState.billingCycle} onChange={(event) => handleCycleChange(event.target.value)}>
                                    {formCycleOptions.map((option) => (
                                        <option key={option.value} value={option.value}>{option.label}</option>
                                    ))}
                                </Form.Select>
                            </Col>
                            <Col md={6}>
                                <Form.Label>{formCopy.status}</Form.Label>
                                <Form.Select value={formState.status} onChange={(event) => handleChange('status', event.target.value)}>
                                    <option value="published">{formCommon.published}</option>
                                    <option value="draft">{formCommon.draft}</option>
                                </Form.Select>
                            </Col>
                            <Col md={12}>
                                <Form.Label>{formCopy.activeSubscribers}</Form.Label>
                                <Form.Control type="number" min="0" value={formState.activeSubscribers} onChange={(event) => handleChange('activeSubscribers', event.target.value)} />
                            </Col>
                        </Row>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="outline-light" onClick={handleCloseModal} disabled={isSavingPlan}>
                            <span className="d-inline-flex align-items-center gap-2">
                                <X size={14} />
                                {formCopy.cancelEdit}
                            </span>
                        </Button>
                        <Button type="submit" variant="primary" disabled={isSavingPlan}>
                            {isSavingPlan
                                ? (locale === 'ar' ? '\u062c\u0627\u0631\u064d \u0627\u0644\u062d\u0641\u0638...' : 'Saving...')
                                : (formState.id ? formCopy.updatePlan : formCopy.createPlanAction)}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            <Modal show={showPromoModal} onHide={handleClosePromoModal} size="lg" centered className="ckam-plan-modal ckam-promo-modal">
                <Form onSubmit={handlePromoSubmit} className="ckam-modal-form-ltr">
                    <Modal.Header closeButton className="ckam-modal-header">
                        <Modal.Title>{promoFormState.id ? formCopy.editPromoCode : formCopy.createPromoCode}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Row className="g-3 mb-4">
                            <Col md={6}>
                                <Form.Label>{formCopy.promoCodeLabel}</Form.Label>
                                <Form.Control
                                    value={promoFormState.code}
                                    onChange={(event) => handlePromoChange('code', event.target.value.toUpperCase())}
                                    placeholder="WELCOME10"
                                    required
                                />
                            </Col>
                            <Col md={6}>
                                <Form.Label>{formCopy.status}</Form.Label>
                                <Form.Select value={promoFormState.status} onChange={(event) => handlePromoChange('status', event.target.value)} required>
                                    <option value="active">{formCommon.active}</option>
                                    <option value="draft">{formCommon.draft}</option>
                                    <option value="inactive">{formCommon.inactive}</option>
                                </Form.Select>
                            </Col>
                            <Col md={6}>
                                <Form.Label>{formCopy.discountType}</Form.Label>
                                <Form.Select value={promoFormState.type} onChange={(event) => handlePromoChange('type', event.target.value)} required>
                                    <option value="percent">{formCopy.discountPercent}</option>
                                    <option value="fixed">{formCopy.discountFixed}</option>
                                </Form.Select>
                            </Col>
                            <Col md={6}>
                                <Form.Label>{formCopy.discountValue}</Form.Label>
                                <Form.Control
                                    type="number"
                                    min="0"
                                    value={promoFormState.value}
                                    onChange={(event) => handlePromoChange('value', Number(event.target.value || 0))}
                                    required
                                />
                            </Col>
                            <Col md={12}>
                                <Form.Label>{formCopy.appliesToPlans}</Form.Label>
                                <div className="ckam-promo-plans-picker">
                                    <Form.Check
                                        id="promo-applies-all"
                                        type="checkbox"
                                        className="ckam-promo-plan-check is-all"
                                        label={formCopy.allPlans}
                                        checked={promoAppliesToAll}
                                        onChange={handlePromoAllPlansToggle}
                                    />
                                    {plans.map((plan) => (
                                        <Form.Check
                                            id={`promo-applies-${plan.id}`}
                                            key={plan.id}
                                            type="checkbox"
                                            className="ckam-promo-plan-check"
                                            label={getLocalizedValue(plan.name, locale)}
                                            checked={!promoAppliesToAll && promoFormState.appliesTo.includes(plan.id)}
                                            onChange={(event) => handlePromoPlanToggle(plan.id, event.target.checked)}
                                        />
                                    ))}
                                </div>
                            </Col>
                            <Col md={6}>
                                <Form.Label>{formCopy.startsOn}</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={promoFormState.startsOn}
                                    onChange={(event) => handlePromoChange('startsOn', event.target.value)}
                                />
                            </Col>
                            <Col md={6}>
                                <Form.Label>{formCopy.endsOn}</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={promoFormState.endsOn}
                                    onChange={(event) => handlePromoChange('endsOn', event.target.value)}
                                />
                            </Col>
                            <Col md={6}>
                                <Form.Label>{formCopy.usageLimit}</Form.Label>
                                <Form.Control
                                    type="number"
                                    min="0"
                                    value={promoFormState.usageLimit}
                                    onChange={(event) => handlePromoChange('usageLimit', Number(event.target.value || 0))}
                                />
                            </Col>
                            <Col md={6}>
                                <Form.Label>{formCopy.usedCount}</Form.Label>
                                <Form.Control
                                    type="number"
                                    min="0"
                                    value={promoFormState.usedCount}
                                    onChange={(event) => handlePromoChange('usedCount', Number(event.target.value || 0))}
                                />
                            </Col>
                        </Row>

                        <div className="rounded-3 border p-3 bg-light-subtle" dir={promoTranslationLocale === 'ar' ? 'rtl' : 'ltr'}>
                            <TranslationViewSelect
                                locale={locale}
                                value={promoTranslationLocale}
                                onChange={setPromoTranslationLocale}
                                controlId="subscriptions-promo-translation-view"
                            />
                            <Form.Label className={promoLabelAlignClass}>{localizedPromoDescriptionLabel}</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={4}
                                value={promoFormState.description?.[promoTranslationLocale] || ''}
                                onChange={(event) => handlePromoLocalizedChange(promoTranslationLocale, event.target.value)}
                                required
                            />
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="outline-light" onClick={handleClosePromoModal}>
                            <span className="d-inline-flex align-items-center gap-2">
                                <X size={14} />
                                {formCopy.cancelEdit}
                            </span>
                        </Button>
                        <Button type="submit" variant="primary">
                            {promoFormState.id ? formCopy.updatePromoCode : formCopy.savePromoCode}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
};

export default Subscriptions;










