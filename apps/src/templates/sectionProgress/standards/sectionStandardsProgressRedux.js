import {
  unpluggedLessonList,
  lessonCompletedByStandard
} from './standardsTestHelpers';

const ADD_STANDARDS_DATA = 'sectionProgress/ADD_STANDARDS_DATA';

// Action creators
export const addStandardsData = standardsData => {
  return {type: ADD_STANDARDS_DATA, standardsData: standardsData};
};

// Initial State
const initialState = {
  standardsData: []
};

export default function sectionStandardsProgress(state = initialState, action) {
  if (action.type === ADD_STANDARDS_DATA) {
    return {
      ...state,
      standardsData: action.standardsData
    };
  }
  return state;
}

export function getUnpluggedLessonsForScript(script) {
  return unpluggedLessonList;
}

export function getLessonsCompletedByStandardForScript(script) {
  return lessonCompletedByStandard;
}

export function getStandardsCoveredForScript(scriptId) {
  return (dispatch, getState) => {
    $.ajax({
      method: 'GET',
      dataType: 'json',
      url: `/dashboardapi/script_standards/${scriptId}`
    }).then(data => {
      const standardsData = data;
      dispatch(addStandardsData(standardsData));
    });
  };
}
