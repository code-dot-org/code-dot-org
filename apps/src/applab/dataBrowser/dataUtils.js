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
 * Return the value as a string if it is defined, or return '' if it is undefined.
 * @param {*} val
 * @returns {string}
 */
export function displayValue(val) {
  return String(valueOr(val, ''));
}
