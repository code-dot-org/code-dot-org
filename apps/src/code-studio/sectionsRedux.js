import {
  setSections as setTeacherSections
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';

// Action types
export const SET_SECTIONS = 'sections/SET_SECTIONS';

// Action Creators
export const setSections = sections => dispatch => {
  const teacherSections = Object.keys(sections).map(key => {
    const section = sections[key];
    return {
      id: section.section_id,
      name: section.section_name
    };
  });
  // TODO: dispatch setTeacherSections directly eventually
  dispatch(setTeacherSections(teacherSections));
  // TODO: continue to dispatch until stageLockRedux is figured out
  dispatch({
    type: SET_SECTIONS,
    sections
  });
};
