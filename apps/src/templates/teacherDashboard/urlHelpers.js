const dashboardPrefix = '/teacher_dashboard/sections/';

/**
 * Returns the URL in teacher dashboard given a section id and (optional) path.
 */
export const teacherDashboardUrl = (sectionId, path = '') => {
  return dashboardPrefix + sectionId + path;
};

export const scriptUrlForStudent = (sectionId, scriptName, studentId) => {
  return `/s/${scriptName}?section_id=${sectionId}&user_id=${studentId}&viewAs=Teacher`;
};
