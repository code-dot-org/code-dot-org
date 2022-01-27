import PropTypes from 'prop-types';

/**
 * Reducer for section data in teacher dashboard.
 * Tab specific reducers can import actions from this file
 * if they need to respond to a section changing.
 */

/**
 * Shape for the section
 * The section we get directly from angular right now. This gives us a
 * different shape than some other places we use sections. For now, I'm just
 * going to document the parts of section that we use here
 */
export const sectionDataPropType = PropTypes.shape({
  id: PropTypes.number.isRequired,
  script: PropTypes.object,
  students: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired
    })
  ).isRequired,
  isAssignedCSA: PropTypes.bool,
  lessonExtras: PropTypes.bool,
  ttsAutoplayEnabled: PropTypes.bool,
  codeReviewExpiresAt: PropTypes.number
});

/**
 * Action type constants
 */
export const SET_SECTION = 'sectionData/SET_SECTION';
export const SET_CODE_REVIEW_EXPIRES_AT =
  'sectionData/SET_CODE_REVIEW_EXPIRES_AT';

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
    ttsAutoplayEnabled: section.tts_autoplay_enabled,
    codeReviewExpiresAt: section.code_review_expires_at
      ? Date.parse(section.code_review_expires_at)
      : null
  };
  return {type: SET_SECTION, section: filteredSectionData};
};

export const setCodeReviewExpiresAt = codeReviewExpiresAt => ({
  type: SET_CODE_REVIEW_EXPIRES_AT,
  codeReviewExpiresAt
});

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

  if (action.type === SET_CODE_REVIEW_EXPIRES_AT) {
    const expirationTime = action.codeReviewExpiresAt
      ? Date.parse(action.codeReviewExpiresAt)
      : null;
    return {
      ...state,
      section: {
        ...state.section,
        codeReviewExpiresAt: expirationTime
      }
    };
  }

  return state;
}

/**
 * Selector functions
 */
export const getTotalStudentCount = state => {
  return state.sectionData.section.students.length;
};

export const getStudentList = state => {
  return state.sectionData.section.students;
};
