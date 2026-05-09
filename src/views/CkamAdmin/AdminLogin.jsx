import React, { useMemo, useState } from 'react';
import { Alert, Button, Col, Container, Form, Modal, Row, Spinner } from 'react-bootstrap';
import { Redirect, useHistory, useLocation } from 'react-router-dom';
import { adminAuthApi } from '../../api/adminAuth';
import { hasAdminToken } from '../../api/authSession';
import { brandAssets } from '../../utils/branding';
import illustration from '../../assets/img/macaroni-logged-out.png';

const initialCredentials = {
    email: '',
    password: '',
};

const initialOtpState = {
    email: '',
    otp: '',
    open: false,
};

const AdminLogin = () => {
    const history = useHistory();
    const location = useLocation();
    const [credentials, setCredentials] = useState(initialCredentials);
    const [otpState, setOtpState] = useState(initialOtpState);
    const [error, setError] = useState('');
    const [otpError, setOtpError] = useState('');
    const [loading, setLoading] = useState(false);
    const [verifyingOtp, setVerifyingOtp] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const nextUrl = useMemo(() => (
        location.state?.from?.pathname || '/admin'
    ), [location.state]);

    if (hasAdminToken()) {
        return <Redirect to={nextUrl} />;
    }

    const handleCredentialChange = (event) => {
        const { name, value } = event.target;
        setCredentials((current) => ({ ...current, [name]: value }));
    };

    const handleOtpChange = (event) => {
        const otp = String(event.target.value || '').replace(/\D/g, '').slice(0, 6);
        setOtpState((current) => ({ ...current, otp }));
    };

    const closeOtpModal = () => {
        if (verifyingOtp) {
            return;
        }

        setOtpState(initialOtpState);
        setOtpError('');
    };

    const handleLoginSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError('');
        setOtpError('');

        try {
            const payload = await adminAuthApi.login({
                email: credentials.email,
                password: credentials.password,
            });

            const requiresOtp = Boolean(
                payload?.two_factor_required
                || payload?.verification_required
                || payload?.requires_otp
                || payload?.two_step_verification?.verification_required
            );

            if (requiresOtp || !hasAdminToken()) {
                setOtpState({
                    email: credentials.email.trim(),
                    otp: '',
                    open: true,
                });
                return;
            }

            await adminAuthApi.profile().catch(() => null);
            history.replace(nextUrl);
        } catch (submissionError) {
            setError(submissionError.message || 'Login failed.');
        } finally {
            setLoading(false);
        }
    };

    const handleOtpSubmit = async (event) => {
        event.preventDefault();
        setVerifyingOtp(true);
        setOtpError('');

        try {
            await adminAuthApi.verifyOtp({
                email: otpState.email,
                otp: otpState.otp,
            });
            await adminAuthApi.profile().catch(() => null);
            if (!hasAdminToken()) {
                throw new Error('Authorization token is required.');
            }
            history.replace(nextUrl);
        } catch (submissionError) {
            setOtpError(submissionError.message || 'OTP verification failed.');
        } finally {
            setVerifyingOtp(false);
        }
    };

    return (
        <>
            <div className="min-vh-100" style={{ backgroundColor: '#fff' }}>
                <Container fluid className="px-0">
                    <Row className="g-0 min-vh-100">
                        <Col lg={5} className="d-flex flex-column justify-content-between" style={{ backgroundColor: '#ffffff' }}>
                            <div className="px-4 px-md-5 pt-5">
                                <img
                                    src={brandAssets.logoLight}
                                    alt={brandAssets.appName}
                                    style={{ width: 160, maxWidth: '100%' }}
                                />
                            </div>

                            <div className="px-4 px-md-5 py-4 d-flex justify-content-center">
                                <div style={{ width: '100%', maxWidth: 360 }}>
                                    <div className="text-center mb-4">
                                        <h1 style={{ fontSize: 24, fontWeight: 600, color: '#12284c', marginBottom: 12 }}>
                                            Sign in to your account
                                        </h1>
                                        <p style={{ color: '#5e6b82', fontSize: 16, lineHeight: 1.6, marginBottom: 0 }}>
                                            Welcome back to CKAM admin portal.
                                            <br />
                                            Sign in to continue.
                                        </p>
                                    </div>

                                    {error ? <Alert variant="danger" className="mb-3">{error}</Alert> : null}

                                    <Form onSubmit={handleLoginSubmit}>
                                        <Form.Group className="mb-3">
                                            <Form.Label style={{ color: '#12284c', fontWeight: 500 }}>Email</Form.Label>
                                            <Form.Control
                                                type="email"
                                                name="email"
                                                value={credentials.email}
                                                onChange={handleCredentialChange}
                                                placeholder="Enter email"
                                                autoComplete="username"
                                                required
                                                style={{ height: 46, borderColor: '#d7dce5', borderRadius: 6 }}
                                            />
                                        </Form.Group>

                                        <Form.Group className="mb-3">
                                            <Form.Label style={{ color: '#12284c', fontWeight: 500 }}>Password</Form.Label>
                                            <div className="position-relative">
                                                <Form.Control
                                                    type={showPassword ? 'text' : 'password'}
                                                    name="password"
                                                    value={credentials.password}
                                                    onChange={handleCredentialChange}
                                                    placeholder="Enter your password"
                                                    autoComplete="current-password"
                                                    required
                                                    style={{ height: 46, borderColor: '#d7dce5', borderRadius: 6, paddingRight: 80 }}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword((current) => !current)}
                                                    style={{
                                                        position: 'absolute',
                                                        right: 12,
                                                        top: '50%',
                                                        transform: 'translateY(-50%)',
                                                        border: 'none',
                                                        background: 'transparent',
                                                        color: '#ff7f41',
                                                        fontSize: 13,
                                                        fontWeight: 600,
                                                        padding: 0,
                                                    }}
                                                >
                                                    {showPassword ? 'HIDE' : 'SHOW'}
                                                </button>
                                            </div>
                                        </Form.Group>

                                        <Button
                                            type="submit"
                                            className="w-100 border-0"
                                            disabled={loading}
                                            style={{ height: 46, backgroundColor: '#ff8a45', borderRadius: 6, fontWeight: 700 }}
                                        >
                                            {loading ? <Spinner animation="border" size="sm" /> : 'Login'}
                                        </Button>
                                    </Form>

                                    <div className="text-center mt-4">
                                        <a href="#" style={{ color: '#5e6b82', textDecoration: 'underline', fontSize: 15 }}>
                                            Need help with your CKAM account?
                                        </a>
                                    </div>
                                </div>
                            </div>

                            <div className="px-4 px-md-5 pb-4 text-center text-md-start" style={{ color: '#5e6b82', fontSize: 14 }}>
                                CKAM © 2026 All rights reserved. <a href="#" style={{ color: '#ff7f41' }}>Privacy Policy</a> | <a href="#" style={{ color: '#ff7f41' }}>T&amp;C</a> | <a href="#" style={{ color: '#ff7f41' }}>System Status</a>
                            </div>
                        </Col>

                        <Col lg={7} className="d-none d-lg-flex align-items-center justify-content-center flex-column text-center" style={{ backgroundColor: '#fdf3ea', padding: '48px 24px' }}>
                            <h2 style={{ color: '#12284c', fontSize: 34, fontWeight: 500, marginBottom: 18 }}>
                                Welcome to CKAM
                            </h2>
                            <p style={{ color: '#5e6b82', fontSize: 16, marginBottom: 36 }}>
                                Secure admin access with email and OTP verification.
                            </p>
                            <img
                                src={illustration}
                                alt="CKAM secure login"
                                style={{ maxWidth: 460, width: '100%', maxHeight: '62vh', objectFit: 'contain' }}
                            />
                        </Col>
                    </Row>
                </Container>
            </div>

            <Modal show={otpState.open} onHide={closeOtpModal} centered backdrop="static">
                <Modal.Header closeButton={!verifyingOtp}>
                    <Modal.Title>Verify OTP</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p className="text-muted mb-3">
                        A 6-digit OTP has been sent to the admin email. Enter it below to continue.
                    </p>

                    {otpError ? <Alert variant="danger" className="mb-3">{otpError}</Alert> : null}

                    <Form onSubmit={handleOtpSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control type="email" value={otpState.email} readOnly />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>OTP</Form.Label>
                            <Form.Control
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]{6}"
                                value={otpState.otp}
                                onChange={handleOtpChange}
                                placeholder="Enter 6-digit OTP"
                                required
                            />
                        </Form.Group>

                        <Button type="submit" variant="primary" className="w-100" disabled={verifyingOtp}>
                            {verifyingOtp ? <Spinner animation="border" size="sm" /> : 'Verify OTP'}
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </>
    );
};

export default AdminLogin;
