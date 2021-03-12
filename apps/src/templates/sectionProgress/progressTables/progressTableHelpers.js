import moment from 'moment';

export function timeSpentFormatter(studentProgress) {
  if (!studentProgress || !studentProgress.timeSpent) {
    return '-';
  }

  return `${Math.round(studentProgress.timeSpent / 60)}`;
}

export function lastUpdatedFormatter(studentProgress) {
  if (!studentProgress || !studentProgress.lastTimestamp) {
    return '-';
  }

  return moment(studentProgress.lastTimestamp).format('M/D');
}
