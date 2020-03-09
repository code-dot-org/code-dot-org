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

export function getDatasetInfo(tableName, tables = []) {
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
 * Parses string input as string, number, boolean, undefined, or null.
 * Throws an error if the input is not parseable as one of these types.
 * @param inputString {string}
 * @param allowUnquotedStrings {boolean} if true, wraps bare words in quotes as strings
 * @returns {string|number|boolean|undefined|null}
 */
export function castValue(inputString, allowUnquotedStrings = false) {
  // 1. Remove leading and trailing whitespace
  inputString = inputString.trim();
  // 2. Check for undefined and null
  if (inputString === 'undefined') {
    return undefined;
  } else if (inputString === 'null') {
    return null;
  }
  // 3. Attempt to parse as number, string, or boolean
  try {
    const parsed = JSON.parse(inputString);
    if (typeof parsed === 'object') {
      throw new Error(`Invalid entry type: object`);
    }
    return parsed;
  } catch (e) {
    if (e instanceof SyntaxError) {
      if (allowUnquotedStrings) {
        return inputString;
      } else {
        throw e;
      }
    }
    throw new Error(`Unexpected error parsing JSON: ${e}`);
  }
}

/**
 * Return the value as a string.
 * @param {*} val
 * @returns {string}
 */
export function editableValue(val) {
  if (val === undefined) {
    return 'undefined';
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
