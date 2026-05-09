import React from 'react';
import { connect } from 'react-redux';
import { toggleCollapsedNav } from '../../redux/action/Theme';
import { Link } from 'react-router-dom';
import { ArrowBarToLeft, ArrowBarToRight } from 'tabler-icons-react';
import { Button } from 'react-bootstrap';
import { useTheme } from '../../utils/theme-provider/theme-provider';
import { brandAssets } from '../../utils/branding';


const SidebarHeader = ({ navCollapsed, toggleCollapsedNav }) => {

    const { theme } = useTheme();

    const toggleSidebar = () => {
        toggleCollapsedNav(!navCollapsed);
        document.getElementById('tggl-btn').blur();
    }
    return (
        <div className="menu-header">
            <span>
                <Link className="navbar-brand ckam-navbar-brand" to="/">
                    <img className="brand-img img-fluid sidebar-brand-mark" src={brandAssets.icon} alt={brandAssets.appName} />
                    {theme === "light"
                        ? <img className="brand-img img-fluid sidebar-brand-wordmark logo-light" src={brandAssets.logoLight} alt={brandAssets.appName} />
                        : <img className="brand-img img-fluid sidebar-brand-wordmark logo-dark" src={brandAssets.logoDark} alt={brandAssets.appName} />}
                </Link>
                <Button id="tggl-btn" variant="flush-dark" onClick={toggleSidebar} className="btn-icon btn-rounded flush-soft-hover navbar-toggle sidebar-toggle-btn">
                    <span className="icon">
                        <span className="svg-icon fs-5">
                            {navCollapsed ? <ArrowBarToRight /> : <ArrowBarToLeft />}
                        </span>
                    </span>
                </Button>
            </span>
        </div>
    )
}

const mapStateToProps = ({ theme }) => {
    const { navCollapsed } = theme;
    return { navCollapsed }
};

export default connect(mapStateToProps, { toggleCollapsedNav })(SidebarHeader);
