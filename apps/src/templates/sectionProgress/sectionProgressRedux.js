import _ from 'lodash';

import {EVENTS} from '@cdo/apps/metrics/utils/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/utils/AnalyticsReporter';
import {SET_SCRIPT} from '@cdo/apps/redux/unitSelectionRedux';
import {trySetLocalStorage, tryGetLocalStorage} from '@cdo/apps/utils';

import firehoseClient from '../../metrics/utils/firehose';
import {lessonHasLevels} from '../progress/progressHelpers';

import {ViewType} from './sectionProgressConstants';

const SET_CURRENT_VIEW = 'sectionProgress/SET_CURRENT_VIEW';
const SET_LESSON_OF_INTEREST = 'sectionProgress/SET_LESSON_OF_INTEREST';
const START_LOADING_PROGRESS = 'sectionProgress/START_LOADING_PROGRESS';
const FINISH_LOADING_PROGRESS = 'sectionProgress/FINISH_LOADING_PROGRESS';
const START_REFRESHING_PROGRESS = 'sectionProgress/START_REFRESHING_PROGRESS';
const FINISH_REFRESHING_PROGRESS = 'sectionProgress/FINISH_REFRESHING_PROGRESS';
const ADD_DATA_BY_UNIT = 'sectionProgress/ADD_DATA_BY_UNIT';

const LOAD_EXPANDED_LESSONS_FROM_LOCAL_STORAGE =
  'sectionProgress/LOAD_EXPANDED_LESSONS_FROM_LOCAL_STORAGE';
const ADD_EXPANDED_LESSON = 'sectionProgress/ADD_EXPANDED_LESSON';
const REMOVE_EXPANDED_LESSON = 'sectionProgress/REMOVE_EXPANDED_LESSON';

const TOGGLE_EXPANDED_CHOICE_LEVEL =
  'sectionProgress/TOGGLE_EXPANDED_CHOICE_LEVEL';

const EXPAND_METADATA_FOR_STUDENTS =
  'sectionProgress/EXPAND_METADATA_FOR_STUDENTS';
const COLLAPSE_METADATA_FOR_STUDENTS =
  'sectionProgress/COLLAPSE_METADATA_FOR_STUDENTS';

// Action creators
export const startLoadingProgress = () => ({type: START_LOADING_PROGRESS});
export const finishLoadingProgress = () => ({type: FINISH_LOADING_PROGRESS});
export const startRefreshingProgress = () => ({
  type: START_REFRESHING_PROGRESS,
});
export const finishRefreshingProgress = () => ({
  type: FINISH_REFRESHING_PROGRESS,
});
export const setLessonOfInterest = lessonOfInterest => ({
  type: SET_LESSON_OF_INTEREST,
  lessonOfInterest,
});
export const setCurrentView = viewType => ({type: SET_CURRENT_VIEW, viewType});
export const addDataByUnit = data => ({
  type: ADD_DATA_BY_UNIT,
  data,
});

export const loadExpandedLessonsFromLocalStorage = (unitId, sectionId) => ({
  type: LOAD_EXPANDED_LESSONS_FROM_LOCAL_STORAGE,
  unitId,
  sectionId,
});

export const addExpandedLesson = (unitId, sectionId, lesson) => ({
  type: ADD_EXPANDED_LESSON,
  unitId,
  sectionId,
  lesson,
});

export const removeExpandedLesson = (unitId, sectionId, lessonId) => ({
  type: REMOVE_EXPANDED_LESSON,
  unitId,
  sectionId,
  lessonId,
});

export const toggleExpandedChoiceLevel = (sectionId, level) => ({
  type: TOGGLE_EXPANDED_CHOICE_LEVEL,
  sectionId,
  level,
});

export const expandMetadataForStudents = studentIds => ({
  type: EXPAND_METADATA_FOR_STUDENTS,
  studentIds,
});
export const collapseMetadataForStudents = studentIds => ({
  type: COLLAPSE_METADATA_FOR_STUDENTS,
  studentIds,
});

const INITIAL_LESSON_OF_INTEREST = 1;

const initialState = {
  section: {},
  currentView: ViewType.SUMMARY,
  unitDataByUnit: {},
  studentLevelProgressByUnit: {},
  studentLessonProgressByUnit: {},
  studentLastUpdateByUnit: {},
  lessonOfInterest: INITIAL_LESSON_OF_INTEREST,
  isLoadingProgress: false,
  isRefreshingProgress: false,
  expandedLessonIds: {},
  expandedChoiceLevelIds: [],
  expandedMetadataStudentIds: [],
};

export default function sectionProgress(state = initialState, action) {
  if (action.type === SET_SCRIPT) {
    return {
      ...state,
      lessonOfInterest: INITIAL_LESSON_OF_INTEREST,
    };
  }
  if (action.type === SET_CURRENT_VIEW) {
    return {
      ...state,
      currentView: action.viewType,
    };
  }
  if (action.type === START_LOADING_PROGRESS) {
    return {
      ...state,
      isLoadingProgress: true,
    };
  }
  if (action.type === FINISH_LOADING_PROGRESS) {
    return {
      ...state,
      isLoadingProgress: false,
    };
  }
  if (action.type === START_REFRESHING_PROGRESS) {
    return {
      ...state,
      isRefreshingProgress: true,
    };
  }
  if (action.type === FINISH_REFRESHING_PROGRESS) {
    return {
      ...state,
      isRefreshingProgress: false,
    };
  }
  if (action.type === SET_LESSON_OF_INTEREST) {
    return {
      ...state,
      lessonOfInterest: action.lessonOfInterest,
    };
  }
  if (action.type === ADD_DATA_BY_UNIT) {
    return {
      ...state,
      unitDataByUnit: {
        ...state.unitDataByUnit,
        ...action.data.unitDataByUnit,
      },
      studentLevelProgressByUnit: {
        ...state.studentLevelProgressByUnit,
        ...action.data.studentLevelProgressByUnit,
      },
      studentLessonProgressByUnit: {
        ...state.studentLessonProgressByUnit,
        ...action.data.studentLessonProgressByUnit,
      },
      studentLastUpdateByUnit: {
        ...state.studentLastUpdateByUnit,
        ...action.data.studentLastUpdateByUnit,
      },
    };
  }
  if (action.type === LOAD_EXPANDED_LESSONS_FROM_LOCAL_STORAGE) {
    const expandedLessonIds = getLocalStorage(action.unitId, action.sectionId);
    return {
      ...state,
      expandedLessonIds: {
        ...state.expandedLessonIds,
        [action.sectionId]: expandedLessonIds,
      },
    };
  }
  if (action.type === ADD_EXPANDED_LESSON) {
    if (action.lesson.lockable || !lessonHasLevels(action.lesson)) {
      return state;
    }

    analyticsReporter.sendEvent(EVENTS.PROGRESS_V2_LESSON_EXPAND, {
      sectionId: action.sectionId,
      lessonId: action.lesson.id,
    });

    const newSectionExpandedLessonIds = _.uniq([
      ...(state.expandedLessonIds[action.sectionId] || []),
      action.lesson.id,
    ]);
    saveExpandedLessonIdsToLocalStorage(
      action.unitId,
      action.sectionId,
      newSectionExpandedLessonIds
    );

    return {
      ...state,
      expandedLessonIds: {
        ...state.expandedLessonIds,
        [action.sectionId]: newSectionExpandedLessonIds,
      },
    };
  }
  if (action.type === REMOVE_EXPANDED_LESSON) {
    analyticsReporter.sendEvent(EVENTS.PROGRESS_V2_LESSON_COLLAPSE, {
      sectionId: action.sectionId,
      lessonId: action.lessonId,
    });

    const newSectionExpandedLessonIds = state.expandedLessonIds[
      action.sectionId
    ].filter(lessonId => lessonId !== action.lessonId);
    saveExpandedLessonIdsToLocalStorage(
      action.unitId,
      action.sectionId,
      newSectionExpandedLessonIds
    );

    return {
      ...state,
      expandedLessonIds: {
        ...state.expandedLessonIds,
        [action.sectionId]: newSectionExpandedLessonIds,
      },
    };
  }
  if (action.type === TOGGLE_EXPANDED_CHOICE_LEVEL) {
    if (state.expandedChoiceLevelIds.includes(action.level.id)) {
      analyticsReporter.sendEvent(EVENTS.PROGRESS_V2_COLLAPSE_CHOICE_LEVEL, {
        sectionId: action.sectionId,
        levelId: action.level.id,
      });

      return {
        ...state,
        expandedChoiceLevelIds: state.expandedChoiceLevelIds.filter(
          l => l !== action.level.id
        ),
      };
    } else if (action.level?.sublevels?.length > 0) {
      analyticsReporter.sendEvent(EVENTS.PROGRESS_V2_EXPAND_CHOICE_LEVEL, {
        sectionId: action.sectionId,
        levelId: action.level.id,
      });
      return {
        ...state,
        expandedChoiceLevelIds: [
          ...state.expandedChoiceLevelIds,
          action.level.id,
        ],
      };
    }
  }
  if (action.type === EXPAND_METADATA_FOR_STUDENTS) {
    return {
      ...state,
      expandedMetadataStudentIds: _.uniq([
        ...state.expandedMetadataStudentIds,
        ...action.studentIds,
      ]),
    };
  }
  if (action.type === COLLAPSE_METADATA_FOR_STUDENTS) {
    return {
      ...state,
      expandedMetadataStudentIds: state.expandedMetadataStudentIds.filter(
        studentId => !action.studentIds.includes(studentId)
      ),
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
          section_id: state.teacherSections.selectedSectionId,
          old_view: ViewType.SUMMARY,
          new_view: ViewType.DETAIL,
          script_id: state.unitSelection.scriptId,
        }),
      },
      {includeUserId: true}
    );
  };
};

// Selector functions

/**
 * Retrieves the unit data for the section in the selected unit
 * @returns {unitDataPropType} object containing metadata about the unit structure
 */
export const getCurrentUnitData = state => {
  return state.sectionProgress.unitDataByUnit[state.unitSelection.scriptId];
};

const getExpandedLessonLocalStorageString = (unitId, sectionId) =>
  `expandedLessonProgressV2-${unitId}-${sectionId}`;

const saveExpandedLessonIdsToLocalStorage = (unitId, sectionId, lessonIds) => {
  trySetLocalStorage(
    getExpandedLessonLocalStorageString(unitId, sectionId),
    JSON.stringify(lessonIds)
  );
};

const getLocalStorage = (unitId, sectionId) => {
  try {
    return (
      JSON.parse(
        tryGetLocalStorage(
          getExpandedLessonLocalStorageString(unitId, sectionId),
          []
        )
      ) || []
    );
  } catch (e) {
    // If we fail to parse the local storage, default to nothing expanded.
    return [];
  }
};
