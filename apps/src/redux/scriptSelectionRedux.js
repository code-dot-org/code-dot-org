import PropTypes from 'prop-types';
import {SET_SECTION} from '@cdo/apps/redux/sectionDataRedux';

// Reducer for script selection in teacher dashboard.
// Tab specific reducers can import actions from this file
// if they need to respond to a script changing.

const DEFAULT_SCRIPT_NAME = 'express-2017';

// Action type constants
export const SET_SCRIPT = 'scriptSelection/SET_SCRIPT';
export const SET_VALID_SCRIPTS = 'scriptSelection/SET_VALID_SCRIPTS';

// Action creators
export const setScriptId = scriptId => ({type: SET_SCRIPT, scriptId});
export const setValidScripts = (
  validScripts
) => ({
  type: SET_VALID_SCRIPTS,
  validScripts,
});

// Selectors
export const getSelectedScriptName = state => {
  const scriptId = state.scriptSelection.scriptId;
  if (!scriptId) {
    return null;
  }

  const scripts = state.scriptSelection.validScripts;
  const script = scripts.find(script => script.id === scriptId);
  return script ? script.script_name : null;
};

/* Get the user friendly name of a script(the unit or course name) */
export const getSelectedScriptFriendlyName = state => {
  const scriptId = state.scriptSelection.scriptId;
  if (!scriptId) {
    return null;
  }

  const scripts = state.scriptSelection.validScripts;
  const script = scripts.find(script => script.id === scriptId);
  return script ? script.name : null;
};

/**
 * Shape for a validScript
 */
export const validScriptPropType = PropTypes.shape({
  category: PropTypes.string.isRequired,
  category_priority: PropTypes.number.isRequired,
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  position: PropTypes.number
});

// Initial state of scriptSelectionRedux
const initialState = {
  scriptId: null,
  validScripts: []
};

export default function scriptSelection(state = initialState, action) {
  if (action.type === SET_SCRIPT) {
    return {
      ...state,
      scriptId: action.scriptId
    };
  }

  if (action.type === SET_SECTION) {
    // Default the scriptId to the script assigned to the section
    const defaultScriptId = action.section.script
      ? action.section.script.id
      : null;
    // Setting the section is the first action to be called when switching
    // sections, which requires us to reset our state. This might need to change
    // once switching sections is in react/redux.
    return {
      ...initialState,
      scriptId: defaultScriptId
    };
  }

  if (action.type === SET_VALID_SCRIPTS) {
    let validScripts = action.validScripts;
    return {
      ...state,
      validScripts
    };
  }

  return state;
}
