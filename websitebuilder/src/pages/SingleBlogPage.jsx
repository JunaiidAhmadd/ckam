import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../context/I18nContext.jsx';

const relatedPosts = [
  { id: 'p3', image: '/assets/img/blog/blog-4.jpg' },
  { id: 'p4', image: '/assets/img/blog/blog-5.jpg' },
  { id: 'p5', image: '/assets/img/blog/blog-6.jpg' }
];

export default function SingleBlogPage() {
  const { t } = useI18n();

  useEffect(() => {
    document.title = t('single_blog_page.title', 'Single Blog');
  }, [t]);

  return (
    <main className="single-blog-page-wrap">
      <section className="single-blog-hero" data-builder-section="hero">
        <div className="container">
          <div className="single-blog-hero-grid">
            <div className="single-blog-title-card">
              <Link to="/blogs" className="single-blog-back">{t('single_blog_page.hero.back', 'Back to Blogs')}</Link>
              <span className="blogs-kicker">{t('single_blog_page.hero.category', 'Booking Strategy')}</span>
              <h1 data-builder-field="title">{t('single_blog_page.hero.title', '')}</h1>
              <p data-builder-field="subtitle">{t('single_blog_page.hero.subtitle', '')}</p>
              <div className="single-blog-meta-row">
                <span><i className="ri-user-3-line" /><span>{t('single_blog_page.hero.author', '')}</span></span>
                <span><i className="ri-time-line" /><span>{t('single_blog_page.hero.read_time', '')}</span></span>
                <span><i className="ri-calendar-line" /><span>{t('single_blog_page.hero.date', '')}</span></span>
              </div>
            </div>
            <div className="single-blog-hero-image">
              <img src="/assets/img/blog/blog-1.jpg" alt="Studio booking strategy" />
            </div>
          </div>
        </div>
      </section>

      <section className="single-blog-content-section" data-builder-section="content">
        <div className="container">
          <div className="single-blog-layout">
            <article className="single-blog-article">
              <p className="single-blog-lead" data-builder-field="description">{t('single_blog_page.article.lead', '')}</p>

              <h2>{t('single_blog_page.article.s1.title', '')}</h2>
              <p>{t('single_blog_page.article.s1.p1', '')}</p>
              <p>{t('single_blog_page.article.s1.p2', '')}</p>

              <figure className="single-blog-quote">
                <blockquote>{t('single_blog_page.article.quote', '')}</blockquote>
              </figure>

              <h2>{t('single_blog_page.article.s2.title', '')}</h2>
              <p>{t('single_blog_page.article.s2.p1', '')}</p>
              <ul className="single-blog-list">
                <li><i className="ri-checkbox-circle-fill" /><span>{t('single_blog_page.article.s2.item_1', '')}</span></li>
                <li><i className="ri-checkbox-circle-fill" /><span>{t('single_blog_page.article.s2.item_2', '')}</span></li>
                <li><i className="ri-checkbox-circle-fill" /><span>{t('single_blog_page.article.s2.item_3', '')}</span></li>
              </ul>

              <div className="single-blog-image-split">
                <img src="/assets/img/blog/blog-2.jpg" alt="Booking flow" />
                <img src="/assets/img/blog/blog-3.jpg" alt="Client experience" />
              </div>

              <h2>{t('single_blog_page.article.s3.title', '')}</h2>
              <p>{t('single_blog_page.article.s3.p1', '')}</p>
              <p>{t('single_blog_page.article.s3.p2', '')}</p>

              <div className="single-blog-cta-card">
                <div>
                <h3 data-builder-field="title">{t('single_blog_page.cta.title', '')}</h3>
                <p data-builder-field="subtitle">{t('single_blog_page.cta.subtitle', '')}</p>
                </div>
                <a href="https://ckam-photographer.cyphersol.com/auth/login" className="blogs-btn primary" data-builder-field="primaryButtonText" data-builder-bind="text" data-builder-button="primary">{t('single_blog_page.cta.button', 'Start Free')}</a>
              </div>
            </article>

            <aside className="single-blog-sidebar" data-builder-section="sidebar">
              <div className="single-blog-side-card">
                <h3>{t('single_blog_page.sidebar.title', 'In this article')}</h3>
                <a href="javascript:void(0)">{t('single_blog_page.sidebar.item_1', '')}</a>
                <a href="javascript:void(0)">{t('single_blog_page.sidebar.item_2', '')}</a>
                <a href="javascript:void(0)">{t('single_blog_page.sidebar.item_3', '')}</a>
              </div>
              <div className="single-blog-side-card accent">
                <span>{t('single_blog_page.sidebar.tip_label', 'Studio Tip')}</span>
                <p>{t('single_blog_page.sidebar.tip', '')}</p>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="single-blog-related" data-builder-section="related">
        <div className="container">
          <div className="blogs-head-row">
            <h2 data-builder-field="title">{t('single_blog_page.related.title', 'Related Reads')}</h2>
            <p data-builder-field="subtitle">{t('single_blog_page.related.subtitle', '')}</p>
          </div>
          <div className="blogs-grid">
            {relatedPosts.map((post) => (
              <article className="blog-card" key={post.id}>
                <Link to="/single-blog" className="blog-thumb">
                  <img src={post.image} alt={`Related ${post.id}`} />
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
    </main>
  );
}


