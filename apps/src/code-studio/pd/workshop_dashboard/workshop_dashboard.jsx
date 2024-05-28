/**
 * Main landing page and router for the workshop dashboard.
 */
import {createHistory} from 'history';
import PropTypes from 'prop-types';
import React from 'react';
import {Provider} from 'react-redux';
import {Router, Route, IndexRedirect, useRouterHistory} from 'react-router';
import {createStore, combineReducers} from 'redux';

import mapboxReducer, {setMapboxAccessToken} from '@cdo/apps/redux/mapbox';

import Header from '../components/header';
import {
  RegionalPartnerShape,
  ALL_PARTNERS_OPTION,
} from '../components/regional_partner_dropdown';
import regionalPartnerReducers, {
  setRegionalPartners,
  setRegionalPartnerFilter,
  getInitialRegionalPartnerFilter,
} from '../components/regional_partners_reducers';

import WorkshopAttendance from './attendance/workshop_attendance';
import LegacySurveySummaries from './legacy_survey_summaries.jsx';
import NewWorkshop from './new_workshop';
import {WorkshopAdmin} from './permission';
import workshopDashboardReducers, {
  setPermission,
  setFacilitatorCourses,
} from './reducers';
import FoormDailySurveyResultsLoader from './reports/foorm/results_loader';
import {ResultsLoader as DailySurveyResultsLoader} from './reports/local_summer_workshop_daily_survey/results_loader';
import ReportView from './reports/report_view';
import Workshop from './workshop';
import WorkshopFilter from './workshop_filter';
import WorkshopIndex from './workshop_index';

const ROOT_PATH = '/pd/workshop_dashboard';
// eslint-disable-next-line react-hooks/rules-of-hooks
const browserHistory = useRouterHistory(createHistory)({
  basename: ROOT_PATH,
});
const store = createStore(
  combineReducers({
    workshopDashboard: workshopDashboardReducers,
    regionalPartners: regionalPartnerReducers,
    mapbox: mapboxReducer,
  })
);

const WorkshopDashboardHeader = props => (
  <Header baseName="Workshop Dashboard" {...props} />
);

export default class WorkshopDashboard extends React.Component {
  static propTypes = {
    permissionList: PropTypes.arrayOf(PropTypes.string).isRequired,
    facilitatorCourses: PropTypes.arrayOf(PropTypes.string).isRequired,
    regionalPartners: PropTypes.arrayOf(RegionalPartnerShape),
    mapboxAccessToken: PropTypes.string,
  };

  constructor(props) {
    super(props);

    if (props.permissionList) {
      store.dispatch(setPermission(props.permissionList));
    }

    if (props.facilitatorCourses) {
      store.dispatch(setFacilitatorCourses(props.facilitatorCourses));
    }

    if (props.mapboxAccessToken) {
      store.dispatch(setMapboxAccessToken(props.mapboxAccessToken));
    }

    store.dispatch(setRegionalPartners(this.props.regionalPartners));
    store.dispatch(
      setRegionalPartnerFilter(
        getInitialRegionalPartnerFilter(
          props.permissionList.includes(WorkshopAdmin),
          this.props.regionalPartners,
          ALL_PARTNERS_OPTION
        )
      )
    );
  }

  render() {
    return (
      <Provider store={store}>
        <Router history={browserHistory}>
          <Route path="/" component={WorkshopDashboardHeader}>
            <IndexRedirect to="/workshops" />
            <Route
              path="reports"
              breadcrumbs="Reports"
              component={ReportView}
            />
            <Route
              path="workshops"
              breadcrumbs="Workshops"
              component={WorkshopIndex}
            />
            <Route
              path="workshops/filter"
              breadcrumbs="Workshops,Filter"
              component={WorkshopFilter}
            />
            <Route
              path="daily_survey_results(/:workshopId)"
              breadcrumbs="Survey Results"
              component={DailySurveyResultsLoader}
            />
            <Route
              path="workshop_daily_survey_results(/:workshopId)"
              breadcrumbs="Survey Results"
              component={FoormDailySurveyResultsLoader}
            />
            <Route
              path="legacy_survey_summaries"
              breadcrumbs="Legacy Facilitator Survey Summaries"
              component={LegacySurveySummaries}
            />
            <Route
              path="workshops/new"
              breadcrumbs="Workshops,New Workshop"
              component={NewWorkshop}
            />
            <Route
              path="workshops/:workshopId"
              breadcrumbs="Workshops,View Workshop"
              component={Workshop}
              view="show"
            />
            <Route
              path="workshops/:workshopId/edit"
              breadcrumbs="Workshops,Edit Workshop"
              component={Workshop}
              view="edit"
            />
            <Route
              path="workshops/:workshopId/attendance(/:sessionId)"
              breadcrumbs="Workshops,Workshop,Take Attendance"
              component={WorkshopAttendance}
            />
          </Route>
        </Router>
      </Provider>
    );
  }
}
