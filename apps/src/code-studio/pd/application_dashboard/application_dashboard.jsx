/**
 * Main landing page and router for the application dashboard.
 */
import React, {PropTypes} from 'react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import applicationDashboardReducers, {
  setRegionalPartnerName,
  setRegionalPartners,
  setWorkshopAdminPermission,
  setLockApplicationPermission,
} from './reducers';
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
const store = createStore(applicationDashboardReducers);

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
    isWorkshopAdmin: PropTypes.bool,
    canLockApplications: PropTypes.bool,
  };

  componentWillMount() {
    if (this.props.regionalPartnerName) {
      store.dispatch(setRegionalPartnerName(this.props.regionalPartnerName));
    }

    if (this.props.regionalPartners) {
      store.dispatch(setRegionalPartners(this.props.regionalPartners));
    }

    if (this.props.isWorkshopAdmin) {
      store.dispatch(setWorkshopAdminPermission(true));
    }

    if (this.props.canLockApplications) {
      store.dispatch(setLockApplicationPermission(true));
    }
  }

  render() {
    return (
      <Provider store={store}>
        <Router history={browserHistory} >
          <Route path="/" component={ApplicationDashboardHeader}>
            <IndexRedirect to="/summary" />
            <Route
              path="summary"
              breadcrumbs="Summary"
              component={Summary}
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
                      applicationType={paths[path].name}
                      viewType={paths[path].type}
                    />
                  )
                ];
              }))
            }
          </Route>
        </Router>
      </Provider>
    );
  }
}

