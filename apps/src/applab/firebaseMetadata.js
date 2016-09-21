/* global Applab */

import Firebase from 'firebase';

function getColumnNamesFromRecords(records) {
  const columnNames = ['id'];
  Object.keys(records).forEach(id => {
    const record = JSON.parse(records[id]);
    Object.keys(record).forEach(columnName => {
      if (columnNames.indexOf(columnName) === -1) {
        columnNames.push(columnName);
      }
    });
  });
  return columnNames;
}

/**
 * @param {Array} records Array of JSON-encoded records.
 * @param {string} columns Array of column names.
 */
export function getColumnNames(records, columns) {
  // Make sure 'id' is the first column.
  const columnNames = getColumnNamesFromRecords(records);

  columns.forEach(columnName => {
    if (columnNames.indexOf(columnName) === -1) {
      columnNames.push(columnName);
    }
  });

  return columnNames;
}
