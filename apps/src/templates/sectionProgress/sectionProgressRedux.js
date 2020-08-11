import {
  NAME_COLUMN_WIDTH,
  PROGRESS_BUBBLE_WIDTH,
  DIAMOND_BUBBLE_WIDTH,
  PILL_BUBBLE_WIDTH
} from './multiGridConstants';
import {SMALL_DOT_SIZE} from '@cdo/apps/templates/progress/progressStyles';
import {SET_SCRIPT} from '@cdo/apps/redux/scriptSelectionRedux';
import {SET_SECTION} from '@cdo/apps/redux/sectionDataRedux';
import firehoseClient from '../../lib/util/firehose';
import {ViewType} from './sectionProgressConstants';

const SET_CURRENT_VIEW = 'sectionProgress/SET_CURRENT_VIEW';
const SET_LESSON_OF_INTEREST = 'sectionProgress/SET_LESSON_OF_INTEREST';
const START_LOADING_PROGRESS = 'sectionProgress/START_LOADING_PROGRESS';
const FINISH_LOADING_PROGRESS = 'sectionProgress/FINISH_LOADING_PROGRESS';
const ADD_DATA_BY_SCRIPT = 'sectionProgress/ADD_DATA_BY_SCRIPT';

// Action creators
export const startLoadingProgress = () => ({type: START_LOADING_PROGRESS});
export const finishLoadingProgress = () => ({type: FINISH_LOADING_PROGRESS});
export const setLessonOfInterest = lessonOfInterest => ({
  type: SET_LESSON_OF_INTEREST,
  lessonOfInterest
});
export const setCurrentView = viewType => ({type: SET_CURRENT_VIEW, viewType});
export const addDataByScript = data => ({
  type: ADD_DATA_BY_SCRIPT,
  data
});

const INITIAL_LESSON_OF_INTEREST = 1;

const initialState = {
  section: {},
  currentView: ViewType.SUMMARY,
  scriptDataByScript: {},
  studentLevelProgressByScript: {},
  studentLevelPairingByScript: {},
  studentTimestampsByScript: {},
  levelsByLessonByScript: {},
  lessonOfInterest: INITIAL_LESSON_OF_INTEREST,
  isLoadingProgress: true
};

export default function sectionProgress(state = initialState, action) {
  if (action.type === SET_SCRIPT) {
    return {
      ...state,
      lessonOfInterest: INITIAL_LESSON_OF_INTEREST
    };
  }
  if (action.type === SET_CURRENT_VIEW) {
    return {
      ...state,
      currentView: action.viewType
    };
  }
  if (action.type === START_LOADING_PROGRESS) {
    return {
      ...state,
      isLoadingProgress: true
    };
  }
  if (action.type === FINISH_LOADING_PROGRESS) {
    return {
      ...state,
      isLoadingProgress: false
    };
  }
  if (action.type === SET_LESSON_OF_INTEREST) {
    return {
      ...state,
      lessonOfInterest: action.lessonOfInterest
    };
  }
  if (action.type === SET_SECTION) {
    // Setting the section is the first action to be called when switching
    // sections, which requires us to reset our state. This might need to change
    // once switching sections is in react/redux.
    return {
      ...initialState
    };
  }
  if (action.type === ADD_DATA_BY_SCRIPT) {
    return {
      ...state,
      scriptDataByScript: {
        ...state.scriptDataByScript,
        ...action.data.scriptDataByScript
      },
      levelsByLessonByScript: {
        ...state.levelsByLessonByScript,
        ...action.data.levelsByLessonByScript
      },
      studentLevelProgressByScript: {
        ...state.studentLevelProgressByScript,
        ...action.data.studentLevelProgressByScript
      },
      studentLevelPairingByScript: {
        ...state.studentLevelPairingByScript,
        ...action.data.studentLevelPairingByScript
      },
      studentTimestampsByScript: {
        ...state.studentTimestampsByScript, // double check that this line should be here... it wasn't before the refactor
        ...action.data.studentTimestampsByScript
      }
    };
  }

  return state;
}

export const jumpToLessonDetails = lessonOfInterest => {
  return (dispatch, getState) => {
    const state = getState();
    dispatch(setLessonOfInterest(lessonOfInterest));
    dispatch(setCurrentView(ViewType.DETAIL));
    firehoseClient.putRecord(
      {
        study: 'teacher_dashboard_actions',
        study_group: 'progress',
        event: 'view_change_toggle',
        data_json: JSON.stringify({
          section_id: state.sectionData.section.id,
          old_view: ViewType.SUMMARY,
          new_view: ViewType.DETAIL,
          script_id: state.scriptSelection.scriptId
        })
      },
      {includeUserId: true}
    );
  };
};

// Selector functions

/**
 * Retrieves the progress for the section in the selected script
 * @returns {number} keys are student ids, values are
 * objects of {levelIds: LevelStatus}
 */
export const getCurrentProgress = state => {
  return state.sectionProgress.studentLevelProgressByScript[
    state.scriptSelection.scriptId
  ];
};

/**
 * Retrieves the script data for the section in the selected script
 * @returns {scriptDataPropType} object containing metadata about the script structure
 */
export const getCurrentScriptData = state => {
  return state.sectionProgress.scriptDataByScript[
    state.scriptSelection.scriptId
  ];
};

/**
 * Retrieves the combined script and progress data for the current scriptId for the entire section.
 */
export const getLevelsByLesson = state => {
  return state.sectionProgress.levelsByLessonByScript[
    state.scriptSelection.scriptId
  ];
};

/**
 * Retrieves the combined script and progress data for student for the stage.
 * This represents the data for a single cell.
 */
export const getLevels = (state, studentId, stageId) => {
  return getLevelsByLesson(state)[studentId][stageId];
};

/**
 * Calculate the width of each column in the detail view based on types of levels
 * @returns {Array} array of integers indicating the length of each column
 */
export const getColumnWidthsForDetailView = state => {
  let columnLengths = [NAME_COLUMN_WIDTH];
  const stages = getCurrentScriptData(state).stages;

  for (let stageIndex = 0; stageIndex < stages.length; stageIndex++) {
    const levels = stages[stageIndex].levels;
    // Left and right padding surrounding bubbles
    let width = 10;
    for (let levelIndex = 0; levelIndex < levels.length; levelIndex++) {
      if (levels[levelIndex].isUnplugged) {
        // Pill shaped bubble
        width = width + PILL_BUBBLE_WIDTH;
      } else if (levels[levelIndex].is_concept_level) {
        // Diamond shaped bubble
        width = width + DIAMOND_BUBBLE_WIDTH;
      } else {
        // Circle bubble
        width = width + PROGRESS_BUBBLE_WIDTH;
      }
      if (levels[levelIndex].sublevels) {
        width =
          width + levels[levelIndex].sublevels.length * SMALL_DOT_SIZE * 2;
      }
    }
    columnLengths.push(width || 0);
  }
  return columnLengths;
};
