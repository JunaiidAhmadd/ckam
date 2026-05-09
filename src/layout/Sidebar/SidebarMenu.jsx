import * as Icons from 'tabler-icons-react';
import { adminCopy, getLocalizedValue } from '../../views/CkamAdmin/localization/i18n';
import { websiteBuilderPages } from '../../views/CkamAdmin/websiteBuilderConfig';

const marketingPageIcons = {
    'header-footer': <Icons.LayoutNavbarCollapse />,
    home: <Icons.Home />,
    features: <Icons.Star />,
    pricing: <Icons.Cash />,
    blogs: <Icons.News />,
    'single-blog': <Icons.Article />,
    booking: <Icons.CalendarEvent />,
    contact: <Icons.Mail />,
    'terms-of-service': <Icons.FileText />,
    'privacy-policy': <Icons.Lock />,
};

const authPageIcons = {
    login: <Icons.Login />,
    register: <Icons.UserPlus />,
    'forgot-password': <Icons.Help />,
    'verify-email': <Icons.ShieldCheck />,
};

const marketingPages = websiteBuilderPages.filter((page) => !['login', 'register', 'forgot-password', 'verify-email'].includes(page.slug));
const authPages = websiteBuilderPages.filter((page) => ['login', 'register', 'forgot-password', 'verify-email'].includes(page.slug));

const resolveWebsiteBuilderPages = (remotePages = []) => {
    if (!Array.isArray(remotePages) || !remotePages.length) {
        return websiteBuilderPages;
    }

    const localBySlug = new Map(websiteBuilderPages.map((page) => [page.slug, page]));
    return remotePages
        .filter((page) => page?.status === 'active')
        .map((page) => {
            const local = localBySlug.get(page.slug);
            if (!local) return null;
            return {
                ...local,
                label: {
                    en: page?.title?.en || local.label.en,
                    ar: page?.title?.ar || local.label.ar,
                },
            };
        })
        .filter(Boolean);
};

const buildPageLink = (page, locale, iconMap) => ({
    name: getLocalizedValue(page.label, locale),
    icon: iconMap[page.slug] || <Icons.FileText />,
    path: `/admin/website-builder/${page.slug}`,
});

export const getSidebarMenu = (locale = 'en', remotePages = []) => {
    const copy = adminCopy[locale]?.sidebar || adminCopy.en.sidebar;
    const resolvedPages = resolveWebsiteBuilderPages(remotePages);
    const resolvedMarketingPages = resolvedPages.filter((page) => !['login', 'register', 'forgot-password', 'verify-email'].includes(page.slug));
    const resolvedAuthPages = resolvedPages.filter((page) => ['login', 'register', 'forgot-password', 'verify-email'].includes(page.slug));
    const websiteBuilderGroups = [];

    if (resolvedMarketingPages.length) {
        websiteBuilderGroups.push({
            group: `${copy.websiteBuilder}`,
            contents: resolvedMarketingPages.map((page) => buildPageLink(page, locale, marketingPageIcons)),
        });
    }

    if (resolvedAuthPages.length) {
        websiteBuilderGroups.push({
            group: `${copy.websiteBuilder} - ${copy.authPages}`,
            contents: resolvedAuthPages.map((page) => buildPageLink(page, locale, authPageIcons)),
        });
    }

    return [
        {
            group: copy.overview,
            contents: [
                {
                    name: copy.adminDashboard,
                    icon: <Icons.LayoutDashboard />,
                    path: '/admin',
                    
                },
            ],
        },
        {
            group: copy.adminControls,
            contents: [
                {
                    name: copy.photographers,
                    icon: <Icons.Camera />,
                    path: '/admin/photographers',
                },
                {
                    name: copy.subscriptions,
                    icon: <Icons.CreditCard />,
                    path: '/admin/subscriptions',
                },
                {
                    name: copy.messages,
                    icon: <Icons.MessageCircle2 />,
                    path: '/admin/messages',
                },
                {
                    name: copy.blogs,
                    icon: <Icons.News />,
                    path: '/admin/blogs',
                },
            ],
        },
        ...websiteBuilderGroups,
    ];
};
