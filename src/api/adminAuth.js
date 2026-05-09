import { API_ENDPOINTS, buildApiUrl } from './endpoints';
import {
  clearAuthSession,
  getAdminToken,
  setAdminToken,
  setAuthUser,
} from './authSession';

const requestJson = async (path, options = {}) => {
  const token = options.skipAuth ? '' : getAdminToken();
  const isFormData = options.body instanceof FormData;

  const response = await fetch(buildApiUrl(path), {
    method: options.method || 'GET',
    headers: {
      Accept: 'application/json',
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    body: options.body,
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const validationMessage = payload?.errors && typeof payload.errors === 'object'
      ? Object.values(payload.errors).flat().find(Boolean)
      : '';
    const message = validationMessage || payload?.message || `API request failed: ${response.status}`;
    throw new Error(message);
  }

  const hasBooleanStatus = typeof payload?.status === 'boolean';
  const hasStringStatus = typeof payload?.status === 'string';
  if (
    (hasBooleanStatus && payload.status !== true) ||
    (hasStringStatus && ['error', 'failed', 'failure', 'false'].includes(payload.status.toLowerCase()))
  ) {
    throw new Error(payload?.message || 'Request failed.');
  }

  return payload;
};

const extractToken = (payload) => (
  payload?.token
  || payload?.access_token
  || payload?.data?.token
  || payload?.data?.access_token
  || ''
);

const extractUser = (payload) => (
  payload?.user
  || payload?.data?.user
  || payload?.data
  || null
);

export const adminAuthApi = {
  login: async ({ email, password }) => {
    const payload = await requestJson(API_ENDPOINTS.auth.login, {
      method: 'POST',
      skipAuth: true,
      body: JSON.stringify({ email, password }),
    });

    const token = extractToken(payload);
    const user = extractUser(payload);
    if (token) setAdminToken(token);
    if (user) setAuthUser(user);

    return payload;
  },

  verifyOtp: async ({ email, otp }) => {
    const payload = await requestJson(API_ENDPOINTS.auth.verifyOtp, {
      method: 'POST',
      skipAuth: true,
      body: JSON.stringify({ email, otp }),
    });

    const token = extractToken(payload);
    const user = extractUser(payload);
    if (token) setAdminToken(token);
    if (user) setAuthUser(user);

    return payload;
  },

  profile: async () => {
    const payload = await requestJson(API_ENDPOINTS.auth.profile, { method: 'GET' });
    const user = extractUser(payload);
    if (user) setAuthUser(user);
    return payload;
  },

  updateProfile: async (updates) => requestJson(API_ENDPOINTS.auth.profile, {
    method: 'PUT',
    body: JSON.stringify(updates),
  }),

  updatePublicProfile: async (updates) => requestJson(API_ENDPOINTS.auth.publicProfile, {
    method: 'PUT',
    body: JSON.stringify(updates),
  }),

  updatePublicProfileFormData: async (payload) => {
    const formData = new FormData();
    const appendIfPresent = (key, value) => {
      if (value === undefined || value === null) return;
      const raw = typeof value === 'string' ? value : String(value);
      if (!raw.trim()) return;
      formData.append(key, raw);
    };

    appendIfPresent('first_name', payload?.first_name);
    appendIfPresent('last_name', payload?.last_name);
    appendIfPresent('role', payload?.role);
    appendIfPresent('location', payload?.location);
    appendIfPresent('bio', payload?.bio);
    appendIfPresent('personal_website', payload?.personal_website);
    if (payload?.image instanceof File) {
      formData.append('image', payload.image);
    }

    try {
      return await requestJson(API_ENDPOINTS.auth.publicProfile, {
        method: 'PUT',
        body: formData,
      });
    } catch {
      formData.append('_method', 'PUT');
      return requestJson(API_ENDPOINTS.auth.publicProfile, {
        method: 'POST',
        body: formData,
      });
    }
  },

  updateAccountSettings: async (updates) => requestJson(API_ENDPOINTS.auth.accountSettings, {
    method: 'PUT',
    body: JSON.stringify(updates),
  }),

  updateSocialLinks: async (updates) => requestJson(API_ENDPOINTS.auth.socialLinks, {
    method: 'PUT',
    body: JSON.stringify(updates),
  }),

  updateLoginSecurity: async (updates) => requestJson(API_ENDPOINTS.auth.loginSecurity, {
    method: 'PUT',
    body: JSON.stringify(updates),
  }),

  updateTwoFactor: async ({ enabled, channel = 'email' }) => requestJson(API_ENDPOINTS.auth.twoFactor, {
    method: 'PUT',
    body: JSON.stringify({
      enabled: Boolean(enabled),
      channel,
    }),
  }),

  verifyTwoFactor: async ({ otp }) => requestJson(API_ENDPOINTS.auth.verifyTwoFactor, {
    method: 'POST',
    body: JSON.stringify({ otp }),
  }),

  logout: async () => {
    try {
      await requestJson(API_ENDPOINTS.auth.logout, { method: 'POST' });
    } finally {
      clearAuthSession();
    }
  },
};
