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
 * If providing a path, it *must*:
 * 1. be prepended with a forward slash (i.e., /path), and
 * 2. be the path as it appears in the pegasus teacher dashboard.
 */
export const teacherDashboardUrl = (sectionId, path = '') => {
  const isDashboard = experiments.isEnabled(
    experiments.TEACHER_DASHBOARD_REACT
  );

  // Check urlMap for a corresponding dashboard URL that differs from pegasus URL.
  if (isDashboard && path !== '') {
    path = urlMap[path] || path;
  }

  if (isDashboard) {
    return dashboardPrefix + sectionId + path;
  } else {
    return pegasus(pegasusPrefix + sectionId + path);
  }
};

export const scriptUrlForStudent = (
  sectionId,
  scriptId,
  scriptName,
  studentId
) => {
  if (experiments.isEnabled(experiments.TEACHER_DASHBOARD_REACT)) {
    return `/s/${scriptName}?section_id=${sectionId}&user_id=${studentId}&viewAs=Teacher`;
  } else {
    let url = `/teacher-dashboard#/sections/${sectionId}/student/${studentId}`;
    if (scriptId) {
      url += `/script/${scriptId}`;
    }
    return url;
  }
};
