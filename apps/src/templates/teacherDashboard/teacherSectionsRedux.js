import _ from 'lodash';

const SET_STUDIO_URL = 'teacherDashboard/SET_STUDIO_URL';
const SET_VALID_LOGIN_TYPES = 'teacherDashboard/SET_VALID_LOGIN_TYPES';
const SET_VALID_GRADES = 'teacherDashboard/SET_VALID_GRADES';
const SET_VALID_ASSIGNMENTS = 'teacherDashboard/SET_VALID_ASSIGNMENTS';
const SET_SECTIONS = 'teacherDashboard/SET_SECTIONS';
const UPDATE_SECTION = 'teacherDashboard/UPDATE_SECTION';

export const setStudioUrl = studioUrl => ({ type: SET_STUDIO_URL, studioUrl });
export const setValidLoginTypes = loginTypes => ({ type: SET_VALID_LOGIN_TYPES, loginTypes });
export const setValidGrades = grades => ({ type: SET_VALID_GRADES, grades });
export const setValidAssignments = (validCourses, validScripts) => ({
  type: SET_VALID_ASSIGNMENTS,
  validCourses,
  validScripts
});
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
  sectionIds: [],
  validAssignments: [],
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

  if (action.type === SET_VALID_ASSIGNMENTS) {
    const validAssignments = {};

    // NOTE: We depend elsewhere on the order of our keys in validAssignments
    action.validCourses.forEach(course => {
      const assignId = assignmentId(course.id, null);
      validAssignments[assignId] = {
        ...course,
        courseId: course.id,
        scriptId: null,
        assignId,
        path: `${state.studioUrl}/courses/${course.script_name}`
      };
    });

    action.validScripts.forEach(script => {
      const assignId = assignmentId(null, script.id);
      validAssignments[assignId] = {
        ...script,
        courseId: null,
        scriptId: script.id,
        assignId,
        path: `${state.studioUrl}/s/${script.script_name}`
      };
    });

    return {
      ...state,
      validAssignments
    };
  }

  if (action.type === SET_SECTIONS) {
    const sections = action.sections.map(section =>
      sectionFromServerSection(section, state.validAssignments));
    return {
      ...state,
      sectionIds: sections.map(section => section.id),
      sections: _.keyBy(sections, 'id')
    };
  }

  if (action.type === UPDATE_SECTION) {
    const section = sectionFromServerSection(action.serverSection,
      state.validAssignments);

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

export const assignmentId = (courseId, scriptId) => `${courseId}_${scriptId}`;

/**
 * Maps from the data we get back from the server for a section, to the format
 * we want to have in our store.
 */
export const sectionFromServerSection = (serverSection, validAssignments) => {
  const courseId = serverSection.course_id || null;
  const scriptId = serverSection.script ? serverSection.script.id : null;

  // When generating our assignment id, we want to ignore scriptId if we're assigned
  // to both a script and course (i.e. we want to find the Course).
  const assignId = assignmentId(courseId, courseId ? null : scriptId);
  const assignment = validAssignments[assignId];

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
    assignmentPath: assignment ? assignment.path : ''
  };
};
