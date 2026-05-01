export const b = (en, ar) => ({ en, ar });

export const websiteBuilderPages = [
  {
    slug: 'header-footer',
    previewSlug: 'home',
    file: 'websitebuilder/src/components/Header.jsx + websitebuilder/src/components/Footer.jsx',
    routePath: '/shared-layout',
    label: b('Header & Footer', 'الهيدر والفوتر'),
    summary: b(
      'Manage global header and footer content shared across all public pages.',
      'Manage global header and footer content shared across all public pages.'
    ),
    primaryCta: b('Primary Action', 'Primary Action'),
    secondaryCta: b('Secondary Action', 'Secondary Action'),
    sections: [
      { key: 'header', label: b('Header', 'Header') },
      { key: 'footer', label: b('Footer', 'Footer') },
    ],
  },
  {
    slug: 'home',
    file: 'websitebuilder/src/pages/HomePage.jsx',
    routePath: '/',
    label: b('Home Page', 'الصفحة الرئيسية'),
    summary: b(
      'Control the landing story, hero messaging, and key conversion sections.',
      'Control the landing story, hero messaging, and key conversion sections.'
    ),
    primaryCta: b('Book Now', 'Book Now'),
    secondaryCta: b('Explore Features', 'Explore Features'),
    sections: [
      { key: 'hero', label: b('Hero Banner', 'Hero Banner') },
      { key: 'growth', label: b('Growth Section', 'Growth Section') },
      { key: 'services', label: b('Services Section', 'Services Section') },
      { key: 'faq', label: b('FAQ Section', 'FAQ Section') },
    ],
  },
  {
    slug: 'features',
    file: 'websitebuilder/src/pages/FeaturesPage.jsx',
    routePath: '/features',
    label: b('Features Page', 'صفحة المزايا'),
    summary: b(
      'Manage the product feature narrative, value pillars, and feature highlights.',
      'Manage the product feature narrative, value pillars, and feature highlights.'
    ),
    primaryCta: b('Get Started', 'Get Started'),
    secondaryCta: b('View Pricing', 'View Pricing'),
    sections: [
      { key: 'hero', label: b('Hero Banner', 'Hero Banner') },
      { key: 'featureGrid', label: b('Feature Grid', 'Feature Grid') },
      { key: 'workflow', label: b('Workflow Section', 'Workflow Section') },
      { key: 'cta', label: b('Call To Action', 'Call To Action') },
    ],
  },
  {
    slug: 'pricing',
    file: 'websitebuilder/src/pages/PricingPage.jsx',
    routePath: '/pricing',
    label: b('Pricing Page', 'صفحة التسعير'),
    summary: b(
      'Shape package positioning, pricing copy, and plan comparison details.',
      'Shape package positioning, pricing copy, and plan comparison details.'
    ),
    primaryCta: b('Start Free Trial', 'Start Free Trial'),
    secondaryCta: b('Compare Plans', 'Compare Plans'),
    sections: [
      { key: 'hero', label: b('Hero Banner', 'Hero Banner') },
      { key: 'plans', label: b('Plans Section', 'Plans Section') },
      { key: 'features', label: b('Included Features', 'Included Features') },
      { key: 'faq', label: b('FAQ Section', 'FAQ Section') },
    ],
  },
  {
    slug: 'blogs',
    file: 'websitebuilder/src/pages/BlogsPage.jsx',
    routePath: '/blogs',
    label: b('Blogs Page', 'صفحة المدونة'),
    summary: b(
      'Edit blog index messaging, highlight cards, and content discoverability cues.',
      'Edit blog index messaging, highlight cards, and content discoverability cues.'
    ),
    primaryCta: b('Read Articles', 'Read Articles'),
    secondaryCta: b('Start Free', 'Start Free'),
    sections: [
      { key: 'hero', label: b('Hero Section', 'Hero Section') },
      { key: 'blogGrid', label: b('Blog Grid', 'Blog Grid') },
      { key: 'categories', label: b('Categories', 'Categories') },
      { key: 'newsletter', label: b('Newsletter CTA', 'Newsletter CTA') },
    ],
  },
  {
    slug: 'single-blog',
    file: 'websitebuilder/src/pages/SingleBlogPage.jsx',
    routePath: '/single-blog',
    label: b('Single Blog Page', 'صفحة المقالة المفردة'),
    summary: b(
      'Control article page storytelling, content blocks, and related-post experience.',
      'Control article page storytelling, content blocks, and related-post experience.'
    ),
    primaryCta: b('Explore More Blogs', 'Explore More Blogs'),
    secondaryCta: b('Go To Pricing', 'Go To Pricing'),
    sections: [
      { key: 'hero', label: b('Article Hero', 'Article Hero') },
      { key: 'content', label: b('Article Content', 'Article Content') },
      { key: 'sidebar', label: b('Sidebar', 'Sidebar') },
      { key: 'related', label: b('Related Posts', 'Related Posts') },
    ],
  },
  {
    slug: 'contact',
    file: 'websitebuilder/src/pages/ContactPage.jsx',
    routePath: '/contact',
    label: b('Contact Page', 'صفحة التواصل'),
    summary: b(
      'Manage inquiry messaging, contact details, and trust signals for conversion.',
      'Manage inquiry messaging, contact details, and trust signals for conversion.'
    ),
    primaryCta: b('Send Message', 'Send Message'),
    secondaryCta: b('Book Consultation', 'Book Consultation'),
    sections: [
      { key: 'hero', label: b('Hero Banner', 'Hero Banner') },
      { key: 'contactInfo', label: b('Contact Details', 'Contact Details') },
      { key: 'form', label: b('Inquiry Form', 'Inquiry Form') },
      { key: 'faq', label: b('FAQ Section', 'FAQ Section') },
    ],
  },
  {
    slug: 'booking',
    file: 'websitebuilder/src/pages/BookingPage.jsx',
    routePath: '/booking',
    label: b('Booking Page', 'صفحة الحجز'),
    summary: b(
      'Edit the booking journey, service cards, and appointment conversion sections.',
      'Edit the booking journey, service cards, and appointment conversion sections.'
    ),
    primaryCta: b('Confirm Booking', 'Confirm Booking'),
    secondaryCta: b('View Packages', 'View Packages'),
    sections: [
      { key: 'hero', label: b('Hero Banner', 'Hero Banner') },
      { key: 'services', label: b('Service Cards', 'Service Cards') },
      { key: 'bookingForm', label: b('Booking Form', 'Booking Form') },
      { key: 'reviews', label: b('Reviews', 'Reviews') },
    ],
  },
  {
    slug: 'terms-of-service',
    file: 'websitebuilder/src/pages/TermsPage.jsx',
    routePath: '/terms-of-service',
    label: b('Terms Of Service', 'شروط الخدمة'),
    summary: b(
      'Maintain legal terms copy and policy clarity for customer-facing compliance.',
      'Maintain legal terms copy and policy clarity for customer-facing compliance.'
    ),
    primaryCta: b('Review Terms', 'Review Terms'),
    secondaryCta: b('Contact Support', 'Contact Support'),
    sections: [
      { key: 'hero', label: b('Page Header', 'Page Header') },
      { key: 'content', label: b('Policy Content', 'Policy Content') },
    ],
  },
  {
    slug: 'privacy-policy',
    file: 'websitebuilder/src/pages/PrivacyPage.jsx',
    routePath: '/privacy-policy',
    label: b('Privacy Policy', 'سياسة الخصوصية'),
    summary: b(
      'Control privacy disclosures and policy wording shown to all visitors.',
      'Control privacy disclosures and policy wording shown to all visitors.'
    ),
    primaryCta: b('Review Policy', 'Review Policy'),
    secondaryCta: b('Contact Support', 'Contact Support'),
    sections: [
      { key: 'hero', label: b('Page Header', 'Page Header') },
      { key: 'content', label: b('Policy Content', 'Policy Content') },
    ],
  },
];

export const websiteBuilderPagesBySlug = Object.fromEntries(
  websiteBuilderPages.map((page) => [page.slug, page])
);

export const getWebsiteBuilderPage = (slug) => websiteBuilderPagesBySlug[slug] || null;

export const getWebsiteBuilderPreviewPath = (page) => `/website-builder-preview/${page.previewSlug || page.slug}`;

export const getWebsiteBuilderStorageKey = (slug) => `ckam-website-builder:${slug}`;

const buildDefaultSectionContent = (section) => ({
  eyebrow: b('Section eyebrow', 'Section eyebrow'),
  title: { ...section.label },
  subtitle: b('Section subtitle', 'Section subtitle'),
  description: b('Section description', 'Section description'),
  primaryButton: b('Primary button', 'Primary button'),
  primaryLink: '',
  secondaryButton: b('Secondary button', 'Secondary button'),
  secondaryLink: '',
  mediaUrl: '',
  mediaAlt: b('Section media', 'Section media'),
  highlights: b('Point one\nPoint two', 'Point one\nPoint two'),
});

export const getWebsiteBuilderDefaultState = (page) => ({
  pageLabel: { ...page.label },
  pageSummary: { ...page.summary },
  routePath: page.routePath,
  status: 'live',
  primaryCta: { ...page.primaryCta },
  secondaryCta: { ...page.secondaryCta },
  seoTitle: {
    en: `${page.label.en} | CKAM`,
    ar: `${page.label.ar} | CKAM`,
  },
  seoDescription: { ...page.summary },
  notes: {
    en: `Builder connected to React preview route: /website-builder-preview/${page.previewSlug || page.slug}`,
    ar: `Builder connected to React preview route: /website-builder-preview/${page.previewSlug || page.slug}`,
  },
  visibility: Object.fromEntries(page.sections.map((section) => [section.key, true])),
  sectionsContent: Object.fromEntries(
    page.sections.map((section) => [section.key, buildDefaultSectionContent(section)])
  ),
});
