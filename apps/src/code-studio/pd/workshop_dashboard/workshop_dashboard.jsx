/*
  Main landing page and router for the workshop dashboard.
 */
import React from 'react';
const Router = require('react-router').Router;
const Route = require('react-router').Route;
const IndexRedirect = require('react-router').IndexRedirect;
const useRouterHistory = require('react-router').useRouterHistory;
const createHistory = require('history').createHistory;
const NewWorkshop = require('./new_workshop');
const Workshop = require('./workshop');
const Header = require('./header');
const WorkshopIndex = require('./workshop_index');
const WorkshopAttendance = require('./attendance/workshop_attendance');

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

module.exports = WorkshopDashboard;
window.WorkshopDashboard = WorkshopDashboard;
