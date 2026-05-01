const LEGAL_STORAGE_KEY = 'ckam:public-page-legal-content';

export const writeLegal = (value) => {
    try {
        window.localStorage.setItem(LEGAL_STORAGE_KEY, JSON.stringify(value || {}));
    } catch {
        // ignore storage failures in fallback implementation
    }
};

export const readLegal = () => {
    try {
        const raw = window.localStorage.getItem(LEGAL_STORAGE_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
};
