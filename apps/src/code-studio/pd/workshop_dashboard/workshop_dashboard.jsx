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
import Header from './header';
import SurveyResults from './survey_results.jsx'
import WorkshopIndex from './workshop_index';
import WorkshopAttendance from './attendance/workshop_attendance';

const ROOT_PATH = '/pd/workshop_dashboard';
const browserHistory = useRouterHistory(createHistory)({
  basename: ROOT_PATH
});

const WorkshopDashboard = (
  <Router history={browserHistory} >
    <Route path="/" component={Header}>
      <IndexRedirect to="/workshops"/>
      <Route
        path="workshops"
        breadcrumbs="Workshops"
        component={WorkshopIndex}
      />
      <Route
        path="workshops/survey_results"
        breadcrumbs="Workshops,Survey Results"
        component={SurveyResults}
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
        path="workshops/:workshopId/attendance(/:sessionIndex)"
        breadcrumbs="Workshops,Workshop,Take Attendance"
        component={WorkshopAttendance}
      />
    </Route>
  </Router>
);

export default WorkshopDashboard;
window.WorkshopDashboard = WorkshopDashboard;
