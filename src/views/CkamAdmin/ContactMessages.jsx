import React, { useMemo, useState } from 'react';
import { Col, Form, Row } from 'react-bootstrap';
import { useCkamAdmin } from './context';
import { adminCopy, getStatusLabel } from './localization/i18n';
import { MetricCard, SectionCard, StatusPill, useAdminPageSetup } from './shared';

const ContactMessages = () => {
    useAdminPageSetup();

    const { locale, contactMessages, updateContactMessageStatus } = useCkamAdmin();
    const copy = adminCopy[locale];
    const pageCopy = copy.messagesPage;
    const common = copy.common;
    const [searchTerm, setSearchTerm] = useState('');

    const filteredMessages = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();
        return contactMessages.filter((item) => {
            if (!query) return true;
            return [item.name, item.email, item.subject, item.message, item.source]
                .join(' ')
                .toLowerCase()
                .includes(query);
        });
    }, [contactMessages, searchTerm]);

    const totalMessages = contactMessages.length;
    const newMessages = contactMessages.filter((item) => item.status === 'new').length;
    const reviewedMessages = contactMessages.filter((item) => item.status === 'reviewed').length;
    const contactedMessages = contactMessages.filter((item) => item.status === 'contacted').length;

    return (
        <div className="container ckam-admin-page ckam-content-page">
            <div className="hk-pg-header pt-7">
                <div className="ckam-page-header ckam-page-header-title-only d-flex align-items-center">
                    <h1 className="pg-title mb-0">{copy.sidebar.messages}</h1>
                </div>
            </div>

            <div className="hk-pg-body">
                <Row className="g-3 mb-4">
                    <Col lg={3} md={6}>
                        <MetricCard title={pageCopy.totalMessages} value={totalMessages} subtitle={pageCopy.totalMessagesSubtitle} />
                    </Col>
                    <Col lg={3} md={6}>
                        <MetricCard title={common.new} value={newMessages} subtitle={pageCopy.newMessagesSubtitle} />
                    </Col>
                    <Col lg={3} md={6}>
                        <MetricCard title={common.reviewed} value={reviewedMessages} subtitle={pageCopy.reviewedMessagesSubtitle} />
                    </Col>
                    <Col lg={3} md={6}>
                        <MetricCard title={common.contacted} value={contactedMessages} subtitle={pageCopy.contactedMessagesSubtitle} />
                    </Col>
                </Row>

                <SectionCard title={pageCopy.inboxTitle} subtitle={pageCopy.inboxSubtitle}>
                    <Row className="mb-3">
                        <Col md={5}>
                            <Form.Control
                                value={searchTerm}
                                onChange={(event) => setSearchTerm(event.target.value)}
                                placeholder={pageCopy.searchPlaceholder}
                            />
                        </Col>
                    </Row>

                    <div className="table-responsive">
                        <table className="table align-middle mb-0">
                            <thead>
                                <tr>
                                    <th>{pageCopy.sender}</th>
                                    <th>{pageCopy.subject}</th>
                                    <th>{pageCopy.message}</th>
                                    <th>{pageCopy.source}</th>
                                    <th>{pageCopy.receivedAt}</th>
                                    <th>{pageCopy.status}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredMessages.length ? filteredMessages.map((item) => (
                                    <tr key={item.id}>
                                        <td>
                                            <div className="fw-medium">{item.name}</div>
                                            <div className="fs-8 text-muted">{item.email}</div>
                                        </td>
                                        <td className="fw-medium">{item.subject}</td>
                                        <td className="text-muted" style={{ maxWidth: '360px' }}>{item.message}</td>
                                        <td>{item.source}</td>
                                        <td>{new Date(item.createdAt).toLocaleDateString(locale === 'ar' ? 'ar-BH' : 'en-US')}</td>
                                        <td className="mw-180p">
                                            <div className="d-flex flex-column gap-2">
                                                <StatusPill label={getStatusLabel(item.status, locale)} tone={item.status} />
                                                <Form.Select
                                                    size="sm"
                                                    value={item.status}
                                                    onChange={(event) => updateContactMessageStatus(item.id, event.target.value)}
                                                >
                                                    <option value="new">{common.new}</option>
                                                    <option value="reviewed">{common.reviewed}</option>
                                                    <option value="contacted">{common.contacted}</option>
                                                </Form.Select>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={6} className="text-center text-muted py-4">{pageCopy.emptyState}</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </SectionCard>
            </div>
        </div>
    );
};

export default ContactMessages;
