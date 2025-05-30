// Reducer for script selection in teacher dashboard.
// Tab specific reducers can import actions from this file
// if they need to respond to a script changing.

import HttpClient from '../util/HttpClient';

// Action type constants
export const SET_SCRIPT = 'unitSelection/SET_SCRIPT';
export const SET_COURSE_ID = 'unitSelection/SET_COURSE';
export const SET_POSITION = 'unitSelection/SET_POSITION';
export const SET_UNIT_NAME = 'unitSelection/SET_UNIT_NAME';
export const SET_COURSES = 'unitSelection/SET_COURSES';

export const START_LOADING_COURSES = 'unitSelection/START_LOADING_COURSES';
export const FINISHED_LOADING_COURSES =
  'unitSelection/FINISHED_LOADING_COURSES';

const SET_LOADED_SECTION_ID = 'unitSelection/SET_LOADED_SECTION_ID';

// Action creators
export const setScriptId = scriptId => {
  console.trace('setScriptId called with:', scriptId);
  return {type: SET_SCRIPT, scriptId};
};
export const setCourseId = courseId => ({type: SET_COURSE_ID, courseId});
export const setUnitPosition = unitPosition => ({
  type: SET_POSITION,
  unitPosition,
});

export const setCoursesWithProgress = coursesWithProgress => {
  console.trace('setScriptId called with:', coursesWithProgress);
  return {type: SET_COURSES, coursesWithProgress};
};
export const setLoadedSectionId = loadedSectionId => ({
  type: SET_LOADED_SECTION_ID,
  loadedSectionId,
});

export const startLoadingCoursesWithProgress = () => ({
  type: START_LOADING_COURSES,
});
export const finishedLoadingCoursesWithProgress = () => ({
  type: FINISHED_LOADING_COURSES,
});

// Selectors
export const getSelectedUnitId = state => state.unitSelection.scriptId;
export const getSelectedCourseId = state => state.unitSelection.courseId;
export const getSelectedUnitPosition = state =>
  state.unitSelection.unitPosition;

const getSelectedUnit = state => {
  const scriptId = state.unitSelection.scriptId;
  if (!scriptId) {
    return null;
  }

  let unit;
  state.unitSelection.coursesWithProgress.forEach(course => {
    const tempUnit = course.units.find(unit => scriptId === unit.id);
    if (tempUnit) {
      unit = tempUnit;
    }
  });
  return unit;
};

export const getSelectedUnitName = state => {
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

export const doesCurrentCourseUseFeedback = state => {
  return !!getSelectedUnit(state)?.is_feedback_enabled;
};

export const asyncLoadCoursesWithProgress = () => (dispatch, getState) => {
  const state = getState();
  const selectedSection =
    state.teacherSections.sections[state.teacherSections.selectedSectionId];

  if (
    state.unitSelection.isLoadingCoursesWithProgress ||
    !selectedSection ||
    state.unitSelection.loadedSectionId === selectedSection.id
  ) {
    return;
  }
  dispatch(startLoadingCoursesWithProgress());

  HttpClient.fetchJson(`/dashboardapi/section_courses/${selectedSection.id}`)
    .then(response => response?.value)
    .then(coursesWithProgress => {
      console.log(coursesWithProgress);
      // Reorder coursesWithProgress so that the current section is at the top and other sections are in order from newest to oldest
      const reorderedCourses = [
        ...coursesWithProgress.filter(
          course => course.id !== selectedSection.courseVersionId
        ),
        ...coursesWithProgress.filter(
          course => course.id === selectedSection.courseVersionId
        ),
      ].reverse();
      dispatch(setCoursesWithProgress(reorderedCourses));
      dispatch(finishedLoadingCoursesWithProgress());
      dispatch(setLoadedSectionId(selectedSection.id));
    })
    .catch(err => {
      console.error(err.message);
      dispatch(finishedLoadingCoursesWithProgress());
    });
};

// Initial state of unitSelectionRedux
const initialState = {
  scriptId: null,
  courseId: null,
  unitPosition: null,
  coursesWithProgress: [],
  isLoadingCoursesWithProgress: false,
  loadedSectionId: null,
};

export default function unitSelection(state = initialState, action) {
  if (action.type === SET_COURSES) {
    let firstCourse = action.coursesWithProgress[0];

    const firstUnit = firstCourse ? firstCourse.units[0] : null;

    return {
      ...state,
      coursesWithProgress: action.coursesWithProgress,
      // This automatically selects the first unit of the first course
      // unless a scriptId is already set
      scriptId: state.scriptId === null ? firstUnit?.id : state.scriptId,
      // Also set courseId and position if selecting first unit
      courseId: state.scriptId === null ? firstUnit?.course_id : state.courseId,
      unitPosition:
        state.scriptId === null ? firstUnit?.position : state.unitPosition,
    };
  }

  if (action.type === SET_SCRIPT) {
    return {
      ...state,
      scriptId: action.scriptId,
    };
  }

  if (action.type === SET_COURSE_ID) {
    return {
      ...state,
      courseId: action.courseId,
    };
  }
  if (action.type === SET_POSITION) {
    return {
      ...state,
      unitPosition: action.unitPosition,
    };
  }

  if (action.type === START_LOADING_COURSES) {
    return {
      ...state,
      isLoadingCoursesWithProgress: true,
    };
  }

  if (action.type === FINISHED_LOADING_COURSES) {
    return {
      ...state,
      isLoadingCoursesWithProgress: false,
    };
  }

  if (action.type === SET_LOADED_SECTION_ID) {
    return {
      ...state,
      loadedSectionId: action.loadedSectionId,
    };
  }

  return state;
}
