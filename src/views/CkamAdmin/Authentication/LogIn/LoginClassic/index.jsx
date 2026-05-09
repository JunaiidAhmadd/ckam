import React, { useState } from 'react';
import { Alert, Button, Card, Col, Container, Form, InputGroup, Row } from 'react-bootstrap';
import { Eye, EyeOff } from 'react-feather';
import { Link } from 'react-router-dom';
import CommanFooter1 from '../../CommanFooter1';
import { adminAuthApi } from '../../../../../api/adminAuth';
import { useAdminPageSetup } from '../../../shared';

//Image
import jampackImg from '../../../../../assets/img/logo-light.svg';
import jampackImgDark from '../../../../../assets/img/logo-dark.svg';
import { useTheme } from '../../../../../utils/theme-provider/theme-provider';

const LoginClassic = (props) => {
    useAdminPageSetup();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [otp, setOtp] = useState("");
    const [step, setStep] = useState("credentials");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const { theme } = useTheme();

    const handleCredentialsSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setMessage("");
        try {
            await adminAuthApi.login({ email: email.trim(), password });
            setStep("otp");
            setMessage("OTP sent. Please enter the verification code.");
        } catch (requestError) {
            setError(requestError.message || "Login failed.");
        } finally {
            setLoading(false);
        }
    };

    const handleOtpSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setMessage("");
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
        <div className="hk-pg-wrapper pt-0 pb-xl-0 pb-5">
            <div className="hk-pg-body pt-0 pb-xl-0">
                <Container>
                    <Row>
                        <Col sm={10} className="position-relative mx-auto">
                            <div className="auth-content py-8">
                                <Form className="w-100" onSubmit={step === "credentials" ? handleCredentialsSubmit : handleOtpSubmit}>
                                    <Row>
                                        <Col lg={5} md={7} sm={10} className="mx-auto">
                                            <div className="text-center mb-7">
                                                <Link to="/" className="navbar-brand me-0">
                                                    {theme === "light" ? <img src={jampackImg} alt="brand" className="brand-img d-inline-block" /> : <img src={jampackImgDark} alt="brand" className="brand-img d-inline-block" />}
                                                </Link>
                                            </div>
                                            <Card className="card-lg card-border">
                                                <Card.Body>
                                                    <h4 className="mb-4 text-center">Sign in to your account</h4>
                                                    {message ? <Alert variant="success" className="py-2">{message}</Alert> : null}
                                                    {error ? <Alert variant="danger" className="py-2">{error}</Alert> : null}
                                                    <Row className="gx-3">
                                                        <Col as={Form.Group} lg={12} className="mb-3">
                                                            <div className="form-label-group">
                                                                <Form.Label>Email</Form.Label>
                                                            </div>
                                                            <Form.Control
                                                                placeholder="Enter your email"
                                                                type="email"
                                                                value={email}
                                                                readOnly={step === "otp"}
                                                                onChange={e => setEmail(e.target.value)}
                                                                required
                                                            />
                                                        </Col>
                                                        {step === "credentials" ? (
                                                            <Col as={Form.Group} lg={12} className="mb-3">
                                                                <div className="form-label-group">
                                                                    <Form.Label>Password</Form.Label>
                                                                </div>
                                                                <InputGroup className="password-check">
                                                                    <span className="input-affix-wrapper">
                                                                        <Form.Control placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} type={showPassword ? "text" : "password"} required />
                                                                        <Link to="#" className="input-suffix text-muted" onClick={() => setShowPassword(!showPassword)} >
                                                                            <span className="feather-icon">
                                                                                {
                                                                                    showPassword
                                                                                        ?
                                                                                        <EyeOff className="form-icon" />
                                                                                        :
                                                                                        <Eye className="form-icon" />
                                                                                }

                                                                            </span>
                                                                        </Link>
                                                                    </span>
                                                                </InputGroup>
                                                            </Col>
                                                        ) : (
                                                            <Col as={Form.Group} lg={12} className="mb-3">
                                                                <div className="form-label-group">
                                                                    <Form.Label>OTP</Form.Label>
                                                                </div>
                                                                <Form.Control
                                                                    placeholder="Enter OTP"
                                                                    value={otp}
                                                                    onChange={e => setOtp(e.target.value)}
                                                                    required
                                                                />
                                                            </Col>
                                                        )}
                                                    </Row>
                                                    <Button variant="primary" type="submit" className="btn-uppercase btn-block" disabled={loading}>
                                                        {step === "credentials" ? (loading ? "Please wait..." : "Send OTP") : (loading ? "Verifying..." : "Verify OTP")}
                                                    </Button>
                                                    {step === "otp" ? (
                                                        <Button
                                                            variant="outline-light"
                                                            type="button"
                                                            className="btn-uppercase btn-block mt-2"
                                                            onClick={() => setStep("credentials")}
                                                            disabled={loading}
                                                        >
                                                            Back
                                                        </Button>
                                                    ) : null}
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    </Row>
                                </Form>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </div>
            {/* Page Footer */}
            <CommanFooter1 />
        </div>

    )
}

export default LoginClassic
