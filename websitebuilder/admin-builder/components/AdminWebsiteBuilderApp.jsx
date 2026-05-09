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
  const data = payload?.data || {};
  const sections = Array.isArray(data?.sections) ? data.sections : [];

  return {
    id: String(data?.slug || fallbackPageId || 'home'),
    name: toLocalized(data?.title_en || 'Page', data?.title_ar || data?.title_en || 'Page'),
    sections: sections.map((section, sectionIndex) => mapCmsSectionToBuilderSection(section, sectionIndex)),
    cmsPageMeta: {
      id: data?.id ?? null,
      slug: String(data?.slug || fallbackPageId || 'home'),
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

  return raw.replace(/^\/+/, '');
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

const buildHomePageUpdatePayload = (pageNode) => {
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

  useEffect(() => {
    const activePageId = state.editorTarget.kind === 'page'
      ? (selectedPage?.id || '')
      : '';

    if (!activePageId) return undefined;
    if (hydratedPageRef.current[activePageId]) return undefined;

    let cancelled = false;

    const loadPageEditData = async () => {
      try {
        const payload = await ckamApi.getSitePageEdit(activePageId);
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
    const isPageTarget = snapshot?.editorTarget?.kind === 'page';
    const pageId = snapshot?.editorTarget?.id;

    if (!isPageTarget || pageId !== 'home') {
      toast.success(activeLocale === 'ar' ? 'تم الحفظ محلياً.' : 'Saved locally.');
      return;
    }

    const activePage = (snapshot?.pages || []).find((page) => page.id === pageId);
    if (!activePage) {
      toast.error(activeLocale === 'ar' ? 'لم يتم العثور على بيانات الصفحة.' : 'Page data not found.');
      return;
    }

    const payload = buildHomePageUpdatePayload(activePage);
    setIsSavingRemote(true);
    try {
      const response = await ckamApi.updateSitePage('home', payload);
      toast.success(
        response?.message
          || (activeLocale === 'ar' ? 'تم حفظ صفحة الرئيسية بنجاح.' : 'Home page saved successfully.')
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
