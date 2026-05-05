import React, { useEffect, useState } from 'react';
import { Button, Col, Container, Form, Modal, Nav, Row, Tab } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { adminAuthApi } from '../../api/adminAuth';
import { useCkamAdmin } from './context';
import { adminCopy, getLocalizedValue } from './localization/i18n';
import { normalizeTranslationLocale, TranslationViewSelect, useAdminPageSetup } from './shared';
import './AdminEditProfile.css';

const SOCIAL_LINK_FIELDS = [
    { key: 'instagram', label: { en: 'Instagram', ar: 'إنستغرام' } },
    { key: 'tiktok', label: { en: 'TikTok', ar: 'تيك توك' } },
    { key: 'youtube', label: { en: 'YouTube', ar: 'يوتيوب' } },
    { key: 'facebook', label: { en: 'Facebook', ar: 'فيسبوك' } },
    { key: 'twitter', label: { en: 'Twitter / X', ar: 'إكس / تويتر' } },
    { key: 'snapchat', label: { en: 'Snapchat', ar: 'سناب شات' } },
    { key: 'linkedin', label: { en: 'LinkedIn', ar: 'لينكد إن' } },
    { key: 'whatsapp', label: { en: 'WhatsApp', ar: 'واتساب' } },
    { key: 'pinterest', label: { en: 'Pinterest', ar: 'بنترست' } },
];

const readFileAsDataUrl = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
});

const buildAdminFormState = (profile) => ({
    ...(profile || {}),
    socialLinks: {
        ...(profile?.socialLinks || {}),
    },
    twoFactorEnabled: profile?.twoFactorEnabled ?? false,
    twoFactorMethod: 'email',
    twoFactorEmail: profile?.twoFactorEmail || profile?.email || '',
    twoFactorPhone: profile?.twoFactorPhone || profile?.phone || '',
});

const AdminEditProfile = () => {
    useAdminPageSetup();

    const { adminProfile, fetchAdminProfile, locale } = useCkamAdmin();
    const [activeTab, setActiveTab] = useState('tabBlock1');
    const [formState, setFormState] = useState(buildAdminFormState(adminProfile));
    const copy = adminCopy[locale]?.adminEditProfile || adminCopy.en.adminEditProfile;
    const isArabic = locale === 'ar';
    const socialTabLabel = isArabic ? 'الروابط الاجتماعية' : (copy.tabs?.socialLinks || 'Social Links');
    const securityTabLabel = isArabic ? 'تسجيل الدخول والأمان' : (copy.tabs?.security || 'Login & Security');

    const [passwordForm, setPasswordForm] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [translationLocale, setTranslationLocale] = useState(normalizeTranslationLocale(locale));
    const localizedLabelAlignClass = translationLocale === 'ar' ? 'text-end d-block' : 'text-start d-block';
    const localizedLocationLabel = translationLocale === 'ar'
        ? (copy.locationAr || 'الموقع')
        : (copy.location || 'Location');
    const localizedBioLabel = translationLocale === 'ar'
        ? (copy.bioAr || 'نبذة')
        : (copy.bio || 'Bio');
    const [twoFactorNotice, setTwoFactorNotice] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [otpError, setOtpError] = useState('');
    const [otpModal, setOtpModal] = useState({
        show: false,
        nextEnabled: false,
    });

    useEffect(() => {
        fetchAdminProfile().catch(() => {
            // keep existing UI data if profile fetch fails
        });
    }, [fetchAdminProfile]);

    useEffect(() => {
        const nextState = buildAdminFormState(adminProfile);
        setFormState(nextState);
        setTwoFactorNotice('');
        setOtpCode('');
        setOtpError('');
        setOtpModal({ show: false, nextEnabled: false });
    }, [adminProfile]);

    useEffect(() => {
        setTranslationLocale(normalizeTranslationLocale(locale));
    }, [locale]);

    const setField = (field, value) => {
        setFormState((current) => ({
            ...current,
            [field]: value,
        }));
    };

    const setPasswordField = (field, value) => {
        setPasswordForm((current) => ({ ...current, [field]: value }));
    };

    const openOtpModalForToggle = async (nextEnabled) => {
        setOtpError('');
        setOtpCode('');

        try {
            const payload = await adminAuthApi.updateTwoFactor({
                enabled: Boolean(nextEnabled),
                channel: 'email',
            });

            setTwoFactorNotice(payload?.message || copy.twoFactorOtpPromptToggle || 'OTP sent successfully.');
            toast.success(payload?.message || 'OTP sent successfully.');
            setOtpModal({
                show: true,
                nextEnabled: Boolean(nextEnabled),
            });
        } catch (error) {
            toast.error(error.message || 'Unable to update 2-step verification.');
        }
    };

    const closeOtpModal = () => {
        setOtpModal({ show: false, nextEnabled: false });
        setOtpCode('');
        setOtpError('');
    };

    const verifyTwoFactorOtp = async () => {
        const otp = String(otpCode || '').trim();
        if (!/^\d{4,6}$/.test(otp)) {
            const message = copy.twoFactorOtpValidation || 'Enter a valid 4-6 digit OTP code.';
            setOtpError(message);
            toast.error(message);
            return;
        }

        try {
            const payload = await adminAuthApi.verifyTwoFactor({ otp });
            await fetchAdminProfile();
            setTwoFactorNotice(
                payload?.message
                || (otpModal.nextEnabled
                    ? (copy.twoFactorEnabledNotice || 'Two-step verification is now active.')
                    : (copy.twoFactorDisabledNotice || 'Two-step verification is now inactive.'))
            );
            toast.success(payload?.message || 'Two-step verification updated successfully.');
            closeOtpModal();
        } catch (error) {
            setOtpError(error.message || 'Invalid or expired OTP.');
            toast.error(error.message || 'Invalid or expired OTP.');
        }
    };

    const handleAvatarUpload = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const dataUrl = await readFileAsDataUrl(file);
        setField('avatar', dataUrl);
    };

    const handlePasswordUpdate = async () => {
        try {
            if (!passwordForm.oldPassword && !passwordForm.newPassword && !passwordForm.confirmPassword) {
                toast.info(copy.passwordNoChanges || 'Enter password fields to update login security.');
                return;
            }

            const response = await adminAuthApi.updateLoginSecurity({
                old_password: passwordForm.oldPassword || '',
                new_password: passwordForm.newPassword || '',
                confirm_password: passwordForm.confirmPassword || '',
            });

            setPasswordForm({
                oldPassword: '',
                newPassword: '',
                confirmPassword: '',
            });
            await fetchAdminProfile();
            toast.success(response?.message || copy.passwordUpdated || 'Password updated successfully.');
        } catch (error) {
            toast.error(error.message || 'Unable to update password.');
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            let response = null;

            if (activeTab === 'tabBlock1') {
                response = await adminAuthApi.updatePublicProfile({
                    first_name: formState.firstName || '',
                    last_name: formState.lastName || '',
                    location: formState.location || '',
                    bio: formState.bio?.en || '',
                    personal_website: formState.personalWebsite || formState.website || '',
                    image: formState.avatar || formState.imageUrl || '',
                });
            } else if (activeTab === 'tabBlock2') {
                response = await adminAuthApi.updateAccountSettings({
                    email: formState.email || '',
                    phone: formState.phone || '',
                });
            } else if (activeTab === 'tabBlock3') {
                response = await adminAuthApi.updateSocialLinks(
                    SOCIAL_LINK_FIELDS.reduce((accumulator, item) => ({
                        ...accumulator,
                        [item.key]: formState.socialLinks?.[item.key] || '',
                    }), {})
                );
            } else {
                return;
            }

            await fetchAdminProfile();
            toast.success(response?.message || copy.profileSaved || 'Settings updated successfully.');
        } catch (error) {
            toast.error(error.message || 'Unable to update settings.');
        }
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
                <Tab.Container activeKey={activeTab} onSelect={(key) => setActiveTab(key || 'tabBlock1')}>
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
                                    <Nav.Link eventKey="tabBlock3">{socialTabLabel}</Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link eventKey="tabBlock4">{securityTabLabel}</Nav.Link>
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
                                                                        {[formState.firstName?.[0], formState.lastName?.[0]].filter(Boolean).join('').toUpperCase()}
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
                                            <Col sm={12}>
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
                                                    <Form.Label>{translationLocale === 'ar' ? (copy.websiteAr || 'الموقع الإلكتروني') : (copy.website || 'Website')}</Form.Label>
                                                    <Form.Control
                                                        dir={translationLocale === 'ar' ? 'rtl' : 'ltr'}
                                                        value={formState.personalWebsite || formState.website || ''}
                                                        onChange={(e) => {
                                                            setField('personalWebsite', e.target.value);
                                                            setField('website', e.target.value);
                                                        }}
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
                                                        onChange={(e) => setField('bio', { ...(formState.bio || {}), [translationLocale]: e.target.value })}
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
                                        <Row className="gx-3">
                                            {SOCIAL_LINK_FIELDS.map((item) => (
                                                <Col sm={6} key={item.key}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>{isArabic ? item.label.ar : item.label.en}</Form.Label>
                                                        <Form.Control
                                                            value={formState.socialLinks?.[item.key] || ''}
                                                            onChange={(e) => setField('socialLinks', {
                                                                ...(formState.socialLinks || {}),
                                                                [item.key]: e.target.value,
                                                            })}
                                                        />
                                                    </Form.Group>
                                                </Col>
                                            ))}
                                        </Row>
                                    </Tab.Pane>

                                    <Tab.Pane eventKey="tabBlock4">
                                        <div className="title-lg fs-4"><span>{securityTabLabel}</span></div>
                                        <p className="mb-4 text-muted">{copy.securitySubtitle || 'Control password and 2-step verification settings for account protection.'}</p>

                                        <div className="border rounded-3 p-3 bg-light-subtle mb-4">
                                            <div className="title-xs text-primary text-uppercase mb-3">
                                                <span>{copy.passwordSectionTitle || 'Password'}</span>
                                            </div>
                                            <Row className="gx-3">
                                                <Col sm={12}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>{copy.oldPassword}</Form.Label>
                                                        <Form.Control type="password" value={passwordForm.oldPassword} onChange={(e) => setPasswordField('oldPassword', e.target.value)} />
                                                    </Form.Group>
                                                </Col>
                                                <Col sm={6}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>{copy.newPassword}</Form.Label>
                                                        <Form.Control type="password" value={passwordForm.newPassword} onChange={(e) => setPasswordField('newPassword', e.target.value)} />
                                                    </Form.Group>
                                                </Col>
                                                <Col sm={6}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>{copy.confirmPassword}</Form.Label>
                                                        <Form.Control type="password" value={passwordForm.confirmPassword} onChange={(e) => setPasswordField('confirmPassword', e.target.value)} />
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                            <Button type="button" variant="soft-primary" onClick={handlePasswordUpdate}>
                                                {copy.passwordUpdateButton || 'Update Password'}
                                            </Button>
                                        </div>

                                        <div className="border rounded-3 p-3 bg-light-subtle mb-4">
                                            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                                                <div className="title-xs text-primary text-uppercase mb-0">
                                                    <span>{copy.twoFactorSectionTitle || '2-Step Verification'}</span>
                                                </div>
                                                <Form.Check
                                                    type="switch"
                                                    id="admin-two-factor-toggle"
                                                    className="mb-0"
                                                    checked={Boolean(formState.twoFactorEnabled)}
                                                    onChange={(e) => openOtpModalForToggle(e.target.checked)}
                                                    label={formState.twoFactorEnabled
                                                        ? (copy.twoFactorStatusActive || 'Active')
                                                        : (copy.twoFactorStatusInactive || 'Inactive')}
                                                />
                                            </div>

                                            <Row className="gx-3">
                                                <Col sm={6}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>{copy.twoFactorMethodLabel || 'Verification Method'}</Form.Label>
                                                        <Form.Control value={copy.twoFactorMethodEmail || 'Email'} readOnly />
                                                    </Form.Group>
                                                </Col>
                                                <Col sm={6}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>{copy.twoFactorEmailLabel || copy.email}</Form.Label>
                                                        <Form.Control type="email" value={formState.twoFactorEmail || formState.email || ''} readOnly />
                                                    </Form.Group>
                                                </Col>
                                            </Row>

                                            {twoFactorNotice ? <div className="text-success fs-8 mb-3">{twoFactorNotice}</div> : null}
                                        </div>
                                    </Tab.Pane>
                                </Tab.Content>

                                {activeTab !== 'tabBlock4' ? (
                                    <Button variant="primary" type="submit" className="mt-5">
                                        {copy.saveChanges}
                                    </Button>
                                ) : null}
                            </Form>
                        </Col>
                    </Row>
                </Tab.Container>
            </div>

            <Modal show={otpModal.show} onHide={closeOtpModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>{copy.twoFactorOtpTitle || 'Verify OTP'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p className="text-muted mb-3">{copy.twoFactorOtpPromptToggle || 'Enter the OTP to update 2-step verification status.'}</p>
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
                        {copy.twoFactorOtpCancel || 'Cancel'}
                    </Button>
                    <Button variant="primary" onClick={verifyTwoFactorOtp}>
                        {copy.twoFactorOtpVerify || 'Verify'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default AdminEditProfile;
