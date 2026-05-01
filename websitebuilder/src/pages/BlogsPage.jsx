import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../context/I18nContext.jsx';

const categories = [
  'blog_page.categories.all',
  'blog_page.categories.booking',
  'blog_page.categories.client_experience',
  'blog_page.categories.marketing',
  'blog_page.categories.finance',
  'blog_page.categories.operations'
];

const posts = [
  { id: 'p1', image: '/assets/img/blog/blog-2.jpg' },
  { id: 'p2', image: '/assets/img/blog/blog-3.jpg' },
  { id: 'p3', image: '/assets/img/blog/blog-4.jpg' },
  { id: 'p4', image: '/assets/img/blog/blog-5.jpg' },
  { id: 'p5', image: '/assets/img/blog/blog-6.jpg' },
  { id: 'p6', image: '/assets/img/blog/blog-7.jpg' }
];

export default function BlogsPage() {
  const { t } = useI18n();

  useEffect(() => {
    document.title = t('blog_page.title', 'Blogs');
  }, [t]);

  return (
    <main className="blogs-page-wrap">
      <section className="blogs-hero" data-builder-section="hero">
        <div className="container">
          <div className="blogs-hero-layout">
            <div className="blogs-hero-copy">
              <span className="blogs-kicker">{t('blog_page.hero.kicker', 'C-KAM Journal')}</span>
              <h1 data-builder-field="title">{t('blog_page.hero.title', 'Insights that help photographers grow smarter')}</h1>
              <p data-builder-field="subtitle">{t('blog_page.hero.subtitle', '')}</p>
              <div className="blogs-hero-actions">
                <a href="#latest-articles" className="blogs-btn primary" data-builder-field="primaryButtonText" data-builder-bind="text" data-builder-button="primary">{t('blog_page.hero.primary_cta', 'Explore Articles')}</a>
                <Link to="/features" className="blogs-btn ghost" data-builder-field="secondaryButtonText" data-builder-bind="text" data-builder-button="secondary">{t('blog_page.hero.secondary_cta', 'See Platform Features')}</Link>
              </div>
            </div>
            <article className="hero-featured-card">
              <img src="/assets/img/blog/blog-1.jpg" alt="Featured blog" />
              <div className="hero-featured-overlay">
                <span>{t('blog_page.hero.featured_badge', 'Featured Story')}</span>
                <h2>{t('blog_page.hero.featured_title', '')}</h2>
                <p>{t('blog_page.hero.featured_meta', '')}</p>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="blogs-categories" data-builder-section="categories">
        <div className="container">
          <div className="category-chip-wrap">
            {categories.map((key, index) => (
              <button key={key} className={`category-chip ${index === 0 ? 'active' : ''}`} type="button">
                {t(key, '')}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="blogs-posts" id="latest-articles" data-builder-section="blog-grid">
        <div className="container">
          <div className="blogs-head-row">
            <h2 data-builder-field="title">{t('blog_page.posts.title', 'Latest Articles')}</h2>
            <p data-builder-field="subtitle">{t('blog_page.posts.subtitle', '')}</p>
          </div>

          <div className="blogs-grid">
            {posts.map((post) => (
              <article className="blog-card" key={post.id}>
                <Link to="/single-blog" className="blog-thumb">
                  <img src={post.image} alt={`Post ${post.id}`} />
                </Link>
                <div className="blog-card-body">
                  <span className="blog-meta">{t(`blog_page.posts.items.${post.id}.meta`, '')}</span>
                  <h3>{t(`blog_page.posts.items.${post.id}.title`, '')}</h3>
                  <p>{t(`blog_page.posts.items.${post.id}.excerpt`, '')}</p>
                  <Link to="/single-blog" className="blog-link">{t('blog_page.posts.read_more', 'Read More')}</Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="blogs-newsletter" data-builder-section="newsletter">
        <div className="container">
          <div className="newsletter-box">
            <div>
              <h3 data-builder-field="title">{t('blog_page.newsletter.title', '')}</h3>
              <p data-builder-field="subtitle">{t('blog_page.newsletter.subtitle', '')}</p>
            </div>
            <a href="https://ckam-photographer.cyphersol.com/auth/login" className="blogs-btn primary" data-builder-field="primaryButtonText" data-builder-bind="text" data-builder-button="primary">{t('blog_page.newsletter.cta', 'Join Free')}</a>
          </div>
        </div>
      </section>
    </main>
  );
}


