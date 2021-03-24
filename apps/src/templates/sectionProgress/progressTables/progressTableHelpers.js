import moment from 'moment';

export function timeSpentFormatter(studentProgress) {
  if (!studentProgress) {
    return '-';
  } else if (!studentProgress.timeSpent) {
    return '';
  }
  // time spent is recorded in ms
  const minutes = studentProgress.timeSpent / (1000 * 60);
  return `${Math.round(minutes)}`;
}

export function lastUpdatedFormatter(studentProgress) {
  if (!studentProgress) {
    return '-';
  } else if (!studentProgress.lastTimestamp) {
    return '';
  }

  return moment(studentProgress.lastTimestamp).format('M/D');
}
