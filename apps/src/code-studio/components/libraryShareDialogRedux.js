const SET_LIBRARY_FUNCTIONS = 'libraryShareDialog/SET_LIBRARY_FUNCTIONS';
const SHOW_LIBRARY_SHARE_DIALOG =
  'libraryShareDialog/SHOW_LIBRARY_SHARE_DIALOG';
const HIDE_LIBRARY_SHARE_DIALOG =
  'libraryShareDialog/HIDE_LIBRARY_SHARE_DIALOG';
const SET_LIBRARY_NAME = 'libraryShareDialog/SET_LIBRARY_NAME';
const SET_LIBRARY_SOURCE = 'libraryShareDialog/SET_LIBRARY_SOURCE';
const SET_CONTAINS_ERROR = 'libraryShareDialog/SET_CONTAINS_ERROR';

const initialState = {
  libraryFunctions: [],
  isOpen: false,
  libraryName: '',
  librarySource: '',
  containsError: false
};

export default function reducer(state, action) {
  switch (action.type) {
    case SHOW_LIBRARY_SHARE_DIALOG:
      return {
        ...initialState,
        ...state,
        isOpen: true
      };
    case HIDE_LIBRARY_SHARE_DIALOG:
      return {
        ...initialState,
        ...state,
        isOpen: false
      };
    case SET_LIBRARY_FUNCTIONS:
      return {
        ...initialState,
        ...state,
        libraryFunctions: action.libraryFunctions
      };
    case SET_LIBRARY_NAME:
      return {
        ...initialState,
        ...state,
        libraryName: action.libraryName
      };
    case SET_LIBRARY_SOURCE:
      return {
        ...initialState,
        ...state,
        librarySource: action.librarySource
      };
    case SET_CONTAINS_ERROR:
      return {
        ...initialState,
        ...state,
        containsError: action.containsError
      };
    default:
      return {
        ...initialState,
        ...state
      };
  }
}

export function showLibraryShareDialog() {
  return {type: SHOW_LIBRARY_SHARE_DIALOG};
}

export function hideLibraryShareDialog() {
  return {type: HIDE_LIBRARY_SHARE_DIALOG};
}

export function setLibraryFunctions(functions) {
  return {
    type: SET_LIBRARY_FUNCTIONS,
    libraryFunctions: functions
  };
}

export function setLibraryName(name) {
  return {
    type: SET_LIBRARY_NAME,
    libraryName: name
  };
}

export function setLibrarySource(source) {
  return {
    type: SET_LIBRARY_SOURCE,
    librarySource: source
  };
}

export function setContainsError(containsError) {
  return {
    type: SET_CONTAINS_ERROR,
    containsError: containsError
  };
}
