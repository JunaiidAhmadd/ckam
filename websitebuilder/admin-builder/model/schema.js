const localizedText = (en, ar = en) => ({ en, ar });

export const createField = ({
  key,
  label,
  type = 'text',
  value = '',
  helperText = '',
  placeholder = '',
  options = [],
  localized = false,
  repeatable = false,
}) => ({
  key,
  label,
  type,
  value,
  helperText,
  placeholder,
  options,
  localized,
  repeatable,
});

const defaultSectionFields = () => ([
  createField({
    key: 'eyebrow',
    label: localizedText('Eyebrow'),
    type: 'text',
    localized: true,
    value: localizedText('', ''),
  }),
  createField({
    key: 'title',
    label: localizedText('Title'),
    type: 'text',
    localized: true,
    value: localizedText('', ''),
  }),
  createField({
    key: 'subtitle',
    label: localizedText('Subtitle'),
    type: 'text',
    localized: true,
    value: localizedText('', ''),
  }),
  createField({
    key: 'description',
    label: localizedText('Description'),
    type: 'textarea',
    localized: true,
    value: localizedText('', ''),
  }),
  createField({
    key: 'primaryButtonText',
    label: localizedText('Primary Button Text'),
    type: 'text',
    localized: true,
    value: localizedText('Learn more', 'Learn more'),
  }),
  createField({
    key: 'primaryButtonUrl',
    label: localizedText('Primary Button URL'),
    type: 'url',
    value: '#',
  }),
  createField({
    key: 'primaryButtonShow',
    label: localizedText('Show Primary Button'),
    type: 'toggle',
    value: true,
  }),
  createField({
    key: 'secondaryButtonText',
    label: localizedText('Secondary Button Text'),
    type: 'text',
    localized: true,
    value: localizedText('View details', 'View details'),
  }),
  createField({
    key: 'secondaryButtonUrl',
    label: localizedText('Secondary Button URL'),
    type: 'url',
    value: '#',
  }),
  createField({
    key: 'secondaryButtonShow',
    label: localizedText('Show Secondary Button'),
    type: 'toggle',
    value: true,
  }),
  createField({
    key: 'image',
    label: localizedText('Image'),
    type: 'image',
    value: '',
    helperText: localizedText('Upload an image or paste an image URL.'),
  }),
]);

const buildSectionFields = (sectionId) => {
  const defaults = defaultSectionFields();
  const byId = {
    'contact-info': [
      ...defaults,
      createField({ key: 'phone', label: localizedText('Phone'), type: 'text', localized: true, value: localizedText('+1-3454-5678-77') }),
      createField({ key: 'email', label: localizedText('Email'), type: 'text', localized: true, value: localizedText('support@ckam.io') }),
      createField({ key: 'address', label: localizedText('Address'), type: 'textarea', localized: true, value: localizedText('Manama, Bahrain') }),
    ],
    form: [
      ...defaults,
      createField({ key: 'agreeText', label: localizedText('Agreement Text'), type: 'textarea', localized: true, value: localizedText('I agree to terms and privacy policy') }),
      createField({ key: 'submitLabel', label: localizedText('Submit Button Label'), type: 'text', localized: true, value: localizedText('Send Message') }),
    ],
    categories: [
      ...defaults,
      createField({ key: 'highlights', label: localizedText('Category Items'), type: 'list', localized: true, value: { en: ['All', 'Booking', 'Marketing'], ar: ['الكل', 'الحجوزات', 'التسويق'] } }),
    ],
    'blog-grid': [
      ...defaults,
      createField({ key: 'highlights', label: localizedText('Cards Summary'), type: 'list', localized: true, value: { en: ['Card 1', 'Card 2', 'Card 3'], ar: ['بطاقة 1', 'بطاقة 2', 'بطاقة 3'] } }),
    ],
    content: [
      ...defaults,
      createField({ key: 'bodyHtml', label: localizedText('Body HTML/Text'), type: 'textarea', localized: true, value: localizedText('') }),
    ],
    sidebar: [
      ...defaults,
      createField({ key: 'links', label: localizedText('Sidebar Links'), type: 'list', localized: true, value: { en: ['Point 1', 'Point 2'], ar: ['نقطة 1', 'نقطة 2'] } }),
    ],
    plans: [
      ...defaults,
      createField({ key: 'priceText', label: localizedText('Price Text'), type: 'text', localized: true, value: localizedText('$39 / month') }),
      createField({ key: 'billingText', label: localizedText('Billing Note'), type: 'text', localized: true, value: localizedText('Save with yearly billing') }),
    ],
  };

  return byId[sectionId] || defaults;
};

const createSection = (id, enName, arName = enName) => ({
  id,
  name: localizedText(enName, arName),
  show: true,
  fields: buildSectionFields(id),
});

const createPage = (id, enName, arName = enName, sectionIds = []) => ({
  id,
  name: localizedText(enName, arName),
  sections: sectionIds.map((section) => createSection(section.id, section.en, section.ar)),
});

const sectionLabel = (id) => {
  const map = {
    hero: { en: 'Hero', ar: 'Hero' },
    growth: { en: 'Growth', ar: 'Growth' },
    services: { en: 'Services', ar: 'Services' },
    faq: { en: 'FAQ', ar: 'FAQ' },
    'feature-grid': { en: 'Feature Grid', ar: 'Feature Grid' },
    workflow: { en: 'Workflow', ar: 'Workflow' },
    'fields-extra': { en: 'Fields Section', ar: 'Fields Section' },
    'difference-extra': { en: 'Difference Section', ar: 'Difference Section' },
    cta: { en: 'Call To Action', ar: 'Call To Action' },
    plans: { en: 'Plans', ar: 'Plans' },
    features: { en: 'Included Features', ar: 'Included Features' },
    categories: { en: 'Categories', ar: 'Categories' },
    'blog-grid': { en: 'Blog Grid', ar: 'Blog Grid' },
    newsletter: { en: 'Newsletter', ar: 'Newsletter' },
    content: { en: 'Content', ar: 'Content' },
    sidebar: { en: 'Sidebar', ar: 'Sidebar' },
    related: { en: 'Related Posts', ar: 'Related Posts' },
    'contact-info': { en: 'Contact Info', ar: 'Contact Info' },
    form: { en: 'Form', ar: 'Form' },
    'gallery-extra': { en: 'Gallery Section', ar: 'Gallery Section' },
    'about-extra': { en: 'About Section', ar: 'About Section' },
    'booking-form': { en: 'Booking Form', ar: 'Booking Form' },
    reviews: { en: 'Reviews', ar: 'Reviews' },
  };
  return map[id] || { en: id, ar: id };
};

const sectionsFromIds = (ids) => ids.map((id) => ({ id, ...sectionLabel(id) }));

const headerSection = {
  id: 'header-main',
  name: localizedText('Header Content', 'Header Content'),
  show: true,
  fields: [
    createField({
      key: 'brandName',
      label: localizedText('Brand Name'),
      type: 'text',
      localized: true,
      value: localizedText('C-KAM', 'C-KAM'),
    }),
    createField({
      key: 'brandLogo',
      label: localizedText('Brand Logo'),
      type: 'image',
      value: '',
    }),
    createField({
      key: 'navItems',
      label: localizedText('Navigation Items'),
      type: 'list',
      localized: true,
      repeatable: true,
      value: {
        en: ['Home', 'Features', 'Pricing', 'Blogs', 'Contact'],
        ar: ['Home', 'Features', 'Pricing', 'Blogs', 'Contact'],
      },
      helperText: localizedText('One item per line.'),
    }),
    createField({
      key: 'loginLabel',
      label: localizedText('Login Button Label'),
      type: 'text',
      localized: true,
      value: localizedText('Login', 'Login'),
    }),
    createField({
      key: 'loginUrl',
      label: localizedText('Login Button URL'),
      type: 'url',
      value: 'https://ckam-photographer.cyphersol.com/auth/login',
    }),
    createField({
      key: 'sticky',
      label: localizedText('Sticky Header'),
      type: 'toggle',
      value: true,
    }),
  ],
};

const footerSection = {
  id: 'footer-main',
  name: localizedText('Footer Content', 'Footer Content'),
  show: true,
  fields: [
    createField({
      key: 'title',
      label: localizedText('Footer Title'),
      type: 'text',
      localized: true,
      value: localizedText('Let us capture your next story', 'Let us capture your next story'),
    }),
    createField({
      key: 'description',
      label: localizedText('Footer Description'),
      type: 'textarea',
      localized: true,
      value: localizedText('Plan your next session with confidence.', 'Plan your next session with confidence.'),
    }),
    createField({
      key: 'buttonText',
      label: localizedText('Footer Button Text'),
      type: 'text',
      localized: true,
      value: localizedText('Book a Session', 'Book a Session'),
    }),
    createField({
      key: 'buttonUrl',
      label: localizedText('Footer Button URL'),
      type: 'url',
      value: '/booking',
    }),
    createField({
      key: 'copyright',
      label: localizedText('Copyright Text'),
      type: 'text',
      localized: true,
      value: localizedText('(c) C-KAM. All rights reserved.', '(c) C-KAM. All rights reserved.'),
    }),
  ],
};

export const builderSchema = {
  globals: {
    header: {
      id: 'header',
      name: localizedText('Header', 'Header'),
      sections: [headerSection],
    },
    footer: {
      id: 'footer',
      name: localizedText('Footer', 'Footer'),
      sections: [footerSection],
    },
  },
  pages: [
    createPage('home', 'Home Page', 'Home Page', sectionsFromIds(['hero', 'growth', 'services', 'faq'])),
    createPage('features', 'Features Page', 'Features Page', sectionsFromIds(['hero', 'feature-grid', 'workflow', 'fields-extra', 'difference-extra', 'cta'])),
    createPage('contact', 'Contact Page', 'Contact Page', sectionsFromIds(['hero', 'contact-info', 'form'])),
    createPage('about', 'About Page', 'About Page', sectionsFromIds(['hero', 'content'])),
    createPage('booking', 'Booking Page', 'Booking Page', sectionsFromIds(['hero', 'gallery-extra', 'services', 'about-extra', 'booking-form', 'reviews'])),
    createPage('blogs', 'Blogs Page', 'Blogs Page', sectionsFromIds(['hero', 'categories', 'blog-grid', 'newsletter'])),
    createPage('single-blog', 'Single Blog Page', 'Single Blog Page', sectionsFromIds(['hero', 'content', 'sidebar', 'related'])),
    createPage('pricing', 'Pricing Page', 'Pricing Page', sectionsFromIds(['hero', 'plans', 'features', 'faq'])),
    createPage('privacy-policy', 'Privacy Page', 'Privacy Page', sectionsFromIds(['hero', 'content'])),
    createPage('terms-of-service', 'Terms Page', 'Terms Page', sectionsFromIds(['hero', 'content'])),
  ],
};

export const THEME_PRESET_OPTIONS = [
  { value: 'default', label: localizedText('Default', 'Default') },
  { value: 'sand', label: localizedText('Sand', 'Sand') },
  { value: 'ocean', label: localizedText('Ocean', 'Ocean') },
  { value: 'forest', label: localizedText('Forest', 'Forest') },
  { value: 'midnight', label: localizedText('Midnight', 'Midnight') },
];

export const THEME_PRESET_SWATCHES = {
  default: ['#f47e42', '#f87171', '#1f2937'],
  sand: ['#d46a2f', '#e8d8c1', '#2f2a26'],
  ocean: ['#1f7a8c', '#bfdbfe', '#173042'],
  forest: ['#3f7d37', '#d1fae5', '#203223'],
  midnight: ['#fb923c', '#1f2937', '#f8fafc'],
};

export const buildDefaultThemeConfig = () => ({
  selectedPreset: 'default',
  custom: {
    bg: '#ffffff',
    text: '#1f2937',
    accent: '#f4c430',
    buttonBg: '#f47e42',
    buttonText: '#ffffff',
  },
});

export const cloneDeep = (value) => JSON.parse(JSON.stringify(value));

export const STORAGE_VERSION = 'v1';
export const LEGACY_BUILDER_STORAGE_KEY = 'ckam:modular-website-builder:v1';
export const BUILDER_META_STORAGE_KEY = `page_editor_meta_${STORAGE_VERSION}`;
export const BUILDER_THEME_STORAGE_KEY = `page_editor_theme_${STORAGE_VERSION}`;
export const getPageStorageKey = (pageId) => `page_editor_${pageId}_${STORAGE_VERSION}`;
export const getGlobalStorageKey = (globalId) => `page_editor_global_${globalId}_${STORAGE_VERSION}`;

export const getAllBuilderStorageKeys = () => ([
  ...builderSchema.pages.map((page) => getPageStorageKey(page.id)),
  ...Object.keys(builderSchema.globals).map((globalId) => getGlobalStorageKey(globalId)),
  BUILDER_THEME_STORAGE_KEY,
  BUILDER_META_STORAGE_KEY,
  LEGACY_BUILDER_STORAGE_KEY,
]);

export const isLocalizedValue = (value) => (
  Boolean(value) && typeof value === 'object' && !Array.isArray(value) && ('en' in value || 'ar' in value)
);

export const getLocalizedValue = (value, locale = 'en', fallback = '') => {
  if (isLocalizedValue(value)) {
    if (value[locale] !== undefined && value[locale] !== null && value[locale] !== '') {
      return value[locale];
    }
    if (value.en !== undefined && value.en !== null && value.en !== '') {
      return value.en;
    }
    if (value.ar !== undefined && value.ar !== null && value.ar !== '') {
      return value.ar;
    }
    return fallback;
  }
  if (value === undefined || value === null || value === '') return fallback;
  return value;
};

export const ensureLocalizedValue = (value, fallback = '') => {
  if (isLocalizedValue(value)) {
    return {
      en: value.en ?? fallback,
      ar: value.ar ?? fallback,
    };
  }
  return {
    en: value ?? fallback,
    ar: value ?? fallback,
  };
};

const parseList = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item ?? '').trim()).filter(Boolean);
  }
  if (typeof value === 'string') {
    return value
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};

export const normalizeFieldValue = (fieldSchema, incomingValue) => {
  if (fieldSchema.localized) {
    const localized = ensureLocalizedValue(incomingValue, '');

    if (fieldSchema.type === 'list') {
      return {
        en: parseList(localized.en),
        ar: parseList(localized.ar),
      };
    }

    return localized;
  }

  if (fieldSchema.type === 'toggle' || fieldSchema.type === 'boolean') {
    return Boolean(incomingValue);
  }

  if (fieldSchema.type === 'number') {
    const numericValue = Number(incomingValue);
    return Number.isFinite(numericValue) ? numericValue : Number(fieldSchema.value || 0);
  }

  if (fieldSchema.type === 'list') {
    return parseList(incomingValue);
  }

  if (incomingValue === undefined || incomingValue === null) {
    return fieldSchema.value;
  }

  return incomingValue;
};
