import {lessonCompletedByStandard} from './standardsTestHelpers';
import _ from 'lodash';
import {TestResults} from '@cdo/apps/constants';

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
          const lessonCompletionStatus = getLessonCompletionStatus(
            state,
            stage.id
          );
          lessonDetails['name'] = stage.name;
          lessonDetails['lessonNumber'] = stage.relative_position;
          lessonDetails['completed'] = lessonCompletionStatus.completed;
          lessonDetails['numStudentsCompleted'] =
            lessonCompletionStatus.numStudentsCompleted;
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

export function getLessonCompletionStatus(state, stageId) {
  console.log('Hey! We made it into getLessonCompletionStatus');
  // A lesson is "completed" by a student if at least 60% of the levels are
  // completed.
  const levelsPerLessonCompletionThreshold = 0.6;
  // A lesson is "complete" for a section if passed by 80% of the students in
  //the section.
  const studentsPerSectionCompletionThreshold = 0.8;

  let completionByLesson = {};

  if (
    state.scriptSelection.scriptId &&
    state.sectionProgress.scriptDataByScript &&
    state.sectionProgress.studentLevelProgressByScript &&
    state.sectionProgress.studentLevelProgressByScript[
      state.scriptSelection.scriptId
    ] &&
    state.teacherSections.sections &&
    state.teacherSections.selectedSectionId
  ) {
    const scriptId = state.scriptSelection.scriptId;
    const stages = state.sectionProgress.scriptDataByScript[scriptId].stages;
    const numberStudentsInSection =
      state.teacherSections.sections[state.teacherSections.selectedSectionId]
        .studentCount;
    const levelResultsByStudent =
      state.sectionProgress.studentLevelProgressByScript[scriptId];

    const studentIds = Object.keys(levelResultsByStudent);
    stages.forEach(stage => {
      const levelIds = _.map(stage.levels, 'activeId');
      let numStudentsCompletedLesson = 0;
      studentIds.forEach(studentId => {
        let numLevelsInLessonCompletedByStudent = 0;
        levelIds.forEach(levelId => {
          if (
            levelResultsByStudent[studentId][levelId] >=
            TestResults.MINIMUM_PASS_RESULT
          ) {
            numLevelsInLessonCompletedByStudent++;
          }
        });
        if (
          numLevelsInLessonCompletedByStudent / levelIds.length >=
          levelsPerLessonCompletionThreshold
        ) {
          numStudentsCompletedLesson++;
        }
      });
      const completed =
        numStudentsCompletedLesson / numberStudentsInSection >=
        studentsPerSectionCompletionThreshold;
      completionByLesson[stage.id] = {
        completed: completed,
        numStudentsCompleted: numStudentsCompletedLesson
      };
    });
  }
  return completionByLesson[stageId];
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
