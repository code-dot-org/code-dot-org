import React from 'react';
import {BrowserRouter as Router} from 'react-router-dom';
import TeacherDashboardNavigation from './teacherDashboard/TeacherDashboardNavigation';
import {allowConsoleWarnings} from '../../test/util/testUtils';

export default storybook => {
  if (IN_UNIT_TEST) {
    allowConsoleWarnings();
  }

  return storybook.storiesOf('NavigationBar', module).addStoryTable([
    {
      name: 'Navigation Bar',
      description: 'Navigation Bar used on Teacher Dashboard',
      story: () => (
        <Router>
          <TeacherDashboardNavigation />
        </Router>
      )
    }
  ]);
};
