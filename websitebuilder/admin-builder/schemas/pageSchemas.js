export {
  builderSchema,
  THEME_PRESET_OPTIONS,
  THEME_PRESET_SWATCHES,
  buildDefaultThemeConfig,
  cloneDeep,
  STORAGE_VERSION,
  LEGACY_BUILDER_STORAGE_KEY,
  BUILDER_META_STORAGE_KEY,
  BUILDER_THEME_STORAGE_KEY,
  getPageStorageKey,
  getGlobalStorageKey,
  getAllBuilderStorageKeys,
  isLocalizedValue,
  getLocalizedValue,
  ensureLocalizedValue,
  normalizeFieldValue,
  createField,
} from '../model/schema';

// Backward compatibility alias for older imports.
export { LEGACY_BUILDER_STORAGE_KEY as BUILDER_STORAGE_KEY } from '../model/schema';
