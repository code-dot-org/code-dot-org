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
import {AllPartners} from './constants';
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
  'csf_facilitators': {type: 'facilitator', name: 'CS Fundamentals Facilitator Applications'},
  'csd_facilitators': {type: 'facilitator', name: 'CS Discoveries Facilitator Applications'},
  'csp_facilitators': {type: 'facilitator', name: 'CS Principles Facilitator Applications'},
  'csd_teachers': {type: 'teacher', name: 'CS Discoveries Teacher Applications'},
  'csp_teachers': {type: 'teacher', name: 'CS Principles Teacher Applications'}
};

export default class ApplicationDashboard extends React.Component {
  static propTypes = {
    regionalPartnerName: PropTypes.string,
    regionalPartners: PropTypes.array,
    isWorkshopAdmin: PropTypes.bool
  };

  render() {
    const regionalPartnerName = this.props.regionalPartnerName || AllPartners;
    return (
      <Router history={browserHistory} >
        <Route path="/" component={ApplicationDashboardHeader}>
          <IndexRedirect to="/summary"/>
          <Route
            path="summary"
            breadcrumbs="Summary"
            component={Summary}
            regionalPartnerName={regionalPartnerName}
            regionalPartners={this.props.regionalPartners}
            isWorkshopAdmin={this.props.isWorkshopAdmin}
          />
          {
            _.flatten(Object.keys(paths).map((path, i) => {
              return [
                (
                  <Route
                    key={`detail_${i}`}
                    path={`${path}/(:applicationId)`}
                    breadcrumbs={[
                      {name: paths[path].name, path: path},
                      {name: 'Application Details', path: ''}
                    ]}
                    component={DetailView}
                    viewType={paths[path].type}
                  />
                ),
                (
                  <Route
                    key={`quick_view_${i}`}
                    path={path}
                    breadcrumbs={paths[path].name}
                    component={QuickView}
                    regionalPartnerName={regionalPartnerName}
                    regionalPartners={this.props.regionalPartners}
                    isWorkshopAdmin={this.props.isWorkshopAdmin}
                    applicationType={paths[path].name}
                    viewType={paths[path].type}
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

