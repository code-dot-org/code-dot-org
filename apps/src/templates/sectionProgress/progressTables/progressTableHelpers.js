import React from 'react';
import moment from 'moment';
import {lessonIsAllAssessment} from '@cdo/apps/templates/progress/progressHelpers';
import ProgressTableSummaryCell from './ProgressTableSummaryCell';
import ProgressTableDetailCell from './ProgressTableDetailCell';
import ProgressTableLevelSpacer from './ProgressTableLevelSpacer';
import ProgressTableLevelIconSet from './ProgressTableLevelIconSet';
import * as progressStyles from '@cdo/apps/templates/progress/progressStyles';

/**
 * @return {Array} Array of formatter functions for the progress table summary view
 * mainCellFormatter is used to format the main cell (summary of progress on lesson) for each student
 * timeSpentCellFormatter is used to format the time spent cell (time spent on the lesson) in the expanded view
 * lastUpdatedCellFormatter is used to format the last updated cell (progress last updated) in the expanded view
 *
 * @param {Object} lessonProgressByStudent
 * An object mapping student id to an object with lesson id mapping to studentLessonProgressType
 * @param {function} onClickLesson
 * A function which is called when a summary cell is clicked
 *
 * */
export function getSummaryCellFormatters(
  lessonProgressByStudent,
  onClickLesson
) {
  const mainCellFormatter = (lesson, student) => (
    <ProgressTableSummaryCell
      studentId={student.id}
      studentLessonProgress={lessonProgressByStudent[student.id][lesson.id]}
      isAssessmentLesson={lessonIsAllAssessment(lesson.levels)}
      onSelectDetailView={() => onClickLesson(lesson.position)}
    />
  );

  const timeSpentCellFormatter = (lesson, student) => {
    const progress = lessonProgressByStudent[student.id][lesson.id];
    return <span style={progressStyles.flex}>{formatTimeSpent(progress)}</span>;
  };

  const lastUpdatedCellFormatter = (lesson, student) => {
    const progress = lessonProgressByStudent[student.id][lesson.id];
    return (
      <span style={progressStyles.flex}>{formatLastUpdated(progress)}</span>
    );
  };

  return [mainCellFormatter, timeSpentCellFormatter, lastUpdatedCellFormatter];
}

/**
 * @return {Array} Array of formatter functions for the progress table detail view
 * mainCellFormatter is used to format the main cell (progress on each level in the lesson)
 * timeSpentCellFormatter is used to format the time spent cell (time spent on each level) in the expanded view
 * lastUpdatedCellFormatter is used to format the last updated cell (each level last updated) in the expanded view
 *
 * @param {Object} levelProgressByStudent
 * An object mapping student id to studentLevelProgressType
 * @param {object} section
 * A object representing the section (sectionDataPropType)
 *
 * */
export function getDetailCellFormatters(levelProgressByStudent, section) {
  const mainCellFormatter = (lesson, student) => (
    <ProgressTableDetailCell
      studentId={student.id}
      sectionId={section.id}
      levels={lesson.levels}
      studentProgress={levelProgressByStudent[student.id]}
    />
  );

  const timeSpentCellFormatter = (lesson, student) => {
    const timeSpentItems = detailCellItems(
      lesson,
      levelProgressByStudent[student.id],
      formatTimeSpent
    );
    return <ProgressTableLevelSpacer items={timeSpentItems} />;
  };

  const lastUpdatedCellFormatter = (lesson, student) => {
    const lastUpdatedItems = detailCellItems(
      lesson,
      levelProgressByStudent[student.id],
      formatLastUpdated
    );
    return <ProgressTableLevelSpacer items={lastUpdatedItems} />;
  };

  return [mainCellFormatter, timeSpentCellFormatter, lastUpdatedCellFormatter];
}

// Formatter for the icons in the extra header on the detail view
export function getLevelIconHeaderFormatter(scriptData) {
  return (_, {columnIndex}) => (
    <ProgressTableLevelIconSet
      levels={scriptData.lessons[columnIndex].levels}
    />
  );
}

function detailCellItems(lesson, studentProgress, textFormatter) {
  return lesson.levels.map(level => ({
    node: textFormatter(studentProgress[level.id]),
    sublevelCount: level.sublevels && level.sublevels.length
  }));
}

function formatTimeSpent(studentProgress) {
  if (studentProgress?.timeSpent) {
    const minutes = studentProgress.timeSpent / 60;
    return `${Math.ceil(minutes)}`;
  }
  return missingDataFormatter(studentProgress, 'timeSpent');
}

function formatLastUpdated(studentProgress) {
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

export const unitTestExports = {
  formatTimeSpent,
  formatLastUpdated
};
