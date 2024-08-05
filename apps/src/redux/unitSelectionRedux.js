// Reducer for script selection in teacher dashboard.
// Tab specific reducers can import actions from this file
// if they need to respond to a script changing.

// Action type constants
export const SET_SCRIPT = 'unitSelection/SET_SCRIPT';
export const SET_COURSES = 'unitSelection/SET_COURSES';

export const START_LOADING_COURSES = 'unitSelection/START_LOADING_COURSES';
export const FINISHED_LOADING_COURSES =
  'unitSelection/FINISHED_LOADING_COURSES';

// Action creators
export const setScriptId = scriptId => ({type: SET_SCRIPT, scriptId});
export const setCoursesWithProgress = coursesWithProgress => ({
  type: SET_COURSES,
  coursesWithProgress,
});

export const startLoadingCoursesWithProgress = () => ({
  type: START_LOADING_COURSES,
});
export const finishedLoadingCoursesWithProgress = () => ({
  type: FINISHED_LOADING_COURSES,
});

// Selectors
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

export const doesCurrentCourseUseFeedback = state => {
  return !!getSelectedUnit(state)?.is_feedback_enabled;
};

export const asyncLoadCoursesWithProgress = () => (dispatch, getState) => {
  const state = getState();
  const selectedSection =
    state.teacherSections.sections[state.teacherSections.selectedSectionId];

  if (state.unitSelection.isLoadingCoursesWithProgress || !selectedSection) {
    return;
  }

  dispatch(startLoadingCoursesWithProgress());

  fetch(`/dashboardapi/section_courses/${selectedSection.id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`Error(${response.status}: ${response.statusText})`);
      }

      return response.json();
    })
    .then(coursesWithProgress => {
      // Reorder coursesWithProgress so that the current section is at the top and other sections are in order from newest to oldest
      const reorderedCourses = [
        ...coursesWithProgress.filter(
          course => course.id !== selectedSection.course_version_id
        ),
        ...coursesWithProgress.filter(
          course => course.id === selectedSection.course_version_id
        ),
      ].reverse();
      dispatch(setCoursesWithProgress(reorderedCourses));
      dispatch(finishedLoadingCoursesWithProgress());
    })
    .catch(err => {
      console.error(err.message);
      dispatch(finishedLoadingCoursesWithProgress());
    });
};

// Initial state of unitSelectionRedux
const initialState = {
  scriptId: null,
  coursesWithProgress: [],
  isLoadingCoursesWithProgress: false,
};

export default function unitSelection(state = initialState, action) {
  if (action.type === SET_COURSES) {
    let firstCourse = action.coursesWithProgress[0];

    const firstUnit = firstCourse ? firstCourse.units[0] : null;

    return {
      ...state,
      coursesWithProgress: action.coursesWithProgress,
      scriptId: state.scriptId === null ? firstUnit?.id : state.scriptId,
    };
  }

  if (action.type === SET_SCRIPT) {
    return {
      ...state,
      scriptId: action.scriptId,
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

  return state;
}
