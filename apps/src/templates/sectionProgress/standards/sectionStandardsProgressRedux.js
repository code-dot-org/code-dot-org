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
  studentLevelScoresByLesson: {}
};

function sortByShortcode(standardsByCategory) {
  return _.orderBy(standardsByCategory, 'shortcode', 'asc');
}

export default function sectionStandardsProgress(state = initialState, action) {
  if (action.type === SET_STANDARDS_DATA) {
    const sortedByCategory = _.orderBy(
      action.standardsData,
      'category_description',
      'asc'
    );
    const groupedStandards = _.orderBy(
      _.groupBy(sortedByCategory, 'category_description'),
      'category_description',
      'asc'
    );
    const sortedStandards = _.map(groupedStandards, sortByShortcode);
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
    const prevLevelScoreByLesson = state.studentLevelScoresByLesson[
      action.scriptId
    ]
      ? state.studentLevelScoresByLesson[action.scriptId][action.lessonId]
      : {};
    return {
      ...state,
      studentLevelScoresByLesson: {
        ...state.studentLevelScoresByLesson,
        [action.scriptId]: {
          ...state.studentLevelScoresByLesson[action.scriptId],
          [action.lessonId]: {
            ...prevLevelScoreByLesson,
            ...action.scoresData[action.scriptId][action.lessonId]
          }
        }
      }
    };
  }
  return state;
}

function getLessonsForCurrentScript(state) {
  if (
    state.scriptSelection.scriptId &&
    state.sectionProgress.unitDataByUnit &&
    state.sectionProgress.unitDataByUnit[state.scriptSelection.scriptId]
  ) {
    const lessons =
      state.sectionProgress.unitDataByUnit[state.scriptSelection.scriptId]
        .lessons;
    return lessons;
  }
}

export function getLessonSelectionStatus(state, lessonId) {
  const selected = _.map(
    state.sectionStandardsProgress.selectedLessons,
    'id'
  ).includes(lessonId);
  return selected;
}

export function getUnpluggedLessonsForScript(state) {
  let unpluggedLessons = [];
  const lessons = getLessonsForCurrentScript(state);

  if (lessons) {
    unpluggedLessons = _.filter(lessons, function(lesson) {
      return lesson.unplugged;
    });

    unpluggedLessons.forEach(lesson => {
      const lessonCompletionStatus = getLessonCompletionStatus(
        state,
        lesson.id
      );
      lesson['completed'] = lessonCompletionStatus.completed;
      lesson['inProgress'] = lessonCompletionStatus.inProgress;
    });
  }

  function filterLessonData(lesson) {
    return {
      id: lesson.id,
      name: lesson.name,
      number: lesson.position,
      url: lesson.lesson_plan_html_url,
      completed: lesson.completed,
      inProgress: lesson.inProgress
    };
  }

  return _.map(unpluggedLessons, filterLessonData);
}

export function getNumberLessonsCompleted(state) {
  let lessonsCompleted = 0;
  const lessons = getLessonsForCurrentScript(
    state,
    state.scriptSelection.scriptId
  );

  if (lessons) {
    lessons.forEach(lesson => {
      const lessonCompletionStatus = getLessonCompletionStatus(
        state,
        lesson.id
      );
      if (lessonCompletionStatus.completed) {
        lessonsCompleted += 1;
      }
    });
  }
  return lessonsCompleted;
}

export function getNumberLessonsInScript(state) {
  let numLessons = 0;
  const lessons = getLessonsForCurrentScript(
    state,
    state.scriptSelection.scriptId
  );

  if (lessons) {
    numLessons = lessons.length;
  }
  return numLessons;
}

export const lessonsByStandard = state => {
  let lessonsByStandardId = {};
  const lessons = getLessonsForCurrentScript(
    state,
    state.scriptSelection.scriptId
  );

  if (lessons && state.sectionStandardsProgress.standardsData) {
    const standards = state.sectionStandardsProgress.standardsData;

    const numStudents =
      state.teacherSections.sections[state.teacherSections.selectedSectionId]
        .studentCount;

    standards.forEach(standard => {
      let associatedLessons = [];

      lessons.forEach(lesson => {
        if (standard.lesson_ids.includes(lesson.id)) {
          const lessonCompletionStatus = getLessonCompletionStatus(
            state,
            lesson.id
          );
          const lessonDetails = {
            name: lesson.name,
            lessonNumber: lesson.relative_position,
            completed: lessonCompletionStatus.completed,
            inProgress: lessonCompletionStatus.inProgress,
            numStudentsCompleted: lessonCompletionStatus.numStudentsCompleted,
            numStudents: numStudents,
            url: lesson.lesson_plan_html_url,
            unplugged: lesson.unplugged
          };
          associatedLessons.push(lessonDetails);
        }
      });

      lessonsByStandardId[standard.id] = associatedLessons;
    });
  }
  return lessonsByStandardId;
};

export function getLessonCompletionStatus(state, lessonId) {
  const scriptId = state.scriptSelection.scriptId;
  const lessons = getLessonsForCurrentScript(state, scriptId);
  if (lessons) {
    const lesson = _.find(lessons, ['id', lessonId]);
    if (lesson.unplugged) {
      return getUnpluggedLessonCompletionStatus(state, scriptId, lessonId);
    } else {
      return getPluggedLessonCompletionStatus(state, lesson);
    }
  }
}

export function getUnpluggedLessonCompletionStatus(state, scriptId, lessonId) {
  const completionByLesson = {
    completed: getLessonSelectionStatus(state, lessonId),
    inProgress: false,
    numStudentsCompleted: getNumberOfStudentsCompletedUnpluggedLesson(
      state,
      scriptId,
      lessonId
    )
  };

  return completionByLesson;
}

function getNumberOfStudentsCompletedUnpluggedLesson(
  state,
  scriptId,
  lessonId
) {
  let completionNumberByLesson = 0;
  if (
    state.sectionStandardsProgress.studentLevelScoresByLesson &&
    state.sectionStandardsProgress.studentLevelScoresByLesson[scriptId] &&
    state.sectionStandardsProgress.studentLevelScoresByLesson[scriptId][
      lessonId
    ]
  ) {
    const levelScoresByStudent =
      state.sectionStandardsProgress.studentLevelScoresByLesson[scriptId][
        lessonId
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

export function getPluggedLessonCompletionStatus(state, lesson) {
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
    state.sectionProgress.unitDataByUnit &&
    state.sectionProgress.studentLevelProgressByUnit &&
    state.sectionProgress.studentLevelProgressByUnit[
      state.scriptSelection.scriptId
    ] &&
    state.teacherSections.sections &&
    state.teacherSections.selectedSectionId
  ) {
    const scriptId = state.scriptSelection.scriptId;
    const numberStudentsInSection =
      state.teacherSections.sections[state.teacherSections.selectedSectionId]
        .studentCount;
    const levelProgressByScript =
      state.sectionProgress.studentLevelProgressByUnit[scriptId];

    const studentIds = Object.keys(levelProgressByScript);
    const levelIds = _.map(lesson.levels, 'id');
    let numStudentsCompletedLesson = 0;
    let numStudentsInProgressLesson = 0;
    studentIds.forEach(studentId => {
      let numLevelsInLessonCompletedByStudent = 0;
      levelIds.forEach(levelId => {
        const levelProgress = levelProgressByScript[studentId][levelId];
        if (
          levelProgress &&
          levelProgress.result >= TestResults.MINIMUM_PASS_RESULT
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
    state.sectionStandardsProgress.studentLevelScoresByLesson &&
    state.sectionStandardsProgress.studentLevelScoresByLesson[scriptId]
  ) {
    const levelScoresByStudentForScript =
      state.sectionStandardsProgress.studentLevelScoresByLesson[scriptId];

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
