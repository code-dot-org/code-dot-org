/** @file Utility functions for the data browser. */

import { valueOr } from '../../utils';

/**
 * Convert a string to a boolean or number if possible.
 * @param val
 * @returns {string|number|boolean}
 */
export function castValue(val) {
  if (val === 'true' || val === true) {
    return true;
  }
  if (val === 'false' || val === false ) {
    return false;
  }
  if (!isNaN(val) && !isNaN(parseFloat(val))) {
    return parseFloat(val);
  }
  return val;
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
  return String(val);
}

/**
 * stringify the value, or replace it with "" if it is undefined or null.
 * @param {*} val
 * @returns {string}
 */
export function displayableValue(val) {
  if (val === null || val === undefined || val === '') {
    return '';
  }
  return JSON.stringify(val);
}
