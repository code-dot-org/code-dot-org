import React from 'react';
import {BrowserRouter as Router, Route} from 'react-router-dom';
import TeacherDashboardNavigation from './TeacherDashboardNavigation';

export default storybook => {
  storybook.storiesOf('TeacherDashboardNavigation', module).addStoryTable([
    {
      name: 'Scrollable navigation',
      description:
        'Navbar should scroll when tabs are too large to fit horizontally',
      story: () => {
        return (
          <Router basename="/">
            <Route component={props => <TeacherDashboardNavigation />} />
          </Router>
        );
      }
    },
    {
      name: 'Non-scrollable navigation',
      description: 'Navbar should not scroll when tabs fit horizontally',
      story: () => {
        const links = [
          {label: 'Progress', url: '/progress'},
          {label: 'Stats', url: '/stats'},
          {label: 'Students', url: '/students'}
        ];

        return (
          <Router basename="/">
            <Route
              component={props => <TeacherDashboardNavigation links={links} />}
            />
          </Router>
        );
      }
    }
  ]);
};
