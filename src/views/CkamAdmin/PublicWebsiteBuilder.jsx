import React from 'react';
import { Redirect, useParams } from 'react-router-dom';
import AdminWebsiteBuilderApp from '../../../websitebuilder/admin-builder/components/AdminWebsiteBuilderApp.jsx';
import { BuilderProvider } from '../../../websitebuilder/admin-builder/state/BuilderContext.jsx';
import { useAdminPageSetup } from './shared';
import { getWebsiteBuilderPage, websiteBuilderPages } from './websiteBuilderConfig';

const DEFAULT_WEBSITE_BUILDER_SLUG = websiteBuilderPages.find((page) => page.slug === 'home')?.slug || websiteBuilderPages[0]?.slug || 'home';

const PublicPageBuilder = () => {
    useAdminPageSetup();

    const { pageSlug } = useParams();
    const selectedPage = pageSlug ? getWebsiteBuilderPage(pageSlug) : null;

    if (pageSlug && !selectedPage) {
        return <Redirect to={`/admin/website-builder/${DEFAULT_WEBSITE_BUILDER_SLUG}`} />;
    }

    const activeSlug = selectedPage?.slug || DEFAULT_WEBSITE_BUILDER_SLUG;

    return (
        <BuilderProvider routeSlug={activeSlug}>
            <AdminWebsiteBuilderApp />
        </BuilderProvider>
    );
};

export const PublicWebsiteBuilderRedirect = () => (
    <Redirect to={`/admin/website-builder/${DEFAULT_WEBSITE_BUILDER_SLUG}`} />
);

export default PublicPageBuilder;
