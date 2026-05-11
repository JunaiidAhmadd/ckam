import { getAdminToken } from './authSession';
import { API_ENDPOINTS, buildApiUrl } from './endpoints';

const slugify = (value = '') =>
  String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

const mapBillingCycleToApi = (value) => {
  if (value === 'annual') return 'yr';
  if (value === 'quarterly') return 'qtr';
  return 'mo';
};

const toFeatureLines = (value) => {
  if (Array.isArray(value)) return value.map((item) => String(item || '').trim()).filter(Boolean);
  return String(value || '')
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);
};

const buildPlanFeaturesPayload = (payload = {}) => {
  const enLines = toFeatureLines(payload?.features?.en);
  const arLines = toFeatureLines(payload?.features?.ar);
  const size = Math.max(enLines.length, arLines.length);

  return Array.from({ length: size })
    .map((_, index) => ({
      feature_key: `custom_feature_${index + 1}`,
      feature_label: enLines[index] || arLines[index] || '',
      ar_feature_label: arLines[index] || enLines[index] || '',
      feature_group: 'Access / Features',
      ar_feature_group: 'Access / Features',
      is_available: true,
      feature_value: null,
      ar_feature_value: null,
      is_highlight: true,
      sort_order: index + 1,
    }))
    .filter((item) => item.feature_label);
};

const buildPlanPayload = (payload = {}, isUpdate = false) => {
  const nameEn = payload?.name?.en || 'Plan';
  const nameAr = payload?.name?.ar || nameEn;
  const descriptionEn = payload?.description?.en || '';
  const descriptionAr = payload?.description?.ar || descriptionEn;
  const badgeEn = payload?.status === 'published' ? 'Published' : 'Draft';

  const requestBody = {
    name: nameEn,
    ar_name: nameAr,
    price: Number(payload?.price || 0),
    currency: payload?.currency || 'BHD',
    billing_cycle: mapBillingCycleToApi(payload?.billingCycle),
    description: descriptionEn,
    ar_description: descriptionAr,
    badge: payload?.badge || badgeEn,
    ar_badge: payload?.ar_badge || badgeEn,
    summary: payload?.summary || descriptionEn,
    ar_summary: payload?.ar_summary || descriptionAr,
    button_label: payload?.button_label || 'Select Plan',
    ar_button_label: payload?.ar_button_label || 'Select Plan',
    is_recommended: Boolean(payload?.is_recommended),
    is_team_plan: Boolean(payload?.is_team_plan),
    support_level: payload?.support_level || 'Standard',
    ar_support_level: payload?.ar_support_level || 'Standard',
    sort_order: Number(payload?.sort_order || 1),
    is_active: payload?.status === 'published',
    features: buildPlanFeaturesPayload(payload),
  };

  if (!isUpdate) {
    const baseSlug = slugify(payload?.slug || nameEn || 'plan') || 'plan';
    requestBody.slug = `${baseSlug}-${Date.now()}`;
  }

  return requestBody;
};

const getLocalizedText = (value, locale = 'en') => {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return String(value[locale] ?? value.en ?? value.ar ?? '').trim();
  }
  return String(value || '').trim();
};

const toBooleanFlag = (value) => (value ? 1 : 0);

const formatPublishedAt = (value) => {
  if (!value) return '';
  const raw = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return `${raw} 00:00:00`;
  return raw;
};

const normalizeFeaturedImage = (value) => {
  const raw = String(value || '').trim();
  if (!raw) return '';
  if (raw.startsWith('data:')) {
    throw new Error('Featured image must be a URL/path, not base64 data.');
  }
  if (raw.length > 255) {
    throw new Error('Featured image field must not be greater than 255 characters.');
  }
  return raw;
};

const isFileLike = (value) => (
  (typeof File !== 'undefined' && value instanceof File)
  || (typeof Blob !== 'undefined' && value instanceof Blob)
);

const isDataUrl = (value) => (
  typeof value === 'string'
  && String(value).trim().toLowerCase().startsWith('data:')
);

const MIME_EXTENSION_MAP = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'image/svg+xml': 'svg',
  'image/bmp': 'bmp',
  'image/x-icon': 'ico',
  'image/vnd.microsoft.icon': 'ico',
};

const sanitizeFilenameKey = (key = 'upload') => String(key || 'upload')
  .replace(/\[[^\]]*\]/g, '_')
  .replace(/[^a-zA-Z0-9._-]+/g, '_')
  .replace(/^_+|_+$/g, '')
  || 'upload';

const extensionFromMime = (mimeType = '') => {
  const normalized = String(mimeType || '').trim().toLowerCase();
  if (MIME_EXTENSION_MAP[normalized]) return MIME_EXTENSION_MAP[normalized];

  const fallback = normalized.split('/')[1] || 'bin';
  return fallback.replace(/[^a-z0-9]+/g, '') || 'bin';
};

const dataUrlToBlobWithFilename = (value, key) => {
  const raw = String(value || '').trim();
  if (!raw) return null;

  const commaIndex = raw.indexOf(',');
  if (!raw.startsWith('data:') || commaIndex <= 5) return null;

  const meta = raw.slice(5, commaIndex);
  const payload = raw.slice(commaIndex + 1);
  const metaParts = meta.split(';').filter(Boolean);
  const mimeType = metaParts[0] || 'application/octet-stream';
  const isBase64Payload = metaParts.some((part) => part.toLowerCase() === 'base64');

  let blob = null;
  if (isBase64Payload) {
    try {
      const decoded = atob(payload);
      const bytes = new Uint8Array(decoded.length);
      for (let index = 0; index < decoded.length; index += 1) {
        bytes[index] = decoded.charCodeAt(index);
      }
      blob = new Blob([bytes], { type: mimeType });
    } catch {
      return null;
    }
  } else {
    try {
      blob = new Blob([decodeURIComponent(payload)], { type: mimeType });
    } catch {
      return null;
    }
  }

  const extension = extensionFromMime(mimeType);
  const filename = `${sanitizeFilenameKey(key)}.${extension}`;
  return { blob, filename };
};

const appendCmsFormDataValue = (formData, key, value) => {
  if (value === undefined || value === null) return;

  if (isFileLike(value)) {
    formData.append(key, value);
    return;
  }

  if (isDataUrl(value)) {
    const converted = dataUrlToBlobWithFilename(value, key);
    if (converted?.blob) {
      formData.append(key, converted.blob, converted.filename);
      return;
    }
  }

  if (Array.isArray(value)) {
    value.forEach((entry, index) => appendCmsFormDataValue(formData, `${key}[${index}]`, entry));
    return;
  }

  if (typeof value === 'object') {
    Object.entries(value).forEach(([childKey, childValue]) => {
      appendCmsFormDataValue(formData, `${key}[${childKey}]`, childValue);
    });
    return;
  }

  formData.append(key, String(value));
};

const payloadHasUploadableData = (value) => {
  if (value === undefined || value === null) return false;
  if (isFileLike(value) || isDataUrl(value)) return true;

  if (Array.isArray(value)) {
    return value.some((entry) => payloadHasUploadableData(entry));
  }

  if (typeof value === 'object') {
    return Object.values(value).some((entry) => payloadHasUploadableData(entry));
  }

  return false;
};

const buildCmsFormData = (payload = {}) => {
  const formData = new FormData();
  Object.entries(payload || {}).forEach(([key, value]) => {
    appendCmsFormDataValue(formData, key, value);
  });
  return formData;
};

const appendFormDataValue = (formData, key, value) => {
  if (value === undefined || value === null) return;
  if (isFileLike(value)) {
    formData.append(key, value);
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((entry, index) => appendFormDataValue(formData, `${key}[${index}]`, entry));
    return;
  }

  if (typeof value === 'object') {
    Object.entries(value).forEach(([childKey, childValue]) => {
      appendFormDataValue(formData, `${key}[${childKey}]`, childValue);
    });
    return;
  }

  formData.append(key, String(value));
};

const buildBlogFormData = (payload = {}) => {
  const titleEn = getLocalizedText(payload?.title_en ?? payload?.title, 'en');
  const titleAr = getLocalizedText(payload?.title_ar ?? payload?.title, 'ar');
  const excerptEn = getLocalizedText(payload?.short_description_en ?? payload?.excerpt, 'en');
  const excerptAr = getLocalizedText(payload?.short_description_ar ?? payload?.excerpt, 'ar');
  const categoryId = Number(
    payload?.site_blog_category_id
      || payload?.categoryId
      || payload?.category
      || 0
  );

  const formData = new FormData();
  formData.append('site_blog_category_id', String(categoryId || ''));
  formData.append('title_en', titleEn);
  formData.append('title_ar', titleAr);
  formData.append('slug', payload?.slug || slugify(titleEn || 'blog-post'));
  formData.append('short_description_en', excerptEn);
  formData.append('short_description_ar', excerptAr);
  formData.append('read_time_en', payload?.read_time_en || payload?.readTime || '5 min read');
  formData.append('read_time_ar', payload?.read_time_ar || payload?.readTimeAr || '5 min read');
  formData.append('author_en', payload?.author_en || payload?.author || 'C-KAM Editorial');
  formData.append('author_ar', payload?.author_ar || payload?.authorAr || 'C-KAM Editorial');
  formData.append('badge_en', payload?.badge_en || payload?.categoryNameEn || payload?.badge || '');
  formData.append('badge_ar', payload?.badge_ar || payload?.categoryNameAr || payload?.badgeAr || '');
  formData.append('is_featured', String(toBooleanFlag(payload?.is_featured ?? payload?.featured)));
  formData.append('sort_order', String(Number(payload?.sort_order || payload?.sortOrder || 1)));
  formData.append('status', String(payload?.status === 'published' || payload?.status === 1 ? 1 : 0));
  formData.append('published_at', formatPublishedAt(payload?.published_at || payload?.publishedAt));

  const featuredImage = payload?.featured_image ?? payload?.imageFile ?? payload?.imageUrl ?? '';
  if (isFileLike(featuredImage)) {
    formData.append('featured_image', featuredImage);
  } else {
    const normalizedImage = normalizeFeaturedImage(featuredImage);
    if (normalizedImage) {
      formData.append('featured_image', normalizedImage);
    }
  }

  if (Array.isArray(payload?.sections)) {
    appendFormDataValue(formData, 'sections', payload.sections);
  }

  return formData;
};

const extractApiErrorMessage = (payload, fallbackMessage) => {
  if (!payload || typeof payload !== 'object') return fallbackMessage;

  if (typeof payload?.message === 'string' && payload.message.trim()) {
    return payload.message.trim();
  }

  if (typeof payload?.error === 'string' && payload.error.trim()) {
    return payload.error.trim();
  }

  if (payload?.errors && typeof payload.errors === 'object') {
    const firstErrorList = Object.values(payload.errors).find((value) => Array.isArray(value) && value.length);
    if (Array.isArray(firstErrorList)) {
      const firstMessage = firstErrorList.find((value) => typeof value === 'string' && value.trim());
      if (firstMessage) return firstMessage.trim();
    }
  }

  return fallbackMessage;
};

const requestJson = async (path, options = {}) => {
  const token = getAdminToken();
  const isFormData = options.body instanceof FormData;
  const response = await fetch(buildApiUrl(path), {
    headers: {
      Accept: 'application/json',
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    let errorMessage = `API request failed: ${response.status}`;
    try {
      const errorPayload = await response.json();
      errorMessage = extractApiErrorMessage(errorPayload, errorMessage);
    } catch {
      try {
        const textPayload = await response.text();
        if (textPayload?.trim()) {
          errorMessage = textPayload.trim();
        }
      } catch {
        // keep default message when response is not readable
      }
    }
    throw new Error(errorMessage);
  }

  if (response.status === 204) return null;
  const payload = await response.json();

  // Some CKAM endpoints may return HTTP 200 with an application-level failure flag.
  const hasStatusCode = Object.prototype.hasOwnProperty.call(payload || {}, 'status_code');
  const hasBooleanStatus = typeof payload?.status === 'boolean';
  const hasStringStatus = typeof payload?.status === 'string';
  const isStatusCodeFailure = hasStatusCode && Number(payload.status_code) !== 1;
  const isBooleanStatusFailure = hasBooleanStatus && payload.status !== true;
  const isStringStatusFailure = hasStringStatus
    && ['error', 'failed', 'failure', 'false'].includes(String(payload.status).toLowerCase());

  if (isStatusCodeFailure || isBooleanStatusFailure || isStringStatusFailure) {
    throw new Error(extractApiErrorMessage(payload, 'Request failed.'));
  }

  return payload;
};

export const ckamApi = {
  getDashboard: () => requestJson(API_ENDPOINTS.ckamAdmin.dashboard, { method: 'GET' }),
  getMessages: () => requestJson(API_ENDPOINTS.ckamAdmin.messages, { method: 'GET' }),
  updateMessageStatus: (id, status) => requestJson(API_ENDPOINTS.ckamAdmin.messageStatus(id), {
    method: 'PUT',
    body: JSON.stringify({ status }),
  }),

  getPlans: () => requestJson(API_ENDPOINTS.ckamAdmin.plans, { method: 'GET' }),

  getPhotographers: () => requestJson(API_ENDPOINTS.ckamAdmin.photographers, { method: 'GET' }),

  getPhotographerProfile: (id) => requestJson(API_ENDPOINTS.ckamAdmin.photographerProfile(id), { method: 'GET' }),

  saveAdminProfile: (payload) => requestJson(API_ENDPOINTS.ckamAdmin.adminProfile, { method: 'PUT', body: JSON.stringify(payload) }),

  updatePhotographerAccount: (id, accountStatus) => requestJson(API_ENDPOINTS.ckamAdmin.photographerAccount(id), {
    method: 'POST',
    body: JSON.stringify({ account_active: accountStatus === 'active' }),
  }),

  updatePhotographerTap: (id, tapStatus) => {
    const normalizedTapStatus = tapStatus === 'not-started' ? 'not_started' : tapStatus;
    const tapConnected = normalizedTapStatus === 'connected';

    return requestJson(API_ENDPOINTS.ckamAdmin.photographerTap(id), {
      method: 'POST',
      body: JSON.stringify({
        tap_connected: tapConnected,
        tap_onboarding_status: tapConnected ? 'active' : normalizedTapStatus,
      }),
    });
  },

  savePhotographerProfile: (id, payload) => requestJson(API_ENDPOINTS.ckamAdmin.photographerProfile(id), {
    method: 'PUT',
    body: JSON.stringify(payload),
  }),

  savePlan: (payload) => {
    const isUpdate = Boolean(payload?.id);
    return requestJson(isUpdate ? API_ENDPOINTS.ckamAdmin.plan(payload.id) : API_ENDPOINTS.ckamAdmin.plans, {
      method: isUpdate ? 'PUT' : 'POST',
      body: JSON.stringify(buildPlanPayload(payload, isUpdate)),
    });
  },

  deletePlan: (id) => requestJson(API_ENDPOINTS.ckamAdmin.plan(id), { method: 'DELETE' }),

  savePromoCode: (payload) => requestJson(payload?.id ? API_ENDPOINTS.ckamAdmin.promoCode(payload.id) : API_ENDPOINTS.ckamAdmin.promoCodes, {
    method: payload?.id ? 'PUT' : 'POST',
    body: JSON.stringify(payload),
  }),

  deletePromoCode: (id) => requestJson(API_ENDPOINTS.ckamAdmin.promoCode(id), { method: 'DELETE' }),

  getBlogCategories: () => requestJson(API_ENDPOINTS.ckamAdmin.blogCategories, { method: 'GET' }),
  getBlogCategory: (id) => requestJson(API_ENDPOINTS.ckamAdmin.blogCategory(id), { method: 'GET' }),
  saveBlogCategory: (payload) => requestJson(
    payload?.id ? API_ENDPOINTS.ckamAdmin.blogCategory(payload.id) : API_ENDPOINTS.ckamAdmin.blogCategories,
    {
      method: payload?.id ? 'PUT' : 'POST',
      body: JSON.stringify(payload),
    }
  ),
  deleteBlogCategory: (id) => requestJson(API_ENDPOINTS.ckamAdmin.blogCategory(id), { method: 'DELETE' }),

  getBlogPosts: (queryString = '') => requestJson(
    `${API_ENDPOINTS.ckamAdmin.blogs}${queryString ? `?${queryString}` : ''}`,
    { method: 'GET' }
  ),
  getBlogPost: (id) => requestJson(API_ENDPOINTS.ckamAdmin.blog(id), { method: 'GET' }),
  getBlogSections: (id) => requestJson(API_ENDPOINTS.ckamAdmin.blogSections(id), { method: 'GET' }),
  saveBlogSections: (id, payload) => requestJson(API_ENDPOINTS.ckamAdmin.blogSections(id), {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  getSitePages: () => requestJson(API_ENDPOINTS.ckamAdmin.sitePages, { method: 'GET' }),
  getSitePage: (slug) => requestJson(API_ENDPOINTS.ckamAdmin.sitePage(slug), { method: 'GET' }),
  getSitePageEdit: (slug) => requestJson(API_ENDPOINTS.ckamAdmin.sitePageEdit(slug), { method: 'GET' }),
  updateSiteHeader: async (payload) => {
    if (payloadHasUploadableData(payload)) {
      const formData = buildCmsFormData(payload);
      formData.append('_method', 'PUT');
      return requestJson(API_ENDPOINTS.ckamAdmin.siteHeader, {
        method: 'POST',
        body: formData,
      });
    }

    return requestJson(API_ENDPOINTS.ckamAdmin.siteHeader, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },
  getSiteHeaderEdit: () => requestJson(API_ENDPOINTS.ckamAdmin.siteHeaderEdit, { method: 'GET' }),
  updateSiteFooter: async (payload) => {
    if (payloadHasUploadableData(payload)) {
      const formData = buildCmsFormData(payload);
      formData.append('_method', 'PUT');
      return requestJson(API_ENDPOINTS.ckamAdmin.siteFooter, {
        method: 'POST',
        body: formData,
      });
    }

    return requestJson(API_ENDPOINTS.ckamAdmin.siteFooter, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },
  getSiteFooterEdit: () => requestJson(API_ENDPOINTS.ckamAdmin.siteFooterEdit, { method: 'GET' }),
  updateSitePage: async (slug, payload) => {
    if (payloadHasUploadableData(payload)) {
      const formData = buildCmsFormData(payload);
      formData.append('_method', 'PUT');
      return requestJson(API_ENDPOINTS.ckamAdmin.sitePage(slug), {
        method: 'POST',
        body: formData,
      });
    }

    try {
      return await requestJson(API_ENDPOINTS.ckamAdmin.sitePage(slug), {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
    } catch {
      return requestJson(API_ENDPOINTS.ckamAdmin.sitePage(slug), {
        method: 'POST',
        body: JSON.stringify({ ...payload, _method: 'PUT' }),
      });
    }
  },

  saveBlogPost: (payload) => {
    const isUpdate = Boolean(payload?.id);
    const formData = buildBlogFormData(payload);
    if (isUpdate) {
      formData.append('_method', 'PUT');
    }

    return requestJson(isUpdate ? API_ENDPOINTS.ckamAdmin.blog(payload.id) : API_ENDPOINTS.ckamAdmin.blogs, {
      method: 'POST',
      body: formData,
    });
  },

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

