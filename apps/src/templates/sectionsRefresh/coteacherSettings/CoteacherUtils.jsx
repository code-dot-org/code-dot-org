export const convertAddCoteacherResponse = response => {
  return {
    id: response.id,
    instructorEmail: response.instructor_email,
    status: response.status,
    instructorName: response.instructor_name,
  };
};

export const getCoteacherMetricInfoFromSection = section => ({
  sectionId: section.id,
  sectionLoginType: section.loginType,
  unitId: section.course?.unitId,
  grades: section.grades,
});
