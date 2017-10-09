/* global window */

/**
 * Main landing page and router for the workshop dashboard.
 */
import React from 'react';
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

const ROOT_PATH = '/pd/workshop_dashboard';
const browserHistory = useRouterHistory(createHistory)({
  basename: ROOT_PATH
});

const WorkshopDashboard = (
  <Router history={browserHistory} >
    <Route path="/" breadcrumbs="Workshop Dashboard" component={Header}>
      <IndexRedirect to="/workshops"/>
      <Route
        path="reports"
        breadcrumbs="Workshop Dashboard,Reports"
        component={ReportView}
      />
      <Route
        path="workshops"
        breadcrumbs="Workshop Dashboard,Workshops"
        component={WorkshopIndex}
      />
      <Route
        path="workshops/filter"
        breadcrumbs="Workshop Dashboard,Workshops,Filter"
        component={WorkshopFilter}
      />
      <Route
        path="survey_results(/:workshopId)"
        breadcrumbs="Workshop Dashboard,Survey Results"
        component={SurveyResults}
      />
      <Route
        path="organizer_survey_results(/:workshopId)"
        breadcrumbs="Workshop Dashboard,Organizer Survey Results"
        component={OrganizerSurveyResults}
      />
      <Route
        path="local_summer_workshop_survey_results(/:workshopId)"
        breadcrumbs="Workshop Dashboard,Local Summer Workshop Survey Results"
        component={LocalSummerWorkshopSurveyResults}
      />
      <Route
        path="workshops/new"
        breadcrumbs="Workshop Dashboard,Workshops,New Workshop"
        component={NewWorkshop}
      />
      <Route
        path="workshops/:workshopId"
        breadcrumbs="Workshop Dashboard,Workshops,View Workshop"
        component={Workshop}
        view="show"
      />
      <Route
        path="workshops/:workshopId/edit"
        breadcrumbs="Workshop Dashboard,Workshops,Edit Workshop"
        component={Workshop}
        view="edit"
      />
      <Route
        path="workshops/:workshopId/attendance(/:sessionId)"
        breadcrumbs="Workshop Dashboard,Workshops,Workshop,Take Attendance"
        component={WorkshopAttendance}
      />
    </Route>
  </Router>
);

export default WorkshopDashboard;
window.WorkshopDashboard = WorkshopDashboard;
