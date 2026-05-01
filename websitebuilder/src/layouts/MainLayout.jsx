import { Outlet } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import ThemeSwitcher from '../components/ThemeSwitcher.jsx';

export default function MainLayout() {
  return (
    <div className="page-wrapper">
      <ThemeSwitcher />
      <Header />
      <Outlet />
      <Footer />
      <a href="#top" className="back-to-top bounce" aria-label="Back to top">
        <i className="ri-arrow-up-s-line" />
      </a>
    </div>
  );
}
