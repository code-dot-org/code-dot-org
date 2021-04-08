import moment from 'moment';

export function timeSpentFormatter(studentProgress) {
  if (studentProgress?.timeSpent) {
    const minutes = studentProgress.timeSpent / 60;
    return `${Math.round(minutes)}`;
  }
  return missingDataFormatter(studentProgress, 'timeSpent');
}

export function lastUpdatedFormatter(studentProgress) {
  if (studentProgress?.lastTimestamp) {
    return moment(studentProgress.lastTimestamp).format('M/D');
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
