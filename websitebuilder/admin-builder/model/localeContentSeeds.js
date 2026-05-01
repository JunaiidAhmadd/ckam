import enLocale from '../../public/locales/en.json';
import arLocale from '../../public/locales/ar.json';
import {
  isLocalizedValue,
  normalizeFieldValue,
} from './schema';

const getByPath = (obj, path) => {
  if (!obj || !path) return undefined;
  return path.split('.').reduce((acc, key) => (acc == null ? undefined : acc[key]), obj);
};

const pickString = (bundle, path) => {
  const v = getByPath(bundle, path);
  if (v === undefined || v === null) return '';
  if (typeof v === 'object') return '';
  return String(v);
};

/**
 * @param {typeof enLocale} en
 * @param {typeof arLocale} ar
 * @param {string|string[]|{ concat?: string[], join?: string, listFromPaths?: string[], literal?: { en: string, ar: string } }} spec
 */
export const resolveSeedSpec = (en, ar, spec) => {
  if (spec == null) return null;
  if (typeof spec === 'string') {
    const e = pickString(en, spec);
    const a = pickString(ar, spec);
    return { en: e, ar: a || e };
  }
  if (spec.literal && typeof spec.literal === 'object') {
    return {
      en: spec.literal.en ?? '',
      ar: spec.literal.ar ?? spec.literal.en ?? '',
    };
  }
  if (Array.isArray(spec.concat) && spec.concat.length) {
    const join = spec.join ?? '\n';
    const enParts = spec.concat.map((p) => pickString(en, p)).filter(Boolean);
    const arParts = spec.concat.map((p) => pickString(ar, p)).filter(Boolean);
    const enStr = enParts.join(join);
    const arStr = (arParts.length ? arParts : enParts).join(join);
    return { en: enStr, ar: arStr };
  }
  if (Array.isArray(spec.listFromPaths) && spec.listFromPaths.length) {
    const enList = spec.listFromPaths.map((p) => pickString(en, p)).filter(Boolean);
    let arList = spec.listFromPaths.map((p) => pickString(ar, p)).filter(Boolean);
    if (!arList.length) arList = [...enList];
    return { en: enList, ar: arList };
  }
  return null;
};

const isEmptyLocalizedText = (value) => {
  if (!isLocalizedValue(value)) return true;
  const en = String(value.en ?? '').trim();
  const ar = String(value.ar ?? '').trim();
  return en === '' && ar === '';
};

const isEmptyLocalizedList = (value) => {
  if (!isLocalizedValue(value)) return true;
  const en = Array.isArray(value.en) ? value.en : [];
  const ar = Array.isArray(value.ar) ? value.ar : [];
  return en.length === 0 && ar.length === 0;
};

const shouldHydrateField = (field, value) => {
  const { type, localized } = field;
  if (type === 'toggle' || type === 'boolean' || type === 'checkbox') return false;
  if (type === 'number') return value === '' || value === null || value === undefined || Number.isNaN(Number(value));
  if (localized) {
    if (type === 'list') return isEmptyLocalizedList(value);
    return isEmptyLocalizedText(value);
  }
  if (type === 'list') {
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'string') return value.trim() === '';
    return !value;
  }
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  return false;
};

const applySeedToField = (field, spec) => {
  const resolved = resolveSeedSpec(enLocale, arLocale, spec);
  if (!resolved) return field;
  if (field.localized) {
    if (field.type === 'list') {
      const en = Array.isArray(resolved.en) ? resolved.en : [];
      const ar = Array.isArray(resolved.ar) && resolved.ar.length ? resolved.ar : [...en];
      return { ...field, value: normalizeFieldValue(field, { en, ar }) };
    }
    return {
      ...field,
      value: normalizeFieldValue(field, { en: resolved.en ?? '', ar: resolved.ar ?? '' }),
    };
  }
  if (field.type === 'list') {
    const arr = Array.isArray(resolved.en) ? resolved.en : [];
    return { ...field, value: normalizeFieldValue(field, arr) };
  }
  const scalar = resolved.en || resolved.ar || '';
  return { ...field, value: normalizeFieldValue(field, scalar) };
};

/** pageId -> sectionId -> fieldKey -> seed spec */
const PAGE_FIELD_SEEDS = {
  home: {
    hero: {
      eyebrow: 'index.hero.subtitle',
      title: 'index.sections.growth.title',
      subtitle: { concat: ['index.sections.growth.point_1', 'index.sections.growth.point_2'], join: ' · ' },
      description: {
        concat: [
          'index.sections.growth.point_1',
          'index.sections.growth.point_2',
          'index.sections.growth.point_3',
          'index.sections.growth.point_4',
        ],
        join: '\n',
      },
      primaryButtonText: 'index.sections.growth.cta',
      secondaryButtonText: 'index.sections.provide.preview_cta',
    },
    growth: {
      title: 'index.sections.provide.title',
      description: {
        concat: [
          'index.sections.provide.item_1',
          'index.sections.provide.item_2',
          'index.sections.provide.item_3',
          'index.sections.provide.item_4',
          'index.sections.provide.item_5',
        ],
        join: '\n',
      },
    },
    services: {
      title: 'index.sections.how.title',
      subtitle: 'index.sections.how.subtitle',
      description: {
        concat: [
          'index.sections.how.card_1',
          'index.sections.how.card_2',
          'index.sections.how.card_3',
          'index.sections.how.card_4',
          'index.sections.how.card_5',
          'index.sections.how.card_6',
        ],
        join: '\n',
      },
      primaryButtonText: 'index.sections.how.more',
    },
    faq: {
      title: 'index.sections.testimonials.title',
      subtitle: 'index.sections.faq.title',
      description: {
        concat: [
          'index.sections.testimonials.quote_1',
          'index.sections.testimonials.author_1',
          'index.sections.faq.q1.question',
          'index.sections.faq.q1.answer',
        ],
        join: '\n\n',
      },
      primaryButtonText: 'index.sections.testimonials.cta',
    },
  },
  features: {
    hero: {
      title: 'features_page.hero.title',
      subtitle: 'features_page.hero.subtitle',
      primaryButtonText: 'features_page.hero.cta',
    },
    'feature-grid': {
      title: 'features_page.journey.title',
      subtitle: 'features_page.journey.board.private_showcase_subtitle',
      eyebrow: 'features_page.journey.by_line',
      description: 'features_page.journey.board.private_showcase_title',
      primaryButtonText: 'features_page.journey.cta',
    },
    workflow: {
      title: 'features_page.flow.title',
      subtitle: 'features_page.flow.phone_title',
      description: 'features_page.flow.phone_sub',
      primaryButtonText: 'features_page.flow.cta',
    },
    'fields-extra': {
      title: 'features_page.fields.title',
      subtitle: 'features_page.fields.subtitle',
      description: 'features_page.fields.overlay',
      image: { literal: { en: '/assets/img/project/project-7.jpg', ar: '/assets/img/project/project-7.jpg' } },
    },
    'difference-extra': {
      title: 'features_page.difference.title',
      subtitle: 'features_page.difference.subtitle',
      description: {
        concat: [
          'features_page.difference.items.item_1',
          'features_page.difference.items.item_2',
          'features_page.difference.items.item_3',
          'features_page.difference.items.item_4',
          'features_page.difference.items.item_5',
          'features_page.difference.items.item_6',
        ],
        join: '\n',
      },
    },
    cta: {
      title: 'features_page.outcomes.title',
      description: {
        concat: [
          'features_page.outcomes.items.item_1',
          'features_page.outcomes.items.item_2',
          'features_page.outcomes.items.item_3',
          'features_page.outcomes.items.item_4',
          'features_page.outcomes.items.item_5',
          'features_page.outcomes.items.item_6',
          'features_page.outcomes.items.item_7',
          'features_page.outcomes.items.item_8',
          'features_page.outcomes.items.item_9',
        ],
        join: '\n',
      },
      primaryButtonText: 'features_page.outcomes.cta',
    },
  },
  contact: {
    hero: {
      title: 'contact.page_title',
      subtitle: 'contact.description',
      description: 'contact.description',
    },
    'contact-info': {
      title: 'contact.page_title',
      subtitle: 'contact.description',
      address: 'booking.contact.location',
      phone: { literal: { en: '+1-3454-5678-77', ar: '+1-3454-5678-77' } },
      email: { literal: { en: 'support@ckam.io', ar: 'support@ckam.io' } },
    },
    form: {
      title: 'contact.form.subject',
      subtitle: 'contact.form.message',
      agreeText: 'contact.form.agree_html',
      submitLabel: 'contact.form.send_message',
    },
  },
  booking: {
    hero: {
      title: 'booking.hero.title',
      subtitle: 'booking.hero.description',
      primaryButtonText: 'booking.hero.book_session',
      secondaryButtonText: 'booking.hero.explore_services',
    },
    'gallery-extra': {
      title: 'booking.banner.title',
      subtitle: 'booking.banner.description',
      primaryButtonText: 'booking.banner.cta',
    },
    services: {
      title: 'booking.services.title',
      subtitle: 'booking.services.description',
    },
    'about-extra': {
      title: 'booking.about.title',
      subtitle: 'booking.about.description',
      primaryButtonText: 'booking.about.start_booking',
      secondaryButtonText: 'booking.about.view_galleries',
    },
    'booking-form': {
      title: 'booking.booking.title',
      subtitle: 'booking.booking.description',
      primaryButtonText: 'booking.booking.form.confirm',
    },
    reviews: {
      title: 'booking.reviews.title',
      subtitle: 'booking.reviews.kicker',
      description: {
        concat: ['booking.reviews.review1', 'booking.reviews.review2'],
        join: '\n',
      },
    },
  },
  blogs: {
    hero: {
      eyebrow: 'blog_page.hero.kicker',
      title: 'blog_page.hero.title',
      subtitle: 'blog_page.hero.subtitle',
      primaryButtonText: 'blog_page.hero.primary_cta',
      secondaryButtonText: 'blog_page.hero.secondary_cta',
    },
    categories: {
      title: 'blog_page.categories.all',
      highlights: {
        listFromPaths: [
          'blog_page.categories.all',
          'blog_page.categories.booking',
          'blog_page.categories.client_experience',
          'blog_page.categories.marketing',
          'blog_page.categories.finance',
          'blog_page.categories.operations',
        ],
      },
    },
    'blog-grid': {
      title: 'blog_page.posts.title',
      subtitle: 'blog_page.posts.subtitle',
      highlights: {
        listFromPaths: [
          'blog_page.posts.items.p1.title',
          'blog_page.posts.items.p2.title',
          'blog_page.posts.items.p3.title',
        ],
      },
    },
    newsletter: {
      title: 'blog_page.newsletter.title',
      subtitle: 'blog_page.newsletter.subtitle',
      primaryButtonText: 'blog_page.newsletter.cta',
    },
  },
  'single-blog': {
    hero: {
      eyebrow: 'single_blog_page.hero.category',
      title: 'single_blog_page.hero.title',
      subtitle: 'single_blog_page.hero.subtitle',
    },
    content: {
      description: 'single_blog_page.article.lead',
      title: 'single_blog_page.cta.title',
      subtitle: 'single_blog_page.cta.subtitle',
      primaryButtonText: 'single_blog_page.cta.button',
      bodyHtml: {
        concat: [
          'single_blog_page.article.lead',
          'single_blog_page.article.s1.title',
          'single_blog_page.article.s1.p1',
          'single_blog_page.article.s1.p2',
          'single_blog_page.article.quote',
          'single_blog_page.article.s2.title',
          'single_blog_page.article.s2.p1',
          'single_blog_page.article.s3.title',
          'single_blog_page.article.s3.p1',
        ],
        join: '\n\n',
      },
    },
    sidebar: {
      title: 'single_blog_page.sidebar.title',
      links: {
        listFromPaths: [
          'single_blog_page.sidebar.item_1',
          'single_blog_page.sidebar.item_2',
          'single_blog_page.sidebar.item_3',
        ],
      },
    },
    related: {
      title: 'single_blog_page.related.title',
      subtitle: 'single_blog_page.related.subtitle',
    },
  },
  pricing: {
    hero: {
      title: 'pricing_plan.page_title',
      subtitle: 'pricing_plan.pro.trial_highlight',
      description: 'pricing_plan.description',
    },
    plans: {
      title: 'pricing_plan.pro.title',
      subtitle: 'pricing_plan.pro.subtitle',
      description: {
        concat: ['pricing_plan.pro.point_1', 'pricing_plan.pro.point_2'],
        join: '\n',
      },
      priceText: { literal: { en: '$39 / month', ar: '39 دولارًا / شهر' } },
      billingText: 'pricing_plan.pro.save_monthly',
      primaryButtonText: 'pricing_plan.pro.cta',
      secondaryButtonText: 'pricing_plan.pro.secondary_cta',
    },
    features: {
      title: 'pricing_plan.pro.panel_title',
      subtitle: 'pricing_plan.pro.panel_subtitle',
      description: {
        concat: [
          'pricing_plan.pro.features.f1',
          'pricing_plan.pro.features.f2',
          'pricing_plan.pro.features.f3',
          'pricing_plan.pro.features.f4',
          'pricing_plan.pro.features.f5',
        ],
        join: '\n',
      },
    },
    faq: {
      title: 'pricing_plan.pro.chip_1',
      subtitle: 'pricing_plan.pro.chip_2',
      description: {
        concat: ['pricing_plan.pro.chip_1', 'pricing_plan.pro.chip_2', 'pricing_plan.pro.chip_3'],
        join: ' · ',
      },
    },
  },
  'terms-of-service': {
    hero: {
      eyebrow: 'terms_page.kicker',
      title: 'terms_page.hero_title',
      subtitle: 'terms_page.hero_subtitle',
      description: 'terms_page.meta.updated',
    },
    content: {
      title: 'terms_page.sections.acceptance.title',
      subtitle: 'terms_page.sections.services.title',
      description: 'terms_page.intro',
      bodyHtml: {
        concat: [
          'terms_page.intro',
          'terms_page.sections.acceptance.body',
          'terms_page.sections.services.body',
          'terms_page.sections.account.title',
        ],
        join: '\n\n',
      },
    },
  },
  'privacy-policy': {
    hero: {
      eyebrow: 'privacy_page.kicker',
      title: 'privacy_page.hero_title',
      subtitle: 'privacy_page.hero_subtitle',
      description: 'privacy_page.meta.updated',
    },
    content: {
      title: 'privacy_page.sections.collect.title',
      subtitle: 'privacy_page.sections.use.title',
      description: 'privacy_page.intro',
      bodyHtml: {
        concat: [
          'privacy_page.intro',
          'privacy_page.sections.collect.title',
          'privacy_page.sections.use.body',
          'privacy_page.sections.security.title',
        ],
        join: '\n\n',
      },
    },
  },
};

const GLOBAL_FIELD_SEEDS = {
  header: {
    'header-main': {
      navItems: {
        listFromPaths: [
          'header.nav.home',
          'header.nav.features',
          'header.nav.pricing',
          'header.nav.blogs',
          'header.nav.contact_us',
        ],
      },
    },
  },
};

const hydrateSections = (sections, pageId, seedRoot) => {
  if (!Array.isArray(sections) || !seedRoot?.[pageId]) return sections;
  return sections.map((section) => {
    const sectionSeeds = seedRoot[pageId][section.id];
    if (!sectionSeeds || !Array.isArray(section.fields)) return section;
    const fields = section.fields.map((field) => {
      const spec = sectionSeeds[field.key];
      if (!spec || !shouldHydrateField(field, field.value)) return field;
      return applySeedToField(field, spec);
    });
    return { ...section, fields };
  });
};

export const hydrateEmptyFieldsFromLocales = (state) => {
  if (!state || typeof state !== 'object') return state;
  const nextPages = (state.pages || []).map((page) => ({
    ...page,
    sections: hydrateSections(page.sections, page.id, PAGE_FIELD_SEEDS),
  }));

  const nextGlobals = { ...(state.globals || {}) };
  Object.entries(nextGlobals).forEach(([globalId, node]) => {
    const seeds = GLOBAL_FIELD_SEEDS[globalId];
    if (!node?.sections || !seeds) return;
    nextGlobals[globalId] = {
      ...node,
      sections: node.sections.map((section) => {
        const sectionSeeds = seeds[section.id];
        if (!sectionSeeds || !Array.isArray(section.fields)) return section;
        const fields = section.fields.map((field) => {
          const spec = sectionSeeds[field.key];
          if (!spec || !shouldHydrateField(field, field.value)) return field;
          return applySeedToField(field, spec);
        });
        return { ...section, fields };
      }),
    };
  });

  return {
    ...state,
    pages: nextPages,
    globals: nextGlobals,
  };
};
