const SHOW_LIBRARY_CREATION_DIALOG =
  'libraryCreation/SHOW_LIBRARY_CREATION_DIALOG';
const HIDE_LIBRARY_CREATION_DIALOG =
  'libraryCreation/HIDE_LIBRARY_CREATION_DIALOG';
const SET_LIBRARY_SOURCE = 'libraryCreation/SET_LIBRARY_SOURCE';
const SET_LIBRARY_NAME = 'libraryCreation/SET_LIBRARY_NAME';

const initialState = {
  isOpen: false,
  libraryName: '',
  librarySource: ''
};

export default function reducer(state, action) {
  switch (action.type) {
    case SHOW_LIBRARY_CREATION_DIALOG:
      return {
        ...initialState,
        ...state,
        isOpen: true
      };
    case HIDE_LIBRARY_CREATION_DIALOG:
      return {
        ...initialState,
        ...state,
        isOpen: false
      };
    case SET_LIBRARY_SOURCE:
      return {
        ...initialState,
        ...state,
        librarySource: action.source
      };
    case SET_LIBRARY_NAME:
      return {
        ...initialState,
        ...state,
        libraryName: action.name
      };
    default:
      return {
        ...initialState,
        ...state
      };
  }
}

export function showLibraryCreationDialog() {
  return {type: SHOW_LIBRARY_CREATION_DIALOG};
}

export function hideLibraryCreationDialog() {
  return {type: HIDE_LIBRARY_CREATION_DIALOG};
}

export function setLibrarySource(source) {
  return {
    type: SET_LIBRARY_SOURCE,
    source: source
  };
}

export function setLibraryName(name) {
  return {
    type: SET_LIBRARY_NAME,
    name: name
  };
}
