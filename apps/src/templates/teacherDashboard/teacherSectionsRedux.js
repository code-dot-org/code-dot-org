import _ from 'lodash';
import { SectionLoginType } from '@cdo/apps/util/sharedConstants';

const SET_STUDIO_URL = 'teacherDashboard/SET_STUDIO_URL';
const SET_VALID_LOGIN_TYPES = 'teacherDashboard/SET_VALID_LOGIN_TYPES';
const SET_VALID_GRADES = 'teacherDashboard/SET_VALID_GRADES';
const SET_VALID_ASSIGNMENTS = 'teacherDashboard/SET_VALID_ASSIGNMENTS';
const SET_SECTIONS = 'teacherDashboard/SET_SECTIONS';
const UPDATE_SECTION = 'teacherDashboard/UPDATE_SECTION';
const NEW_SECTION = 'teacherDashboard/NEW_SECTION';
const REMOVE_SECTION = 'teacherDashboard/REMOVE_SECTION';

export const setStudioUrl = studioUrl => ({ type: SET_STUDIO_URL, studioUrl });
export const setValidLoginTypes = loginTypes => ({ type: SET_VALID_LOGIN_TYPES, loginTypes });
export const setValidGrades = grades => ({ type: SET_VALID_GRADES, grades });
export const setValidAssignments = (validCourses, validScripts) => ({
  type: SET_VALID_ASSIGNMENTS,
  validCourses,
  validScripts
});

/**
 * Set the list of sections to display. If `reset` is true, first clear the
 * existing list.
 * @param sections
 * @param reset
 */
export const setSections = (sections, reset = false) => ({ type: SET_SECTIONS, sections, reset });
export const updateSection = (sectionId, serverSection) => ({
  type: UPDATE_SECTION,
  sectionId,
  serverSection
});
export const newSection = (courseId=null) => ({ type: NEW_SECTION, courseId });
export const removeSection = sectionId => ({ type: REMOVE_SECTION, sectionId });

const initialState = {
  nextTempId: -1,
  studioUrl: '',
  validLoginTypes: [],
  validGrades: [],
  sectionIds: [],
  validAssignments: {},
  // Ids of assignments that go in our first dropdown (i.e. courses, and scripts
  // that are not in a course)
  primaryAssignmentIds: [],
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

    // Primary assignment ids are (a) courses and (b) scripts that are not in any
    // of our courses.
    let primaryAssignmentIds = [];
    let secondaryAssignmentIds = [];

    // NOTE: We depend elsewhere on the order of our keys in validAssignments
    action.validCourses.forEach(course => {
      const assignId = assignmentId(course.id, null);
      const scriptAssignIds = (course.script_ids || []).map(scriptId =>
        assignmentId(null, scriptId));
      validAssignments[assignId] = {
        ..._.omit(course, 'script_ids'),
        courseId: course.id,
        scriptId: null,
        scriptAssignIds,
        assignId,
        path: `${state.studioUrl}/courses/${course.script_name}`
      };
      primaryAssignmentIds.push(assignId);
      secondaryAssignmentIds.push(...scriptAssignIds);
    });
    secondaryAssignmentIds = _.uniq(secondaryAssignmentIds);

    action.validScripts.forEach(script => {
      const assignId = assignmentId(null, script.id);
      validAssignments[assignId] = {
        ...script,
        courseId: null,
        scriptId: script.id,
        assignId,
        path: `${state.studioUrl}/s/${script.script_name}`
      };

      if (!secondaryAssignmentIds.includes(assignId)) {
        primaryAssignmentIds.push(assignId);
      }
    });

    return {
      ...state,
      validAssignments,
      primaryAssignmentIds,
    };
  }

  if (action.type === SET_SECTIONS) {
    const sections = action.sections;
    const prevSectionIds = action.reset ? [] : state.sectionIds;
    const prevSections = action.reset ? [] : state.sections;
    return {
      ...state,
      sectionIds: prevSectionIds.concat(sections.map(section => section.id)),
      sections: {
        ...prevSections,
        ..._.keyBy(sections, 'id')
      }
    };
  }

  if (action.type === UPDATE_SECTION) {
    const section = action.serverSection;
    const oldSectionId = action.sectionId;
    const newSection = section.id !== oldSectionId;

    // When updating a persisted section, oldSectionId will be identical to
    // section.id. However, if this is a newly persisted section, oldSectionId
    // will represent our temporary section. In that case, we want to delete that
    // section, and replace it with our new one.
    return {
      ...state,
      sectionIds: newSection ?
        // replace oldSectionId with new section.id
        state.sectionIds.map(id => id === oldSectionId ? section.id : id) :
        state.sectionIds,
      sections: {
        // When updating a persisted section, omitting oldSectionId is still fine
        // because we're adding it back on the next line
        ..._.omit(state.sections, oldSectionId),
        [section.id]: {
          ...state.sections[section.id],
          ...section
        }
      }
    };
  }

  if (action.type === NEW_SECTION) {
    // create an id that we can use in our local store that will be replaced
    // once persisted
    const sectionId = state.nextTempId;
    let courseId = action.courseId || null;
    if (courseId) {
      if (!state.validAssignments[courseId]) {
        courseId = null;
      }
    }

    return {
      ...state,
      // use negative numbers for our temp ids so that we dont need to worry about
      // conflicting with server ids
      nextTempId: state.nextTempId - 1,
      sectionIds: [sectionId, ...state.sectionIds],
      sections: {
        ...state.sections,
        [sectionId]: {
          id: sectionId,
          name: '',
          loginType: SectionLoginType.word,
          grade: '',
          stageExtras: false,
          pairingAllowed: true,
          studentCount: 0,
          code: '',
          courseId: action.courseId || null,
          scriptId: null
        }
      }
    };
  }

  if (action.type === REMOVE_SECTION) {
    const sectionId = action.sectionId;
    const section = state.sections[sectionId];
    if (!section) {
      throw new Error('section does not exist');
    }
    return {
      ...state,
      sectionIds: _.without(state.sectionIds, sectionId),
      sections: _.omit(state.sections, sectionId)
    };
  }

  return state;
}

// Helpers and Selectors

export const assignmentId = (courseId, scriptId) => `${courseId}_${scriptId}`;

const assignmentsForSection = (validAssignments, section) => {
  const assignments = [];
  if (section.courseId) {
    const assignId = assignmentId(section.courseId, null);
    assignments.push(validAssignments[assignId]);
  }
  if (section.scriptId) {
    const assignId = assignmentId(null, section.scriptId);
    assignments.push(validAssignments[assignId]);
  }
  return assignments;
};

/**
 * Get the name of the course/script assigned to the given section
 */
export const assignmentNames = (validAssignments, section) => {
  const assignments = assignmentsForSection(validAssignments, section);
  // we might not have an assignment object if we have a section that was somehow
  // assigned to a hidden script (and we dont have permissions to see hidden scripts)
  return assignments.map(assignment => assignment ? assignment.name : '');
};

/**
 * Get the path of the course/script assigned to the given section
 */
export const assignmentPaths = (validAssignments, section) => {
  const assignments = assignmentsForSection(validAssignments, section);
  return assignments.map(assignment => assignment ? assignment.path : '');
};
