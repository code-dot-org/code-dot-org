import experiments from '@cdo/apps/util/experiments';
import {pegasus} from '@cdo/apps/lib/util/urlHelpers';

const pegasusPrefix = '/teacher-dashboard#/sections/';
const dashboardPrefix = '/teacher_dashboard/sections/';

/**
 * Add any paths that *do not* match between pegasus and dashboard teacher dashboards.
 * The key should be the path (prefaced with a forward slash) in pegasus, and the value
 * should be the corresponding path in dashboard.
 */
const urlMap = {
  '/print_signin_cards': '/login_info',
  '/manage': '/manage_students'
};

/**
 * Returns the URL in teacher dashboard given a section id and (optional) path.
 * If providing a path, it *must* be the path as it appears in the pegasus teacher dashboard.
 */
export const teacherDashboardUrl = (sectionId, path = '') => {
  const isDashboard = experiments.isEnabled(
    experiments.TEACHER_DASHBOARD_REACT
  );

  if (isDashboard && path !== '') {
    path = urlMap[path];
  }

  if (isDashboard) {
    return dashboardPrefix + sectionId + path;
  } else {
    return pegasus(pegasusPrefix + sectionId + path);
  }
};
