import _ from 'lodash';
import $ from 'jquery';
import { SectionLoginType } from '@cdo/apps/util/sharedConstants';

/**
 * @const {string[]} The only properties that can be updated by the user
 * when creating or editing a section.
 */
export const USER_EDITABLE_SECTION_PROPS = [
  'name',
  'loginType',
  'stageExtras',
  'pairingAllowed',
  'courseId',
  'scriptId',
  'grade',
];

/** @const {number} ID for a new section that has not been saved */
export const PENDING_NEW_SECTION_ID = -1;

const SET_STUDIO_URL = 'teacherDashboard/SET_STUDIO_URL';
const SET_VALID_LOGIN_TYPES = 'teacherDashboard/SET_VALID_LOGIN_TYPES';
const SET_VALID_GRADES = 'teacherDashboard/SET_VALID_GRADES';
const SET_VALID_ASSIGNMENTS = 'teacherDashboard/SET_VALID_ASSIGNMENTS';
const SET_OAUTH_PROVIDER = 'teacherDashboard/SET_OAUTH_PROVIDER';
const SET_SECTIONS = 'teacherDashboard/SET_SECTIONS';
const UPDATE_SECTION = 'teacherDashboard/UPDATE_SECTION';
const NEW_SECTION = 'teacherDashboard/NEW_SECTION';
const REMOVE_SECTION = 'teacherDashboard/REMOVE_SECTION';
/** Opens section edit UI, might load existing section info */
const EDIT_SECTION_BEGIN = 'teacherDashboard/EDIT_SECTION_BEGIN';
/** Makes staged changes to section being edited */
const EDIT_SECTION_PROPERTIES = 'teacherDashboard/EDIT_SECTION_PROPERTIES';
/** Abandons changes to section being edited, closes UI */
const EDIT_SECTION_CANCEL = 'teacherDashboard/EDIT_SECTION_CANCEL';
/** Reports server request has started */
const EDIT_SECTION_REQUEST = 'teacherDashboard/EDIT_SECTION_REQUEST';
/** Reports server request has succeeded */
const EDIT_SECTION_SUCCESS = 'teacherDashboard/EDIT_SECTION_SUCCESS';
/** Reports server request has failed */
const EDIT_SECTION_FAILURE = 'teacherDashboard/EDIT_SECTION_FAILURE';

export const setStudioUrl = studioUrl => ({ type: SET_STUDIO_URL, studioUrl });
export const setValidLoginTypes = loginTypes => ({ type: SET_VALID_LOGIN_TYPES, loginTypes });
export const setValidGrades = grades => ({ type: SET_VALID_GRADES, grades });
export const setOAuthProvider = provider => ({ type: SET_OAUTH_PROVIDER, provider });
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

/**
 * Opens the UI for adding a new section.
 */
export const beginEditingNewSection = () => ({type: EDIT_SECTION_BEGIN});

/**
 * Opens the UI for editing the specified section.
 * @param {number} sectionId
 */
export const beginEditingSection = sectionId => ({ type: EDIT_SECTION_BEGIN, sectionId });

/**
 * Make staged changes to the section currently being edited.
 * @param {object} props - set of section properties of update.
 * @throws if not currently editing, or if trying to set an invalid prop.
 */
export const editSectionProperties = props => ({ type: EDIT_SECTION_PROPERTIES, props });

/**
 * Close the UI for adding/editing a section, abandoning changes.
 */
export const cancelEditingSection = () => ({ type: EDIT_SECTION_CANCEL });

/**
 * Submit staged section changes to the server.
 * Closes UI and updates section table on success.
 */
export const finishEditingSection = () => (dispatch, getState) => {
  dispatch({type: EDIT_SECTION_REQUEST});
  const state = getState().teacherSections;
  const section = state.sectionBeingEdited;
  return new Promise((resolve, reject) => {
    $.ajax({
      url: isAddingSection(state) ? '/v2/sections' : `/v2/sections/${section.id}/update`,
      method: 'POST',
      contentType: 'application/json;charset=UTF-8',
      data: JSON.stringify(serverSectionFromSection(section)),
    }).done(result => {
      dispatch(updateSection(section.id, result));
      dispatch({type: EDIT_SECTION_SUCCESS});
      resolve();
    }).fail((jqXhr, status) => {
      dispatch({type: EDIT_SECTION_FAILURE});
      reject(status);
    });
  });
};

const initialState = {
  nextTempId: -1,
  studioUrl: '',
  provider: null,
  validLoginTypes: [],
  validGrades: [],
  sectionIds: [],
  validAssignments: {},
  // Ids of assignments that go in our first dropdown (i.e. courses, and scripts
  // that are not in a course)
  primaryAssignmentIds: [],
  // Mapping from sectionId to section object
  sections: {},
  // We can edit exactly one section at a time.
  // While editing we store that section's 'in-progress' state separate from
  // its persisted state in the sections map.
  sectionBeingEdited: null,
  saveInProgress: false,
};

/**
 * Generate shape for new section
 * @param id
 * @param courseId
 * @param loginType
 * @returns {sectionShape}
 */
function newSectionData(id, courseId, loginType) {
  return {
    id: id,
    name: '',
    loginType: loginType,
    grade: '',
    providerManaged: false,
    stageExtras: false,
    pairingAllowed: true,
    studentCount: 0,
    code: '',
    courseId: courseId || null,
    scriptId: null
  };
}

export default function teacherSections(state=initialState, action) {
  if (action.type === SET_STUDIO_URL) {
    return {
      ...state,
      studioUrl: action.studioUrl
    };
  }

  if (action.type === SET_OAUTH_PROVIDER) {
    return {
      ...state,
      provider: action.provider
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
    const sections = action.sections.map(section =>
      sectionFromServerSection(section));
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
    const section = sectionFromServerSection(action.serverSection);
    const oldSectionId = action.sectionId;
    const newSection = section.id !== oldSectionId;

    let newSectionIds = state.sectionIds;
    if (newSection) {
      if (state.sectionIds.includes(oldSectionId)) {
        newSectionIds = state.sectionIds.map(id => id === oldSectionId ? section.id : id);
      } else {
        newSectionIds = [
          section.id,
          ...state.sectionIds,
        ];
      }
    }

    // When updating a persisted section, oldSectionId will be identical to
    // section.id. However, if this is a newly persisted section, oldSectionId
    // will represent our temporary section. In that case, we want to delete that
    // section, and replace it with our new one.
    return {
      ...state,
      sectionIds: newSectionIds,
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
        [sectionId]: newSectionData(sectionId, action.courseId, SectionLoginType.word)
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

  if (action.type === EDIT_SECTION_BEGIN) {
    const initialSectionData = action.sectionId ?
      {...state.sections[action.sectionId]} :
      newSectionData(PENDING_NEW_SECTION_ID, action.courseId, undefined);
    return {
      ...state,
      sectionBeingEdited: initialSectionData,
    };
  }

  if (action.type === EDIT_SECTION_PROPERTIES) {
    if (!state.sectionBeingEdited) {
      throw new Error('Cannot edit section properties; no section is'
        + ' currently being edited.');
    }

    for (const key in action.props) {
      if (!USER_EDITABLE_SECTION_PROPS.includes(key)) {
        throw new Error(`Cannot edit property ${key}; it's not allowed.`);
      }
    }
    return {
      ...state,
      sectionBeingEdited: {
        ...state.sectionBeingEdited,
        ...action.props,
      }
    };
  }

  if (action.type === EDIT_SECTION_CANCEL) {
    return {
      ...state,
      sectionBeingEdited: null,
    };
  }

  if (action.type === EDIT_SECTION_REQUEST) {
    return {
      ...state,
      saveInProgress: true,
    };
  }

  if (action.type === EDIT_SECTION_SUCCESS) {
    return {
      ...state,
      sectionBeingEdited: null,
      saveInProgress: false,
    };
  }

  if (action.type === EDIT_SECTION_FAILURE) {
    return {
      ...state,
      saveInProgress: false,
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
export const sectionFromServerSection = serverSection => ({
  id: serverSection.id,
  name: serverSection.name,
  loginType: serverSection.login_type,
  grade: serverSection.grade,
  providerManaged: serverSection.providerManaged || false, // TODO: (josh) make this required when /v2/sections API is deprecated
  stageExtras: serverSection.stage_extras,
  pairingAllowed: serverSection.pairing_allowed,
  studentCount: serverSection.studentCount,
  code: serverSection.code,
  courseId: serverSection.course_id,
  scriptId: serverSection.script ? serverSection.script.id : null
});

/**
 * Map from client sectionShape to well-formatted params for updating the
 * section on the server via the sections API.
 * @param {sectionShape} section
 */
function serverSectionFromSection(section) {
  // Lazy: We leave some extra properties on this object (they're ignored by
  // the server for now) hoping this can eventually become a pass-through.
  return {
    ...section,
    login_type: section.loginType,
    stage_extras: section.stageExtras,
    pairing_allowed: section.pairingAllowed,
    course_id: section.courseId,
    script: (section.scriptId ? {id: section.scriptId} : undefined),
  };
}

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

/**
 * Ask whether the user is currently adding a new section using
 * the Add Section dialog.
 */
export function isAddingSection(state) {
  return !!(state.sectionBeingEdited && state.sectionBeingEdited.id < 0);
}

/**
 * Ask whether the user is currently editing an existing section using the
 * Edit Section dialog.
 */
export function isEditingSection(state) {
  return !!(state.sectionBeingEdited && state.sectionBeingEdited.id >= 0);
}
