import {SET_SCRIPT} from '@cdo/apps/redux/unitSelectionRedux';
import firehoseClient from '../../lib/util/firehose';
import {ViewType} from './sectionProgressConstants';

const SET_CURRENT_VIEW = 'sectionProgress/SET_CURRENT_VIEW';
const SET_LESSON_OF_INTEREST = 'sectionProgress/SET_LESSON_OF_INTEREST';
const START_LOADING_PROGRESS = 'sectionProgress/START_LOADING_PROGRESS';
const FINISH_LOADING_PROGRESS = 'sectionProgress/FINISH_LOADING_PROGRESS';
const START_REFRESHING_PROGRESS = 'sectionProgress/START_REFRESHING_PROGRESS';
const FINISH_REFRESHING_PROGRESS = 'sectionProgress/FINISH_REFRESHING_PROGRESS';
const ADD_DATA_BY_UNIT = 'sectionProgress/ADD_DATA_BY_UNIT';
const SET_SHOW_SECTION_PROGRESS_DETAILS =
  'teacherDashboard/SET_SHOW_SECTION_PROGRESS_DETAILS';

// Action creators
export const startLoadingProgress = () => ({type: START_LOADING_PROGRESS});
export const finishLoadingProgress = () => ({type: FINISH_LOADING_PROGRESS});
export const startRefreshingProgress = () => ({
  type: START_REFRESHING_PROGRESS
});
export const finishRefreshingProgress = () => ({
  type: FINISH_REFRESHING_PROGRESS
});
export const setLessonOfInterest = lessonOfInterest => ({
  type: SET_LESSON_OF_INTEREST,
  lessonOfInterest
});
export const setCurrentView = viewType => ({type: SET_CURRENT_VIEW, viewType});
export const addDataByUnit = data => ({
  type: ADD_DATA_BY_UNIT,
  data
});
export const setShowSectionProgressDetails = showSectionProgressDetails => ({
  type: SET_SHOW_SECTION_PROGRESS_DETAILS,
  showSectionProgressDetails
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
  // pilot flag for showing time spent and last updated in the progress table
  showSectionProgressDetails: false
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
  if (action.type === START_REFRESHING_PROGRESS) {
    return {
      ...state,
      isRefreshingProgress: true
    };
  }
  if (action.type === FINISH_REFRESHING_PROGRESS) {
    return {
      ...state,
      isRefreshingProgress: false
    };
  }
  if (action.type === SET_LESSON_OF_INTEREST) {
    return {
      ...state,
      lessonOfInterest: action.lessonOfInterest
    };
  }
  if (action.type === SET_SHOW_SECTION_PROGRESS_DETAILS) {
    return {
      ...state,
      showSectionProgressDetails: action.showSectionProgressDetails
    };
  }
  if (action.type === ADD_DATA_BY_UNIT) {
    return {
      ...state,
      unitDataByUnit: {
        ...state.unitDataByUnit,
        ...action.data.unitDataByUnit
      },
      studentLevelProgressByUnit: {
        ...state.studentLevelProgressByUnit,
        ...action.data.studentLevelProgressByUnit
      },
      studentLessonProgressByUnit: {
        ...state.studentLessonProgressByUnit,
        ...action.data.studentLessonProgressByUnit
      },
      studentLastUpdateByUnit: {
        ...state.studentLastUpdateByUnit,
        ...action.data.studentLastUpdateByUnit
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
          script_id: state.unitSelection.scriptId
        })
      },
      {includeUserId: true}
    );
  };
};

// Selector functions

/**
 * Retrieves the unit data for the section in the selected unit
 * @returns {scriptDataPropType} object containing metadata about the unit structure
 */
export const getCurrentUnitData = state => {
  return state.sectionProgress.unitDataByUnit[state.unitSelection.scriptId];
};
