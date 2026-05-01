import {
  BUILDER_META_STORAGE_KEY,
  BUILDER_THEME_STORAGE_KEY,
  LEGACY_BUILDER_STORAGE_KEY,
  builderSchema,
  getAllBuilderStorageKeys,
  getGlobalStorageKey,
  getPageStorageKey,
} from './schema';
import { normalizeBuilderStateData } from './normalizers';

const SCOPED_PREFIX = 'page_editor_';

const safeParse = (raw) => {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const hasStoredValue = (key) => {
  try {
    return localStorage.getItem(key) !== null;
  } catch {
    return false;
  }
};

const readEntry = (key) => {
  try {
    return safeParse(localStorage.getItem(key));
  } catch {
    return null;
  }
};

const readScopedSnapshot = () => {
  const pages = builderSchema.pages
    .map((page) => readEntry(getPageStorageKey(page.id)))
    .filter(Boolean);
  const globals = {
    header: readEntry(getGlobalStorageKey('header')),
    footer: readEntry(getGlobalStorageKey('footer')),
  };
  const themeConfig = readEntry(BUILDER_THEME_STORAGE_KEY);
  const meta = readEntry(BUILDER_META_STORAGE_KEY);

  return {
    pages,
    globals,
    themeConfig,
    ...(meta && typeof meta === 'object' ? meta : {}),
  };
};

const hasScopedSnapshot = () => {
  const pageKeys = builderSchema.pages.map((page) => getPageStorageKey(page.id));
  const globalKeys = ['header', 'footer'].map((globalId) => getGlobalStorageKey(globalId));
  const keys = [...pageKeys, ...globalKeys, BUILDER_THEME_STORAGE_KEY, BUILDER_META_STORAGE_KEY];
  return keys.some((key) => hasStoredValue(key));
};

export const readBuilderStateFromStorage = () => {
  if (typeof window === 'undefined') {
    return normalizeBuilderStateData(null);
  }

  const scopedExists = hasScopedSnapshot();
  if (scopedExists) {
    return normalizeBuilderStateData(readScopedSnapshot());
  }

  const legacy = readEntry(LEGACY_BUILDER_STORAGE_KEY);
  return normalizeBuilderStateData(legacy);
};

export const persistBuilderStateToStorage = (state) => {
  if (typeof window === 'undefined' || !state) return;

  try {
    (state.pages || []).forEach((page) => {
      if (!page?.id) return;
      localStorage.setItem(getPageStorageKey(page.id), JSON.stringify(page));
    });

    Object.entries(state.globals || {}).forEach(([globalId, globalNode]) => {
      if (!globalId || !globalNode) return;
      localStorage.setItem(getGlobalStorageKey(globalId), JSON.stringify(globalNode));
    });

    localStorage.setItem(BUILDER_THEME_STORAGE_KEY, JSON.stringify(state.themeConfig || {}));
    localStorage.setItem(BUILDER_META_STORAGE_KEY, JSON.stringify({
      currentPageId: state.currentPageId || '',
      editorTarget: state.editorTarget || null,
      selectedSectionByTarget: state.selectedSectionByTarget || {},
      savedAt: state.savedAt || null,
    }));

    // Keep a compatibility snapshot for older readers until all consumers migrate.
    localStorage.setItem(LEGACY_BUILDER_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore storage quota/private mode errors
  }
};

export const isBuilderStorageKey = (key) => {
  if (!key || typeof key !== 'string') return false;
  if (key.startsWith(SCOPED_PREFIX)) return true;
  return getAllBuilderStorageKeys().includes(key);
};

