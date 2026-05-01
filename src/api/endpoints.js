export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

export const API_ENDPOINTS = {
  auth: {
    login: '/api/admin/login',
    verifyOtp: '/api/admin/login/verify-otp',
    profile: '/api/admin/profile',
    logout: '/api/admin/logout',
  },
  websiteBuilder: {
    publicPage: '/api/v1/website-builder/pages/public',
    legalPages: '/api/v1/website-builder/pages/legal',
    slots: '/api/v1/booking/slots',
  },
  ckamAdmin: {
    adminProfile: '/api/v1/ckam-admin/profile',
    photographerProfile: (id) => `/api/v1/ckam-admin/photographers/${id}`,
    photographerAccount: (id) => `/api/v1/ckam-admin/photographers/${id}/account-status`,
    photographerTap: (id) => `/api/v1/ckam-admin/photographers/${id}/tap-status`,
    plans: '/api/v1/ckam-admin/plans',
    plan: (id) => `/api/v1/ckam-admin/plans/${id}`,
    promoCodes: '/api/v1/ckam-admin/promo-codes',
    promoCode: (id) => `/api/v1/ckam-admin/promo-codes/${id}`,
    blogs: '/api/v1/ckam-admin/blogs',
    blog: (id) => `/api/v1/ckam-admin/blogs/${id}`,
    websiteContentSection: (sectionId) => `/api/v1/ckam-admin/website-content/sections/${sectionId}`,
    websiteBrand: '/api/v1/ckam-admin/website-content/brand',
    waitlistStatus: (id) => `/api/v1/ckam-admin/waitlist/${id}/status`,
  },
  i18n: {
    localeFile: (language) => `/locales/${language}.json`,
  },
  media: {
    assetBase: '/storage',
  },
};

export const buildApiUrl = (path = '') => {
  if (!path) return API_BASE_URL;
  if (/^https?:\/\//i.test(path)) return path;
  if (!API_BASE_URL) return path;
  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
};
