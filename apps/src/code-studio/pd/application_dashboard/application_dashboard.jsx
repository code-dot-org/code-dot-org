/**
 * Main landing page and router for the application dashboard.
 */
import {createHistory} from 'history';
import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import {Provider} from 'react-redux';
import {Router, Route, IndexRedirect, useRouterHistory} from 'react-router';
import {createStore, combineReducers} from 'redux';

import Header from '../components/header';
import {UNMATCHED_PARTNER_OPTION} from '../components/regional_partner_dropdown';
import regionalPartnerReducers, {
  setRegionalPartners,
  setRegionalPartnerFilter,
  setRegionalPartnerGroup,
  getInitialRegionalPartnerFilter,
} from '../components/regional_partners_reducers';

import AdminEditView from './admin_edit_view';
import CohortView from './cohort_view';
import DetailView from './detail_view';
import DetailViewRedirect from './detail_view_redirect';
import QuickView from './quick_view';
import applicationDashboardReducers, {
  setWorkshopAdminPermission,
  setLockApplicationPermission,
} from './reducers';
import Summary from './summary';

const ROOT_PATH = '/pd/application_dashboard';
// eslint-disable-next-line react-hooks/rules-of-hooks
const browserHistory = useRouterHistory(createHistory)({
  basename: ROOT_PATH,
});
const store = createStore(
  combineReducers({
    applicationDashboard: applicationDashboardReducers,
    regionalPartners: regionalPartnerReducers,
  })
);

const ApplicationDashboardHeader = props => (
  <Header baseName="Application Dashboard" {...props} />
);

export const DASHBOARD_COURSES = {
  csd_teachers: {
    type: 'teacher',
    name: 'CS Discoveries Teacher Applications',
    course: 'csd',
  },
  csp_teachers: {
    type: 'teacher',
    name: 'CS Principles Teacher Applications',
    course: 'csp',
  },
  csa_teachers: {
    type: 'teacher',
    name: 'Computer Science A Teacher Applications',
    course: 'csa',
  },
  incomplete_applications: {
    type: 'teacher',
    name: 'Incomplete Teacher Applications',
    course: 'course_tbd',
  },
};

export default class ApplicationDashboard extends React.Component {
  static propTypes = {
    regionalPartners: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number,
        name: PropTypes.string,
        group: PropTypes.number,
      })
    ).isRequired,
    isWorkshopAdmin: PropTypes.bool,
    canLockApplications: PropTypes.bool,
  };

  UNSAFE_componentWillMount() {
    store.dispatch(setRegionalPartners(this.props.regionalPartners));
    store.dispatch(
      setRegionalPartnerFilter(
        getInitialRegionalPartnerFilter(
          this.props.isWorkshopAdmin,
          this.props.regionalPartners,
          UNMATCHED_PARTNER_OPTION
        )
      )
    );

    // Use the group from the first partner. Usually there will only be a single partner anyway, or admin.
    // We shouldn't see mixed group multi-partners
    if (this.props.regionalPartners.length > 0) {
      store.dispatch(
        setRegionalPartnerGroup(this.props.regionalPartners[0].group)
      );
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
        <Router history={browserHistory}>
          <Route path="/" component={ApplicationDashboardHeader}>
            <IndexRedirect to="/summary" />
            <Route path="summary" breadcrumbs="Summary" component={Summary} />
            {_.flatten(
              Object.keys(DASHBOARD_COURSES).map((path, i) => {
                const cohort_path_name = DASHBOARD_COURSES[path].name.replace(
                  'Applications',
                  'Cohort'
                );
                return [
                  <Route
                    key={`detail_${i}`}
                    path={`${path}/(:applicationId)`}
                    breadcrumbs={
                      path === 'incomplete_applications'
                        ? [{name: 'Application Details', path: ''}]
                        : [
                            {name: DASHBOARD_COURSES[path].name, path: path},
                            {name: 'Application Details', path: ''},
                          ]
                    }
                    component={DetailView}
                    course={DASHBOARD_COURSES[path].course}
                  />,
                  path !== 'incomplete_applications' && (
                    <Route
                      key={`quick_view_${i}`}
                      path={path}
                      breadcrumbs={DASHBOARD_COURSES[path].name}
                      component={QuickView}
                      applicationType={DASHBOARD_COURSES[path].name}
                      role={path}
                    />
                  ),
                  path !== 'incomplete_applications' && (
                    <Route
                      key={`cohort_view_${i}`}
                      path={`${path}_cohort`}
                      breadcrumbs={cohort_path_name}
                      component={CohortView}
                      applicationType={cohort_path_name}
                      role={path}
                    />
                  ),
                ];
              })
            )}
            <Route
              path=":applicationId"
              breadcrumbs="Application"
              component={DetailViewRedirect}
            />
            {this.props.isWorkshopAdmin && (
              <Route
                path=":applicationId/edit"
                breadcrumbs="Application,Edit"
                component={AdminEditView}
              />
            )}
          </Route>
        </Router>
      </Provider>
    );
  }
}
