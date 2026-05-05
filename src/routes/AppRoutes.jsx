import React, { Suspense } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import LayoutClassic from '../layout/MainLayout/ClassicLayout';
import { routes } from './RouteList';
import { CkamAdminProvider } from '../views/CkamAdmin/context';
import { getAdminToken } from '../api/authSession';

const AppRoutes = (props) => {
    const { match } = props;
    const hasToken = Boolean(getAdminToken());

    if (!hasToken) {
        return <Redirect to="/auth/login" />;
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
                <LayoutClassic>
                    <Switch>
                        {routes.map((obj, i) => (
                            obj.component ? (
                                <Route
                                    key={i}
                                    exact={obj.exact}
                                    path={match.path + obj.path}
                                    render={(matchProps) => <obj.component {...matchProps} />}
                                />
                            ) : null
                    ))}
                        <Route path="*">
                            <Redirect to="/admin" />
                        </Route>
                    </Switch>
                </LayoutClassic>
            </Suspense>
        </CkamAdminProvider>
    );
};

export default AppRoutes;

