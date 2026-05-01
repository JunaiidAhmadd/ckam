import {
  buildDefaultThemeConfig,
  builderSchema,
  cloneDeep,
  isLocalizedValue,
  normalizeFieldValue,
} from './schema';
import { hydrateEmptyFieldsFromLocales } from './localeContentSeeds';

const asArray = (value) => (Array.isArray(value) ? value : []);

const asObject = (value) => (value && typeof value === 'object' && !Array.isArray(value) ? value : null);

const sanitizeFieldDefinition = (field, fallbackKey = 'field') => {
  const safeField = asObject(field) || {};
  const key = String(safeField.key || fallbackKey);
  return {
    key,
    label: safeField.label || key,
    type: safeField.type || 'text',
    helperText: safeField.helperText || '',
    placeholder: safeField.placeholder || '',
    options: asArray(safeField.options),
    localized: Boolean(safeField.localized || isLocalizedValue(safeField.value)),
    repeatable: Boolean(safeField.repeatable),
    value: safeField.value,
  };
};

const normalizeLooseField = (field, index = 0) => {
  const definition = sanitizeFieldDefinition(field, `field-${index + 1}`);
  return {
    ...definition,
    value: normalizeFieldValue(definition, definition.value),
  };
};

const getLegacyVisibility = (section) => {
  const legacyFields = asArray(section?.elements);
  const visibleField = legacyFields.find((item) => item?.key === 'visible');
  if (!visibleField) return null;
  if (typeof visibleField.value === 'boolean') return visibleField.value;
  return null;
};

export const normalizeSection = (defaultSection, rawSection) => {
  const fallbackSection = cloneDeep(defaultSection);
  const source = asObject(rawSection) || {};
  const sourceFields = asArray(source.fields).length > 0 ? asArray(source.fields) : asArray(source.elements);
  const sourceFieldMap = new Map();

  sourceFields.forEach((field, index) => {
    if (!field?.key) return;
    if (sourceFieldMap.has(field.key)) return;
    sourceFieldMap.set(field.key, field);
  });

  const defaultFieldKeys = new Set(fallbackSection.fields.map((field) => field.key));

  const fields = fallbackSection.fields.map((fieldSchema) => {
    const sourceField = sourceFieldMap.get(fieldSchema.key);
    const incomingValue = sourceField && Object.prototype.hasOwnProperty.call(sourceField, 'value')
      ? sourceField.value
      : fieldSchema.value;

    const mergedField = {
      ...fieldSchema,
      ...(asObject(sourceField) || {}),
      key: fieldSchema.key,
      type: (sourceField?.type || fieldSchema.type || 'text'),
      options: asArray(sourceField?.options).length ? asArray(sourceField.options) : asArray(fieldSchema.options),
      localized: Boolean(
        (sourceField?.localized ?? fieldSchema.localized) || isLocalizedValue(incomingValue)
      ),
    };

    return {
      ...mergedField,
      value: normalizeFieldValue(mergedField, incomingValue),
    };
  });

  const extraFields = sourceFields
    .filter((field) => field?.key && !defaultFieldKeys.has(field.key) && field.key !== 'visible')
    .map((field, index) => normalizeLooseField(field, index));

  const show = typeof source.show === 'boolean'
    ? source.show
    : (getLegacyVisibility(source) ?? fallbackSection.show ?? true);

  return {
    ...fallbackSection,
    ...source,
    id: source.id || fallbackSection.id,
    name: source.name || fallbackSection.name,
    show,
    fields: [...fields, ...extraFields],
  };
};

const normalizeAdHocSection = (section, index = 0) => {
  const sectionSource = asObject(section) || {};
  const fieldsSource = asArray(sectionSource.fields).length > 0
    ? asArray(sectionSource.fields)
    : asArray(sectionSource.elements);
  const fallback = {
    id: String(sectionSource.id || `section-${index + 1}`),
    name: sectionSource.name || `Section ${index + 1}`,
    show: true,
    fields: fieldsSource.map((field, fieldIndex) => normalizeLooseField(field, fieldIndex)),
  };

  return normalizeSection(fallback, sectionSource);
};

export const normalizePage = (defaultPage, rawPage) => {
  const fallbackPage = cloneDeep(defaultPage);
  const source = asObject(rawPage) || {};
  const sourceSections = asArray(source.sections);
  const sourceSectionMap = new Map();

  sourceSections.forEach((section) => {
    if (!section?.id || sourceSectionMap.has(section.id)) return;
    sourceSectionMap.set(section.id, section);
  });

  const sectionIds = new Set(fallbackPage.sections.map((section) => section.id));
  const normalizedSections = fallbackPage.sections.map((sectionSchema) => (
    normalizeSection(sectionSchema, sourceSectionMap.get(sectionSchema.id))
  ));
  const extraSections = sourceSections
    .filter((section) => section?.id && !sectionIds.has(section.id))
    .map((section, index) => normalizeAdHocSection(section, index));

  return {
    ...fallbackPage,
    ...source,
    id: source.id || fallbackPage.id,
    name: source.name || fallbackPage.name,
    sections: [...normalizedSections, ...extraSections],
  };
};

export const normalizeGlobalNode = (defaultGlobal, rawGlobal) => {
  const fallbackGlobal = cloneDeep(defaultGlobal);
  const source = asObject(rawGlobal) || {};
  const sourceSections = asArray(source.sections);
  const sourceSectionMap = new Map();

  sourceSections.forEach((section) => {
    if (!section?.id || sourceSectionMap.has(section.id)) return;
    sourceSectionMap.set(section.id, section);
  });

  const sectionIds = new Set(fallbackGlobal.sections.map((section) => section.id));
  const sections = fallbackGlobal.sections.map((sectionSchema) => (
    normalizeSection(sectionSchema, sourceSectionMap.get(sectionSchema.id))
  ));
  const extraSections = sourceSections
    .filter((section) => section?.id && !sectionIds.has(section.id))
    .map((section, index) => normalizeAdHocSection(section, index));

  return {
    ...fallbackGlobal,
    ...source,
    id: source.id || fallbackGlobal.id,
    name: source.name || fallbackGlobal.name,
    sections: [...sections, ...extraSections],
  };
};

const normalizeThemeConfig = (themeConfig) => {
  const defaults = buildDefaultThemeConfig();
  const source = asObject(themeConfig);
  const custom = asObject(source?.custom);
  return {
    selectedPreset: typeof source?.selectedPreset === 'string' ? source.selectedPreset : defaults.selectedPreset,
    custom: {
      ...defaults.custom,
      ...(custom || {}),
    },
  };
};

export const normalizeBuilderStateData = (loadedState) => {
  const source = asObject(loadedState) || {};
  const sourcePages = asArray(source.pages);
  const sourcePageMap = new Map();

  sourcePages.forEach((page) => {
    if (!page?.id || sourcePageMap.has(page.id)) return;
    sourcePageMap.set(page.id, page);
  });

  const defaultPages = cloneDeep(builderSchema.pages);
  const defaultGlobals = cloneDeep(builderSchema.globals);
  const defaultPageIds = new Set(defaultPages.map((page) => page.id));

  const pages = defaultPages.map((pageSchema) => normalizePage(pageSchema, sourcePageMap.get(pageSchema.id)));
  const extraPages = sourcePages
    .filter((page) => page?.id && !defaultPageIds.has(page.id))
    .map((page, index) => {
      const fallback = {
        id: String(page.id || `page-${index + 1}`),
        name: page.name || `Page ${index + 1}`,
        sections: asArray(page.sections).map((section, sectionIndex) => normalizeAdHocSection(section, sectionIndex)),
      };
      return normalizePage(fallback, page);
    });

  const globals = {
    header: normalizeGlobalNode(defaultGlobals.header, source.globals?.header),
    footer: normalizeGlobalNode(defaultGlobals.footer, source.globals?.footer),
  };

  return hydrateEmptyFieldsFromLocales({
    pages: [...pages, ...extraPages],
    globals,
    themeConfig: normalizeThemeConfig(source.themeConfig),
    currentPageId: typeof source.currentPageId === 'string' ? source.currentPageId : '',
    editorTarget: asObject(source.editorTarget) || null,
    selectedSectionByTarget: asObject(source.selectedSectionByTarget) || {},
    savedAt: typeof source.savedAt === 'string' ? source.savedAt : null,
  });
};

