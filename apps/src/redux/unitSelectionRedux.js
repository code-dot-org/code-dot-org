// Reducer for script selection in teacher dashboard.
// Tab specific reducers can import actions from this file
// if they need to respond to a script changing.

// Action type constants
export const SET_SCRIPT = 'unitSelection/SET_SCRIPT';
export const SET_COURSE_VERSIONS = 'unitSelection/SET_COURSE_VERSIONS';

// Action creators
export const setCourseSelection = (
  courseOfferingId,
  courseVersionId,
  unitId
) => ({type: SET_SCRIPT, courseOfferingId, courseVersionId, unitId});
export const setCourseVersionsWithProgress = courseVersionsWithProgress => ({
  type: SET_COURSE_VERSIONS,
  courseVersionsWithProgress
});

// Selectors
const getSelectedUnit = state => {
  const unitId = state.unitSelection.unitId;
  if (!unitId) {
    return null;
  }

  const offering =
    state.unitSelection.courseVersionsWithProgress[state.courseOfferingId];
  const version = offering?.course_versions[state.courseVersionId];
  return version?.units[state.unitId];
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
  courseOfferingId: null,
  courseVersionId: null,
  unitId: null,
  courseVersionsWithProgress: {}
};

export default function unitSelection(state = initialState, action) {
  if (action.type === SET_COURSE_VERSIONS) {
    let firstCourseOffering = Object.values(
      action.courseVersionsWithProgress
    )[0];
    let firstCourseVersion = Object.values(
      firstCourseOffering.course_versions
    )[0];

    return {
      ...state,
      courseVersionsWithProgress: action.courseVersionsWithProgress,
      courseOfferingId: firstCourseOffering.id,
      courseVersionId: firstCourseVersion.id,
      unitId:
        state.unitId === null && firstCourseOffering && firstCourseVersion
          ? Object.keys(firstCourseVersion.units)[0]
          : state.unitId
    };
  }

  if (action.type === SET_SCRIPT) {
    return {
      ...state,
      courseOfferingId: action.courseOfferingId,
      courseVersionId: action.courseVersionId,
      unitId: action.unitId
    };
  }

  return state;
}
