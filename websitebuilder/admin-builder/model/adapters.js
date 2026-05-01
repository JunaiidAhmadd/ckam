import { normalizeBuilderStateData } from './normalizers';

/**
 * Placeholder adapter for future API integration.
 * Convert backend payload -> builder model shape.
 */
export const buildModelFromApi = (data) => normalizeBuilderStateData(data);

/**
 * Placeholder adapter for future API integration.
 * Convert builder model shape -> backend payload.
 */
export const buildPayloadFromModel = (model) => ({
  pages: model?.pages || [],
  globals: model?.globals || {},
  themeConfig: model?.themeConfig || {},
});

