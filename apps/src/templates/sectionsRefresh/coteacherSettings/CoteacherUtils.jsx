export const convertAddCoteacherResponse = response => {
  return {
    id: response.id,
    instructorEmail: response.instructor_email,
    status: response.status,
    instructorName: response.instructor_name,
  };
};
