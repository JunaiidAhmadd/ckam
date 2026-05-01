import { useMemo } from 'react';
import { useCkamAdmin } from '../context';

const EN_TRANSLATIONS = {
    'common.add': 'Add',
    'common.save': 'Save',
    'common.saved': 'Saved successfully',
    'common.delete': 'Delete',
    'common.loading': 'Loading...',
    'photographer.public_page.title': 'Public Page Builder',
    'photographer.public_page.subtitle': 'Manage your public site sections, options, and live preview.',
    'photographer.public_page.editor.title': 'Editor',
    'photographer.public_page.editor.subtitle': 'Configure section visibility and content.',
    'photographer.public_page.preview.title': 'Live Preview',
    'photographer.public_page.legal.title': 'Legal Pages',
    'photographer.public_page.legal.subtitle': 'Manage Privacy Policy and Terms content.',
    'photographer.public_page.common.show': 'Show',
    'photographer.public_page.common.hide': 'Hide',
    'photographer.public_page.common.remove': 'Remove',
    'photographer.public_page.common.uploaded': 'Uploaded',
    'photographer.public_page.common.page_active': 'Page Active',
    'photographer.public_page.common.page_inactive': 'Page Inactive',
    'photographer.public_page.editor.sections.theme': 'Theme',
    'photographer.public_page.editor.sections.banner1': 'Hero Banner',
    'photographer.public_page.editor.sections.photos': 'Photo Strip',
    'photographer.public_page.editor.sections.services': 'Services',
    'photographer.public_page.editor.sections.about': 'About',
    'photographer.public_page.editor.sections.booking': 'Booking',
    'photographer.public_page.editor.sections.reviews': 'Reviews',
};

const AR_TRANSLATIONS = {
    'common.add': 'إضافة',
    'common.save': 'حفظ',
    'common.saved': 'تم الحفظ',
    'common.delete': 'حذف',
    'common.loading': 'جار التحميل...',
    'photographer.public_page.title': 'منشئ الصفحة العامة',
    'photographer.public_page.subtitle': 'إدارة أقسام الصفحة العامة والخيارات والمعاينة المباشرة.',
    'photographer.public_page.editor.title': 'المحرر',
    'photographer.public_page.editor.subtitle': 'تحكم في ظهور الأقسام ومحتواها.',
    'photographer.public_page.preview.title': 'المعاينة المباشرة',
    'photographer.public_page.legal.title': 'الصفحات القانونية',
    'photographer.public_page.legal.subtitle': 'إدارة محتوى سياسة الخصوصية والشروط.',
    'photographer.public_page.common.show': 'إظهار',
    'photographer.public_page.common.hide': 'إخفاء',
    'photographer.public_page.common.remove': 'حذف',
    'photographer.public_page.common.uploaded': 'تم الرفع',
    'photographer.public_page.common.page_active': 'الصفحة مفعلة',
    'photographer.public_page.common.page_inactive': 'الصفحة غير مفعلة',
    'photographer.public_page.editor.sections.theme': 'الثيم',
    'photographer.public_page.editor.sections.banner1': 'البانر الرئيسي',
    'photographer.public_page.editor.sections.photos': 'شريط الصور',
    'photographer.public_page.editor.sections.services': 'الخدمات',
    'photographer.public_page.editor.sections.about': 'من نحن',
    'photographer.public_page.editor.sections.booking': 'الحجز',
    'photographer.public_page.editor.sections.reviews': 'التقييمات',
};

const applyTemplateVars = (text, vars) => {
    if (!vars || typeof vars !== 'object') {
        return text;
    }

    return Object.entries(vars).reduce(
        (result, [key, value]) => result.replaceAll(`{${key}}`, String(value)),
        text
    );
};

const prettifyKey = (key) => {
    const lastSegment = String(key || '').split('.').filter(Boolean).pop() || key;
    const normalized = String(lastSegment || '')
        .replace(/_/g, ' ')
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/(\d+)/g, ' $1')
        .trim();

    if (!normalized) {
        return '';
    }

    return normalized
        .split(/\s+/)
        .map((word) => {
            const lower = word.toLowerCase();
            if (lower === 'cta') return 'CTA';
            if (lower === 'id') return 'ID';
            return `${word.charAt(0).toUpperCase()}${word.slice(1)}`;
        })
        .join(' ');
};

const resolveText = (key, lang) => {
    if (lang === 'ar' && AR_TRANSLATIONS[key]) {
        return AR_TRANSLATIONS[key];
    }
    if (EN_TRANSLATIONS[key]) {
        return EN_TRANSLATIONS[key];
    }
    return prettifyKey(key);
};

const useT = () => {
    const { locale } = useCkamAdmin();
    const lang = locale === 'ar' ? 'ar' : 'en';

    return useMemo(() => ({
        lang,
        t: (key, vars) => applyTemplateVars(resolveText(key, lang), vars),
    }), [lang]);
};

export default useT;
