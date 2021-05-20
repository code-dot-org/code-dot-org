const dashboardPrefix = '/teacher_dashboard/sections/';

/**
 * Returns the URL in teacher dashboard given a section id and (optional) path.
 */
export const teacherDashboardUrl = (sectionId, path = '') => {
  // Prepend a forward slash to path if one is not supplied.
  if (path && path.charAt(0) !== '/') {
    path = '/${path}';
  }

  return dashboardPrefix + sectionId + path;
};

export const scriptUrlForStudent = (sectionId, scriptName, studentId) => {
  if (!scriptName) {
    return null;
  }

  return `/s/${scriptName}?section_id=${sectionId}&user_id=${studentId}&viewAs=Teacher`;
};
