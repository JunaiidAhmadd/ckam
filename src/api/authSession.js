const ADMIN_TOKEN_KEY = 'ckam:admin:token';
const ADMIN_USER_KEY = 'ckam:admin:user';

const safeParse = (value, fallback = null) => {
    if (!value) return fallback;
    try {
        return JSON.parse(value);
    } catch {
        return fallback;
    }
};

export const getAdminToken = () => {
    if (typeof window === 'undefined') return '';
    return window.localStorage.getItem(ADMIN_TOKEN_KEY) || '';
};

export const setAdminToken = (token) => {
    if (typeof window === 'undefined') return;
    if (!token) {
        window.localStorage.removeItem(ADMIN_TOKEN_KEY);
        return;
    }
    window.localStorage.setItem(ADMIN_TOKEN_KEY, String(token));
};

export const clearAdminToken = () => {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(ADMIN_TOKEN_KEY);
};

export const getAuthUser = () => {
    if (typeof window === 'undefined') {
        return {
            id: 'ckam-admin',
            photographer_identity: 'default-photographer',
        };
    }

    const storedUser = safeParse(window.localStorage.getItem(ADMIN_USER_KEY), null);
    if (storedUser && typeof storedUser === 'object') {
        return storedUser;
    }

    return {
        id: 'ckam-admin',
        photographer_identity: 'default-photographer',
    };
};

export const setAuthUser = (user) => {
    if (typeof window === 'undefined') return;
    if (!user || typeof user !== 'object') {
        window.localStorage.removeItem(ADMIN_USER_KEY);
        return;
    }
    window.localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(user));
};

export const clearAuthSession = () => {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(ADMIN_TOKEN_KEY);
    window.localStorage.removeItem(ADMIN_USER_KEY);
};
