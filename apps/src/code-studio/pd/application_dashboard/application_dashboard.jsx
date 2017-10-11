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
import QuickView from './quick_view';

const ROOT_PATH = '/pd/application_dashboard';
const browserHistory = useRouterHistory(createHistory)({
  basename: ROOT_PATH
});

const ApplicationDashboardHeader = (props) => (
  <Header
    baseName="Application Dashboard"
    {...props}
  />
);

const ApplicationDashboard = ()=> (
  <Router history={browserHistory} >
    <Route path="/" component={ApplicationDashboardHeader}>
      <IndexRedirect to="/summary"/>
      <Route
        path="summary"
        breadcrumbs="Summary"
        component={Summary}
      />
      <Route
        path="csd_facilitators"
        breadcrumbs="CSD Facilitator Applications"
        component={QuickView}
        title="CSD Facilitator Applications"
      />
      <Route
        path="csp_facilitators"
        breadcrumbs="CSP Facilitator Applications"
        component={QuickView}
        title="CSP Facilitator Applications"
      />
      <Route
        path="csd_teachers"
        breadcrumbs="CSD Teacher Applications"
        component={QuickView}
        title="CSD Teacher Applications"
      />
      <Route
        path="csp_teachers"
        breadcrumbs="CSP Teacher Applications"
        component={QuickView}
        title="CSP Teacher Applications"
      />
    </Route>
  </Router>
);

export default ApplicationDashboard;
