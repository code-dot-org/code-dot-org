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

export const getNestedUnitUrl = (
  sectionId,
  courseVersionName,
  unitPosition,
  studentId = null
) => {
  if (
    !courseVersionName ||
    unitPosition === null ||
    unitPosition === undefined
  ) {
    return null;
  }

  const baseUrl = `/teacher_dashboard/sections/${sectionId}/courses/${courseVersionName}/units/${unitPosition}`;
  return studentId ? `${baseUrl}?user_id=${studentId}` : baseUrl;
};

export const nestedUnitUrlForStudent = (
  sectionId,
  courseVersionName,
  unitPosition,
  studentId
) => {
  if (
    !courseVersionName ||
    unitPosition === null ||
    unitPosition === undefined
  ) {
    return null;
  }

  return getNestedUnitUrl(
    sectionId,
    courseVersionName,
    unitPosition,
    studentId
  );
};

export const getUnitUrl = (sectionId, unitName, studentId = null) => {
  if (studentId) {
    return `/teacher_dashboard/sections/${sectionId}/unit/${unitName}?user_id=${studentId}`;
  } else {
    return `/teacher_dashboard/sections/${sectionId}/unit/${unitName}`;
  }
};

export const unitUrlForStudent = (sectionId, unitName, studentId) => {
  if (!unitName) {
    return null;
  }

  return getUnitUrl(sectionId, unitName, studentId);
};
