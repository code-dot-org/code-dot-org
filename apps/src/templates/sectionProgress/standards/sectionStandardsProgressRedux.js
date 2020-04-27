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
export const setStudentLevelScores = (scriptId, lessonId, scoresData) => ({
  type: SET_STUDENT_LEVEL_SCORES,
  scriptId,
  lessonId,
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
    const prevLevelScoreByStage = state.studentLevelScoresByStage[
      action.scriptId
    ]
      ? state.studentLevelScoresByStage[action.scriptId][action.lessonId]
      : {};
    return {
      ...state,
      studentLevelScoresByStage: {
        ...state.studentLevelScoresByStage,
        [action.scriptId]: {
          ...state.studentLevelScoresByStage[action.scriptId],
          [action.lessonId]: {
            ...prevLevelScoreByStage,
            ...action.scoresData[action.scriptId][action.lessonId]
          }
        }
      }
    };
  }
  return state;
}

function getStagesForCurrentScript(state) {
  if (
    state.scriptSelection.scriptId &&
    state.sectionProgress.scriptDataByScript &&
    state.sectionProgress.scriptDataByScript[state.scriptSelection.scriptId]
  ) {
    const stages =
      state.sectionProgress.scriptDataByScript[state.scriptSelection.scriptId]
        .stages;

    return stages;
  }
}

export function getLessonSelectionStatus(state, stageId) {
  const selected = _.map(
    state.sectionStandardsProgress.selectedLessons,
    'id'
  ).includes(stageId);
  return selected;
}

export function getUnpluggedLessonsForScript(state) {
  let unpluggedStages = [];
  const stages = getStagesForCurrentScript(state);

  if (stages) {
    unpluggedStages = _.filter(stages, function(stage) {
      return stage.unplugged;
    });

    unpluggedStages.forEach(stage => {
      const lessonCompletionStatus = getLessonCompletionStatus(state, stage.id);
      stage['completed'] = lessonCompletionStatus.completed;
      stage['inProgress'] = lessonCompletionStatus.inProgress;
    });
  }

  function filterStageData(stage) {
    return {
      id: stage.id,
      name: stage.name,
      number: stage.position,
      url: stage.lesson_plan_html_url,
      completed: stage.completed,
      inProgress: stage.inProgress
    };
  }

  return _.map(unpluggedStages, filterStageData);
}

export function getNumberLessonsCompleted(state) {
  let lessonsCompleted = 0;
  const stages = getStagesForCurrentScript(
    state,
    state.scriptSelection.scriptId
  );

  if (stages) {
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
  const stages = getStagesForCurrentScript(
    state,
    state.scriptSelection.scriptId
  );

  if (stages) {
    numStages = stages.length;
  }
  return numStages;
}

export const lessonsByStandard = state => {
  let lessonsByStandardId = {};
  const stages = getStagesForCurrentScript(
    state,
    state.scriptSelection.scriptId
  );

  if (stages && state.sectionStandardsProgress.standardsData) {
    const standards = state.sectionStandardsProgress.standardsData;

    const numStudents =
      state.teacherSections.sections[state.teacherSections.selectedSectionId]
        .studentCount;

    standards.forEach(standard => {
      let lessons = [];

      stages.forEach(stage => {
        if (standard.lesson_ids.includes(stage.id)) {
          const lessonCompletionStatus = getLessonCompletionStatus(
            state,
            stage.id
          );
          const lessonDetails = {
            name: stage.name,
            lessonNumber: stage.relative_position,
            completed: lessonCompletionStatus.completed,
            inProgress: lessonCompletionStatus.inProgress,
            numStudentsCompleted: lessonCompletionStatus.numStudentsCompleted,
            numStudents: numStudents,
            url: stage.lesson_plan_html_url,
            unplugged: stage.unplugged
          };
          lessons.push(lessonDetails);
        }
      });

      lessonsByStandardId[standard.id] = lessons;
    });
  }
  return lessonsByStandardId;
};

export function getLessonCompletionStatus(state, stageId) {
  const scriptId = state.scriptSelection.scriptId;
  const stages = getStagesForCurrentScript(state, scriptId);
  if (stages) {
    const stage = _.find(stages, ['id', stageId]);
    if (stage.unplugged) {
      return getUnpluggedLessonCompletionStatus(state, scriptId, stageId);
    } else {
      return getPluggedLessonCompletionStatus(state, stage);
    }
  }
}

export function getUnpluggedLessonCompletionStatus(state, scriptId, stageId) {
  const completionByLesson = {
    completed: getLessonSelectionStatus(state, stageId),
    inProgress: false,
    numStudentsCompleted: getNumberOfStudentsCompletedUnpluggedLesson(
      state,
      scriptId,
      stageId
    )
  };

  return completionByLesson;
}

function getNumberOfStudentsCompletedUnpluggedLesson(state, scriptId, stageId) {
  let completionNumberByLesson = 0;
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

    completionNumberByLesson = studentScoresComplete.length;
  }
  return completionNumberByLesson;
}

export function getPluggedLessonCompletionStatus(state, stage) {
  // A lesson is "in progress" for a student if they have completed at
  // least 20% of the levels in the lesson.
  const levelsPerLessonInProgressThreshold = 0.2;
  const studentsPerSectionInProgressThreshold = 0.2;
  // A lesson is "completed" by a student if at least 60% of the levels are
  // completed.
  const levelsPerLessonCompletionThreshold = 0.6;
  // Lesson status for a section is determined by the completion status of
  // levels for 80% of students in the section.
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
    let numStudentsInProgressLesson = 0;
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
      const levelCompletionRatio =
        numLevelsInLessonCompletedByStudent / levelIds.length;
      if (levelCompletionRatio >= levelsPerLessonInProgressThreshold) {
        numStudentsInProgressLesson++;
      }
      if (levelCompletionRatio >= levelsPerLessonCompletionThreshold) {
        numStudentsCompletedLesson++;
      }
    });
    const completed =
      numStudentsCompletedLesson / numberStudentsInSection >=
      studentsPerSectionCompletionThreshold;
    const inProgress =
      numStudentsInProgressLesson / numberStudentsInSection >=
      studentsPerSectionInProgressThreshold;
    completionByLesson['completed'] = completed;
    completionByLesson['inProgress'] = inProgress;
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

export function fetchStudentLevelScores(scriptId, sectionId) {
  return (dispatch, getState) => {
    let state = getState();
    const numStudents =
      state.teacherSections.sections[state.teacherSections.selectedSectionId]
        .studentCount;
    let unpluggedLessonList = getUnpluggedLessonsForScript(state);
    const unpluggedLessonIds = _.map(unpluggedLessonList, 'id');
    const NUM_STUDENTS_PER_PAGE = 50;
    const numPages = Math.ceil(numStudents / NUM_STUDENTS_PER_PAGE);
    const requests = _.range(1, numPages + 1).map(currentPage => {
      const url = `/dashboardapi/v1/teacher_scores/${sectionId}/${scriptId}?page=${currentPage}`;
      return fetch(url, {credentials: 'include'})
        .then(response => response.json())
        .then(data => {
          const scoresData = data;
          unpluggedLessonIds.forEach(lessonId =>
            dispatch(setStudentLevelScores(scriptId, lessonId, scoresData))
          );
        });
    });
    Promise.all(requests).then(function() {
      let initialCompletedUnpluggedLessons = getInitialUnpluggedLessonCompletionStatus(
        getState(),
        scriptId
      );
      const lessonsToSelect = _.filter(unpluggedLessonList, function(lesson) {
        if (initialCompletedUnpluggedLessons.includes(lesson.id)) {
          return lesson;
        }
      });
      dispatch(setSelectedLessons(lessonsToSelect));
    });
  };
}

function getInitialUnpluggedLessonCompletionStatus(state, scriptId) {
  let completedLessonIds = [];

  if (
    state.sectionStandardsProgress.studentLevelScoresByStage &&
    state.sectionStandardsProgress.studentLevelScoresByStage[scriptId]
  ) {
    const levelScoresByStudentForScript =
      state.sectionStandardsProgress.studentLevelScoresByStage[scriptId];

    Object.keys(levelScoresByStudentForScript).forEach(function(item) {
      const studentScoresComplete = _.filter(
        _.values(levelScoresByStudentForScript[item]),
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

      if (completed) {
        completedLessonIds.push(parseInt(item));
      }
    });
  }
  return completedLessonIds;
}
