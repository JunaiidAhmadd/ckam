import React, { useEffect, useMemo, useState } from 'react';
import { Form } from 'react-bootstrap';
import { useCkamAdmin } from '../../../src/views/CkamAdmin/context';
import { normalizeTranslationLocale } from '../../../src/views/CkamAdmin/shared';
import {
  THEME_PRESET_OPTIONS,
  THEME_PRESET_SWATCHES,
  getLocalizedValue,
} from '../model/schema';
import { getPreviewBoundFieldKeys } from '../model/previewBoundFields';
import BuilderFieldRenderer from './editor/BuilderFieldRenderer.jsx';
import BuilderSectionCard from './editor/BuilderSectionCard.jsx';
import './websiteBuilderForm.css';

const withAlpha = (hex, alpha) => {
  if (!hex || typeof hex !== 'string') return `rgba(244,126,66,${alpha})`;
  let raw = hex.replace('#', '').trim();
  if (raw.length === 3) raw = raw.split('').map((x) => `${x}${x}`).join('');
  if (!/^[0-9a-fA-F]{6}$/.test(raw)) return `rgba(244,126,66,${alpha})`;
  const value = Number.parseInt(raw, 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const UI_COPY = {
  en: {
    theme: 'Theme',
    themePreset: 'Theme preset',
    customPalette: 'Custom palette',
    textColor: 'Text color',
    backgroundColor: 'Background color',
    accentColor: 'Accent color',
    buttonColor: 'Button color',
    buttonText: 'Button text',
    previewOnlyNote: 'No fields in this section are wired to the live preview. You can still show or hide the section.',
  },
  ar: {
    theme: 'السمة',
    themePreset: 'قالب السمة',
    customPalette: 'لوحة ألوان مخصصة',
    textColor: 'لون النص',
    backgroundColor: 'لون الخلفية',
    accentColor: 'لون التمييز',
    buttonColor: 'لون الزر',
    buttonText: 'لون نص الزر',
    previewOnlyNote: 'لا توجد حقول في هذا القسم مربوطة بالمعاينة المباشرة. يمكنك إظهار القسم أو إخفائه.',
  },
};

const renderPaletteField = (label, colorKey, value, onCustomColorChange) => (
  <Form.Group key={`palette-${colorKey}`}>
    <Form.Label className="fw-medium mb-1">{label}</Form.Label>
    <div className="d-flex align-items-center gap-2">
      <Form.Control
        type="color"
        value={value || '#000000'}
        onChange={(event) => onCustomColorChange?.(colorKey, event.target.value)}
        style={{ width: 56, minWidth: 56 }}
      />
      <Form.Control
        type="text"
        value={value || ''}
        onChange={(event) => onCustomColorChange?.(colorKey, event.target.value)}
        placeholder="#ffffff"
      />
    </div>
  </Form.Group>
);

const WebsiteBuilderForm = ({
  theme,
  themeConfig,
  onThemeChange,
  onCustomColorChange,
  accentColor = '#f47e42',
  page,
  onFieldChange,
  onSectionShowChange,
}) => {
  const { locale } = useCkamAdmin();
  const activeLocale = locale === 'ar' ? 'ar' : 'en';
  const copy = UI_COPY[activeLocale];
  const sections = page?.sections || [];
  const customPalette = themeConfig?.custom || {};
  const selectedPreset = themeConfig?.selectedPreset || theme || 'default';

  const [themeOpen, setThemeOpen] = useState(false);
  const [openSectionIds, setOpenSectionIds] = useState([]);
  const [translationLocale, setTranslationLocale] = useState(activeLocale);

  const sectionSignature = useMemo(
    () => sections.map((section) => section.id).join('|'),
    [sections]
  );

  useEffect(() => {
    if (!sections.length) {
      setOpenSectionIds([]);
      return;
    }
    setOpenSectionIds((previous) => {
      const activeId = previous.find((id) => sections.some((section) => section.id === id));
      if (activeId) return [activeId];
      return [sections[0].id];
    });
  }, [sectionSignature]);

  useEffect(() => {
    setTranslationLocale(normalizeTranslationLocale(activeLocale));
  }, [activeLocale]);

  return (
    <div className="wb-form-root">
      <div className="wb-accordion-shell">
        <button
          type="button"
          className={`wb-accordion-head ${themeOpen ? 'is-open' : ''}`}
          onClick={() => setThemeOpen((previous) => !previous)}
        >
          <span>{copy.theme}</span>
          <span className="wb-accordion-chevron"><i className="ri-arrow-down-s-line" aria-hidden="true" /></span>
        </button>

        {themeOpen ? (
          <div className="wb-accordion-body">
            <Form.Group>
              <Form.Label className="fw-semibold mb-1">{copy.themePreset}</Form.Label>
              <Form.Select value={selectedPreset} onChange={(event) => onThemeChange?.(event.target.value)}>
                {THEME_PRESET_OPTIONS.map((option) => (
                  <option key={`theme-${option.value}`} value={option.value}>
                    {getLocalizedValue(option.label, activeLocale, option.value)}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <div className="wb-theme-sessions mt-3">
              {THEME_PRESET_OPTIONS.map((preset) => {
                const active = preset.value === selectedPreset;
                const swatches = THEME_PRESET_SWATCHES[preset.value] || [];
                return (
                  <button
                    key={`preset-${preset.value}`}
                    type="button"
                    className="wb-theme-session border rounded-2 px-2 py-2 d-flex flex-column align-items-start"
                    onClick={() => onThemeChange?.(preset.value)}
                    style={{
                      background: active ? withAlpha(accentColor, 0.16) : '#fff',
                      borderColor: active ? accentColor : '#dbe3ef',
                    }}
                  >
                    <span className="fw-semibold small mb-1">{getLocalizedValue(preset.label, activeLocale, preset.value)}</span>
                    <span className="d-flex gap-1">
                      {swatches.map((swatch) => (
                        <span
                          key={`${preset.value}-${swatch}`}
                          style={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            display: 'inline-block',
                            background: swatch,
                            border: '1px solid rgba(15, 23, 42, 0.2)',
                          }}
                        />
                      ))}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="border rounded-2 p-3 wb-custom-palette mt-3">
              <div className="fw-semibold small mb-2 text-uppercase text-muted">{copy.customPalette}</div>
              <div className="wb-custom-grid">
                {renderPaletteField(copy.textColor, 'text', customPalette.text, onCustomColorChange)}
                {renderPaletteField(copy.backgroundColor, 'bg', customPalette.bg, onCustomColorChange)}
                {renderPaletteField(copy.accentColor, 'accent', customPalette.accent, onCustomColorChange)}
                {renderPaletteField(copy.buttonColor, 'buttonBg', customPalette.buttonBg, onCustomColorChange)}
                {renderPaletteField(copy.buttonText, 'buttonText', customPalette.buttonText, onCustomColorChange)}
              </div>
            </div>
          </div>
        ) : null}

        {sections.map((section) => {
          const isOpen = openSectionIds.includes(section.id);
          return (
            <BuilderSectionCard
              key={section.id}
              section={section}
              locale={activeLocale}
              isOpen={isOpen}
              onToggleOpen={() => {
                setOpenSectionIds((previous) => (
                  previous.includes(section.id)
                    ? []
                    : [section.id]
                ));
              }}
              onToggleVisibility={(show) => onSectionShowChange?.(section.id, show)}
              translationLocale={translationLocale}
              onTranslationLocaleChange={setTranslationLocale}
            >
              {(() => {
                const sourceFields = section.fields || [];
                const sectionAllowedFieldKeys = Array.isArray(section?.allowedFieldKeys)
                  ? section.allowedFieldKeys
                  : null;
                const previewKeys = getPreviewBoundFieldKeys(page?.id, section.id);
                const visibleFields = sectionAllowedFieldKeys
                  ? sourceFields.filter((field) => sectionAllowedFieldKeys.includes(field.key))
                  : (previewKeys == null ? sourceFields : sourceFields.filter((field) => previewKeys.includes(field.key)));

                if (visibleFields.length === 0 && previewKeys?.length === 0) {
                  return (
                    <p className="text-muted small mb-0">{copy.previewOnlyNote}</p>
                  );
                }

                return visibleFields.map((field) => {
                  const label = getLocalizedValue(field.label, activeLocale, field.key);
                  const helperText = getLocalizedValue(field.helperText, activeLocale, '');

                  return (
                    <Form.Group key={`${section.id}-${field.key}`}>
                      <Form.Label className={`fw-medium mb-1 ${activeLocale === 'ar' ? 'text-end d-block' : 'text-start d-block'}`}>
                        {label}
                      </Form.Label>
                      <BuilderFieldRenderer
                        field={field}
                        locale={translationLocale}
                        uiLocale={activeLocale}
                        onChange={(nextValue) => onFieldChange?.(section.id, field.key, nextValue)}
                      />
                      {helperText ? <Form.Text className="text-muted">{helperText}</Form.Text> : null}
                    </Form.Group>
                  );
                });
              })()}
            </BuilderSectionCard>
          );
        })}
      </div>
    </div>
  );
};

export default WebsiteBuilderForm;
