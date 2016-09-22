/* global Applab */

import { getDatabase } from './firebaseUtils';

export function getColumnsRef(tableName) {
  return getDatabase(Applab.channelId).child(`metadata/tables/${tableName}/columns`);
}

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

/**
 * @param {string} tableName
 * @returns {Promise} Promise containing an array of column names.
 */
export function getColumnsFromMetadata(tableName) {
  const columnsRef = getColumnsRef(tableName);
  return columnsRef.once('value').then(snapshot => {
    const columnsData = snapshot.val() || {};
    return Object.keys(columnsData);
  });
}

function addColumnNamesToMetadata(tableName, columnNames) {
  const columnsData = {};
  columnNames.forEach(columnName => {
    columnsData[columnName] = {exists: true};
  });
  const columnsRef = getColumnsRef(tableName);
  return columnsRef.update(columnsData);
}

export function addMissingColumns(tableName) {
  const recordsRef = getDatabase(Applab.channelId).child(`storage/tables/${tableName}/records`);
  return recordsRef.once('value').then(snapshot => {
    const recordsData = snapshot.val() || {};
    const columnNamesFromRecords = getColumnNamesFromRecords(recordsData);
    return addColumnNamesToMetadata(tableName, columnNamesFromRecords);
  });
}
