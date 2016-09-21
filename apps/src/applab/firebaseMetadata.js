/* global Applab */

import Firebase from 'firebase';

export function getColumnNames(records, columns) {
  // Make sure 'id' is the first column.
  let columnNames = ['id'];

  Object.keys(records).forEach(id => {
    const record = JSON.parse(records[id]);
    Object.keys(record).forEach(columnName => {
      if (columnNames.indexOf(columnName) === -1) {
        columnNames.push(columnName);
      }
    });
  });

  columns.forEach(columnName => {
    if (columnNames.indexOf(columnName) === -1) {
      columnNames.push(columnName);
    }
  });

  return columnNames;
}
