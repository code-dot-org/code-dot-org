const SET_LIBRARY_FUNCTIONS = 'libraryShareDialog/SET_LIBRARY_FUNCTIONS';
const SHOW_LIBRARY_SHARE_DIALOG =
  'libraryShareDialog/SHOW_LIBRARY_SHARE_DIALOG';
const HIDE_LIBRARY_SHARE_DIALOG =
  'libraryShareDialog/HIDE_LIBRARY_SHARE_DIALOG';

export default function reducer(state, action) {
  state = state || {
    libraryFunctions: {},
    isOpen: false
  };

  switch (action.type) {
    case SHOW_LIBRARY_SHARE_DIALOG:
      return {
        ...state,
        isOpen: true
      };
    case HIDE_LIBRARY_SHARE_DIALOG:
      return {
        ...state,
        isOpen: false
      };
    case SET_LIBRARY_FUNCTIONS:
      return {
        ...state,
        libraryFunctions: action.libraryFunctions
      };
    default:
      return state;
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
