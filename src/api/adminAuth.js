import { API_ENDPOINTS, buildApiUrl } from './endpoints';
import {
  clearAuthSession,
  getAdminToken,
  setAdminToken,
  setAuthUser,
} from './authSession';

const requestJson = async (path, options = {}) => {
  const token = getAdminToken();

  const response = await fetch(buildApiUrl(path), {
    method: options.method || 'GET',
    headers: {
      Accept: 'application/json',
      ...(options.isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    body: options.body,
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const message = payload?.message || `API request failed: ${response.status}`;
    throw new Error(message);
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
      body: JSON.stringify({ email, password }),
    });
    return payload;
  },

  verifyOtp: async ({ email, otp }) => {
    const payload = await requestJson(API_ENDPOINTS.auth.verifyOtp, {
      method: 'POST',
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

  logout: async () => {
    try {
      await requestJson(API_ENDPOINTS.auth.logout, { method: 'POST' });
    } finally {
      clearAuthSession();
    }
  },
};
