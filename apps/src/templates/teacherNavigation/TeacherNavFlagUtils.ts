import _ from 'lodash';

export const isOnTeacherDashboard: () => boolean = _.once(() =>
  location.pathname.includes('teacher_dashboard')
);
