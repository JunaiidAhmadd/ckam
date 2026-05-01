import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Card, Col, Container, Form, Row } from 'react-bootstrap';
import WebsiteBuilderForm from './WebsiteBuilderForm.jsx';
import { useBuilder } from '../state/BuilderContext.jsx';
import { useCkamAdmin } from '../../../src/views/CkamAdmin/context';
import { getLocalizedValue } from '../model/schema';

const APP_COPY = {
  en: {
    pageTitle: 'Website Builder',
    pageSubtitle: 'Edits on the left update the preview on the right.',
    liveUpdates: 'Live updates',
    savedLabel: 'Saved',
    notSaved: 'Not saved',
    save: 'Save',
    editor: 'Editor',
    header: 'Header',
    footer: 'Footer',
    livePreview: 'Live preview',
    headerFooterBadge: 'Header + Footer',
    pageBadge: 'Page',
    publicPagePreview: 'Live preview',
    live: 'Live',
  },
  ar: {
    pageTitle: 'منشئ الموقع',
    pageSubtitle: 'التعديلات على اليسار تُحدّث المعاينة على اليمين.',
    liveUpdates: 'تحديثات مباشرة',
    savedLabel: 'تم الحفظ',
    notSaved: 'غير محفوظ',
    save: 'حفظ',
    editor: 'المحرر',
    header: 'الهيدر',
    footer: 'الفوتر',
    livePreview: 'معاينة مباشرة',
    headerFooterBadge: 'الهيدر + الفوتر',
    pageBadge: 'الصفحة',
    publicPagePreview: 'معاينة مباشرة',
    live: 'مباشر',
  },
};

const AdminWebsiteBuilderApp = () => {
  const { locale } = useCkamAdmin();
  const activeLocale = locale === 'ar' ? 'ar' : 'en';
  const copy = APP_COPY[activeLocale];

  const {
    state,
    theme,
    themeConfig,
    selectedPage,
    editorNode,
    selectGlobal,
    updateField,
    updateSectionShow,
    selectTheme,
    updateThemeCustomColor,
    save,
  } = useBuilder();

  const saveLabel = state.savedAt
    ? `${copy.savedLabel}: ${new Date(state.savedAt).toLocaleString(activeLocale === 'ar' ? 'ar-BH' : 'en-US')}`
    : copy.notSaved;

  const accentMap = useMemo(() => ({
    default: '#f47e42',
    sand: '#d46a2f',
    ocean: '#1f7a8c',
    forest: '#3f7d37',
    midnight: '#fb923c',
  }), []);

  const accentColor = themeConfig?.custom?.accent || accentMap[theme] || accentMap.default;
  const [liveSync, setLiveSync] = useState(true);
  const compactMode = false;
  const previewSlug = state.editorTarget.kind === 'global'
    ? 'header-footer'
    : state.editorTarget.kind === 'page'
      ? state.editorTarget.id
      : (selectedPage?.id || 'home');

  const pageBadgeLabel = state.editorTarget.kind === 'global'
    ? copy.headerFooterBadge
    : getLocalizedValue(editorNode?.name, activeLocale, copy.pageBadge);

  const previewUrl = `/website-builder-preview/${previewSlug}?builderMode=1&theme=${encodeURIComponent(theme || 'default')}&compact=${compactMode ? '1' : '0'}&locale=${encodeURIComponent(activeLocale)}&text=${encodeURIComponent(themeConfig?.custom?.text || '')}&bg=${encodeURIComponent(themeConfig?.custom?.bg || '')}&accent=${encodeURIComponent(themeConfig?.custom?.accent || '')}&buttonBg=${encodeURIComponent(themeConfig?.custom?.buttonBg || '')}&buttonText=${encodeURIComponent(themeConfig?.custom?.buttonText || '')}`;

  const stateRef = useRef(state);
  stateRef.current = state;

  const pushStateToPreview = useCallback(() => {
    if (!liveSync) return;
    const frame = document.getElementById('wb-preview-iframe');
    const win = frame?.contentWindow;
    if (!win) return;
    win.postMessage({
      type: 'CKAM_BUILDER_SYNC',
      payload: stateRef.current,
    }, window.location.origin);
  }, [liveSync]);

  useEffect(() => {
    pushStateToPreview();
  }, [state, pushStateToPreview]);

  const onPreviewFrameLoad = useCallback(() => {
    pushStateToPreview();
  }, [pushStateToPreview]);

  return (
    <Container fluid className="px-0">
      <div className="hk-pg-header pt-7 px-3 px-md-4">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
          <div>
            <h1 className="pg-title mb-1">{copy.pageTitle}</h1>
            <p className="mb-0 text-muted">{copy.pageSubtitle}</p>
          </div>
          <div className="d-flex align-items-center gap-2">
            <Form.Check
              type="switch"
              id="live-sync-switch"
              label={copy.liveUpdates}
              checked={liveSync}
              onChange={(event) => setLiveSync(event.target.checked)}
            />
            <span className="badge badge-soft-secondary">{saveLabel}</span>
            <Button onClick={() => save()}>{copy.save}</Button>
          </div>
        </div>
      </div>

      <div className="hk-pg-body px-3 px-md-4 pb-4">
        <Row className="g-3">
          <Col xl={4} lg={5}>
            <Card className="card-border" style={{ height: 'calc(100vh - 100px)' }}>
              <Card.Header className="card-header-action">
                <h6 className="mb-0">{copy.editor}</h6>
              </Card.Header>
              <Card.Body className="wb-form-scroll d-flex flex-column gap-3">
                {state.editorTarget.kind === 'global' ? (
                  <div className="d-flex gap-2">
                    <Button
                      size="sm"
                      variant={state.editorTarget.id === 'header' ? 'primary' : 'outline-primary'}
                      onClick={() => selectGlobal('header')}
                    >
                      {copy.header}
                    </Button>
                    <Button
                      size="sm"
                      variant={state.editorTarget.id === 'footer' ? 'primary' : 'outline-primary'}
                      onClick={() => selectGlobal('footer')}
                    >
                      {copy.footer}
                    </Button>
                  </div>
                ) : null}

                <WebsiteBuilderForm
                  theme={theme}
                  themeConfig={themeConfig}
                  onThemeChange={selectTheme}
                  onCustomColorChange={updateThemeCustomColor}
                  accentColor={accentColor}
                  page={editorNode || null}
                  onFieldChange={updateField}
                  onSectionShowChange={updateSectionShow}
                />
              </Card.Body>
            </Card>
          </Col>

          <Col xl={8} lg={7}>
            <Card className="card-border" style={{ height: 'calc(100vh - 80px)' }}>
              <Card.Header className="card-header-action d-flex justify-content-between align-items-center">
                <h6 className="mb-0">{copy.livePreview}</h6>
                <span className="badge badge-soft-primary">{pageBadgeLabel}</span>
              </Card.Header>
              <Card.Body className="h-100">
                <div className="wb-preview-shell h-100">
                  <div className="wb-preview-browser">
                    <div className="wb-preview-browser-top">
                      <span className="wb-dot wb-dot-red" />
                      <span className="wb-dot wb-dot-yellow" />
                      <span className="wb-dot wb-dot-green" />
                      <span className="wb-preview-label">{copy.publicPagePreview}</span>
                      <span className="wb-preview-live">{copy.live}</span>
                    </div>
                    <div className="wb-preview-frame">
                      <iframe
                        id="wb-preview-iframe"
                        key={previewUrl}
                        title={`Website preview ${previewSlug}`}
                        src={previewUrl}
                        onLoad={onPreviewFrameLoad}
                        style={{ width: '100%', height: '100%', border: 0, display: 'block' }}
                      />
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>
    </Container>
  );
};

export default AdminWebsiteBuilderApp;
