import React, { useEffect, useMemo, useState } from 'react';
import { Button, Form } from 'react-bootstrap';

const isObject = (value) => value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof File);

const isImageKey = (key) => /(^|_)(image|image_2|featured_image)$/i.test(String(key || '').trim());

const cloneEmptyFromTemplate = (template) => {
  if (Array.isArray(template)) return [];
  if (template instanceof File) return null;
  if (isObject(template)) {
    return Object.keys(template).reduce((acc, key) => {
      const value = template[key];
      if (Array.isArray(value)) acc[key] = [];
      else if (typeof value === 'number') acc[key] = 0;
      else if (typeof value === 'boolean') acc[key] = false;
      else if (isObject(value)) acc[key] = {};
      else acc[key] = null;
      return acc;
    }, {});
  }
  if (typeof template === 'number') return 0;
  if (typeof template === 'boolean') return false;
  return null;
};

const updateAtPath = (source, path, nextValue) => {
  if (!path.length) return nextValue;

  const [head, ...rest] = path;
  if (Array.isArray(source)) {
    const clone = [...source];
    clone[head] = updateAtPath(source?.[head], rest, nextValue);
    return clone;
  }

  const clone = { ...(source || {}) };
  clone[head] = updateAtPath(source?.[head], rest, nextValue);
  return clone;
};

const removeArrayItemAtPath = (source, path, index) => {
  const target = path.reduce((acc, key) => acc?.[key], source);
  if (!Array.isArray(target)) return source;
  const next = target.filter((_, itemIndex) => itemIndex !== index);
  return updateAtPath(source, path, next);
};

const addArrayItemAtPath = (source, path) => {
  const target = path.reduce((acc, key) => acc?.[key], source);
  if (!Array.isArray(target)) return source;

  const template = target[0];
  const nextItem = cloneEmptyFromTemplate(template);
  return updateAtPath(source, path, [...target, nextItem]);
};

const pathToName = (path) => path
  .map((segment, index) => (typeof segment === 'number' ? `[${segment}]` : (index === 0 ? segment : `.${segment}`)))
  .join('');

const JsonField = ({ value, onCommit, dir = 'ltr' }) => {
  const [text, setText] = useState(() => JSON.stringify(value ?? {}, null, 2));
  const [error, setError] = useState('');

  useEffect(() => {
    setText(JSON.stringify(value ?? {}, null, 2));
    setError('');
  }, [value]);

  return (
    <>
      <Form.Control
        as="textarea"
        rows={4}
        dir={dir}
        value={text}
        onChange={(event) => {
          setText(event.target.value);
          setError('');
        }}
        onBlur={() => {
          const raw = String(text || '').trim();
          if (!raw) {
            onCommit(null);
            setError('');
            return;
          }
          try {
            const parsed = JSON.parse(raw);
            onCommit(parsed);
            setError('');
          } catch {
            setError('Invalid JSON');
          }
        }}
      />
      {error ? <Form.Text className="text-danger">{error}</Form.Text> : null}
    </>
  );
};

const ImageField = ({ value, onChange, dir = 'ltr' }) => {
  const previewUrl = useMemo(() => {
    if (!value) return '';
    if (value instanceof File) return URL.createObjectURL(value);
    return String(value || '');
  }, [value]);

  useEffect(() => {
    if (!(value instanceof File) || !previewUrl) return undefined;
    return () => URL.revokeObjectURL(previewUrl);
  }, [value, previewUrl]);

  return (
    <div className="d-flex flex-column gap-2">
      <Form.Control
        type="text"
        dir={dir}
        value={typeof value === 'string' ? value : ''}
        placeholder="Image path or URL"
        onChange={(event) => onChange(event.target.value)}
      />
      <Form.Control
        type="file"
        accept="image/*"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onChange(file);
        }}
      />
      {previewUrl ? (
        <img
          src={previewUrl}
          alt="Preview"
          style={{ maxHeight: 140, width: '100%', objectFit: 'contain', border: '1px solid #e4e7ec', borderRadius: 8 }}
        />
      ) : null}
    </div>
  );
};

const ScalarField = ({ fieldKey, value, name, dir = 'ltr', onChange }) => {
  if (isImageKey(fieldKey)) {
    return <ImageField value={value} onChange={onChange} dir={dir} />;
  }

  if (typeof value === 'boolean') {
    return (
      <Form.Check
        type="switch"
        id={name}
        checked={Boolean(value)}
        onChange={(event) => onChange(event.target.checked)}
      />
    );
  }

  if (typeof value === 'number') {
    return (
      <Form.Control
        type="number"
        dir={dir}
        value={Number.isFinite(value) ? value : 0}
        onChange={(event) => {
          const raw = event.target.value;
          onChange(raw === '' ? 0 : Number(raw));
        }}
      />
    );
  }

  if (isObject(value)) {
    return <JsonField value={value} onCommit={onChange} dir={dir} />;
  }

  return (
    <Form.Control
      type="text"
      dir={dir}
      value={value === null || value === undefined ? '' : String(value)}
      onChange={(event) => onChange(event.target.value)}
    />
  );
};

const ItemFields = ({ item, sectionIndex, itemIndex, localeDir, onChange, onRemove }) => {
  const keys = Object.keys(item || {});
  return (
    <div className="border rounded-2 p-2 mb-2">
      <div className="d-flex align-items-center justify-content-between mb-2">
        <strong className="small">items[{itemIndex}]</strong>
        <Button size="sm" variant="outline-danger" onClick={onRemove}>Remove</Button>
      </div>
      <div className="d-flex flex-column gap-2">
        {keys.map((key) => {
          const name = pathToName(['sections', sectionIndex, 'items', itemIndex, key]);
          return (
            <Form.Group key={name}>
              <Form.Label className="small mb-1">{name}</Form.Label>
              <ScalarField
                fieldKey={key}
                value={item?.[key]}
                name={name}
                dir={localeDir}
                onChange={(next) => onChange(['sections', sectionIndex, 'items', itemIndex, key], next)}
              />
            </Form.Group>
          );
        })}
      </div>
    </div>
  );
};

const SectionFields = ({ section, sectionIndex, localeDir, onChange, onAddItem, onRemoveItem }) => {
  const keys = Object.keys(section || {}).filter((key) => key !== 'items');
  const items = Array.isArray(section?.items) ? section.items : [];

  return (
    <div className="border rounded-2 p-3 mb-3">
      <h6 className="mb-3">sections[{sectionIndex}]</h6>

      <div className="d-flex flex-column gap-2 mb-3">
        {keys.map((key) => {
          const name = pathToName(['sections', sectionIndex, key]);
          return (
            <Form.Group key={name}>
              <Form.Label className="small mb-1">{name}</Form.Label>
              <ScalarField
                fieldKey={key}
                value={section?.[key]}
                name={name}
                dir={localeDir}
                onChange={(next) => onChange(['sections', sectionIndex, key], next)}
              />
            </Form.Group>
          );
        })}
      </div>

      <div className="d-flex align-items-center justify-content-between mb-2">
        <strong className="small">{pathToName(['sections', sectionIndex, 'items'])}</strong>
        <Button size="sm" variant="outline-primary" onClick={() => onAddItem(sectionIndex)}>Add Item</Button>
      </div>

      {items.map((item, itemIndex) => (
        <ItemFields
          key={`section-${sectionIndex}-item-${itemIndex}`}
          item={item}
          sectionIndex={sectionIndex}
          itemIndex={itemIndex}
          localeDir={localeDir}
          onChange={onChange}
          onRemove={() => onRemoveItem(sectionIndex, itemIndex)}
        />
      ))}
    </div>
  );
};

const DynamicCmsForm = ({ value, locale = 'en', onChange }) => {
  const localeDir = locale === 'ar' ? 'rtl' : 'ltr';
  const sections = Array.isArray(value?.sections) ? value.sections : [];
  const topLevelKeys = Object.keys(value || {}).filter((key) => key !== 'sections');

  if (!value || !isObject(value)) {
    return <p className="text-muted mb-0">No CMS data loaded.</p>;
  }

  const updatePath = (path, nextValue) => {
    const nextState = updateAtPath(value, path, nextValue);
    onChange(nextState);
  };

  const addItem = (sectionIndex) => {
    onChange(addArrayItemAtPath(value, ['sections', sectionIndex, 'items']));
  };

  const removeItem = (sectionIndex, itemIndex) => {
    onChange(removeArrayItemAtPath(value, ['sections', sectionIndex, 'items'], itemIndex));
  };

  return (
    <div className="d-flex flex-column gap-3">
      <div className="border rounded-2 p-3">
        <h6 className="mb-3">data</h6>
        <div className="d-flex flex-column gap-2">
          {topLevelKeys.map((key) => {
            const name = pathToName([key]);
            return (
              <Form.Group key={name}>
                <Form.Label className="small mb-1">{name}</Form.Label>
                <ScalarField
                  fieldKey={key}
                  value={value?.[key]}
                  name={name}
                  dir={localeDir}
                  onChange={(next) => updatePath([key], next)}
                />
              </Form.Group>
            );
          })}
        </div>
      </div>

      <div>
        <h6 className="mb-2">sections</h6>
        {sections.map((section, sectionIndex) => (
          <SectionFields
            key={`section-${sectionIndex}`}
            section={section}
            sectionIndex={sectionIndex}
            localeDir={localeDir}
            onChange={updatePath}
            onAddItem={addItem}
            onRemoveItem={removeItem}
          />
        ))}
      </div>
    </div>
  );
};

export default DynamicCmsForm;
