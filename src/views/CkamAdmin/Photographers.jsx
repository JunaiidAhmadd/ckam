import React, { useMemo, useState } from 'react';
import { Button, Col, Form, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useCkamAdmin } from './context';
import { adminCopy, getLocalizedValue, getStatusLabel } from './localization/i18n';
import { MetricCard, SectionCard, StatusPill, formatCurrency, useAdminPageSetup } from './shared';

const Photographers = () => {
    useAdminPageSetup();

    const { locale, photographers, updatePhotographerAccount, updatePhotographerTap } = useCkamAdmin();
    const copy = adminCopy[locale].photographersPage;
    const common = adminCopy[locale].common;
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    const filteredPhotographers = useMemo(() => photographers.filter((photographer) => {
        const matchesFilter = filter === 'all' ? true : photographer.accountStatus === filter;
        const query = searchTerm.toLowerCase();
        const matchesSearch = !query || [
            photographer.name,
            photographer.city,
            photographer.specialty,
            getLocalizedValue(photographer.planName, locale),
            photographer.tapStatus,
            photographer.email,
        ].join(' ').toLowerCase().includes(query);

        return matchesFilter && matchesSearch;
    }), [filter, locale, photographers, searchTerm]);

    const activeCount = photographers.filter((item) => item.accountStatus === 'active').length;
    const waitingCount = photographers.filter((item) => item.accountStatus === 'waiting').length;
    const connectedCount = photographers.filter((item) => item.tapStatus === 'connected').length;

    const handleAccountAction = (photographer) => {
        if (photographer.accountStatus === 'active') {
            updatePhotographerAccount(photographer.id, 'deactivated');
            return;
        }

        updatePhotographerAccount(photographer.id, 'active');
    };

    return (
        <div className="container ckam-admin-page ckam-content-page">
            <div className="hk-pg-header pt-7">
                <div className="ckam-page-header ckam-page-header-title-only d-flex align-items-center">
                    <h1 className="pg-title mb-0">{adminCopy[locale].sidebar.photographers}</h1>
                </div>
            </div>

            <div className="hk-pg-body">
                <Row className="g-3 mb-4">
                    <Col lg={4}>
                        <MetricCard title={copy.activeAccounts} value={activeCount} subtitle={copy.activeAccountsSubtitle} />
                    </Col>
                    <Col lg={4}>
                        <MetricCard title={copy.waitingApproval} value={waitingCount} subtitle={copy.waitingApprovalSubtitle} />
                    </Col>
                    <Col lg={4}>
                        <MetricCard title={copy.tapConnected} value={connectedCount} subtitle={copy.tapConnectedSubtitle} />
                    </Col>
                </Row>

                <SectionCard
                    title={copy.accountsTitle}
                    subtitle={copy.accountsSubtitle}
                    action={(
                        <div className="d-flex flex-wrap gap-2">
                            <Button variant={filter === 'all' ? 'primary' : 'outline-light'} size="sm" onClick={() => setFilter('all')}>{copy.all}</Button>
                            <Button variant={filter === 'active' ? 'primary' : 'outline-light'} size="sm" onClick={() => setFilter('active')}>{copy.active}</Button>
                            <Button variant={filter === 'waiting' ? 'primary' : 'outline-light'} size="sm" onClick={() => setFilter('waiting')}>{copy.waiting}</Button>
                            <Button variant={filter === 'deactivated' ? 'primary' : 'outline-light'} size="sm" onClick={() => setFilter('deactivated')}>{copy.deactivated}</Button>
                        </div>
                    )}
                >
                    <Row className="mb-3">
                        <Col md={4}>
                            <Form.Control
                                value={searchTerm}
                                onChange={(event) => setSearchTerm(event.target.value)}
                                placeholder={copy.searchPlaceholder}
                            />
                        </Col>
                    </Row>
                    <div className="table-responsive">
                        <table className="table align-middle mb-0">
                            <thead>
                                <tr>
                                    <th>{copy.photographer}</th>
                                    <th>{copy.plan}</th>
                                    <th>{copy.revenue}</th>
                                    <th>{copy.tapOnboarding}</th>
                                    <th>{copy.account}</th>
                                    <th>{copy.actions}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPhotographers.map((photographer) => (
                                    <tr key={photographer.id}>
                                        <td>
                                            <Link to={`/admin/photographers/${photographer.id}`} className="fw-medium text-dark text-decoration-none">
                                                {photographer.name}
                                            </Link>
                                            <div className="fs-8 text-muted">{photographer.city} • {photographer.specialty}</div>
                                        </td>
                                        <td>
                                            <div className="fw-medium">{getLocalizedValue(photographer.planName, locale)}</div>
                                            <StatusPill label={getStatusLabel(photographer.subscriptionStatus, locale)} tone={photographer.subscriptionStatus} />
                                        </td>
                                        <td>{formatCurrency(photographer.monthlyRevenue, locale, photographer.preferredCurrency || 'USD')}</td>
                                        <td className="mw-180p">
                                            <Form.Select size="sm" value={photographer.tapStatus} onChange={(event) => updatePhotographerTap(photographer.id, event.target.value)}>
                                                <option value="connected">{common.connected}</option>
                                                <option value="pending">{common.pending}</option>
                                                <option value="not-started">{common.notStarted}</option>
                                            </Form.Select>
                                        </td>
                                        <td>
                                            <StatusPill label={getStatusLabel(photographer.accountStatus, locale)} tone={photographer.accountStatus} />
                                        </td>
                                        <td>
                                            <div className="d-flex flex-wrap gap-2">
                                                <Button as={Link} to={`/admin/photographers/${photographer.id}`} variant="outline-light" size="sm">
                                                    {copy.viewAccount}
                                                </Button>
                                                <Button
                                                    variant={photographer.accountStatus === 'active' ? 'outline-danger' : 'outline-success'}
                                                    size="sm"
                                                    onClick={() => handleAccountAction(photographer)}
                                                >
                                                    {photographer.accountStatus === 'active'
                                                        ? copy.deactivate
                                                        : photographer.accountStatus === 'waiting'
                                                            ? copy.approve
                                                            : copy.reactivate}
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </SectionCard>
            </div>
        </div>
    );
};

export default Photographers;







