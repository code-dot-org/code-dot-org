/* global window */

/**
 * Main landing page and router for the application dashboard.
 */
import React from 'react';
import Header from '../components/header';
import {
  Router,
  Route,
  IndexRedirect,
  useRouterHistory
} from 'react-router';
import {createHistory} from 'history';
import Summary from './summary';

const ROOT_PATH = '/pd/application_dashboard';
const browserHistory = useRouterHistory(createHistory)({
  basename: ROOT_PATH
});

const ApplicationDashboard = ()=> (
  <Router history={browserHistory} >
    <Route path="/" breadcrumbs="Application Dashboard" component={Header}>
      <IndexRedirect to="/summary"/>
      <Route
        path="summary"
        breadcrumbs="Application Dashboard,Summary"
        component={Summary}
      />
      <Route
        path="csd_facilitators"
        breadcrumbs="Application Dashboard,CSD Facilitator Applications"
        component={Summary}
      />
      <Route
        path="csp_facilitators"
        breadcrumbs="Application Dashboard,CSP Facilitator Applications"
        component={Summary}
      />
      <Route
        path="csd_teachers"
        breadcrumbs="Application Dashboard,CSD Teacher Applications"
        component={Summary}
      />
      <Route
        path="csp_teachers"
        breadcrumbs="Application Dashboard,CSP Teacher Applications"
        component={Summary}
      />
    </Route>
  </Router>
);

export default ApplicationDashboard;
window.ApplicationDashboard = ApplicationDashboard;
