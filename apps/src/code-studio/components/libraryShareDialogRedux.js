const SET_LIBRARY_FUNCTIONS = 'libraryShareDialog/SET_LIBRARY_FUNCTIONS';

export default function reducer(state, action) {
  state = state || {
    libraryFunctions: {}
  };

  switch (action.type) {
    case SET_LIBRARY_FUNCTIONS:
      return {
        ...state,
        libraryFunctions: action.libraryFunctions
      };
    default:
      return state;
  }
}

export function setLibraryFunctions(functions) {
  return {
    type: SET_LIBRARY_FUNCTIONS,
    libraryFunctions: functions
  };
}
