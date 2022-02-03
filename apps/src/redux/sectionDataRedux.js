/**
 * Reducer for section data in teacher dashboard.
 * Tab specific reducers can import actions from this file
 * if they need to respond to a section changing.
 */

/**
 * Action type constants
 */
export const SET_SECTION = 'sectionData/SET_SECTION';

/**
 * Action creators
 */
export const setSection = section => {
  // Sort section.students by name.
  const sortedStudents = section.students.sort((a, b) =>
    a.name.localeCompare(b.name, undefined, {numeric: true})
  );

  // Filter data to match sectionDataPropType
  const filteredSectionData = {
    id: section.id,
    script: section.script,
    students: sortedStudents,
    isAssignedCSA: section.is_assigned_csa,
    lessonExtras: section.lesson_extras,
    ttsAutoplayEnabled: section.tts_autoplay_enabled
  };
  return {type: SET_SECTION, section: filteredSectionData};
};

/**
 * Initial state of sectionDataRedux
 */
const initialState = {
  section: {}
};

/**
 * Reducer
 */
export default function sectionData(state = initialState, action) {
  if (action.type === SET_SECTION) {
    // Setting the section is the first action to be called when switching
    // sections, which requires us to reset our state. This might need to change
    // once switching sections is in react/redux.
    return {
      ...initialState,
      section: action.section
    };
  }

  return state;
}
