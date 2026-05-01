import React, { useState } from 'react';
import SimpleBar from 'simplebar-react';
import { AlignLeft, Bell, CheckSquare, CreditCard, HelpCircle, LogOut, Search, Settings, Shield, User } from 'react-feather';
import { Button, Container, Dropdown, Form, InputGroup, Nav, Navbar } from 'react-bootstrap';
import { toggleCollapsedNav } from '../../redux/action/Theme';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import classNames from 'classnames';
import { motion } from 'framer-motion';
import HkBadge from '../../components/@hk-badge/@hk-badge';
import avatar3 from '../../assets/img/avatar3.jpg';
import avatar4 from '../../assets/img/avatar4.jpg';
import avatar12 from '../../assets/img/avatar12.jpg';
import { ThemeSwitcher } from '../../utils/theme-provider/theme-switcher';
import HeaderLanguageSwitcher from '../../views/CkamAdmin/localization/HeaderLanguageSwitcher';
import { useCkamAdmin } from '../../views/CkamAdmin/context';

const TopNav = ({ navCollapsed, toggleCollapsedNav }) => {
    const { locale, isArabic, adminProfile } = useCkamAdmin();
    const [showDropdown, setShowDropdown] = useState(false);
    const [searchValue, setSearchValue] = useState('');

    const searchPlaceholder = locale === 'ar' ? 'Search...' : 'Search...';
    const profileCopy = {
        identityTitle: [adminProfile.firstName, adminProfile.lastName].filter(Boolean).join(' ') || 'Administrator',
        account: 'Account',
        profile: 'Profile',
        settings: 'Settings',
        billing: 'Billing',
        paymentMethods: 'Payment methods',
        subscription: 'Subscription',
        support: 'Legal & Support',
        terms: 'Terms & Conditions',
        help: 'Help & Support',
        signOut: 'Sign out',
    };
    const notificationCopy = {
        title: 'Notifications',
        markAllRead: 'Mark all as read',
        viewAll: 'View all notifications',
        empty: 'No new notifications',
        items: [
            {
                id: 'approval',
                title: 'Photographer account pending approval',
                meta: '2 mins ago',
            },
            {
                id: 'subscription',
                title: 'Subscription plan updated successfully',
                meta: '10 mins ago',
            },
            {
                id: 'waitlist',
                title: 'New lead added to waiting list',
                meta: '25 mins ago',
            },
        ],
    };

    const closeSearchInput = () => {
        setSearchValue('');
        setShowDropdown(false);
    };

    const pageVariants = {
        initial: { opacity: 0, y: 10 },
        open: { opacity: 1, y: 0 },
        close: { opacity: 0, y: 10 },
    };

    const profileNavItem = (
        <Nav.Item key="profile">
            <Dropdown className="ps-2 ckam-profile-dropdown">
                <Dropdown.Toggle as={Link} to="#" className="no-caret">
                    <div className="avatar avatar-rounded avatar-xs">
                        {adminProfile.avatar ? (
                            <img src={adminProfile.avatar} alt="user" className="avatar-img" />
                        ) : (
                            <img src={avatar12} alt="user" className="avatar-img" />
                        )}
                    </div>
                </Dropdown.Toggle>
                <Dropdown.Menu align={isArabic ? 'start' : 'end'} className="p-0 ckam-profile-menu">
                    <div className="p-3 border-bottom">
                        <div className="media align-items-center">
                            <div className="media-head me-2">
                                <div className="avatar avatar-primary avatar-md avatar-rounded">
                                    <span className="initial-wrap">{([adminProfile.firstName?.[0], adminProfile.lastName?.[0]].filter(Boolean).join('') || 'A').toUpperCase()}</span>
                                </div>
                            </div>
                            <div className="media-body">
                                <div className="fw-medium text-dark">{profileCopy.identityTitle}</div>
                                <div className="fs-7 text-muted">{adminProfile.email}</div>
                            </div>
                        </div>
                    </div>
                    <div className="px-3 pt-3 pb-2 fs-7 fw-medium text-uppercase text-muted">{profileCopy.account}</div>
                    <div className="px-2 pb-2">
                        <Dropdown.Item as={Link} to="/admin/profile" className="rounded-3">
                            <span className="dropdown-icon feather-icon"><User /></span>
                            <span>{profileCopy.profile}</span>
                        </Dropdown.Item>
                        <Dropdown.Item as={Link} to="/admin/profile/edit" className="rounded-3">
                            <span className="dropdown-icon feather-icon"><Settings /></span>
                            <span>{profileCopy.settings}</span>
                        </Dropdown.Item>
                    </div>
                    <Dropdown.Divider as="div" />
                    <div className="px-3 pt-3 pb-2 fs-7 fw-medium text-uppercase text-muted">{profileCopy.billing}</div>
                    <div className="px-2 pb-2">
                        <Dropdown.Item className="rounded-3">
                            <span className="dropdown-icon feather-icon"><CreditCard /></span>
                            <span>{profileCopy.paymentMethods}</span>
                        </Dropdown.Item>
                        <Dropdown.Item className="rounded-3">
                            <span className="dropdown-icon feather-icon"><CheckSquare /></span>
                            <span>{profileCopy.subscription}</span>
                        </Dropdown.Item>
                    </div>
                    <Dropdown.Divider as="div" />
                    <div className="px-3 pt-3 pb-2 fs-7 fw-medium text-uppercase text-muted">{profileCopy.support}</div>
                    <div className="px-2 pb-2">
                        <Dropdown.Item className="rounded-3">
                            <span className="dropdown-icon feather-icon"><Shield /></span>
                            <span>{profileCopy.terms}</span>
                        </Dropdown.Item>
                        <Dropdown.Item className="rounded-3">
                            <span className="dropdown-icon feather-icon"><HelpCircle /></span>
                            <span>{profileCopy.help}</span>
                        </Dropdown.Item>
                    </div>
                    <Dropdown.Divider as="div" />
                    <div className="p-2">
                        <Dropdown.Item as={Link} to="/admin" className="rounded-3">
                            <span className="dropdown-icon feather-icon"><LogOut /></span>
                            <span>{profileCopy.signOut}</span>
                        </Dropdown.Item>
                    </div>
                </Dropdown.Menu>
            </Dropdown>
        </Nav.Item>
    );

    const themeNavItem = (
        <Nav.Item key="theme" className="ms-2">
            <ThemeSwitcher />
        </Nav.Item>
    );

    const notificationNavItem = (
        <Nav.Item key="notifications">
            <Dropdown className="ps-2 ckam-notification-dropdown">
                <Dropdown.Toggle as={Link} to="#" className="no-caret ckam-header-icon-toggle">
                    <span className="feather-icon"><Bell size={18} /></span>
                    <span className="ckam-notification-count">3</span>
                </Dropdown.Toggle>
                <Dropdown.Menu align={isArabic ? 'start' : 'end'} className="p-0 ckam-notification-menu">
                    <div className="ckam-notification-menu-head">
                        <span>{notificationCopy.title}</span>
                        <Button variant="link" className="p-0 ckam-notification-mark-all">
                            {notificationCopy.markAllRead}
                        </Button>
                    </div>
                    {notificationCopy.items.length ? (
                        <SimpleBar className="ckam-notification-list">
                            {notificationCopy.items.map((item) => (
                                <Dropdown.Item as={Link} to="#" key={item.id} className="ckam-notification-item">
                                    <div className="ckam-notification-item-title">{item.title}</div>
                                    <div className="ckam-notification-item-meta">{item.meta}</div>
                                </Dropdown.Item>
                            ))}
                        </SimpleBar>
                    ) : (
                        <div className="ckam-notification-empty">{notificationCopy.empty}</div>
                    )}
                    <div className="ckam-notification-menu-footer">
                        <Dropdown.Item as={Link} to="#" className="ckam-notification-view-all">
                            {notificationCopy.viewAll}
                        </Dropdown.Item>
                    </div>
                </Dropdown.Menu>
            </Dropdown>
        </Nav.Item>
    );

    const languageNavItem = (
        <Nav.Item key="language" className="ms-2">
            <HeaderLanguageSwitcher />
        </Nav.Item>
    );

    const headerActionItems = isArabic
        ? [profileNavItem, notificationNavItem, themeNavItem, languageNavItem]
        : [languageNavItem, themeNavItem, notificationNavItem, profileNavItem];

    return (
        <Navbar expand="xl" className="hk-navbar navbar-light fixed-top">
            <Container fluid>
                <div className="nav-start-wrap">
                    <Button variant="flush-dark" onClick={() => toggleCollapsedNav(!navCollapsed)} className="btn-icon btn-rounded flush-soft-hover navbar-toggle d-xl-none">
                        <span className="icon">
                            <span className="feather-icon"><AlignLeft /></span>
                        </span>
                    </Button>
                    <Dropdown as={Form} className="navbar-search" show={showDropdown} autoClose={() => setShowDropdown(!showDropdown)}>
                        <Dropdown.Toggle as="div" className="no-caret bg-transparent">
                            <Button variant="flush-dark" className="btn-icon btn-rounded flush-soft-hover d-xl-none" onClick={() => setShowDropdown(!showDropdown)}>
                                <span className="icon">
                                    <span className="feather-icon"><Search /></span>
                                </span>
                            </Button>
                            <InputGroup className="d-xl-flex d-none">
                                <span className="input-affix-wrapper input-search affix-border">
                                    <Form.Control
                                        type="text"
                                        className="bg-transparent"
                                        data-navbar-search-close="false"
                                        placeholder={searchPlaceholder}
                                        aria-label={searchPlaceholder}
                                        onFocus={() => setShowDropdown(true)}
                                        onBlur={() => setShowDropdown(false)}
                                        value={searchValue}
                                        onChange={(e) => setSearchValue(e.target.value)}
                                    />
                                    <span className="input-suffix" onClick={() => setSearchValue('')}>
                                        <span>/</span>
                                        <span className="btn-input-clear">
                                            <i className="bi bi-x-circle-fill" />
                                        </span>
                                        <span className="spinner-border spinner-border-sm input-loader text-primary" role="status">
                                            <span className="sr-only">Loading...</span>
                                        </span>
                                    </span>
                                </span>
                            </InputGroup>
                        </Dropdown.Toggle>
                        <Dropdown.Menu
                            as={motion.div}
                            initial="initial"
                            animate={showDropdown ? 'open' : 'close'}
                            variants={pageVariants}
                            transition={{ duration: 0.3 }}
                            className={classNames('p-0')}
                        >
                            <Dropdown.Item className="d-xl-none bg-transparent">
                                <InputGroup className="mobile-search">
                                    <span className="input-affix-wrapper input-search">
                                        <Form.Control
                                            type="text"
                                            placeholder={searchPlaceholder}
                                            aria-label={searchPlaceholder}
                                            value={searchValue}
                                            onChange={(e) => setSearchValue(e.target.value)}
                                            onFocus={() => setShowDropdown(true)}
                                            autoFocus
                                        />
                                        <span className="input-suffix" onClick={closeSearchInput}>
                                            <span className="btn-input-clear">
                                                <i className="bi bi-x-circle-fill" />
                                            </span>
                                            <span className="spinner-border spinner-border-sm input-loader text-primary" role="status">
                                                <span className="sr-only">Loading...</span>
                                            </span>
                                        </span>
                                    </span>
                                </InputGroup>
                            </Dropdown.Item>
                            <SimpleBar className="dropdown-body p-2">
                                <Dropdown.Header>Recent Search</Dropdown.Header>
                                <Dropdown.Item className="bg-transparent">
                                    <HkBadge bg="secondary" soft pill className="me-1">React</HkBadge>
                                    <HkBadge bg="secondary" soft pill className="me-1">Node JS</HkBadge>
                                    <HkBadge bg="secondary" soft pill>SCSS</HkBadge>
                                </Dropdown.Item>
                                <Dropdown.Divider as="div" />
                                <Dropdown.Header>Users</Dropdown.Header>
                                <Dropdown.Item as={Link} to="#">
                                    <div className="media align-items-center">
                                        <div className="media-head me-2">
                                            <div className="avatar avatar-xs avatar-rounded">
                                                <img src={avatar3} alt="user" className="avatar-img" />
                                            </div>
                                        </div>
                                        <div className="media-body">Sarah Jone</div>
                                    </div>
                                </Dropdown.Item>
                                <Dropdown.Item as={Link} to="#">
                                    <div className="media align-items-center">
                                        <div className="media-head me-2">
                                            <div className="avatar avatar-xs avatar-rounded">
                                                <img src={avatar4} alt="user" className="avatar-img" />
                                            </div>
                                        </div>
                                        <div className="media-body">Maria Richard</div>
                                    </div>
                                </Dropdown.Item>
                            </SimpleBar>
                        </Dropdown.Menu>
                    </Dropdown>
                </div>

                <div className="nav-end-wrap">
                    <Nav className="navbar-nav flex-row align-items-center">
                        {headerActionItems}
                    </Nav>
                </div>
            </Container>
        </Navbar>
    );
};

const mapStateToProps = ({ theme }) => {
    const { navCollapsed } = theme;
    return { navCollapsed };
};

export default connect(mapStateToProps, { toggleCollapsedNav })(TopNav);
