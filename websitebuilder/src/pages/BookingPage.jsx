import { useEffect, useMemo, useState } from 'react';
import { useI18n } from '../context/I18nContext.jsx';
import '../styles/booking-page.css';

const serviceCards = [
  {
    key: 'portrait',
    price: 98,
    images: ['/assets/img/service/service-1.jpg', '/assets/img/service/service-2.jpg', '/assets/img/service/service-3.jpg']
  },
  {
    key: 'family',
    price: 120,
    images: ['/assets/img/service/service-4.jpg', '/assets/img/service/service-5.jpg', '/assets/img/service/service-6.jpg']
  },
  {
    key: 'engagement',
    price: 200,
    images: ['/assets/img/project/project-3.jpg', '/assets/img/project/project-4.jpg', '/assets/img/project/project-5.jpg']
  },
  {
    key: 'events',
    price: 290,
    images: ['/assets/img/project/project-9.jpg', '/assets/img/project/project-10.jpg', '/assets/img/project/project-12.jpg']
  }
];

const bookingSessions = [
  { key: 'portrait', price: 120 },
  { key: 'family', price: 200 },
  { key: 'event', price: 350 }
];

const timeSlots = ['10:00 AM', '11:00 AM', '12:00 PM', '02:00 PM', '03:00 PM'];

export default function BookingPage() {
  const { t } = useI18n();
  const [serviceSlides, setServiceSlides] = useState([0, 0, 0, 0]);
  const [activeSession, setActiveSession] = useState(bookingSessions[0]);
  const [activeTime, setActiveTime] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [reviewIndex, setReviewIndex] = useState(0);
  const [showSuccess] = useState(false);

  useEffect(() => {
    document.title = t('booking.title', 'Photographer Booking');
  }, [t]);

  useEffect(() => {
    const timers = serviceCards.map((card, cardIndex) =>
      window.setInterval(() => {
        setServiceSlides((prev) => {
          const next = [...prev];
          next[cardIndex] = (next[cardIndex] + 1) % card.images.length;
          return next;
        });
      }, 5200 + cardIndex * 200)
    );

    return () => timers.forEach((id) => window.clearInterval(id));
  }, []);

  const reviews = useMemo(
    () => [
      {
        name: t('booking.reviews.client1_name', 'Sarah Ahmed'),
        review: t('booking.reviews.review1', 'Amazing photographer! Highly recommended.'),
        letter: 'S'
      },
      {
        name: t('booking.reviews.client2_name', 'Ali Hassan'),
        review: t('booking.reviews.review2', 'Very professional and the photos exceeded expectations.'),
        letter: 'A'
      }
    ],
    [t]
  );

  const summaryDate = bookingDate || t('booking.booking.select_date', 'Select Date');
  const summaryTime = activeTime || t('booking.booking.available_time', 'Select time');

  const moveServiceSlide = (cardIndex, direction) => {
    setServiceSlides((prev) => {
      const next = [...prev];
      const max = serviceCards[cardIndex].images.length;
      next[cardIndex] = (next[cardIndex] + direction + max) % max;
      return next;
    });
  };

  return (
    <main className="booking-demo-react">
      <section className="booking-hero" data-builder-section="hero">
        <div className="container">
          <div className="row align-items-center gy-4">
            <div className="col-lg-7">
              <div className="brand-pill mb-3">
                <img src="/assets/img/team/team-1.jpg" alt="John Doe" />
                <div className="meta">
                  <strong>{t('booking.hero.brand_name', 'John Doe Photography')}</strong>
                  <small>{t('booking.hero.specialties', 'Portrait · Family · Events')}</small>
                </div>
              </div>

              <h1 className="text-white hero-title" data-builder-field="title" style={{ fontSize: 'clamp(34px, 4.4vw, 58px)', lineHeight: 1.05 }}>
                {t('booking.hero.title', 'Capturing your story with natural light & timeless edits')}
              </h1>
              <p className="text-white hero-lead" data-builder-field="subtitle">{t('booking.hero.description', '')}</p>

              <div className="hero-actions d-flex flex-wrap gap-2 mt-4">
                <a href="#bookingSection" className="btn style1" data-builder-field="primaryButtonText" data-builder-bind="text" data-builder-button="primary">{t('booking.hero.book_session', 'Book a Session')}</a>
                <a href="#servicesSection" className="btn style1 btn-outline" data-builder-field="secondaryButtonText" data-builder-bind="text" data-builder-button="secondary" style={{ borderColor: 'rgba(255,255,255,0.45)', color: '#fff' }}>
                  {t('booking.hero.explore_services', 'Explore Services')}
                </a>
              </div>
            </div>

            <div className="col-lg-5">
              <div className="mini-site-card p-4">
                <div className="card-head d-flex align-items-start justify-content-between gap-3">
                  <div>
                    <h4 className="mb-1">{t('booking.contact.title', 'Contact')}</h4>
                    <p className="mb-0" style={{ color: '#6c757d' }}>{t('booking.contact.location', 'Manama, Bahrain')}</p>
                  </div>
                  <div className="icon-actions">
                    <a className="icon-action" href="tel:+97312345678"><i className="ri-phone-line" /></a>
                    <a className="icon-action" href="mailto:john@example.com"><i className="ri-mail-open-line" /></a>
                    <a className="icon-action" href="#"><i className="ri-whatsapp-line" /></a>
                    <a className="icon-action" href="#"><i className="ri-instagram-line" /></a>
                    <a className="icon-action" href="#"><i className="ri-facebook-line" /></a>
                  </div>
                </div>
                <div className="soft-divider my-3" />
                <div className="row g-3">
                  <div className="col-6">
                    <div className="d-flex align-items-center gap-2"><span className="icon"><i className="ri-mail-open-line" /></span><a href="mailto:john@example.com" style={{ color: '#6c757d', fontSize: 14, textDecoration: 'none' }}>john@example.com</a></div>
                  </div>
                  <div className="col-6">
                    <div className="d-flex align-items-center gap-2"><span className="icon"><i className="ri-phone-line" /></span><a href="tel:+97312345678" style={{ color: '#6c757d', fontSize: 14, textDecoration: 'none' }}>+973 12345678</a></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="booking-section after-hero-gap" style={{ background: '#fafbfd', paddingTop: 0 }} data-builder-section="gallery-extra">
        <div className="container">
          <div className="row g-3 photo-collage">
            <div className="col-lg-8"><img src="/assets/img/project/project-14.jpg" className="big" alt="Project" /></div>
            <div className="col-lg-4">
              <div className="row g-3">
                <div className="col-12 offset-top"><img src="/assets/img/project/single-project-2.jpg" className="small" alt="Project" /></div>
                <div className="col-12 offset-mid"><img src="/assets/img/service/single-service-2.jpg" className="small" alt="Service" /></div>
              </div>
            </div>
            <div className="col-lg-6"><img src="/assets/img/project/project-10.jpg" className="small" style={{ height: 260 }} alt="Project" /></div>
            <div className="col-lg-6"><img src="/assets/img/project/single-project-3.jpg" className="small" style={{ height: 260 }} alt="Project" /></div>
          </div>
        </div>
      </section>

      <section className="booking-section" id="servicesSection" data-builder-section="services">
        <div className="container">
          <div className="row mb-4">
            <div className="col-lg-8">
              <h2 data-builder-field="title" style={{ marginBottom: 8 }}>{t('booking.services.title', 'Services')}</h2>
              <p data-builder-field="subtitle" style={{ color: '#6c757d', maxWidth: '70ch' }}>{t('booking.services.description', '')}</p>
            </div>
          </div>

          <div className="row g-4">
            {serviceCards.map((card, cardIndex) => (
              <div key={card.key} className="col-md-6 col-lg-3">
                <div className="service-showcase-card">
                  <div className="react-carousel">
                    <div className="react-carousel-track">
                      <img src={card.images[serviceSlides[cardIndex]]} alt={card.key} />
                    </div>
                    <button className="react-carousel-btn prev" type="button" onClick={() => moveServiceSlide(cardIndex, -1)}><i className="ri-arrow-left-s-line" /></button>
                    <button className="react-carousel-btn next" type="button" onClick={() => moveServiceSlide(cardIndex, 1)}><i className="ri-arrow-right-s-line" /></button>
                  </div>
                  <div className="content">
                    <span className="badge">{t(`booking.services.cards.${card.key}.badge`, 'Popular')}</span>
                    <h5>{t(`booking.services.cards.${card.key}.title`, 'Session')}</h5>
                    <p>{t(`booking.services.cards.${card.key}.line1`, '')}</p>
                    <p className="mb-0">{t(`booking.services.cards.${card.key}.line2`, '')}</p>
                    <div className="service-price">SAR {card.price}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="booking-section" style={{ background: '#fafbfd', paddingTop: 0 }} data-builder-section="about-extra">
        <div className="container">
          <div className="row align-items-center g-4">
            <div className="col-lg-6">
              <div className="mini-site-card p-4 p-lg-5">
                <h3 data-builder-field="title" style={{ marginBottom: 12 }}>{t('booking.about.title', 'About the Photographer')}</h3>
                <p data-builder-field="subtitle" style={{ color: '#6c757d' }}>{t('booking.about.description', '')}</p>
                <div className="row g-3 mt-3">
                  <div className="col-sm-6">
                    <div className="d-flex align-items-center gap-2"><span className="icon"><i className="ri-award-line" /></span><div><div style={{ fontWeight: 700 }}>{t('booking.about.experience_label', 'Experience')}</div><div style={{ color: '#6c757d', fontSize: 14 }}>{t('booking.about.experience_value', '8+ years')}</div></div></div>
                  </div>
                  <div className="col-sm-6">
                    <div className="d-flex align-items-center gap-2"><span className="icon"><i className="ri-image-line" /></span><div><div style={{ fontWeight: 700 }}>{t('booking.about.style_label', 'Style')}</div><div style={{ color: '#6c757d', fontSize: 14 }}>{t('booking.about.style_value', 'Natural light')}</div></div></div>
                  </div>
                </div>
                <div className="d-flex flex-wrap gap-2 mt-4">
                  <a className="btn style1" href="#bookingSection" data-builder-field="primaryButtonText" data-builder-bind="text" data-builder-button="primary">{t('booking.about.start_booking', 'Start Booking')}</a>
                  <a className="btn style1 btn-outline" href="#galleries" data-builder-field="secondaryButtonText" data-builder-bind="text" data-builder-button="secondary">{t('booking.about.view_galleries', 'View Galleries')}</a>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="row g-3 gallery-grid" id="galleries">
                <div className="col-6"><img src="/assets/img/about/about-img-2.jpg" alt="Gallery" /></div>
                <div className="col-6"><img src="/assets/img/about/about-img-3.jpg" alt="Gallery" /></div>
                <div className="col-6"><img src="/assets/img/about/about-img-4.jpg" alt="Gallery" /></div>
                <div className="col-6"><img src="/assets/img/about/about-img-5.jpg" alt="Gallery" /></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="booking-section" id="bookingSection" data-builder-section="booking-form">
        <div className="container">
          <div className="row justify-content-center mb-4">
            <div className="col-lg-8 text-center">
              <h2 data-builder-field="title" style={{ marginBottom: 10 }}>{t('booking.booking.title', 'Book your session')}</h2>
              <p data-builder-field="subtitle" style={{ color: '#6c757d' }}>{t('booking.booking.description', '')}</p>
            </div>
          </div>

          <div className="booking-surface">
            <div className="p-4 p-lg-5">
              <div className="row g-4">
                <div className="col-lg-8">
                  <h5 style={{ marginBottom: 14 }}>{t('booking.booking.select_session', 'Select Session Type')}</h5>
                  <div className="row g-3">
                    {bookingSessions.map((session) => (
                      <div key={session.key} className="col-sm-6 col-lg-4">
                        <div className={`session-card p-3 ${activeSession.key === session.key ? 'active' : ''}`} role="button" tabIndex={0} onClick={() => setActiveSession(session)}>
                          <div className="d-flex justify-content-between align-items-start">
                            <h6 className="mb-0">{t(`booking.booking.sessions.${session.key}.title`, 'Session')}</h6>
                            <span className="badge bg-primary bg-opacity-10 text-primary">{t(`booking.booking.sessions.${session.key}.badge`, 'Popular')}</span>
                          </div>
                          <p className="text-muted small mt-2 mb-2">{t(`booking.booking.sessions.${session.key}.duration`, '')}</p>
                          <div className="d-flex align-items-center justify-content-between">
                            <strong className="text-primary">${session.price}</strong>
                            <span className="text-muted small">{t(`booking.booking.sessions.${session.key}.meta`, '')}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5">
                    <h5>{t('booking.booking.select_date', 'Select Date')}</h5>
                    <input type="date" className="form-control w-auto" value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} />
                  </div>

                  <div className="mt-4">
                    <h5>{t('booking.booking.available_time', 'Available Time')}</h5>
                    <div className="d-flex flex-wrap gap-2">
                      {timeSlots.map((slot) => (
                        <button key={slot} className={`btn btn-outline-primary time-slot ${activeTime === slot ? 'active' : ''}`} type="button" onClick={() => setActiveTime(slot)}>{slot}</button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-5">
                    <h5>{t('booking.booking.your_information', 'Your Information')}</h5>
                    <form onSubmit={(e) => e.preventDefault()}>
                      <div className="row g-3">
                        <div className="col-md-6"><label className="form-label">{t('booking.booking.form.first_name', 'First Name')}</label><input type="text" className="form-control" /></div>
                        <div className="col-md-6"><label className="form-label">{t('booking.booking.form.last_name', 'Last Name')}</label><input type="text" className="form-control" /></div>
                        <div className="col-md-6"><label className="form-label">{t('booking.booking.form.email', 'Email')}</label><input type="email" className="form-control" /></div>
                        <div className="col-md-6"><label className="form-label">{t('booking.booking.form.phone', 'Phone')}</label><input type="tel" className="form-control" /></div>
                        <div className="col-12"><label className="form-label">{t('booking.booking.form.notes', 'Notes')}</label><textarea className="form-control" rows={5} /></div>
                      </div>
                      <button className="btn style1 w-100 mt-4" type="submit" data-builder-field="primaryButtonText" data-builder-bind="text" data-builder-button="primary"><span>{t('booking.booking.form.confirm', 'Confirm Booking')}</span></button>
                    </form>
                    {showSuccess ? <div className="alert alert-success mt-3">Booking confirmed</div> : null}
                  </div>
                </div>

                <div className="col-lg-4">
                  <div className="summary-card p-4 sticky-top">
                    <h4 className="mb-3">Booking Summary</h4>
                    <div className="d-flex justify-content-between py-2"><span>Session</span><strong>{t(`booking.booking.sessions.${activeSession.key}.title`, 'Session')}</strong></div>
                    <div className="d-flex justify-content-between py-2"><span>Date</span><strong>{summaryDate}</strong></div>
                    <div className="d-flex justify-content-between py-2"><span>Time</span><strong>{summaryTime}</strong></div>
                    <hr />
                    <div className="d-flex justify-content-between py-2"><span>Total</span><strong>SAR {activeSession.price}</strong></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="booking-section reviews-wrap" id="reviewsSection" data-builder-section="reviews">
        <div className="container">
          <div className="row justify-content-center mb-4">
            <div className="col-lg-8 text-center">
              <div className="reviews-kicker mb-1">{t('booking.reviews.kicker', 'Client Stories')}</div>
              <h2 data-builder-field="title" style={{ marginBottom: 0 }}>{t('booking.reviews.title', 'Reviews')}</h2>
            </div>
          </div>
          <div className="review-showcase">
            <div className="review-head">
              <div className="review-user">
                <div className="review-user-badge">{reviews[reviewIndex].letter}</div>
                <div className="review-meta"><strong>{reviews[reviewIndex].name}</strong></div>
              </div>
              <div><span className="review-stars">★★★★★</span><span className="review-verified">{t('booking.reviews.verified', 'Verified review')}</span></div>
            </div>
            <div className="review-body">{reviews[reviewIndex].review}</div>
            <button className="review-nav-btn prev" type="button" onClick={() => setReviewIndex((p) => (p === 0 ? reviews.length - 1 : p - 1))}><i className="ri-arrow-left-s-line" /></button>
            <button className="review-nav-btn next" type="button" onClick={() => setReviewIndex((p) => (p + 1) % reviews.length)}><i className="ri-arrow-right-s-line" /></button>
          </div>
          <div className="review-indicators">
            {reviews.map((_, idx) => (
              <button key={idx} type="button" className={reviewIndex === idx ? 'active' : ''} onClick={() => setReviewIndex(idx)} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
