import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import '../../styles/scss/admin-rtl.scss';
import { nanoid } from 'nanoid';
import { ckamApi } from '../../api/ckamAdmin';
import {
    initialAdminProfile,
    initialBrandSettings,
    initialBlogPosts,
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

export const CkamAdminProvider = ({ children }) => {
    const [locale, setLocale] = useState(getInitialLocale);
    const [adminProfile, setAdminProfile] = useState(initialAdminProfile);
    const [photographers, setPhotographers] = useState(initialPhotographers);
    const [plans, setPlans] = useState(initialPlans);
    const [promoCodes, setPromoCodes] = useState(initialPromoCodes);
    const [contentSections, setContentSections] = useState(initialContentSections);
    const [brandSettings, setBrandSettings] = useState(initialBrandSettings);
    const [waitlist, setWaitlist] = useState(initialWaitlist);
    const [contactMessages, setContactMessages] = useState(getInitialContactMessages);
    const [blogPosts, setBlogPosts] = useState(initialBlogPosts);

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


    const saveAdminProfile = async (updates) => {
        try {
            await ckamApi.saveAdminProfile(updates);
        } catch {
            // keep UI responsive with local fallback
        }
        setAdminProfile((current) => ({
            ...current,
            ...updates,
            bio: updates.bio
                ? {
                    en: updates.bio.en || current.bio?.en || '',
                    ar: updates.bio.ar || current.bio?.ar || '',
                }
                : current.bio,
        }));
    };
    const updatePhotographerAccount = async (id, accountStatus) => {
        try {
            await ckamApi.updatePhotographerAccount(id, accountStatus);
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
        try {
            await ckamApi.updatePhotographerTap(id, tapStatus);
        } catch {
            // keep UI responsive with local fallback
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
            await ckamApi.savePlan(normalizedPlan);
        } catch {
            // keep UI responsive with local fallback
        }

        setPlans((current) => {
            if (normalizedPlan.id && current.some((plan) => plan.id === normalizedPlan.id)) {
                return current.map((plan) => (plan.id === normalizedPlan.id ? normalizedPlan : plan));
            }

            return [
                {
                    ...normalizedPlan,
                    id: nanoid(8),
                },
                ...current,
            ];
        });
    };

    const deletePlan = async (id) => {
        try {
            await ckamApi.deletePlan(id);
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

    const updateContactMessageStatus = (id, status) => {
        setContactMessages((current) =>
            current.map((entry) => (
                entry.id === id ? { ...entry, status } : entry
            ))
        );
    };

    const saveBlogPost = async (blogData) => {
        const normalizedBlog = {
            ...blogData,
            title: normalizeLocalizedText(blogData.title),
            excerpt: normalizeLocalizedText(blogData.excerpt),
            content: normalizeLocalizedText(blogData.content),
            featured: Boolean(blogData.featured),
            status: blogData.status === 'published' ? 'published' : 'draft',
            publishedAt: blogData.publishedAt || new Date().toISOString().slice(0, 10),
        };

        try {
            await ckamApi.saveBlogPost(normalizedBlog);
        } catch {
            // keep UI responsive with local fallback
        }

        setBlogPosts((current) => {
            if (normalizedBlog.id && current.some((post) => post.id === normalizedBlog.id)) {
                return current.map((post) => (post.id === normalizedBlog.id ? normalizedBlog : post));
            }

            return [{ ...normalizedBlog, id: nanoid(8) }, ...current];
        });
    };

    const deleteBlogPost = async (id) => {
        try {
            await ckamApi.deleteBlogPost(id);
        } catch {
            // keep UI responsive with local fallback
        }
        setBlogPosts((current) => current.filter((post) => post.id !== id));
    };

    const value = useMemo(() => ({
        locale,
        isArabic: locale === 'ar',
        setLocale,
        adminProfile,
        photographers,
        plans,
        promoCodes,
        contentSections,
        brandSettings,
        waitlist,
        contactMessages,
        blogPosts,
        revenueTimeline,
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
    }), [locale, adminProfile, photographers, plans, promoCodes, contentSections, brandSettings, waitlist, contactMessages, blogPosts]);

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





