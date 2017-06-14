import _ from 'lodash';

const SET_VALID_LOGIN_TYPES = 'teacherDashboard/SET_VALID_LOGIN_TYPES';
const SET_VALID_GRADES = 'teacherDashboard/SET_VALID_GRADES';
const SET_VALID_COURSES = 'teacherDashboard/SET_VALID_COURSES';
const SET_VALID_SCRIPTS = 'teacherDashboard/SET_VALID_SCRIPTS';
const SET_SECTIONS = 'teacherDashboard/SET_SECTIONS';
const UPDATE_SECTION = 'teacherDashboard/UPDATE_SECTION';

export const setValidLoginTypes = loginTypes => ({ type: SET_VALID_LOGIN_TYPES, loginTypes });
export const setValidGrades = grades => ({ type: SET_VALID_GRADES, grades });
export const setValidCourses = courses => ({ type: SET_VALID_COURSES, courses });
export const setValidScripts = scripts => ({ type: SET_VALID_SCRIPTS, scripts });
export const setSections = sections => ({ type: SET_SECTIONS, sections });
export const updateSection = (sectionId, serverSection) => ({
  type: UPDATE_SECTION,
  sectionId,
  serverSection
});

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

  // TODO: write tests for this
  if (action.type === UPDATE_SECTION) {
    // TODO: Right now we do our initial mapping of server state to internal
    // representation in angular. We can probably move that into React/redux
    // and share code with this
    const serverSection = action.serverSection;
    const courseId = serverSection.course_id || null;
    const scriptId = serverSection.script ? serverSection.script.id : null;

    const assignmentList = assignments(state);
    const assignmentIndex = getAssignmentIndex(assignmentList, courseId, scriptId);
    const assignment = assignmentList[assignmentIndex];

    const updatedSection = {
      name: serverSection.name,
      loginType: serverSection.login_type,
      grade: serverSection.grade,
      stageExtras: serverSection.stage_extras,
      pairingAllowed: serverSection.pairing_allowed,
      numStudents: serverSection.students.length,
      code: serverSection.code,
      courseId: serverSection.course_id,
      scriptId: scriptId,
      // TODO : should maybe be getting these fields as selectors instead of
      // living in state
      assignmentName: assignment.name,
      assignmentPath: getPath(assignment)

    };
    return {
      ...state,
      sections: {
        ...state.sections,
        [action.sectionId]: {
          ...state.sections[action.sectionId],
          ...updatedSection
        }
      }
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

  const assignmentIndex = getAssignmentIndex(assignments(state),
    section.courseId, section.scriptId);

  return assignmentIndex === -1 ? null : assignmentIndex;
};

/**
 * Find an assignment with the appropriate id. If both courseId and scriptId are
 * non-null, look only at the courseId.
 */
// TODO : I'd like for this to be memoized, but for various reasons that is not
// trivial, so I'm going to leave this as is for now.
const getAssignmentIndex = (assignmentList, courseId, scriptId) => (
  assignmentList.findIndex(assignment =>
    assignment.courseId === courseId &&
    (courseId || assignment.scriptId === scriptId)
  ));

const getPath = assignment => {
  if (assignment.courseId) {
    // TODO ${studioUrlPrefix}
    return `/courses/${assignment.script_name}`;
  } else {
    return `/s/${assignment.script_name}`;
  }
};
