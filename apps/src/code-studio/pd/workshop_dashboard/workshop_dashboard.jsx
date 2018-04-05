/* global window */

/**
 * Main landing page and router for the workshop dashboard.
 */
import React, {PropTypes} from 'react';
import {Provider} from 'react-redux';
import {createStore} from 'redux';
import {
  Router,
  Route,
  IndexRedirect,
  useRouterHistory
} from 'react-router';
import {createHistory} from 'history';
import NewWorkshop from './new_workshop';
import Workshop from './workshop';
import Header from '../components/header';
import SurveyResults from './survey_results.jsx';
import OrganizerSurveyResults from './organizer_survey_results.jsx';
import LocalSummerWorkshopSurveyResults from './local_summer_workshop_survey_results';
import WorkshopIndex from './workshop_index';
import WorkshopFilter from './workshop_filter';
import WorkshopAttendance from './attendance/workshop_attendance';
import ReportView from './reports/report_view';
import workshopDashboardReducers, {
  setPermission,
  setFacilitatorCourses
} from './reducers';

const ROOT_PATH = '/pd/workshop_dashboard';
const browserHistory = useRouterHistory(createHistory)({
  basename: ROOT_PATH
});
const store = createStore(workshopDashboardReducers);

const WorkshopDashboardHeader = (props) => (
  <Header
    baseName="Workshop Dashboard"
    {...props}
  />
);

export default class WorkshopDashboard extends React.Component {
  static propTypes = {
    permissionList: PropTypes.arrayOf(PropTypes.string).isRequired,
    facilitatorCourses: PropTypes.arrayOf(PropTypes.string).isRequired
  };

  constructor(props) {
    super(props);

    if (props.permissionList) {
      store.dispatch(setPermission(props.permissionList));
    }

    if (props.facilitatorCourses) {
      store.dispatch(setFacilitatorCourses(props.facilitatorCourses));
    }
  }

  render() {
    return (
      <Provider store={store}>
        <Router history={browserHistory}>
          <Route path="/" component={WorkshopDashboardHeader}>
            <IndexRedirect to="/workshops"/>
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
              path="survey_results(/:workshopId)"
              breadcrumbs="Survey Results"
              component={SurveyResults}
            />
            <Route
              path="organizer_survey_results(/:workshopId)"
              breadcrumbs="Organizer Survey Results"
              component={OrganizerSurveyResults}
            />
            <Route
              path="local_summer_workshop_survey_results(/:workshopId)"
              breadcrumbs="Local Summer Workshop Survey Results"
              component={LocalSummerWorkshopSurveyResults}
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
