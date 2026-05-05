import React from 'react';
import { BrowserRouter, Redirect, Route, Switch } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import AppRoutes from './routes/AppRoutes'
import WebsiteBuilderPreviewRouter from './views/CkamAdmin/WebsiteBuilderPreviewRouter';
import Login from './views/CkamAdmin/Authentication/LogIn/Login/Login';
import { getAdminToken } from './api/authSession';
import "bootstrap/js/src/collapse";
import ScrollToTop from './utils/ScrollToTop';

function App() {
  const hasToken = Boolean(getAdminToken());

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} theme="light" />
      <BrowserRouter>
        <BrowserRouter >
          <ScrollToTop>
            <Switch>
              <Redirect exact from="/" to={hasToken ? "/admin" : "/auth/login"} />
              <Route
                exact
                path="/auth/login"
                render={(props) => (hasToken ? <Redirect to="/admin" /> : <Login {...props} />)}
              />
              <Route
                exact
                path="/admin/login"
                render={(props) => (hasToken ? <Redirect to="/admin" /> : <Login {...props} />)}
              />
              <Route path="/dashboard" render={() => <Redirect to="/admin" />} />
              <Route path="/website-builder-preview/:pageSlug" component={WebsiteBuilderPreviewRouter} />
              {/* Layouts */}
              <Route
                path="/"
                render={(props) => (hasToken ? <AppRoutes {...props} /> : <Redirect to="/auth/login" />)}
              />
            </Switch>
          </ScrollToTop>
        </BrowserRouter>
      </BrowserRouter>
    </>
  );
}

export default App;
