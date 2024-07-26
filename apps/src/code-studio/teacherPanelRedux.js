import $ from 'jquery';
import queryString from 'query-string';

import {getCurrentLevel} from './progressReduxSelectors';

const SET_LEVELS_WITH_PROGRESS = 'progress/SET_LEVELS_WITH_PROGRESS';
const SET_LOADING_LEVELS_WITH_PROGRESS =
  'progress/SET_LOADING_LEVELS_WITH_PROGRESS';

const initialState = {
  isLoadingLevelsWithProgress: false,
  levelsWithProgress: [],
};

export default function reducer(state = initialState, action) {
  if (action.type === SET_LEVELS_WITH_PROGRESS) {
    return {
      ...state,
      levelsWithProgress: action.levelsWithProgress,
    };
  }

  if (action.type === SET_LOADING_LEVELS_WITH_PROGRESS) {
    return {
      ...state,
      isLoadingLevelsWithProgress: action.isLoading,
    };
  }

  return state;
}

const setLevelsWithProgress = levelsWithProgress => ({
  type: SET_LEVELS_WITH_PROGRESS,
  levelsWithProgress,
});

const setLoadingLevelsWithProgress = isLoading => ({
  type: SET_LOADING_LEVELS_WITH_PROGRESS,
  isLoading,
});

export const loadLevelsWithProgress = () => (dispatch, getState) => {
  const state = getState();

  if (!state.teacherSections.selectedSectionId) {
    return;
  }

  dispatch(setLoadingLevelsWithProgress(true));

  const queryParams = getLevelProgressQueryParams(state);

  const baseUrl = `/api/teacher_panel_progress/${state.teacherSections.selectedSectionId}`;

  return $.ajax({
    url: baseUrl + '?' + queryString.stringify(queryParams),
    method: 'GET',
  })
    .done(data => {
      dispatch(setLevelsWithProgress(data));
      dispatch(setLoadingLevelsWithProgress(false));
    })
    .fail(err => {
      console.log(
        `Failed to update teacher panel (${err.status}) ${err.statusText}`
      );
      dispatch(setLoadingLevelsWithProgress(false));
    });
};

const getLevelProgressQueryParams = state => {
  if (state.progress.isLessonExtras) {
    return {
      lesson_id: state.progress.currentLessonId,
      is_lesson_extras: true,
      script_id: state.progress.scriptId,
    };
  } else {
    const currentLevel = getCurrentLevel(state);
    // If we are on a sublevel, use the level ID of the main (parent) level
    return {
      script_id: state.progress.scriptId,
      level_id: currentLevel?.parentLevelId || state.progress.currentLevelId,
    };
  }
};
