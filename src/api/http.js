import { API_ENDPOINTS, buildApiUrl } from './endpoints';

export const resolveApiAssetUrl = (value) => {
    if (!value || typeof value !== 'string') {
        return '';
    }

    if (/^https?:\/\//i.test(value)) {
        return value;
    }

    return buildApiUrl(`${API_ENDPOINTS.media.assetBase}/${String(value).replace(/^\/+/, '')}`);
};
