import React from 'react';
import moment from 'moment';
import {
  lessonIsAllAssessment,
  lessonHasLevels
} from '@cdo/apps/templates/progress/progressHelpers';
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
  const mainCellFormatter = (lesson, student) => {
    if (lessonHasLevels(lesson)) {
      return (
        <ProgressTableSummaryCell
          studentId={student.id}
          studentLessonProgress={lessonProgressByStudent[student.id][lesson.id]}
          isAssessmentLesson={lessonIsAllAssessment(lesson.levels)}
          onSelectDetailView={() => onClickLesson(lesson.position)}
        />
      );
    }
    return emptyLessonFormatter();
  };

  const timeSpentCellFormatter = (lesson, student) => {
    if (lessonHasLevels(lesson)) {
      const progress = lessonProgressByStudent[student.id][lesson.id];
      return (
        <span style={progressStyles.flex}>{formatTimeSpent(progress)}</span>
      );
    }
    return missingDataFormatter(true);
  };

  const lastUpdatedCellFormatter = (lesson, student) => {
    if (lessonHasLevels(lesson)) {
      const progress = lessonProgressByStudent[student.id][lesson.id];
      return (
        <span style={progressStyles.flex}>{formatLastUpdated(progress)}</span>
      );
    }
    return missingDataFormatter(true);
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
  const mainCellFormatter = (lesson, student) => {
    if (lessonHasLevels(lesson)) {
      return (
        <ProgressTableDetailCell
          studentId={student.id}
          sectionId={section.id}
          levels={lesson.levels}
          studentProgress={levelProgressByStudent[student.id]}
        />
      );
    }
    return emptyLessonFormatter();
  };

  const timeSpentCellFormatter = (lesson, student) => {
    if (lessonHasLevels(lesson)) {
      const timeSpentItems = detailCellItems(
        lesson,
        levelProgressByStudent[student.id],
        formatTimeSpent
      );
      return <ProgressTableLevelSpacer items={timeSpentItems} />;
    }
    return missingDataFormatter(true);
  };

  const lastUpdatedCellFormatter = (lesson, student) => {
    if (lessonHasLevels(lesson)) {
      const lastUpdatedItems = detailCellItems(
        lesson,
        levelProgressByStudent[student.id],
        formatLastUpdated
      );
      return <ProgressTableLevelSpacer items={lastUpdatedItems} />;
    }
    return missingDataFormatter(true);
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
  return missingDataFormatter(!!studentProgress);
}

function formatLastUpdated(studentProgress) {
  if (studentProgress?.lastTimestamp) {
    return moment.unix(studentProgress.lastTimestamp).format('M/D');
  }
  return missingDataFormatter(!!studentProgress);
}

/**
 * Determines what to display in the "time spent" / "last update"
 * expanded table rows when we don't have any data.
 *
 * If the student hasn't made any progress on the level, we display nothing.
 * However, if the student has made progress but we don't have time spent or
 * last update data, that means we aren't tracking that data for this level so
 * we display '-' (a hyphen) to indicate N/A.
 *
 * Note: we also use '-' for lessons with no levels.
 */
function missingDataFormatter(progressNotApplicable) {
  if (progressNotApplicable) {
    return '-';
  }
  return '';
}

/**
 * Returns what we display in the primary (non-expanded) table
 * rows for lessons without any levels.
 *
 * Note that we use the larger em dash for empty lessons, as opposed to the
 * hyphen used for missing detail data.
 */
function emptyLessonFormatter() {
  return '—';
}

export const unitTestExports = {
  formatTimeSpent,
  formatLastUpdated
};
