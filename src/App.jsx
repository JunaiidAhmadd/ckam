import React from 'react';
import { BrowserRouter, Redirect, Route, Switch } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes'
import WebsiteBuilderPreviewRouter from './views/CkamAdmin/WebsiteBuilderPreviewRouter';
import "bootstrap/js/src/collapse";
import ScrollToTop from './utils/ScrollToTop';

function App() {
  return (
    <>
      <BrowserRouter>
        <BrowserRouter >
          <ScrollToTop>
            <Switch>
              <Redirect exact from="/" to="/admin" />
              <Route path="/dashboard" render={() => <Redirect to="/admin" />} />
              <Route path="/website-builder-preview/:pageSlug" component={WebsiteBuilderPreviewRouter} />
              {/* Layouts */}
              <Route path="/" render={(props) => <AppRoutes {...props} />} />
            </Switch>
          </ScrollToTop>
        </BrowserRouter>
      </BrowserRouter>
    </>
  );
}

export default App;
