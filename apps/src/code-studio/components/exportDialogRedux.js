// Action types

const SHOW_EXPORT_DIALOG = 'exportDialog/SHOW_EXPORT_DIALOG';
const HIDE_EXPORT_DIALOG = 'exportDialog/HIDE_EXPORT_DIALOG';

// Reducer

const initialState = {
  isOpen: false
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case SHOW_EXPORT_DIALOG:
      return {
        ...state,
        ...initialState,
        isOpen: true
      };
    case HIDE_EXPORT_DIALOG:
      return {
        ...state,
        ...initialState
      };
    default:
      return state;
  }
}

// Action creators

export function showExportDialog() {
  return {type: SHOW_EXPORT_DIALOG};
}

export function hideExportDialog() {
  return {type: HIDE_EXPORT_DIALOG};
}
