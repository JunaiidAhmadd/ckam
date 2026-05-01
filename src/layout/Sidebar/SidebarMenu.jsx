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

const buildPageLink = (page, locale, iconMap) => ({
    name: getLocalizedValue(page.label, locale),
    icon: iconMap[page.slug] || <Icons.FileText />,
    path: `/admin/website-builder/${page.slug}`,
});

export const getSidebarMenu = (locale = 'en') => {
    const copy = adminCopy[locale]?.sidebar || adminCopy.en.sidebar;
    const websiteBuilderGroups = [];

    if (marketingPages.length) {
        websiteBuilderGroups.push({
            group: `${copy.websiteBuilder}`,
            contents: marketingPages.map((page) => buildPageLink(page, locale, marketingPageIcons)),
        });
    }

    if (authPages.length) {
        websiteBuilderGroups.push({
            group: `${copy.websiteBuilder} - ${copy.authPages}`,
            contents: authPages.map((page) => buildPageLink(page, locale, authPageIcons)),
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
