import React from 'react';
import moment from 'moment';
import {lessonIsAllAssessment} from '@cdo/apps/templates/progress/progressHelpers';
import ProgressTableSummaryCell from './ProgressTableSummaryCell';
import ProgressTableDetailCell from './ProgressTableDetailCell';
import ProgressTableLevelSpacer from './ProgressTableLevelSpacer';
import ProgressTableLevelIconSet from './ProgressTableLevelIconSet';
import * as progressStyles from '@cdo/apps/templates/progress/progressStyles';

// TODO maureen add comments explaining this
export function getSummaryCellFormatters(getLessonProgress, onClickLesson) {
  return [
    (lesson, student) => (
      <ProgressTableSummaryCell
        studentId={student.id}
        studentLessonProgress={getLessonProgress(lesson, student)}
        isAssessmentLesson={lessonIsAllAssessment(lesson.levels)}
        onSelectDetailView={() => onClickLesson(lesson.position)}
      />
    ),
    (lesson, student) =>
      summaryExpandedCellFormatter(
        lesson,
        student,
        timeSpentFormatter,
        getLessonProgress
      ),
    (lesson, student) =>
      summaryExpandedCellFormatter(
        lesson,
        student,
        lastUpdatedFormatter,
        getLessonProgress
      )
  ];
}

// TODO maureen add comments explaining this
export function getDetailCellFormatters(getStudentProgress, section) {
  return [
    (lesson, student) => (
      <ProgressTableDetailCell
        studentId={student.id}
        sectionId={section.id}
        stageExtrasEnabled={section.stageExtras}
        levels={lesson.levels}
        studentProgress={getStudentProgress(student)}
      />
    ),
    (lesson, student) =>
      detailExpandedCellFormatter(
        lesson,
        student,
        timeSpentFormatter,
        getStudentProgress
      ),
    (lesson, student) =>
      detailExpandedCellFormatter(
        lesson,
        student,
        lastUpdatedFormatter,
        getStudentProgress
      )
  ];
}

// TODO maureen add comments explaining this
export function getLevelIconHeaderFormatter(scriptData) {
  return (_, {columnIndex}) => (
    <ProgressTableLevelIconSet levels={scriptData.stages[columnIndex].levels} />
  );
}

function summaryExpandedCellFormatter(
  lesson,
  student,
  textFormatter,
  getLessonProgress
) {
  const progress = getLessonProgress(lesson, student);
  return <span style={progressStyles.flex}>{textFormatter(progress)}</span>;
}

function detailExpandedCellFormatter(
  lesson,
  student,
  textFormatter,
  getStudentProgress
) {
  const studentProgress = getStudentProgress(student);
  const levelItems = lesson.levels.map(level => ({
    node: textFormatter(studentProgress[level.id]),
    sublevelCount: level.sublevels && level.sublevels.length
  }));
  return <ProgressTableLevelSpacer items={levelItems} />;
}

function timeSpentFormatter(studentProgress) {
  if (studentProgress?.timeSpent) {
    const minutes = studentProgress.timeSpent / 60;
    return `${Math.ceil(minutes)}`;
  }
  return missingDataFormatter(studentProgress, 'timeSpent');
}

function lastUpdatedFormatter(studentProgress) {
  if (studentProgress?.lastTimestamp) {
    return moment.unix(studentProgress.lastTimestamp).format('M/D');
  }
  return missingDataFormatter(studentProgress, 'lastTimestamp');
}

/**
 * Handle formatting for each of three distinct cases:
 * 1) `studentProgress` is null: this means the student hasn't started the
 *    level/lesson, so we display nothing.
 * 2) `studentProgress[field] === 0`: this is a special case that only
 *    applies to lesson progress. it means the student has started the lesson,
 *    but we don't have data in this field, in which case we display nothing.
 * 3) `studentProgress[field]` is null: this case only applies to level
 *    progress, and means we have progress data but we don't track `field` for
 *    this level type, which we indicate by displaying '-'.
 */
function missingDataFormatter(studentProgress, field) {
  if (!studentProgress || studentProgress[field] === 0) {
    return '';
  } else if (!studentProgress[field]) {
    return '-';
  }
}
