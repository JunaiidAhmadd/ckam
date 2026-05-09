import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import '../../styles/scss/admin-rtl.scss';
import { nanoid } from 'nanoid';
import { adminAuthApi } from '../../api/adminAuth';
import { ckamApi } from '../../api/ckamAdmin';
import { setAdminTwoFactorEnabled } from '../../api/authSession';
import {
    initialAdminProfile,
    initialBrandSettings,
    initialContactMessages,
    initialContentSections,
    initialPhotographers,
    initialPlans,
    initialPromoCodes,
    initialWaitlist,
    revenueTimeline,
} from './data';

const CkamAdminContext = createContext(null);
const CKAM_ADMIN_LOCALE_KEY = 'ckam-admin-locale';
const CKAM_SUPPORTED_LOCALES = ['en', 'ar'];
const CKAM_CONTACT_MESSAGES_KEY = 'ckam-contact-messages';
const SOCIAL_LINK_FIELDS = ['instagram', 'tiktok', 'youtube', 'facebook', 'twitter', 'snapchat', 'linkedin', 'whatsapp', 'pinterest'];

const normalizeLocalizedText = (value) => ({
    en: value?.en || '',
    ar: value?.ar || '',
});

const normalizeLocalizedList = (value) => {
    if (Array.isArray(value)) {
        return value.map((item) => item.trim()).filter(Boolean);
    }

    return String(value || '').split('\n').map((item) => item.trim()).filter(Boolean);
};

const getInitialLocale = () => {
    if (typeof window === 'undefined') {
        return 'en';
    }

    const storedLocale = window.localStorage.getItem(CKAM_ADMIN_LOCALE_KEY);

    return CKAM_SUPPORTED_LOCALES.includes(storedLocale) ? storedLocale : 'en';
};

const getInitialContactMessages = () => {
    if (typeof window === 'undefined') {
        return initialContactMessages;
    }

    try {
        const stored = window.localStorage.getItem(CKAM_CONTACT_MESSAGES_KEY);
        if (!stored) {
            return initialContactMessages;
        }

        const parsed = JSON.parse(stored);
        if (!Array.isArray(parsed)) {
            return initialContactMessages;
        }

        return parsed;
    } catch {
        return initialContactMessages;
    }
};

const mapAdminProfileFromApi = (payload, fallback = initialAdminProfile) => {
    const tabs = payload?.tabs || {};
    const profile = tabs.profile || {};
    const accountSettings = tabs.account_settings || {};
    const socialLinks = tabs.social_links || {};
    const loginSecurity = tabs.login_security || {};
    const twoStepVerification = loginSecurity.two_step_verification || {};

    return {
        ...fallback,
        firstName: profile.first_name ?? fallback.firstName ?? '',
        lastName: profile.last_name ?? fallback.lastName ?? '',
        role: profile.role ?? fallback.role ?? '',
        roleAr: profile.role ?? fallback.roleAr ?? fallback.role ?? '',
        email: accountSettings.email ?? fallback.email ?? '',
        phone: accountSettings.phone ?? fallback.phone ?? '',
        location: profile.location ?? fallback.location ?? '',
        locationAr: profile.location ?? fallback.locationAr ?? fallback.location ?? '',
        website: profile.personal_website ?? fallback.website ?? '',
        personalWebsite: profile.personal_website ?? fallback.personalWebsite ?? fallback.website ?? '',
        bio: {
            en: profile.bio ?? fallback.bio?.en ?? '',
            ar: fallback.bio?.ar || profile.bio || '',
        },
        avatar: profile.image_url ?? fallback.avatar ?? '',
        imageUrl: profile.image_url ?? fallback.imageUrl ?? '',
        socialLinks: SOCIAL_LINK_FIELDS.reduce((accumulator, field) => ({
            ...accumulator,
            [field]: socialLinks[field] ?? fallback.socialLinks?.[field] ?? '',
        }), {}),
        twoFactorEnabled: Boolean(twoStepVerification.two_factor_enabled),
        twoFactorMethod: 'email',
        twoFactorEmail: twoStepVerification.email ?? accountSettings.email ?? fallback.twoFactorEmail ?? '',
        twoFactorPhone: '',
        loginSecurity,
        profileTabs: tabs,
    };
};

const buildAdminProfileUpdatePayload = (current, updates) => {
    const next = {
        ...current,
        ...updates,
        bio: updates.bio
            ? {
                en: updates.bio.en ?? current.bio?.en ?? '',
                ar: updates.bio.ar ?? current.bio?.ar ?? '',
            }
            : current.bio,
    };

    const payload = {
        first_name: next.firstName || '',
        last_name: next.lastName || '',
        role: next.role || '',
        location: next.location || '',
        bio: next.bio?.en || '',
        personal_website: next.personalWebsite || next.website || '',
        image: next.avatar || next.imageUrl || '',
        email: next.email || '',
        phone: next.phone || '',
    };

    if (updates.oldPassword || updates.newPassword || updates.confirmPassword) {
        payload.old_password = updates.oldPassword || '';
        payload.new_password = updates.newPassword || '';
        payload.confirm_password = updates.confirmPassword || '';
    }

    return payload;
};

const mapPhotographerStatus = (accountActive) => (accountActive ? 'active' : 'deactivated');

const mapTapStatus = (tapConnected, tapOnboardingStatus) => {
    if (tapConnected) return 'connected';
    if (tapOnboardingStatus === 'not_started') return 'not-started';
    return 'pending';
};

const mapPlanBillingCycle = (cycle) => {
    if (cycle === 'yr' || cycle === 'year' || cycle === 'annual') return 'annual';
    if (cycle === 'qtr' || cycle === 'quarter' || cycle === 'quarterly') return 'quarterly';
    if (cycle === 'custom') return 'custom';
    return 'monthly';
};

const mapPlanFromApi = (item = {}) => ({
    id: String(item.id),
    name: { en: item.name || '', ar: item.ar_name || item.name || '' },
    price: Number(item.price || 0),
    billingCycle: mapPlanBillingCycle(item.billing_cycle),
    billingLabel: {
        en: item.billing_cycle === 'yr'
            ? 'Billed yearly'
            : item.billing_cycle === 'qtr'
                ? 'Billed quarterly'
                : 'Billed monthly',
        ar: item.billing_cycle === 'yr'
            ? 'Billed yearly'
            : item.billing_cycle === 'qtr'
                ? 'Billed quarterly'
                : 'Billed monthly',
    },
    trialDays: 0,
    activeSubscribers: 0,
    status: item.is_active ? 'published' : 'draft',
    description: { en: item.description || '', ar: item.ar_description || item.description || '' },
    features: {
        en: Array.isArray(item.features) ? item.features.map((feature) => feature.feature_label).filter(Boolean) : [],
        ar: Array.isArray(item.features) ? item.features.map((feature) => feature.ar_feature_label || feature.feature_label).filter(Boolean) : [],
    },
});

const mapMessageStatusFromApi = (status) => {
    if (status === 'review') return 'reviewed';
    if (status === 'reviewed') return 'reviewed';
    if (status === 'contacted') return 'contacted';
    return 'new';
};

const mapMessageStatusToApi = (status) => (status === 'reviewed' ? 'review' : status);

const mapContactMessageFromApi = (item = {}) => ({
    id: String(item.id),
    name: item.name || '',
    email: item.email || '',
    subject: item.subject || '',
    message: item.message || '',
    status: mapMessageStatusFromApi(item.status),
    source: 'Contact form',
    locale: 'en',
    createdAt: item.created_at || new Date().toISOString(),
});

const toDateInputValue = (value) => {
    if (!value) return new Date().toISOString().slice(0, 10);
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value).slice(0, 10);
    return date.toISOString().slice(0, 10);
};

const mapBlogCategoryFromApi = (item = {}) => ({
    id: String(item.id || ''),
    name: {
        en: item.name_en || '',
        ar: item.name_ar || item.name_en || '',
    },
    slug: item.slug || '',
    status: Number(item.status) === 1 ? 'active' : 'inactive',
    position: Number(item.position || 0),
    blogsCount: Number(item.blogs_count || 0),
});

const mapSitePageFromApi = (item = {}) => ({
    id: String(item.id || ''),
    slug: String(item.slug || '').trim(),
    title: {
        en: item.title_en || item.slug || '',
        ar: item.title_ar || item.title_en || item.slug || '',
    },
    status: Number(item.status) === 1 ? 'active' : 'inactive',
});

const mapBlogPostFromApi = (item = {}) => ({
    id: String(item.id || ''),
    siteBlogCategoryId: String(item.site_blog_category_id || item.category?.id || ''),
    categoryId: String(item.site_blog_category_id || item.category?.id || ''),
    category: item.category?.name_en || item.badge_en || item.category_en || '',
    categoryLabel: {
        en: item.category?.name_en || item.badge_en || item.category_en || '',
        ar: item.category?.name_ar || item.badge_ar || item.category_ar || item.category?.name_en || item.badge_en || '',
    },
    slug: item.slug || '',
    title: {
        en: item.title_en || '',
        ar: item.title_ar || item.title_en || '',
    },
    excerpt: {
        en: item.short_description_en || '',
        ar: item.short_description_ar || item.short_description_en || '',
    },
    content: {
        en: '',
        ar: '',
    },
    author: item.author_en || '',
    authorAr: item.author_ar || item.author_en || '',
    readTime: item.read_time_en || '5 min read',
    readTimeAr: item.read_time_ar || item.read_time_en || 'قراءة 5 دقائق',
    status: Number(item.status) === 1 ? 'published' : 'draft',
    featured: Number(item.is_featured) === 1,
    imageUrl: item.featured_image || '',
    badgeEn: item.badge_en || '',
    badgeAr: item.badge_ar || '',
    sortOrder: Number(item.sort_order || 1),
    publishedAt: toDateInputValue(item.published_at),
});

const mapPhotographerFromApi = (item = {}) => {
    const name = item.name || 'Photographer';
    const subtitle = String(item.subtitle || '')
        .replace(/\uFFFD/g, '')
        .trim();
    const subtitleParts = subtitle
        .split('•')
        .map((part) => part.trim())
        .filter(Boolean);
    const specialty = subtitleParts.length ? subtitleParts[subtitleParts.length - 1] : '';
    const city = subtitleParts.length > 1 ? subtitleParts.slice(0, -1).join(' • ') : '';

    const photographerId = item.photographer_id ?? null;
    const userId = item.user_id ?? null;
    const rowId = photographerId ? `p-${photographerId}` : `u-${userId ?? 'unknown'}`;

    return {
        id: rowId,
        photographerId,
        userId: userId,
        name,
        city,
        specialty,
        planId: '',
        planName: { en: item.plan_name || 'N/A', ar: item.plan_name || 'N/A' },
        accountStatus: mapPhotographerStatus(Boolean(item.account_active)),
        subscriptionStatus: item.plan_status || 'inactive',
        tapStatus: mapTapStatus(Boolean(item.tap_connected), item.tap_onboarding_status),
        monthlyRevenue: Number(item.revenue || 0),
        joinedOn: new Date().toISOString().slice(0, 10),
        email: '',
        phone: '',
        publicUrl: '',
        businessName: name,
        about: { en: '', ar: '' },
        preferredLanguage: 'English',
        preferredLanguageAr: 'English',
        preferredCurrency: 'USD',
        totalClients: 0,
        upcomingBookings: 0,
        experience: '',
        experienceAr: '',
        kycSubmitted: false,
        avatar: item.image_url || '',
    };
};

export const CkamAdminProvider = ({ children }) => {
    const [locale, setLocale] = useState(getInitialLocale);
    const [adminProfile, setAdminProfile] = useState(initialAdminProfile);
    const [adminProfileLoading, setAdminProfileLoading] = useState(false);
    const [photographers, setPhotographers] = useState(initialPhotographers);
    const [plans, setPlans] = useState(initialPlans);
    const [promoCodes, setPromoCodes] = useState(initialPromoCodes);
    const [contentSections, setContentSections] = useState(initialContentSections);
    const [brandSettings, setBrandSettings] = useState(initialBrandSettings);
    const [waitlist, setWaitlist] = useState(initialWaitlist);
    const [contactMessages, setContactMessages] = useState(getInitialContactMessages);
    const [blogCategories, setBlogCategories] = useState([]);
    const [blogPosts, setBlogPosts] = useState([]);
    const [sitePages, setSitePages] = useState([]);
    const [dashboardData, setDashboardData] = useState(null);

    useEffect(() => {
        document.documentElement.lang = locale;
        document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
        window.localStorage.setItem(CKAM_ADMIN_LOCALE_KEY, locale);
    }, [locale]);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }
        window.localStorage.setItem(CKAM_CONTACT_MESSAGES_KEY, JSON.stringify(contactMessages));
    }, [contactMessages]);

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const payload = await ckamApi.getMessages();
                const list = Array.isArray(payload?.messages) ? payload.messages : [];
                if (!list.length) return;
                setContactMessages(list.map(mapContactMessageFromApi));
            } catch {
                // keep local fallback seed data
            }
        };

        fetchMessages();
    }, []);

    useEffect(() => {
        const fetchPhotographers = async () => {
            try {
                const payload = await ckamApi.getPhotographers();
                const accounts = Array.isArray(payload?.photographer_accounts) ? payload.photographer_accounts : [];
                if (!accounts.length) return;
                setPhotographers(accounts.map(mapPhotographerFromApi));
            } catch {
                // keep local fallback seed data
            }
        };

        fetchPhotographers();
    }, []);

    const fetchDashboard = useCallback(async () => {
        try {
            const payload = await ckamApi.getDashboard();
            setDashboardData(payload);
            return payload;
        } catch {
            return null;
        }
    }, []);

    useEffect(() => {
        fetchDashboard();
    }, [fetchDashboard]);

    const fetchPlans = useCallback(async () => {
        try {
            const payload = await ckamApi.getPlans();
            const apiPlans = Array.isArray(payload?.plans) ? payload.plans : [];
            if (!apiPlans.length) return;
            setPlans(apiPlans.map(mapPlanFromApi));
        } catch {
            // keep local fallback seed data
        }
    }, []);

    useEffect(() => {
        fetchPlans();
    }, [fetchPlans]);

    const fetchBlogCategories = useCallback(async () => {
        try {
            const payload = await ckamApi.getBlogCategories();
            const list = Array.isArray(payload?.data) ? payload.data : [];
            setBlogCategories(list.map(mapBlogCategoryFromApi));
        } catch {
            // keep local fallback seed data
        }
    }, []);

    const fetchBlogPosts = useCallback(async () => {
        try {
            const payload = await ckamApi.getBlogPosts();
            const list = Array.isArray(payload?.data?.data)
                ? payload.data.data
                : (Array.isArray(payload?.data) ? payload.data : []);
            setBlogPosts(list.map(mapBlogPostFromApi));
        } catch {
            // keep local fallback seed data
        }
    }, []);

    useEffect(() => {
        fetchBlogCategories();
        fetchBlogPosts();
    }, [fetchBlogCategories, fetchBlogPosts]);

    const fetchSitePages = useCallback(async () => {
        try {
            const payload = await ckamApi.getSitePages();
            const list = Array.isArray(payload?.data) ? payload.data : [];
            setSitePages(list.map(mapSitePageFromApi));
        } catch {
            setSitePages([]);
        }
    }, []);

    useEffect(() => {
        fetchSitePages();
    }, [fetchSitePages]);

    const fetchAdminProfile = useCallback(async () => {
        setAdminProfileLoading(true);
        try {
            const payload = await adminAuthApi.profile();
            setAdminProfile((current) => {
                const mapped = mapAdminProfileFromApi(payload, current);
                setAdminTwoFactorEnabled(Boolean(mapped?.twoFactorEnabled));
                return mapped;
            });
            return payload;
        } finally {
            setAdminProfileLoading(false);
        }
    }, []);

    const saveAdminProfile = async (updates) => {
        const payload = buildAdminProfileUpdatePayload(adminProfile, updates);
        await adminAuthApi.updateProfile(payload);
        await fetchAdminProfile();
    };
const updatePhotographerAccount = async (id, accountStatus) => {
        const target = photographers.find((item) => item.id === id);
        const apiId = target?.photographerId ?? target?.userId;

        try {
            if (apiId) {
                await ckamApi.updatePhotographerAccount(apiId, accountStatus);
            }
        } catch {
            // keep UI responsive with local fallback
        }
        setPhotographers((current) =>
            current.map((photographer) => {
                if (photographer.id !== id) {
                    return photographer;
                }

                return {
                    ...photographer,
                    accountStatus,
                    subscriptionStatus: accountStatus === 'deactivated'
                        ? 'inactive'
                        : photographer.subscriptionStatus === 'inactive'
                            ? 'active'
                            : photographer.subscriptionStatus,
                };
            })
        );
    };

    const updatePhotographerTap = async (id, tapStatus) => {
        const target = photographers.find((item) => item.id === id);
        const apiId = target?.photographerId ?? target?.userId;

        try {
            if (apiId) {
                await ckamApi.updatePhotographerTap(apiId, tapStatus);
            }
        } catch (error) {
            // keep UI responsive with local fallback
            console.error('Failed to update tap status:', error);
        }
        setPhotographers((current) =>
            current.map((photographer) => (
                photographer.id === id ? { ...photographer, tapStatus } : photographer
            ))
        );
    };

    const savePhotographerProfile = async (id, updates) => {
        try {
            await ckamApi.savePhotographerProfile(id, updates);
        } catch {
            // keep UI responsive with local fallback
        }
        setPhotographers((current) =>
            current.map((photographer) => {
                if (photographer.id !== id) {
                    return photographer;
                }

                return {
                    ...photographer,
                    ...updates,
                    planName: updates.planName
                        ? {
                            en: updates.planName.en || photographer.planName?.en || '',
                            ar: updates.planName.ar || photographer.planName?.ar || '',
                        }
                        : photographer.planName,
                    about: updates.about
                        ? {
                            en: updates.about.en || photographer.about?.en || '',
                            ar: updates.about.ar || photographer.about?.ar || '',
                        }
                        : photographer.about,
                };
            })
        );
    };

    const savePlan = async (planData) => {
        const normalizedPlan = {
            ...planData,
            price: Number(planData.price),
            trialDays: Number(planData.trialDays),
            activeSubscribers: Number(planData.activeSubscribers || 0),
            name: normalizeLocalizedText(planData.name),
            description: normalizeLocalizedText(planData.description),
            billingLabel: normalizeLocalizedText(planData.billingLabel),
            features: {
                en: normalizeLocalizedList(planData.features?.en),
                ar: normalizeLocalizedList(planData.features?.ar),
            },
        };
        try {
            const payload = await ckamApi.savePlan(normalizedPlan);
            const savedPlan = payload?.data && typeof payload.data === 'object' ? payload.data : null;
            if (savedPlan?.id) {
                const mapped = mapPlanFromApi(savedPlan);
                setPlans((current) => {
                    const exists = current.some((plan) => String(plan.id) === String(mapped.id));
                    if (exists) {
                        return current.map((plan) => (String(plan.id) === String(mapped.id) ? mapped : plan));
                    }
                    return [mapped, ...current];
                });
            }
            fetchPlans();
            return { ok: true, payload };
        } catch (error) {
            console.error('Failed to save plan:', error);
            return { ok: false, error: error?.message || 'Failed to save plan.' };
        }
    };
    const deletePlan = async (id) => {
        try {
            await ckamApi.deletePlan(id);
            await fetchPlans();
            return;
        } catch {
            // keep UI responsive with local fallback
        }
        setPlans((current) => current.filter((plan) => plan.id !== id));
    };

    const savePromoCode = async (promoCodeData) => {
        const normalizedPromoCode = {
            ...promoCodeData,
            code: String(promoCodeData.code || '').trim().toUpperCase(),
            type: promoCodeData.type === 'fixed' ? 'fixed' : 'percent',
            value: Number(promoCodeData.value || 0),
            appliesTo: Array.isArray(promoCodeData.appliesTo) && promoCodeData.appliesTo.length
                ? promoCodeData.appliesTo
                : ['all'],
            startsOn: promoCodeData.startsOn || '',
            endsOn: promoCodeData.endsOn || '',
            usageLimit: Number(promoCodeData.usageLimit || 0),
            usedCount: Number(promoCodeData.usedCount || 0),
            status: ['active', 'draft', 'inactive'].includes(promoCodeData.status)
                ? promoCodeData.status
                : 'draft',
            description: normalizeLocalizedText(promoCodeData.description),
        };

        try {
            await ckamApi.savePromoCode(normalizedPromoCode);
        } catch {
            // keep UI responsive with local fallback
        }

        setPromoCodes((current) => {
            if (normalizedPromoCode.id && current.some((promoCode) => promoCode.id === normalizedPromoCode.id)) {
                return current.map((promoCode) => (promoCode.id === normalizedPromoCode.id ? normalizedPromoCode : promoCode));
            }

            return [
                {
                    ...normalizedPromoCode,
                    id: nanoid(8),
                },
                ...current,
            ];
        });
    };

    const deletePromoCode = async (id) => {
        try {
            await ckamApi.deletePromoCode(id);
        } catch {
            // keep UI responsive with local fallback
        }
        setPromoCodes((current) => current.filter((promoCode) => promoCode.id !== id));
    };

    const saveContentSection = async (sectionId, updates) => {
        const normalizedUpdates = {
            ...updates,
            name: normalizeLocalizedText(updates.name),
            eyebrow: normalizeLocalizedText(updates.eyebrow),
            headline: normalizeLocalizedText(updates.headline),
            subheadline: normalizeLocalizedText(updates.subheadline),
            body: normalizeLocalizedText(updates.body),
            highlights: {
                en: normalizeLocalizedList(updates.highlights?.en),
                ar: normalizeLocalizedList(updates.highlights?.ar),
            },
            ctaLabel: normalizeLocalizedText(updates.ctaLabel),
            secondaryCtaLabel: normalizeLocalizedText(updates.secondaryCtaLabel),
            seoTitle: normalizeLocalizedText(updates.seoTitle),
            seoDescription: normalizeLocalizedText(updates.seoDescription),
            modules: Array.isArray(updates.modules) ? updates.modules.filter(Boolean) : [],
            updatedAt: new Date().toISOString().slice(0, 10),
        };

        try {
            await ckamApi.saveContentSection(sectionId, normalizedUpdates);
        } catch {
            // keep UI responsive with local fallback
        }

        setContentSections((current) =>
            current.map((section) => (
                section.id === sectionId ? { ...section, ...normalizedUpdates } : section
            ))
        );
    };

    const saveBrand = async (updates) => {
        const normalizedUpdates = {
            ...updates,
            logoText: normalizeLocalizedText(updates.logoText),
            headerAnnouncement: normalizeLocalizedText(updates.headerAnnouncement),
            headerCtaLabel: normalizeLocalizedText(updates.headerCtaLabel),
            footerSummary: normalizeLocalizedText(updates.footerSummary),
            footerCtaLabel: normalizeLocalizedText(updates.footerCtaLabel),
            waitingListHeadline: normalizeLocalizedText(updates.waitingListHeadline),
        };

        try {
            await ckamApi.saveBrand(normalizedUpdates);
        } catch {
            // keep UI responsive with local fallback
        }

        setBrandSettings((current) => ({ ...current, ...normalizedUpdates }));
    };
    const updateWaitlistStatus = async (id, status) => {
        try {
            await ckamApi.updateWaitlistStatus(id, status);
        } catch {
            // keep UI responsive with local fallback
        }
        setWaitlist((current) =>
            current.map((entry) => (
                entry.id === id ? { ...entry, status } : entry
            ))
        );
    };

    const updateContactMessageStatus = async (id, status) => {
        try {
            await ckamApi.updateMessageStatus(id, mapMessageStatusToApi(status));
        } catch {
            // keep UI responsive with local fallback
        }
        setContactMessages((current) =>
            current.map((entry) => (
                entry.id === id ? { ...entry, status } : entry
            ))
        );
    };

    const saveBlogPost = async (blogData) => {
        const siteBlogCategoryId = Number(blogData.categoryId || blogData.siteBlogCategoryId || blogData.category || 0);
        const normalizedStatus = blogData.status === 'published' ? 'published' : 'draft';
        const normalizedFeatured = Boolean(blogData.featured);
        const selectedPublishDate = blogData.publishedAt || new Date().toISOString().slice(0, 10);

        const normalizedBlog = {
            ...blogData,
            categoryId: String(blogData.categoryId || blogData.siteBlogCategoryId || blogData.category || ''),
            category: blogData.category || blogData.categoryNameEn || '',
            categoryLabel: {
                en: blogData.categoryNameEn || blogData.category || '',
                ar: blogData.categoryNameAr || blogData.categoryNameEn || blogData.category || '',
            },
            title: normalizeLocalizedText(blogData.title),
            excerpt: normalizeLocalizedText(blogData.excerpt),
            content: normalizeLocalizedText(blogData.content),
            featured: normalizedFeatured,
            status: normalizedStatus,
            publishedAt: selectedPublishDate,
            site_blog_category_id: siteBlogCategoryId || Number(blogData.site_blog_category_id || 0) || null,
            title_en: blogData.title_en || blogData.title?.en || '',
            title_ar: blogData.title_ar || blogData.title?.ar || blogData.title?.en || '',
            featured_image: blogData.featured_image || blogData.imageFile || blogData.imageUrl || '',
            short_description_en: blogData.short_description_en || blogData.excerpt?.en || '',
            short_description_ar: blogData.short_description_ar || blogData.excerpt?.ar || blogData.excerpt?.en || '',
            read_time_en: blogData.read_time_en || blogData.readTime || '5 min read',
            read_time_ar: blogData.read_time_ar || blogData.readTimeAr || '5 min read',
            author_en: blogData.author_en || blogData.author || 'C-KAM Editorial',
            author_ar: blogData.author_ar || blogData.authorAr || 'C-KAM Editorial',
            badge_en: blogData.badge_en || blogData.badgeEn || blogData.categoryNameEn || blogData.category || '',
            badge_ar: blogData.badge_ar || blogData.badgeAr || blogData.categoryNameAr || blogData.categoryNameEn || blogData.category || '',
            is_featured: normalizedFeatured ? 1 : 0,
            sort_order: Number(blogData.sort_order || blogData.sortOrder || 1),
            published_at: blogData.published_at || selectedPublishDate,
        };

        try {
            await ckamApi.saveBlogPost(normalizedBlog);
            await fetchBlogPosts();
            await fetchBlogCategories();
            return { ok: true };
        } catch (error) {
            console.error('Failed to save blog post:', error);
            return { ok: false, error: error?.message || 'Failed to save blog post.' };
        }
    };

    const deleteBlogPost = async (id) => {
        try {
            await ckamApi.deleteBlogPost(id);
            await fetchBlogPosts();
            await fetchBlogCategories();
            return { ok: true };
        } catch (error) {
            console.error('Failed to delete blog post:', error);
            return { ok: false, error: error?.message || 'Failed to delete blog post.' };
        }
    };

    const value = useMemo(() => ({
        locale,
        isArabic: locale === 'ar',
        setLocale,
        adminProfile,
        adminProfileLoading,
        photographers,
        plans,
        promoCodes,
        contentSections,
        brandSettings,
        waitlist,
        contactMessages,
        blogCategories,
        blogPosts,
        sitePages,
        dashboardData,
        revenueTimeline,
        fetchDashboard,
        fetchAdminProfile,
        saveAdminProfile,
        updatePhotographerAccount,
        updatePhotographerTap,
        savePhotographerProfile,
        savePlan,
        deletePlan,
        savePromoCode,
        deletePromoCode,
        saveContentSection,
        saveBrand,
        updateWaitlistStatus,
        updateContactMessageStatus,
        saveBlogPost,
        deleteBlogPost,
        fetchSitePages,
    }), [locale, adminProfile, adminProfileLoading, photographers, plans, promoCodes, contentSections, brandSettings, waitlist, contactMessages, blogCategories, blogPosts, sitePages, dashboardData, fetchDashboard, fetchAdminProfile, fetchSitePages]);

    return (
        <CkamAdminContext.Provider value={value}>
            {children}
        </CkamAdminContext.Provider>
    );
};

export const useCkamAdmin = () => {
    const context = useContext(CkamAdminContext);

    if (!context) {
        throw new Error('useCkamAdmin must be used within CkamAdminProvider');
    }

    return context;
};










