import {tables} from './datasetManifest.json';
/** @file Utility functions for the data browser. */

/**
 * Types which a column can be coerced to.
 * @enum {string}
 */
export const ColumnType = {
  STRING: 'string',
  NUMBER: 'number',
  BOOLEAN: 'boolean'
};

export const ChartType = {
  NONE: 0,
  BAR_CHART: 1,
  HISTOGRAM: 2,
  SCATTER_PLOT: 3,
  CROSS_TAB: 4
};

export function getDatasetInfo(tableName) {
  return tables.find(table => table.name === tableName);
}

export function isBlank(value) {
  return value === undefined || value === '' || value === null;
}

/**
 * @param {Object[]} records
 * @param {string[]} columns
 * @return {Object[]} Returns array containing the records that have a
 * value for all of the specified columns.
 */
export function ignoreMissingValues(records, columns) {
  records = records || [];
  columns = columns || [];
  let filteredRecords = records;
  columns.forEach(column => {
    filteredRecords = filteredRecords.filter(
      record => !isBlank(record[column])
    );
  });

  return filteredRecords;
}

/**
 * @param {*} val
 * @returns {boolean} Whether the value can be cast to number without information loss.
 */
export function isNumber(val) {
  // check isNaN(str) in order to reject strings like "123abc".
  return !isNaN(val) && !isNaN(parseFloat(val));
}

/**
 * @param {*} val
 * @returns {boolean} Whether the value represents a boolean.
 */
export function isBoolean(val) {
  return val === true || val === false || val === 'true' || val === 'false';
}

export function toBoolean(val) {
  if (val === true || val === 'true') {
    return true;
  }
  if (val === false || val === 'false') {
    return false;
  }
  throw new Error('Unable to convert to boolean');
}

/**
 * Convert a string to a boolean or number if possible.
 * @param val
 * @returns {string|number|boolean}
 */
export function castValue(val) {
  try {
    return JSON.parse(val);
  } catch (e) {
    if (e instanceof SyntaxError) {
      return val;
    }
    throw new Error(`Unexpected error parsing JSON: ${e}`);
  }
}

/**
 * Return the value as a string, or return '' if it is undefined or null.
 * @param {*} val
 * @returns {string}
 */
export function editableValue(val) {
  if (val === null || val === undefined) {
    return '';
  }
  if (typeof val === 'string') {
    try {
      JSON.parse(val);
    } catch (e) {
      // The value is a string which is not parseable as JSON (e.g. 'foo' but not 'true'
      // or '1'). Therefore, it is safe to return it without stringifying it, and
      // calling castValue on the result will return the original input.
      return val;
    }
  }

  return JSON.stringify(val);
}

/**
 * stringify the value, or replace it with "" if it is undefined or null.
 * @param {*} val
 * @returns {string}
 */
export function displayableValue(val) {
  if (val === null) {
    return 'null';
  } else if (val === undefined) {
    return 'undefined';
  } else {
    return JSON.stringify(val);
  }
}
