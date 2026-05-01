// Internationalization (i18n) System for Povi Website
class I18n {
    constructor() {
        this.currentLanguage = localStorage.getItem('language') || 'en';
        this.translations = {};
        this.inlineTranslations = (typeof window !== 'undefined' && window.__I18N_INLINE__) ? window.__I18N_INLINE__ : {};
        this.init();
    }

    async init() {
        await this.loadTranslations(this.currentLanguage);
        
        // Wait a bit for DOM to be fully ready
        setTimeout(() => {
            this.applyTranslations();
            this.setupLanguageSwitcher();
            this.updateLanguageAttribute();
            this.updateLanguageSwitcher();
            this.applyDirection();
        }, 100);
    }

    async loadTranslations(lang) {
        const inlineBundle = this.inlineTranslations && this.inlineTranslations[lang] ? this.inlineTranslations[lang] : null;
        const onFileProtocol = (typeof window !== 'undefined' && window.location && window.location.protocol === 'file:');
        if (onFileProtocol && inlineBundle) {
            this.translations = JSON.parse(JSON.stringify(inlineBundle));
            return;
        }

        try {
            const response = await fetch(`locales/${lang}.json`, { cache: 'no-store' });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.translations = await response.json();
            if (inlineBundle) {
                this.translations = this.deepMerge(this.translations, inlineBundle);
            }
        } catch (error) {
            console.error('Error loading translations:', error);
            if (inlineBundle) {
                this.translations = JSON.parse(JSON.stringify(inlineBundle));
                return;
            }
            // Fallback to English if translation file fails to load
            if (lang !== 'en') {
                await this.loadTranslations('en');
            }
        }
    }

    deepMerge(target, source) {
        const out = target && typeof target === 'object' ? target : {};
        Object.keys(source || {}).forEach((key) => {
            const srcVal = source[key];
            const tgtVal = out[key];
            if (
                srcVal &&
                typeof srcVal === 'object' &&
                !Array.isArray(srcVal) &&
                tgtVal &&
                typeof tgtVal === 'object' &&
                !Array.isArray(tgtVal)
            ) {
                out[key] = this.deepMerge(tgtVal, srcVal);
            } else if (srcVal && typeof srcVal === 'object' && !Array.isArray(srcVal)) {
                out[key] = this.deepMerge({}, srcVal);
            } else {
                out[key] = srcVal;
            }
        });
        return out;
    }

    translate(key) {
        const keys = key.split('.');
        let value = this.translations;
        
        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                return key; // Return key if translation not found
            }
        }
        
        return value || key;
    }

    applyTranslations() {
        // Update page title
        const titleKey = this.getPageTitleKey();
        const title = this.translate(titleKey);
        if (title && title !== titleKey) {
            document.title = title;
        }

        // Update all elements with data-i18n attribute
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.translate(key);
            
            if (translation && translation !== key) {
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    if (element.type === 'submit' || element.type === 'button') {
                        element.value = translation;
                    } else {
                        element.placeholder = translation;
                    }
                } else if (element.tagName === 'OPTION') {
                    element.textContent = translation;
                } else {
                    element.textContent = translation;
                }
            }
        });

        // Update elements with data-i18n-html attribute (for HTML content)
        const htmlElements = document.querySelectorAll('[data-i18n-html]');
        htmlElements.forEach(element => {
            const key = element.getAttribute('data-i18n-html');
            const translation = this.translate(key);
            
            if (translation && translation !== key) {
                element.innerHTML = translation;
            }
        });

        // Update elements with data-i18n-placeholder attribute
        const placeholderElements = document.querySelectorAll('[data-i18n-placeholder]');
        placeholderElements.forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            const translation = this.translate(key);
            
            if (translation && translation !== key) {
                element.placeholder = translation;
            }
        });

        // Update elements with data-i18n-value attribute
        const valueElements = document.querySelectorAll('[data-i18n-value]');
        valueElements.forEach(element => {
            const key = element.getAttribute('data-i18n-value');
            const translation = this.translate(key);
            
            if (translation && translation !== key) {
                element.value = translation;
            }
        });
    }

    getPageTitleKey() {
        const path = window.location.pathname;
        const page = path.split('/').pop().replace('.html', '') || 'index';
        
        const titleKeys = {
            'index': 'index.title',
            'features': 'features_page.title',
            'booking': 'booking.title',
            'booking-demo-2': 'booking.title',
            'contact': 'contact.title',
            'login': 'login.title',
            'register': 'register.title',
            'verify-email': 'verify_email.title',
            'forgot-password': 'forgot_password.title',
            'service-one': 'service_one.title',
            'pricing-plan': 'pricing_plan.title',
            'blogs': 'blog_page.title',
            'single-blog': 'single_blog_page.title',
            'terms-of-service': 'terms_page.title',
            'privacy-policy': 'privacy_page.title'
        };
        
        return titleKeys[page] || 'index.title';
    }

    async switchLanguage(lang) {
        this.currentLanguage = lang;
        localStorage.setItem('language', lang);
        
        await this.loadTranslations(lang);
        this.applyTranslations();
        this.updateLanguageAttribute();
        this.updateLanguageSwitcher();
        this.applyDirection();
    }

    applyDirection() {
        if (this.currentLanguage === 'ar') {
            document.documentElement.setAttribute('dir', 'rtl');
            document.body.classList.add('rtl');
        } else {
            document.documentElement.setAttribute('dir', 'ltr');
            document.body.classList.remove('rtl');
        }
    }

    updateLanguageAttribute() {
        document.documentElement.setAttribute('lang', this.currentLanguage);
    }

    setupLanguageSwitcher() {
        const switcher = document.getElementById('language-switcher');
        const selector = document.querySelector('.language-selector');
        const options = document.querySelectorAll('.language-option');
        
        if (switcher && selector) {
            // Toggle dropdown
            switcher.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                selector.classList.toggle('active');
            });
            
            // Handle language option clicks
            options.forEach(option => {
                option.addEventListener('click', async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const lang = option.getAttribute('data-lang');
                    selector.classList.remove('active');
                    await this.switchLanguage(lang);
                });
            });
            
            // Close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                if (!selector.contains(e.target)) {
                    selector.classList.remove('active');
                }
            });
        } else {
            console.error('Language switcher not found!');
        }
    }
    updateLanguageSwitcher() {
        const switcher = document.getElementById('language-switcher');
        if (switcher) {
            const flag = switcher.querySelector('.language-flag');
            const text = switcher.querySelector('.language-text');
            
            if (this.currentLanguage === 'ar') {
                if (flag) flag.textContent = 'AR';
                if (text) text.textContent = '\u0627\u0644\u0639\u0631\u0628\u064a\u0629';
                if (switcher) switcher.setAttribute('title', 'Switch to English');
            } else {
                if (flag) flag.textContent = 'EN';
                if (text) text.textContent = 'English';
                if (switcher) switcher.setAttribute('title', 'Switch to Arabic');
            }
        }
    }

    // Helper method to format translations with variables
    t(key, variables = {}) {
        let translation = this.translate(key);
        
        // Replace variables in translation string
        Object.keys(variables).forEach(varKey => {
            translation = translation.replace(`{{${varKey}}}`, variables[varKey]);
        });
        
        return translation;
    }
}

// Initialize i18n when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing i18n...');
    window.i18n = new I18n();
    console.log('i18n initialized:', window.i18n);
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = I18n;
}

