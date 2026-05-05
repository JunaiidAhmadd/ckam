import AdminDashboard from '../views/CkamAdmin/Dashboard';
import AdminLogin from '../views/CkamAdmin/AdminLogin';
import AdminProfile from '../views/CkamAdmin/AdminProfile';
import AdminEditProfile from '../views/CkamAdmin/AdminEditProfile';
import PhotographerManagement from '../views/CkamAdmin/Photographers';
import PhotographerProfile from '../views/CkamAdmin/PhotographerProfile';
import SubscriptionManagement from '../views/CkamAdmin/Subscriptions';
import ContactMessages from '../views/CkamAdmin/ContactMessages';
import BlogManagement from '../views/CkamAdmin/BlogManagement';
import PublicWebsiteBuilder, { PublicWebsiteBuilderRedirect } from '../views/CkamAdmin/PublicWebsiteBuilder';

export const routes = [
    { path: 'admin', exact: true, component: AdminDashboard },
    { path: 'admin/profile', exact: true, component: AdminProfile },
    { path: 'admin/profile/edit', exact: true, component: AdminEditProfile },
    { path: 'admin/photographers', exact: true, component: PhotographerManagement },
    { path: 'admin/photographers/:id', exact: true, component: PhotographerProfile },
    { path: 'admin/subscriptions', exact: true, component: SubscriptionManagement },
    { path: 'admin/messages', exact: true, component: ContactMessages },
    { path: 'admin/blogs', exact: true, component: BlogManagement },
    { path: 'admin/content', exact: true, component: PublicWebsiteBuilderRedirect },
    { path: 'admin/public-page', exact: true, component: PublicWebsiteBuilderRedirect },
    { path: 'admin/website-builder', exact: true, component: PublicWebsiteBuilderRedirect },
    { path: 'admin/website-builder/:pageSlug', exact: true, component: PublicWebsiteBuilder },
];

export const authRoutes = [
    { path: 'admin/login', exact: true, component: AdminLogin },
];


