/**
 * Main landing page and router for the application dashboard.
 */
import React, {PropTypes} from 'react';
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
import DetailView from './detail_view';
import _ from 'lodash';

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

const paths = {
  'csf_facilitators': 'CSF Facilitator Applications',
  'csd_facilitators': 'CSD Facilitator Applications',
  'csp_facilitators': 'CSP Facilitator Applications',
  'csd_teachers': 'CSD Teacher Applications',
  'csp_teachers': 'CSP Teacher Applications'
};

export default class ApplicationDashboard extends React.Component {
  static propTypes = {
    partnerName: PropTypes.string
  };

  render() {
    const allPartners = "All Regional Partner Applications";
    return (
      <Router history={browserHistory} >
        <Route path="/" component={ApplicationDashboardHeader}>
          <IndexRedirect to="/summary"/>
          <Route
            path="summary"
            breadcrumbs="Summary"
            component={Summary}
            regionalPartner={this.props.partnerName || allPartners}
          />
          {
            _.flatten(Object.keys(paths).map((path, i) => {
              return [
                (
                  <Route
                    key={`detail_${i}`}
                    path={`${path}/(:applicationId)`}
                    breadcrumbs={[
                      {name: paths[path], path: path},
                      {name: 'Application Details', path: ''}
                    ]}
                    component={DetailView}
                  />
                ),
                (
                  <Route
                    key={`quick_view_${i}`}
                    path={path}
                    breadcrumbs={paths[path]}
                    component={QuickView}
                    regionalPartner={this.props.partnerName || allPartners}
                    applicationType={paths[path]}
                  />
                )
              ];
            }))
          }
        </Route>
      </Router>
    );
  }
}

