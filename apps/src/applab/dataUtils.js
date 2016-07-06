/** @file Utility functions for the data browser. */

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
  if (!isNaN(val)) {
    return parseFloat(val);
  }
  return val;
}
