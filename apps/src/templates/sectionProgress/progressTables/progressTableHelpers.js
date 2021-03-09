import React from 'react';
import classnames from 'classnames';
import moment from 'moment';

// styles rows: dark backgrounds, primary rows, expanded rows
export function progressTableRowWrapper(rowData, formattedRow) {
  const rowClasses = classnames({
    'dark-row': rowData.hasDarkBackground,
    'primary-row': rowData.expansionIndex === 0,
    'expanded-row': rowData.expansionIndex > 0,
    'first-expanded-row': rowData.expansionIndex === 1
  });
  return <div className={rowClasses}>{formattedRow}</div>;
}

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
