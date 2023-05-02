import React from 'react';
import {BrowserRouter as Router, Route} from 'react-router-dom';
import TeacherDashboardNavigation from './TeacherDashboardNavigation';

export default {
  name: 'TeacherDashboardNavigation',
  component: TeacherDashboardNavigation,
};

export const ScrollableNavigation = () => {
  const links = [];

  // Dynamically add a large number of labels so that it needs to scoll through them
  for (let i = 0; i < 20; i++) {
    links.push({label: `label${i}`, url: `/${i}`});
  }

  return (
    <Router basename="/">
      <Route
        component={props => <TeacherDashboardNavigation links={links} />}
      />
    </Router>
  );
};

export const NonScrollableNavigation = () => {
  const links = [
    {label: 'Progress', url: '/progress'},
    {label: 'Stats', url: '/stats'},
    {label: 'Students', url: '/students'},
  ];

  return (
    <Router basename="/">
      <Route
        component={props => <TeacherDashboardNavigation links={links} />}
      />
    </Router>
  );
};
