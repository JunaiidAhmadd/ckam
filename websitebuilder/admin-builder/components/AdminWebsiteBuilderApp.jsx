import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Card, Col, Container, Form, Row } from 'react-bootstrap';
import { toast } from 'react-toastify';
import WebsiteBuilderForm from './WebsiteBuilderForm.jsx';
import { useBuilder } from '../state/BuilderContext.jsx';
import { useCkamAdmin } from '../../../src/views/CkamAdmin/context';
import { ckamApi } from '../../../src/api/ckamAdmin';
import { getLocalizedValue } from '../model/schema';

const APP_COPY = {
  en: {
    pageTitle: 'Website Builder',
    pageSubtitle: 'Edits on the left update the preview on the right.',
    liveUpdates: 'Live updates',
    savedLabel: 'Saved',
    notSaved: 'Not saved',
    save: 'Save',
    editor: 'Editor',
    header: 'Header',
    footer: 'Footer',
    livePreview: 'Live preview',
    headerFooterBadge: 'Header + Footer',
    pageBadge: 'Page',
    publicPagePreview: 'Live preview',
    live: 'Live',
  },
  ar: {
    pageTitle: '\u0645\u0646\u0634\u0626 \u0627\u0644\u0645\u0648\u0642\u0639',
    pageSubtitle: '\u0627\u0644\u062a\u0639\u062f\u064a\u0644\u0627\u062a \u0639\u0644\u0649 \u0627\u0644\u064a\u0633\u0627\u0631 \u062a\u064f\u062d\u062f\u0651\u062b \u0627\u0644\u0645\u0639\u0627\u064a\u0646\u0629 \u0639\u0644\u0649 \u0627\u0644\u064a\u0645\u064a\u0646.',
    liveUpdates: '\u062a\u062d\u062f\u064a\u062b\u0627\u062a \u0645\u0628\u0627\u0634\u0631\u0629',
    savedLabel: '\u062a\u0645 \u0627\u0644\u062d\u0641\u0638',
    notSaved: '\u063a\u064a\u0631 \u0645\u062d\u0641\u0648\u0638',
    save: '\u062d\u0641\u0638',
    editor: '\u0627\u0644\u0645\u062d\u0631\u0631',
    header: '\u0627\u0644\u0647\u064a\u062f\u0631',
    footer: '\u0627\u0644\u0641\u0648\u062a\u0631',
    livePreview: '\u0645\u0639\u0627\u064a\u0646\u0629 \u0645\u0628\u0627\u0634\u0631\u0629',
    headerFooterBadge: '\u0627\u0644\u0647\u064a\u062f\u0631 + \u0627\u0644\u0641\u0648\u062a\u0631',
    pageBadge: '\u0627\u0644\u0635\u0641\u062d\u0629',
    publicPagePreview: '\u0645\u0639\u0627\u064a\u0646\u0629 \u0645\u0628\u0627\u0634\u0631\u0629',
    live: '\u0645\u0628\u0627\u0634\u0631',
  },
};

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
const API_BASE_ORIGIN = (() => {
  if (!API_BASE_URL) return '';
  try {
    return new URL(API_BASE_URL).origin;
  } catch {
    return '';
  }
})();

const withApiBase = (value) => {
  const raw = String(value || '').trim();
  if (!raw) return '';
  if (/^https?:\/\//i.test(raw)) return raw;
  if (!API_BASE_URL) return raw.startsWith('/') ? raw : `/${raw}`;
  return raw.startsWith('/') ? `${API_BASE_URL}${raw}` : `${API_BASE_URL}/${raw}`;
};

const toLocalized = (enValue, arValue, fallback = '') => ({
  en: enValue ?? fallback ?? '',
  ar: arValue ?? enValue ?? fallback ?? '',
});

const toTitleCase = (value = '') => String(value)
  .replace(/[_-]+/g, ' ')
  .replace(/\s+/g, ' ')
  .trim()
  .replace(/\b\w/g, (char) => char.toUpperCase());

const SECTION_KEY_LABELS = {
  home_hero: toLocalized('Hero', '\u0627\u0644\u0647\u064a\u0631\u0648'),
  home_provide: toLocalized('Provide', '\u0645\u0627\u0630\u0627 \u0646\u0642\u062f\u0645'),
  home_help: toLocalized('Help', '\u0627\u0644\u0645\u0633\u0627\u0639\u062f\u0629'),
  home_reviews: toLocalized('Reviews', '\u0627\u0644\u0645\u0631\u0627\u062c\u0639\u0627\u062a'),
  home_faqs: toLocalized('FAQs', '\u0627\u0644\u0623\u0633\u0626\u0644\u0629 \u0627\u0644\u0634\u0627\u0626\u0639\u0629'),
};

const sectionLabelFromKey = (sectionKey = '', index = 0) => {
  const rawKey = String(sectionKey || '').trim();
  if (rawKey && SECTION_KEY_LABELS[rawKey]) return SECTION_KEY_LABELS[rawKey];
  const cleaned = rawKey.replace(/^home[_-]?/i, '').trim();
  const readable = cleaned ? toTitleCase(cleaned) : `Section ${index + 1}`;
  return toLocalized(readable, readable);
};

const sortByPosition = (items = []) => (
  [...items].sort((a, b) => Number(a?.position || 0) - Number(b?.position || 0))
);

const mapLocalizedItemField = (items = [], fieldKey) => {
  const sorted = sortByPosition(items);
  return {
    en: sorted.map((item) => String(item?.[`${fieldKey}_en`] || '').trim()).filter(Boolean),
    ar: sorted.map((item) => String(item?.[`${fieldKey}_ar`] || item?.[`${fieldKey}_en`] || '').trim()).filter(Boolean),
  };
};

const mapScalarItemField = (items = [], fieldKey, transform = (value) => String(value || '').trim()) => {
  const sorted = sortByPosition(items);
  return sorted.map((item) => transform(item?.[fieldKey])).filter(Boolean);
};

const hasValue = (value) => value !== null && value !== undefined && String(value).trim() !== '';
const asArray = (value) => (Array.isArray(value) ? value : []);
const asObject = (value) => (value && typeof value === 'object' && !Array.isArray(value) ? value : {});
const asString = (value, fallback = '') => {
  if (value === null || value === undefined) return fallback;
  const normalized = String(value).trim();
  return normalized || fallback;
};
const hasAnyOwnKey = (obj, keys = []) => (
  Boolean(obj)
  && keys.some((key) => Object.prototype.hasOwnProperty.call(obj, key))
);
const resolvePayloadData = (payload, expectedKeys = []) => {
  const root = asObject(payload);
  const nested = asObject(root?.data);

  if (hasAnyOwnKey(nested, expectedKeys)) return nested;
  if (hasAnyOwnKey(root, expectedKeys)) return root;
  if (Object.keys(nested).length > 0) return nested;
  return root;
};

const createField = ({
  key,
  labelEn,
  labelAr,
  type = 'text',
  localized = false,
  value = '',
  options = [],
  helperTextEn = '',
  helperTextAr = '',
}) => ({
  key,
  label: toLocalized(labelEn, labelAr || labelEn),
  type,
  localized,
  value,
  options,
  helperText: toLocalized(helperTextEn, helperTextAr || helperTextEn),
});

const THEME_PRESET_OPTIONS = [
  { value: 'default', label: toLocalized('Default', '\u0627\u0641\u062a\u0631\u0627\u0636\u064a') },
  { value: 'sand', label: toLocalized('Sand', '\u0631\u0645\u0644\u064a') },
  { value: 'ocean', label: toLocalized('Ocean', '\u0645\u062d\u064a\u0637\u064a') },
  { value: 'forest', label: toLocalized('Forest', '\u063a\u0627\u0628\u0629') },
  { value: 'midnight', label: toLocalized('Midnight', '\u0644\u064a\u0644\u064a') },
];

const DEFAULT_HEADER_NAV_LINKS = ['/', '/features', '/pricing', '/blogs', '/contact'];
const DEFAULT_HEADER_NAV_LABELS = {
  en: ['Home', 'Features', 'Pricing', 'Blogs', 'Contact Us'],
  ar: ['الرئيسية', 'المميزات', 'الأسعار', 'المدونة', 'اتصل بنا'],
};
const DEFAULT_FOOTER_LEGAL_LINKS = {
  en: ['Terms of Service', 'Privacy Policy'],
  ar: ['شروط الخدمة', 'سياسة الخصوصية'],
  links: ['/terms-of-service', '/privacy-policy'],
};
const DEFAULT_FOOTER_INSTAGRAM_IMAGES = [
  'uploads/site/footer/instagram-1.png',
  'uploads/site/footer/instagram-2.png',
  'uploads/site/footer/instagram-3.png',
  'uploads/site/footer/instagram-4.png',
];
const DEFAULT_FOOTER_INSTAGRAM_LINKS = ['#', '#', '#', '#'];
const DEFAULT_FOOTER_SOCIAL_ITEMS = [
  { platform: 'facebook', icon: 'facebook', url: '#', position: 1 },
  { platform: 'x', icon: 'twitter', url: '#', position: 2 },
  { platform: 'instagram', icon: 'instagram', url: '#', position: 3 },
  { platform: 'linkedin', icon: 'linkedin', url: '#', position: 4 },
];

const mapCmsSectionToBuilderSection = (section, sectionIndex) => {
  const items = Array.isArray(section?.items) ? section.items : [];
  const sectionId = String(section?.section_key || `section_${sectionIndex + 1}`);
  const sectionLabel = sectionLabelFromKey(section?.section_key, sectionIndex);

  const fields = [];
  const pushField = (field) => fields.push(field);

  pushField(createField({
    key: 'themePreset',
    labelEn: 'Theme Preset',
    labelAr: '\u0642\u0627\u0644\u0628 \u0627\u0644\u0633\u0645\u0629',
    type: 'select',
    value: String(section?.theme_preset || ''),
    options: THEME_PRESET_OPTIONS,
  }));

  pushField(createField({
    key: 'position',
    labelEn: 'Section Position',
    labelAr: '\u062a\u0631\u062a\u064a\u0628 \u0627\u0644\u0642\u0633\u0645',
    type: 'number',
    value: Number(section?.position || 0),
  }));

  pushField(createField({
    key: 'title',
    labelEn: 'Title',
    labelAr: '\u0627\u0644\u0639\u0646\u0648\u0627\u0646',
    localized: true,
    value: toLocalized(section?.title_en, section?.title_ar),
  }));

  pushField(createField({
    key: 'description',
    labelEn: 'Description',
    labelAr: '\u0627\u0644\u0648\u0635\u0641',
    localized: true,
    type: 'textarea',
    value: toLocalized(section?.description_en, section?.description_ar),
  }));

  pushField(createField({
    key: 'image',
    labelEn: 'Primary Image',
    labelAr: '\u0627\u0644\u0635\u0648\u0631\u0629 \u0627\u0644\u0631\u0626\u064a\u0633\u064a\u0629',
    type: 'image',
    value: withApiBase(section?.image),
  }));

  pushField(createField({
    key: 'image2',
    labelEn: 'Secondary Image',
    labelAr: '\u0627\u0644\u0635\u0648\u0631\u0629 \u0627\u0644\u062b\u0627\u0646\u0648\u064a\u0629',
    type: 'image',
    value: withApiBase(section?.image_2),
  }));

  pushField(createField({
    key: 'buttonText',
    labelEn: 'Button Text',
    labelAr: '\u0646\u0635 \u0627\u0644\u0632\u0631',
    localized: true,
    value: toLocalized(section?.button_text_en, section?.button_text_ar),
  }));

  pushField(createField({
    key: 'buttonLink',
    labelEn: 'Button Link',
    labelAr: '\u0631\u0627\u0628\u0637 \u0627\u0644\u0632\u0631',
    type: 'url',
    value: String(section?.button_link || ''),
  }));

  pushField(createField({
    key: 'textColor',
    labelEn: 'Text Color',
    labelAr: '\u0644\u0648\u0646 \u0627\u0644\u0646\u0635',
    type: 'color',
    value: String(section?.text_color || ''),
  }));

  pushField(createField({
    key: 'backgroundColor',
    labelEn: 'Background Color',
    labelAr: '\u0644\u0648\u0646 \u0627\u0644\u062e\u0644\u0641\u064a\u0629',
    type: 'color',
    value: String(section?.background_color || ''),
  }));

  pushField(createField({
    key: 'accentColor',
    labelEn: 'Accent Color',
    labelAr: '\u0627\u0644\u0644\u0648\u0646 \u0627\u0644\u0645\u0645\u064a\u0632',
    type: 'color',
    value: String(section?.accent_color || ''),
  }));

  pushField(createField({
    key: 'buttonColor',
    labelEn: 'Button Color',
    labelAr: '\u0644\u0648\u0646 \u0627\u0644\u0632\u0631',
    type: 'color',
    value: String(section?.button_color || ''),
  }));

  pushField(createField({
    key: 'buttonTextColor',
    labelEn: 'Button Text Color',
    labelAr: '\u0644\u0648\u0646 \u0646\u0635 \u0627\u0644\u0632\u0631',
    type: 'color',
    value: String(section?.button_text_color || ''),
  }));

  pushField(createField({
    key: 'itemsTitles',
    labelEn: 'Items: Titles',
    labelAr: '\u0627\u0644\u0639\u0646\u0627\u0635\u0631: \u0627\u0644\u0639\u0646\u0627\u0648\u064a\u0646',
    type: 'list',
    localized: true,
    value: mapLocalizedItemField(items, 'title'),
    helperTextEn: 'One line per item, in display order.',
    helperTextAr: '\u0633\u0637\u0631 \u0644\u0643\u0644 \u0639\u0646\u0635\u0631 \u062d\u0633\u0628 \u062a\u0631\u062a\u064a\u0628 \u0627\u0644\u0639\u0631\u0636.',
  }));

  pushField(createField({
    key: 'itemsDescriptions',
    labelEn: 'Items: Descriptions',
    labelAr: '\u0627\u0644\u0639\u0646\u0627\u0635\u0631: \u0627\u0644\u0623\u0648\u0635\u0627\u0641',
    type: 'list',
    localized: true,
    value: mapLocalizedItemField(items, 'description'),
    helperTextEn: 'One line per item, in display order.',
    helperTextAr: '\u0633\u0637\u0631 \u0644\u0643\u0644 \u0639\u0646\u0635\u0631 \u062d\u0633\u0628 \u062a\u0631\u062a\u064a\u0628 \u0627\u0644\u0639\u0631\u0636.',
  }));

  pushField(createField({
    key: 'itemImages',
    labelEn: 'Items: Image Paths/URLs',
    labelAr: '\u0627\u0644\u0639\u0646\u0627\u0635\u0631: \u0645\u0633\u0627\u0631\u0627\u062a/\u0631\u0648\u0627\u0628\u0637 \u0627\u0644\u0635\u0648\u0631',
    type: 'list',
    value: mapScalarItemField(items, 'image', (value) => withApiBase(value)),
    helperTextEn: 'One line per item, in display order.',
    helperTextAr: '\u0633\u0637\u0631 \u0644\u0643\u0644 \u0639\u0646\u0635\u0631 \u062d\u0633\u0628 \u062a\u0631\u062a\u064a\u0628 \u0627\u0644\u0639\u0631\u0636.',
  }));

  pushField(createField({
    key: 'itemLinks',
    labelEn: 'Items: Links',
    labelAr: '\u0627\u0644\u0639\u0646\u0627\u0635\u0631: \u0627\u0644\u0631\u0648\u0627\u0628\u0637',
    type: 'list',
    value: mapScalarItemField(items, 'link'),
    helperTextEn: 'One line per item, in display order.',
    helperTextAr: '\u0633\u0637\u0631 \u0644\u0643\u0644 \u0639\u0646\u0635\u0631 \u062d\u0633\u0628 \u062a\u0631\u062a\u064a\u0628 \u0627\u0644\u0639\u0631\u0636.',
  }));

  if (items.some((item) => hasValue(item?.status))) {
    pushField(createField({
      key: 'itemStatuses',
      labelEn: 'Items: Status Flags',
      labelAr: '\u0627\u0644\u0639\u0646\u0627\u0635\u0631: \u062d\u0627\u0644\u0629 \u0627\u0644\u062a\u0641\u0639\u064a\u0644',
      type: 'list',
      value: mapScalarItemField(items, 'status', (value) => String(Number(value ?? 0))),
      helperTextEn: 'One line per item (0/1), in display order.',
      helperTextAr: '\u0633\u0637\u0631 \u0644\u0643\u0644 \u0639\u0646\u0635\u0631 (0/1) \u062d\u0633\u0628 \u062a\u0631\u062a\u064a\u0628 \u0627\u0644\u0639\u0631\u0636.',
    }));
  }

  if (items.some((item) => hasValue(item?.position))) {
    pushField(createField({
      key: 'itemPositions',
      labelEn: 'Items: Positions',
      labelAr: '\u0627\u0644\u0639\u0646\u0627\u0635\u0631: \u0627\u0644\u062a\u0631\u062a\u064a\u0628',
      type: 'list',
      value: mapScalarItemField(items, 'position', (value) => String(Number(value ?? 0))),
      helperTextEn: 'One line per item, in display order.',
      helperTextAr: '\u0633\u0637\u0631 \u0644\u0643\u0644 \u0639\u0646\u0635\u0631 \u062d\u0633\u0628 \u062a\u0631\u062a\u064a\u0628 \u0627\u0644\u0639\u0631\u0636.',
    }));
  }

  if (hasValue(section?.extra_en) || hasValue(section?.extra_ar)) {
    pushField(createField({
      key: 'extra',
      labelEn: 'Extra Content (JSON)',
      labelAr: '\u0627\u0644\u0645\u062d\u062a\u0648\u0649 \u0627\u0644\u0625\u0636\u0627\u0641\u064a (JSON)',
      type: 'textarea',
      localized: true,
      value: toLocalized(
        hasValue(section?.extra_en) ? JSON.stringify(section.extra_en, null, 2) : '',
        hasValue(section?.extra_ar) ? JSON.stringify(section.extra_ar, null, 2) : '',
      ),
    }));
  }

  return {
    id: sectionId,
    name: sectionLabel,
    show: Number(section?.status) === 1,
    allowedFieldKeys: fields.map((field) => field.key),
    fields,
    cmsSectionId: section?.id ?? null,
    cmsSectionKey: section?.section_key || sectionId,
    cmsSectionSnapshot: {
      status: Number(section?.status) === 1 ? 1 : 0,
      position: Number(section?.position || 0),
      theme_preset: section?.theme_preset || 'default',
      text_color: section?.text_color ?? null,
      background_color: section?.background_color ?? null,
      accent_color: section?.accent_color ?? null,
      button_color: section?.button_color ?? null,
      button_text_color: section?.button_text_color ?? null,
      title_en: section?.title_en ?? null,
      title_ar: section?.title_ar ?? null,
      description_en: section?.description_en ?? null,
      description_ar: section?.description_ar ?? null,
      image: section?.image ?? null,
      image_2: section?.image_2 ?? null,
      button_text_en: section?.button_text_en ?? null,
      button_text_ar: section?.button_text_ar ?? null,
      button_link: section?.button_link ?? null,
      extra_en: section?.extra_en ?? null,
      extra_ar: section?.extra_ar ?? null,
    },
    cmsItems: sortByPosition(items).map((item) => ({ ...item })),
  };
};

const mapCmsEditPayloadToBuilderPage = (payload, fallbackPageId = 'home') => {
  const data = resolvePayloadData(payload, [
    'id',
    'slug',
    'title_en',
    'title_ar',
    'status',
    'sections',
    'section',
  ]);
  const sections = Array.isArray(data?.sections)
    ? data.sections
    : (data?.section && typeof data.section === 'object' ? [data.section] : []);
  const pageStatus = Number(data?.status) === 1
    || data?.status === true
    || String(data?.status || '').toLowerCase() === 'active'
    ? 1
    : 0;

  return {
    id: String(data?.slug || fallbackPageId || 'home'),
    name: toLocalized(data?.title_en || 'Page', data?.title_ar || data?.title_en || 'Page'),
    sections: sections.map((section, sectionIndex) => mapCmsSectionToBuilderSection(section, sectionIndex)),
    cmsPageMeta: {
      id: data?.id ?? null,
      slug: String(data?.slug || fallbackPageId || 'home'),
      title_en: data?.title_en ?? null,
      title_ar: data?.title_ar ?? null,
      status: pageStatus,
    },
  };
};

const mapCmsGlobalEditPayloadToBuilderGlobal = (payload, globalId = 'header') => {
  const data = resolvePayloadData(payload, [
    'id',
    'type',
    'title_en',
    'title_ar',
    'status',
    'header',
    'navigation',
    'footer',
    'social_links',
    'sections',
    'section',
  ]);
  const headerPayload = asObject(data?.header);
  const navigationPayload = asObject(data?.navigation);
  const hasHeaderNavigationPayload = globalId === 'header'
    && (Object.keys(headerPayload).length > 0 || Object.keys(navigationPayload).length > 0);

  if (hasHeaderNavigationPayload) {
    const headerEn = asObject(headerPayload?.data_en);
    const headerAr = asObject(headerPayload?.data_ar);
    const headerExtra = asObject(headerPayload?.extra);

    const navigationEn = asObject(navigationPayload?.data_en);
    const navigationAr = asObject(navigationPayload?.data_ar);
    const navigationExtra = asObject(navigationPayload?.extra);

    const navItemsEn = asArray(navigationEn?.items);
    const navItemsAr = asArray(navigationAr?.items);
    const maxNavItems = Math.max(navItemsEn.length, navItemsAr.length, DEFAULT_HEADER_NAV_LINKS.length);

    const navItemsByLocale = Array.from({ length: maxNavItems }).map((_, index) => ({
      en: asString(navItemsEn[index]?.title, DEFAULT_HEADER_NAV_LABELS.en[index] || ''),
      ar: asString(navItemsAr[index]?.title, DEFAULT_HEADER_NAV_LABELS.ar[index] || navItemsEn[index]?.title || ''),
      link: asString(
        navItemsEn[index]?.link,
        asString(navItemsAr[index]?.link, DEFAULT_HEADER_NAV_LINKS[index] || '/')
      ),
      status: String(Number(navItemsEn[index]?.status ?? navItemsAr[index]?.status ?? 1) === 1 ? 1 : 0),
      position: String(Number(navItemsEn[index]?.position ?? navItemsAr[index]?.position ?? index + 1)),
    }));

    const themeSource = asObject(headerExtra?.theme);
    const fallbackThemeSource = asObject(navigationExtra?.theme);
    const theme = Object.keys(themeSource).length ? themeSource : fallbackThemeSource;

    const availableLanguages = asArray(headerExtra?.available_languages)
      .map((value) => asString(value).toLowerCase())
      .filter(Boolean);
    const normalizedAvailableLanguages = availableLanguages.length ? availableLanguages : ['en', 'ar'];
    const defaultLanguage = asString(headerExtra?.default_language, normalizedAvailableLanguages[0] || 'en').toLowerCase();
    const languageOptions = normalizedAvailableLanguages.map((languageCode) => ({
      value: languageCode,
      label: toLocalized(languageCode.toUpperCase(), languageCode.toUpperCase()),
    }));

    const headerLogo = withApiBase(
      asString(
        headerPayload?.image,
        asString(headerEn?.logo, asString(headerAr?.logo, 'uploads/site/logo.png'))
      )
    );

    const headerSectionFields = [
      createField({
        key: 'brandName',
        labelEn: 'Brand Name',
        labelAr: 'اسم العلامة التجارية',
        localized: true,
        value: toLocalized(
          asString(headerEn?.name, 'C-KAM'),
          asString(headerAr?.name, asString(headerEn?.name, 'C-KAM'))
        ),
      }),
      createField({
        key: 'brandLogo',
        labelEn: 'Brand Logo',
        labelAr: 'شعار العلامة التجارية',
        type: 'image',
        value: headerLogo,
      }),
      createField({
        key: 'brandLogoPersisted',
        labelEn: 'Brand Logo Persisted',
        labelAr: 'شعار العلامة التجارية المحفوظ',
        type: 'text',
        value: asString(
          headerPayload?.image,
          asString(headerEn?.logo, asString(headerAr?.logo, 'uploads/site/logo.png'))
        ),
      }),
      createField({
        key: 'navItems',
        labelEn: 'Navigation Items',
        labelAr: 'عناصر التنقل',
        type: 'list',
        localized: true,
        value: {
          en: navItemsByLocale.map((item) => item.en).filter(Boolean),
          ar: navItemsByLocale.map((item) => item.ar).filter(Boolean),
        },
        helperTextEn: 'One item per line.',
        helperTextAr: 'عنصر واحد في كل سطر.',
      }),
      createField({
        key: 'loginLabel',
        labelEn: 'Login Button Label',
        labelAr: 'نص زر تسجيل الدخول',
        localized: true,
        value: toLocalized(
          asString(headerEn?.login_btn_text, 'Login'),
          asString(headerAr?.login_btn_text, 'تسجيل الدخول')
        ),
      }),
      createField({
        key: 'photographerPortalLabel',
        labelEn: 'Portal Button Label',
        labelAr: 'نص زر البوابة',
        localized: true,
        value: toLocalized(
          asString(headerEn?.photographer_portal_btn_text, 'Photographer Portal'),
          asString(headerAr?.photographer_portal_btn_text, 'بوابة المصور')
        ),
      }),
      createField({
        key: 'languageText',
        labelEn: 'Language Button Text',
        labelAr: 'نص زر اللغة',
        localized: true,
        value: toLocalized(
          asString(headerEn?.language_text, 'English'),
          asString(headerAr?.language_text, 'العربية')
        ),
      }),
      createField({
        key: 'languageFlag',
        labelEn: 'Language Flag',
        labelAr: 'علم اللغة',
        type: 'image',
        localized: true,
        value: toLocalized(
          withApiBase(asString(headerEn?.language_flag, 'uploads/site/flags/en.png')),
          withApiBase(asString(headerAr?.language_flag, 'uploads/site/flags/ar.png'))
        ),
      }),
      createField({
        key: 'languageFlagPersistedEn',
        labelEn: 'Language Flag Persisted (EN)',
        labelAr: 'علم اللغة المحفوظ (إنجليزي)',
        type: 'text',
        value: asString(headerEn?.language_flag, 'uploads/site/flags/en.png'),
      }),
      createField({
        key: 'languageFlagPersistedAr',
        labelEn: 'Language Flag Persisted (AR)',
        labelAr: 'علم اللغة المحفوظ (عربي)',
        type: 'text',
        value: asString(headerAr?.language_flag, 'uploads/site/flags/ar.png'),
      }),
      createField({
        key: 'defaultLanguage',
        labelEn: 'Default Language',
        labelAr: 'اللغة الافتراضية',
        type: 'select',
        value: defaultLanguage,
        options: languageOptions,
      }),
      createField({
        key: 'availableLanguages',
        labelEn: 'Available Languages',
        labelAr: 'اللغات المتاحة',
        type: 'list',
        value: normalizedAvailableLanguages,
        helperTextEn: 'One language code per line (for example: en, ar).',
        helperTextAr: 'رمز لغة واحد في كل سطر (مثال: en أو ar).',
      }),
      createField({
        key: 'loginUrl',
        labelEn: 'Login Button URL',
        labelAr: 'رابط زر تسجيل الدخول',
        type: 'url',
        value: 'https://ckam-photographer.cyphersol.com/auth/login',
      }),
      createField({
        key: 'sticky',
        labelEn: 'Sticky Header',
        labelAr: 'تثبيت الهيدر',
        type: 'toggle',
        value: Boolean(headerExtra?.sticky ?? true),
      }),
    ];
    const headerSectionAllowedFieldKeys = headerSectionFields
      .map((field) => field.key)
      .filter((fieldKey) => !fieldKey.startsWith('brandLogoPersisted') && !fieldKey.startsWith('languageFlagPersisted'));

    const navigationSectionFields = [
      createField({
        key: 'navLinks',
        labelEn: 'Navigation Links',
        labelAr: 'روابط التنقل',
        type: 'list',
        value: navItemsByLocale.map((item) => item.link).filter(Boolean),
        helperTextEn: 'One link per line, matching the same order as navigation titles.',
        helperTextAr: 'رابط واحد في كل سطر بنفس ترتيب عناوين التنقل.',
      }),
      createField({
        key: 'navStatuses',
        labelEn: 'Navigation Status Flags',
        labelAr: 'حالة عناصر التنقل',
        type: 'list',
        value: navItemsByLocale.map((item) => item.status),
        helperTextEn: 'One value per line (0 or 1).',
        helperTextAr: 'قيمة واحدة في كل سطر (0 أو 1).',
      }),
      createField({
        key: 'navPositions',
        labelEn: 'Navigation Positions',
        labelAr: 'ترتيب عناصر التنقل',
        type: 'list',
        value: navItemsByLocale.map((item) => item.position),
        helperTextEn: 'One position per line.',
        helperTextAr: 'ترتيب واحد في كل سطر.',
      }),
      createField({
        key: 'navImage',
        labelEn: 'Navigation Image',
        labelAr: 'صورة التنقل',
        type: 'image',
        value: withApiBase(asString(navigationPayload?.image, '')),
      }),
    ];

    return {
      id: globalId,
      name: toLocalized('Header', 'Header'),
      sections: [
        {
          id: 'header-main',
          name: toLocalized('Header Content', 'Header Content'),
          show: Number(headerPayload?.status ?? 1) === 1,
          allowedFieldKeys: headerSectionAllowedFieldKeys,
          fields: headerSectionFields,
        },
        {
          id: 'header-navigation',
          name: toLocalized('Navigation Content', 'Navigation Content'),
          show: Number(navigationPayload?.status ?? 1) === 1,
          allowedFieldKeys: navigationSectionFields.map((field) => field.key),
          fields: navigationSectionFields,
        },
      ],
      cmsGlobalMeta: {
        id: data?.id ?? null,
        type: globalId,
        title_en: data?.title_en ?? null,
        title_ar: data?.title_ar ?? null,
        status: Number(headerPayload?.status ?? navigationPayload?.status ?? data?.status ?? 1) === 1 ? 1 : 0,
      },
      remoteThemeConfig: Object.keys(theme).length
        ? {
          selectedPreset: asString(theme?.theme_preset, 'default'),
          custom: {
            text: asString(theme?.text_color, '#071B4D'),
            bg: asString(theme?.background_color, '#FFFFFF'),
            accent: asString(theme?.accent_color, '#FB7A3C'),
            buttonBg: asString(theme?.button_color, '#FB7A3C'),
            buttonText: asString(theme?.button_text_color, '#FFFFFF'),
          },
        }
        : null,
    };
  }

  const footerPayload = asObject(data?.footer);
  const socialLinksPayload = asObject(data?.social_links);
  const hasFooterSocialPayload = globalId === 'footer'
    && (Object.keys(footerPayload).length > 0 || Object.keys(socialLinksPayload).length > 0);

  if (hasFooterSocialPayload) {
    const footerEn = asObject(footerPayload?.data_en);
    const footerAr = asObject(footerPayload?.data_ar);
    const footerExtra = asObject(footerPayload?.extra);
    const socialEn = asObject(socialLinksPayload?.data_en);
    const socialAr = asObject(socialLinksPayload?.data_ar);

    const quickLinksEn = asArray(footerEn?.quick_links);
    const quickLinksAr = asArray(footerAr?.quick_links);
    const maxQuickLinks = Math.max(
      quickLinksEn.length,
      quickLinksAr.length,
      DEFAULT_HEADER_NAV_LABELS.en.length,
      DEFAULT_HEADER_NAV_LINKS.length
    );
    const quickLinkRows = Array.from({ length: maxQuickLinks }).map((_, index) => ({
      en: asString(quickLinksEn[index]?.title, DEFAULT_HEADER_NAV_LABELS.en[index] || ''),
      ar: asString(
        quickLinksAr[index]?.title,
        DEFAULT_HEADER_NAV_LABELS.ar[index] || quickLinksEn[index]?.title || ''
      ),
      link: asString(
        quickLinksEn[index]?.link,
        asString(quickLinksAr[index]?.link, DEFAULT_HEADER_NAV_LINKS[index] || '/')
      ),
      status: String(Number(quickLinksEn[index]?.status ?? quickLinksAr[index]?.status ?? 1) === 1 ? 1 : 0),
      position: String(Number(quickLinksEn[index]?.position ?? quickLinksAr[index]?.position ?? index + 1)),
    }));

    const legalLinksEn = asArray(footerEn?.legal_links);
    const legalLinksAr = asArray(footerAr?.legal_links);
    const maxLegalLinks = Math.max(
      legalLinksEn.length,
      legalLinksAr.length,
      DEFAULT_FOOTER_LEGAL_LINKS.en.length,
      DEFAULT_FOOTER_LEGAL_LINKS.links.length
    );
    const legalLinkRows = Array.from({ length: maxLegalLinks }).map((_, index) => ({
      en: asString(legalLinksEn[index]?.title, DEFAULT_FOOTER_LEGAL_LINKS.en[index] || ''),
      ar: asString(
        legalLinksAr[index]?.title,
        DEFAULT_FOOTER_LEGAL_LINKS.ar[index] || legalLinksEn[index]?.title || ''
      ),
      link: asString(
        legalLinksEn[index]?.link,
        asString(legalLinksAr[index]?.link, DEFAULT_FOOTER_LEGAL_LINKS.links[index] || '#')
      ),
      status: String(Number(legalLinksEn[index]?.status ?? legalLinksAr[index]?.status ?? 1) === 1 ? 1 : 0),
      position: String(Number(legalLinksEn[index]?.position ?? legalLinksAr[index]?.position ?? index + 1)),
    }));

    const instagramEn = asArray(footerEn?.instagram_images);
    const instagramAr = asArray(footerAr?.instagram_images);
    const maxInstagram = Math.max(instagramEn.length, instagramAr.length, DEFAULT_FOOTER_INSTAGRAM_IMAGES.length);
    const instagramRows = Array.from({ length: maxInstagram }).map((_, index) => ({
      image: withApiBase(asString(
        instagramEn[index]?.image,
        asString(instagramAr[index]?.image, DEFAULT_FOOTER_INSTAGRAM_IMAGES[index] || '')
      )),
      link: asString(
        instagramEn[index]?.link,
        asString(instagramAr[index]?.link, DEFAULT_FOOTER_INSTAGRAM_LINKS[index] || '#')
      ),
      status: String(Number(instagramEn[index]?.status ?? instagramAr[index]?.status ?? 1) === 1 ? 1 : 0),
      position: String(Number(instagramEn[index]?.position ?? instagramAr[index]?.position ?? index + 1)),
    }));

    const socialItemsEn = asArray(socialEn?.items);
    const socialItemsAr = asArray(socialAr?.items);
    const maxSocialItems = Math.max(socialItemsEn.length, socialItemsAr.length, DEFAULT_FOOTER_SOCIAL_ITEMS.length);
    const socialRows = Array.from({ length: maxSocialItems }).map((_, index) => {
      const fallback = DEFAULT_FOOTER_SOCIAL_ITEMS[index] || {};
      const platform = asString(
        socialItemsEn[index]?.platform,
        asString(socialItemsAr[index]?.platform, fallback.platform || `social_${index + 1}`)
      );
      return {
        platform,
        icon: asString(
          socialItemsEn[index]?.icon,
          asString(socialItemsAr[index]?.icon, fallback.icon || platform)
        ),
        url: asString(
          socialItemsEn[index]?.url,
          asString(socialItemsAr[index]?.url, fallback.url || '#')
        ),
        status: String(Number(socialItemsEn[index]?.status ?? socialItemsAr[index]?.status ?? 1) === 1 ? 1 : 0),
        position: String(Number(
          socialItemsEn[index]?.position
          ?? socialItemsAr[index]?.position
          ?? fallback.position
          ?? index + 1
        )),
      };
    });

    const footerTheme = asObject(footerExtra?.theme);
    const footerLogo = withApiBase(asString(
      footerPayload?.image,
      asString(footerEn?.logo, asString(footerAr?.logo, 'uploads/site/logo.png'))
    ));
    const socialImage = withApiBase(asString(socialLinksPayload?.image, ''));

    const footerMainFields = [
      createField({
        key: 'footerLogo',
        labelEn: 'Footer Logo',
        labelAr: 'شعار الفوتر',
        type: 'image',
        value: footerLogo,
      }),
      createField({
        key: 'brandName',
        labelEn: 'Brand Name',
        labelAr: 'اسم العلامة التجارية',
        localized: true,
        value: toLocalized(
          asString(footerEn?.name, 'C-KAM'),
          asString(footerAr?.name, asString(footerEn?.name, 'C-KAM'))
        ),
      }),
      createField({
        key: 'description',
        labelEn: 'Description',
        labelAr: 'الوصف',
        localized: true,
        type: 'textarea',
        value: toLocalized(footerEn?.description, footerAr?.description),
      }),
      createField({
        key: 'newsletterPlaceholder',
        labelEn: 'Newsletter Placeholder',
        labelAr: 'نص حقل النشرة البريدية',
        localized: true,
        value: toLocalized(footerEn?.newsletter_placeholder, footerAr?.newsletter_placeholder),
      }),
      createField({
        key: 'newsletterButtonText',
        labelEn: 'Newsletter Button Text',
        labelAr: 'نص زر النشرة البريدية',
        localized: true,
        value: toLocalized(footerEn?.newsletter_button_text, footerAr?.newsletter_button_text),
      }),
      createField({
        key: 'quickLinksTitle',
        labelEn: 'Quick Links Title',
        labelAr: 'عنوان الروابط السريعة',
        localized: true,
        value: toLocalized(footerEn?.quick_links_title, footerAr?.quick_links_title),
      }),
      createField({
        key: 'legalTitle',
        labelEn: 'Legal Title',
        labelAr: 'عنوان القسم القانوني',
        localized: true,
        value: toLocalized(footerEn?.legal_title, footerAr?.legal_title),
      }),
      createField({
        key: 'instagramTitle',
        labelEn: 'Instagram Title',
        labelAr: 'عنوان إنستغرام',
        localized: true,
        value: toLocalized(footerEn?.instagram_title, footerAr?.instagram_title),
      }),
      createField({
        key: 'contactTitle',
        labelEn: 'Contact Title',
        labelAr: 'عنوان التواصل',
        localized: true,
        value: toLocalized(footerEn?.contact_title, footerAr?.contact_title),
      }),
      createField({
        key: 'location',
        labelEn: 'Location',
        labelAr: 'الموقع',
        localized: true,
        type: 'textarea',
        value: toLocalized(footerEn?.location, footerAr?.location),
      }),
      createField({
        key: 'phone',
        labelEn: 'Phone',
        labelAr: 'الهاتف',
        value: asString(footerEn?.phone, asString(footerAr?.phone, '')),
      }),
      createField({
        key: 'email',
        labelEn: 'Email',
        labelAr: 'البريد الإلكتروني',
        value: asString(footerEn?.email, asString(footerAr?.email, '')),
      }),
      createField({
        key: 'copyright',
        labelEn: 'Copyright',
        labelAr: 'حقوق النشر',
        localized: true,
        value: toLocalized(footerEn?.copyright, footerAr?.copyright),
      }),
      createField({
        key: 'showNewsletter',
        labelEn: 'Show Newsletter',
        labelAr: 'إظهار النشرة البريدية',
        type: 'toggle',
        value: Number(footerExtra?.show_newsletter ?? 1) === 1,
      }),
      createField({
        key: 'showQuickLinks',
        labelEn: 'Show Quick Links',
        labelAr: 'إظهار الروابط السريعة',
        type: 'toggle',
        value: Number(footerExtra?.show_quick_links ?? 1) === 1,
      }),
      createField({
        key: 'showLegalLinks',
        labelEn: 'Show Legal Links',
        labelAr: 'إظهار الروابط القانونية',
        type: 'toggle',
        value: Number(footerExtra?.show_legal_links ?? 1) === 1,
      }),
      createField({
        key: 'showInstagram',
        labelEn: 'Show Instagram',
        labelAr: 'إظهار إنستغرام',
        type: 'toggle',
        value: Number(footerExtra?.show_instagram ?? 1) === 1,
      }),
      createField({
        key: 'showContactInfo',
        labelEn: 'Show Contact Info',
        labelAr: 'إظهار معلومات التواصل',
        type: 'toggle',
        value: Number(footerExtra?.show_contact_info ?? 1) === 1,
      }),
      createField({
        key: 'showSocialLinks',
        labelEn: 'Show Social Links',
        labelAr: 'إظهار روابط التواصل الاجتماعي',
        type: 'toggle',
        value: Number(footerExtra?.show_social_links ?? 1) === 1,
      }),
    ];

    const footerLinksFields = [
      createField({
        key: 'quickLinksTitles',
        labelEn: 'Quick Links: Titles',
        labelAr: 'الروابط السريعة: العناوين',
        type: 'list',
        localized: true,
        value: {
          en: quickLinkRows.map((item) => item.en).filter(Boolean),
          ar: quickLinkRows.map((item) => item.ar).filter(Boolean),
        },
      }),
      createField({
        key: 'quickLinksLinks',
        labelEn: 'Quick Links: URLs',
        labelAr: 'الروابط السريعة: الروابط',
        type: 'list',
        value: quickLinkRows.map((item) => item.link).filter(Boolean),
      }),
      createField({
        key: 'quickLinksStatuses',
        labelEn: 'Quick Links: Status Flags',
        labelAr: 'الروابط السريعة: حالة التفعيل',
        type: 'list',
        value: quickLinkRows.map((item) => item.status),
      }),
      createField({
        key: 'quickLinksPositions',
        labelEn: 'Quick Links: Positions',
        labelAr: 'الروابط السريعة: الترتيب',
        type: 'list',
        value: quickLinkRows.map((item) => item.position),
      }),
      createField({
        key: 'legalLinksTitles',
        labelEn: 'Legal Links: Titles',
        labelAr: 'الروابط القانونية: العناوين',
        type: 'list',
        localized: true,
        value: {
          en: legalLinkRows.map((item) => item.en).filter(Boolean),
          ar: legalLinkRows.map((item) => item.ar).filter(Boolean),
        },
      }),
      createField({
        key: 'legalLinksLinks',
        labelEn: 'Legal Links: URLs',
        labelAr: 'الروابط القانونية: الروابط',
        type: 'list',
        value: legalLinkRows.map((item) => item.link).filter(Boolean),
      }),
      createField({
        key: 'legalLinksStatuses',
        labelEn: 'Legal Links: Status Flags',
        labelAr: 'الروابط القانونية: حالة التفعيل',
        type: 'list',
        value: legalLinkRows.map((item) => item.status),
      }),
      createField({
        key: 'legalLinksPositions',
        labelEn: 'Legal Links: Positions',
        labelAr: 'الروابط القانونية: الترتيب',
        type: 'list',
        value: legalLinkRows.map((item) => item.position),
      }),
      createField({
        key: 'instagramImages',
        labelEn: 'Instagram Images',
        labelAr: 'صور إنستغرام',
        type: 'list',
        value: instagramRows.map((item) => item.image).filter(Boolean),
      }),
      createField({
        key: 'instagramLinks',
        labelEn: 'Instagram Links',
        labelAr: 'روابط إنستغرام',
        type: 'list',
        value: instagramRows.map((item) => item.link),
      }),
      createField({
        key: 'instagramStatuses',
        labelEn: 'Instagram Status Flags',
        labelAr: 'حالة عناصر إنستغرام',
        type: 'list',
        value: instagramRows.map((item) => item.status),
      }),
      createField({
        key: 'instagramPositions',
        labelEn: 'Instagram Positions',
        labelAr: 'ترتيب عناصر إنستغرام',
        type: 'list',
        value: instagramRows.map((item) => item.position),
      }),
    ];

    const footerSocialFields = [
      createField({
        key: 'socialImage',
        labelEn: 'Social Section Image',
        labelAr: 'صورة قسم التواصل الاجتماعي',
        type: 'image',
        value: socialImage,
      }),
      createField({
        key: 'socialPlatforms',
        labelEn: 'Social Platforms',
        labelAr: 'منصات التواصل الاجتماعي',
        type: 'list',
        value: socialRows.map((item) => item.platform).filter(Boolean),
      }),
      createField({
        key: 'socialIcons',
        labelEn: 'Social Icons',
        labelAr: 'أيقونات التواصل الاجتماعي',
        type: 'list',
        value: socialRows.map((item) => item.icon).filter(Boolean),
      }),
      createField({
        key: 'socialUrls',
        labelEn: 'Social URLs',
        labelAr: 'روابط التواصل الاجتماعي',
        type: 'list',
        value: socialRows.map((item) => item.url).filter(Boolean),
      }),
      createField({
        key: 'socialStatuses',
        labelEn: 'Social Status Flags',
        labelAr: 'حالة روابط التواصل الاجتماعي',
        type: 'list',
        value: socialRows.map((item) => item.status),
      }),
      createField({
        key: 'socialPositions',
        labelEn: 'Social Positions',
        labelAr: 'ترتيب روابط التواصل الاجتماعي',
        type: 'list',
        value: socialRows.map((item) => item.position),
      }),
    ];

    return {
      id: globalId,
      name: toLocalized('Footer', 'Footer'),
      sections: [
        {
          id: 'footer-main',
          name: toLocalized('Footer Content', 'Footer Content'),
          show: Number(footerPayload?.status ?? 1) === 1,
          allowedFieldKeys: footerMainFields.map((field) => field.key),
          fields: footerMainFields,
        },
        {
          id: 'footer-links',
          name: toLocalized('Footer Links', 'Footer Links'),
          show: true,
          allowedFieldKeys: footerLinksFields.map((field) => field.key),
          fields: footerLinksFields,
        },
        {
          id: 'footer-social',
          name: toLocalized('Social Links', 'Social Links'),
          show: Number(socialLinksPayload?.status ?? footerExtra?.show_social_links ?? 1) === 1,
          allowedFieldKeys: footerSocialFields.map((field) => field.key),
          fields: footerSocialFields,
        },
      ],
      cmsGlobalMeta: {
        id: data?.id ?? null,
        type: globalId,
        title_en: data?.title_en ?? null,
        title_ar: data?.title_ar ?? null,
        status: Number(footerPayload?.status ?? socialLinksPayload?.status ?? data?.status ?? 1) === 1 ? 1 : 0,
      },
      remoteThemeConfig: Object.keys(footerTheme).length
        ? {
          selectedPreset: asString(footerTheme?.theme_preset, 'default'),
          custom: {
            text: asString(footerTheme?.text_color, '#FFFFFF'),
            bg: asString(footerTheme?.background_color, '#071B4D'),
            accent: asString(footerTheme?.accent_color, '#FB7A3C'),
            buttonBg: asString(footerTheme?.button_color, '#FB7A3C'),
            buttonText: asString(footerTheme?.button_text_color, '#FFFFFF'),
          },
        }
        : null,
    };
  }

  const sections = Array.isArray(data?.sections)
    ? data.sections
    : (data?.section && typeof data.section === 'object' ? [data.section] : []);
  const fallbackName = globalId === 'footer'
    ? toLocalized('Footer', 'Footer')
    : toLocalized('Header', 'Header');

  return {
    id: globalId,
    name: toLocalized(
      data?.title_en || data?.title || fallbackName.en,
      data?.title_ar || data?.title_en || data?.title || fallbackName.ar
    ),
    sections: sections.map((section, sectionIndex) => mapCmsSectionToBuilderSection(section, sectionIndex)),
    cmsGlobalMeta: {
      id: data?.id ?? null,
      type: globalId,
      title_en: data?.title_en ?? null,
      title_ar: data?.title_ar ?? null,
      status: Number(data?.status) === 1 ? 1 : 0,
    },
  };
};

const normalizeList = (value) => {
  if (Array.isArray(value)) return value.map((item) => String(item ?? '').trim()).filter(Boolean);
  if (typeof value === 'string') {
    return value
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};

const normalizeNullableString = (value) => {
  if (value === null || value === undefined) return null;
  const raw = String(value).trim();
  return raw ? raw : null;
};

const toNumericFlag = (value, fallback = 0) => {
  const parsed = Number(value);
  if (Number.isFinite(parsed)) return parsed === 1 ? 1 : 0;
  return fallback ? 1 : 0;
};

const toNumberOrFallback = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizeImagePathForApi = (value) => {
  const raw = String(value || '').trim();
  if (!raw) return null;
  if (raw.startsWith('data:')) return raw;
  if (raw.startsWith('blob:')) return null;

  if (API_BASE_URL && raw.startsWith(`${API_BASE_URL}/`)) {
    return raw.slice(API_BASE_URL.length + 1);
  }

  if (API_BASE_ORIGIN && /^https?:\/\//i.test(raw)) {
    try {
      const parsed = new URL(raw);
      if (parsed.origin === API_BASE_ORIGIN) {
        return parsed.pathname.replace(/^\/+/, '');
      }
    } catch {
      // keep original raw value
    }
  }

  const normalized = raw.replace(/^\/+/, '');
  return normalized.length > 255 ? null : normalized;
};

const fieldByKey = (section, key) => (section?.fields || []).find((field) => field?.key === key);

const localizedFieldValue = (section, key, fallbackEn = null, fallbackAr = null) => {
  const field = fieldByKey(section, key);
  if (!field) return { en: fallbackEn, ar: fallbackAr };
  const value = field.value;
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return {
      en: normalizeNullableString(value.en ?? fallbackEn),
      ar: normalizeNullableString(value.ar ?? value.en ?? fallbackAr),
    };
  }
  const scalar = normalizeNullableString(value);
  return { en: scalar, ar: scalar };
};

const localizedListFieldValue = (section, key, fallbackEn = [], fallbackAr = []) => {
  const field = fieldByKey(section, key);
  if (!field) {
    return {
      en: normalizeList(fallbackEn),
      ar: normalizeList(fallbackAr),
    };
  }

  const value = field.value;
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const enList = normalizeList(value.en ?? fallbackEn);
    const arList = normalizeList(value.ar ?? value.en ?? fallbackAr);
    return { en: enList, ar: arList };
  }

  const list = normalizeList(value);
  return {
    en: list.length ? list : normalizeList(fallbackEn),
    ar: list.length ? list : normalizeList(fallbackAr),
  };
};

const scalarFieldValue = (section, key, fallback = null) => {
  const field = fieldByKey(section, key);
  if (!field) return fallback;
  return field.value;
};

const parseExtraValue = (rawValue, fallbackValue) => {
  const normalized = normalizeNullableString(rawValue);
  if (!normalized) return fallbackValue ?? null;
  try {
    return JSON.parse(normalized);
  } catch {
    return fallbackValue ?? null;
  }
};

const valueAt = (array, index, fallback = null) => (index < array.length ? array[index] : fallback);

const buildNavigationItems = ({
  labels = [],
  fallbackLabels = [],
  links = DEFAULT_HEADER_NAV_LINKS,
  statuses = [],
  positions = [],
} = {}) => {
  const resolvedLabels = labels.length ? labels : fallbackLabels;
  const maxCount = Math.max(resolvedLabels.length, links.length, statuses.length, positions.length);

  return Array.from({ length: maxCount })
    .map((_, index) => {
      const title = String(valueAt(resolvedLabels, index, valueAt(fallbackLabels, index, '')) || '').trim();
      const link = String(valueAt(links, index, '/')).trim() || '/';
      const status = toNumericFlag(valueAt(statuses, index, 1), 1);
      const position = toNumberOrFallback(valueAt(positions, index, index + 1), index + 1);
      return {
        title,
        link,
        status,
        position,
      };
    })
    .filter((item) => item.title);
};

const buildSiteHeaderUpdatePayload = (headerNode, themeConfig) => {
  const sections = Array.isArray(headerNode?.sections) ? headerNode.sections : [];
  const headerSection = sections.find((section) => section?.id === 'header-main') || sections[0] || null;
  const navigationSection = sections.find((section) => section?.id === 'header-navigation') || headerSection;
  if (!headerSection) {
    throw new Error('Header section data is missing.');
  }

  const brandName = localizedFieldValue(headerSection, 'brandName', 'C-KAM', 'C-KAM');
  const loginLabel = localizedFieldValue(headerSection, 'loginLabel', 'Login', 'تسجيل الدخول');
  const photographerPortalLabel = localizedFieldValue(
    headerSection,
    'photographerPortalLabel',
    'Photographer Portal',
    'بوابة المصور'
  );
  const languageText = localizedFieldValue(headerSection, 'languageText', 'English', 'العربية');
  const languageFlag = localizedFieldValue(
    headerSection,
    'languageFlag',
    'uploads/site/flags/en.png',
    'uploads/site/flags/ar.png'
  );
  const persistedLanguageFlagEn = normalizeImagePathForApi(
    scalarFieldValue(headerSection, 'languageFlagPersistedEn', 'uploads/site/flags/en.png')
  ) || 'uploads/site/flags/en.png';
  const persistedLanguageFlagAr = normalizeImagePathForApi(
    scalarFieldValue(headerSection, 'languageFlagPersistedAr', 'uploads/site/flags/ar.png')
  ) || 'uploads/site/flags/ar.png';
  const navItems = localizedListFieldValue(
    headerSection,
    'navItems',
    DEFAULT_HEADER_NAV_LABELS.en,
    DEFAULT_HEADER_NAV_LABELS.ar
  );
  const navLinks = normalizeList(scalarFieldValue(navigationSection, 'navLinks', DEFAULT_HEADER_NAV_LINKS));
  const navStatuses = normalizeList(scalarFieldValue(navigationSection, 'navStatuses', []));
  const navPositions = normalizeList(scalarFieldValue(navigationSection, 'navPositions', []));
  const persistedBrandLogo = normalizeImagePathForApi(
    scalarFieldValue(headerSection, 'brandLogoPersisted', 'uploads/site/logo.png')
  ) || 'uploads/site/logo.png';
  const brandLogo = normalizeImagePathForApi(
    scalarFieldValue(headerSection, 'brandLogo', persistedBrandLogo)
  ) || persistedBrandLogo;
  const navigationImage = normalizeImagePathForApi(scalarFieldValue(navigationSection, 'navImage', null));
  const headerStatus = headerSection.show ? 1 : 0;
  const navigationStatus = navigationSection?.show ? 1 : 0;
  const availableLanguages = normalizeList(scalarFieldValue(headerSection, 'availableLanguages', ['en', 'ar']))
    .map((languageCode) => String(languageCode || '').trim().toLowerCase())
    .filter(Boolean);
  const normalizedAvailableLanguages = availableLanguages.length ? availableLanguages : ['en', 'ar'];
  const defaultLanguage = String(
    scalarFieldValue(headerSection, 'defaultLanguage', normalizedAvailableLanguages[0] || 'en') || ''
  ).trim().toLowerCase() || (normalizedAvailableLanguages[0] || 'en');

  const selectedTheme = themeConfig?.selectedPreset || 'default';
  const customTheme = themeConfig?.custom || {};
  const theme = {
    theme_preset: selectedTheme,
    text_color: normalizeNullableString(customTheme.text) || '#071B4D',
    background_color: normalizeNullableString(customTheme.bg) || '#FFFFFF',
    accent_color: normalizeNullableString(customTheme.accent) || '#FB7A3C',
    button_color: normalizeNullableString(customTheme.buttonBg) || '#FB7A3C',
    button_text_color: normalizeNullableString(customTheme.buttonText) || '#FFFFFF',
  };

  return {
    header: {
      status: headerStatus,
      image: brandLogo,
      data_en: {
        logo: brandLogo,
        name: brandName.en || 'C-KAM',
        login_btn_text: loginLabel.en || 'Login',
        photographer_portal_btn_text: photographerPortalLabel.en || 'Photographer Portal',
        language_text: languageText.en || 'English',
        language_flag: normalizeImagePathForApi(languageFlag.en) || persistedLanguageFlagEn,
      },
      data_ar: {
        logo: brandLogo,
        name: brandName.ar || brandName.en || 'C-KAM',
        login_btn_text: loginLabel.ar || 'تسجيل الدخول',
        photographer_portal_btn_text: photographerPortalLabel.ar || 'بوابة المصور',
        language_text: languageText.ar || 'العربية',
        language_flag: normalizeImagePathForApi(languageFlag.ar) || persistedLanguageFlagAr,
      },
      extra: {
        default_language: defaultLanguage,
        available_languages: normalizedAvailableLanguages,
        theme,
      },
    },
    navigation: {
      status: navigationStatus,
      image: navigationImage,
      data_en: {
        items: buildNavigationItems({
          labels: navItems.en,
          fallbackLabels: DEFAULT_HEADER_NAV_LABELS.en,
          links: navLinks,
          statuses: navStatuses,
          positions: navPositions,
        }),
      },
      data_ar: {
        items: buildNavigationItems({
          labels: navItems.ar,
          fallbackLabels: DEFAULT_HEADER_NAV_LABELS.ar,
          links: navLinks,
          statuses: navStatuses,
          positions: navPositions,
        }),
      },
      extra: {
        theme,
      },
    },
  };
};

const buildSiteFooterUpdatePayload = (footerNode, themeConfig) => {
  const sections = Array.isArray(footerNode?.sections) ? footerNode.sections : [];
  const footerMainSection = sections.find((section) => section?.id === 'footer-main') || sections[0] || null;
  const footerLinksSection = sections.find((section) => section?.id === 'footer-links') || footerMainSection;
  const footerSocialSection = sections.find((section) => section?.id === 'footer-social') || footerMainSection;

  if (!footerMainSection) {
    throw new Error('Footer section data is missing.');
  }

  const footerLogo = normalizeImagePathForApi(
    scalarFieldValue(footerMainSection, 'footerLogo', 'uploads/site/logo.png')
  ) || 'uploads/site/logo.png';
  const footerImage = normalizeImagePathForApi(
    scalarFieldValue(footerMainSection, 'footerImage', footerLogo)
  ) || footerLogo;
  const brandName = localizedFieldValue(footerMainSection, 'brandName', 'C-KAM', 'C-KAM');
  const description = localizedFieldValue(footerMainSection, 'description', null, null);
  const newsletterPlaceholder = localizedFieldValue(
    footerMainSection,
    'newsletterPlaceholder',
    'Enter Your Email',
    'أدخل بريدك الإلكتروني'
  );
  const newsletterButtonText = localizedFieldValue(
    footerMainSection,
    'newsletterButtonText',
    'SUBSCRIBE NOW',
    'اشترك الآن'
  );
  const quickLinksTitle = localizedFieldValue(footerMainSection, 'quickLinksTitle', 'Quick Links', 'روابط سريعة');
  const legalTitle = localizedFieldValue(footerMainSection, 'legalTitle', 'Legal', 'قانوني');
  const instagramTitle = localizedFieldValue(
    footerMainSection,
    'instagramTitle',
    'Follow Instagram',
    'تابعنا على إنستغرام'
  );
  const contactTitle = localizedFieldValue(footerMainSection, 'contactTitle', 'Contact Us', 'اتصل بنا');
  const location = localizedFieldValue(footerMainSection, 'location', null, null);
  const phone = normalizeNullableString(scalarFieldValue(footerMainSection, 'phone', ''));
  const email = normalizeNullableString(scalarFieldValue(footerMainSection, 'email', ''));
  const copyright = localizedFieldValue(footerMainSection, 'copyright', null, null);

  const quickLinksTitles = localizedListFieldValue(
    footerLinksSection,
    'quickLinksTitles',
    DEFAULT_HEADER_NAV_LABELS.en,
    DEFAULT_HEADER_NAV_LABELS.ar
  );
  const quickLinksLinks = normalizeList(
    scalarFieldValue(footerLinksSection, 'quickLinksLinks', DEFAULT_HEADER_NAV_LINKS)
  );
  const quickLinksStatuses = normalizeList(scalarFieldValue(footerLinksSection, 'quickLinksStatuses', []));
  const quickLinksPositions = normalizeList(scalarFieldValue(footerLinksSection, 'quickLinksPositions', []));

  const legalLinksTitles = localizedListFieldValue(
    footerLinksSection,
    'legalLinksTitles',
    DEFAULT_FOOTER_LEGAL_LINKS.en,
    DEFAULT_FOOTER_LEGAL_LINKS.ar
  );
  const legalLinksLinks = normalizeList(
    scalarFieldValue(footerLinksSection, 'legalLinksLinks', DEFAULT_FOOTER_LEGAL_LINKS.links)
  );
  const legalLinksStatuses = normalizeList(scalarFieldValue(footerLinksSection, 'legalLinksStatuses', []));
  const legalLinksPositions = normalizeList(scalarFieldValue(footerLinksSection, 'legalLinksPositions', []));

  const instagramImages = normalizeList(
    scalarFieldValue(footerLinksSection, 'instagramImages', DEFAULT_FOOTER_INSTAGRAM_IMAGES)
  );
  const instagramLinks = normalizeList(
    scalarFieldValue(footerLinksSection, 'instagramLinks', DEFAULT_FOOTER_INSTAGRAM_LINKS)
  );
  const instagramStatuses = normalizeList(scalarFieldValue(footerLinksSection, 'instagramStatuses', []));
  const instagramPositions = normalizeList(scalarFieldValue(footerLinksSection, 'instagramPositions', []));
  const instagramCount = Math.max(
    instagramImages.length,
    instagramLinks.length,
    instagramStatuses.length,
    instagramPositions.length,
    DEFAULT_FOOTER_INSTAGRAM_IMAGES.length
  );
  const instagramItems = Array.from({ length: instagramCount })
    .map((_, index) => ({
      image: normalizeImagePathForApi(valueAt(instagramImages, index, DEFAULT_FOOTER_INSTAGRAM_IMAGES[index] || '')),
      link: String(valueAt(instagramLinks, index, DEFAULT_FOOTER_INSTAGRAM_LINKS[index] || '#') || '#').trim() || '#',
      status: toNumericFlag(valueAt(instagramStatuses, index, 1), 1),
      position: toNumberOrFallback(valueAt(instagramPositions, index, index + 1), index + 1),
    }))
    .filter((item) => item.image);

  const socialImage = normalizeImagePathForApi(scalarFieldValue(footerSocialSection, 'socialImage', null));
  const socialPlatforms = normalizeList(
    scalarFieldValue(
      footerSocialSection,
      'socialPlatforms',
      DEFAULT_FOOTER_SOCIAL_ITEMS.map((item) => item.platform)
    )
  );
  const socialIcons = normalizeList(
    scalarFieldValue(
      footerSocialSection,
      'socialIcons',
      DEFAULT_FOOTER_SOCIAL_ITEMS.map((item) => item.icon)
    )
  );
  const socialUrls = normalizeList(
    scalarFieldValue(
      footerSocialSection,
      'socialUrls',
      DEFAULT_FOOTER_SOCIAL_ITEMS.map((item) => item.url)
    )
  );
  const socialStatuses = normalizeList(scalarFieldValue(footerSocialSection, 'socialStatuses', []));
  const socialPositions = normalizeList(scalarFieldValue(footerSocialSection, 'socialPositions', []));
  const socialCount = Math.max(
    socialPlatforms.length,
    socialIcons.length,
    socialUrls.length,
    socialStatuses.length,
    socialPositions.length,
    DEFAULT_FOOTER_SOCIAL_ITEMS.length
  );
  const socialItems = Array.from({ length: socialCount })
    .map((_, index) => {
      const fallback = DEFAULT_FOOTER_SOCIAL_ITEMS[index] || {};
      const platform = String(valueAt(socialPlatforms, index, fallback.platform || `social_${index + 1}`) || '').trim();
      if (!platform) return null;

      return {
        platform,
        icon: String(valueAt(socialIcons, index, fallback.icon || platform) || platform).trim() || platform,
        url: String(valueAt(socialUrls, index, fallback.url || '#') || '#').trim() || '#',
        status: toNumericFlag(valueAt(socialStatuses, index, 1), 1),
        position: toNumberOrFallback(valueAt(socialPositions, index, fallback.position || index + 1), fallback.position || index + 1),
      };
    })
    .filter(Boolean);

  const footerStatus = footerMainSection.show ? 1 : 0;
  const socialStatus = footerSocialSection?.show ? 1 : 0;
  const showNewsletter = toNumericFlag(scalarFieldValue(footerMainSection, 'showNewsletter', 1), 1);
  const showQuickLinks = toNumericFlag(scalarFieldValue(footerMainSection, 'showQuickLinks', 1), 1);
  const showLegalLinks = toNumericFlag(scalarFieldValue(footerMainSection, 'showLegalLinks', 1), 1);
  const showInstagram = toNumericFlag(scalarFieldValue(footerMainSection, 'showInstagram', 1), 1);
  const showContactInfo = toNumericFlag(scalarFieldValue(footerMainSection, 'showContactInfo', 1), 1);
  const showSocialLinks = toNumericFlag(scalarFieldValue(footerMainSection, 'showSocialLinks', socialStatus), socialStatus);

  const selectedTheme = themeConfig?.selectedPreset || 'default';
  const customTheme = themeConfig?.custom || {};
  const theme = {
    theme_preset: selectedTheme,
    text_color: normalizeNullableString(customTheme.text) || '#FFFFFF',
    background_color: normalizeNullableString(customTheme.bg) || '#071B4D',
    accent_color: normalizeNullableString(customTheme.accent) || '#FB7A3C',
    button_color: normalizeNullableString(customTheme.buttonBg) || '#FB7A3C',
    button_text_color: normalizeNullableString(customTheme.buttonText) || '#FFFFFF',
  };

  return {
    footer: {
      status: footerStatus,
      image: footerImage,
      data_en: {
        logo: footerLogo,
        name: brandName.en || 'C-KAM',
        description: description.en || '',
        newsletter_placeholder: newsletterPlaceholder.en || 'Enter Your Email',
        newsletter_button_text: newsletterButtonText.en || 'SUBSCRIBE NOW',
        quick_links_title: quickLinksTitle.en || 'Quick Links',
        legal_title: legalTitle.en || 'Legal',
        instagram_title: instagramTitle.en || 'Follow Instagram',
        contact_title: contactTitle.en || 'Contact Us',
        location: location.en || '',
        phone: phone || '',
        email: email || '',
        copyright: copyright.en || '',
        quick_links: buildNavigationItems({
          labels: quickLinksTitles.en,
          fallbackLabels: DEFAULT_HEADER_NAV_LABELS.en,
          links: quickLinksLinks,
          statuses: quickLinksStatuses,
          positions: quickLinksPositions,
        }),
        legal_links: buildNavigationItems({
          labels: legalLinksTitles.en,
          fallbackLabels: DEFAULT_FOOTER_LEGAL_LINKS.en,
          links: legalLinksLinks,
          statuses: legalLinksStatuses,
          positions: legalLinksPositions,
        }),
        instagram_images: instagramItems,
      },
      data_ar: {
        logo: footerLogo,
        name: brandName.ar || brandName.en || 'C-KAM',
        description: description.ar || description.en || '',
        newsletter_placeholder: newsletterPlaceholder.ar || 'أدخل بريدك الإلكتروني',
        newsletter_button_text: newsletterButtonText.ar || 'اشترك الآن',
        quick_links_title: quickLinksTitle.ar || 'روابط سريعة',
        legal_title: legalTitle.ar || 'قانوني',
        instagram_title: instagramTitle.ar || 'تابعنا على إنستغرام',
        contact_title: contactTitle.ar || 'اتصل بنا',
        location: location.ar || location.en || '',
        phone: phone || '',
        email: email || '',
        copyright: copyright.ar || copyright.en || '',
        quick_links: buildNavigationItems({
          labels: quickLinksTitles.ar,
          fallbackLabels: DEFAULT_HEADER_NAV_LABELS.ar,
          links: quickLinksLinks,
          statuses: quickLinksStatuses,
          positions: quickLinksPositions,
        }),
        legal_links: buildNavigationItems({
          labels: legalLinksTitles.ar,
          fallbackLabels: DEFAULT_FOOTER_LEGAL_LINKS.ar,
          links: legalLinksLinks,
          statuses: legalLinksStatuses,
          positions: legalLinksPositions,
        }),
        instagram_images: instagramItems,
      },
      extra: {
        show_newsletter: showNewsletter,
        show_quick_links: showQuickLinks,
        show_legal_links: showLegalLinks,
        show_instagram: showInstagram,
        show_contact_info: showContactInfo,
        show_social_links: showSocialLinks,
        theme,
      },
    },
    social_links: {
      status: socialStatus,
      image: socialImage,
      data_en: {
        items: socialItems,
      },
      data_ar: {
        items: socialItems,
      },
      extra: null,
    },
  };
};

const buildSitePageUpdatePayload = (pageNode) => {
  const pageMeta = pageNode?.cmsPageMeta || {};
  const pageName = pageNode?.name || {};
  const pageTitleEn = normalizeNullableString(pageName?.en) || normalizeNullableString(pageMeta?.title_en) || 'Home';
  const pageTitleAr = normalizeNullableString(pageName?.ar) || normalizeNullableString(pageMeta?.title_ar) || pageTitleEn;
  const sections = Array.isArray(pageNode?.sections) ? pageNode.sections : [];

  return {
    title_en: pageTitleEn,
    title_ar: pageTitleAr,
    status: toNumericFlag(pageMeta?.status, 1),
    sections: sections.map((section, sectionIndex) => {
      const snapshot = section?.cmsSectionSnapshot || {};
      const baseItems = Array.isArray(section?.cmsItems) ? section.cmsItems : [];

      const title = localizedFieldValue(section, 'title', snapshot.title_en, snapshot.title_ar);
      const description = localizedFieldValue(section, 'description', snapshot.description_en, snapshot.description_ar);
      const buttonText = localizedFieldValue(section, 'buttonText', snapshot.button_text_en, snapshot.button_text_ar);
      const extra = localizedFieldValue(
        section,
        'extra',
        snapshot.extra_en ? JSON.stringify(snapshot.extra_en) : null,
        snapshot.extra_ar ? JSON.stringify(snapshot.extra_ar) : null
      );

      const itemsTitles = localizedFieldValue(section, 'itemsTitles', null, null);
      const itemsDescriptions = localizedFieldValue(section, 'itemsDescriptions', null, null);
      const itemImageLines = normalizeList(scalarFieldValue(section, 'itemImages', []));
      const itemLinkLines = normalizeList(scalarFieldValue(section, 'itemLinks', []));
      const itemStatusLines = normalizeList(scalarFieldValue(section, 'itemStatuses', []));
      const itemPositionLines = normalizeList(scalarFieldValue(section, 'itemPositions', []));

      const titleEnLines = normalizeList(itemsTitles.en);
      const titleArLines = normalizeList(itemsTitles.ar);
      const descriptionEnLines = normalizeList(itemsDescriptions.en);
      const descriptionArLines = normalizeList(itemsDescriptions.ar);

      const maxItemCount = Math.max(
        baseItems.length,
        titleEnLines.length,
        titleArLines.length,
        descriptionEnLines.length,
        descriptionArLines.length,
        itemImageLines.length,
        itemLinkLines.length,
        itemStatusLines.length,
        itemPositionLines.length
      );

      const fallbackItemType = baseItems[0]?.item_type || null;
      const sectionStatus = section?.show ? 1 : 0;

      return {
        id: section?.cmsSectionId ?? null,
        section_key: String(section?.cmsSectionKey || section?.id || `section_${sectionIndex + 1}`),
        status: sectionStatus,
        position: toNumberOrFallback(
          scalarFieldValue(section, 'position', snapshot.position ?? sectionIndex + 1),
          snapshot.position ?? sectionIndex + 1
        ),
        theme_preset: normalizeNullableString(scalarFieldValue(section, 'themePreset', snapshot.theme_preset)) || 'default',
        text_color: normalizeNullableString(scalarFieldValue(section, 'textColor', snapshot.text_color)),
        background_color: normalizeNullableString(scalarFieldValue(section, 'backgroundColor', snapshot.background_color)),
        accent_color: normalizeNullableString(scalarFieldValue(section, 'accentColor', snapshot.accent_color)),
        button_color: normalizeNullableString(scalarFieldValue(section, 'buttonColor', snapshot.button_color)),
        button_text_color: normalizeNullableString(scalarFieldValue(section, 'buttonTextColor', snapshot.button_text_color)),
        title_en: title.en,
        title_ar: title.ar,
        description_en: description.en,
        description_ar: description.ar,
        image: normalizeImagePathForApi(scalarFieldValue(section, 'image', snapshot.image)),
        image_2: normalizeImagePathForApi(scalarFieldValue(section, 'image2', snapshot.image_2)),
        button_text_en: buttonText.en,
        button_text_ar: buttonText.ar,
        button_link: normalizeNullableString(scalarFieldValue(section, 'buttonLink', snapshot.button_link)),
        extra_en: parseExtraValue(extra.en, snapshot.extra_en),
        extra_ar: parseExtraValue(extra.ar, snapshot.extra_ar),
        items: Array.from({ length: maxItemCount }).map((_, itemIndex) => {
          const baseItem = baseItems[itemIndex] || {};
          return {
            id: baseItem?.id ?? null,
            item_type: normalizeNullableString(baseItem?.item_type) || fallbackItemType,
            title_en: valueAt(titleEnLines, itemIndex, normalizeNullableString(baseItem?.title_en)),
            title_ar: valueAt(
              titleArLines,
              itemIndex,
              normalizeNullableString(baseItem?.title_ar) || normalizeNullableString(baseItem?.title_en)
            ),
            description_en: valueAt(descriptionEnLines, itemIndex, normalizeNullableString(baseItem?.description_en)),
            description_ar: valueAt(
              descriptionArLines,
              itemIndex,
              normalizeNullableString(baseItem?.description_ar) || normalizeNullableString(baseItem?.description_en)
            ),
            image: normalizeImagePathForApi(valueAt(itemImageLines, itemIndex, baseItem?.image)),
            link: normalizeNullableString(valueAt(itemLinkLines, itemIndex, baseItem?.link)),
            extra_en: baseItem?.extra_en ?? null,
            extra_ar: baseItem?.extra_ar ?? null,
            status: toNumericFlag(valueAt(itemStatusLines, itemIndex, baseItem?.status), baseItem?.status ?? 1),
            position: toNumberOrFallback(valueAt(itemPositionLines, itemIndex, baseItem?.position), baseItem?.position || itemIndex + 1),
          };
        }),
      };
    }),
  };
};

const AdminWebsiteBuilderApp = () => {
  const { locale } = useCkamAdmin();
  const activeLocale = locale === 'ar' ? 'ar' : 'en';
  const copy = APP_COPY[activeLocale];
  const [isSavingRemote, setIsSavingRemote] = useState(false);

  const {
    state,
    theme,
    themeConfig,
    selectedPage,
    editorNode,
    selectGlobal,
    updateField,
    updateSectionShow,
    selectTheme,
    updateThemeCustomColor,
    applyRemotePage,
    applyRemoteGlobal,
    save,
  } = useBuilder();

  const saveLabel = state.savedAt
    ? `${copy.savedLabel}: ${new Date(state.savedAt).toLocaleString(activeLocale === 'ar' ? 'ar-BH' : 'en-US')}`
    : copy.notSaved;

  const accentMap = useMemo(() => ({
    default: '#f47e42',
    sand: '#d46a2f',
    ocean: '#1f7a8c',
    forest: '#3f7d37',
    midnight: '#fb923c',
  }), []);

  const accentColor = themeConfig?.custom?.accent || accentMap[theme] || accentMap.default;
  const [liveSync, setLiveSync] = useState(true);
  const previewSurfaceRef = useRef(null);
  const DESKTOP_PREVIEW_WIDTH = 1366;
  const [previewScale, setPreviewScale] = useState(1);
  const [previewViewportHeight, setPreviewViewportHeight] = useState(900);
  const compactMode = false;
  const previewSlug = state.editorTarget.kind === 'global'
    ? 'header-footer'
    : state.editorTarget.kind === 'page'
      ? state.editorTarget.id
      : (selectedPage?.id || 'home');

  const pageBadgeLabel = state.editorTarget.kind === 'global'
    ? copy.headerFooterBadge
    : getLocalizedValue(editorNode?.name, activeLocale, copy.pageBadge);

  const previewUrl = `/website-builder-preview/${previewSlug}?builderMode=1&theme=${encodeURIComponent(theme || 'default')}&compact=${compactMode ? '1' : '0'}&locale=${encodeURIComponent(activeLocale)}&text=${encodeURIComponent(themeConfig?.custom?.text || '')}&bg=${encodeURIComponent(themeConfig?.custom?.bg || '')}&accent=${encodeURIComponent(themeConfig?.custom?.accent || '')}&buttonBg=${encodeURIComponent(themeConfig?.custom?.buttonBg || '')}&buttonText=${encodeURIComponent(themeConfig?.custom?.buttonText || '')}`;

  const stateRef = useRef(state);
  stateRef.current = state;

  const pushStateToPreview = useCallback(() => {
    if (!liveSync) return;
    const frame = document.getElementById('wb-preview-iframe');
    const win = frame?.contentWindow;
    if (!win) return;
    win.postMessage({
      type: 'CKAM_BUILDER_SYNC',
      payload: stateRef.current,
    }, window.location.origin);
  }, [liveSync]);

  useEffect(() => {
    pushStateToPreview();
  }, [state, pushStateToPreview]);

  const onPreviewFrameLoad = useCallback(() => {
    pushStateToPreview();
  }, [pushStateToPreview]);

  const hydratedPageRef = useRef({});
  const hydratedGlobalRef = useRef({});

  useEffect(() => {
    const activePageId = state.editorTarget.kind === 'page'
      ? (selectedPage?.id || '')
      : '';

    if (!activePageId) return undefined;
    if (hydratedPageRef.current[activePageId]) return undefined;

    let cancelled = false;

    const loadPageEditData = async () => {
      try {
        let payload = null;
        try {
          payload = await ckamApi.getSitePageEdit(activePageId);
        } catch {
          payload = await ckamApi.getSitePage(activePageId);
        }
        if (cancelled) return;
        const mappedPage = mapCmsEditPayloadToBuilderPage(payload, activePageId);
        applyRemotePage(mappedPage);
        hydratedPageRef.current[activePageId] = true;
      } catch {
        // keep local fallback form when API fails
      }
    };

    loadPageEditData();

    return () => {
      cancelled = true;
    };
  }, [selectedPage?.id, state.editorTarget.kind, applyRemotePage]);

  useEffect(() => {
    if (state.editorTarget.kind !== 'global') return undefined;

    const activeGlobalId = state.editorTarget.id === 'footer' ? 'footer' : 'header';
    if (hydratedGlobalRef.current[activeGlobalId]) return undefined;

    let cancelled = false;

    const loadGlobalEditData = async () => {
      try {
        const payload = activeGlobalId === 'footer'
          ? await ckamApi.getSiteFooterEdit()
          : await ckamApi.getSiteHeaderEdit();
        if (cancelled) return;
        const mappedGlobal = mapCmsGlobalEditPayloadToBuilderGlobal(payload, activeGlobalId);
        const remoteThemeConfig = mappedGlobal?.remoteThemeConfig;
        const globalNode = { ...(mappedGlobal || {}) };
        delete globalNode.remoteThemeConfig;

        if (remoteThemeConfig?.selectedPreset) {
          selectTheme(remoteThemeConfig.selectedPreset);
        }

        const remoteThemeColors = remoteThemeConfig?.custom || {};
        Object.entries(remoteThemeColors).forEach(([colorKey, colorValue]) => {
          if (!colorKey || !colorValue) return;
          updateThemeCustomColor(colorKey, colorValue);
        });

        applyRemoteGlobal(globalNode);
        hydratedGlobalRef.current[activeGlobalId] = true;
      } catch {
        // keep local fallback form when API fails
      }
    };

    loadGlobalEditData();

    return () => {
      cancelled = true;
    };
  }, [state.editorTarget.kind, state.editorTarget.id, applyRemoteGlobal, selectTheme, updateThemeCustomColor]);

  useEffect(() => {
    const node = previewSurfaceRef.current;
    if (!node) return undefined;

    const updatePreviewMetrics = () => {
      const surfaceWidth = node.clientWidth || DESKTOP_PREVIEW_WIDTH;
      const surfaceHeight = node.clientHeight || 900;
      const scale = Math.min(surfaceWidth / DESKTOP_PREVIEW_WIDTH, 1);
      const safeScale = scale > 0 ? scale : 1;
      setPreviewScale(safeScale);
      setPreviewViewportHeight(Math.max(700, Math.round(surfaceHeight / safeScale)));
    };

    updatePreviewMetrics();
    const observer = new ResizeObserver(updatePreviewMetrics);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const handleSave = useCallback(async () => {
    const snapshot = save();
    const editorKind = snapshot?.editorTarget?.kind;
    const editorId = snapshot?.editorTarget?.id;

    if (editorKind === 'global' && editorId === 'header') {
      const headerNode = snapshot?.globals?.header;
      if (!headerNode) {
        toast.error(activeLocale === 'ar' ? 'لم يتم العثور على بيانات الهيدر.' : 'Header data not found.');
        return;
      }

      const payload = buildSiteHeaderUpdatePayload(headerNode, snapshot?.themeConfig);
      setIsSavingRemote(true);
      try {
        const response = await ckamApi.updateSiteHeader(payload);
        toast.success(
          response?.message
            || (activeLocale === 'ar' ? 'تم حفظ الهيدر والتنقل بنجاح.' : 'Header and navigation saved successfully.')
        );
      } catch (error) {
        toast.error(error?.message || (activeLocale === 'ar' ? 'تعذر حفظ الهيدر.' : 'Failed to save header.'));
      } finally {
        setIsSavingRemote(false);
      }
      return;
    }

    if (editorKind === 'global' && editorId === 'footer') {
      const footerNode = snapshot?.globals?.footer;
      if (!footerNode) {
        toast.error(activeLocale === 'ar' ? 'لم يتم العثور على بيانات الفوتر.' : 'Footer data not found.');
        return;
      }

      const payload = buildSiteFooterUpdatePayload(footerNode, snapshot?.themeConfig);
      setIsSavingRemote(true);
      try {
        const response = await ckamApi.updateSiteFooter(payload);
        toast.success(
          response?.message
            || (activeLocale === 'ar' ? 'تم حفظ الفوتر وروابط التواصل الاجتماعي بنجاح.' : 'Footer and social links saved successfully.')
        );
      } catch (error) {
        toast.error(error?.message || (activeLocale === 'ar' ? 'تعذر حفظ الفوتر.' : 'Failed to save footer.'));
      } finally {
        setIsSavingRemote(false);
      }
      return;
    }

    const isPageTarget = snapshot?.editorTarget?.kind === 'page';
    const pageId = snapshot?.editorTarget?.id;

    if (!isPageTarget) {
      toast.success(activeLocale === 'ar' ? 'تم الحفظ محلياً.' : 'Saved locally.');
      return;
    }

    const activePage = (snapshot?.pages || []).find((page) => page.id === pageId);
    if (!activePage) {
      toast.error(activeLocale === 'ar' ? 'لم يتم العثور على بيانات الصفحة.' : 'Page data not found.');
      return;
    }

    const pageSlug = String(activePage?.cmsPageMeta?.slug || pageId || '').trim();
    if (!pageSlug) {
      toast.error(activeLocale === 'ar' ? 'تعذر تحديد رابط الصفحة للحفظ.' : 'Could not determine page slug for save.');
      return;
    }

    const payload = buildSitePageUpdatePayload(activePage);
    setIsSavingRemote(true);
    try {
      const response = await ckamApi.updateSitePage(pageSlug, payload);
      toast.success(
        response?.message
          || (activeLocale === 'ar' ? 'تم حفظ الصفحة بنجاح.' : 'Page saved successfully.')
      );
    } catch (error) {
      toast.error(error?.message || (activeLocale === 'ar' ? 'تعذر حفظ الصفحة.' : 'Failed to save page.'));
    } finally {
      setIsSavingRemote(false);
    }
  }, [activeLocale, save]);

  return (
    <Container fluid className="px-0 wb-admin-builder" style={{ '--wb-accent': accentColor }}>
      <div className="hk-pg-header pt-7 px-3 px-md-4">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
          <div>
            <h1 className="pg-title mb-1">{copy.pageTitle}</h1>
            <p className="mb-0 text-muted">{copy.pageSubtitle}</p>
          </div>
          <div className="d-flex align-items-center gap-2">
            <Form.Check
              type="switch"
              id="live-sync-switch"
              label={copy.liveUpdates}
              checked={liveSync}
              onChange={(event) => setLiveSync(event.target.checked)}
            />
            <span className="badge badge-soft-secondary">{saveLabel}</span>
            <Button onClick={handleSave} disabled={isSavingRemote}>
              {isSavingRemote ? (activeLocale === 'ar' ? 'جارٍ الحفظ...' : 'Saving...') : copy.save}
            </Button>
          </div>
        </div>
      </div>

      <div className="hk-pg-body px-3 px-md-4 pb-4">
        <Row className="g-3">
          <Col xl={4} lg={5}>
            <Card className="card-border" style={{ height: 'calc(100vh - 100px)' }}>
              <Card.Header className="card-header-action">
                <h6 className="mb-0">{copy.editor}</h6>
              </Card.Header>
              <Card.Body className="wb-form-scroll d-flex flex-column gap-3">
                {state.editorTarget.kind === 'global' ? (
                  <div className="d-flex gap-2">
                    <Button
                      size="sm"
                      variant={state.editorTarget.id === 'header' ? 'primary' : 'outline-primary'}
                      onClick={() => selectGlobal('header')}
                    >
                      {copy.header}
                    </Button>
                    <Button
                      size="sm"
                      variant={state.editorTarget.id === 'footer' ? 'primary' : 'outline-primary'}
                      onClick={() => selectGlobal('footer')}
                    >
                      {copy.footer}
                    </Button>
                  </div>
                ) : null}

                <WebsiteBuilderForm
                  theme={theme}
                  themeConfig={themeConfig}
                  onThemeChange={selectTheme}
                  onCustomColorChange={updateThemeCustomColor}
                  accentColor={accentColor}
                  page={editorNode || null}
                  onFieldChange={updateField}
                  onSectionShowChange={updateSectionShow}
                />
              </Card.Body>
            </Card>
          </Col>

          <Col xl={8} lg={7}>
            <Card className="card-border" style={{ height: 'calc(100vh - 80px)' }}>
              <Card.Header className="card-header-action d-flex justify-content-between align-items-center">
                <h6 className="mb-0">{copy.livePreview}</h6>
                <span className="badge badge-soft-primary">{pageBadgeLabel}</span>
              </Card.Header>
              <Card.Body className="h-100">
                <div className="wb-preview-shell h-100">
                  <div className="wb-preview-browser">
                    <div className="wb-preview-browser-top">
                      <span className="wb-dot wb-dot-red" />
                      <span className="wb-dot wb-dot-yellow" />
                      <span className="wb-dot wb-dot-green" />
                      <span className="wb-preview-label">{copy.publicPagePreview}</span>
                      <span className="wb-preview-live">{copy.live}</span>
                    </div>
                    <div className="wb-preview-frame">
                      <div className="wb-preview-live-surface" ref={previewSurfaceRef}>
                        <div
                          className="wb-preview-fit-stage"
                          style={{
                            width: `${DESKTOP_PREVIEW_WIDTH}px`,
                            height: `${previewViewportHeight}px`,
                            transform: `scale(${previewScale})`,
                          }}
                        >
                          <iframe
                            id="wb-preview-iframe"
                            key={previewUrl}
                            title={`Website preview ${previewSlug}`}
                            src={previewUrl}
                            onLoad={onPreviewFrameLoad}
                            className="wb-preview-live-iframe"
                            style={{
                              width: `${DESKTOP_PREVIEW_WIDTH}px`,
                              height: `${previewViewportHeight}px`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>
    </Container>
  );
};

export default AdminWebsiteBuilderApp;
