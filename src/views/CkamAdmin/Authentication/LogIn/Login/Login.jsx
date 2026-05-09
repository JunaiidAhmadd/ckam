import React, { useState } from 'react';
import { Alert, Button, Col, Container, Form, InputGroup, Row } from 'react-bootstrap';
import { ExternalLink } from 'react-feather';
import { Link } from 'react-router-dom';
import { adminAuthApi } from '../../../../../api/adminAuth';
import { getAdminTwoFactorEnabled } from '../../../../../api/authSession';

import logoutImg from '../../../../../assets/img/macaroni-logged-out.png';

const Login = (props) => {
    const [twoFactorEnabled] = useState(() => getAdminTwoFactorEnabled());
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [otp, setOtp] = useState("");
    const [step, setStep] = useState("credentials");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmitCredentials = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");
        setError("");
        try {
            await adminAuthApi.login({ email: email.trim(), password });

            if (twoFactorEnabled) {
                setStep("otp");
                setMessage("OTP sent. Please enter the verification code.");
                return;
            }

            try {
                await adminAuthApi.profile();
                props.history.push("/admin");
                return;
            } catch {
                // Backend still requires OTP; fallback to OTP flow.
                setStep("otp");
                setMessage("OTP required. Please enter the verification code.");
                return;
            }
        } catch (requestError) {
            setError(requestError.message || "Login failed.");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");
        setError("");
        try {
            await adminAuthApi.verifyOtp({ email: email.trim(), otp: otp.trim() });
            await adminAuthApi.profile();
            props.history.push("/admin");
        } catch (requestError) {
            setError(requestError.message || "OTP verification failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="hk-pg-wrapper py-0" >
            <div className="hk-pg-body py-0">
                <Container fluid>
                    <Row className="auth-split">
                        <Col xl={5} lg={6} md={7} className="position-relative mx-auto">
                            <div className="auth-content flex-column pt-8 pb-md-8 pb-13">
                                <div className="text-center mb-7">
                                    <Link to="/admin/login" className="navbar-brand me-0">
                                        <img src="/assets/img/logo.png" alt="CKAM logo" className="brand-img d-inline-block" />
                                    </Link>
                                </div>
                                <Form className="w-100" onSubmit={step === "credentials" ? handleSubmitCredentials : handleSubmitOtp} >
                                    <Row>
                                        <Col xl={7} sm={10} className="mx-auto">
                                            <div className="text-center mb-4">
                                                <h4>Sign in to your account</h4>
                                                <p>Welcome back to CKAM admin portal. Sign in to continue.</p>
                                            </div>
                                            {message ? <Alert variant="success" className="py-2">{message}</Alert> : null}
                                            {error ? <Alert variant="danger" className="py-2">{error}</Alert> : null}
                                            <Row className="gx-3">
                                                <Col as={Form.Group} lg={12} className="mb-3" >
                                                    <div className="form-label-group">
                                                        <Form.Label>Email</Form.Label>
                                                    </div>
                                                    <Form.Control placeholder="Enter email" type="email" value={email} readOnly={step === "otp"} onChange={e => setEmail(e.target.value)} required />
                                                </Col>
                                                {step === "credentials" ? (
                                                    <Col as={Form.Group} lg={12} className="mb-3" >
                                                        <div className="form-label-group">
                                                            <Form.Label>Password</Form.Label>
                                                        </div>
                                                        <InputGroup className="password-check">
                                                            <span className="input-affix-wrapper affix-wth-text">
                                                                <Form.Control placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} type={showPassword ? "text" : "password"} required />
                                                                <Link to="#" className="input-suffix text-primary text-uppercase fs-8 fw-medium" onClick={() => setShowPassword(!showPassword)} >
                                                                    {showPassword ? <span>Hide</span> : <span>Show</span>}
                                                                </Link>
                                                            </span>
                                                        </InputGroup>
                                                    </Col>
                                                ) : (
                                                    <Col as={Form.Group} lg={12} className="mb-3" >
                                                        <div className="form-label-group">
                                                            <Form.Label>OTP</Form.Label>
                                                        </div>
                                                        <Form.Control placeholder="Enter OTP" value={otp} onChange={e => setOtp(e.target.value)} required />
                                                    </Col>
                                                )}
                                            </Row>
                                            <Button variant="primary" type="submit" className="btn-uppercase btn-block" disabled={loading}>
                                                {step === "credentials"
                                                    ? (loading ? "Please wait..." : (twoFactorEnabled ? "Send OTP" : "Login"))
                                                    : (loading ? "Verifying..." : "Verify OTP")}
                                            </Button>
                                            {step === "otp" ? (
                                                <Button variant="outline-light" type="button" className="btn-uppercase btn-block mt-2" onClick={() => setStep("credentials")} disabled={loading}>
                                                    Back
                                                </Button>
                                            ) : null}
                                            <Link to="#" className="d-block extr-link text-center mt-4">
                                                <span className="feather-icon">
                                                    <ExternalLink />
                                                </span>
                                                <u className="text-muted">Need help with your CKAM account?</u>
                                            </Link>
                                        </Col>
                                    </Row>
                                </Form>
                            </div>
                            {/* Page Footer */}
                            <div className="hk-footer border-0">
                                <Container fluid as="footer" className="footer">
                                    <Row>
                                        <div className="col-12 text-center">
                                            <p className="footer-text pb-0"><span className="copy-text">CKAM &copy; {new Date().getFullYear()} All rights reserved.</span> <a href="#some" target="_blank" rel="noreferrer">Privacy Policy</a><span className="footer-link-sep"> | </span><a href="#some" target="_blank" rel="noreferrer">T&amp;C</a><span className="footer-link-sep"> | </span><a href="#some" target="_blank" rel="noreferrer">System Status</a></p>
                                        </div>
                                    </Row>
                                </Container>
                            </div>
                        </Col>
                        <Col xl={7} lg={6} md={5} sm={10} className="d-md-block d-none position-relative bg-primary-light-5">
                            <div className="auth-content flex-column text-center py-8">
                                <Row>
                                    <Col xxl={7} xl={8} lg={11} className="mx-auto">
                                        <h2 className="mb-4">Welcome to CKAM</h2>
                                        <p>Secure admin access with email and OTP verification.</p>
                                    </Col>
                                </Row>
                                <img src={logoutImg} className="img-fluid w-sm-50 mt-7" alt="login" />
                            </div>
                            <p className="p-xs credit-text opacity-55">All illustration are powered by <Link to="#" href="https://icons8.com/ouch/" target="_blank" rel="noreferrer" className="text-light"><u>Icons8</u></Link></p>
                        </Col>
                    </Row>
                </Container>
            </div>
        </div>
    )
}

export default Login

