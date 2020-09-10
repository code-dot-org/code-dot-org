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
  validScripts,
  studentScriptIds,
  validCourses,
  selectedSection
) => ({
  type: SET_VALID_SCRIPTS,
  validScripts,
  studentScriptIds,
  validCourses,
  selectedSection
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

/* Get the description of a script(the unit or course name) */
export const getSelectedScriptDescription = state => {
  const scriptId = state.scriptSelection.scriptId;
  if (!scriptId) {
    return null;
  }

  const scripts = state.scriptSelection.validScripts;
  const script = scripts.find(script => script.id === scriptId);
  return script ? script.description : null;
};

/**
 * Shape for a validScript
 */
export const validScriptPropType = PropTypes.shape({
  category: PropTypes.string.isRequired,
  category_priority: PropTypes.number.isRequired,
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  position: PropTypes.number,
  description: PropTypes.string
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

  // Note: This listens to the sectionData redux, not the scriptSelection redux.
  if (action.type === SET_SECTION) {
    // Default the scriptId to the script assigned to the section
    const defaultScriptId = action.section.script
      ? action.section.script.id
      : null;

    return {
      ...state,
      scriptId: defaultScriptId
    };
  }

  if (action.type === SET_VALID_SCRIPTS) {
    // Computes the set of valid scripts.
    let validScripts = action.validScripts;
    // Set defaultScript to Express Course to use if there are no validScripts
    const defaultScript = validScripts.find(
      script => script.script_name === DEFAULT_SCRIPT_NAME
    );

    if (action.studentScriptIds && action.validCourses) {
      const idMap = {};
      let actionScriptId =
        action.selectedSection &&
        action.selectedSection.script &&
        action.selectedSection.script.id;
      if (!!actionScriptId) {
        idMap[actionScriptId] = true;
      }
      // First, construct an id map consisting only of script ids which a
      // student has participated in.
      action.studentScriptIds.forEach(id => (idMap[id] = true));

      // If the student has participated in a script which is a unit in a
      // course, or if this section is assigned to a course, make sure that
      // all units in that course are included.
      action.validCourses.forEach(course => {
        if (
          course.script_ids.some(id => idMap[id]) ||
          (action.selectedSection &&
            action.selectedSection.course_id === course.id)
        ) {
          course.script_ids.forEach(id => (idMap[id] = true));
        }
      });
      validScripts = validScripts.filter(script => idMap[script.id]);
      // If we filter out everything, add the defaultScript to validScripts
      // to avoid having an empty dropdown menu.
      if (validScripts.length === 0) {
        validScripts.push(defaultScript);
      }

      // Uses the set of valid scripts to determine the current scriptId.
      var scriptId;
      switch (true) {
        // When there is a scriptId already in state.
        case !!state.scriptId:
          scriptId = state.scriptId;
          break;
        // When there is an assigned course, set scriptId to the first script in the assigned course.
        case !!(action.selectedSection && action.selectedSection.course_id):
          action.validCourses.forEach(course => {
            if (course.id === action.selectedSection.course_id) {
              scriptId = course.script_ids[0];
            }
          });
          break;
        // Set scriptId to the first valid script.  If there weren't any
        // valid scripts, this will be the default script.
        default:
          scriptId = validScripts[0].id;
      }
    }

    return {
      ...state,
      validScripts,
      scriptId: scriptId
    };
  }

  return state;
}
