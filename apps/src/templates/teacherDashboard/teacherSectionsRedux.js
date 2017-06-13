import _ from 'lodash';

const SET_VALID_LOGIN_TYPES = 'teacherDashboard/SET_VALID_LOGIN_TYPES';
const SET_VALID_GRADES = 'teacherDashboard/SET_VALID_GRADES';
const SET_VALID_COURSES = 'teacherDashboard/SET_VALID_COURSES';
const SET_VALID_SCRIPTS = 'teacherDashboard/SET_VALID_SCRIPTS';
const SET_SECTIONS = 'teacherDashboard/SET_SECTIONS';

export const setValidLoginTypes = loginTypes => ({ type: SET_VALID_LOGIN_TYPES, loginTypes });
export const setValidGrades = grades => ({ type: SET_VALID_GRADES, grades });
export const setValidCourses = courses => ({ type: SET_VALID_COURSES, courses });
export const setValidScripts = scripts => ({ type: SET_VALID_SCRIPTS, scripts });
export const setSections = sections => ({ type: SET_SECTIONS, sections });

const initialState = {
  validLoginTypes: [],
  validGrades: [],
  validCourses: [],
  validScripts: [],
  sectionIds: [],
  // Mapping from sectionId to section object
  sections: {}
};

export default function teacherSections(state=initialState, action) {
  if (action.type === SET_VALID_LOGIN_TYPES) {
    return {
      ...state,
      validLoginTypes: action.loginTypes
    };
  }

  if (action.type === SET_VALID_GRADES) {
    return {
      ...state,
      validGrades: action.grades
    };
  }

  if (action.type === SET_VALID_COURSES) {
    return {
      ...state,
      validCourses: action.courses.map(course => ({
        ...course,
        courseId: course.id,
        scriptId: null,
      }))
    };
  }

  if (action.type === SET_VALID_SCRIPTS) {
    return {
      ...state,
      validScripts: action.scripts.map(script => ({
        ...script,
        courseId: null,
        scriptId: script.id
      }))
    };
  }

  if (action.type === SET_SECTIONS) {
    return {
      ...state,
      sectionIds: action.sections.map(section => section.id),
      sections: _.keyBy(action.sections, 'id')
    };
  }

  return state;
}

// Selectors

// Memoize assignment generation so that we avoid work unless courses/scripts change
const memoizedAssignments = _.memoize((validCourses, validScripts) => (
  validCourses.concat(validScripts).map((assignment, index) => ({
    ...assignment,
    index
  }))
));
export const assignments = state =>
  memoizedAssignments(state.validCourses, state.validScripts);

/**
 * Get the index into our list of assignments of the course/script currently
 *   assigned to this section.
 * @param {Object} state - Current state of this reducer
 * @param {number} sectionId - Id of the section we want the current assignment
 *   index for
 * @returns {number|null}
 */
export const currentAssignmentIndex = (state, sectionId) => {
  const section = state.sections[sectionId];
  const assignmentList = assignments(state);
  const target = {
    courseId: section.courseId,
    scriptId: section.courseId ? null : section.scriptId
  };

  // Find an assignment with the appropriate id
  const assignmentIndex = assignmentList.findIndex(assignment => (
    assignment.courseId === target.courseId && assignment.scriptId === target.scriptId
  ));

  return assignmentIndex === -1 ? null : assignmentIndex;
};
