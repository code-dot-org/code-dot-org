// Reducer for script selection in teacher dashboard.
// Tab specific reducers can import actions from this file
// if they need to respond to a script changing.

import HttpClient from '../util/HttpClient';

// Action type constants
export const SET_UNIT = 'unitSelection/SET_UNIT';
export const SET_COURSES = 'unitSelection/SET_COURSES';

export const START_LOADING_COURSES = 'unitSelection/START_LOADING_COURSES';
export const FINISHED_LOADING_COURSES =
  'unitSelection/FINISHED_LOADING_COURSES';

const SET_LOADED_SECTION_ID = 'unitSelection/SET_LOADED_SECTION_ID';

// Action creators
export const setUnit = (scriptId, courseVersionId) => ({
  type: SET_UNIT,
  scriptId,
  courseVersionId,
});
export const setCoursesWithProgress = coursesWithProgress => ({
  type: SET_COURSES,
  coursesWithProgress,
});
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
export const getSelectedCourseVersionId = state =>
  state.unitSelection.courseVersionId;

export const getSelectedCourseVersion = state => {
  const courseVersionId = getSelectedCourseVersionId(state);
  return state.unitSelection.coursesWithProgress.find(
    c => c.id === courseVersionId
  );
};

export const getSelectedCourseName = state => {
  return getSelectedCourseVersion(state)?.course_name || null;
};

const getSelectedUnit = state => {
  const courseVersionId = getSelectedCourseVersionId(state);
  const unitId = getSelectedUnitId(state);
  if (!courseVersionId || !unitId) {
    return null;
  }

  const course = state.unitSelection.coursesWithProgress.find(
    course => course.id === courseVersionId
  );
  return course?.units.find(unit => unitId === unit.id);
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

export const getSelectedUnitPosition = state => {
  return getSelectedUnit(state) ? getSelectedUnit(state).position : null;
};

export const getSelectedCourseId = state => {
  return getSelectedUnit(state) ? getSelectedUnit(state).course_id : null;
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
  courseVersionId: null,
  coursesWithProgress: [],
  isLoadingCoursesWithProgress: false,
  loadedSectionId: null,
};

export default function unitSelection(state = initialState, action) {
  if (action.type === SET_COURSES) {
    let firstCourse = action.coursesWithProgress[0];

    const firstUnit = firstCourse ? firstCourse.units[0] : null;

    // If the currently selected Unit is the new set of coursesWithProgress,
    // then default to selecting the first Unit.
    let scriptId = firstUnit?.id;
    let courseVersionId = firstCourse?.id;
    if (state.scriptId && state.courseVersionId) {
      const selectedUnit = action.coursesWithProgress.find(
        course => course.id === state.courseVersionId
      );
      if (selectedUnit) {
        const selectedUnitIndex = selectedUnit.units.findIndex(
          unit => unit.id === state.scriptId
        );
        if (selectedUnitIndex >= 0) {
          scriptId = state.scriptId;
          courseVersionId = state.courseVersionId;
        }
      }
    }

    return {
      ...state,
      coursesWithProgress: action.coursesWithProgress,
      scriptId: scriptId,
      courseVersionId: courseVersionId,
    };
  }

  if (action.type === SET_UNIT) {
    return {
      ...state,
      scriptId: action.scriptId,
      courseVersionId: action.courseVersionId,
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
