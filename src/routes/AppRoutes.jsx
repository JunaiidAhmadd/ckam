import React, { Suspense } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import { hasAdminToken } from '../api/authSession';
import LayoutClassic from '../layout/MainLayout/ClassicLayout';
import { authRoutes, routes } from './RouteList';
import { CkamAdminProvider } from '../views/CkamAdmin/context';
import { getAdminToken } from '../api/authSession';

const ProtectedAdminRoute = ({ component: Component, ...rest }) => (
    <Route
        {...rest}
        render={(routeProps) => (
            hasAdminToken()
                ? <Component {...routeProps} />
                : (
                    <Redirect
                        to={{
                            pathname: '/admin/login',
                            state: { from: routeProps.location },
                        }}
                    />
                )
        )}
    />
);

const AppRoutes = (props) => {
    const { match } = props;
    const hasToken = Boolean(getAdminToken());

    if (!hasToken) {
        return <Redirect to="/admin/login" />;
    }

    return (
        <CkamAdminProvider>
            <Suspense
                fallback={(
                    <div className="preloader-it">
                        <div className="loader-pendulums" />
                    </div>
                )}
            >
                <Switch>
                    {authRoutes.map((obj, i) => (
                        obj.component ? (
                            <Route
                                key={`auth-${i}`}
                                exact={obj.exact}
                                path={match.path + obj.path}
                                render={(matchProps) => <obj.component {...matchProps} />}
                            />
                        ) : null
                    ))}
                    <Route path="/">
                        <LayoutClassic>
                            <Switch>
                                {routes.map((obj, i) => (
                                    obj.component ? (
                                        <ProtectedAdminRoute
                                            key={i}
                                            exact={obj.exact}
                                            path={match.path + obj.path}
                                            component={obj.component}
                                        />
                                    ) : null
                                ))}
                                <Route path="*">
                                    <Redirect to="/admin" />
                                </Route>
                            </Switch>
                        </LayoutClassic>
                    </Route>
                </Switch>
            </Suspense>
        </CkamAdminProvider>
    );
};

export default AppRoutes;
