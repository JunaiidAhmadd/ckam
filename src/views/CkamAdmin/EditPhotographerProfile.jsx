import React, { useEffect, useMemo, useState } from 'react';
import { Button, Card, Col, Container, Form, Modal, Nav, Row, Tab } from 'react-bootstrap';
import { Link, useHistory, useParams } from 'react-router-dom';
import { useCkamAdmin } from './context';
import { adminCopy, getLocalizedValue, getStatusLabel } from './localization/i18n';
import { normalizeTranslationLocale, TranslationViewSelect, useAdminPageSetup } from './shared';

const readFileAsDataUrl = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
});

const splitName = (name = '') => {
    const parts = String(name).trim().split(/\s+/).filter(Boolean);
    return {
        firstName: parts[0] || '',
        lastName: parts.slice(1).join(' '),
    };
};

const EditPhotographerProfile = () => {
    useAdminPageSetup();

    const { id } = useParams();
    const history = useHistory();
    const { locale, photographers, plans, savePhotographerProfile } = useCkamAdmin();
    const copy = adminCopy[locale].profilePage;
    const formLocale = normalizeTranslationLocale(locale);
    const photographer = photographers.find((item) => item.id === id);

    const initialForm = useMemo(() => {
        if (!photographer) {
            return null;
        }

        const { firstName, lastName } = splitName(photographer.name);

        return {
            avatar: photographer.avatar || '',
            firstName,
            lastName,
            businessName: photographer.businessName || '',
            city: photographer.city || '',
            specialty: photographer.specialty || '',
            bioEn: photographer.about?.en || '',
            bioAr: photographer.about?.ar || '',
            publicUrl: photographer.publicUrl || '',
            email: photographer.email || '',
            phone: photographer.phone || '',
            preferredLanguage: photographer.preferredLanguage || 'English',
            preferredLanguageAr: photographer.preferredLanguageAr || '',
            preferredCurrency: photographer.preferredCurrency || 'USD',
            planId: photographer.planId || '',
            accountStatus: photographer.accountStatus || 'active',
            tapStatus: photographer.tapStatus || 'pending',
            kycSubmitted: Boolean(photographer.kycSubmitted),
            discoverByEmail: photographer.discoverByEmail ?? true,
            keepPhonePrivate: photographer.keepPhonePrivate ?? false,
            locationSharing: photographer.locationSharing ?? false,
            twoFactorEnabled: photographer.twoFactorEnabled ?? false,
            twoFactorMethod: photographer.twoFactorMethod === 'sms' ? 'sms' : 'email',
            twoFactorEmail: photographer.twoFactorEmail || photographer.email || '',
            twoFactorPhone: photographer.twoFactorPhone || photographer.phone || '',
        };
    }, [photographer]);

    const [formState, setFormState] = useState(initialForm);
    const [passwordForm, setPasswordForm] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [translationLocale, setTranslationLocale] = useState(formLocale);
    const [twoFactorDraft, setTwoFactorDraft] = useState({
        method: 'email',
        email: '',
        phone: '',
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
    const localizedLabelAlignClass = translationLocale === 'ar' ? 'text-end d-block' : 'text-start d-block';
    const localizedBioLabel = translationLocale === 'ar' ? 'نبذة' : 'Bio';
    const localizedPreferredLanguageLabel = translationLocale === 'ar' ? 'اللغة المفضلة' : 'Preferred language';

    useEffect(() => {
        setFormState(initialForm);
        setTwoFactorDraft({
            method: initialForm?.twoFactorMethod === 'sms' ? 'sms' : 'email',
            email: initialForm?.twoFactorEmail || initialForm?.email || '',
            phone: initialForm?.twoFactorPhone || initialForm?.phone || '',
        });
        setTwoFactorError('');
        setTwoFactorNotice('');
        setOtpCode('');
        setOtpError('');
        setOtpModal({ show: false, mode: 'toggle', nextEnabled: false, settings: null });
    }, [initialForm]);

    useEffect(() => {
        setTranslationLocale(formLocale);
    }, [formLocale]);

    if (!photographer || !formState) {
        return (
            <div className="container ckam-admin-page ckam-admin-profile-page">
                <div className="hk-pg-body py-7">
                    <Card className="card-border">
                        <Card.Body>
                            <h4 className="mb-3">{copy.title}</h4>
                            <p className="text-muted mb-3">{copy.notFoundSubtitle}</p>
                            <Button as={Link} to="/admin/photographers" variant="primary">{copy.back}</Button>
                        </Card.Body>
                    </Card>
                </div>
            </div>
        );
    }

    const setField = (field, value) => {
        setFormState((current) => ({ ...current, [field]: value }));
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
        const method = twoFactorDraft.method === 'sms' ? 'sms' : 'email';
        const targetValue = method === 'sms'
            ? String(twoFactorDraft.phone || '').trim()
            : String(twoFactorDraft.email || '').trim();

        if (!targetValue) {
            setTwoFactorError(
                method === 'sms'
                    ? (copy.twoFactorPhoneRequired || 'Phone number is required for SMS verification.')
                    : (copy.twoFactorEmailRequired || 'Email is required for email verification.')
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
                phone: String(twoFactorDraft.phone || '').trim(),
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
        if (!file) {
            return;
        }

        const dataUrl = await readFileAsDataUrl(file);
        setField('avatar', dataUrl);
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        savePhotographerProfile(id, {
            avatar: formState.avatar,
            name: [formState.firstName, formState.lastName].filter(Boolean).join(' ').trim(),
            businessName: formState.businessName,
            city: formState.city,
            specialty: formState.specialty,
            about: {
                en: formState.bioEn,
                ar: formState.bioAr,
            },
            publicUrl: formState.publicUrl,
            email: formState.email,
            phone: formState.phone,
            preferredLanguage: formState.preferredLanguage,
            preferredLanguageAr: formState.preferredLanguageAr,
            preferredCurrency: formState.preferredCurrency,
            planId: formState.planId,
            planName: plans.find((plan) => plan.id === formState.planId)?.name || photographer.planName,
            accountStatus: formState.accountStatus,
            tapStatus: formState.tapStatus,
            kycSubmitted: formState.kycSubmitted,
            discoverByEmail: formState.discoverByEmail,
            keepPhonePrivate: formState.keepPhonePrivate,
            locationSharing: formState.locationSharing,
            twoFactorEnabled: formState.twoFactorEnabled,
            twoFactorMethod: formState.twoFactorMethod || 'email',
            twoFactorEmail: formState.twoFactorEmail || '',
            twoFactorPhone: formState.twoFactorPhone || '',
        });

        history.push(`/admin/photographers/${id}`);
    };

    return (
        <Container className="ckam-admin-page ckam-admin-edit-profile-page">
            <div className="hk-pg-header pt-7 pb-4">
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                    <div>
                        <h1 className="pg-title mb-1">{copy.editProfileTitle || 'Edit Profile'}</h1>
                        <p className="mb-0 text-muted">{copy.editProfileSubtitle || 'Update photographer details, profile content, account access, and security preferences.'}</p>
                    </div>
                    <Button as={Link} to={`/admin/photographers/${id}`} variant="outline-light">{copy.back}</Button>
                </div>
            </div>
            <div className="hk-pg-body">
                <Tab.Container defaultActiveKey="tabBlock1">
                    <Row className="edit-profile-wrap">
                        <Col xs={12} sm={3} lg={2}>
                            <div className="nav-profile mt-4">
                                <div className="nav-header">
                                    <span>{copy.accountSectionTitle || 'Account'}</span>
                                </div>
                                <Nav as="ul" variant="tabs" className="nav-light nav-vertical">
                                    <Nav.Item as="li"><Nav.Link eventKey="tabBlock1"><span className="nav-link-text">{copy.publicProfileTab || 'Public Profile'}</span></Nav.Link></Nav.Item>
                                    <Nav.Item as="li"><Nav.Link eventKey="tabBlock2"><span className="nav-link-text">{copy.accountSettingsTab || 'Account Settings'}</span></Nav.Link></Nav.Item>
                                    <Nav.Item as="li"><Nav.Link eventKey="tabBlock4"><span className="nav-link-text">{copy.securityTab || 'Login & Security'}</span></Nav.Link></Nav.Item>
                                </Nav>
                            </div>
                        </Col>
                        <Col lg={10} sm={9} xs={12}>
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
                                                                    <img src={formState.avatar} alt="user" className="avatar-img" />
                                                                ) : (
                                                                    <span className="initial-wrap fs-2 fw-semibold">
                                                                        {([formState.firstName?.[0], formState.lastName?.[0]].filter(Boolean).join('') || photographer.name.slice(0, 2)).toUpperCase()}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="media-body">
                                                            <Button variant="soft-primary" className="btn-file mb-1">
                                                                {copy.uploadPhoto || 'Upload Photo'}
                                                                <Form.Control type="file" className="upload" accept="image/*" onChange={handleAvatarUpload} />
                                                            </Button>
                                                            <Form.Text as="div" className="form-text text-muted">
                                                                {copy.avatarHelp || 'Recommended size 450px x 450px. Max size 5mb.'}
                                                            </Form.Text>
                                                        </div>
                                                    </div>
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                        <div className="title title-xs title-wth-divider text-primary text-uppercase my-4"><span>{copy.personalInfoTitle || 'Personal Info'}</span></div>
                                        <Row className="gx-3">
                                            <Col sm={6}><Form.Group className="mb-3"><Form.Label>{copy.firstNameLabel || 'First Name'}</Form.Label><Form.Control type="text" value={formState.firstName} onChange={(e) => setField('firstName', e.target.value)} /></Form.Group></Col>
                                            <Col sm={6}><Form.Group className="mb-3"><Form.Label>{copy.lastNameLabel || 'Last Name'}</Form.Label><Form.Control type="text" value={formState.lastName} onChange={(e) => setField('lastName', e.target.value)} /></Form.Group></Col>
                                        </Row>
                                        <Row className="gx-3">
                                            <Col sm={6}><Form.Group className="mb-3"><Form.Label>{copy.businessNameLabel || 'Business Name'}</Form.Label><Form.Control type="text" value={formState.businessName} onChange={(e) => setField('businessName', e.target.value)} /></Form.Group></Col>
                                            <Col sm={6}><Form.Group className="mb-3"><Form.Label>{copy.city}</Form.Label><Form.Control type="text" value={formState.city} onChange={(e) => setField('city', e.target.value)} /></Form.Group></Col>
                                        </Row>
                                        <Row className="gx-3">
                                            <Col sm={12}><Form.Group className="mb-3"><Form.Label>{copy.specialty}</Form.Label><Form.Control type="text" value={formState.specialty} onChange={(e) => setField('specialty', e.target.value)} /></Form.Group></Col>
                                        </Row>
                                        <Row className="gx-3">
                                            <Col sm={12}>
                                                <TranslationViewSelect
                                                    locale={locale}
                                                    value={translationLocale}
                                                    onChange={setTranslationLocale}
                                                    controlId="photographer-profile-translation-view"
                                                />
                                            </Col>
                                            <Col sm={12}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label className={localizedLabelAlignClass}>{localizedBioLabel}</Form.Label>
                                                    <Form.Control
                                                        as="textarea"
                                                        rows={6}
                                                        dir={translationLocale === 'ar' ? 'rtl' : 'ltr'}
                                                        value={translationLocale === 'ar' ? formState.bioAr : formState.bioEn}
                                                        onChange={(e) => setField(translationLocale === 'ar' ? 'bioAr' : 'bioEn', e.target.value)}
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                    </Tab.Pane>

                                    <Tab.Pane eventKey="tabBlock2">
                                        <div className="title-lg fs-4"><span>{copy.accountSettingsTab || 'Account Settings'}</span></div>
                                        <p className="mb-4 text-muted">{copy.accountSettingsSubtitle || 'Manage contact details, plan assignment, language, and currency preferences.'}</p>
                                        <Row className="gx-3">
                                            <Col sm={6}><Form.Group className="mb-3"><Form.Label>{copy.email}</Form.Label><Form.Control type="email" value={formState.email} onChange={(e) => setField('email', e.target.value)} /></Form.Group></Col>
                                            <Col sm={6}><Form.Group className="mb-3"><Form.Label>{copy.phone}</Form.Label><Form.Control type="text" value={formState.phone} onChange={(e) => setField('phone', e.target.value)} /></Form.Group></Col>
                                        </Row>
                                        <Row className="gx-3">
                                            <Col sm={12}><Form.Group className="mb-3"><Form.Label>{copy.plan}</Form.Label><Form.Select value={formState.planId} onChange={(e) => setField('planId', e.target.value)}>{plans.map((plan) => <option key={plan.id} value={plan.id}>{getLocalizedValue(plan.name, locale)}</option>)}</Form.Select></Form.Group></Col>
                                        </Row>
                                        <Row className="gx-3">
                                            <Col sm={12}>
                                                <TranslationViewSelect
                                                    locale={locale}
                                                    value={translationLocale}
                                                    onChange={setTranslationLocale}
                                                    controlId="photographer-account-translation-view"
                                                />
                                            </Col>
                                        </Row>
                                        <Row className="gx-3">
                                            <Col sm={12}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label className={localizedLabelAlignClass}>{localizedPreferredLanguageLabel}</Form.Label>
                                                    <Form.Control
                                                        dir={translationLocale === 'ar' ? 'rtl' : 'ltr'}
                                                        type="text"
                                                        value={translationLocale === 'ar' ? formState.preferredLanguageAr : formState.preferredLanguage}
                                                        onChange={(e) => setField(translationLocale === 'ar' ? 'preferredLanguageAr' : 'preferredLanguage', e.target.value)}
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                        <Row className="gx-3">
                                            <Col sm={6}><Form.Group className="mb-3"><Form.Label>{copy.preferredCurrency}</Form.Label><Form.Select value={formState.preferredCurrency} onChange={(e) => setField('preferredCurrency', e.target.value)}><option value="USD">USD</option><option value="SAR">SAR</option><option value="BHD">BHD</option></Form.Select></Form.Group></Col>
                                        </Row>
                                    </Tab.Pane>

                                    <Tab.Pane eventKey="tabBlock4">
                                        <div className="title-lg fs-4"><span>{copy.securityTab || 'Login & Security'}</span></div>
                                        <p className="mb-4 text-muted">{copy.securitySubtitle || 'Control approval, onboarding readiness, password updates, and additional access protections.'}</p>
                                        <Row className="gx-3">
                                            <Col sm={6}><Form.Group className="mb-3"><Form.Label>{copy.accountHealth}</Form.Label><Form.Select value={formState.accountStatus} onChange={(e) => setField('accountStatus', e.target.value)}><option value="active">{getStatusLabel('active', locale)}</option><option value="waiting">{getStatusLabel('waiting', locale)}</option><option value="deactivated">{getStatusLabel('deactivated', locale)}</option></Form.Select></Form.Group></Col>
                                            <Col sm={6}><Form.Group className="mb-3"><Form.Label>Tap</Form.Label><Form.Select value={formState.tapStatus} onChange={(e) => setField('tapStatus', e.target.value)}><option value="connected">{getStatusLabel('connected', locale)}</option><option value="pending">{getStatusLabel('pending', locale)}</option><option value="not-started">{getStatusLabel('not-started', locale)}</option></Form.Select></Form.Group></Col>
                                        </Row>
                                        <Form.Check className="mb-3" checked={formState.kycSubmitted} onChange={(e) => setField('kycSubmitted', e.target.checked)} label={copy.kycSubmitted} />
                                        <div className="border rounded-3 p-3 bg-light-subtle mb-4">
                                            <div className="title-xs text-primary text-uppercase mb-3">
                                                <span>{copy.passwordSectionTitle || 'Password'}</span>
                                            </div>
                                            <Row className="gx-3">
                                                <Col sm={12}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>{copy.oldPasswordLabel || 'Old Password'}</Form.Label>
                                                        <Form.Control type="password" value={passwordForm.oldPassword} onChange={(e) => setPasswordField('oldPassword', e.target.value)} />
                                                    </Form.Group>
                                                </Col>
                                                <Col sm={6}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>{copy.newPasswordLabel || 'New Password'}</Form.Label>
                                                        <Form.Control type="password" value={passwordForm.newPassword} onChange={(e) => setPasswordField('newPassword', e.target.value)} />
                                                    </Form.Group>
                                                </Col>
                                                <Col sm={6}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>{copy.confirmPasswordLabel || 'Confirm Password'}</Form.Label>
                                                        <Form.Control type="password" value={passwordForm.confirmPassword} onChange={(e) => setPasswordField('confirmPassword', e.target.value)} />
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                        </div>

                                        <div className="border rounded-3 p-3 bg-light-subtle mb-4">
                                            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                                                <div className="title-xs text-primary text-uppercase mb-0">
                                                    <span>{copy.twoFactorSectionTitle || '2-Step Verification'}</span>
                                                </div>
                                                <Form.Check
                                                    type="switch"
                                                    id="two-factor-toggle"
                                                    className="mb-0"
                                                    checked={Boolean(formState.twoFactorEnabled)}
                                                    onChange={(e) => openOtpModalForToggle(e.target.checked)}
                                                    label={formState.twoFactorEnabled ? (copy.twoFactorStatusActive || 'Active') : (copy.twoFactorStatusInactive || 'Inactive')}
                                                />
                                            </div>

                                            <Row className="gx-3">
                                                <Col sm={6}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>{copy.twoFactorMethodLabel || 'Verification Method'}</Form.Label>
                                                        <Form.Select value={twoFactorDraft.method} onChange={(e) => setTwoFactorDraftField('method', e.target.value)}>
                                                            <option value="email">{copy.twoFactorMethodEmail || 'Email'}</option>
                                                            <option value="sms">{copy.twoFactorMethodSms || 'SMS'}</option>
                                                        </Form.Select>
                                                    </Form.Group>
                                                </Col>
                                                <Col sm={6}>
                                                    {twoFactorDraft.method === 'sms' ? (
                                                        <Form.Group className="mb-3">
                                                            <Form.Label>{copy.twoFactorPhoneLabel || 'Phone Number'}</Form.Label>
                                                            <Form.Control type="text" value={twoFactorDraft.phone} onChange={(e) => setTwoFactorDraftField('phone', e.target.value)} />
                                                        </Form.Group>
                                                    ) : (
                                                        <Form.Group className="mb-3">
                                                            <Form.Label>{copy.twoFactorEmailLabel || 'Email'}</Form.Label>
                                                            <Form.Control type="email" value={twoFactorDraft.email} onChange={(e) => setTwoFactorDraftField('email', e.target.value)} />
                                                        </Form.Group>
                                                    )}
                                                </Col>
                                            </Row>

                                            {twoFactorError ? <div className="text-danger fs-8 mb-3">{twoFactorError}</div> : null}
                                            {twoFactorNotice ? <div className="text-success fs-8 mb-3">{twoFactorNotice}</div> : null}

                                            <Button type="button" variant="soft-primary" onClick={openOtpModalForSettings}>
                                                {copy.twoFactorUpdateButton || 'Update 2-Step Verification'}
                                            </Button>
                                        </div>
                                    </Tab.Pane>
                                </Tab.Content>
                                <Button variant="primary" type="submit" className="mt-5">{adminCopy[locale].common.saveChanges}</Button>
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
                    <p className="text-muted mb-3">
                        {otpModal.mode === 'settings'
                            ? (copy.twoFactorOtpPromptSettings || 'Enter the OTP to apply 2-step verification settings.')
                            : (copy.twoFactorOtpPromptToggle || 'Enter the OTP to update 2-step verification status.')}
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

export default EditPhotographerProfile;

