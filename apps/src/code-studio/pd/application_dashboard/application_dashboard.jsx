/**
 * Main landing page and router for the application dashboard.
 */
import React, {PropTypes} from 'react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import applicationDashboardReducers, {
  setRegionalPartnerFilter,
  setRegionalPartnerGroup,
  setRegionalPartners,
  setWorkshopAdminPermission,
  setLockApplicationPermission,
} from './reducers';
import {RegionalPartnerPropType} from './constants';
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
import DetailViewRedirect from './detail_view_redirect';
import CohortView from './cohort_view';
import AdminEditView from './admin_edit_view';
import AdminCohortView from './admin_cohort_view';
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
  'csf_facilitators': {type: 'facilitator', name: 'CS Fundamentals Facilitator Applications', course: 'csf'},
  'csd_facilitators': {type: 'facilitator', name: 'CS Discoveries Facilitator Applications', course: 'csd'},
  'csp_facilitators': {type: 'facilitator', name: 'CS Principles Facilitator Applications', course: 'csp'},
  'csd_teachers': {type: 'teacher', name: 'CS Discoveries Teacher Applications', course: 'csd'},
  'csp_teachers': {type: 'teacher', name: 'CS Principles Teacher Applications', course: 'csp'}
};

export default class ApplicationDashboard extends React.Component {
  static propTypes = {
    regionalPartner: RegionalPartnerPropType,
    regionalPartnerGroup: PropTypes.number,
    regionalPartners: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string
    })),
    isWorkshopAdmin: PropTypes.bool,
    canLockApplications: PropTypes.bool,
  };

  componentWillMount() {
    if (this.props.regionalPartner) {
      store.dispatch(setRegionalPartnerFilter(this.props.regionalPartner));
    }

    if (this.props.regionalPartnerGroup) {
      store.dispatch(setRegionalPartnerGroup(this.props.regionalPartnerGroup));
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
                const cohort_path_name = paths[path].name.replace('Applications', 'Cohort');
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
                      course={paths[path].course}
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
                      role={path}
                    />
                  ),
                  (
                    <Route
                      key={`cohort_view_${i}`}
                      path={`${path}_cohort`}
                      breadcrumbs={cohort_path_name}
                      component={CohortView}
                      applicationType={cohort_path_name}
                      viewType={paths[path].type}
                      role={path}
                    />
                  )
                ];
              }))
            }
            {this.props.isWorkshopAdmin &&
              ['TeacherCon', 'FiT'].map((cohortType, i) => (
                <Route
                  path={`${cohortType.toLowerCase()}_cohort`}
                  breadcrumbs={`${cohortType} Cohort`}
                  component={AdminCohortView}
                  cohortType={cohortType}
                  key={i}
                />
              ))
            }
            <Route
              path=":applicationId"
              breadcrumbs="Application"
              component={DetailViewRedirect}
            />
            {this.props.isWorkshopAdmin &&
              <Route
                path=":applicationId/edit"
                breadcrumbs="Application,Edit"
                component={AdminEditView}
              />
            }
          </Route>
        </Router>
      </Provider>
    );
  }
}

