/**
 * Field keys that drive visible live preview (copy, images, toggles).
 * Link URLs, sticky header, etc. stay in saved state but are hidden here — they are
 * not meaningfully reflected in the iframe and read as “public URL” clutter.
 */

const PAGE_PREVIEW_BOUND = {
  home: {
    hero: ['title', 'description', 'primaryButtonText', 'primaryButtonShow'],
    growth: ['title'],
    services: ['title', 'subtitle', 'description', 'primaryButtonText', 'primaryButtonShow'],
    faq: ['title', 'subtitle', 'description', 'primaryButtonText', 'primaryButtonShow'],
  },
  features: {
    hero: ['title', 'subtitle', 'primaryButtonText', 'primaryButtonShow'],
    'feature-grid': ['title', 'subtitle', 'eyebrow', 'description', 'primaryButtonText', 'primaryButtonShow'],
    workflow: ['title', 'subtitle', 'description', 'primaryButtonText', 'primaryButtonShow'],
    'fields-extra': ['title', 'subtitle', 'description', 'image'],
    'difference-extra': ['title', 'subtitle', 'description'],
    cta: ['title', 'description', 'primaryButtonText', 'primaryButtonShow'],
  },
  contact: {
    hero: [],
    'contact-info': ['title', 'subtitle', 'address', 'phone', 'email'],
    form: ['submitLabel'],
  },
  booking: {
    hero: ['title', 'subtitle', 'primaryButtonText', 'primaryButtonShow', 'secondaryButtonText', 'secondaryButtonShow'],
    'gallery-extra': ['image'],
    services: ['title', 'subtitle'],
    'about-extra': ['title', 'subtitle', 'primaryButtonText', 'primaryButtonShow', 'secondaryButtonText', 'secondaryButtonShow'],
    'booking-form': ['title', 'subtitle', 'primaryButtonText', 'primaryButtonShow'],
    reviews: ['title'],
  },
  blogs: {
    hero: ['title', 'subtitle', 'primaryButtonText', 'primaryButtonShow', 'secondaryButtonText', 'secondaryButtonShow'],
    categories: [],
    'blog-grid': ['title', 'subtitle'],
    newsletter: ['title', 'subtitle', 'primaryButtonText', 'primaryButtonShow'],
  },
  'single-blog': {
    hero: ['title', 'subtitle'],
    content: ['description', 'title', 'subtitle', 'primaryButtonText', 'primaryButtonShow'],
    sidebar: ['title'],
    related: ['title', 'subtitle'],
  },
  pricing: {
    hero: [],
    plans: ['title', 'subtitle', 'primaryButtonText', 'primaryButtonShow', 'secondaryButtonText', 'secondaryButtonShow'],
    features: ['title', 'subtitle'],
    faq: [],
  },
  'privacy-policy': {
    hero: ['title', 'subtitle'],
    content: ['description'],
  },
  'terms-of-service': {
    hero: ['title', 'subtitle'],
    content: ['description'],
  },
};

const GLOBAL_PREVIEW_BOUND = {
  header: {
    'header-main': ['brandName', 'brandLogo', 'navItems', 'loginLabel'],
  },
  footer: {
    'footer-main': ['title', 'description', 'buttonText', 'copyright'],
  },
};

/**
 * @param {string} pageId - builder page id (e.g. `home`) or global id (`header` / `footer`)
 * @param {string} sectionId - section id (e.g. `hero`, `header-main`)
 * @returns {string[] | undefined} Allowed field keys; `undefined` = no filter (show all schema fields)
 */
export function getPreviewBoundFieldKeys(pageId, sectionId) {
  if (!pageId || !sectionId) return undefined;
  const global = GLOBAL_PREVIEW_BOUND[pageId]?.[sectionId];
  if (global) return global;
  return PAGE_PREVIEW_BOUND[pageId]?.[sectionId];
}
