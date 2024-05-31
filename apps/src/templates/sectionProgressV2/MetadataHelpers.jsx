export function formatTimeSpent(studentProgress) {
  if (studentProgress?.timeSpent) {
    const minutes = studentProgress.timeSpent / 60;
    return `${Math.ceil(minutes)}`;
  }
  return missingDataFormatter(!!studentProgress);
}

export function formatLastUpdated(studentProgress) {
  if (studentProgress?.lastTimestamp) {
    const date = new Date(studentProgress.lastTimestamp * 1000);
    return new Intl.DateTimeFormat('en-US', {
      month: 'numeric',
      day: 'numeric',
    }).format(date);
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
