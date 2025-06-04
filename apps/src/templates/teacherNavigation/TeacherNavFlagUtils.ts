import _ from 'lodash';

import DCDO from '@cdo/apps/dcdo';

// Teacher Tools is currently working on a replacement for the current teacher navigation header.
// This is a move from TeacherDashboard to TeacherNavigation.
// This function determines if the user should see the new TeacherNavigation based on feature flag or experiment.
export const showV2TeacherDashboard: () => boolean = _.once(
  () => !!DCDO.get('teacher-local-nav-v2', true)
);

export const isOnTeacherDashboard: () => boolean = _.once(() =>
  location.pathname.includes('teacher_dashboard')
);
