import {SET_SCRIPT} from '@cdo/apps/redux/scriptSelectionRedux';
import firehoseClient from '../../lib/util/firehose';
import {ViewType} from './sectionProgressConstants';

const SET_CURRENT_VIEW = 'sectionProgress/SET_CURRENT_VIEW';
const SET_LESSON_OF_INTEREST = 'sectionProgress/SET_LESSON_OF_INTEREST';
const START_LOADING_PROGRESS = 'sectionProgress/START_LOADING_PROGRESS';
const FINISH_LOADING_PROGRESS = 'sectionProgress/FINISH_LOADING_PROGRESS';
const START_REFRESHING_PROGRESS = 'sectionProgress/START_REFRESHING_PROGRESS';
const FINISH_REFRESHING_PROGRESS = 'sectionProgress/FINISH_REFRESHING_PROGRESS';
const ADD_DATA_BY_SCRIPT = 'sectionProgress/ADD_DATA_BY_SCRIPT';
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
export const addDataByScript = data => ({
  type: ADD_DATA_BY_SCRIPT,
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
  scriptDataByScript: {},
  studentLevelProgressByScript: {},
  studentLessonProgressByScript: {},
  studentLastUpdateByScript: {},
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
  if (action.type === ADD_DATA_BY_SCRIPT) {
    return {
      ...state,
      scriptDataByScript: {
        ...state.scriptDataByScript,
        ...action.data.scriptDataByScript
      },
      studentLevelProgressByScript: {
        ...state.studentLevelProgressByScript,
        ...action.data.studentLevelProgressByScript
      },
      studentLessonProgressByScript: {
        ...state.studentLessonProgressByScript,
        ...action.data.studentLessonProgressByScript
      },
      studentLastUpdateByScript: {
        ...state.studentLastUpdateByScript,
        ...action.data.studentLastUpdateByScript
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
 * Retrieves the script data for the section in the selected script
 * @returns {scriptDataPropType} object containing metadata about the script structure
 */
export const getCurrentScriptData = state => {
  return state.sectionProgress.scriptDataByScript[
    state.scriptSelection.scriptId
  ];
};
