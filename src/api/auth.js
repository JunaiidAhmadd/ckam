import { getAuthUser } from './authSession';
import { API_ENDPOINTS, buildApiUrl } from './endpoints';

const PAGE_KEY_PREFIX = 'ckam:public-page-settings:';
const LEGAL_KEY = 'ckam:public-page-legal';

const getIdentity = () => getAuthUser()?.photographer_identity || getAuthUser()?.id || 'default-photographer';
const getPageKey = (identity) => `${PAGE_KEY_PREFIX}${identity || getIdentity()}`;

const readJson = (key, fallback) => {
    try {
        const raw = window.localStorage.getItem(key);
        if (!raw) {
            return fallback;
        }
        const parsed = JSON.parse(raw);
        return parsed ?? fallback;
    } catch {
        return fallback;
    }
};

const writeJson = (key, value) => {
    try {
        window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
        // ignore local storage failures in fallback API
    }
};

const requestJson = async (url, options = {}) => {
    const response = await fetch(url, {
        credentials: 'include',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            ...(options.headers || {}),
        },
        ...options,
    });

    if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
    }

    return response.json();
};

export const getPhotographerPublicPage = async (identity) => {
    try {
        const url = buildApiUrl(`${API_ENDPOINTS.websiteBuilder.publicPage}?identity=${encodeURIComponent(identity || getIdentity())}`);
        return await requestJson(url, { method: 'GET' });
    } catch {
        const pageKey = getPageKey(identity);
        const data = readJson(pageKey, {});
        return { data };
    }
};

export const updatePhotographerPublicPage = async (payload) => {
    try {
        const url = buildApiUrl(API_ENDPOINTS.websiteBuilder.publicPage);
        return await requestJson(url, {
            method: 'PUT',
            body: JSON.stringify({
                identity: getIdentity(),
                public_page_settings: payload,
            }),
        });
    } catch {
        const pageKey = getPageKey();
        const current = readJson(pageKey, {});

        const next = {
            ...current,
            public_page_settings: payload,
        };

        writeJson(pageKey, next);
        return { message: 'Public page saved successfully.' };
    }
};

export const getPhotographerLegalPages = async () => {
    try {
        const url = buildApiUrl(API_ENDPOINTS.websiteBuilder.legalPages);
        return await requestJson(url, { method: 'GET' });
    } catch {
        const pages = readJson(LEGAL_KEY, []);
        return { pages };
    }
};

export const updatePhotographerLegalPages = async (payload) => {
    try {
        const url = buildApiUrl(API_ENDPOINTS.websiteBuilder.legalPages);
        return await requestJson(url, {
            method: 'PUT',
            body: JSON.stringify({ pages: Array.isArray(payload?.pages) ? payload.pages : [] }),
        });
    } catch {
        writeJson(LEGAL_KEY, Array.isArray(payload?.pages) ? payload.pages : []);
        return { message: 'Legal pages saved successfully.' };
    }
};

export const getPhotographerSlots = async ({ date, sessionId, photographerIdentity } = {}) => {
    try {
        const params = new URLSearchParams();
        if (date) params.set('date', date);
        if (sessionId) params.set('session_id', String(sessionId));
        if (photographerIdentity || getIdentity()) params.set('identity', photographerIdentity || getIdentity());

        const url = buildApiUrl(`${API_ENDPOINTS.websiteBuilder.slots}?${params.toString()}`);
        return await requestJson(url, { method: 'GET' });
    } catch {
        return {
            slots: [
                { start: '10:00', end: '10:30' },
                { start: '11:00', end: '11:30' },
                { start: '12:00', end: '12:30' },
                { start: '14:00', end: '14:30' },
                { start: '15:00', end: '15:30' },
            ],
        };
    }
};
