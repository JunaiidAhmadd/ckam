import React, { useEffect } from 'react';
import { Button, ButtonGroup, Card, Form } from 'react-bootstrap';
import { ArrowDownRight, ArrowUpRight } from 'react-feather';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import HkBadge from '../../components/@hk-badge/@hk-badge';
import { toggleCollapsedNav } from '../../redux/action/Theme';
import { useCkamAdmin } from './context';
import { adminCopy } from './localization/i18n';

export const formatCurrency = (amount, locale = 'en', currency = 'USD') => new Intl.NumberFormat(
    locale === 'ar' ? 'ar-BH' : 'en-US',
    {
        style: 'currency',
        currency,
        maximumFractionDigits: 0,
    }
).format(amount || 0);

export const statusToneMap = {
    active: 'success',
    connected: 'success',
    published: 'success',
    live: 'success',
    waiting: 'warning',
    pending: 'warning',
    reviewed: 'warning',
    draft: 'secondary',
    new: 'primary',
    trial: 'info',
    contacted: 'info',
    annual: 'violet',
    monthly: 'primary',
    quarterly: 'orange',
    custom: 'pink',
    deactivated: 'danger',
    inactive: 'danger',
    'not-started': 'light',
};

export const useAdminPageSetup = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(toggleCollapsedNav(false));
    }, [dispatch]);
};

export const StatusPill = ({ label, tone }) => (
    <HkBadge
        size="sm"
        bg={statusToneMap[tone] || 'light'}
        soft
        text={statusToneMap[tone] === 'light' ? 'dark' : undefined}
        className="text-capitalize"
    >
        {label}
    </HkBadge>
);

export const AdminLocaleSwitcher = () => {
    const { locale, setLocale } = useCkamAdmin();

    return (
        <div className="d-flex align-items-center gap-2">
            <span className="fs-8 text-uppercase fw-medium text-muted">{adminCopy[locale].switcherLabel}</span>
            <ButtonGroup size="sm" aria-label="Admin language switcher">
                <Button variant={locale === 'en' ? 'primary' : 'outline-light'} onClick={() => setLocale('en')}>
                    EN
                </Button>
                <Button variant={locale === 'ar' ? 'primary' : 'outline-light'} onClick={() => setLocale('ar')}>
                    AR
                </Button>
            </ButtonGroup>
        </div>
    );
};

const TRANSLATION_VIEW_COPY = {
    en: {
        label: 'Translation View',
        english: 'English text',
        arabic: 'النص العربي',
    },
    ar: {
        label: 'عرض الترجمة',
        english: 'English text',
        arabic: 'النص العربي',
    },
};

export const normalizeTranslationLocale = (value) => (value === 'ar' ? 'ar' : 'en');

export const TranslationViewSelect = ({
    locale = 'en',
    value = 'en',
    onChange,
    className = 'mb-3',
    controlId = 'translation-view',
}) => {
    const uiLocale = locale === 'ar' ? 'ar' : 'en';
    const copy = TRANSLATION_VIEW_COPY[uiLocale];
    const selectedValue = normalizeTranslationLocale(value);

    return (
        <Form.Group className={className}>
            <Form.Label className="text-uppercase fs-8 fw-semibold text-muted mb-2">
                {copy.label}
            </Form.Label>
            <Form.Select
                id={controlId}
                value={selectedValue}
                onChange={(event) => onChange?.(normalizeTranslationLocale(event.target.value))}
            >
                <option value="en">{copy.english}</option>
                <option value="ar">{copy.arabic}</option>
            </Form.Select>
        </Form.Group>
    );
};

export const MetricCard = ({
    title,
    value,
    subtitle,
    trend,
    trendDirection = 'up',
    trendTone,
    linkTo,
    linkLabel,
}) => {
    const badgeTone = trendTone || (trendDirection === 'up' ? 'success' : trendDirection === 'down' ? 'danger' : 'warning');
    const showTrendArrow = trendDirection === 'up' || trendDirection === 'down';

    return (
        <Card className="card-border h-100">
            <Card.Body className="d-flex flex-column h-100">
                <div className="d-flex justify-content-between align-items-start mb-3 gap-3">
                    <div>
                        <div className="text-uppercase fs-8 fw-medium text-primary mb-2">{title}</div>
                        <h3 className="mb-1">{value}</h3>
                        <p className="mb-0 text-muted">{subtitle}</p>
                    </div>
                    {trend && (
                        <HkBadge bg={badgeTone} soft className="text-nowrap">
                            <span className="d-inline-flex align-items-center gap-1">
                                {showTrendArrow && (trendDirection === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />)}
                                {trend}
                            </span>
                        </HkBadge>
                    )}
                </div>
                {linkTo && (
                    <div className="mt-auto pt-3">
                        <Button as={Link} to={linkTo} variant="outline-light" size="sm">
                            {linkLabel}
                        </Button>
                    </div>
                )}
            </Card.Body>
        </Card>
    );
};

export const SectionCard = ({ title, subtitle, action, children, bodyClassName = '', stretch = false }) => (
    <Card className={'card-border' + (stretch ? ' h-100' : '')}>
        <Card.Header className="card-header-action">
            <div>
                <h6 className="mb-1">{title}</h6>
                {subtitle && <p className="mb-0 fs-7 text-muted">{subtitle}</p>}
            </div>
            {action && <div className="card-action-wrap">{action}</div>}
        </Card.Header>
        <Card.Body className={bodyClassName}>
            {children}
        </Card.Body>
    </Card>
);


