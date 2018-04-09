import _ from 'lodash';
import $ from 'jquery';
import { OAuthSectionTypes } from './shapes';
/**
 * @const {string[]} The only properties that can be updated by the user
 * when creating or editing a section.
 */
const USER_EDITABLE_SECTION_PROPS = [
  'name',
  'loginType',
  'stageExtras',
  'pairingAllowed',
  'courseId',
  'scriptId',
  'grade',
  'hidden',
];

/** @const {number} ID for a new section that has not been saved */
const PENDING_NEW_SECTION_ID = -1;

/** @const {string} Empty string used to indicate no section selected */
export const NO_SECTION = '';

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
const SET_VALID_GRADES = 'teacherDashboard/SET_VALID_GRADES';
const SET_VALID_ASSIGNMENTS = 'teacherDashboard/SET_VALID_ASSIGNMENTS';
const SET_CSF_SCRIPT_IDS = 'teacherDashboard/SET_CSF_SCRIPT_IDS';
const SET_STUDENT_SECTION = 'teacherDashboard/SET_STUDENT_SECTION';
const SET_OAUTH_PROVIDER = 'teacherDashboard/SET_OAUTH_PROVIDER';
const SET_SECTIONS = 'teacherDashboard/SET_SECTIONS';
export const SELECT_SECTION = 'teacherDashboard/SELECT_SECTION';
const REMOVE_SECTION = 'teacherDashboard/REMOVE_SECTION';
const TOGGLE_SECTION_HIDDEN = 'teacherSections/TOGGLE_SECTION_HIDDEN';
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

/** Reports server request has started */
const UPDATE_SHARING_REQUEST = 'teacherDashboard/UPDATE_SHARING_REQUEST';
/** Reports server request has succeeded */
const UPDATE_SHARING_SUCCESS = 'teacherDashboard/UPDATE_SHARING_SUCCESS';
/** Reports server request has failed */
const UPDATE_SHARING_FAILURE = 'teacherDashboard/UPDATE_SHARING_FAILURE';

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

/** @const A few constants exposed for unit test setup */
export const __testInterface__ = {
  EDIT_SECTION_REQUEST,
  EDIT_SECTION_SUCCESS,
  IMPORT_ROSTER_FLOW_BEGIN,
  IMPORT_ROSTER_FLOW_LIST_LOADED,
  PENDING_NEW_SECTION_ID,
  USER_EDITABLE_SECTION_PROPS,
};

//
// Action Creators
//
export const setValidGrades = grades => ({ type: SET_VALID_GRADES, grades });
export const setCsfScriptIds = ids => ({ type: SET_CSF_SCRIPT_IDS, ids });
export const setOAuthProvider = provider => ({ type: SET_OAUTH_PROVIDER, provider });
export const setValidAssignments = (validCourses, validScripts) => ({
  type: SET_VALID_ASSIGNMENTS,
  validCourses,
  validScripts
});
export const setStudentsForCurrentSection = (sectionId, studentInfo) => ({
  type: SET_STUDENT_SECTION,
  sectionId: sectionId,
  students: studentInfo
});

/**
 * Set the list of sections to display.
 * @param sections
 */
export const setSections = (sections) => ({ type: SET_SECTIONS, sections });
export const selectSection = sectionId => ({ type: SELECT_SECTION, sectionId });
export const removeSection = sectionId => ({ type: REMOVE_SECTION, sectionId });

/**
 * Changes the hidden state of a given section, persisting these changes to the
 * server
 * @param {number} sectionId
 */
export const toggleSectionHidden = sectionId => (dispatch, getState) => {
  dispatch(beginEditingSection(sectionId, true));
  const state = getState();
  const currentlyHidden = getRoot(state).sections[sectionId].hidden;
  dispatch(editSectionProperties({hidden: !currentlyHidden}));
  return dispatch(finishEditingSection());
};

/**
 * Opens the UI for adding a new section.
 */
export const beginEditingNewSection = (courseId, scriptId) => ({type: EDIT_SECTION_BEGIN, courseId, scriptId});

/**
 * Opens the UI for editing the specified section.
 * @param {number} sectionId
 * @param {bool} [silent] - Optional param for when we want to begin editing the
 *   section without launching our dialog
 */
export const beginEditingSection = (sectionId, silent=false) => ({
  type: EDIT_SECTION_BEGIN,
  sectionId,
  silent
});

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
      dispatch({
        type: EDIT_SECTION_SUCCESS,
        sectionId: section.id,
        serverSection: result,
      });
      resolve();
    }).fail((jqXhr, status) => {
      dispatch({type: EDIT_SECTION_FAILURE});
      reject(status);
    });
  });
};

/**
 * Change the login type of the given section.
 * @param {number} sectionId
 * @param {SectionLoginType} loginType
 * @return {function():Promise}
 */
export const editSectionLoginType = (sectionId, loginType) => dispatch => {
  dispatch(beginEditingSection(sectionId));
  dispatch(editSectionProperties({loginType}));
  return dispatch(finishEditingSection());
};

export const updateShareSetting = (sectionId, shareSetting) => dispatch => {
  dispatch({type: UPDATE_SHARING_REQUEST});
  return new Promise((resolve, reject) => {
    $.ajax({
      url: `dashboardapi/sections/${sectionId}/update_sharing_disabled`,
      method: 'POST',
      contentType: 'application/json;charset=UTF-8',
      data: JSON.stringify({sharing_disabled: shareSetting}),
    }).done(result => {
      dispatch({
        type: UPDATE_SHARING_SUCCESS,
        sectionId: sectionId,
        serverSectionShareSetting: result.sharing_disabled,
        serverStudents: result.students
      });
      resolve();
    }).fail((jqXhr, status) => {
      dispatch({type: UPDATE_SHARING_FAILURE});
      reject(status);
    });
  });
};

export const asyncLoadSectionData = (id) => (dispatch) => {
  dispatch({type: ASYNC_LOAD_BEGIN});
  // If section id is provided, load students for the current section.

  dispatch({type: ASYNC_LOAD_BEGIN});
  let apis = [
    '/dashboardapi/sections',
    '/dashboardapi/courses',
    '/v2/sections/valid_scripts'
  ];
  if (id) {
    apis.push('/dashboardapi/sections/' + id + '/students');
  }

  return Promise.all(apis.map(fetchJSON))
    .then(([sections, validCourses, validScripts, students]) => {
      dispatch(setValidAssignments(validCourses, validScripts));
      dispatch(setSections(sections));
      if (id) {
        dispatch(setStudentsForCurrentSection(id, students));
      }
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
  validGrades: [],
  sectionIds: [],
  selectedSectionId: NO_SECTION,
  validAssignments: {},
  // Ids of assignments that go in our first dropdown (i.e. courses, and scripts
  // that are not in a course)
  primaryAssignmentIds: [],
  // Mapping from sectionId to section object
  sections: {},
  // List of students in section currently being edited
  selectedStudents: [],
  sectionsAreLoaded: false,
  // We can edit exactly one section at a time.
  // While editing we store that section's 'in-progress' state separate from
  // its persisted state in the sections map.
  sectionBeingEdited: null,
  showSectionEditDialog: false,
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
    stageExtras: true,
    pairingAllowed: true,
    sharingDisabled: false,
    studentCount: 0,
    code: '',
    courseId: courseId || null,
    scriptId: scriptId || null,
    hidden: false,
  };
}

export default function teacherSections(state=initialState, action) {
  if (action.type === SET_OAUTH_PROVIDER) {
    return {
      ...state,
      provider: action.provider
    };
  }

  if (action.type === SET_CSF_SCRIPT_IDS) {
    return {
      ...state,
      isCsfScript: id => action.ids.includes(id),
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
        path: `/courses/${course.script_name}`
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
        path: `/s/${script.script_name}`
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

  if (action.type === SET_STUDENT_SECTION) {
    const students = action.students.map(student =>
      studentFromServerStudent(student, action.sectionId));
    return {
      ...state,
      selectedStudents: students
    };
  }

  if (action.type === UPDATE_SHARING_SUCCESS) {
    const students = action.serverStudents.map(student =>
      studentFromServerStudent(student, action.sectionId));
    return {
      ...state,
      saveInProgress: false,
      selectedStudents: students
    };
  }

  if (action.type === SET_SECTIONS) {
    const sections = action.sections.map(section =>
      sectionFromServerSection(section));

    let selectedSectionId = state.selectedSectionId;
    // If we have only one section, autoselect it
    if (Object.keys(action.sections).length === 1) {
      selectedSectionId = action.sections[0].id.toString();
    }

    sections.forEach(section => {
      // SET_SECTIONS is called in two different contexts. On some pages it is called
      // in a way that only provides name/id per section, in other places (homepage)
      // it provides more detailed information. There are currently no pages where
      // it should be called in both manners, but we want to make sure that if it
      // were it will throw an error rather than destroy data.
      const prevSection = state.sections[section.id];
      if (prevSection) {
        Object.keys(section).forEach(key => {
          if (section[key] === undefined && prevSection[key] !== undefined) {
            throw new Error('SET_SECTIONS called multiple times in a way that would remove data');
          }
        });
      }
    });

    return {
      ...state,
      sectionsAreLoaded: true,
      selectedSectionId,
      sectionIds:_.uniq(state.sectionIds.concat(sections.map(section => section.id))),
      sections: {
        ...state.sections,
        ..._.keyBy(sections, 'id')
      }
    };
  }

  if (action.type === SELECT_SECTION) {
    const sectionId = action.sectionId;
    if (sectionId !== NO_SECTION && !state.sectionIds.includes(parseInt(sectionId, 10))) {
      throw new Error(`Unknown sectionId ${sectionId}`);
    }
    return {
      ...state,
      selectedSectionId: sectionId
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

  if (action.type === UPDATE_SHARING_REQUEST) {
    return {
      ...state,
      saveInProgress: true,
    };
  }

  if (action.type === UPDATE_SHARING_FAILURE) {
    return {
      ...state,
      saveInProgress: false
    };
  }

  if (action.type === TOGGLE_SECTION_HIDDEN) {
    const { sectionId } = action;
    const section = state.sections[sectionId];
    if (!section) {
      throw new Error('section does not exist');
    }

    return {
      ...state,
      sections: {
        ...state.sections,
        [sectionId]: {
          ...state.sections[sectionId],
          hidden: !state.sections[sectionId].hidden,
        }
      }
    };
  }

  if (action.type === EDIT_SECTION_BEGIN) {
    const initialSectionData = action.sectionId ?
      {...state.sections[action.sectionId]} :
      newSectionData(PENDING_NEW_SECTION_ID, action.courseId, action.scriptId, undefined);
    return {
      ...state,
      sectionBeingEdited: initialSectionData,
      showSectionEditDialog: !action.silent
    };
  }

  if (action.type === EDIT_SECTION_PROPERTIES) {
    const stageExtraSettings = {};

    if (!state.sectionBeingEdited) {
      throw new Error('Cannot edit section properties; no section is'
        + ' currently being edited.');
    }

    for (const key in action.props) {
      if (!USER_EDITABLE_SECTION_PROPS.includes(key)) {
        throw new Error(`Cannot edit property ${key}; it's not allowed.`);
      }
    }

    // Selecting Course 1-4 or A-F should auto-enable Stage Extras.
    if (action.props.scriptId) {
      const script = state.validAssignments[assignmentId(null, action.props.scriptId)];
      stageExtraSettings.stageExtras = !!(script && /course[1-4a-f]/.test(script.script_name));
    }

    return {
      ...state,
      sectionBeingEdited: {
        ...state.sectionBeingEdited,
        ...stageExtraSettings,
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
      },
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
      sectionBeingEdited: {
        ...state.sections[action.sectionId],
        // explicitly unhide section after importing
        hidden: false
      },
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

export function isSaveInProgress(state) {
  return getRoot(state).saveInProgress;
}

/**
 * Gets the data needed by Reacttabular to show a sortable table
 * @param {object} state - Full store state
 * @param {number[]} sectionIds - List of section ids we want row data for
 */
export function getSectionRows(state, sectionIds) {
  const { sections, validAssignments } = getRoot(state);
  return sectionIds.map(id => ({
    ..._.pick(sections[id], [
      'id',
      'name',
      'loginType',
      'studentCount',
      'code',
      'grade',
      'providerManaged',
      'hidden',
    ]),
    assignmentNames: assignmentNames(validAssignments, sections[id]),
    assignmentPaths: assignmentPaths(validAssignments, sections[id]),
  }));
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
  sharingDisabled: serverSection.sharing_disabled,
  studentCount: serverSection.studentCount,
  code: serverSection.code,
  courseId: serverSection.course_id,
  scriptId: serverSection.script ? serverSection.script.id : null,
  hidden: serverSection.hidden,
});

/**
 * Maps from the data we get back from the server for a student, to the format
 * we want to have in our store.
 */
export const studentFromServerStudent = (serverStudent, sectionId) => ({
  sectionId: sectionId,
  id: serverStudent.id,
  name: serverStudent.name,
  sharingDisabled: serverStudent.sharing_disabled
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
    sharing_disabled: section.sharingDisabled,
    course_id: section.courseId,
    script: (section.scriptId ? {id: section.scriptId} : undefined),
  };
}

const assignmentsForSection = (validAssignments, section) => {
  const assignments = [];
  if (section.courseId) {
    const assignId = assignmentId(section.courseId, null);
    if (validAssignments[assignId]) {
      assignments.push(validAssignments[assignId]);
    }
  }
  if (section.scriptId) {
    const assignId = assignmentId(null, section.scriptId);
    if (validAssignments[assignId]) {
      assignments.push(validAssignments[assignId]);
    }
  }
  return assignments;
};

/**
 * Get the name of the course/script assigned to the given section
 * @returns {string[]}
 */
export const assignmentNames = (validAssignments, section) => {
  const assignments = assignmentsForSection(validAssignments, section);
  // we might not have an assignment object if we have a section that was somehow
  // assigned to a hidden script (and we dont have permissions to see hidden scripts)
  return assignments.map(assignment => assignment ? assignment.name : '');
};

/**
 * Get the path of the course/script assigned to the given section
 * @returns {string[]}
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
  return !!(state.sectionBeingEdited && state.sectionBeingEdited.id >= 0) &&
    state.showSectionEditDialog;
}

/**
 * Ask for the id of the section we're currently editing, or null if we're not
 * editing a section.
 */
export function editedSectionId(state) {
  return state.sectionBeingEdited ? state.sectionBeingEdited.id : null;
}

/**
 * Extract a list of name/id for each section
 */
export function sectionsNameAndId(state) {
  return state.sectionIds.map(id => ({
    id: parseInt(id, 10),
    name: state.sections[id].name
  }));
}

/**
 * @param {object} state - Full state of redux tree
 */
export function hiddenSectionIds(state) {
  state = getRoot(state);
  return state.sectionIds.filter(id => state.sections[id].hidden);
}
