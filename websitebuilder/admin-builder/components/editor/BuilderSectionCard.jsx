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
        <div
          className="wb-active-section-panel wb-active-section-panel-inline"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="wb-section-visibility">
            <span className="wb-section-controls-label">{locale === 'ar' ? '\u0625\u0638\u0647\u0627\u0631 \u0627\u0644\u0642\u0633\u0645' : 'Show section'}</span>
            <Form.Check
              type="switch"
              id={`show-${section.id}`}
              checked={sectionIsVisible}
              onChange={(event) => onToggleVisibility?.(event.target.checked)}
            />
          </div>
          <Form.Group className="mt-2">
            <Form.Label className="small mb-1">{locale === 'ar' ? '\u0644\u063a\u0629 \u0627\u0644\u062d\u0642\u0648\u0644' : 'Field language'}</Form.Label>
            <Form.Select
              size="sm"
              value={translationLocale}
              onChange={(event) => onTranslationLocaleChange?.(event.target.value)}
            >
              <option value="en">{locale === 'ar' ? '\u0627\u0644\u0625\u0646\u062c\u0644\u064a\u0632\u064a\u0629' : 'English'}</option>
              <option value="ar">{locale === 'ar' ? '\u0627\u0644\u0639\u0631\u0628\u064a\u0629' : 'Arabic'}</option>
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

