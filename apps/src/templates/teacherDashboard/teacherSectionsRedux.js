import _ from 'lodash';
import $ from 'jquery';
import { SectionLoginType } from '@cdo/apps/util/sharedConstants';
import { OAuthSectionTypes } from './shapes';

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

/** @const {Object} Map oauth section type to relative "list rosters" URL. */
const urlByProvider = {
  [OAuthSectionTypes.google_classroom]: '/dashboardapi/google_classrooms',
  [OAuthSectionTypes.clever]: '/dashboardapi/clever_classrooms',
};

/** @const {Object} Map oauth section type to relative import URL. */
const importUrlByProvider = {
  [OAuthSectionTypes.google_classroom]: '/dashboardapi/import_google_classroom',
  [OAuthSectionTypes.clever]: '/dashboardapi/import_clever_classroom',
};

//
// Action keys
//
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

const ASYNC_LOAD_BEGIN = 'teacherSections/ASYNC_LOAD_BEGIN';
const ASYNC_LOAD_END = 'teacherSections/ASYNC_LOAD_END';

/** Opens the third-paty roster UI */
const IMPORT_ROSTER_FLOW_BEGIN = 'teacherSections/IMPORT_ROSTER_FLOW_BEGIN';
/** Reports available rosters have been loaded */
const IMPORT_ROSTER_FLOW_LIST_LOADED = 'teacherSections/IMPORT_ROSTER_FLOW_LIST_LOADED';
/** Reports loading available rosters has failed */
const IMPORT_ROSTER_FLOW_LIST_LOAD_FAILED = 'teacherSections/IMPORT_ROSTER_FLOW_LIST_LOAD_FAILED';
/** Closes the third-party roster UI, purging available rosters */
const IMPORT_ROSTER_FLOW_CANCEL = 'teacherSections/IMPORT_ROSTER_FLOW_CANCEL';
/** Reports request to import a roster has started */
const IMPORT_ROSTER_REQUEST = 'teacherSections/IMPORT_ROSTER_REQUEST';
/** Reports request to import a roster has succeeded */
const IMPORT_ROSTER_SUCCESS = 'teacherSections/IMPORT_ROSTER_SUCCESS';

/** @const A few action keys exposed for unit test setup */
export const __testInterface__ = {
  IMPORT_ROSTER_FLOW_BEGIN,
  IMPORT_ROSTER_FLOW_LIST_LOADED,
};

//
// Action Creators
//
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
export const beginEditingNewSection = (courseId, scriptId) => ({type: EDIT_SECTION_BEGIN, courseId, scriptId});

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

export const asyncLoadSectionData = () => (dispatch) => {
  dispatch({type: ASYNC_LOAD_BEGIN});
  return Promise.all([
    fetchJSON('/dashboardapi/sections'),
    fetchJSON('/dashboardapi/courses'),
    fetchJSON('/v2/sections/valid_scripts')
  ]).then(([sections, validCourses, validScripts]) => {
    dispatch(setValidAssignments(validCourses, validScripts));
    dispatch(setSections(sections));
  }).catch(err => {
    console.error(err.message);
  }).then(() => {
    dispatch({type: ASYNC_LOAD_END});
  });
};

function fetchJSON(url, params) {
  return new Promise((resolve, reject) => {
    $.getJSON(url, params)
      .done(resolve)
      .fail(jqxhr => reject(new Error(`
        url: ${url}
        status: ${jqxhr.status}
        statusText: ${jqxhr.statusText}
        responseText: ${jqxhr.responseText}
      `)));
  });
}

/**
 * Start the process of importing a section from a third-party provider
 * (like Google Classroom or Clever) by opening the RosterDialog and
 * loading the list of classrooms available for import.
 */
export const beginImportRosterFlow = () => (dispatch, getState) => {
  const state = getState();
  const provider = getRoot(state).provider;
  if (!provider) {
    return Promise.reject(new Error('Unable to begin import roster flow without a provider'));
  }

  if (isRosterDialogOpen(state)) {
    return Promise.resolve();
  }

  dispatch({type: IMPORT_ROSTER_FLOW_BEGIN});
  return new Promise((resolve, reject) => {
    $.ajax(urlByProvider[provider])
      .success(response => {
        dispatch({
          type: IMPORT_ROSTER_FLOW_LIST_LOADED,
          classrooms: response.courses || []
        });
        resolve();
      })
      .fail(result => {
        const message = result.responseJSON ? result.responseJSON.error : 'Unknown error.';
        dispatch({
          type: IMPORT_ROSTER_FLOW_LIST_LOAD_FAILED,
          status: result.status,
          message
        });
        reject(new Error(message));
      });
  });
};

/** Abandon the import process, closing the RosterDialog. */
export const cancelImportRosterFlow = () => ({type: IMPORT_ROSTER_FLOW_CANCEL});

/**
 * Import the course with the given courseId from a third-party provider
 * (like Google Classroom or Clever), creating a new section. If the course
 * in question has already been imported, update the existing section already
 * associated with it.
 * @param {string} courseId
 * @param {string} courseName
 * @return {function():Promise}
 */
export const importOrUpdateRoster = (courseId, courseName) => (dispatch, getState) => {
  const state = getState();
  const provider = getRoot(state).provider;
  const importSectionUrl = importUrlByProvider[provider];
  let sectionId;

  dispatch({type: IMPORT_ROSTER_REQUEST});
  return fetchJSON(importSectionUrl, { courseId, courseName })
    .then(newSection => sectionId = newSection.id)
    .then(() => dispatch(asyncLoadSectionData()))
    .then(() => dispatch({
      type: IMPORT_ROSTER_SUCCESS,
      sectionId
    }));
};

/**
 * Initial state of this redux module.
 * Should represent the overall state shape with reasonable default values.
 */
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
  // Track whether we've async-loaded our section and assignment data
  asyncLoadComplete: false,
  // Whether the roster dialog (used to import sections from google/clever) is open.
  isRosterDialogOpen: false,
  // Set of oauth classrooms available for import from a third-party source.
  // Not populated until the RosterDialog is opened.
  classrooms: null,
  // Error that occurred while loading oauth classrooms
  loadError: null,
};

/**
 * Generate shape for new section
 * @param id
 * @param courseId
 * @param scriptId
 * @param loginType
 * @returns {sectionShape}
 */
function newSectionData(id, courseId, scriptId, loginType) {
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
    scriptId: scriptId || null,
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
        [sectionId]: newSectionData(sectionId, action.courseId, null, SectionLoginType.word)
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
      newSectionData(PENDING_NEW_SECTION_ID, action.courseId, action.scriptId, undefined);
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

  if (action.type === ASYNC_LOAD_BEGIN) {
    return {
      ...state,
      asyncLoadComplete: false,
    };
  }

  if (action.type === ASYNC_LOAD_END) {
    return {
      ...state,
      asyncLoadComplete: true,
    };
  }

  //
  // Roster import action types
  //

  if (action.type === IMPORT_ROSTER_FLOW_BEGIN) {
    return {
      ...state,
      isRosterDialogOpen: true,
      classrooms: null,
    };
  }

  if (action.type === IMPORT_ROSTER_FLOW_LIST_LOADED) {
    return {
      ...state,
      classrooms: action.classrooms.slice(),
    };
  }

  if (action.type === IMPORT_ROSTER_FLOW_LIST_LOAD_FAILED) {
    return {
      ...state,
      loadError: {
        status: action.status,
        message: action.message,
      }
    };
  }

  if (action.type === IMPORT_ROSTER_FLOW_CANCEL) {
    return {
      ...state,
      isRosterDialogOpen: false,
      classrooms: null,
    };
  }

  if (action.type === IMPORT_ROSTER_REQUEST) {
    return {
      ...state,
      classrooms: null,
    };
  }

  if (action.type === IMPORT_ROSTER_SUCCESS) {
    return {
      ...state,
      isRosterDialogOpen: false,
      sectionBeingEdited: {...state.sections[action.sectionId]},
    };
  }

  return state;
}

// Helpers and Selectors

export const assignmentId = (courseId, scriptId) => `${courseId}_${scriptId}`;

function getRoot(state) {
  return state.teacherSections; // Global knowledge eww.
}

export function isRosterDialogOpen(state) {
  return getRoot(state).isRosterDialogOpen;
}

export function oauthProvider(state) {
  return getRoot(state).provider;
}

export function sectionCode(state, sectionId) {
  return (getRoot(state).sections[sectionId] || {}).code;
}

export function sectionName(state, sectionId) {
  return (getRoot(state).sections[sectionId] || {}).name;
}

export function sectionProvider(state, sectionId) {
  if (isSectionProviderManaged(state, sectionId)) {
    return oauthProvider(state);
  }
  return null;
}

export function isSectionProviderManaged(state, sectionId) {
  return !!(getRoot(state).sections[sectionId] || {}).providerManaged;
}

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
export function serverSectionFromSection(section) {
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
