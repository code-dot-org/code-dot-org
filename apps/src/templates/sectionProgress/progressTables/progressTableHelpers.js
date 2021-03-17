import moment from 'moment';

export function timeSpentFormatter(studentProgress) {
  if (!studentProgress || studentProgress.timeSpent === 0) {
    return '-';
  }
  // time spent is recorded in ms
  const minutes = studentProgress.timeSpent / (1000 * 60);
  return `${Math.round(minutes)}`;
}

export function lastUpdatedFormatter(studentProgress) {
  if (!studentProgress || studentProgress.lastTimestamp === 0) {
    return '-';
  }

  return moment(studentProgress.lastTimestamp).format('M/D');
}
