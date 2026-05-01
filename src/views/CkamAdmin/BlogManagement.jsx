import React, { useMemo, useRef, useState } from 'react';
import { Button, Col, Form, Row } from 'react-bootstrap';
import { Edit2, Trash2 } from 'react-feather';
import { useCkamAdmin } from './context';
import { adminCopy, getLocalizedValue, getStatusLabel } from './localization/i18n';
import { MetricCard, normalizeTranslationLocale, SectionCard, StatusPill, TranslationViewSelect, useAdminPageSetup } from './shared';

const getBlankPost = () => ({
    id: '',
    slug: '',
    title: { en: '', ar: '' },
    excerpt: { en: '', ar: '' },
    content: { en: '', ar: '' },
    category: '',
    author: 'C-KAM Editorial',
    readTime: '5 min read',
    imageUrl: '/assets/img/blog/blog-1.jpg',
    status: 'draft',
    featured: false,
    publishedAt: new Date().toISOString().slice(0, 10),
});

const TINYMCE_SCRIPT_ID = 'ckam-tinymce-script';
const TINYMCE_SCRIPT_SRC = 'https://cdn.tiny.cloud/1/59tfa9du2nj9f2vknfej0bmxhctmfjh34keva1mouvizl8af/tinymce/6/tinymce.min.js';

const BlogContentEditor = ({ localeKey, value, onChange, isRtl }) => {
    const textareaRef = useRef(null);
    const editorRef = useRef(null);
    const editorIdRef = useRef(`ckam-blog-editor-${localeKey}-${Math.random().toString(36).slice(2)}`);
    const readyRef = useRef(false);
    const pendingValueRef = useRef(value || '');

    React.useEffect(() => {
        pendingValueRef.current = value || '';
    }, [value]);

    React.useEffect(() => {
        let cancelled = false;

        const initEditor = () => {
            if (cancelled || !window.tinymce || !textareaRef.current) return;

            window.tinymce.init({
                target: textareaRef.current,
                menubar: false,
                branding: false,
                height: 320,
                directionality: isRtl ? 'rtl' : 'ltr',
                plugins: 'lists link image table code autoresize',
                toolbar: 'undo redo | blocks | bold italic underline | alignleft aligncenter alignright | bullist numlist | link image | code',
                setup: (editor) => {
                    editorRef.current = editor;
                    editor.on('init', () => {
                        readyRef.current = true;
                        editor.setContent(pendingValueRef.current || '');
                    });
                    editor.on('change keyup undo redo input', () => {
                        onChange(editor.getContent());
                    });
                },
            });
        };

        if (window.tinymce) {
            initEditor();
        } else {
            let script = document.getElementById(TINYMCE_SCRIPT_ID);
            if (!script) {
                script = document.createElement('script');
                script.id = TINYMCE_SCRIPT_ID;
                script.src = TINYMCE_SCRIPT_SRC;
                script.referrerPolicy = 'origin';
                document.body.appendChild(script);
            }
            script.addEventListener('load', initEditor);
            return () => {
                script.removeEventListener('load', initEditor);
                cancelled = true;
            };
        }

        return () => {
            cancelled = true;
        };
    }, [isRtl, onChange]);

    React.useEffect(() => {
        const editor = editorRef.current;
        if (!editor || !readyRef.current) return;
        const current = editor.getContent();
        if (current !== (value || '')) {
            editor.setContent(value || '');
        }
    }, [value]);

    React.useEffect(() => () => {
        const editor = editorRef.current;
        if (editor) {
            editor.destroy();
            editorRef.current = null;
        }
    }, []);

    return <textarea id={editorIdRef.current} ref={textareaRef} defaultValue={value || ''} />;
};

const BlogManagement = () => {
    useAdminPageSetup();

    const { locale, blogPosts, saveBlogPost, deleteBlogPost } = useCkamAdmin();
    const copy = adminCopy[locale];
    const pageCopy = copy.blogsPage;
    const commonCopy = copy.common;
    const [searchTerm, setSearchTerm] = useState('');
    const [formState, setFormState] = useState(getBlankPost());
    const [translationLocale, setTranslationLocale] = useState(normalizeTranslationLocale(locale));
    const [isEditing, setIsEditing] = useState(false);
    const [activeView, setActiveView] = useState('list');
    const [selectedPostId, setSelectedPostId] = useState(null);

    const isArabicForm = translationLocale === 'ar';
    const labelAlignClass = isArabicForm ? 'text-end d-block' : 'text-start d-block';
    const localizedTitleLabel = isArabicForm ? 'عنوان المقال' : 'Blog title';
    const localizedExcerptLabel = isArabicForm ? 'مقتطف المقال' : 'Excerpt';
    const localizedContentLabel = isArabicForm ? 'محتوى المقال' : 'Content';

    const filteredPosts = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();
        if (!query) return blogPosts;
        return blogPosts.filter((post) =>
            [
                post.slug,
                post.category,
                post.author,
                getLocalizedValue(post.title, 'en'),
                getLocalizedValue(post.title, 'ar'),
            ].join(' ').toLowerCase().includes(query)
        );
    }, [blogPosts, searchTerm]);

    const totalPosts = blogPosts.length;
    const publishedPosts = blogPosts.filter((post) => post.status === 'published').length;
    const draftPosts = blogPosts.filter((post) => post.status === 'draft').length;
    const featuredPosts = blogPosts.filter((post) => post.featured).length;

    const openCreateForm = () => {
        setFormState(getBlankPost());
        setTranslationLocale(normalizeTranslationLocale(locale));
        setIsEditing(false);
        setActiveView('editor');
    };

    const openEditForm = (post) => {
        setFormState({
            ...post,
            title: { en: post.title?.en || '', ar: post.title?.ar || '' },
            excerpt: { en: post.excerpt?.en || '', ar: post.excerpt?.ar || '' },
            content: { en: post.content?.en || '', ar: post.content?.ar || '' },
        });
        setTranslationLocale(normalizeTranslationLocale(locale));
        setIsEditing(true);
        setActiveView('editor');
    };

    const openPostPreview = (postId) => {
        setSelectedPostId(postId);
        setActiveView('preview');
    };

    const handleChange = (field, value) => {
        setFormState((current) => ({ ...current, [field]: value }));
    };

    const handleLocalizedChange = (field, localeKey, value) => {
        setFormState((current) => ({
            ...current,
            [field]: {
                ...current[field],
                [localeKey]: value,
            },
        }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        const slug = formState.slug?.trim() || getLocalizedValue(formState.title, 'en')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

        saveBlogPost({ ...formState, slug });
        setIsEditing(false);
        setActiveView('list');
        setFormState(getBlankPost());
    };

    const handleImageUpload = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            handleChange('imageUrl', String(reader.result || ''));
        };
        reader.readAsDataURL(file);
    };

    const selectedPost = blogPosts.find((post) => post.id === selectedPostId) || null;

    return (
        <div className="container ckam-admin-page ckam-content-page">
            <div className="hk-pg-header pt-7">
                <div className="ckam-page-header ckam-page-header-title-only d-flex align-items-center">
                    <h1 className="pg-title mb-0">{copy.sidebar.blogs}</h1>
                </div>
            </div>

            <div className="hk-pg-body">
                <Row className="g-3 mb-4">
                    <Col lg={3} md={6}><MetricCard title={pageCopy.totalPosts} value={totalPosts} subtitle={pageCopy.totalPostsSubtitle} /></Col>
                    <Col lg={3} md={6}><MetricCard title={commonCopy.published} value={publishedPosts} subtitle={pageCopy.publishedPostsSubtitle} /></Col>
                    <Col lg={3} md={6}><MetricCard title={commonCopy.draft} value={draftPosts} subtitle={pageCopy.draftPostsSubtitle} /></Col>
                    <Col lg={3} md={6}><MetricCard title={pageCopy.featuredPosts} value={featuredPosts} subtitle={pageCopy.featuredPostsSubtitle} /></Col>
                </Row>

                {activeView === 'editor' && (
                    <SectionCard
                        title={isEditing ? pageCopy.editPost : pageCopy.createPost}
                        subtitle={pageCopy.editorSubtitle}
                        action={<Button variant="outline-light" onClick={() => setActiveView('list')}>{pageCopy.cancel}</Button>}
                    >
                        <Form onSubmit={handleSubmit}>
                            <div className="rounded-3 border p-3 bg-light-subtle mb-4" dir={isArabicForm ? 'rtl' : 'ltr'}>
                                <TranslationViewSelect
                                    locale={locale}
                                    value={translationLocale}
                                    onChange={setTranslationLocale}
                                    controlId="blog-translation-view"
                                />
                                <Form.Label className={labelAlignClass}>{localizedTitleLabel}</Form.Label>
                                <Form.Control
                                    value={formState.title?.[translationLocale] || ''}
                                    onChange={(event) => handleLocalizedChange('title', translationLocale, event.target.value)}
                                    required
                                />
                                <Form.Label className={`mt-3 ${labelAlignClass}`}>{localizedExcerptLabel}</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={2}
                                    value={formState.excerpt?.[translationLocale] || ''}
                                    onChange={(event) => handleLocalizedChange('excerpt', translationLocale, event.target.value)}
                                    required
                                />
                                <Form.Label className={`mt-3 ${labelAlignClass}`}>{localizedContentLabel}</Form.Label>
                                <BlogContentEditor
                                    localeKey={translationLocale}
                                    value={formState.content?.[translationLocale] || ''}
                                    onChange={(nextValue) => handleLocalizedChange('content', translationLocale, nextValue)}
                                    isRtl={isArabicForm}
                                />
                            </div>

                            <Row className="g-3">
                                <Col md={6}>
                                    <Form.Label>{pageCopy.slug}</Form.Label>
                                    <Form.Control value={formState.slug} onChange={(event) => handleChange('slug', event.target.value)} placeholder="my-blog-post-slug" />
                                </Col>
                                <Col md={6}>
                                    <Form.Label>{pageCopy.category}</Form.Label>
                                    <Form.Control value={formState.category} onChange={(event) => handleChange('category', event.target.value)} required />
                                </Col>
                                <Col md={6}>
                                    <Form.Label>{pageCopy.author}</Form.Label>
                                    <Form.Control value={formState.author} onChange={(event) => handleChange('author', event.target.value)} required />
                                </Col>
                                <Col md={6}>
                                    <Form.Label>{pageCopy.readTime}</Form.Label>
                                    <Form.Control value={formState.readTime} onChange={(event) => handleChange('readTime', event.target.value)} placeholder="8 min read" required />
                                </Col>
                                <Col md={6}>
                                    <Form.Label>{pageCopy.imageUrl}</Form.Label>
                                    <Form.Control value={formState.imageUrl} onChange={(event) => handleChange('imageUrl', event.target.value)} />
                                </Col>
                                <Col md={6}>
                                    <Form.Label>{pageCopy.imageUpload}</Form.Label>
                                    <Form.Control type="file" accept="image/*" onChange={handleImageUpload} />
                                </Col>
                                {!!formState.imageUrl && (
                                    <Col md={12}>
                                        <img src={formState.imageUrl} alt="Blog preview" style={{ maxWidth: '240px', borderRadius: '10px', border: '1px solid #E5E7EB' }} />
                                    </Col>
                                )}
                                <Col md={6}>
                                    <Form.Label>{pageCopy.publishDate}</Form.Label>
                                    <Form.Control type="date" value={formState.publishedAt} onChange={(event) => handleChange('publishedAt', event.target.value)} />
                                </Col>
                                <Col md={6}>
                                    <Form.Label>{pageCopy.status}</Form.Label>
                                    <Form.Select value={formState.status} onChange={(event) => handleChange('status', event.target.value)}>
                                        <option value="published">{commonCopy.published}</option>
                                        <option value="draft">{commonCopy.draft}</option>
                                    </Form.Select>
                                </Col>
                                <Col md={6} className="d-flex align-items-end">
                                    <Form.Check
                                        type="switch"
                                        id="blog-featured-toggle"
                                        label={pageCopy.featured}
                                        checked={formState.featured}
                                        onChange={(event) => handleChange('featured', event.target.checked)}
                                    />
                                </Col>
                                <Col md={12} className="d-flex gap-2">
                                    <Button type="submit" variant="primary">{isEditing ? pageCopy.updatePost : pageCopy.createPost}</Button>
                                    <Button type="button" variant="outline-light" onClick={openCreateForm}>{pageCopy.resetForm}</Button>
                                </Col>
                            </Row>
                        </Form>
                    </SectionCard>
                )}

                {activeView === 'preview' && selectedPost && (
                    <SectionCard
                        title={getLocalizedValue(selectedPost.title, locale)}
                        subtitle={selectedPost.slug ? `/${selectedPost.slug}` : ''}
                        action={(
                            <div className="d-flex gap-2">
                                <Button variant="outline-light" onClick={() => setActiveView('list')}>{pageCopy.cancel}</Button>
                                <Button variant="primary" onClick={() => openEditForm(selectedPost)}>{pageCopy.edit}</Button>
                            </div>
                        )}
                    >
                        <Row className="g-3">
                            <Col md={12}>
                                {!!selectedPost.imageUrl && (
                                    <img src={selectedPost.imageUrl} alt={getLocalizedValue(selectedPost.title, locale)} style={{ width: '100%', maxHeight: '340px', objectFit: 'cover', borderRadius: '12px' }} />
                                )}
                            </Col>
                            <Col md={12}>
                                <div className="d-flex gap-2 flex-wrap mb-2">
                                    <StatusPill label={getStatusLabel(selectedPost.status, locale)} tone={selectedPost.status} />
                                    <StatusPill label={selectedPost.category} tone="active" />
                                </div>
                                <div className="text-muted mb-3">
                                    {selectedPost.author} • {selectedPost.readTime} • {selectedPost.publishedAt}
                                </div>
                                <p className="text-muted">{getLocalizedValue(selectedPost.excerpt, locale)}</p>
                                <div dangerouslySetInnerHTML={{ __html: getLocalizedValue(selectedPost.content, locale) }} />
                            </Col>
                        </Row>
                    </SectionCard>
                )}

                {activeView === 'list' && (
                    <SectionCard
                    title={pageCopy.managerTitle}
                    subtitle={pageCopy.managerSubtitle}
                    action={<Button variant="primary" onClick={openCreateForm}>{pageCopy.createPost}</Button>}
                >
                    <Row className="mb-3">
                        <Col md={5}>
                            <Form.Control
                                value={searchTerm}
                                onChange={(event) => setSearchTerm(event.target.value)}
                                placeholder={pageCopy.searchPlaceholder}
                            />
                        </Col>
                    </Row>

                    <div className="table-responsive">
                        <table className="table align-middle mb-0">
                            <thead>
                                <tr>
                                    <th>{pageCopy.post}</th>
                                    <th>{pageCopy.category}</th>
                                    <th>{pageCopy.author}</th>
                                    <th>{pageCopy.status}</th>
                                    <th>{pageCopy.publishDate}</th>
                                    <th>{pageCopy.actions}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPosts.length ? filteredPosts.map((post) => (
                                    <tr key={post.id}>
                                        <td>
                                            <button
                                                type="button"
                                                className="btn btn-link p-0 fw-medium text-start text-decoration-none"
                                                onClick={() => openPostPreview(post.id)}
                                            >
                                                {getLocalizedValue(post.title, locale)}
                                            </button>
                                            <div className="fs-8 text-muted">/{post.slug}</div>
                                        </td>
                                        <td>{post.category}</td>
                                        <td>{post.author}</td>
                                        <td><StatusPill label={getStatusLabel(post.status, locale)} tone={post.status} /></td>
                                        <td>{post.publishedAt}</td>
                                        <td>
                                            <div className="d-flex gap-2">
                                                <Button variant="outline-light" size="sm" onClick={() => openEditForm(post)}>
                                                    <span className="d-inline-flex align-items-center gap-2"><Edit2 size={14} />{pageCopy.edit}</span>
                                                </Button>
                                                <Button variant="outline-danger" size="sm" onClick={() => deleteBlogPost(post.id)}>
                                                    <span className="d-inline-flex align-items-center gap-2"><Trash2 size={14} />{pageCopy.delete}</span>
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={6} className="text-center text-muted py-4">{pageCopy.emptyState}</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    </SectionCard>
                )}
            </div>
        </div>
    );
};

export default BlogManagement;
