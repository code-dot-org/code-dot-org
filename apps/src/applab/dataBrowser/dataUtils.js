/** @file Utility functions for the data browser. */

import { valueOr } from '../../utils';

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
  if (val === null || val === undefined || val === '') {
    return '';
  }
  return JSON.stringify(val);
}
