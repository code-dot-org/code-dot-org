// Action types

const SHOW_EXPORT_DIALOG = 'exportDialog/SHOW_EXPORT_DIALOG';
const HIDE_EXPORT_DIALOG = 'exportDialog/HIDE_EXPORT_DIALOG';
const SET_EXPORT_GENERATED_PROPERTIES =
  'exportDialog/SET_EXPORT_GENERATED_PROPERTIES';

// Reducer

const initialState = {
  isOpen: false,
  exportGeneratedProperties: {}
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case SHOW_EXPORT_DIALOG:
      return {
        ...state,
        isOpen: true
      };
    case HIDE_EXPORT_DIALOG:
      return {
        ...state,
        isOpen: false
      };
    case SET_EXPORT_GENERATED_PROPERTIES:
      return {
        ...state,
        exportGeneratedProperties: action.exportGeneratedProperties
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

/**
 * Set the generated properties
 * @param {object} exportGeneratedProperties
 * @returns {{type: string, exportGeneratedProperties: object}}
 */
export function setExportGeneratedProperties(exportGeneratedProperties) {
  return {
    type: SET_EXPORT_GENERATED_PROPERTIES,
    exportGeneratedProperties
  };
}
