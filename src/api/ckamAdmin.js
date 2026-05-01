import { API_ENDPOINTS, buildApiUrl } from './endpoints';

const requestJson = async (path, options = {}) => {
  const response = await fetch(buildApiUrl(path), {
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

  if (response.status === 204) return null;
  return response.json();
};

export const ckamApi = {
  saveAdminProfile: (payload) => requestJson(API_ENDPOINTS.ckamAdmin.adminProfile, { method: 'PUT', body: JSON.stringify(payload) }),

  updatePhotographerAccount: (id, accountStatus) => requestJson(API_ENDPOINTS.ckamAdmin.photographerAccount(id), {
    method: 'PATCH',
    body: JSON.stringify({ accountStatus }),
  }),

  updatePhotographerTap: (id, tapStatus) => requestJson(API_ENDPOINTS.ckamAdmin.photographerTap(id), {
    method: 'PATCH',
    body: JSON.stringify({ tapStatus }),
  }),

  savePhotographerProfile: (id, payload) => requestJson(API_ENDPOINTS.ckamAdmin.photographerProfile(id), {
    method: 'PUT',
    body: JSON.stringify(payload),
  }),

  savePlan: (payload) => requestJson(payload?.id ? API_ENDPOINTS.ckamAdmin.plan(payload.id) : API_ENDPOINTS.ckamAdmin.plans, {
    method: payload?.id ? 'PUT' : 'POST',
    body: JSON.stringify(payload),
  }),

  deletePlan: (id) => requestJson(API_ENDPOINTS.ckamAdmin.plan(id), { method: 'DELETE' }),

  savePromoCode: (payload) => requestJson(payload?.id ? API_ENDPOINTS.ckamAdmin.promoCode(payload.id) : API_ENDPOINTS.ckamAdmin.promoCodes, {
    method: payload?.id ? 'PUT' : 'POST',
    body: JSON.stringify(payload),
  }),

  deletePromoCode: (id) => requestJson(API_ENDPOINTS.ckamAdmin.promoCode(id), { method: 'DELETE' }),

  saveBlogPost: (payload) => requestJson(payload?.id ? API_ENDPOINTS.ckamAdmin.blog(payload.id) : API_ENDPOINTS.ckamAdmin.blogs, {
    method: payload?.id ? 'PUT' : 'POST',
    body: JSON.stringify(payload),
  }),

  deleteBlogPost: (id) => requestJson(API_ENDPOINTS.ckamAdmin.blog(id), { method: 'DELETE' }),

  saveContentSection: (sectionId, payload) => requestJson(API_ENDPOINTS.ckamAdmin.websiteContentSection(sectionId), {
    method: 'PUT',
    body: JSON.stringify(payload),
  }),

  saveBrand: (payload) => requestJson(API_ENDPOINTS.ckamAdmin.websiteBrand, {
    method: 'PUT',
    body: JSON.stringify(payload),
  }),

  updateWaitlistStatus: (id, status) => requestJson(API_ENDPOINTS.ckamAdmin.waitlistStatus(id), {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  }),
};
