import enCopy from './messages/en.json';
import arCopy from './messages/ar.json';

const isMissingLocalizedValue = (value) => {
    if (typeof value !== 'string') {
        return false;
    }

    const normalized = value.replace(/\uFFFD/g, '?').trim();
    return normalized.length === 0 || /^[?\s]+$/.test(normalized);
};

const sanitizeLocaleTree = (localized, fallback) => {
    if (Array.isArray(localized)) {
        const localizedList = localized || [];
        const fallbackList = Array.isArray(fallback) ? fallback : [];
        const size = Math.max(localizedList.length, fallbackList.length);
        return Array.from({ length: size }, (_, index) =>
            sanitizeLocaleTree(localizedList[index], fallbackList[index])
        );
    }

    if (localized && typeof localized === 'object') {
        const next = {};
        const localizedObject = localized || {};
        const fallbackObject = fallback && typeof fallback === 'object' ? fallback : {};
        const keys = new Set([...Object.keys(fallbackObject), ...Object.keys(localizedObject)]);

        keys.forEach((key) => {
            next[key] = sanitizeLocaleTree(localizedObject[key], fallbackObject[key]);
        });

        return next;
    }

    if (localized === undefined || localized === null) {
        return fallback ?? localized;
    }

    if (isMissingLocalizedValue(localized)) {
        return fallback ?? '';
    }

    return localized;
};

export const adminCopy = {
    en: enCopy,
    ar: sanitizeLocaleTree(arCopy, enCopy),
};

export const getLocalizedValue = (value, locale = 'en') => {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
        const localizedValue = value[locale];
        const fallbackValue = value.en || value.ar || '';
        return localizedValue && !isMissingLocalizedValue(localizedValue) ? localizedValue : fallbackValue;
    }

    if (isMissingLocalizedValue(value)) {
        return '';
    }

    return value || '';
};

const sanitizeLocalizedList = (value) => {
    if (!Array.isArray(value)) {
        return [];
    }

    return value
        .map((item) => String(item ?? '').trim())
        .filter((item) => item && !isMissingLocalizedValue(item));
};

export const getLocalizedList = (value, locale = 'en') => {
    if (Array.isArray(value)) {
        return sanitizeLocalizedList(value);
    }

    if (!value || typeof value !== 'object') {
        return [];
    }

    const localizedList = sanitizeLocalizedList(value[locale]);
    if (localizedList.length > 0) {
        return localizedList;
    }

    const englishList = sanitizeLocalizedList(value.en);
    if (englishList.length > 0) {
        return englishList;
    }

    return sanitizeLocalizedList(value.ar);
};

export const getStatusLabel = (value, locale = 'en') => {
    const copy = adminCopy[locale]?.common || adminCopy.en.common;
    const labels = {
        active: copy.active,
        waiting: copy.waiting,
        deactivated: copy.deactivated,
        connected: copy.connected,
        pending: copy.pending,
        'not-started': copy.notStarted,
        monthly: copy.monthly,
        quarterly: copy.quarterly,
        annual: copy.annual,
        custom: copy.custom,
        published: copy.published,
        draft: copy.draft,
        live: copy.live,
        new: copy.new,
        reviewed: copy.reviewed,
        contacted: copy.contacted,
        inactive: copy.inactive,
        trial: copy.trial,
    };

    return labels[value] || value;
};

export const getAdminIntl = (locale = 'en') => ({
    date: new Intl.DateTimeFormat(locale === 'ar' ? 'ar-BH' : 'en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }),
    currency: new Intl.NumberFormat(locale === 'ar' ? 'ar-BH' : 'en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
    }),
});
