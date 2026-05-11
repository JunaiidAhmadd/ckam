import React, { useEffect, useMemo } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import Header from '../../../websitebuilder/src/components/Header.jsx';
import Footer from '../../../websitebuilder/src/components/Footer.jsx';
import ThemeSwitcher from '../../../websitebuilder/src/components/ThemeSwitcher.jsx';
import { I18nProvider, useI18n } from '../../../websitebuilder/src/context/I18nContext.jsx';
import BlogsPage from '../../../websitebuilder/src/pages/BlogsPage.jsx';
import BookingPage from '../../../websitebuilder/src/pages/BookingPage.jsx';
import ContactPage from '../../../websitebuilder/src/pages/ContactPage.jsx';
import FeaturesPage from '../../../websitebuilder/src/pages/FeaturesPage.jsx';
import HomePage from '../../../websitebuilder/src/pages/HomePage.jsx';
import AboutPage from '../../../websitebuilder/src/pages/AboutPage.jsx';
import PlaceholderPage from '../../../websitebuilder/src/pages/PlaceholderPage.jsx';
import PricingPage from '../../../websitebuilder/src/pages/PricingPage.jsx';
import PrivacyPage from '../../../websitebuilder/src/pages/PrivacyPage.jsx';
import SingleBlogPage from '../../../websitebuilder/src/pages/SingleBlogPage.jsx';
import TermsPage from '../../../websitebuilder/src/pages/TermsPage.jsx';
import '../../../websitebuilder/src/styles/react-base.css';
import { getLocalizedValue } from '../../../websitebuilder/admin-builder/model/schema.js';
import {
    isBuilderStorageKey,
    persistBuilderStateToStorage,
    readBuilderStateFromStorage,
} from '../../../websitebuilder/admin-builder/model/storage.js';

const previewPageMap = {
    'header-footer': HomePage,
    home: HomePage,
    features: FeaturesPage,
    pricing: PricingPage,
    blogs: BlogsPage,
    'single-blog': SingleBlogPage,
    contact: ContactPage,
    about: AboutPage,
    booking: BookingPage,
    'terms-of-service': TermsPage,
    'privacy-policy': PrivacyPage,
};

const previewStylesheets = [
    '/assets/css/bootstrap.min.css',
    '/assets/css/flaticon.css',
    '/assets/css/remixicon.css',
    '/assets/css/owl.carousel.min.css',
    '/assets/css/swiper.min.css',
    '/assets/css/aos.css',
    '/assets/css/style.css',
    '/assets/css/responsive.css',
    '/assets/css/dark-theme.css',
    '/assets/css/rtl.css',
    '/assets/css/language-selector.css',
    '/assets/css/index-sections.css',
    '/assets/css/features.css',
    '/assets/css/pricing-plan.css',
    '/assets/css/blogs.css',
    '/assets/css/legal.css',
];

const usePreviewStyles = () => {
    useEffect(() => {
        const appendedLinks = [];
        const head = document.head;

        previewStylesheets.forEach((href) => {
            const existingLink = head.querySelector(`link[rel="stylesheet"][href="${href}"]`);
            if (existingLink) {
                return;
            }

            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            link.dataset.ckamPreviewStyle = 'true';
            head.appendChild(link);
            appendedLinks.push(link);
        });

        return () => {
            appendedLinks.forEach((link) => link.remove());
        };
    }, []);
};

const parseThemePalette = (theme) => {
    if (theme === 'sand') return { bg: '#f8f4ee', text: '#2f2a26', accent: '#d46a2f', buttonBg: '#d46a2f', buttonText: '#ffffff' };
    if (theme === 'ocean') return { bg: '#f2f7fb', text: '#173042', accent: '#1f7a8c', buttonBg: '#1f7a8c', buttonText: '#ffffff' };
    if (theme === 'forest') return { bg: '#f4f8f2', text: '#203223', accent: '#3f7d37', buttonBg: '#3f7d37', buttonText: '#ffffff' };
    if (theme === 'midnight') return { bg: '#111827', text: '#f8fafc', accent: '#fb923c', buttonBg: '#fb923c', buttonText: '#111827' };
    return { bg: '#ffffff', text: '#1f2937', accent: '#f4c430', buttonBg: '#f47e42', buttonText: '#ffffff' };
};

const getSectionFields = (sectionData) => (
    Array.isArray(sectionData?.fields)
        ? sectionData.fields
        : (Array.isArray(sectionData?.elements) ? sectionData.elements : [])
);

const getSectionShow = (sectionData) => {
    if (typeof sectionData?.show === 'boolean') {
        return sectionData.show;
    }

    const legacyVisible = getSectionFields(sectionData).find((field) => field?.key === 'visible');
    if (legacyVisible && typeof legacyVisible.value === 'boolean') {
        return legacyVisible.value;
    }

    return true;
};

const getSectionValues = (sectionData, locale = 'en') => {
    const values = {};
    getSectionFields(sectionData).forEach((field) => {
        values[field.key] = getLocalizedValue(field?.value, locale, field?.value);
    });
    return values;
};

const setNodeText = (node, value) => {
    if (!node || typeof value !== 'string') return;
    node.textContent = value;
};

const setNodeHtml = (node, value) => {
    if (!node || typeof value !== 'string') return;
    node.innerHTML = value;
};

const setNodeHref = (node, value) => {
    if (!node || typeof value !== 'string' || !value.trim()) return;
    if (node.tagName?.toLowerCase() === 'a') {
        node.setAttribute('href', value.trim());
    }
};

const setNodeSrc = (node, value) => {
    if (!node || typeof value !== 'string' || !value.trim()) return;
    if (node.tagName?.toLowerCase() === 'img') {
        node.setAttribute('src', value.trim());
    }
};

const setNodeDisplay = (node, show) => {
    if (!node) return;
    node.style.display = show ? '' : 'none';
};

const isValidHexColor = (value) => /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(String(value || '').trim());

const applyLineValuesToNodes = (nodes, lines) => {
    if (!nodes?.length) return;
    nodes.forEach((node, index) => {
        node.textContent = lines[index] || '';
    });
};

const applySectionThemeStyles = (sectionNode, elementValues) => {
    if (!sectionNode || !elementValues) return;

    const textColor = isValidHexColor(elementValues.textColor) ? String(elementValues.textColor).trim() : '';
    const backgroundColor = isValidHexColor(elementValues.backgroundColor) ? String(elementValues.backgroundColor).trim() : '';
    const accentColor = isValidHexColor(elementValues.accentColor) ? String(elementValues.accentColor).trim() : '';
    const buttonColor = isValidHexColor(elementValues.buttonColor) ? String(elementValues.buttonColor).trim() : '';
    const buttonTextColor = isValidHexColor(elementValues.buttonTextColor) ? String(elementValues.buttonTextColor).trim() : '';

    sectionNode.style.setProperty('--builder-section-accent', accentColor || '');
    sectionNode.style.setProperty('--builder-section-text', textColor || '');
    sectionNode.style.setProperty('--builder-section-bg', backgroundColor || '');
    sectionNode.style.setProperty('--builder-section-button-bg', buttonColor || '');
    sectionNode.style.setProperty('--builder-section-button-text', buttonTextColor || '');

    if (textColor) {
        sectionNode.style.color = textColor;
    }
    if (backgroundColor) {
        sectionNode.style.backgroundColor = backgroundColor;
    }

    const buttonTargets = Array.from(sectionNode.querySelectorAll('[data-builder-button="primary"], [data-builder-button="secondary"], .client-btn'));
    buttonTargets.forEach((node) => {
        if (buttonColor) {
            node.style.backgroundColor = buttonColor;
            node.style.borderColor = buttonColor;
        }
        if (buttonTextColor) {
            node.style.color = buttonTextColor;
        }
    });
};

const applyFieldBinding = (sectionNode, key, value) => {
    const targets = Array.from(sectionNode.querySelectorAll(`[data-builder-field="${key}"]`));
    targets.forEach((node) => {
        const bindType = node.getAttribute('data-builder-bind') || 'text';
        if (bindType === 'html') setNodeHtml(node, value);
        if (bindType === 'text') setNodeText(node, value);
        if (bindType === 'href') setNodeHref(node, value);
        if (bindType === 'src') setNodeSrc(node, value);
        if (bindType === 'bg-image' && typeof value === 'string' && value.trim()) {
            node.style.backgroundImage = `url("${value.trim()}")`;
        }
    });
};

/** Split textarea (newlines) or list field (array) into display lines */
const builderValueToLines = (value) => {
    if (value == null) return [];
    if (Array.isArray(value)) return value.map((x) => String(x).trim()).filter(Boolean);
    if (typeof value === 'string') return value.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
    return [];
};

/** Push each line into <li> children (home hero `.growth-points`, optional bound ul) */
const applyDescriptionLinesToLists = (sectionNode, lines) => {
    if (!lines.length) return;
    const candidates = [
        sectionNode.querySelector('ul[data-builder-field="description"]'),
        sectionNode.querySelector('.growth-points'),
    ].filter(Boolean);

    candidates.forEach((ul) => {
        if (ul.tagName?.toLowerCase() !== 'ul') return;
        const existing = Array.from(ul.querySelectorAll(':scope > li'));
        lines.forEach((line, index) => {
            if (existing[index]) {
                existing[index].textContent = line;
            } else {
                const li = document.createElement('li');
                li.textContent = line;
                ul.appendChild(li);
            }
        });
        const allItems = ul.querySelectorAll(':scope > li');
        for (let i = lines.length; i < allItems.length; i += 1) {
            allItems[i].textContent = '';
        }
    });
};

const applyMultilineToListItemSpans = (sectionNode, lines, itemSpanSelector) => {
    if (!lines.length || !sectionNode) return;
    const nodes = Array.from(sectionNode.querySelectorAll(itemSpanSelector));
    lines.forEach((line, index) => {
        if (nodes[index]) nodes[index].textContent = line;
    });
    nodes.forEach((node, index) => {
        if (index >= lines.length) node.textContent = '';
    });
};

const applyHighlightsToLists = (sectionNode, lines) => {
    if (!lines.length) return;
    const ul = sectionNode.querySelector('ul[data-builder-field="highlights"]');
    if (!ul || ul.tagName?.toLowerCase() !== 'ul') return;
    const existing = Array.from(ul.querySelectorAll(':scope > li'));
    lines.forEach((line, index) => {
        if (existing[index]) {
            existing[index].textContent = line;
        } else {
            const li = document.createElement('li');
            li.textContent = line;
            ul.appendChild(li);
        }
    });
    const allItems = ul.querySelectorAll(':scope > li');
    for (let i = lines.length; i < allItems.length; i += 1) {
        allItems[i].textContent = '';
    }
};

const getGlobalSectionById = (globalNode, sectionId, fallbackIndex = 0) => {
    const sections = Array.isArray(globalNode?.sections) ? globalNode.sections : [];
    return sections.find((section) => section?.id === sectionId) || sections[fallbackIndex] || null;
};

const getSectionFieldValue = (section, key, locale = 'en', fallback = '') => {
    const field = (section?.fields || []).find((item) => item?.key === key);
    if (!field) return fallback;
    return getLocalizedValue(field?.value, locale, fallback);
};

const toBool = (value, fallback = true) => {
    if (typeof value === 'boolean') return value;
    if (value === null || value === undefined || value === '') return fallback;

    const raw = String(value).trim().toLowerCase();
    if (['1', 'true', 'yes', 'on'].includes(raw)) return true;
    if (['0', 'false', 'no', 'off'].includes(raw)) return false;

    const numeric = Number(raw);
    if (Number.isFinite(numeric)) return numeric !== 0;
    return fallback;
};

const toDisplayPosition = (value, fallback = 0) => {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : fallback;
};

const toLines = (value) => builderValueToLines(value);

const buildOrderedLinkItems = ({ titles, links, statuses, positions }) => {
    const max = Math.max(titles.length, links.length, statuses.length, positions.length, 0);
    return Array.from({ length: max })
        .map((_, index) => ({
            title: String(titles[index] || '').trim(),
            link: String(links[index] || '').trim(),
            show: toBool(statuses[index], true),
            position: toDisplayPosition(positions[index], index + 1),
        }))
        .filter((item) => item.title || item.link)
        .sort((a, b) => a.position - b.position);
};

const buildOrderedImageItems = ({ images, links, statuses, positions }) => {
    const max = Math.max(images.length, links.length, statuses.length, positions.length, 0);
    return Array.from({ length: max })
        .map((_, index) => ({
            image: String(images[index] || '').trim(),
            link: String(links[index] || '#').trim() || '#',
            show: toBool(statuses[index], true),
            position: toDisplayPosition(positions[index], index + 1),
        }))
        .filter((item) => item.image)
        .sort((a, b) => a.position - b.position);
};

const buildOrderedSocialItems = ({ platforms, icons, urls, statuses, positions }) => {
    const max = Math.max(platforms.length, icons.length, urls.length, statuses.length, positions.length, 0);
    return Array.from({ length: max })
        .map((_, index) => {
            const platform = String(platforms[index] || '').trim();
            const icon = String(icons[index] || '').trim();
            const url = String(urls[index] || '#').trim() || '#';
            if (!platform && !icon && !url) return null;
            return {
                platform,
                icon,
                url,
                show: toBool(statuses[index], true),
                position: toDisplayPosition(positions[index], index + 1),
            };
        })
        .filter(Boolean)
        .sort((a, b) => a.position - b.position);
};

const ensureLinkList = (listNode, items) => {
    if (!listNode) return;
    const existingItems = Array.from(listNode.querySelectorAll(':scope > li'));

    items.forEach((item, index) => {
        const li = existingItems[index] || document.createElement('li');
        if (!existingItems[index]) listNode.appendChild(li);

        let link = li.querySelector('a');
        if (!link) {
            li.innerHTML = '';
            link = document.createElement('a');
            li.appendChild(link);
        }

        link.textContent = item.title || item.link || '';
        if (item.link) link.setAttribute('href', item.link);
        li.style.display = item.show ? '' : 'none';
    });

    existingItems.slice(items.length).forEach((node) => node.remove());
};

const ensureInstagramList = (galleryNode, items) => {
    if (!galleryNode) return;
    const existingItems = Array.from(galleryNode.querySelectorAll(':scope > a'));

    items.forEach((item, index) => {
        const anchor = existingItems[index] || document.createElement('a');
        if (!existingItems[index]) galleryNode.appendChild(anchor);
        anchor.setAttribute('href', item.link || '#');
        anchor.style.display = item.show ? '' : 'none';

        let image = anchor.querySelector('img');
        if (!image) {
            image = document.createElement('img');
            anchor.appendChild(image);
        }
        image.setAttribute('src', item.image);
        image.setAttribute('alt', '');
    });

    existingItems.slice(items.length).forEach((node) => node.remove());
};

const resolveSocialIconClass = (iconValue, platformValue) => {
    const normalizedIcon = String(iconValue || '').trim().toLowerCase();
    const normalizedPlatform = String(platformValue || '').trim().toLowerCase();

    if (normalizedIcon.startsWith('ri-')) return normalizedIcon;

    const known = {
        facebook: 'ri-facebook-line',
        twitter: 'ri-twitter-line',
        x: 'ri-twitter-x-line',
        instagram: 'ri-instagram-line',
        linkedin: 'ri-linkedin-line',
        youtube: 'ri-youtube-line',
        tiktok: 'ri-tiktok-line',
    };

    return known[normalizedIcon] || known[normalizedPlatform] || 'ri-global-line';
};

const ensureSocialList = (listNode, items) => {
    if (!listNode) return;
    const existingItems = Array.from(listNode.querySelectorAll(':scope > li'));

    items.forEach((item, index) => {
        const li = existingItems[index] || document.createElement('li');
        if (!existingItems[index]) listNode.appendChild(li);

        let link = li.querySelector('a');
        if (!link) {
            li.innerHTML = '';
            link = document.createElement('a');
            link.setAttribute('target', '_blank');
            link.setAttribute('rel', 'noreferrer');
            li.appendChild(link);
        }
        link.setAttribute('href', item.url || '#');
        link.setAttribute('aria-label', item.platform || 'Social link');

        let iconNode = link.querySelector('i');
        if (!iconNode) {
            iconNode = document.createElement('i');
            link.appendChild(iconNode);
        }
        iconNode.className = resolveSocialIconClass(item.icon, item.platform);
        li.style.display = item.show ? '' : 'none';
    });

    existingItems.slice(items.length).forEach((node) => node.remove());
};

const ensureFooterLegalBlock = (footerNode) => {
    if (!footerNode) return null;
    const quickLinksWidget = footerNode.querySelector('.footer-menu')?.closest('.footer-widget');
    if (!quickLinksWidget) return null;

    let legalBlock = quickLinksWidget.querySelector('.ckam-footer-legal-block');
    if (!legalBlock) {
        legalBlock = document.createElement('div');
        legalBlock.className = 'ckam-footer-legal-block mt-4';

        const titleNode = document.createElement('h3');
        titleNode.className = 'footer-widget-title';
        titleNode.setAttribute('data-preview-footer', 'legal-title');

        const listNode = document.createElement('ul');
        listNode.className = 'footer-menu list-style ckam-footer-legal-menu';

        legalBlock.appendChild(titleNode);
        legalBlock.appendChild(listNode);
        quickLinksWidget.appendChild(legalBlock);
    }

    return {
        block: legalBlock,
        titleNode: legalBlock.querySelector('[data-preview-footer="legal-title"]'),
        listNode: legalBlock.querySelector('.ckam-footer-legal-menu'),
    };
};

const applyFooterGlobalData = (footerNode, footerGlobalNode, locale = 'en') => {
    if (!footerNode || !footerGlobalNode) return;

    const footerMainSection = getGlobalSectionById(footerGlobalNode, 'footer-main', 0);
    const footerLinksSection = getGlobalSectionById(footerGlobalNode, 'footer-links', 1);
    const footerSocialSection = getGlobalSectionById(footerGlobalNode, 'footer-social', 2);
    if (!footerMainSection) return;

    footerNode.style.display = getSectionShow(footerMainSection) ? '' : 'none';
    if (footerNode.style.display === 'none') return;

    const footerLogo = String(getSectionFieldValue(footerMainSection, 'footerLogo', locale, '') || '').trim();
    const brandName = String(getSectionFieldValue(footerMainSection, 'brandName', locale, '') || '').trim();
    const description = String(getSectionFieldValue(footerMainSection, 'description', locale, '') || '').trim();
    const newsletterPlaceholder = String(
        getSectionFieldValue(footerMainSection, 'newsletterPlaceholder', locale, '')
    ).trim();
    const newsletterButtonText = String(
        getSectionFieldValue(footerMainSection, 'newsletterButtonText', locale, '')
    ).trim();
    const quickLinksTitle = String(getSectionFieldValue(footerMainSection, 'quickLinksTitle', locale, '') || '').trim();
    const legalTitle = String(getSectionFieldValue(footerMainSection, 'legalTitle', locale, '') || '').trim();
    const instagramTitle = String(getSectionFieldValue(footerMainSection, 'instagramTitle', locale, '') || '').trim();
    const contactTitle = String(getSectionFieldValue(footerMainSection, 'contactTitle', locale, '') || '').trim();
    const location = String(getSectionFieldValue(footerMainSection, 'location', locale, '') || '').trim();
    const phone = String(getSectionFieldValue(footerMainSection, 'phone', locale, '') || '').trim();
    const email = String(getSectionFieldValue(footerMainSection, 'email', locale, '') || '').trim();
    const copyright = String(getSectionFieldValue(footerMainSection, 'copyright', locale, '') || '').trim();

    const showNewsletter = toBool(getSectionFieldValue(footerMainSection, 'showNewsletter', locale, true), true);
    const showQuickLinks = toBool(getSectionFieldValue(footerMainSection, 'showQuickLinks', locale, true), true);
    const showLegalLinks = toBool(getSectionFieldValue(footerMainSection, 'showLegalLinks', locale, true), true);
    const showInstagram = toBool(getSectionFieldValue(footerMainSection, 'showInstagram', locale, true), true);
    const showContactInfo = toBool(getSectionFieldValue(footerMainSection, 'showContactInfo', locale, true), true);
    const showSocialLinksField = toBool(getSectionFieldValue(footerMainSection, 'showSocialLinks', locale, true), true);
    const showSocialLinks = showSocialLinksField && getSectionShow(footerSocialSection);

    const quickLinksItems = buildOrderedLinkItems({
        titles: toLines(getSectionFieldValue(footerLinksSection, 'quickLinksTitles', locale, [])),
        links: toLines(getSectionFieldValue(footerLinksSection, 'quickLinksLinks', locale, [])),
        statuses: toLines(getSectionFieldValue(footerLinksSection, 'quickLinksStatuses', locale, [])),
        positions: toLines(getSectionFieldValue(footerLinksSection, 'quickLinksPositions', locale, [])),
    });
    const legalLinksItems = buildOrderedLinkItems({
        titles: toLines(getSectionFieldValue(footerLinksSection, 'legalLinksTitles', locale, [])),
        links: toLines(getSectionFieldValue(footerLinksSection, 'legalLinksLinks', locale, [])),
        statuses: toLines(getSectionFieldValue(footerLinksSection, 'legalLinksStatuses', locale, [])),
        positions: toLines(getSectionFieldValue(footerLinksSection, 'legalLinksPositions', locale, [])),
    });
    const instagramItems = buildOrderedImageItems({
        images: toLines(getSectionFieldValue(footerLinksSection, 'instagramImages', locale, [])),
        links: toLines(getSectionFieldValue(footerLinksSection, 'instagramLinks', locale, [])),
        statuses: toLines(getSectionFieldValue(footerLinksSection, 'instagramStatuses', locale, [])),
        positions: toLines(getSectionFieldValue(footerLinksSection, 'instagramPositions', locale, [])),
    });
    const socialItems = buildOrderedSocialItems({
        platforms: toLines(getSectionFieldValue(footerSocialSection, 'socialPlatforms', locale, [])),
        icons: toLines(getSectionFieldValue(footerSocialSection, 'socialIcons', locale, [])),
        urls: toLines(getSectionFieldValue(footerSocialSection, 'socialUrls', locale, [])),
        statuses: toLines(getSectionFieldValue(footerSocialSection, 'socialStatuses', locale, [])),
        positions: toLines(getSectionFieldValue(footerSocialSection, 'socialPositions', locale, [])),
    });

    const logoNode = footerNode.querySelector('.footer-logo img');
    if (logoNode && footerLogo) {
        logoNode.setAttribute('src', footerLogo);
    }
    if (logoNode && brandName) {
        logoNode.setAttribute('alt', brandName);
    }

    setNodeText(footerNode.querySelector('.comp-desc'), description);
    const newsletterInput = footerNode.querySelector('.newsletter-form input[type="email"]');
    if (newsletterInput && newsletterPlaceholder) {
        newsletterInput.setAttribute('placeholder', newsletterPlaceholder);
    }
    setNodeText(footerNode.querySelector('.newsletter-form button'), newsletterButtonText);

    const quickLinksTitleNode = footerNode.querySelector('.footer-menu')?.closest('.footer-widget')?.querySelector('.footer-widget-title');
    setNodeText(quickLinksTitleNode, quickLinksTitle);

    const instagramTitleNode = footerNode.querySelector('.insta-gallery')?.closest('.footer-widget')?.querySelector('.footer-widget-title');
    setNodeText(instagramTitleNode, instagramTitle);

    const contactTitleNode = footerNode.querySelector('.contact-info')?.closest('.footer-widget')?.querySelector('.footer-widget-title');
    setNodeText(contactTitleNode, contactTitle);

    const contactAddressNode = footerNode.querySelector('.contact-info li:nth-child(1) p');
    setNodeText(contactAddressNode, location);

    const phoneNode = footerNode.querySelector('.contact-info li:nth-child(2) a');
    setNodeText(phoneNode, phone);
    if (phoneNode && phone) phoneNode.setAttribute('href', `tel:${phone.replace(/\s+/g, '')}`);

    const emailNode = footerNode.querySelector('.contact-info li:nth-child(3) a');
    setNodeText(emailNode, email);
    if (emailNode && email) emailNode.setAttribute('href', `mailto:${email}`);

    const copyrightNode = footerNode.querySelector('.copyright-text');
    if (copyrightNode && copyright) {
        copyrightNode.innerHTML = '';
        const iconNode = document.createElement('i');
        iconNode.className = 'ri-copyright-line';
        copyrightNode.appendChild(iconNode);
        copyrightNode.appendChild(document.createTextNode(` ${copyright}`));
    } else if (!copyright && brandName) {
        const brandNode = footerNode.querySelector('.copyright-text span');
        if (brandNode) brandNode.textContent = brandName;
    }

    ensureLinkList(footerNode.querySelector('.footer-menu'), quickLinksItems);
    ensureInstagramList(footerNode.querySelector('.insta-gallery'), instagramItems);
    ensureSocialList(footerNode.querySelector('.social-profile'), socialItems);

    const legalBlock = ensureFooterLegalBlock(footerNode);
    if (legalBlock?.titleNode && legalTitle) {
        legalBlock.titleNode.textContent = legalTitle;
    }
    ensureLinkList(legalBlock?.listNode, legalLinksItems);
    setNodeDisplay(legalBlock?.block, showLegalLinks);

    const newsletterBlock = footerNode.querySelector('.newsletter-form');
    const socialBlock = footerNode.querySelector('.social-profile');
    const quickLinksColumn = footerNode.querySelector('.footer-menu')?.closest('[class*="col-"]');
    const instagramColumn = footerNode.querySelector('.insta-gallery')?.closest('[class*="col-"]');
    const contactColumn = footerNode.querySelector('.contact-info')?.closest('[class*="col-"]');

    setNodeDisplay(newsletterBlock, showNewsletter);
    setNodeDisplay(socialBlock, showSocialLinks);
    setNodeDisplay(quickLinksColumn, showQuickLinks);
    setNodeDisplay(instagramColumn, showInstagram);
    setNodeDisplay(contactColumn, showContactInfo);
};

const applySectionData = (sectionNode, sectionData, locale = 'en') => {
    if (!sectionNode || !sectionData) return;

    const sectionId = sectionData.id || '';
    const elementValues = getSectionValues(sectionData, locale);
    const itemTitleLines = builderValueToLines(elementValues.itemsTitles);
    const itemDescriptionLines = builderValueToLines(elementValues.itemsDescriptions);
    const itemImageLines = builderValueToLines(elementValues.itemImages);
    const itemLinkLines = builderValueToLines(elementValues.itemLinks);

    // Handle visibility
    sectionNode.style.display = getSectionShow(sectionData) ? '' : 'none';

    Object.entries(elementValues).forEach(([key, value]) => applyFieldBinding(sectionNode, key, value));
    applySectionThemeStyles(sectionNode, elementValues);

    const primaryVisible = elementValues.primaryButtonShow !== false;
    const secondaryVisible = elementValues.secondaryButtonShow !== false;
    const primaryTargets = sectionNode.querySelectorAll('[data-builder-button="primary"]');
    const secondaryTargets = sectionNode.querySelectorAll('[data-builder-button="secondary"]');
    primaryTargets.forEach((node) => setNodeDisplay(node, primaryVisible));
    secondaryTargets.forEach((node) => setNodeDisplay(node, secondaryVisible));

    // Apply eyebrow (small text above title)
    const eyebrowNode = sectionNode.querySelector('.eyebrow, .section-eyebrow, [data-element="eyebrow"]');
    if (eyebrowNode && typeof elementValues.eyebrow === 'string' && elementValues.eyebrow.trim()) {
        eyebrowNode.textContent = elementValues.eyebrow;
    }

    const headingNode = sectionNode.querySelector('h1, h2, h3, h4, h5, h6');
    if (headingNode && typeof elementValues.title === 'string' && elementValues.title.trim()) {
        headingNode.textContent = elementValues.title;
    }

    const boundSubtitle = sectionNode.querySelector('[data-builder-field="subtitle"]');
    const boundDescription = sectionNode.querySelector('[data-builder-field="description"]');
    const paragraphNodes = Array.from(sectionNode.querySelectorAll('p'));
    if (!boundSubtitle && paragraphNodes[0] && typeof elementValues.subtitle === 'string' && elementValues.subtitle.trim()) {
        paragraphNodes[0].textContent = elementValues.subtitle;
    }
    if (!boundDescription) {
        if (paragraphNodes[1] && typeof elementValues.description === 'string' && elementValues.description.trim()) {
            paragraphNodes[1].textContent = elementValues.description;
        } else if (paragraphNodes[0] && !elementValues.subtitle && typeof elementValues.description === 'string' && elementValues.description.trim()) {
            paragraphNodes[0].textContent = elementValues.description;
        }
    }

    const descriptionLines = builderValueToLines(elementValues.description);
    applyDescriptionLinesToLists(sectionNode, descriptionLines);

    if (sectionId === 'difference-extra') {
        applyMultilineToListItemSpans(sectionNode, descriptionLines, '.difference-list li > span:first-child');
    } else if (sectionId === 'cta' && sectionNode.querySelector('.outcomes-list')) {
        applyMultilineToListItemSpans(sectionNode, descriptionLines, '.outcomes-list li > span:first-child');
    }

    const highlightLines = builderValueToLines(elementValues.highlights);
    applyHighlightsToLists(sectionNode, highlightLines);

    // Apply button texts and URLs
    const actionNodes = Array.from(sectionNode.querySelectorAll('a, button')).filter((node) => {
        if (node.tagName.toLowerCase() === 'a') {
            const href = node.getAttribute('href') || '';
            return !href.startsWith('#top');
        }
        return true;
    });
    
    const resolvedPrimaryButtonText = (
        typeof elementValues.buttonText === 'string' && elementValues.buttonText.trim()
            ? elementValues.buttonText
            : elementValues.primaryButtonText
    );
    const resolvedPrimaryButtonUrl = (
        typeof elementValues.buttonLink === 'string' && elementValues.buttonLink.trim()
            ? elementValues.buttonLink
            : elementValues.primaryButtonUrl
    );

    if (actionNodes[0] && typeof resolvedPrimaryButtonText === 'string' && resolvedPrimaryButtonText.trim()) {
        actionNodes[0].textContent = resolvedPrimaryButtonText;
        if (actionNodes[0].tagName.toLowerCase() === 'a' && typeof resolvedPrimaryButtonUrl === 'string' && resolvedPrimaryButtonUrl.trim()) {
            actionNodes[0].setAttribute('href', resolvedPrimaryButtonUrl);
        }
    }
    
    if (actionNodes[1] && typeof elementValues.secondaryButtonText === 'string' && elementValues.secondaryButtonText.trim()) {
        actionNodes[1].textContent = elementValues.secondaryButtonText;
        if (actionNodes[1].tagName.toLowerCase() === 'a' && typeof elementValues.secondaryButtonUrl === 'string' && elementValues.secondaryButtonUrl.trim()) {
            actionNodes[1].setAttribute('href', elementValues.secondaryButtonUrl);
        }
    }

    const boundImage = sectionNode.querySelector('img[data-builder-field="image"]');
    const imageNode = boundImage || sectionNode.querySelector('img');
    if (imageNode && typeof elementValues.image === 'string' && elementValues.image.trim()) {
        imageNode.setAttribute('src', elementValues.image);
        if (elementValues.title) {
            imageNode.setAttribute('alt', elementValues.title);
        }
    }

    if (sectionId === 'home_hero') {
        const heroMedia = sectionNode.querySelector('.growth-media');
        if (heroMedia && typeof elementValues.image === 'string' && elementValues.image.trim()) {
            heroMedia.style.backgroundImage = `url("${elementValues.image.trim()}")`;
        }
        applyLineValuesToNodes(Array.from(sectionNode.querySelectorAll('.growth-points li')), itemTitleLines);
    }

    if (sectionId === 'home_provide') {
        applyLineValuesToNodes(Array.from(sectionNode.querySelectorAll('.provide-item-label')), itemTitleLines);
        const mockImage = sectionNode.querySelector('.mock-gallery img');
        if (mockImage && itemImageLines[0]) {
            mockImage.setAttribute('src', itemImageLines[0]);
        }
    }

    if (sectionId === 'home_help') {
        applyLineValuesToNodes(Array.from(sectionNode.querySelectorAll('.how-pill > span')), itemTitleLines);
    }

    if (sectionId === 'home_reviews') {
        const reviewQuoteNode = sectionNode.querySelector('.testi-card p');
        const reviewAuthorNode = sectionNode.querySelector('.testi-card h5');
        if (reviewQuoteNode && itemDescriptionLines[0]) reviewQuoteNode.textContent = itemDescriptionLines[0];
        if (reviewAuthorNode && itemTitleLines[0]) reviewAuthorNode.textContent = itemTitleLines[0];
    }

    if (sectionId === 'home_faqs') {
        applyLineValuesToNodes(Array.from(sectionNode.querySelectorAll('.faq-accordion .faq-q-text')), itemTitleLines);
        applyLineValuesToNodes(Array.from(sectionNode.querySelectorAll('.faq-accordion .accordion-body')), itemDescriptionLines);
    }

    if (itemLinkLines.length) {
        const linkTargets = Array.from(sectionNode.querySelectorAll('a[data-builder-bind="href"], a.client-btn'));
        linkTargets.forEach((node, index) => {
            if (itemLinkLines[index]) node.setAttribute('href', itemLinkLines[index]);
        });
    }
};

const getPreviewSectionTargets = (pageWrapper) => {
    const mainNode = pageWrapper?.querySelector('main');
    const indexedSectionNodes = mainNode
        ? Array.from(mainNode.children).filter((node) => node.tagName?.toLowerCase?.() === 'section')
        : Array.from(pageWrapper?.querySelectorAll(':scope > section') || []);

    const annotatedNodes = Array.from(pageWrapper?.querySelectorAll('[data-builder-section]') || []);
    const sectionNodeById = new Map();
    annotatedNodes.forEach((node) => {
        const sectionId = node.getAttribute('data-builder-section')?.trim();
        if (!sectionId || sectionNodeById.has(sectionId)) return;
        sectionNodeById.set(sectionId, node);
    });

    return { indexedSectionNodes, sectionNodeById };
};

const PreviewContent = () => {
    const { pageSlug } = useParams();
    const location = useLocation();
    const { setLanguage } = useI18n();
    const query = useMemo(() => new URLSearchParams(location.search), [location.search]);
    const builderMode = query.get('builderMode') === '1';
    const compactMode = query.get('compact') === '1';
    const selectedSectionIndex = Number.parseInt(query.get('sectionIndex') || '-1', 10);
    const previewLocale = query.get('locale') === 'ar' ? 'ar' : 'en';
    const theme = query.get('theme') || 'default';
    const themePalette = useMemo(() => {
        const preset = parseThemePalette(theme);
        return {
            ...preset,
            text: query.get('text') || preset.text,
            bg: query.get('bg') || preset.bg,
            accent: query.get('accent') || preset.accent,
            buttonBg: query.get('buttonBg') || preset.buttonBg,
            buttonText: query.get('buttonText') || preset.buttonText,
        };
    }, [query, theme]);
    const PageComponent = previewPageMap[pageSlug] || PlaceholderPage;
    /** In builder mode, always mount header/footer so global edits sync on every page preview (not only /header-footer). */
    const showGlobalLayout = pageSlug === 'header-footer' || builderMode;

    usePreviewStyles();

    useEffect(() => {
        setLanguage(previewLocale);
    }, [previewLocale, setLanguage]);

    useEffect(() => {
        if (!builderMode) return undefined;

        const html = document.documentElement;
        const body = document.body;
        const prevBackground = body.style.background;
        const prevColor = body.style.color;
        const prevOverflow = body.style.overflow;
        const prevPadding = body.style.padding;
        const prevMargin = body.style.margin;

        body.style.background = themePalette.bg;
        body.style.color = themePalette.text;
        body.style.margin = '0';
        body.style.padding = compactMode ? '0' : body.style.padding;
        body.style.overflow = 'auto';

        html.style.setProperty('--builder-accent', themePalette.accent);
        html.style.setProperty('--builder-text', themePalette.text);
        html.style.setProperty('--builder-bg', themePalette.bg);
        html.style.setProperty('--builder-button-bg', themePalette.buttonBg);
        html.style.setProperty('--builder-button-text', themePalette.buttonText);

        // Preview-only: use full-width desktop canvas so page is not side-cut inside builder frame.
        const previewFullWidthStyle = document.createElement('style');
        previewFullWidthStyle.id = 'wb-preview-fullwidth-style';
        previewFullWidthStyle.textContent = `
          @media (min-width: 992px) {
            .page-wrapper,
            main,
            section {
              margin-left: 0 !important;
              margin-right: 0 !important;
              padding-left: 0 !important;
              padding-right: 0 !important;
            }

            .container,
            .container-sm,
            .container-md,
            .container-lg,
            .container-xl,
            .container-xxl {
              max-width: 100% !important;
              width: 100% !important;
              margin-left: 0 !important;
              margin-right: 0 !important;
              padding-left: 0 !important;
              padding-right: 0 !important;
            }
          }
        `;
        document.head.appendChild(previewFullWidthStyle);

        // Preview-only: disable interactive navigation/actions inside iframe
        body.setAttribute('data-ckam-builder-preview', '1');
        const previewInteractionStyle = document.createElement('style');
        previewInteractionStyle.id = 'wb-preview-interaction-style';
        previewInteractionStyle.textContent = `
          body[data-ckam-builder-preview="1"] a,
          body[data-ckam-builder-preview="1"] button,
          body[data-ckam-builder-preview="1"] [role="button"],
          body[data-ckam-builder-preview="1"] input,
          body[data-ckam-builder-preview="1"] select,
          body[data-ckam-builder-preview="1"] textarea,
          body[data-ckam-builder-preview="1"] summary,
          body[data-ckam-builder-preview="1"] .dropdown-toggle,
          body[data-ckam-builder-preview="1"] .navbar-toggler {
            pointer-events: none !important;
            cursor: default !important;
          }
        `;
        document.head.appendChild(previewInteractionStyle);

        return () => {
            body.style.background = prevBackground;
            body.style.color = prevColor;
            body.style.overflow = prevOverflow;
            body.style.padding = prevPadding;
            body.style.margin = prevMargin;
            body.removeAttribute('data-ckam-builder-preview');
            html.style.removeProperty('--builder-accent');
            html.style.removeProperty('--builder-text');
            html.style.removeProperty('--builder-bg');
            html.style.removeProperty('--builder-button-bg');
            html.style.removeProperty('--builder-button-text');
            const injectedStyle = document.getElementById('wb-preview-fullwidth-style');
            if (injectedStyle) injectedStyle.remove();
            const interactionStyle = document.getElementById('wb-preview-interaction-style');
            if (interactionStyle) interactionStyle.remove();
        };
    }, [builderMode, compactMode, themePalette]);

    useEffect(() => {
        if (!builderMode || !compactMode) return undefined;

        const hiddenNodes = [];
        const pageWrapper = document.querySelector('.page-wrapper');
        const headerNode = pageWrapper?.querySelector('header');
        const footerNode = pageWrapper?.querySelector('footer');
        const backToTop = pageWrapper?.querySelector('.back-to-top');

        [headerNode, footerNode, backToTop].forEach((node) => {
            if (!node) return;
            hiddenNodes.push([node, node.style.display]);
            node.style.display = 'none';
        });

        const mainNode = pageWrapper?.querySelector('main');
        const sectionCandidates = mainNode
            ? Array.from(mainNode.children).filter((node) => node.tagName?.toLowerCase?.() === 'section')
            : Array.from(pageWrapper?.querySelectorAll(':scope > section') || []);

        if (sectionCandidates.length > 0) {
            const focusIndex = Number.isFinite(selectedSectionIndex) && selectedSectionIndex >= 0
                ? Math.min(selectedSectionIndex, sectionCandidates.length - 1)
                : 0;

            sectionCandidates.forEach((section, index) => {
                hiddenNodes.push([section, section.style.display]);
                section.style.display = index === focusIndex ? '' : 'none';
            });

            const focused = sectionCandidates[focusIndex];
            if (focused) {
                focused.style.margin = '0';
                focused.style.paddingTop = '16px';
                focused.style.paddingBottom = '16px';
            }
        }

        return () => {
            hiddenNodes.forEach(([node, display]) => {
                node.style.display = display;
            });
        };
    }, [builderMode, compactMode, selectedSectionIndex, pageSlug]);

    useEffect(() => {
        if (!builderMode) return undefined;

        const applyLiveBuilderState = () => {
            const builderState = readBuilderStateFromStorage();
            const pageWrapper = document.querySelector('.page-wrapper');

            // Apply header/footer globals whenever builder preview is active (all routes), not only /header-footer
            if (builderMode && builderState?.globals) {
                const headerNode = pageWrapper?.querySelector('header');
                const footerNode = pageWrapper?.querySelector('footer');
                
                if (headerNode && builderState.globals.header?.sections?.[0]) {
                    const headerData = builderState.globals.header.sections[0];
                    const headerElements = {};
                    headerNode.style.display = getSectionShow(headerData) ? '' : 'none';
                    getSectionFields(headerData).forEach((field) => {
                        headerElements[field.key] = getLocalizedValue(field?.value, previewLocale, field?.value);
                    });

                    const brandNode = headerNode.querySelector('.navbar-brand, .brand-name, [data-element="brandName"]');
                    if (brandNode && headerElements.brandName) {
                        brandNode.querySelectorAll('img').forEach((img) => {
                            img.setAttribute('alt', String(headerElements.brandName));
                        });
                        const brandText = brandNode.querySelector('[data-element="brandName"]');
                        if (brandText) brandText.textContent = headerElements.brandName;
                    }

                    const logoImgs = headerNode.querySelectorAll('.navbar-brand img, .brand-logo, [data-element="brandLogo"]');
                    if (headerElements.brandLogo && String(headerElements.brandLogo).trim()) {
                        logoImgs.forEach((img) => img.setAttribute('src', String(headerElements.brandLogo).trim()));
                    }

                    const loginNode = headerNode.querySelector('.login-btn, .btn-login, [data-element="loginLabel"]');
                    if (loginNode && headerElements.loginLabel) {
                        loginNode.textContent = headerElements.loginLabel;
                        if (headerElements.loginUrl) {
                            loginNode.setAttribute('href', headerElements.loginUrl);
                        }
                    }

                    const portalNode = headerNode.querySelector('.photographer-portal-btn, [data-element="photographerPortalLabel"]');
                    if (portalNode && headerElements.photographerPortalLabel) {
                        portalNode.textContent = headerElements.photographerPortalLabel;
                    }

                    const navLabels = headerElements.navItems;
                    if (Array.isArray(navLabels) && navLabels.length) {
                        const navLinks = Array.from(headerNode.querySelectorAll('.navbar-nav .nav-link'));
                        navLabels.forEach((label, index) => {
                            if (navLinks[index] && label != null && String(label).trim()) {
                                navLinks[index].textContent = String(label);
                            }
                        });
                    }
                }

                if (footerNode && builderState.globals.footer) {
                    applyFooterGlobalData(footerNode, builderState.globals.footer, previewLocale);
                }
            }

            // Apply page section data
            const selectedPage = builderState?.pages?.find((page) => page.id === pageSlug);
            if (selectedPage) {
                const { indexedSectionNodes, sectionNodeById } = getPreviewSectionTargets(pageWrapper);
                const sections = Array.isArray(selectedPage.sections) ? selectedPage.sections : [];
                const appliedTargets = new Set();
                const appliedSections = new Set();

                // 1) First, bind sections that have an explicit DOM id match.
                sections.forEach((sectionData, index) => {
                    const sectionId = String(sectionData?.id || '').trim();
                    if (!sectionId) return;
                    const targetNode = sectionNodeById.get(sectionId);
                    if (!targetNode || appliedTargets.has(targetNode)) return;
                    appliedTargets.add(targetNode);
                    appliedSections.add(index);
                    applySectionData(targetNode, sectionData, previewLocale);
                });

                // 2) Then, bind the remaining sections by order as a fallback.
                let fallbackCursor = 0;
                sections.forEach((sectionData, index) => {
                    if (appliedSections.has(index)) return;
                    while (fallbackCursor < indexedSectionNodes.length && appliedTargets.has(indexedSectionNodes[fallbackCursor])) {
                        fallbackCursor += 1;
                    }
                    const targetNode = indexedSectionNodes[fallbackCursor];
                    if (!targetNode || appliedTargets.has(targetNode)) return;
                    appliedTargets.add(targetNode);
                    fallbackCursor += 1;
                    applySectionData(targetNode, sectionData, previewLocale);
                });
            }
        };

        applyLiveBuilderState();
        const onStorage = (event) => {
            if (!isBuilderStorageKey(event.key)) return;
            requestAnimationFrame(applyLiveBuilderState);
        };
        window.addEventListener('storage', onStorage);
        const onMessage = (event) => {
            if (event.origin !== window.location.origin) return;
            if (event.data?.type !== 'CKAM_BUILDER_SYNC') return;
            persistBuilderStateToStorage(event.data.payload);
            requestAnimationFrame(applyLiveBuilderState);
        };
        window.addEventListener('message', onMessage);

        return () => {
            window.removeEventListener('storage', onStorage);
            window.removeEventListener('message', onMessage);
        };
    }, [builderMode, pageSlug, previewLocale]);

    return (
        <div className="page-wrapper">
            <ThemeSwitcher />
            {showGlobalLayout ? <Header /> : null}
            {PageComponent === PlaceholderPage ? <PlaceholderPage fallback="Preview page not found" /> : <PageComponent />}
            {showGlobalLayout ? <Footer /> : null}
            <a href="#top" className="back-to-top bounce" aria-label="Back to top">
                <i className="ri-arrow-up-s-line" />
            </a>
        </div>
    );
};

const WebsiteBuilderPreviewRouter = () => (
    <I18nProvider>
        <PreviewContent />
    </I18nProvider>
);

export default WebsiteBuilderPreviewRouter;
