import {OAuthSectionTypes} from '@cdo/apps/lib/ui/accounts/constants';
import {asyncLoadSectionData} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';

/** Sets a section's roster provider, which must be of type OAuthSectionTypes */
const SET_ROSTER_PROVIDER = 'roster/SET_ROSTER_PROVIDER';
/** Opens the third-party roster UI */
const IMPORT_ROSTER_FLOW_BEGIN = 'roster/IMPORT_ROSTER_FLOW_BEGIN';
/** Reports available rosters have been loaded */
const IMPORT_ROSTER_FLOW_LIST_LOADED = 'roster/IMPORT_ROSTER_FLOW_LIST_LOADED';
/** Reports loading available rosters has failed */
const IMPORT_ROSTER_FLOW_LIST_LOAD_FAILED =
  'roster/IMPORT_ROSTER_FLOW_LIST_LOAD_FAILED';
/** Closes the third-party roster UI, purging available rosters */
const IMPORT_ROSTER_FLOW_CANCEL = 'roster/IMPORT_ROSTER_FLOW_CANCEL';
/** Reports request to import a roster has started */
const IMPORT_ROSTER_REQUEST = 'roster/IMPORT_ROSTER_REQUEST';
/** Reports request to import a roster has succeeded */
export const IMPORT_ROSTER_SUCCESS = 'roster/IMPORT_ROSTER_SUCCESS';

/** @const {Object} Map oauth section type to relative "list rosters" URL. */
const urlByProvider = {
  [OAuthSectionTypes.google_classroom]: '/dashboardapi/google_classrooms',
  [OAuthSectionTypes.clever]: '/dashboardapi/clever_classrooms'
};

/** @const {Object} Map oauth section type to relative import URL. */
const importUrlByProvider = {
  [OAuthSectionTypes.google_classroom]: '/dashboardapi/import_google_classroom',
  [OAuthSectionTypes.clever]: '/dashboardapi/import_clever_classroom'
};

/**
 * Initial state of this redux module.
 * Should represent the overall state shape with reasonable default values.
 */
const initialState = {
  // Whether the roster dialog (used to import sections from google/clever) is open.
  isRosterDialogOpen: false,
  // Track a section's roster provider. Must be of type OAuthSectionTypes.
  rosterProvider: null,
  // Set of oauth classrooms available for import from a third-party source.
  // Not populated until the RosterDialog is opened.
  classrooms: null,
  // Error that occurred while loading oauth classrooms
  loadError: null
};

export default function roster(state = initialState, action) {
  if (action.type === SET_ROSTER_PROVIDER) {
    // No-op if this action is called with a non-OAuth section type,
    // since this action is triggered on every section load.
    if (OAuthSectionTypes[action.rosterProvider]) {
      return {
        ...state,
        rosterProvider: action.rosterProvider
      };
    }
  }

  //
  // Roster import action types
  //

  if (action.type === IMPORT_ROSTER_FLOW_BEGIN) {
    return {
      ...state,
      isRosterDialogOpen: true,
      classrooms: null
    };
  }

  if (action.type === IMPORT_ROSTER_FLOW_LIST_LOADED) {
    return {
      ...state,
      classrooms: action.classrooms.slice()
    };
  }

  if (action.type === IMPORT_ROSTER_FLOW_LIST_LOAD_FAILED) {
    return {
      ...state,
      loadError: {
        status: action.status,
        message: action.message
      }
    };
  }

  if (action.type === IMPORT_ROSTER_FLOW_CANCEL) {
    return {
      ...state,
      isRosterDialogOpen: false,
      rosterProvider: null,
      classrooms: null
    };
  }

  if (action.type === IMPORT_ROSTER_REQUEST) {
    return {
      ...state,
      classrooms: null
    };
  }

  if (action.type === IMPORT_ROSTER_SUCCESS) {
    return {
      ...state,
      isRosterDialogOpen: false
    };
  }
}

function getRoot(state) {
  return state.roster; // Global knowledge eww.
}

export const setRosterProvider = rosterProvider => ({
  type: SET_ROSTER_PROVIDER,
  rosterProvider
});

export function isRosterDialogOpen(state) {
  return getRoot(state).isRosterDialogOpen;
}

export function rosterProvider(state) {
  return getRoot(state).rosterProvider;
}

/**
 * Start the process of importing a section from a third-party provider
 * (like Google Classroom or Clever) by opening the RosterDialog and
 * loading the list of classrooms available for import.
 */
export const beginImportRosterFlow = () => (dispatch, getState) => {
  const state = getState();
  const provider = getRoot(state).rosterProvider;
  if (!provider) {
    return Promise.reject(
      new Error('Unable to begin import roster flow without a provider')
    );
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
        const message = result.responseJSON
          ? result.responseJSON.error
          : 'Unknown error.';
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
 * Start the process of importing a section from Google Classroom by opening
 * the RosterDialog and loading the list of classrooms available for import.
 */
export const beginGoogleImportRosterFlow = () => dispatch => {
  dispatch(setRosterProvider(OAuthSectionTypes.google_classroom));
  dispatch(beginImportRosterFlow());
};

/**
 * Import the course with the given courseId from a third-party provider
 * (like Google Classroom or Clever), creating a new section. If the course
 * in question has already been imported, update the existing section already
 * associated with it.
 * @param {string} courseId
 * @param {string} courseName
 * @return {function():Promise}
 */
export const importOrUpdateRoster = (courseId, courseName) => (
  dispatch,
  getState
) => {
  const state = getState();
  const provider = getRoot(state).rosterProvider;
  const importSectionUrl = importUrlByProvider[provider];
  let sectionId;

  dispatch({type: IMPORT_ROSTER_REQUEST});
  return fetchJSON(importSectionUrl, {courseId, courseName})
    .then(newSection => (sectionId = newSection.id))
    .then(() => dispatch(asyncLoadSectionData())) // maureen test this
    .then(() =>
      dispatch({
        type: IMPORT_ROSTER_SUCCESS,
        sectionId
      })
    );
};

function fetchJSON(url, params) {
  return new Promise((resolve, reject) => {
    $.getJSON(url, params)
      .done(resolve)
      .fail(jqxhr =>
        reject(
          new Error(`
        url: ${url}
        status: ${jqxhr.status}
        statusText: ${jqxhr.statusText}
        responseText: ${jqxhr.responseText}
      `)
        )
      );
  });
}
