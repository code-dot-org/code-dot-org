import _ from 'lodash';
import {TestResults} from '@cdo/apps/constants';
import {TeacherScores} from './standardsConstants';

const SET_STANDARDS_DATA = 'sectionStandardsProgress/SET_STANDARDS_DATA';
const SET_TEACHER_COMMENT_FOR_REPORT =
  'sectionStandardsProgress/SET_TEACHER_COMMENT_FOR_REPORT';
const SET_SELECTED_LESSONS = 'sectionStandardsProgress/SET_SELECTED_LESSONS';
const SET_STUDENT_LEVEL_SCORES =
  'sectionStandardsProgress/SET_STUDENT_LEVEL_SCORES';

// Action creators
export const setStandardsData = standardsData => {
  return {type: SET_STANDARDS_DATA, standardsData: standardsData};
};
export const setTeacherCommentForReport = teacherComment => ({
  type: SET_TEACHER_COMMENT_FOR_REPORT,
  teacherComment
});
export const setSelectedLessons = selected => ({
  type: SET_SELECTED_LESSONS,
  selected
});
export const setStudentLevelScores = scoresData => ({
  type: SET_STUDENT_LEVEL_SCORES,
  scoresData
});

// Initial State
const initialState = {
  standardsData: [],
  teacherComment: null,
  selectedLessons: [],
  studentLevelScoresByStage: {}
};

function sortByOrganizationId(standardsByConcept) {
  return _.orderBy(standardsByConcept, 'organization_id', 'asc');
}

export default function sectionStandardsProgress(state = initialState, action) {
  if (action.type === SET_STANDARDS_DATA) {
    const sortedByConcept = _.orderBy(action.standardsData, 'concept', 'asc');
    const groupedStandards = _.orderBy(
      _.groupBy(sortedByConcept, 'concept'),
      'concept',
      'asc'
    );
    const sortedStandards = _.map(groupedStandards, sortByOrganizationId);
    return {
      ...state,
      standardsData: _.flatten(sortedStandards)
    };
  }
  if (action.type === SET_TEACHER_COMMENT_FOR_REPORT) {
    return {
      ...state,
      teacherComment: action.teacherComment
    };
  }
  if (action.type === SET_SELECTED_LESSONS) {
    return {
      ...state,
      selectedLessons: action.selected
    };
  }
  if (action.type === SET_STUDENT_LEVEL_SCORES) {
    return {
      ...state,
      studentLevelScoresByStage: action.scoresData
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

  unpluggedStages.forEach(stage => {
    const lessonCompletionStatus = getLessonCompletionStatus(state, stage.id);
    const selected = getLessonSelectionStatus(state, stage.id);
    stage['selected'] = selected;
    stage['completed'] = lessonCompletionStatus.completed;
  });

  function filterStageData(stage) {
    return {
      id: stage.id,
      name: stage.name,
      number: stage.position,
      url: stage.lesson_plan_html_url,
      completed: stage.completed,
      selected: stage.selected
    };
  }

  return _.map(unpluggedStages, filterStageData);
}

export function fetchStudentLevelScores(scriptId, sectionId) {
  return (dispatch, getState) => {
    $.ajax({
      method: 'GET',
      dataType: 'json',
      url: `/dashboardapi/v1/teacher_scores/${sectionId}/${scriptId}`
    }).then(data => {
      const scoresData = data;
      dispatch(setStudentLevelScores(scoresData));
    });
  };
}

export function getNumberLessonsCompleted(state) {
  let lessonsCompleted = 0;
  if (
    state.sectionProgress.scriptDataByScript &&
    state.scriptSelection.scriptId &&
    state.sectionProgress.scriptDataByScript[state.scriptSelection.scriptId]
  ) {
    const stages =
      state.sectionProgress.scriptDataByScript[state.scriptSelection.scriptId]
        .stages;

    stages.forEach(stage => {
      const lessonCompletionStatus = getLessonCompletionStatus(state, stage.id);
      if (lessonCompletionStatus.completed) {
        lessonsCompleted += 1;
      }
    });
  }
  return lessonsCompleted;
}

export function getNumberLessonsInScript(state) {
  let numStages = 0;
  if (
    state.sectionProgress.scriptDataByScript &&
    state.scriptSelection.scriptId &&
    state.sectionProgress.scriptDataByScript[state.scriptSelection.scriptId]
  ) {
    numStages =
      state.sectionProgress.scriptDataByScript[state.scriptSelection.scriptId]
        .stages.length;
  }
  return numStages;
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
  if (
    state.scriptSelection.scriptId &&
    state.sectionProgress.scriptDataByScript
  ) {
    const scriptId = state.scriptSelection.scriptId;
    const stages = state.sectionProgress.scriptDataByScript[scriptId].stages;
    const stage = _.find(stages, ['id', stageId]);
    if (stage.unplugged) {
      return getUnpluggedLessonCompletionStatus(state, scriptId, stageId);
    } else {
      return getPluggedLessonCompletionStatus(state, stage);
    }
  }
}

export function getLessonSelectionStatus(state, stageId) {
  const selected = _.map(
    state.sectionStandardsProgress.selectedLessons,
    'id'
  ).includes(stageId);
  return selected;
}

export function getUnpluggedLessonCompletionStatus(state, scriptId, stageId) {
  let completionByLesson = {};
  completionByLesson['completed'] = false;
  completionByLesson['numStudentsCompleted'] = 0;

  if (
    state.sectionStandardsProgress.studentLevelScoresByStage &&
    state.sectionStandardsProgress.studentLevelScoresByStage[scriptId] &&
    state.sectionStandardsProgress.studentLevelScoresByStage[scriptId][stageId]
  ) {
    const levelScoresByStudent =
      state.sectionStandardsProgress.studentLevelScoresByStage[scriptId][
        stageId
      ];

    const studentScoresComplete = _.filter(
      _.values(levelScoresByStudent),
      function(studentScore) {
        return _.first(_.values(studentScore)) === TeacherScores.COMPLETE;
      }
    );

    const numStudentCompleted = studentScoresComplete.length;

    // If any student in the section has a teacher score indicating
    // completion for the lesson, the lesson is considered completed for the
    // section. When a teacher marks a lesson complete for a section, the
    // lesson is marked complete for each student in the section, so we can
    // infer that if it's marked complete for one student in the section,
    // it's marked complete for all students in the section.
    const completed = numStudentCompleted >= 1;

    // If a teacher selects an unplugged lesson in one of the
    // dialogs, it should display as completed.
    const selected = getLessonSelectionStatus(state, stageId);

    completionByLesson['completed'] = completed || selected;
    completionByLesson['numStudentsCompleted'] = numStudentCompleted;
  }
  return completionByLesson;
}

export function getPluggedLessonCompletionStatus(state, stage) {
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
    const numberStudentsInSection =
      state.teacherSections.sections[state.teacherSections.selectedSectionId]
        .studentCount;
    const levelResultsByStudent =
      state.sectionProgress.studentLevelProgressByScript[scriptId];

    const studentIds = Object.keys(levelResultsByStudent);
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
    completionByLesson['completed'] = completed;
    completionByLesson['numStudentsCompleted'] = numStudentsCompletedLesson;
  }
  return completionByLesson;
}

export function fetchStandardsCoveredForScript(scriptId) {
  return (dispatch, getState) => {
    $.ajax({
      method: 'GET',
      dataType: 'json',
      url: `/dashboardapi/script_standards/${scriptId}`
    }).then(data => {
      const standardsData = data;
      dispatch(setStandardsData(standardsData));
    });
  };
}
