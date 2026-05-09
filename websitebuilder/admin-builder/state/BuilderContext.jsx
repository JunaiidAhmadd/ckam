import React, { createContext, useContext, useEffect, useMemo, useReducer, useState } from 'react';
import {
  buildDefaultThemeConfig,
  builderSchema,
  cloneDeep,
} from '../model/schema';
import { normalizeBuilderStateData, normalizePage } from '../model/normalizers';
import { persistBuilderStateToStorage, readBuilderStateFromStorage } from '../model/storage';

const pickFirstSectionId = (node) => node?.sections?.[0]?.id || '';

const buildDefaultState = () => {
  const pages = cloneDeep(builderSchema.pages);
  const globals = cloneDeep(builderSchema.globals);
  const fallbackPageId = pages[0]?.id || 'home';

  return {
    pages,
    globals,
    currentPageId: fallbackPageId,
    editorTarget: { kind: 'page', id: fallbackPageId },
    selectedSectionByTarget: {
      [`page:${fallbackPageId}`]: pickFirstSectionId(pages[0]),
      'global:header': pickFirstSectionId(globals.header),
      'global:footer': pickFirstSectionId(globals.footer),
    },
    themeConfig: buildDefaultThemeConfig(),
    savedAt: null,
  };
};

const isValidPageId = (pages, pageId) => pages.some((page) => page.id === pageId);

const isValidGlobalId = (globals, globalId) => Boolean(globals[globalId]);

const ensureSelectedSectionMap = (state) => {
  const map = { ...(state.selectedSectionByTarget || {}) };

  state.pages.forEach((page) => {
    const key = `page:${page.id}`;
    if (!map[key]) {
      map[key] = pickFirstSectionId(page);
    }
  });

  Object.keys(state.globals || {}).forEach((globalId) => {
    const key = `global:${globalId}`;
    if (!map[key]) {
      map[key] = pickFirstSectionId(state.globals[globalId]);
    }
  });

  return map;
};

const applyRouteSlugSelection = (state, routeSlug) => {
  if (!routeSlug) return state;

  if (routeSlug === 'header-footer' && isValidGlobalId(state.globals, 'header')) {
    return {
      ...state,
      editorTarget: { kind: 'global', id: 'header' },
    };
  }

  if (isValidPageId(state.pages, routeSlug)) {
    return {
      ...state,
      currentPageId: routeSlug,
      editorTarget: { kind: 'page', id: routeSlug },
    };
  }

  return state;
};

const normalizeLoadedState = (loadedState, routeSlug) => {
  const fallback = buildDefaultState();
  const normalized = normalizeBuilderStateData(loadedState);

  const pages = normalized.pages?.length ? normalized.pages : fallback.pages;
  const globals = normalized.globals || fallback.globals;
  const fallbackPageId = pages[0]?.id || fallback.currentPageId;
  const currentPageId = isValidPageId(pages, normalized.currentPageId)
    ? normalized.currentPageId
    : fallbackPageId;

  let editorTarget = normalized.editorTarget;
  if (!editorTarget || typeof editorTarget !== 'object') {
    editorTarget = { kind: 'page', id: currentPageId };
  }

  if (editorTarget.kind === 'page' && !isValidPageId(pages, editorTarget.id)) {
    editorTarget = { kind: 'page', id: currentPageId };
  }

  if (editorTarget.kind === 'global' && !isValidGlobalId(globals, editorTarget.id)) {
    editorTarget = { kind: 'page', id: currentPageId };
  }

  const merged = {
    pages,
    globals,
    currentPageId,
    editorTarget,
    selectedSectionByTarget: {
      ...fallback.selectedSectionByTarget,
      ...(normalized.selectedSectionByTarget || {}),
    },
    themeConfig: normalized.themeConfig || buildDefaultThemeConfig(),
    savedAt: normalized.savedAt || null,
  };

  const withSelectionMap = {
    ...merged,
    selectedSectionByTarget: ensureSelectedSectionMap(merged),
  };

  return applyRouteSlugSelection(withSelectionMap, routeSlug);
};

const updateFields = (sections, sectionId, fieldKey, value) => (
  (sections || []).map((section) => {
    if (section.id !== sectionId) return section;
    return {
      ...section,
      fields: (section.fields || []).map((field) => (
        field.key === fieldKey ? { ...field, value } : field
      )),
    };
  })
);

const updateSectionVisibility = (sections, sectionId, show) => (
  (sections || []).map((section) => (
    section.id === sectionId ? { ...section, show: Boolean(show) } : section
  ))
);

const reducer = (state, action) => {
  if (action.type === 'HYDRATE') {
    return action.state;
  }

  if (action.type === 'SELECT_PAGE') {
    const page = state.pages.find((item) => item.id === action.pageId);
    if (!page) return state;
    const key = `page:${page.id}`;
    return {
      ...state,
      currentPageId: page.id,
      editorTarget: { kind: 'page', id: page.id },
      selectedSectionByTarget: {
        ...state.selectedSectionByTarget,
        [key]: state.selectedSectionByTarget[key] || pickFirstSectionId(page),
      },
    };
  }

  if (action.type === 'SELECT_GLOBAL') {
    const globalNode = state.globals[action.globalId];
    if (!globalNode) return state;
    const key = `global:${action.globalId}`;
    return {
      ...state,
      editorTarget: { kind: 'global', id: action.globalId },
      selectedSectionByTarget: {
        ...state.selectedSectionByTarget,
        [key]: state.selectedSectionByTarget[key] || pickFirstSectionId(globalNode),
      },
    };
  }

  if (action.type === 'UPDATE_FIELD') {
    const { targetKind, targetId, sectionId, fieldKey, value } = action;

    if (targetKind === 'page') {
      return {
        ...state,
        pages: state.pages.map((page) => {
          if (page.id !== targetId) return page;
          return {
            ...page,
            sections: updateFields(page.sections, sectionId, fieldKey, value),
          };
        }),
      };
    }

    if (targetKind === 'global') {
      const globalNode = state.globals[targetId];
      if (!globalNode) return state;

      return {
        ...state,
        globals: {
          ...state.globals,
          [targetId]: {
            ...globalNode,
            sections: updateFields(globalNode.sections, sectionId, fieldKey, value),
          },
        },
      };
    }
  }

  if (action.type === 'UPDATE_SECTION_SHOW') {
    const { targetKind, targetId, sectionId, show } = action;

    if (targetKind === 'page') {
      return {
        ...state,
        pages: state.pages.map((page) => {
          if (page.id !== targetId) return page;
          return {
            ...page,
            sections: updateSectionVisibility(page.sections, sectionId, show),
          };
        }),
      };
    }

    if (targetKind === 'global') {
      const globalNode = state.globals[targetId];
      if (!globalNode) return state;
      return {
        ...state,
        globals: {
          ...state.globals,
          [targetId]: {
            ...globalNode,
            sections: updateSectionVisibility(globalNode.sections, sectionId, show),
          },
        },
      };
    }
  }

  if (action.type === 'SELECT_THEME_PRESET') {
    return {
      ...state,
      themeConfig: {
        ...state.themeConfig,
        selectedPreset: action.theme || 'default',
      },
    };
  }

  if (action.type === 'UPDATE_THEME_CUSTOM_COLOR') {
    if (!action.colorKey) return state;
    return {
      ...state,
      themeConfig: {
        ...state.themeConfig,
        custom: {
          ...state.themeConfig.custom,
          [action.colorKey]: action.value,
        },
      },
    };
  }

  if (action.type === 'SAVE') {
    return {
      ...state,
      savedAt: action.savedAt || new Date().toISOString(),
    };
  }

  if (action.type === 'APPLY_REMOTE_PAGE') {
    const incomingPage = action?.page;
    if (!incomingPage?.id) return state;

    const currentPage = state.pages.find((page) => page.id === incomingPage.id);
    if (!currentPage) return state;

    const fallbackForRemote = {
      ...currentPage,
      sections: [],
    };
    const mergedPage = normalizePage(fallbackForRemote, incomingPage);
    return {
      ...state,
      pages: state.pages.map((page) => (page.id === mergedPage.id ? mergedPage : page)),
    };
  }

  return state;
};

const BuilderContext = createContext(null);

export const BuilderProvider = ({ children, routeSlug }) => {
  const [state, dispatch] = useReducer(reducer, routeSlug, () => buildDefaultState());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const loaded = readBuilderStateFromStorage();
    dispatch({ type: 'HYDRATE', state: normalizeLoadedState(loaded, routeSlug) });
    setHydrated(true);
  }, [routeSlug]);

  useEffect(() => {
    if (!hydrated) return undefined;

    const timeoutId = window.setTimeout(() => {
      persistBuilderStateToStorage(state);
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [state, hydrated]);

  useEffect(() => {
    if (!hydrated || !routeSlug) return;

    if (routeSlug === 'header-footer') {
      dispatch({ type: 'SELECT_GLOBAL', globalId: 'header' });
      return;
    }

    if (state.pages.some((page) => page.id === routeSlug)) {
      dispatch({ type: 'SELECT_PAGE', pageId: routeSlug });
    }
  }, [routeSlug, hydrated]);

  const value = useMemo(() => {
    const selectedPage = state.pages.find((page) => page.id === state.currentPageId) || state.pages[0] || null;
    const editorNode = state.editorTarget.kind === 'page'
      ? state.pages.find((page) => page.id === state.editorTarget.id)
      : state.globals[state.editorTarget.id];

    const updateField = (sectionId, fieldKey, valueToSet) => {
      if (!sectionId || !fieldKey) return;
      dispatch({
        type: 'UPDATE_FIELD',
        targetKind: state.editorTarget.kind,
        targetId: state.editorTarget.id,
        sectionId,
        fieldKey,
        value: valueToSet,
      });
    };

    const updateSectionShow = (sectionId, show) => {
      if (!sectionId) return;
      dispatch({
        type: 'UPDATE_SECTION_SHOW',
        targetKind: state.editorTarget.kind,
        targetId: state.editorTarget.id,
        sectionId,
        show,
      });
    };

    const save = () => {
      const nextSavedAt = new Date().toISOString();
      const snapshot = {
        ...state,
        savedAt: nextSavedAt,
      };
      dispatch({ type: 'SAVE', savedAt: nextSavedAt });
      persistBuilderStateToStorage(snapshot);
      return snapshot;
    };

    return {
      state,
      theme: state.themeConfig.selectedPreset,
      themeConfig: state.themeConfig,
      selectedPage,
      editorNode,
      selectPage: (pageId) => dispatch({ type: 'SELECT_PAGE', pageId }),
      selectGlobal: (globalId) => dispatch({ type: 'SELECT_GLOBAL', globalId }),
      updateField,
      updateElement: updateField,
      updateSectionShow,
      selectTheme: (theme) => dispatch({ type: 'SELECT_THEME_PRESET', theme }),
      updateThemeCustomColor: (colorKey, valueToSet) => dispatch({
        type: 'UPDATE_THEME_CUSTOM_COLOR',
        colorKey,
        value: valueToSet,
      }),
      applyRemotePage: (page) => dispatch({
        type: 'APPLY_REMOTE_PAGE',
        page,
      }),
      save,
    };
  }, [state]);

  return <BuilderContext.Provider value={value}>{children}</BuilderContext.Provider>;
};

export const useBuilder = () => {
  const context = useContext(BuilderContext);
  if (!context) throw new Error('useBuilder must be used within BuilderProvider');
  return context;
};
