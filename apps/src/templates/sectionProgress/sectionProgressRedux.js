import { getLevelResult, levelsByLesson } from '@cdo/apps/code-studio/progressRedux';
import { processedLevel } from '@cdo/apps/templates/progress/progressHelpers';
import { PropTypes } from 'react';
import {
  NAME_COLUMN_WIDTH,
  PROGRESS_BUBBLE_WIDTH,
  DIAMOND_BUBBLE_WIDTH,
  PILL_BUBBLE_WIDTH,
} from './multiGridConstants';
import _ from 'lodash';
import {SET_SCRIPT} from '@cdo/apps/redux/scriptSelectionRedux';
import {SET_SECTION} from '@cdo/apps/redux/sectionDataRedux';

const SET_CURRENT_VIEW = 'sectionProgress/SET_CURRENT_VIEW';
const SET_LESSON_OF_INTEREST = 'sectionProgress/SET_LESSON_OF_INTEREST';
const ADD_SCRIPT_DATA = 'sectionProgress/ADD_SCRIPT_DATA';
const ADD_STUDENT_LEVEL_PROGRESS = 'sectionProgress/ADD_STUDENT_LEVEL_PROGRESS';
const ADD_STUDENT_LEVEL_PAIRING = 'sectionProgress/ADD_STUDENT_LEVEL_PAIRING';
const START_LOADING_PROGRESS = 'sectionProgress/START_LOADING_PROGRESS';
const FINISH_LOADING_PROGRESS = 'sectionProgress/FINISH_LOADING_PROGRESS';
const ADD_LEVELS_BY_LESSON = 'sectionProgress/ADD_LEVELS_BY_LESSON';

// Action creators
export const startLoadingProgress = () => ({ type: START_LOADING_PROGRESS});
export const finishLoadingProgress = () => ({ type: FINISH_LOADING_PROGRESS});
export const setLessonOfInterest = lessonOfInterest => ({ type: SET_LESSON_OF_INTEREST, lessonOfInterest});
export const setCurrentView = viewType => ({ type: SET_CURRENT_VIEW, viewType });
export const addLevelsByLesson = (scriptId, levelsByLesson) => (
  { type: ADD_LEVELS_BY_LESSON, scriptId, levelsByLesson}
);
export const addScriptData = (scriptId, scriptData) => {
  // Filter to match scriptDataPropType
  const filteredScriptData = {
    id: scriptData.id,
    excludeCsfColumnInLegend: scriptData.excludeCsfColumnInLegend,
    title: scriptData.title,
    path: scriptData.path,
    stages: scriptData.stages,
  };
  return { type: ADD_SCRIPT_DATA, scriptId, scriptData: filteredScriptData };
};
export const addStudentLevelProgress = (scriptId, studentLevelProgress) => ({
  type: ADD_STUDENT_LEVEL_PROGRESS, scriptId, studentLevelProgress
});
export const addStudentLevelPairing = (scriptId, studentLevelPairing) => {
  const data = studentLevelPairing;
  const isValid = Object.keys(data).every((userId) => (
    Object.keys(data[userId]).every((levelId) => (
      typeof data[userId][levelId] === "boolean"
    ))
 ));
  if (!isValid) {
    throw new Error("Input is invalid");
  }

  return {
    type: ADD_STUDENT_LEVEL_PAIRING, scriptId, studentLevelPairing
  };
};

export const jumpToLessonDetails = (lessonOfInterest) => {
  return (dispatch, getState) => {
    dispatch(setLessonOfInterest(lessonOfInterest));
    dispatch(setCurrentView(ViewType.DETAIL));
  };
};
export const processScriptAndProgress = (scriptId) => {
  return (dispatch, getState) => {
    const state = getState().sectionProgress;
    const studentLevelProgress = state.studentLevelProgressByScript[scriptId];
    const studentLevelPairing = state.studentLevelPairingByScript[scriptId];
    const scriptData = state.scriptDataByScript[scriptId];
    let levelsByLessonByStudent = {};
    for (const studentId of Object.keys(studentLevelProgress)) {
      levelsByLessonByStudent[studentId] = levelsByLesson({
        stages: scriptData.stages,
        levelProgress: studentLevelProgress[studentId],
        levelPairing: studentLevelPairing[studentId],
        currentLevelId: null
      });
    }

    dispatch(addLevelsByLesson(scriptId, levelsByLessonByStudent));
    dispatch(finishLoadingProgress());
  };
};

const NUM_STUDENTS_PER_PAGE = 50;

// Types of views of the progress tab
export const ViewType = {
  SUMMARY: "summary",
  DETAIL: "detail",
};

/**
 * Shape for scriptData
 * The data we get from the server's call to script.summarize. The format
 * ends up being similar to that which we send to initProgress in progressRedux.
 * The important part is scriptData.stages, which gets used by levelsWithLesson
 */
export const scriptDataPropType = PropTypes.shape({
  id: PropTypes.number.isRequired,
  excludeCsfColumnInLegend: PropTypes.bool,
  title: PropTypes.string,
  path: PropTypes.string,
  stages: PropTypes.arrayOf(PropTypes.shape({
    levels: PropTypes.arrayOf(PropTypes.object).isRequired
  })),
});

/**
 * Shape for studentLevelProgress
 * For each student id, has a mapping from level id to the student's result
 * on that level
 */
export const studentLevelProgressPropType = PropTypes.objectOf(
  PropTypes.objectOf(PropTypes.number)
);

const INITIAL_LESSON_OF_INTEREST = 1;

const initialState = {
  section: {},
  currentView: ViewType.SUMMARY,
  scriptDataByScript: {},
  studentLevelProgressByScript: {},
  studentLevelPairingByScript: {},
  levelsByLessonByScript: {},
  lessonOfInterest: INITIAL_LESSON_OF_INTEREST,
  isLoadingProgress: true,
};

export default function sectionProgress(state=initialState, action) {
  if (action.type === SET_SCRIPT) {
    return {
      ...state,
      lessonOfInterest: INITIAL_LESSON_OF_INTEREST,
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
      ...initialState,
    };
  }
  if (action.type === ADD_SCRIPT_DATA) {
    return {
      ...state,
      scriptDataByScript: {
        ...state.scriptDataByScript,
        [action.scriptId]: action.scriptData,
      }
    };
  }
  if (action.type === ADD_LEVELS_BY_LESSON) {
    return {
      ...state,
      levelsByLessonByScript: {
        ...state.levelsByLessonByScript,
        [action.scriptId]: action.levelsByLesson,
      }
    };
  }
  if (action.type === ADD_STUDENT_LEVEL_PROGRESS) {
    return {
      ...state,
      studentLevelProgressByScript: {
        ...state.studentLevelProgressByScript,
        [action.scriptId]: {
          ...state.studentLevelProgressByScript[action.scriptId],
          ...action.studentLevelProgress,
        },
      }
    };
  }
  if (action.type === ADD_STUDENT_LEVEL_PAIRING) {
    return {
      ...state,
      studentLevelPairingByScript: {
        ...state.studentLevelPairingByScript,
        [action.scriptId]: {
          ...state.studentLevelPairingByScript[action.scriptId],
          ...action.studentLevelPairing,
        },
      }
    };
  }

  return state;
}

// Selector functions

/**
  * Retrieves the progress for the section in the selected script
  * @returns {studentLevelProgressPropType} keys are student ids, values are
  * objects of {levelIds: LevelStatus}
  */
export const getCurrentProgress = (state) => {
  return state.sectionProgress.studentLevelProgressByScript[state.scriptSelection.scriptId];
};

/**
 * Retrieves the script data for the section in the selected script
 * @returns {scriptDataPropType} object containing metadata about the script structure
 */
export const getCurrentScriptData = (state) => {
  const script = state.sectionProgress.scriptDataByScript[state.scriptSelection.scriptId];

  if (script) {
    const stages = script.stages.map(stage => {
      return {
        ...stage,
        levels: stage.levels.map(level => {
          return processedLevel(level);
        })
      };
    });
    return {
      ...script,
      stages: stages,
    };
  }

  return script;
};

/**
 * Retrieves the combined script and progress data for the current scriptId for the entire section.
 */
export const getLevelsByLesson = (state) => {
  return state.sectionProgress.levelsByLessonByScript[state.scriptSelection.scriptId];
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
export const getColumnWidthsForDetailView = (state) => {
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
    }
    columnLengths.push(width || 0);
  }
  return columnLengths;
};


/**
 * Query the server for script data (info about the levels in the script) and
 * also for user progress on that script
 * @param {string} scriptId to load data for
 */
export const loadScript = (scriptId) => {
  return (dispatch, getState) => {
    const state = getState().sectionProgress;
    const sectionData = getState().sectionData.section;

    // Don't load data if it's already stored in redux.
    if (state.studentLevelProgressByScript[scriptId] && state.scriptDataByScript[scriptId]) {
      return;
    }

    dispatch(startLoadingProgress());
    const scriptRequest = fetch(`/dashboardapi/script_structure/${scriptId}`, {credentials: 'include'})
      .then(response => response.json())
      .then((scriptData) => {
        dispatch(addScriptData(scriptId, scriptData));
      });

    const numStudents = sectionData.students.length;
    const numPages = Math.ceil(numStudents / NUM_STUDENTS_PER_PAGE);

    const requests = _.range(1, numPages + 1).map((currentPage) => {
      const url = `/dashboardapi/section_level_progress/${sectionData.id}?script_id=${scriptId}&page=${currentPage}&per=${NUM_STUDENTS_PER_PAGE}`;
      return fetch(url, { credentials: 'include' })
        .then(response => response.json())
        .then((data) => {
          const dataByStudent = data.students;
          dispatch(addStudentLevelProgress(scriptId, getStudentLevelResult(dataByStudent)));
          dispatch(addStudentLevelPairing(scriptId, getStudentPairing(dataByStudent)));
        });
    });

    requests.push(scriptRequest);
    Promise.all(requests).then(() => dispatch(processScriptAndProgress(scriptId)));
  };
};

export function getStudentPairing(dataByStudent) {
  return getInfoByStudentByLevel(dataByStudent, levelData => !!levelData.paired);
}

export function getStudentLevelResult(dataByStudent) {
  return getInfoByStudentByLevel(dataByStudent, getLevelResult);
}

function getInfoByStudentByLevel(dataByStudent, infoFromLevelData) {
  return _.mapValues(dataByStudent, (studentData) =>
    _.mapValues(studentData, infoFromLevelData));
}
