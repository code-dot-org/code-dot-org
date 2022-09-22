// Action types

const SET_EXPORT_GENERATED_PROPERTIES =
  'exportDialog/SET_EXPORT_GENERATED_PROPERTIES';

// Reducer

const initialState = {
  isOpen: false,
  exportGeneratedProperties: {}
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
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
