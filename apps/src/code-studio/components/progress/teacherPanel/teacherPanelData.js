import {queryParams} from '@cdo/apps/code-studio/utils';

export const getStudentsForSection = async () => {
  const sectionId = queryParams('section_id');

  let request = '/api/teacher_panel_section';
  if (sectionId) {
    request += `?section_id=${sectionId}`;
  }

  try {
    const response = await fetch(request, {credentials: 'same-origin'});
    // This API returns with  204 - No Content when there is no section to be loaded
    // for the teacher panel, checking 200 ensures a section was returned
    if (response.status === 200) {
      return response.json();
    }
  } catch (err) {
    console.log(err);
  }
};

// Query the server for lock status of this teacher's students
export const queryLockStatus = async scriptId => {
  try {
    const response = await fetch(`/api/lock_status?script_id=${scriptId}`, {
      credentials: 'same-origin',
    });
    const data = await response.json();

    // Extract the state that teacherSectionsRedux cares about
    const teacherSections = Object.values(data).map(section => ({
      id: section.section_id,
      name: section.section_name,
    }));

    return {
      teacherSections,
      sectionLockStatus: data,
    };
  } catch (err) {
    console.log(err);
  }
};
