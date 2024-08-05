import React from 'react';
import {BrowserRouter as Router} from 'react-router-dom';

import TeacherDashboardNavigation from './TeacherDashboardNavigation';

export default {
  name: 'TeacherDashboardNavigation',
  component: TeacherDashboardNavigation,
};

export const Primary = () => (
  <Router>
    <TeacherDashboardNavigation />
  </Router>
);
