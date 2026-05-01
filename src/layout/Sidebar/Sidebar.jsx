/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState } from 'react';
import { Nav } from 'react-bootstrap';
import SimpleBar from 'simplebar-react';
import { connect } from 'react-redux';
import { toggleCollapsedNav } from '../../redux/action/Theme';
import { NavLink, useRouteMatch } from 'react-router-dom';
import SidebarHeader from './SidebarHeader';
import { getSidebarMenu } from './SidebarMenu';
import classNames from 'classnames';
import { useWindowWidth } from '@react-hook/window-size';
import { useCkamAdmin } from '../../views/CkamAdmin/context';

const Sidebar = ({ navCollapsed, toggleCollapsedNav }) => {
    const [activeMenu, setActiveMenu] = useState();
    const [activeSubMenu, setActiveSubMenu] = useState();
    const windowWidth = useWindowWidth();
    const { locale } = useCkamAdmin();
    const sidebarMenu = getSidebarMenu(locale);

    const handleClick = (menuName) => {
        setActiveMenu(menuName);
        if (windowWidth <= 1199) {
            toggleCollapsedNav(false);
        }
    };

    const backDropToggle = () => {
        toggleCollapsedNav(!navCollapsed);
    };

    return (
        <>
            <div className="hk-menu">
                <SidebarHeader />
                <SimpleBar className="nicescroll-bar">
                    <div className="menu-content-wrap">
                        {sidebarMenu.map((routes, index) => (
                            <React.Fragment key={index}>
                                <div className="menu-group">
                                    {routes.group && <div className="nav-header"><span>{routes.group}</span></div>}
                                    {routes.contents.map((menus, idx) => {
                                        const isMenuActive = menus.childrens
                                            ? useRouteMatch(menus.path)
                                            : useRouteMatch({ path: menus.path, exact: true });
                                        const isMenuOpen = Boolean(isMenuActive) || activeMenu === menus.name;

                                        return (
                                            <Nav bsPrefix="navbar-nav" className="flex-column" key={idx}>
                                                <Nav.Item className={classNames({ active: isMenuActive })}>
                                                    {menus.childrens ? (
                                                        <>
                                                            <Nav.Link
                                                                data-bs-toggle="collapse"
                                                                data-bs-target={`#${menus.id}`}
                                                                aria-expanded={isMenuOpen ? 'true' : 'false'}
                                                                onClick={() => setActiveMenu(menus.name)}
                                                            >
                                                                <span className={classNames('nav-icon-wrap', { 'position-relative': menus.iconBadge })}>
                                                                    {menus.iconBadge && menus.iconBadge}
                                                                    <span className="svg-icon">{menus.icon}</span>
                                                                </span>
                                                                <span className={classNames('nav-link-text', { 'position-relative': menus.badgeIndicator })}>
                                                                    {menus.name}
                                                                    {menus.badgeIndicator && menus.badgeIndicator}
                                                                </span>
                                                                {menus.badge && menus.badge}
                                                            </Nav.Link>
                                                            <ul id={menus.id} className={classNames('nav flex-column nav-children', { collapse: !isMenuOpen })}>
                                                                <li className="nav-item">
                                                                    <ul className="nav flex-column">
                                                                        {menus.childrens.map((subMenu, indx) => (
                                                                            subMenu.childrens ? (
                                                                                <li className="nav-item" key={indx}>
                                                                                    <Nav.Link
                                                                                        as={NavLink}
                                                                                        to={subMenu.path}
                                                                                        className="nav-link"
                                                                                        data-bs-toggle="collapse"
                                                                                        data-bs-target={`#${subMenu.id}`}
                                                                                        aria-expanded={activeSubMenu === subMenu.name ? 'true' : 'false'}
                                                                                        onClick={() => setActiveSubMenu(subMenu.name)}
                                                                                    >
                                                                                        <span className="nav-link-text">{subMenu.name}</span>
                                                                                    </Nav.Link>
                                                                                    {subMenu.childrens.map((childrenPath, i) => (
                                                                                        <ul id={subMenu.id} className={classNames('nav flex-column nav-children', { collapse: activeSubMenu !== subMenu.name })} key={i}>
                                                                                            <li className="nav-item">
                                                                                                <ul className="nav flex-column">
                                                                                                    <li className="nav-item">
                                                                                                        <Nav.Link as={NavLink} to={childrenPath.path} onClick={handleClick}>
                                                                                                            <span className="nav-link-text">{childrenPath.name}</span>
                                                                                                        </Nav.Link>
                                                                                                    </li>
                                                                                                </ul>
                                                                                            </li>
                                                                                        </ul>
                                                                                    ))}
                                                                                </li>
                                                                            ) : (
                                                                                <li className="nav-item" key={indx}>
                                                                                    <Nav.Link as={NavLink} to={subMenu.path} onClick={() => handleClick(menus.name)}>
                                                                                        <span className="nav-link-text">{subMenu.name}</span>
                                                                                    </Nav.Link>
                                                                                </li>
                                                                            )
                                                                        ))}
                                                                    </ul>
                                                                </li>
                                                            </ul>
                                                        </>
                                                    ) : (
                                                        <>
                                                            {routes.group === 'Documentation' ? (
                                                                <a className="nav-link" href={menus.path}>
                                                                    <span className="nav-icon-wrap">
                                                                        <span className="svg-icon">{menus.icon}</span>
                                                                    </span>
                                                                    <span className="nav-link-text">{menus.name}</span>
                                                                    {menus.badge && menus.badge}
                                                                </a>
                                                            ) : (
                                                                <Nav.Link as={NavLink} exact={true} activeClassName="active" to={menus.path} onClick={() => handleClick(menus.name)}>
                                                                    <span className="nav-icon-wrap">
                                                                        <span className="svg-icon">{menus.icon}</span>
                                                                    </span>
                                                                    <span className="nav-link-text">{menus.name}</span>
                                                                    {menus.badge && menus.badge}
                                                                </Nav.Link>
                                                            )}
                                                        </>
                                                    )}
                                                </Nav.Item>
                                            </Nav>
                                        );
                                    })}
                                </div>
                                <div className="menu-gap" />
                            </React.Fragment>
                        ))}

                    </div>
                </SimpleBar>
            </div>
            <div onClick={backDropToggle} className="hk-menu-backdrop" />
        </>
    );
};

const mapStateToProps = ({ theme }) => {
    const { navCollapsed } = theme;
    return { navCollapsed };
};

export default connect(mapStateToProps, { toggleCollapsedNav })(Sidebar);
