// Action types
const SHOW_PROJECT_INFO_DIALOG = 'projectInfoDialog/SHOW_PUBLISH_DIALOG';
const HIDE_PROJECT_INFO_DIALOG = 'projectInfoDialog/HIDE_PUBLISH_DIALOG';

// Reducer
const initialState = {
  isOpen: false,
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case SHOW_PROJECT_INFO_DIALOG:
      return {
        ...state,
        isOpen: true,
      };
    case HIDE_PROJECT_INFO_DIALOG:
      return {
        ...state,
        isOpen: false,
      };
    default:
      return state;
  }
}

// Action creators

export function showProjectInfoDialog() {
  return {type: SHOW_PROJECT_INFO_DIALOG};
}

export function hideProjectInfoDialog() {
  return {type: HIDE_PROJECT_INFO_DIALOG};
}
