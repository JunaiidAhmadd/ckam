const RAW_API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
export const API_BASE_URL = import.meta.env.DEV ? '' : RAW_API_BASE_URL;

export const API_ENDPOINTS = {
  auth: {
    login: '/api/admin/login',
    verifyOtp: '/api/admin/login/verify-otp',
    profile: '/api/admin/profile',
    publicProfile: '/api/admin/profile/public-profile',
    accountSettings: '/api/admin/profile/account-settings',
    socialLinks: '/api/admin/profile/social-links',
    loginSecurity: '/api/admin/profile/login-security',
    logout: '/api/admin/logout',
    twoFactor: '/api/admin/two-factor',
    verifyTwoFactor: '/api/admin/two-factor/verify',
  },
  websiteBuilder: {
    publicPage: '/api/v1/website-builder/pages/public',
    legalPages: '/api/v1/website-builder/pages/legal',
    slots: '/api/v1/booking/slots',
  },
  ckamAdmin: {
    dashboard: '/api/admin/dashboard',
    messages: '/api/admin/messages',
    messageStatus: (id) => `/api/admin/messages/${id}/status`,
    adminProfile: '/api/admin/profile',
    photographers: '/api/admin/photographers',
    photographerProfile: (id) => `/api/admin/photographers/${id}`,
    photographerAccount: (id) => `/api/admin/photographers/${id}/status`,
    photographerTap: (id) => `/api/admin/photographers/${id}/tap-status`,
    plans: '/api/admin/plans',
    plan: (id) => `/api/admin/plans/${id}`,
    promoCodes: '/api/v1/ckam-admin/promo-codes',
    promoCode: (id) => `/api/v1/ckam-admin/promo-codes/${id}`,
    blogCategories: '/api/admin/site/blog-categories',
    blogCategory: (id) => `/api/admin/site/blog-categories/${id}`,
    blogs: '/api/admin/site/blogs',
    blog: (id) => `/api/admin/site/blogs/${id}`,
    blogSections: (id) => `/api/admin/site/blogs/${id}/sections`,
    sitePages: '/api/admin/site/pages',
    sitePageEdit: (slug) => `/api/admin/site/pages/${slug}/edit`,
    sitePage: (slug) => `/api/admin/site/pages/${slug}`,
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
