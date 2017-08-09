import $ from 'jquery';
import { OAuthSectionTypes } from './shapes';

const SET_CLASSROOM_LIST = 'teacherDashboard/SET_CLASSROOM_LIST';
const IMPORT_CLASSROOM_STARTED = 'teacherDashboard/IMPORT_CLASSROOM_STARTED';
const FAILED_LOAD = 'teacherDashboard/FAILED_LOAD';
const ROSTER_DIALOG_OPEN = 'oauthClassroom/ROSTER_DIALOG_OPEN';
const ROSTER_DIALOG_CLOSE = 'oauthClassroom/ROSTER_DIALOG_CLOSE';

const urlByProvider = {
  [OAuthSectionTypes.google_classroom]: '/dashboardapi/google_classrooms',
  [OAuthSectionTypes.clever]: '/dashboardapi/clever_classrooms',
};

export const loadClassroomList = provider => {
  const url = urlByProvider[provider];

  return dispatch => {
    $.ajax(url)
      .success(response => dispatch(setClassroomList(response.courses || [])))
      .fail(result => {
        const message = result.responseJSON ? result.responseJSON.error : 'Unknown error.';
        dispatch(failedLoad(result.status, message));
      });
  };
};

export const setClassroomList = classrooms => ({ type: SET_CLASSROOM_LIST, classrooms });

export const importClassroomStarted = () => ({ type: IMPORT_CLASSROOM_STARTED });

export const failedLoad = (status, message) => ({ type: FAILED_LOAD, status, message });

export const openRosterDialog = () => ({type: ROSTER_DIALOG_OPEN});
export const closeRosterDialog = () => ({type: ROSTER_DIALOG_CLOSE});

const initialState = {
  classrooms: null,
  isRosterDialogOpen: false,
};

//
// Selectors
//

function getRoot(state) {
  return state.oauthClassroom; // Global knowledge eww.
}

export function isRosterDialogOpen(state) {
  return getRoot(state).isRosterDialogOpen;
}

//
// The Reducer
//
export default function oauthClassroom(state = initialState, action) {
  if (action.type === SET_CLASSROOM_LIST) {
    return {
      ...state,
      classrooms: action.classrooms.slice(),
    };
  }

  if (action.type === IMPORT_CLASSROOM_STARTED) {
    return {
      ...state,
      classrooms: null,
    };
  }

  if (action.type === FAILED_LOAD) {
    return {
      ...state,
      loadError: {
        status: action.status,
        message: action.message,
      }
    };
  }

  if (action.type === ROSTER_DIALOG_OPEN) {
    return {
      ...state,
      isRosterDialogOpen: true,
    };
  } else if (action.type === ROSTER_DIALOG_CLOSE) {
    return {
      ...state,
      isRosterDialogOpen: false,
    };
  }

  return state;
}
