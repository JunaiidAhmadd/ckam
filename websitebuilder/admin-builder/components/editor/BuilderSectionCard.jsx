import React from 'react';
import { Form } from 'react-bootstrap';
import { getLocalizedValue } from '../../model/schema';

const BuilderSectionCard = ({
  section,
  locale = 'en',
  isOpen,
  onToggleOpen,
  onToggleVisibility,
  translationLocale = 'en',
  onTranslationLocaleChange,
  children,
}) => {
  const sectionLabel = getLocalizedValue(section?.name, locale, section?.id || 'Section');
  const sectionIsVisible = section?.show !== false;

  return (
    <div className="wb-section-card">
      <button
        type="button"
        className={`wb-accordion-head wb-section-row ${isOpen ? 'is-open wb-active-row' : ''}`}
        onClick={onToggleOpen}
      >
        <span>{sectionLabel}</span>
        <span className="wb-accordion-chevron"><i className="ri-arrow-down-s-line" aria-hidden="true" /></span>
      </button>

      {isOpen ? (
        <div className="wb-active-section-panel wb-active-section-panel-inline">
          <div className="wb-section-visibility">
            <span className="wb-section-controls-label">{locale === 'ar' ? 'إظهار القسم' : 'Show section'}</span>
            <Form.Check
              type="switch"
              id={`show-${section.id}`}
              checked={sectionIsVisible}
              onChange={(event) => onToggleVisibility?.(event.target.checked)}
            />
          </div>
          <Form.Group className="mt-2">
            <Form.Label className="small mb-1">{locale === 'ar' ? 'لغة الحقول' : 'Field language'}</Form.Label>
            <Form.Select
              size="sm"
              value={translationLocale}
              onChange={(event) => onTranslationLocaleChange?.(event.target.value)}
            >
              <option value="en">{locale === 'ar' ? 'الإنجليزية' : 'English'}</option>
              <option value="ar">{locale === 'ar' ? 'العربية' : 'Arabic'}</option>
            </Form.Select>
          </Form.Group>
          <div className="wb-field-stack mt-2">
            {children}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default BuilderSectionCard;
