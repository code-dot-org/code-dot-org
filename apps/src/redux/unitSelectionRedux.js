// Reducer for script selection in teacher dashboard.
// Tab specific reducers can import actions from this file
// if they need to respond to a script changing.

// Action type constants
export const SET_SCRIPT = 'unitSelection/SET_SCRIPT';
export const SET_COURSE_VERSIONS = 'unitSelection/SET_COURSE_VERSIONS';

// Action creators
export const setScriptId = scriptId => ({type: SET_SCRIPT, scriptId});
export const setCourseVersionsWithProgress = courseVersionsWithProgress => ({
  type: SET_COURSE_VERSIONS,
  courseVersionsWithProgress
});

// Selectors
const getSelectedUnit = state => {
  const scriptId = state.unitSelection.scriptId;
  if (!scriptId) {
    return null;
  }

  const versions = Object.values(
    state.unitSelection.courseVersionsWithProgress
  );
  let script;
  versions.forEach(version => {
    script = Object.values(version.units).find(unit => scriptId === unit.id);
  });
  return script;
};

export const getSelectedScriptName = state => {
  return getSelectedUnit(state) ? getSelectedUnit(state).key : null;
};

/* Get the user friendly name of a script(the unit or course name) */
export const getSelectedScriptFriendlyName = state => {
  return getSelectedUnit(state) ? getSelectedUnit(state).name : null;
};

/* Get the description of a script(the unit or course name) */
export const getSelectedScriptDescription = state => {
  return getSelectedUnit(state) ? getSelectedUnit(state).description : null;
};

// Initial state of unitSelectionRedux
const initialState = {
  scriptId: null,
  courseVersionsWithProgress: {}
};

export default function unitSelection(state = initialState, action) {
  if (action.type === SET_COURSE_VERSIONS) {
    let firstCourseVersion = Object.values(
      action.courseVersionsWithProgress
    )[0];

    const firstUnit = firstCourseVersion
      ? Object.keys(firstCourseVersion.units)[0]
      : null;

    return {
      ...state,
      courseVersionsWithProgress: action.courseVersionsWithProgress,
      scriptId: state.scriptId === null ? firstUnit : state.scriptId
    };
  }

  if (action.type === SET_SCRIPT) {
    return {
      ...state,
      scriptId: action.scriptId
    };
  }

  return state;
}
