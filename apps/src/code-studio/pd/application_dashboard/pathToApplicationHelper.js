export const getPathToApplication = (course, applicationType, applicationId) =>
  course
    ? `/${course}_${applicationType.toLowerCase()}s/${applicationId}`
    : `/incomplete_applications/${applicationId}`;
