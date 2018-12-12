import React from 'react';
import NavigationBar from './NavigationBar';
import {teacherDashboardLinks} from '../teacherDashboard/TeacherDashboardNavigation';

export default storybook => {
  return storybook
    .storiesOf('NavigationBar', module)
    .addStoryTable([
      {
        name: 'NavigationBar',
        description: 'NavigationBar used on Teacher Dashboard',
        story: () => (
          <NavigationBar
            defaultActiveLink = "progres"
            links = {teacherDashboardLinks}
          />
        )
      }
    ]);
};
