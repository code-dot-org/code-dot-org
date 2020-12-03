import {getProjectDatabase, getPathRef} from './firebaseUtils';
import _ from 'lodash';

export function getColumnsRef(database, tableName) {
  return getPathRef(database, `metadata/tables/${tableName}/columns`);
}

/**
 * @param {string} tableName
 * @param {string} columnName
 * @returns {Firebase} A reference to the column with the specified name, or null if
 * none exists.
 */
export function getColumnRefByName(tableName, columnName) {
  return getColumnsRef(getProjectDatabase(), tableName)
    .once('value')
    .then(columnsSnapshot => {
      const columns = columnsSnapshot.val();
      const key = _.findKey(
        columns,
        column => column.columnName === columnName
      );
      if (key) {
        return getColumnsRef(getProjectDatabase(), tableName).child(key);
      }
      return Promise.resolve();
    });
}

export function getColumnNamesFromRecords(records) {
  const columnNames = [];
  Object.keys(records).forEach(id => {
    const record = JSON.parse(records[id]);
    Object.keys(record).forEach(columnName => {
      if (columnNames.indexOf(columnName) === -1) {
        if (columnName === 'id') {
          // Make sure 'id' is first column
          columnNames.unshift(columnName);
        } else {
          columnNames.push(columnName);
        }
      }
    });
  });
  return columnNames;
}

export function addColumnName(tableName, columnName) {
  return getColumnRefByName(tableName, columnName).then(columnRef => {
    if (!columnRef) {
      return getColumnsRef(getProjectDatabase(), tableName)
        .push()
        .set({columnName});
    }
    return Promise.resolve();
  });
}

export function deleteColumnName(tableName, columnName) {
  return getColumnRefByName(tableName, columnName).then(columnRef => {
    if (columnRef) {
      return columnRef.set(null);
    }
    return Promise.resolve();
  });
}

export function renameColumnName(tableName, oldName, newName) {
  return getColumnRefByName(tableName, oldName).then(columnRef => {
    if (columnRef) {
      return columnRef.set({columnName: newName});
    } else {
      return getColumnsRef(getProjectDatabase(), tableName)
        .push()
        .set({columnName: newName});
    }
  });
}

/**
 * Gets a one-time snapshot of the column names for the given table at
 * /<channelId>/metadata/tables/<tableName>/columns
 * @param {string} tableName
 * @returns {Promise} Promise containing an array of column names.
 */
export function getColumnNamesSnapshot(database, tableName) {
  const columnsRef = getColumnsRef(database, tableName);
  return columnsRef.once('value').then(snapshot => {
    const columnsData = snapshot.val() || {};
    return _.values(columnsData).map(column => column.columnName);
  });
}

/**
 * Sets up a listener on /<channelId>/metadata/tables/<tableName>/columns and calls the
 * provided callback whenever the columns change.
 * @param database
 * @param {string} tableName
 * @param callback
 */
export function onColumnsChange(database, tableName, callback) {
  getColumnsRef(database, tableName).on('value', snapshot => {
    const columnsData = snapshot.val() || {};
    const columnNames = _.values(columnsData).map(column => column.columnName);
    callback(columnNames);
  });
}

/**
 *
 * @param {string} tableName
 * @param {Array.<string>} columns
 * @returns {*}
 */
export function addMissingColumns(tableName, columns) {
  return getColumnNamesSnapshot(getProjectDatabase(), tableName).then(
    existingColumnNames => {
      let columnsRef = getColumnsRef(getProjectDatabase(), tableName);
      columns.forEach(columnName => {
        if (!existingColumnNames.includes(columnName)) {
          columnsRef.push().set({columnName});
        }
      });
    }
  );
}
