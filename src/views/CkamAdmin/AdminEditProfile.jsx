import React, { useEffect, useState } from 'react';
import { Button, Col, Container, Form, Modal, Nav, Row, Tab } from 'react-bootstrap';
import { Link, useHistory } from 'react-router-dom';
import { useCkamAdmin } from './context';
import { adminCopy, getLocalizedValue } from './localization/i18n';
import { normalizeTranslationLocale, TranslationViewSelect, useAdminPageSetup } from './shared';
import { setAdminTwoFactorEnabled } from '../../api/authSession';
import './AdminEditProfile.css';

const readFileAsDataUrl = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
});

const buildAdminFormState = (profile) => ({
    ...(profile || {}),
    twoFactorEnabled: profile?.twoFactorEnabled ?? false,
    twoFactorMethod: 'email',
    twoFactorEmail: profile?.twoFactorEmail || profile?.email || '',
    twoFactorPhone: profile?.twoFactorPhone || profile?.phone || '',
});

const AdminEditProfile = () => {
    useAdminPageSetup();

    const history = useHistory();
    const { adminProfile, saveAdminProfile, locale } = useCkamAdmin();
    const [formState, setFormState] = useState(buildAdminFormState(adminProfile));
    const copy = adminCopy[locale]?.adminEditProfile || adminCopy.en.adminEditProfile;
    const isArabic = locale === 'ar';
    const securityTabLabel = copy.tabs?.security || (isArabic ? 'تسجيل الدخول والأمان' : 'Login & Security');

    const [passwordForm, setPasswordForm] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [translationLocale, setTranslationLocale] = useState(normalizeTranslationLocale(locale));
    const localizedLabelAlignClass = translationLocale === 'ar' ? 'text-end d-block' : 'text-start d-block';
    const localizedRoleLabel = translationLocale === 'ar' ? 'الدور' : 'Role';
    const localizedLocationLabel = translationLocale === 'ar' ? 'الموقع' : 'Location';
    const localizedBioLabel = translationLocale === 'ar' ? 'نبذة' : 'Bio';
    const [twoFactorDraft, setTwoFactorDraft] = useState({
        method: 'email',
        email: formState.twoFactorEmail || formState.email || '',
        phone: formState.twoFactorPhone || formState.phone || '',
    });
    const [twoFactorError, setTwoFactorError] = useState('');
    const [twoFactorNotice, setTwoFactorNotice] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [otpError, setOtpError] = useState('');
    const [otpModal, setOtpModal] = useState({
        show: false,
        mode: 'toggle',
        nextEnabled: false,
        settings: null,
    });

    useEffect(() => {
        const nextState = buildAdminFormState(adminProfile);
        setFormState(nextState);
        setTwoFactorDraft({
            method: 'email',
            email: nextState.twoFactorEmail || nextState.email || '',
            phone: nextState.twoFactorPhone || nextState.phone || '',
        });
        setTwoFactorError('');
        setTwoFactorNotice('');
        setOtpCode('');
        setOtpError('');
        setOtpModal({ show: false, mode: 'toggle', nextEnabled: false, settings: null });
    }, [adminProfile]);

    useEffect(() => {
        setTranslationLocale(normalizeTranslationLocale(locale));
    }, [locale]);

    const setField = (field, value) => {
        setFormState((current) => {
            const next = { ...current, [field]: value };

            if (field === 'email' && (!current.twoFactorEmail || current.twoFactorEmail === current.email)) {
                next.twoFactorEmail = value;
            }

            if (field === 'phone' && (!current.twoFactorPhone || current.twoFactorPhone === current.phone)) {
                next.twoFactorPhone = value;
            }

            return next;
        });
    };

    const setPasswordField = (field, value) => {
        setPasswordForm((current) => ({ ...current, [field]: value }));
    };

    const setTwoFactorDraftField = (field, value) => {
        setTwoFactorDraft((current) => ({ ...current, [field]: value }));
        setTwoFactorError('');
        setTwoFactorNotice('');
    };

    const openOtpModalForToggle = (nextEnabled) => {
        setOtpError('');
        setOtpCode('');
        setOtpModal({
            show: true,
            mode: 'toggle',
            nextEnabled: Boolean(nextEnabled),
            settings: null,
        });
    };

    const openOtpModalForSettings = () => {
        const method = 'email';
        const targetValue = String(twoFactorDraft.email || '').trim();

        if (!targetValue) {
            setTwoFactorError(
                copy.twoFactorEmailRequired || 'Email is required for email verification.'
            );
            return;
        }

        setTwoFactorError('');
        setTwoFactorNotice('');
        setOtpError('');
        setOtpCode('');
        setOtpModal({
            show: true,
            mode: 'settings',
            nextEnabled: formState.twoFactorEnabled,
            settings: {
                method,
                email: String(twoFactorDraft.email || '').trim(),
                phone: '',
            },
        });
    };

    const closeOtpModal = () => {
        setOtpModal({ show: false, mode: 'toggle', nextEnabled: false, settings: null });
        setOtpCode('');
        setOtpError('');
    };

    const verifyTwoFactorOtp = () => {
        const otp = String(otpCode || '').trim();
        if (!/^\d{4,6}$/.test(otp)) {
            setOtpError(copy.twoFactorOtpValidation || 'Enter a valid 4-6 digit OTP code.');
            return;
        }

        if (otpModal.mode === 'toggle') {
            setField('twoFactorEnabled', otpModal.nextEnabled);
            setTwoFactorNotice(
                otpModal.nextEnabled
                    ? (copy.twoFactorEnabledNotice || 'Two-step verification is now active.')
                    : (copy.twoFactorDisabledNotice || 'Two-step verification is now inactive.')
            );
        }

        if (otpModal.mode === 'settings' && otpModal.settings) {
            setField('twoFactorMethod', otpModal.settings.method);
            setField('twoFactorEmail', otpModal.settings.email);
            setField('twoFactorPhone', otpModal.settings.phone);
            setTwoFactorNotice(copy.twoFactorSettingsSaved || 'Two-step verification settings updated successfully.');
        }

        closeOtpModal();
    };

    const handleAvatarUpload = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const dataUrl = await readFileAsDataUrl(file);
        setField('avatar', dataUrl);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        setAdminTwoFactorEnabled(Boolean(formState.twoFactorEnabled));
        saveAdminProfile(formState);
        history.push('/admin/profile');
    };

    return (
        <Container className="ckam-admin-page ckam-admin-edit-profile-page">

            <div className="hk-pg-header pt-7 pb-4">
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                    <div>
                        <h1 className="pg-title mb-1">{copy.title}</h1>
                        <p className="mb-0 text-muted">{copy.subtitle}</p>
                    </div>
                    <Button as={Link} to="/admin/profile" variant="outline-light">
                        {copy.backToProfile}
                    </Button>
                </div>
            </div>

            <div className="hk-pg-body">
                <Tab.Container defaultActiveKey="tabBlock1">
                    <div className="card mb-4 p-2">
                        <div className="tabs-scroll">
                            <Nav variant="pills" className="flex-nowrap">
                                <Nav.Item>
                                    <Nav.Link eventKey="tabBlock1">{copy.tabs.profile}</Nav.Link>
                                </Nav.Item>

                                <Nav.Item>
                                    <Nav.Link eventKey="tabBlock2">{copy.tabs.accountSettings}</Nav.Link>
                                </Nav.Item>

                                <Nav.Item>
                                    <Nav.Link eventKey="tabBlock3">{securityTabLabel}</Nav.Link>
                                </Nav.Item>
                            </Nav>
                        </div>
                    </div>

                    <Row>
                        <Col xs={12}>
                            <Form onSubmit={handleSubmit}>
                                <Tab.Content>
                                    <Tab.Pane eventKey="tabBlock1">
                                        <Row className="gx-3">
                                            <Col sm={12}>
                                                <Form.Group>
                                                    <div className="media align-items-center">
                                                        <div className="media-head me-5">
                                                            <div className="avatar avatar-rounded avatar-xxl overflow-hidden avatar-soft-primary">
                                                                {formState.avatar ? (
                                                                    <img src={formState.avatar} alt="admin" className="avatar-img" />
                                                                ) : (
                                                                    <span className="initial-wrap fs-2 fw-semibold">
                                                                        {[formState.firstName?.[0], formState.lastName?.[0]]
                                                                            .filter(Boolean)
                                                                            .join('')
                                                                            .toUpperCase()}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="media-body">
                                                            <Button variant="soft-primary" className="btn-file mb-1">
                                                                {copy.uploadPhoto}
                                                                <Form.Control type="file" className="upload" onChange={handleAvatarUpload} />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </Form.Group>
                                            </Col>
                                        </Row>

                                        <div className="title title-xs text-primary my-4">
                                            <span>{copy.personalInfo}</span>
                                        </div>

                                        <Row className="gx-3">
                                            <Col sm={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>{copy.firstName}</Form.Label>
                                                    <Form.Control value={formState.firstName} onChange={(e) => setField('firstName', e.target.value)} />
                                                </Form.Group>
                                            </Col>

                                            <Col sm={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>{copy.lastName}</Form.Label>
                                                    <Form.Control value={formState.lastName} onChange={(e) => setField('lastName', e.target.value)} />
                                                </Form.Group>
                                            </Col>
                                        </Row>

                                        <Row className="gx-3">
                                            <Col sm={12}>
                                                <TranslationViewSelect
                                                    locale={locale}
                                                    value={translationLocale}
                                                    onChange={setTranslationLocale}
                                                    controlId="admin-profile-translation-view"
                                                />
                                            </Col>
                                        </Row>

                                        <Row className="gx-3">
                                            <Col sm={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label className={localizedLabelAlignClass}>{localizedRoleLabel}</Form.Label>
                                                    <Form.Control
                                                        dir={translationLocale === 'ar' ? 'rtl' : 'ltr'}
                                                        value={translationLocale === 'ar' ? (formState.roleAr || '') : (formState.role || '')}
                                                        onChange={(e) => setField(translationLocale === 'ar' ? 'roleAr' : 'role', e.target.value)}
                                                    />
                                                </Form.Group>
                                            </Col>

                                            <Col sm={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label className={localizedLabelAlignClass}>{localizedLocationLabel}</Form.Label>
                                                    <Form.Control
                                                        dir={translationLocale === 'ar' ? 'rtl' : 'ltr'}
                                                        value={translationLocale === 'ar' ? (formState.locationAr || '') : (formState.location || '')}
                                                        onChange={(e) => setField(translationLocale === 'ar' ? 'locationAr' : 'location', e.target.value)}
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>

                                        <Row className="gx-3">
                                            <Col sm={12}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label className={localizedLabelAlignClass}>{localizedBioLabel}</Form.Label>
                                                    <Form.Control
                                                        as="textarea"
                                                        rows={5}
                                                        dir={translationLocale === 'ar' ? 'rtl' : 'ltr'}
                                                        value={getLocalizedValue(formState.bio, translationLocale)}
                                                        onChange={(e) =>
                                                            setField('bio', {
                                                                ...(formState.bio || {}),
                                                                [translationLocale]: e.target.value,
                                                            })
                                                        }
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                    </Tab.Pane>

                                    <Tab.Pane eventKey="tabBlock2">
                                        <Row className="gx-3">
                                            <Col sm={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>{copy.email}</Form.Label>
                                                    <Form.Control value={formState.email} onChange={(e) => setField('email', e.target.value)} />
                                                </Form.Group>
                                            </Col>

                                            <Col sm={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>{copy.phone}</Form.Label>
                                                    <Form.Control value={formState.phone} onChange={(e) => setField('phone', e.target.value)} />
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                    </Tab.Pane>

                                    <Tab.Pane eventKey="tabBlock3">
                                        <div className="title-lg fs-4"><span>{securityTabLabel}</span></div>
                                        <p className="mb-4 text-muted">
                                            {copy.securitySubtitle || (isArabic ? 'تحكم في كلمة المرور والتحقق بخطوتين لحماية الحساب.' : 'Control password and 2-step verification settings for account protection.')}
                                        </p>

                                        <div className="border rounded-3 p-3 bg-light-subtle mb-4">
                                            <div className="title-xs text-primary text-uppercase mb-3">
                                                <span>{copy.passwordSectionTitle || (isArabic ? 'كلمة المرور' : 'Password')}</span>
                                            </div>

                                            <Row className="gx-3">
                                                <Col sm={12}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>{copy.oldPassword}</Form.Label>
                                                        <Form.Control
                                                            type="password"
                                                            value={passwordForm.oldPassword}
                                                            onChange={(e) => setPasswordField('oldPassword', e.target.value)}
                                                        />
                                                    </Form.Group>
                                                </Col>

                                                <Col sm={6}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>{copy.newPassword}</Form.Label>
                                                        <Form.Control
                                                            type="password"
                                                            value={passwordForm.newPassword}
                                                            onChange={(e) => setPasswordField('newPassword', e.target.value)}
                                                        />
                                                    </Form.Group>
                                                </Col>

                                                <Col sm={6}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>{copy.confirmPassword}</Form.Label>
                                                        <Form.Control
                                                            type="password"
                                                            value={passwordForm.confirmPassword}
                                                            onChange={(e) => setPasswordField('confirmPassword', e.target.value)}
                                                        />
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                        </div>

                                        <div className="border rounded-3 p-3 bg-light-subtle mb-4">
                                            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                                                <div className="title-xs text-primary text-uppercase mb-0">
                                                    <span>{copy.twoFactorSectionTitle || (isArabic ? 'التحقق بخطوتين' : '2-Step Verification')}</span>
                                                </div>
                                                <Form.Check
                                                    type="switch"
                                                    id="admin-two-factor-toggle"
                                                    className="mb-0"
                                                    checked={Boolean(formState.twoFactorEnabled)}
                                                    onChange={(e) => openOtpModalForToggle(e.target.checked)}
                                                    label={formState.twoFactorEnabled
                                                        ? (copy.twoFactorStatusActive || (isArabic ? 'مفعل' : 'Active'))
                                                        : (copy.twoFactorStatusInactive || (isArabic ? 'غير مفعل' : 'Inactive'))}
                                                />
                                            </div>

                                            <Row className="gx-3">
                                                <Col sm={6}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>{copy.twoFactorMethodLabel || (isArabic ? 'طريقة التحقق' : 'Verification Method')}</Form.Label>
                                                        <Form.Select value="email" disabled>
                                                            <option value="email">{copy.twoFactorMethodEmail || (isArabic ? 'البريد الإلكتروني' : 'Email')}</option>
                                                        </Form.Select>
                                                    </Form.Group>
                                                </Col>
                                                <Col sm={6}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>{copy.twoFactorEmailLabel || copy.email}</Form.Label>
                                                        <Form.Control type="email" value={twoFactorDraft.email} readOnly />
                                                    </Form.Group>
                                                </Col>
                                            </Row>

                                            {twoFactorError ? <div className="text-danger fs-8 mb-3">{twoFactorError}</div> : null}
                                            {twoFactorNotice ? <div className="text-success fs-8 mb-3">{twoFactorNotice}</div> : null}

                                            <Button type="button" variant="soft-primary" onClick={openOtpModalForSettings}>
                                                {copy.twoFactorUpdateButton || (isArabic ? 'تحديث التحقق بخطوتين' : 'Update 2-Step Verification')}
                                            </Button>
                                        </div>
                                    </Tab.Pane>
                                </Tab.Content>

                                <Button variant="primary" type="submit" className="mt-5">
                                    {copy.saveChanges}
                                </Button>
                            </Form>
                        </Col>
                    </Row>
                </Tab.Container>
            </div>

            <Modal show={otpModal.show} onHide={closeOtpModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>{copy.twoFactorOtpTitle || (isArabic ? 'التحقق من رمز OTP' : 'Verify OTP')}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p className="text-muted mb-3">
                        {otpModal.mode === 'settings'
                            ? (copy.twoFactorOtpPromptSettings || (isArabic ? 'أدخل رمز OTP لتطبيق إعدادات التحقق بخطوتين.' : 'Enter the OTP to apply 2-step verification settings.'))
                            : (copy.twoFactorOtpPromptToggle || (isArabic ? 'أدخل رمز OTP لتحديث حالة التحقق بخطوتين.' : 'Enter the OTP to update 2-step verification status.'))}
                    </p>
                    <Form.Group className="mb-2">
                        <Form.Label>{copy.twoFactorOtpLabel || 'OTP Code'}</Form.Label>
                        <Form.Control
                            value={otpCode}
                            onChange={(e) => {
                                setOtpCode(e.target.value);
                                setOtpError('');
                            }}
                            placeholder={copy.twoFactorOtpPlaceholder || 'Enter OTP'}
                            inputMode="numeric"
                        />
                    </Form.Group>
                    {otpError ? <div className="text-danger fs-8 mt-2">{otpError}</div> : null}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="outline-light" onClick={closeOtpModal}>
                        {copy.twoFactorOtpCancel || (isArabic ? 'إلغاء' : 'Cancel')}
                    </Button>
                    <Button variant="primary" onClick={verifyTwoFactorOtp}>
                        {copy.twoFactorOtpVerify || (isArabic ? 'تحقق' : 'Verify')}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default AdminEditProfile;
