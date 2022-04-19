// Reducer for script selection in teacher dashboard.
// Tab specific reducers can import actions from this file
// if they need to respond to a script changing.

// Action type constants
export const SET_SCRIPT = 'unitSelection/SET_SCRIPT';
export const SET_COURSES = 'unitSelection/SET_COURSES';

// Action creators
export const setScriptId = scriptId => ({type: SET_SCRIPT, scriptId});
export const setCoursesWithProgress = coursesWithProgress => ({
  type: SET_COURSES,
  coursesWithProgress
});

// Selectors
const getSelectedUnit = state => {
  const scriptId = state.unitSelection.scriptId;
  if (!scriptId) {
    return null;
  }

  const courses = Object.values(state.unitSelection.coursesWithProgress);
  let script;
  courses.forEach(course => {
    script = Object.values(course.units).find(unit => scriptId === unit.id);
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
  coursesWithProgress: {}
};

export default function unitSelection(state = initialState, action) {
  if (action.type === SET_COURSES) {
    let firstCourse = Object.values(action.coursesWithProgress)[0];

    const firstUnit = firstCourse ? Object.keys(firstCourse.units)[0] : null;

    return {
      ...state,
      coursesWithProgress: action.coursesWithProgress,
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
