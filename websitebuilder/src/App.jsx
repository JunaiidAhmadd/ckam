import { Route, Routes } from 'react-router-dom';
import MainLayout from './layouts/MainLayout.jsx';
import HomePage from './pages/HomePage.jsx';
import FeaturesPage from './pages/FeaturesPage.jsx';
import PricingPage from './pages/PricingPage.jsx';
import BlogsPage from './pages/BlogsPage.jsx';
import SingleBlogPage from './pages/SingleBlogPage.jsx';
import ContactPage from './pages/ContactPage.jsx';
import TermsPage from './pages/TermsPage.jsx';
import PrivacyPage from './pages/PrivacyPage.jsx';
import BookingPage from './pages/BookingPage.jsx';
import PlaceholderPage from './pages/PlaceholderPage.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="features" element={<FeaturesPage />} />
        <Route path="pricing" element={<PricingPage />} />
        <Route path="blogs" element={<BlogsPage />} />
        <Route path="blogs/:slug" element={<SingleBlogPage />} />
        <Route path="single-blog" element={<SingleBlogPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="terms-of-service" element={<TermsPage />} />
        <Route path="privacy-policy" element={<PrivacyPage />} />
        <Route path="booking" element={<BookingPage />} />
        <Route path="*" element={<PlaceholderPage fallback="Page not found" />} />
      </Route>
    </Routes>
  );
}
