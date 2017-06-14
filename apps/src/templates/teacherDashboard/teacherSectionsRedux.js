import _ from 'lodash';

const SET_STUDIO_URL = 'teacherDashboard/SET_STUDIO_URL';
const SET_VALID_LOGIN_TYPES = 'teacherDashboard/SET_VALID_LOGIN_TYPES';
const SET_VALID_GRADES = 'teacherDashboard/SET_VALID_GRADES';
const SET_VALID_COURSES = 'teacherDashboard/SET_VALID_COURSES';
const SET_VALID_SCRIPTS = 'teacherDashboard/SET_VALID_SCRIPTS';
const SET_SECTIONS = 'teacherDashboard/SET_SECTIONS';
const UPDATE_SECTION = 'teacherDashboard/UPDATE_SECTION';

export const setStudioUrl = studioUrl => ({ type: SET_STUDIO_URL, studioUrl });
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
  studioUrl: '',
  validLoginTypes: [],
  validGrades: [],
  validCourses: [],
  validScripts: [],
  sectionIds: [],
  // Mapping from sectionId to section object
  sections: {}
};

export default function teacherSections(state=initialState, action) {
  if (action.type === SET_STUDIO_URL) {
    return {
      ...state,
      studioUrl: action.studioUrl
    };
  }

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
    const assignmentList = assignments(state);
    const sections = action.sections.map(section =>
      sectionFromServerSection(section, assignmentList, state.studioUrl));
    return {
      ...state,
      sectionIds: sections.map(section => section.id),
      sections: _.keyBy(sections, 'id')
    };
  }

  // TODO: write tests for this
  if (action.type === UPDATE_SECTION) {
    const assignmentList = assignments(state);
    const section = sectionFromServerSection(action.serverSection,
      assignmentList, state.studioUrl);

    return {
      ...state,
      sections: {
        ...state.sections,
        [action.sectionId]: {
          ...state.sections[action.sectionId],
          ...section
        }
      }
    };
  }

  return state;
}

// Helpers and Selectors

/**
 * Maps from the data we get back from the server for a section, to the format
 * we want to have in our store.
 */
// TODO(bjvanminnen): write some tests for this
const sectionFromServerSection = (serverSection, assignmentList, studioUrl) => {
  const courseId = serverSection.course_id || null;
  const scriptId = serverSection.script ? serverSection.script.id : null;

  const assignmentIndex = getAssignmentIndex(assignmentList)(courseId, scriptId);
  const assignment = assignmentList[assignmentIndex];

  return {
    id: serverSection.id,
    name: serverSection.name,
    loginType: serverSection.login_type,
    grade: serverSection.grade,
    stageExtras: serverSection.stage_extras,
    pairingAllowed: serverSection.pairing_allowed,
    numStudents: serverSection.students.length,
    code: serverSection.code,
    courseId: serverSection.course_id,
    scriptId: scriptId,
    // TODO(bjvanminnen): should maybe be getting these fields as selectors instead of
    // living in state
    assignmentName: assignment ? assignment.name : '',
    assignmentPath: assignment ? (studioUrl + getPath(assignment)) : ''
  };
};

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

  const assignmentIndex = getAssignmentIndex(assignments(state))(
    section.courseId, section.scriptId);

  return assignmentIndex === -1 ? null : assignmentIndex;
};

/**
 * Find an assignment with the appropriate id. If both courseId and scriptId are
 * non-null, look only at the courseId.
 * This is memoized at two separate levels because JS doesnt have any good way
 * to have a cache key consisting of an object (assignmentList) and two strings.
 * @param {object[]} assignmentList - array of valid courses/scripts
 * @param {string} courseId - course id of the assignment we're looking for
 * @param {string} scriptId - script id of the assignment we're looking for
 */
const getAssignmentIndex = _.memoize(assignmentList => (
  _.memoize((courseId, scriptId) => (
    assignmentList.findIndex(assignment =>
      assignment.courseId === courseId &&
      (courseId || assignment.scriptId === scriptId)
    )
  ), (courseId, scriptId) => `${courseId}_${scriptId}`)
));

const getPath = assignment => {
  if (assignment.courseId) {
    return `/courses/${assignment.script_name}`;
  } else {
    return `/s/${assignment.script_name}`;
  }
};
