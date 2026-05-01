import React from 'react';
import { Form } from 'react-bootstrap';
import { ensureLocalizedValue, getLocalizedValue, isLocalizedValue } from '../../model/schema';

const normalizeList = (value) => {
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

const listToText = (value) => normalizeList(value).join('\n');

const getFieldValueForLocale = (field, locale) => {
  if (!field.localized) return field.value;

  const localizedValue = ensureLocalizedValue(field.value, '');
  if (field.type === 'list') {
    return normalizeList(localizedValue[locale]);
  }

  return String(localizedValue[locale] ?? '');
};

const updateLocalizedField = (field, locale, nextValue, onChange) => {
  if (!field.localized) {
    onChange(nextValue);
    return;
  }

  const current = ensureLocalizedValue(field.value, '');
  onChange({
    ...current,
    [locale]: nextValue,
  });
};

const renderOptions = (field, uiLocale) => (
  (field.options || []).map((option) => {
    const optionValue = option?.value ?? '';
    const optionLabel = getLocalizedValue(option?.label, uiLocale, String(optionValue));
    return (
      <option key={`${field.key}-${String(optionValue)}`} value={optionValue}>
        {optionLabel}
      </option>
    );
  })
);

const BuilderFieldRenderer = ({
  field,
  locale = 'en',
  uiLocale = 'en',
  onChange,
}) => {
  const isArabicInput = locale === 'ar';
  const inputDir = isArabicInput ? 'rtl' : 'ltr';
  const activeValue = getFieldValueForLocale(field, locale);
  const placeholder = getLocalizedValue(field.placeholder, uiLocale, '');

  if (field.type === 'toggle' || field.type === 'boolean' || field.type === 'checkbox') {
    const checked = Boolean(field.value);
    return (
      <Form.Check
        type="switch"
        id={`${field.key}-switch`}
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
    );
  }

  if (field.type === 'textarea') {
    return (
      <Form.Control
        as="textarea"
        rows={4}
        value={field.localized ? activeValue : (field.value ?? '')}
        dir={field.localized ? inputDir : undefined}
        placeholder={placeholder}
        onChange={(event) => updateLocalizedField(field, locale, event.target.value, onChange)}
      />
    );
  }

  if (field.type === 'number') {
    return (
      <Form.Control
        type="number"
        value={Number.isFinite(Number(field.value)) ? Number(field.value) : ''}
        onChange={(event) => {
          const next = event.target.value;
          onChange(next === '' ? '' : Number(next));
        }}
      />
    );
  }

  if (field.type === 'select') {
    return (
      <Form.Select
        value={field.value ?? ''}
        onChange={(event) => onChange(event.target.value)}
      >
        {renderOptions(field, uiLocale)}
      </Form.Select>
    );
  }

  if (field.type === 'radio') {
    return (
      <div className="d-flex flex-wrap gap-3">
        {(field.options || []).map((option) => {
          const optionValue = option?.value ?? '';
          const optionLabel = getLocalizedValue(option?.label, uiLocale, String(optionValue));
          return (
            <Form.Check
              key={`${field.key}-${String(optionValue)}`}
              type="radio"
              name={field.key}
              id={`${field.key}-${String(optionValue)}`}
              value={optionValue}
              checked={String(field.value) === String(optionValue)}
              label={optionLabel}
              onChange={(event) => onChange(event.target.value)}
            />
          );
        })}
      </div>
    );
  }

  if (field.type === 'list') {
    const isLocalizedList = Boolean(field.localized);
    const renderedValue = isLocalizedList ? listToText(activeValue) : listToText(field.value);
    return (
      <Form.Control
        as="textarea"
        rows={4}
        value={renderedValue}
        dir={isLocalizedList ? inputDir : undefined}
        placeholder={placeholder}
        onChange={(event) => {
          const nextList = normalizeList(event.target.value);
          updateLocalizedField(field, locale, nextList, onChange);
        }}
      />
    );
  }

  if (field.type === 'image') {
    const imageValue = field.localized
      ? getLocalizedValue(field.value, locale, '')
      : String(field.value || '');

    const handleImageValue = (nextValue) => {
      if (field.localized || isLocalizedValue(field.value)) {
        updateLocalizedField(field, locale, nextValue, onChange);
        return;
      }
      onChange(nextValue);
    };

    return (
      <div className="d-flex flex-column gap-2">
        <Form.Control
          type="url"
          value={imageValue}
          placeholder={placeholder || 'https://example.com/image.jpg'}
          onChange={(event) => handleImageValue(event.target.value)}
        />
        <Form.Control
          type="file"
          accept="image/*"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => handleImageValue(String(reader.result || ''));
            reader.readAsDataURL(file);
          }}
        />
        {imageValue ? (
          <div style={{ border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
            <img
              src={imageValue}
              alt={getLocalizedValue(field.label, uiLocale, field.key)}
              style={{ width: '100%', maxHeight: 170, objectFit: 'cover' }}
            />
          </div>
        ) : null}
      </div>
    );
  }

  const inputType = field.type === 'url' ? 'url' : 'text';
  const value = field.localized ? activeValue : (field.value ?? '');

  return (
    <Form.Control
      type={inputType}
      value={value}
      dir={field.localized ? inputDir : undefined}
      placeholder={placeholder}
      onChange={(event) => updateLocalizedField(field, locale, event.target.value, onChange)}
    />
  );
};

export default BuilderFieldRenderer;

