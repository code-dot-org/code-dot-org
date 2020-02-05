import {lessonCompletedByStandard} from './standardsTestHelpers';
import _ from 'lodash';

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

export function getUnpluggedLessonsForScript(state) {
  let unpluggedStages = [];
  if (
    state.sectionProgress.scriptDataByScript &&
    state.scriptSelection.scriptId &&
    state.sectionProgress.scriptDataByScript[state.scriptSelection.scriptId]
  ) {
    const stages =
      state.sectionProgress.scriptDataByScript[state.scriptSelection.scriptId]
        .stages;

    unpluggedStages = _.filter(stages, function(stage) {
      return stage.unplugged;
    });
  }

  function filterStageData(stage) {
    return {
      id: stage.id,
      name: stage.name,
      number: stage.position,
      url: stage.lesson_plan_html_url
    };
  }

  return _.map(unpluggedStages, filterStageData);
}

export function getLessonsCompletedByStandardForScript(script) {
  return lessonCompletedByStandard;
}

export const lessonsByStandard = state => {
  let lessonsByStandardId = {};
  if (
    state.sectionProgress.scriptDataByScript &&
    state.scriptSelection.scriptId &&
    state.sectionProgress.scriptDataByScript[state.scriptSelection.scriptId] &&
    state.sectionStandardsProgress.standardsData
  ) {
    const standards = state.sectionStandardsProgress.standardsData;

    const stages =
      state.sectionProgress.scriptDataByScript[state.scriptSelection.scriptId]
        .stages;

    const numStudents =
      state.teacherSections.sections[state.teacherSections.selectedSectionId]
        .studentCount;

    standards.forEach(standard => {
      let lessons = [];
      stages.forEach(stage => {
        if (standard.lesson_ids.includes(stage.id)) {
          let lessonDetails = {};
          lessonDetails['name'] = stage.name;
          lessonDetails['lessonNumber'] = stage.relative_position;
          lessonDetails['numStudents'] = numStudents;
          lessonDetails['url'] = stage.lesson_plan_html_url;
          lessonDetails['unplugged'] = stage.unplugged;
          lessons.push(lessonDetails);
        }
      });
      lessonsByStandardId[standard.id] = lessons;
    });
  }
  return lessonsByStandardId;
};

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
