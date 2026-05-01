import React from 'react';
import { Button, Card, Col, Container, ListGroup, Nav, ProgressBar, Row } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import HkBadge from '../../components/@hk-badge/@hk-badge';
import bgImg from '../../assets/img/profile-bg.jpg';
import { useCkamAdmin } from './context';
import { adminCopy, getAdminIntl, getLocalizedValue, getStatusLabel } from './localization/i18n';
import { SectionCard, StatusPill, useAdminPageSetup } from './shared';

const PhotographerProfile = () => {
    useAdminPageSetup();

    const { id } = useParams();
    const { locale, photographers } = useCkamAdmin();
    const photographer = photographers.find((item) => item.id === id);
    const copy = adminCopy[locale].profilePage;
    const common = adminCopy[locale].common;
    const intl = getAdminIntl(locale);

    if (!photographer) {
        return (
            <div className="container ckam-admin-page ckam-admin-profile-page">
                <div className="hk-pg-body py-7">
                    <SectionCard title={copy.title} subtitle={copy.notFoundSubtitle}>
                        <Button as={Link} to="/admin/photographers" variant="primary">{copy.back}</Button>
                    </SectionCard>
                </div>
            </div>
        );
    }

    const initials = photographer.name.split(' ').map((item) => item[0]).join('').slice(0, 2).toUpperCase();
    const checklist = [
        { label: copy.kycSubmitted, done: photographer.kycSubmitted },
        { label: copy.accountApproved, done: photographer.accountStatus === 'active' },
        { label: copy.tapConnected, done: photographer.tapStatus === 'connected' },
    ];
    const completedChecklist = checklist.filter((item) => item.done).length;

    return (
        <div className="hk-pg-body ckam-admin-page ckam-admin-profile-page">
            <Container>
                <div className="ckam-profile-toolbar d-flex justify-content-between align-items-center flex-wrap gap-2 pt-7 mb-3">
                    <Button as={Link} to="/admin/photographers" variant="outline-light">{copy.back}</Button>
                </div>
                <div className="profile-wrap">
                    <div className="profile-img-wrap">
                        <img className="img-fluid rounded-5" src={bgImg} alt="Profile cover" />
                    </div>

                    <div className="profile-intro">
                        <Card className="card-flush mw-400p bg-transparent">
                            <Card.Body>
                                <div className="avatar avatar-xxl avatar-rounded position-relative mb-2 avatar-soft-primary overflow-hidden">
                                    {photographer.avatar ? (
                                        <img src={photographer.avatar} alt={photographer.name} className="avatar-img" />
                                    ) : (
                                        <span className="initial-wrap fs-2 fw-semibold">{initials}</span>
                                    )}
                                    <HkBadge bg={photographer.accountStatus === 'active' ? 'success' : photographer.accountStatus === 'waiting' ? 'warning' : 'danger'} indicator className="badge-indicator-xl position-bottom-end-overflow-1 me-1" />
                                </div>
                                <h4 className="mb-1">{photographer.name}</h4>
                                <p className="mb-2">{photographer.businessName}</p>
                                <ul className="list-inline fs-7 mt-2 mb-0">
                                    <li className="list-inline-item d-sm-inline-block d-block mb-sm-0 mb-1 me-3">
                                        <i className="bi bi-briefcase me-1" />
                                        {photographer.specialty}
                                    </li>
                                    <li className="list-inline-item d-sm-inline-block d-block mb-sm-0 mb-1 me-3">
                                        <i className="bi bi-geo-alt me-1" />
                                        {photographer.city}
                                    </li>
                                    <li className="list-inline-item d-sm-inline-block d-block mb-sm-0 mb-1 me-3">
                                        <i className="bi bi-globe me-1" />
                                        {photographer.publicUrl}
                                    </li>
                                </ul>
                            </Card.Body>
                        </Card>
                    </div>

                    <header className="profile-header">
                        <Nav as="ul" variant="tabs" className="nav-line nav-icon nav-light h-100 d-md-flex d-none">
                            <Nav.Item as="li"><Nav.Link active><span className="nav-link-text">{copy.overviewTab}</span></Nav.Link></Nav.Item>
                            <Nav.Item as="li"><Nav.Link><span className="nav-link-text">{copy.businessTab}</span></Nav.Link></Nav.Item>
                            <Nav.Item as="li"><Nav.Link><span className="nav-link-text">{copy.billingTab}</span></Nav.Link></Nav.Item>
                        </Nav>
                    </header>

                    <Row className="mt-7">
                        <Col lg={4} className="mb-lg-0 mb-3">
                            <Card className="card-border mb-4">
                                <Card.Header className="card-header-action">
                                    <h6>{copy.accountHealth}</h6>
                                    <StatusPill label={getStatusLabel(photographer.accountStatus, locale)} tone={photographer.accountStatus} />
                                </Card.Header>
                                <Card.Body>
                                    <div className="d-flex text-center">
                                        <div className="flex-1 border-end">
                                            <div>
                                                <span className="d-block fs-4 text-dark mb-1">{photographer.upcomingBookings}</span>
                                                <span className="d-block fs-7">{copy.upcomingBookings}</span>
                                            </div>
                                        </div>
                                        <div className="flex-1 border-end">
                                            <div>
                                                <span className="d-block fs-4 text-dark mb-1">{photographer.totalClients}</span>
                                                <span className="d-block fs-7">{copy.totalClients}</span>
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <div>
                                                <span className="d-block fs-4 text-dark mb-1">{photographer.preferredCurrency}</span>
                                                <span className="d-block fs-7">{copy.preferredCurrency}</span>
                                            </div>
                                        </div>
                                    </div>
                                </Card.Body>
                                <ListGroup variant="flush">
                                    <ListGroup.Item className="border-0 d-flex justify-content-between">
                                        <span className="text-muted">{copy.plan}</span>
                                        <span>{getLocalizedValue(photographer.planName, locale)}</span>
                                    </ListGroup.Item>
                                    <ListGroup.Item className="border-0 d-flex justify-content-between">
                                        <span className="text-muted">{copy.joinedOn}</span>
                                        <span>{intl.date.format(new Date(photographer.joinedOn))}</span>
                                    </ListGroup.Item>
                                    <ListGroup.Item className="border-0 d-flex justify-content-between">
                                        <span className="text-muted">{copy.preferredLanguage}</span>
                                        <span>{locale === 'ar' ? photographer.preferredLanguageAr : photographer.preferredLanguage}</span>
                                    </ListGroup.Item>
                                    <ListGroup.Item className="border-0 d-flex justify-content-between">
                                        <span className="text-muted">Tap</span>
                                        <StatusPill label={getStatusLabel(photographer.tapStatus, locale)} tone={photographer.tapStatus} />
                                    </ListGroup.Item>
                                </ListGroup>
                            </Card>

                            <SectionCard title={copy.onboardingChecklist} subtitle={copy.editTapStatus}>
                                <div className="mb-3">
                                    <div className="d-flex justify-content-between mb-2">
                                        <span className="fw-medium">{completedChecklist}/{checklist.length}</span>
                                        <span className="text-muted fs-7">{common.completed}</span>
                                    </div>
                                    <ProgressBar now={(completedChecklist / checklist.length) * 100} variant="success" />
                                </div>
                                <div className="d-flex flex-column gap-3">
                                    {checklist.map((item) => (
                                        <div key={item.label} className="d-flex justify-content-between align-items-center border rounded-3 p-3">
                                            <span>{item.label}</span>
                                            <StatusPill label={item.done ? copy.yes : copy.no} tone={item.done ? 'active' : 'pending'} />
                                        </div>
                                    ))}
                                </div>
                            </SectionCard>
                        </Col>

                        <Col lg={8}>
                            <Row className="g-3 mb-3">
                                <Col md={6}>
                                    <SectionCard title={copy.profileSummary} subtitle={copy.bio}>
                                        <p className="mb-0">{getLocalizedValue(photographer.about, locale)}</p>
                                    </SectionCard>
                                </Col>
                                <Col md={6}>
                                    <SectionCard title={copy.businessSnapshot} subtitle={photographer.businessName}>
                                        <div className="d-flex flex-column gap-3">
                                            <div className="d-flex justify-content-between align-items-center">
                                                <span className="text-muted">{copy.monthlyRevenue}</span>
                                                <span className="fw-semibold">{intl.currency.format(photographer.monthlyRevenue)}</span>
                                            </div>
                                            <div className="d-flex justify-content-between align-items-center">
                                                <span className="text-muted">{copy.experience}</span>
                                                <span className="fw-semibold">{locale === 'ar' ? photographer.experienceAr : photographer.experience}</span>
                                            </div>
                                            <div className="d-flex justify-content-between align-items-center">
                                                <span className="text-muted">{copy.specialty}</span>
                                                <span className="fw-semibold">{photographer.specialty}</span>
                                            </div>
                                        </div>
                                    </SectionCard>
                                </Col>
                            </Row>

                            <Row className="g-3 mb-3">
                                <Col md={6}>
                                    <SectionCard title={copy.profileDetails} subtitle={copy.title}>
                                        <div className="d-flex flex-column gap-3">
                                            <div>
                                                <div className="text-muted fs-7 mb-1">{copy.city}</div>
                                                <div className="fw-medium">{photographer.city}</div>
                                            </div>
                                            <div>
                                                <div className="text-muted fs-7 mb-1">{copy.specialty}</div>
                                                <div className="fw-medium">{photographer.specialty}</div>
                                            </div>
                                            <div>
                                                <div className="text-muted fs-7 mb-1">{copy.publicUrl}</div>
                                                <div className="fw-medium">{photographer.publicUrl}</div>
                                            </div>
                                        </div>
                                    </SectionCard>
                                </Col>
                                <Col md={6}>
                                    <SectionCard title={copy.contactDetails} subtitle={copy.profileSummary}>
                                        <div className="d-flex flex-column gap-3">
                                            <div>
                                                <div className="text-muted fs-7 mb-1">{copy.email}</div>
                                                <div className="fw-medium">{photographer.email}</div>
                                            </div>
                                            <div>
                                                <div className="text-muted fs-7 mb-1">{copy.phone}</div>
                                                <div className="fw-medium">{photographer.phone}</div>
                                            </div>
                                            <div>
                                                <div className="text-muted fs-7 mb-1">{copy.preferredCurrency}</div>
                                                <div className="fw-medium">{photographer.preferredCurrency}</div>
                                            </div>
                                        </div>
                                    </SectionCard>
                                </Col>
                            </Row>

                            <SectionCard title={copy.serviceSnapshot} subtitle={copy.serviceSnapshotSubtitle}>
                                <Row className="g-3">
                                    <Col md={4}>
                                        <div className="border rounded-3 p-3 h-100">
                                            <div className="text-muted fs-7 mb-1">{copy.monthlyRevenue}</div>
                                            <h4 className="mb-0">{intl.currency.format(photographer.monthlyRevenue)}</h4>
                                        </div>
                                    </Col>
                                    <Col md={4}>
                                        <div className="border rounded-3 p-3 h-100">
                                            <div className="text-muted fs-7 mb-1">{copy.totalClients}</div>
                                            <h4 className="mb-0">{photographer.totalClients}</h4>
                                        </div>
                                    </Col>
                                    <Col md={4}>
                                        <div className="border rounded-3 p-3 h-100">
                                            <div className="text-muted fs-7 mb-1">{copy.upcomingBookings}</div>
                                            <h4 className="mb-0">{photographer.upcomingBookings}</h4>
                                        </div>
                                    </Col>
                                </Row>
                            </SectionCard>
                        </Col>
                    </Row>
                </div>
            </Container>
        </div>
    );
};

export default PhotographerProfile;
