const ADD_LIBRARY = 'applabLibrary/ADD_LIBRARY';
const SET_LIBRARIES = 'applabLibrary/SET_LIBRARIES';

export default function reducer(state, action) {
  var currentState = state || {libraries: []};
  switch (action.type) {
    case SET_LIBRARIES:
      return {
        libraries: action.libraries || []
      };
    case ADD_LIBRARY:
      // For now (during the pilot), you can only import one library at a time.
      return {
        libraries: [action.library]
      };
    default:
      return currentState;
  }
}

export function setApplabLibraries(libraries) {
  return {
    type: SET_LIBRARIES,
    libraries: libraries
  };
}

export function addApplabLibrary(library) {
  return {
    type: ADD_LIBRARY,
    library: library
  };
}
