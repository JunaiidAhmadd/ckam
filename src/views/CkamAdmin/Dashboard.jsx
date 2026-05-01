import React, { useEffect, useMemo, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { Button, ButtonGroup, Col, Dropdown, Form, InputGroup, ProgressBar, Row } from 'react-bootstrap';
import DateRangePicker from 'react-bootstrap-daterangepicker';
import moment from 'moment';
import { Calendar, MoreVertical } from 'react-feather';
import { Link } from 'react-router-dom';
import HkBadge from '../../components/@hk-badge/@hk-badge';
import { useCkamAdmin } from './context';
import { adminCopy, getStatusLabel } from './localization/i18n';
import { formatCurrency, SectionCard, StatusPill, useAdminPageSetup } from './shared';

const formatRangeLabel = (startDate, endDate) => `${startDate.format('M/D hh:mm A')} - ${endDate.format('M/D hh:mm A')}`;

const Dashboard = () => {
    useAdminPageSetup();

    const { locale, photographers, revenueTimeline, waitlist, updateWaitlistStatus } = useCkamAdmin();
    const copy = adminCopy[locale].dashboard;
    const common = adminCopy[locale].common;

    const initialStartDate = useMemo(() => moment().startOf('hour'), []);
    const initialEndDate = useMemo(() => moment().startOf('hour').add(32, 'hour'), []);
    const [selectedView, setSelectedView] = useState('all');
    const [dateRangeLabel, setDateRangeLabel] = useState(formatRangeLabel(initialStartDate, initialEndDate));

    const totalPhotographers = photographers.length;
    const activeSubscriptions = photographers.filter((item) => item.subscriptionStatus === 'active').length;
    const monthlyRevenue = photographers.reduce((total, item) => total + item.monthlyRevenue, 0);
    const waitingApprovals = photographers.filter((item) => item.accountStatus === 'waiting').length;

    const tapCounts = {
        connected: photographers.filter((item) => item.tapStatus === 'connected').length,
        pending: photographers.filter((item) => item.tapStatus === 'pending').length,
        notStarted: photographers.filter((item) => item.tapStatus === 'not-started').length,
    };

    const waitlistCounts = {
        total: waitlist.length,
        new: waitlist.filter((item) => item.status === 'new').length,
        reviewed: waitlist.filter((item) => item.status === 'reviewed').length,
        contacted: waitlist.filter((item) => item.status === 'contacted').length,
    };

    const maxRevenue = Math.max(...revenueTimeline.map((item) => item.amount));
    const actionQueue = photographers.filter((item) => item.accountStatus !== 'active' || item.tapStatus !== 'connected');

    useEffect(() => {
        window.dispatchEvent(new Event('resize'));
    }, []);

    const handleDatePickerShow = (_, picker) => {
        picker.container.addClass('ckam-admin-daterangepicker');
    };

    const handleDateRangeApply = (_, picker) => {
        picker.container.addClass('ckam-admin-daterangepicker');
        setDateRangeLabel(formatRangeLabel(picker.startDate, picker.endDate));
    };

    const overviewChartOptions = {
        chart: {
            type: 'bar',
            height: 270,
            stacked: true,
            toolbar: { show: false },
            zoom: { enabled: false },
            foreColor: '#646A71',
            fontFamily: 'DM Sans',
        },
        grid: { borderColor: 'var(--bs-gray-100)' },
        plotOptions: {
            bar: {
                horizontal: false,
                columnWidth: '35%',
                borderRadius: 5,
                borderRadiusApplication: 'end',
                borderRadiusWhenStacked: 'last',
            },
        },
        xaxis: {
            categories: revenueTimeline.map((entry) => entry.month),
            labels: { style: { fontSize: '12px', fontFamily: 'inherit' } },
            axisBorder: { show: false },
        },
        yaxis: {
            labels: { style: { fontSize: '12px', fontFamily: 'inherit' } },
        },
        legend: {
            show: true,
            position: 'top',
            fontSize: '15px',
            labels: { colors: '#6f6f6f' },
            markers: { size: 5, shape: 'circle' },
            itemMargin: { vertical: 5 },
        },
        colors: ['#ff8a45', '#f5b347', '#fde4cc'],
        fill: { opacity: 1 },
        dataLabels: { enabled: false },
    };

    const overviewChartSeries = [
        {
            name: copy.revenueOverview,
            data: revenueTimeline.map((entry) => Math.round((entry.amount / maxRevenue) * 70)),
        },
        {
            name: copy.invoicesSeries,
            data: revenueTimeline.map((entry) => entry.invoices),
        },
        {
            name: copy.waitingListTracking,
            data: revenueTimeline.map((entry, index) => {
                const cycle = [waitlistCounts.new, waitlistCounts.reviewed, waitlistCounts.contacted];
                return cycle[index % cycle.length] + 2;
            }),
        },
    ];

    const snapshotChartOptions = {
        stroke: { lineCap: 'round' },
        chart: { height: 235, type: 'radialBar' },
        plotOptions: {
            radialBar: {
                hollow: { margin: 0, size: '55%' },
                dataLabels: {
                    showOn: 'always',
                    name: { show: false },
                    value: { fontSize: '1.75rem', show: true, fontWeight: '500' },
                    total: {
                        show: true,
                        formatter: () => `${totalPhotographers}`,
                    },
                },
            },
        },
        colors: ['#ff8a45', '#f5b347'],
        labels: [copy.activeSubscriptions, copy.pendingApprovalsLabel],
    };

    const snapshotSeries = [
        totalPhotographers ? Math.round((activeSubscriptions / totalPhotographers) * 100) : 0,
        totalPhotographers ? Math.round((waitingApprovals / totalPhotographers) * 100) : 0,
    ];

    return (
        <div className="container ckam-admin-page ckam-dashboard-page">
            <div className="hk-pg-header pt-7">
                <div className="ckam-page-header ckam-page-header-title-only d-flex align-items-center">
                    <h1 className="pg-title mb-0">{adminCopy[locale].sidebar.adminDashboard}</h1>
                </div>
            </div>

            <div className="hk-pg-body">
                <Row className="g-3 mb-4">
                    <Col xxl={9} lg={8}>
                        <div className="card card-border mb-0 h-100">
                            <div className="card-header card-header-action">
                                <h6>{copy.overview}</h6>
                                <div className="card-action-wrap">
                                    <ButtonGroup className="d-lg-flex d-none" aria-label="CKAM stats views">
                                        {['all', 'photographers', 'billing', 'waitlist'].map((viewKey) => (
                                            <Button
                                                key={viewKey}
                                                variant="light"
                                                className={`ckam-view-button ${selectedView === viewKey ? 'active' : ''}`}
                                                onClick={() => setSelectedView(viewKey)}
                                            >
                                                {copy[viewKey]}
                                            </Button>
                                        ))}
                                    </ButtonGroup>
                                    <Form.Select className="d-lg-none d-flex" value={selectedView} onChange={(event) => setSelectedView(event.target.value)}>
                                        <option value="all">{copy.all}</option>
                                        <option value="photographers">{copy.photographers}</option>
                                        <option value="billing">{copy.billing}</option>
                                        <option value="waitlist">{copy.waitlist}</option>
                                    </Form.Select>
                                </div>
                            </div>
                            <div className="card-body">
                                <ReactApexChart options={overviewChartOptions} series={overviewChartSeries} type="bar" height={270} />
                                <div className="separator-full mt-5" />
                                <div className="flex-grow-1 ms-lg-3">
                                    <Row>
                                        <Col xxl={3} sm={6} className="mb-3">
                                            <span className="d-block fw-medium fs-7">{copy.totalPhotographers}</span>
                                            <div className="d-flex align-items-center flex-wrap gap-1">
                                                <span className="d-block fs-4 fw-medium text-dark mb-0">{totalPhotographers}</span>
                                                <HkBadge bg="warning" size="sm" soft>
                                                    <i className="bi bi-arrow-up" /> {copy.activeNetwork}
                                                </HkBadge>
                                            </div>
                                        </Col>
                                        <Col xxl={3} sm={6} className="mb-3">
                                            <span className="d-block fw-medium fs-7">{copy.activeSubscriptions}</span>
                                            <div className="d-flex align-items-center flex-wrap gap-1">
                                                <span className="d-block fs-4 fw-medium text-dark mb-0">{activeSubscriptions}</span>
                                                <HkBadge bg="warning" size="sm" soft>
                                                    <i className="bi bi-arrow-up" /> {copy.paidAccounts}
                                                </HkBadge>
                                            </div>
                                        </Col>
                                        <Col xxl={3} sm={6} className="mb-3">
                                            <span className="d-block fw-medium fs-7">{copy.revenueOverview}</span>
                                            <div className="d-flex align-items-center flex-wrap gap-1">
                                                <span className="d-block fs-4 fw-medium text-dark mb-0">{formatCurrency(monthlyRevenue, locale)}</span>
                                                <HkBadge bg="warning" size="sm" soft>{copy.recurringMonthly}</HkBadge>
                                            </div>
                                        </Col>
                                        <Col xxl={3} sm={6}>
                                            <span className="d-block fw-medium fs-7">{copy.waitingListTracking}</span>
                                            <div className="d-flex align-items-center flex-wrap gap-2">
                                                <span className="d-block fs-4 fw-medium text-dark mb-0">{waitlistCounts.total}</span>
                                                <HkBadge bg="warning" size="sm" soft>
                                                    {waitingApprovals} {copy.approvalsPending}
                                                </HkBadge>
                                            </div>
                                        </Col>
                                    </Row>
                                </div>
                            </div>
                        </div>
                    </Col>
                    <Col xxl={3} lg={4}>
                        <div className="card card-border mb-0 h-100">
                            <div className="card-header card-header-action">
                                <h6>{copy.accountSnapshot}</h6>
                                <div className="card-action-wrap">
                                    <Dropdown className="inline-block">
                                        <Dropdown.Toggle variant="transparent" className="btn-icon btn-rounded btn-flush-dark flush-soft-hover no-caret">
                                            <span className="icon"><span className="feather-icon"><MoreVertical /></span></span>
                                        </Dropdown.Toggle>
                                        <Dropdown.Menu align="end">
                                            <Dropdown.Item as={Link} to="/admin/photographers">{copy.viewPhotographers}</Dropdown.Item>
                                            <Dropdown.Item as={Link} to="/admin/subscriptions">{copy.viewPlans}</Dropdown.Item>
                                            <Dropdown.Item as={Link} to="/admin/content">{copy.viewContent}</Dropdown.Item>
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </div>
                            </div>
                            <div className="card-body text-center">
                                <ReactApexChart options={snapshotChartOptions} series={snapshotSeries} type="radialBar" height={235} />
                                <div className="d-inline-block mt-4">
                                    <div className="mb-4">
                                        <span className="d-block badge-status lh-1">
                                            <HkBadge bg="warning" className="badge-indicator badge-indicator-nobdr d-inline-block" />
                                            <span className="badge-label d-inline-block">{copy.activeSubscriptions}</span>
                                        </span>
                                        <span className="d-block text-dark fs-5 fw-medium mb-0 mt-1">{activeSubscriptions}</span>
                                    </div>
                                    <div>
                                        <span className="badge-status lh-1">
                                            <HkBadge bg="warning" className="badge-indicator badge-indicator-nobdr" />
                                            <span className="badge-label">{copy.pendingApprovalsLabel}</span>
                                        </span>
                                        <span className="d-block text-dark fs-5 fw-medium mb-0 mt-1">{waitingApprovals}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Col>
                </Row>

                <Row className="g-3">
                    <Col xl={7} className="d-flex flex-column gap-3">
                        <SectionCard title={copy.revenueSectionTitle} subtitle={copy.revenueSectionSubtitle}>
                            {revenueTimeline.map((entry) => (
                                <div key={entry.month} className="mb-3">
                                    <div className="d-flex justify-content-between align-items-center mb-2 gap-2">
                                        <div>
                                            <div className="fw-medium">{entry.month}</div>
                                            <div className="fs-8 text-muted">{entry.invoices} {copy.invoicesProcessed}</div>
                                        </div>
                                        <div className="fw-semibold">{formatCurrency(entry.amount, locale)}</div>
                                    </div>
                                    <ProgressBar now={(entry.amount / maxRevenue) * 100} variant="primary" style={{ height: 8 }} />
                                </div>
                            ))}
                        </SectionCard>

                        <SectionCard title={copy.waitingListTitle} subtitle={copy.waitingListSubtitle}>
                            <div className="table-responsive">
                                <table className="table align-middle mb-0">
                                    <thead>
                                        <tr>
                                            <th>{copy.name}</th>
                                            <th>{copy.interest}</th>
                                            <th>{copy.source}</th>
                                            <th>{copy.status}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {waitlist.slice(0, 4).map((entry) => (
                                            <tr key={entry.id}>
                                                <td>
                                                    <div className="fw-medium">{entry.name}</div>
                                                    <div className="fs-8 text-muted">{entry.email}</div>
                                                </td>
                                                <td>{entry.interest}</td>
                                                <td>{entry.source}</td>
                                                <td className="mw-180p">
                                                    <Form.Select size="sm" value={entry.status} onChange={(event) => updateWaitlistStatus(entry.id, event.target.value)}>
                                                        <option value="new">{common.new}</option>
                                                        <option value="reviewed">{common.reviewed}</option>
                                                        <option value="contacted">{common.contacted}</option>
                                                    </Form.Select>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </SectionCard>
                    </Col>

                    <Col xl={5} className="d-flex flex-column gap-3">
                        <SectionCard title={copy.tapTitle} subtitle={copy.tapSubtitle}>
                            <div className="mb-4">
                                <div className="d-flex justify-content-between mb-2 gap-2 flex-wrap">
                                    <span className="fw-medium">{common.connected}</span>
                                    <StatusPill label={`${tapCounts.connected} ${common.photographersLabel}`} tone="connected" />
                                </div>
                                <ProgressBar now={(tapCounts.connected / totalPhotographers) * 100} variant="success" />
                            </div>
                            <div className="mb-4">
                                <div className="d-flex justify-content-between mb-2 gap-2 flex-wrap">
                                    <span className="fw-medium">{copy.pendingSetup}</span>
                                    <StatusPill label={`${tapCounts.pending} ${common.photographersLabel}`} tone="pending" />
                                </div>
                                <ProgressBar now={(tapCounts.pending / totalPhotographers) * 100} variant="warning" />
                            </div>
                            <div>
                                <div className="d-flex justify-content-between mb-2 gap-2 flex-wrap">
                                    <span className="fw-medium">{common.notStarted}</span>
                                    <StatusPill label={`${tapCounts.notStarted} ${common.photographersLabel}`} tone="not-started" />
                                </div>
                                <ProgressBar now={(tapCounts.notStarted / totalPhotographers) * 100} variant="secondary" />
                            </div>
                        </SectionCard>

                        <SectionCard title={copy.operationsTitle} subtitle={copy.operationsSubtitle}>
                            <div className="d-flex flex-column gap-3">
                                {actionQueue.map((photographer) => (
                                    <div key={photographer.id} className="border rounded-3 p-3">
                                        <div className="d-flex justify-content-between align-items-start mb-2 gap-2">
                                            <div>
                                                <div className="fw-medium">{photographer.name}</div>
                                                <div className="fs-8 text-muted">{photographer.city} - {photographer.specialty}</div>
                                            </div>
                                            <StatusPill label={getStatusLabel(photographer.accountStatus, locale)} tone={photographer.accountStatus} />
                                        </div>
                                        <div className="d-flex align-items-center justify-content-between gap-2 flex-wrap">
                                            <span className="fs-7 text-muted">{copy.tapStatus}: {getStatusLabel(photographer.tapStatus, locale)}</span>
                                            <Button as={Link} to="/admin/photographers" className="ckam-accent-outline" variant="light" size="sm">
                                                {copy.openManager}
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </SectionCard>
                    </Col>
                </Row>            </div>
        </div>
    );
};

export default Dashboard;





