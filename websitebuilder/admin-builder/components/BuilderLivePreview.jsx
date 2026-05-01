import React from 'react';

const valueOf = (section, key, fallback = '') => {
  const element = section?.elements?.find((item) => item.key === key);
  return element?.value ?? fallback;
};

const visibleSection = (section) => {
  const element = section?.elements?.find((item) => item.key === 'visible');
  return element ? Boolean(element.value) : true;
};

const renderButton = (label, url, variant = 'primary') => {
  if (!label) return null;
  const className = variant === 'secondary' ? 'btn btn-outline-primary btn-sm' : 'btn btn-primary btn-sm';
  return (
    <a href={url || '#'} className={className} style={{ textDecoration: 'none' }}>
      {label}
    </a>
  );
};

const BuilderLivePreview = ({ headerNode, footerNode, page }) => {
  const headerSection = headerNode?.sections?.[0] || null;
  const footerSection = footerNode?.sections?.[0] || null;
  const navItems = String(valueOf(headerSection, 'navItems', '') || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  return (
    <div className="h-100 d-flex flex-column" style={{ border: '1px solid #dbe3ef', borderRadius: 12, overflow: 'hidden', background: '#fff' }}>
      <div className="px-3 py-2 border-bottom bg-light d-flex align-items-center justify-content-between">
        <div className="d-flex gap-2 align-items-center">
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57' }} />
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#febc2e' }} />
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#28c840' }} />
          <span className="text-muted small">Live Preview</span>
        </div>
        <span className="badge badge-soft-success">Real-time</span>
      </div>

      <div className="flex-grow-1 overflow-auto">
        <header className="px-4 py-3 border-bottom d-flex flex-wrap align-items-center justify-content-between gap-2" style={{ position: 'sticky', top: 0, background: '#fff', zIndex: 2 }}>
          <strong>{valueOf(headerSection, 'brandName', 'Brand')}</strong>
          <nav className="d-flex flex-wrap gap-3 small text-muted">
            {navItems.map((item) => <span key={`nav-${item}`}>{item}</span>)}
          </nav>
          <a href={valueOf(headerSection, 'loginUrl', '#')} className="btn btn-outline-primary btn-sm">{valueOf(headerSection, 'loginLabel', 'Login')}</a>
        </header>

        <main className="p-4" style={{ background: '#f8fafc' }}>
          <h5 className="mb-3">{page?.name || 'Page'}</h5>
          <div className="d-flex flex-column gap-3">
            {(page?.sections || []).filter(visibleSection).map((section) => {
              const title = valueOf(section, 'title', section.name);
              const subtitle = valueOf(section, 'subtitle', '');
              const description = valueOf(section, 'description', '');
              const image = valueOf(section, 'image', '');
              return (
                <section key={section.id} className="bg-white border rounded-3 p-3">
                  <div className="small text-muted mb-1">{valueOf(section, 'eyebrow', section.name)}</div>
                  <h6 className="mb-1">{title || section.name}</h6>
                  {subtitle ? <div className="text-muted mb-2">{subtitle}</div> : null}
                  {description ? <p className="mb-2">{description}</p> : null}
                  {image ? (
                    <div className="mb-2" style={{ borderRadius: 10, overflow: 'hidden' }}>
                      <img src={image} alt={valueOf(section, 'title', section.name)} style={{ width: '100%', maxHeight: 200, objectFit: 'cover' }} />
                    </div>
                  ) : null}
                  <div className="d-flex gap-2">
                    {renderButton(valueOf(section, 'primaryButtonText', ''), valueOf(section, 'primaryButtonUrl', '#'))}
                    {renderButton(valueOf(section, 'secondaryButtonText', ''), valueOf(section, 'secondaryButtonUrl', '#'), 'secondary')}
                  </div>
                </section>
              );
            })}
          </div>
        </main>

        <footer className="px-4 py-4 border-top bg-white">
          <h6 className="mb-1">{valueOf(footerSection, 'title', 'Footer title')}</h6>
          <p className="text-muted mb-2">{valueOf(footerSection, 'description', '')}</p>
          <div className="mb-2">
            {renderButton(valueOf(footerSection, 'buttonText', ''), valueOf(footerSection, 'buttonUrl', '#'))}
          </div>
          <div className="small text-muted">{valueOf(footerSection, 'copyright', '')}</div>
        </footer>
      </div>
    </div>
  );
};

export default BuilderLivePreview;
