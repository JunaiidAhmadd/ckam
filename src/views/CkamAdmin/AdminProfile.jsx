import React from 'react';
import { Button, Card, Col, Container, ListGroup, Nav, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import HkBadge from '../../components/@hk-badge/@hk-badge';
import bgImg from '../../assets/img/profile-bg.jpg';
import { useCkamAdmin } from './context';
import { useAdminPageSetup } from './shared';

const AdminProfile = () => {
    useAdminPageSetup();

    const { locale, adminProfile } = useCkamAdmin();
    const fullName = [adminProfile.firstName, adminProfile.lastName].filter(Boolean).join(' ');
    const initials = [adminProfile.firstName?.[0], adminProfile.lastName?.[0]].filter(Boolean).join('').toUpperCase();
    const role = locale === 'ar' ? adminProfile.roleAr : adminProfile.role;
    const location = locale === 'ar' ? adminProfile.locationAr : adminProfile.location;
    const bio = locale === 'ar' ? adminProfile.bio?.ar : adminProfile.bio?.en;
    const text = locale === 'ar'
        ? {
            title: 'ملف المدير',
            subtitle: 'إدارة هوية المسؤول وتفاصيل التواصل ومعلومات ملف لوحة التحكم CKAM.',
            editProfile: 'تعديل الملف',
            profileTab: 'الملف',
            accountTab: 'الحساب',
            securityTab: 'الأمان',
            snapshot: 'ملخص المسؤول',
            activeModules: 'وحدات نشطة',
            adminLanguages: 'لغات الإدارة',
            coverage: 'التغطية',
            email: 'البريد الإلكتروني',
            phone: 'الهاتف',
            website: 'الموقع',
            biography: 'نبذة',
            accountDetails: 'تفاصيل الحساب',
            fullName: 'الاسم الكامل',
            role: 'الدور',
            location: 'الموقع',
        }
        : {
            title: 'Admin Profile',
            subtitle: 'Manage administrator identity, contact details, and CKAM control-panel profile information.',
            editProfile: 'Edit Profile',
            profileTab: 'Profile',
            accountTab: 'Account',
            securityTab: 'Security',
            snapshot: 'Administrator Snapshot',
            activeModules: 'active modules',
            adminLanguages: 'admin languages',
            coverage: 'coverage',
            email: 'Email',
            phone: 'Phone',
            website: 'Website',
            biography: 'Biography',
            accountDetails: 'Account Details',
            fullName: 'Full name',
            role: 'Role',
            location: 'Location',
        };

    return (
        <div className="hk-pg-body ckam-admin-page ckam-admin-profile-page">
            <Container>
                <div className="ckam-profile-toolbar d-flex justify-content-between align-items-center flex-wrap gap-2 pt-7 mb-3">
                    <div>
                        <h1 className="pg-title mb-1">{text.title}</h1>
                        <p className="mb-0 text-muted">{text.subtitle}</p>
                    </div>
                    <Button as={Link} to="/admin/profile/edit" variant="primary">{text.editProfile}</Button>
                </div>
                <div className="profile-wrap">
                    <div className="profile-img-wrap">
                        <img className="img-fluid rounded-5" src={bgImg} alt="Profile cover" />
                    </div>

                    <div className="profile-intro">
                        <Card className="card-flush mw-400p bg-transparent">
                            <Card.Body>
                                <div className="avatar avatar-xxl avatar-rounded position-relative mb-2 avatar-soft-primary overflow-hidden">
                                    {adminProfile.avatar ? (
                                        <img src={adminProfile.avatar} alt={fullName} className="avatar-img border border-4 border-white" />
                                    ) : (
                                        <span className="initial-wrap fs-2 fw-semibold">{initials}</span>
                                    )}
                                    <HkBadge bg="success" indicator className="badge-indicator-xl position-bottom-end-overflow-1 me-1" />
                                </div>
                                <h4 className="mb-1">{fullName}</h4>
                                <p className="mb-2">{role}</p>
                                <ul className="list-inline fs-7 mt-2 mb-0">
                                    <li className="list-inline-item d-sm-inline-block d-block mb-sm-0 mb-1 me-3">
                                        <i className="bi bi-briefcase me-1" />
                                        {role}
                                    </li>
                                    <li className="list-inline-item d-sm-inline-block d-block mb-sm-0 mb-1 me-3">
                                        <i className="bi bi-geo-alt me-1" />
                                        {location}
                                    </li>
                                    <li className="list-inline-item d-sm-inline-block d-block mb-sm-0 mb-1 me-3">
                                        <i className="bi bi-globe me-1" />
                                        {adminProfile.website}
                                    </li>
                                </ul>
                            </Card.Body>
                        </Card>
                    </div>

                    <header className="profile-header">
                        <Nav as="ul" variant="tabs" className="nav-line nav-icon nav-light h-100 d-md-flex d-none">
                            <Nav.Item as="li"><Nav.Link active><span className="nav-link-text">{text.profileTab}</span></Nav.Link></Nav.Item>
                       
                        </Nav>
                    </header>

                    <Row className="mt-7">
                        <Col lg={4} className="mb-lg-0 mb-3">
                            <Card className="card-border mb-4">
                                <Card.Header className="card-header-action">
                                    <h6>{text.snapshot}</h6>
                                </Card.Header>
                                <Card.Body>
                                    <div className="d-flex text-center">
                                        <div className="flex-1 border-end">
                                            <div>
                                                <span className="d-block fs-4 text-dark mb-1">4</span>
                                                <span className="d-block fs-7">{text.activeModules}</span>
                                            </div>
                                        </div>
                                        <div className="flex-1 border-end">
                                            <div>
                                                <span className="d-block fs-4 text-dark mb-1">2</span>
                                                <span className="d-block fs-7">{text.adminLanguages}</span>
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <div>
                                                <span className="d-block fs-4 text-dark mb-1">24/7</span>
                                                <span className="d-block fs-7">{text.coverage}</span>
                                            </div>
                                        </div>
                                    </div>
                                </Card.Body>
                                <ListGroup variant="flush">
                                    <ListGroup.Item className="border-0 d-flex justify-content-between">
                                        <span className="text-muted">{text.email}</span>
                                        <span>{adminProfile.email}</span>
                                    </ListGroup.Item>
                                    <ListGroup.Item className="border-0 d-flex justify-content-between">
                                        <span className="text-muted">{text.phone}</span>
                                        <span>{adminProfile.phone}</span>
                                    </ListGroup.Item>
                                    <ListGroup.Item className="border-0 d-flex justify-content-between">
                                        <span className="text-muted">{text.website}</span>
                                        <span>{adminProfile.website}</span>
                                    </ListGroup.Item>
                                </ListGroup>
                            </Card>
                        </Col>

                        <Col lg={8}>
                            <Row className="g-3 mb-3">
                                <Col md={6}>
                                    <Card className="card-border h-100">
                                        <Card.Header className="card-header-action">
                                            <h6>{text.biography}</h6>
                                        </Card.Header>
                                        <Card.Body>
                                            <p className="mb-0">{bio}</p>
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col md={6}>
                                    <Card className="card-border h-100">
                                        <Card.Header className="card-header-action">
                                            <h6>{text.accountDetails}</h6>
                                        </Card.Header>
                                        <Card.Body>
                                            <div className="d-flex flex-column gap-3">
                                                <div>
                                                    <div className="text-muted fs-7 mb-1">{text.fullName}</div>
                                                    <div className="fw-medium">{fullName}</div>
                                                </div>
                                                <div>
                                                    <div className="text-muted fs-7 mb-1">{text.role}</div>
                                                    <div className="fw-medium">{role}</div>
                                                </div>
                                                <div>
                                                    <div className="text-muted fs-7 mb-1">{text.location}</div>
                                                    <div className="fw-medium">{location}</div>
                                                </div>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </div>
            </Container>
        </div>
    );
};

export default AdminProfile;
