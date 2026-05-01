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

const applyFieldBinding = (sectionNode, key, value) => {
    const targets = Array.from(sectionNode.querySelectorAll(`[data-builder-field="${key}"]`));
    targets.forEach((node) => {
        const bindType = node.getAttribute('data-builder-bind') || 'text';
        if (bindType === 'html') setNodeHtml(node, value);
        if (bindType === 'text') setNodeText(node, value);
        if (bindType === 'href') setNodeHref(node, value);
        if (bindType === 'src') setNodeSrc(node, value);
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

const applySectionData = (sectionNode, sectionData, locale = 'en') => {
    if (!sectionNode || !sectionData) return;

    const sectionId = sectionData.id || '';
    const elementValues = getSectionValues(sectionData, locale);

    // Handle visibility
    sectionNode.style.display = getSectionShow(sectionData) ? '' : 'none';

    Object.entries(elementValues).forEach(([key, value]) => applyFieldBinding(sectionNode, key, value));

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
    
    if (actionNodes[0] && typeof elementValues.primaryButtonText === 'string' && elementValues.primaryButtonText.trim()) {
        actionNodes[0].textContent = elementValues.primaryButtonText;
        if (actionNodes[0].tagName.toLowerCase() === 'a' && typeof elementValues.primaryButtonUrl === 'string' && elementValues.primaryButtonUrl.trim()) {
            actionNodes[0].setAttribute('href', elementValues.primaryButtonUrl);
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

        return () => {
            body.style.background = prevBackground;
            body.style.color = prevColor;
            body.style.overflow = prevOverflow;
            body.style.padding = prevPadding;
            body.style.margin = prevMargin;
            html.style.removeProperty('--builder-accent');
            html.style.removeProperty('--builder-text');
            html.style.removeProperty('--builder-bg');
            html.style.removeProperty('--builder-button-bg');
            html.style.removeProperty('--builder-button-text');
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

                if (footerNode && builderState.globals.footer?.sections?.[0]) {
                    applySectionData(footerNode, builderState.globals.footer.sections[0], previewLocale);
                }
            }

            // Apply page section data
            const selectedPage = builderState?.pages?.find((page) => page.id === pageSlug);
            if (selectedPage) {
                const { indexedSectionNodes, sectionNodeById } = getPreviewSectionTargets(pageWrapper);
                const appliedTargets = new Set();

                (selectedPage.sections || []).forEach((sectionData, index) => {
                    const targetNode = sectionNodeById.get(sectionData.id) || indexedSectionNodes[index];
                    if (!targetNode || appliedTargets.has(targetNode)) return;
                    appliedTargets.add(targetNode);
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
