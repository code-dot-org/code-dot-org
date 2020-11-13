/** @file Utility methods common to toolkits that use the Droplet editor to let
 * students write and execute JavaScript. */
import RGBColor from './rgbcolor.js';
import i18n from '@cdo/locale';

export const OPTIONAL = true;

/** @type {JavaScriptModeErrorHandler} */
let errorHandler;

/**
 * Set an appropriate error handler for to use for any JavaScript errors
 * or warnings generated in static methods.
 * @param {JavaScriptModeErrorHandler} handler
 */
export function injectErrorHandler(handler) {
  errorHandler = handler;
}

/** @see JavaScriptModeErrorHandler#outputError */
export function outputError(...args) {
  errorHandler.outputError(...args);
}

/** @see JavaScriptModeErrorHandler#outputWarning */
export function outputWarning(...args) {
  errorHandler.outputWarning(...args);
}

/** @see JavaScriptModeErrorHandler#getAsyncOutputWarning */
export function getAsyncOutputWarning(...args) {
  return errorHandler.getAsyncOutputWarning(...args);
}

/**
 * Validates a user function parameter, and outputs error to the console if invalid
 * @returns {boolean} True if param passed validation.
 */
export function apiValidateType(
  opts,
  funcName,
  varName,
  varValue,
  expectedType,
  opt
) {
  const validatedTypeKey = 'validated_type_' + varName;
  if (typeof opts[validatedTypeKey] === 'undefined') {
    var properType;
    switch (expectedType) {
      case 'color':
        // Special handling for colors, must be a string and a valid RGBColor:
        properType = typeof varValue === 'string';
        if (properType) {
          var color = new RGBColor(varValue);
          properType = color.ok;
        }
        break;
      case 'uistring':
        properType =
          typeof varValue === 'string' ||
          typeof varValue === 'number' ||
          typeof varValue === 'boolean';
        break;
      case 'pinid':
        properType =
          typeof varValue === 'string' || typeof varValue === 'number';
        break;
      case 'number':
        properType =
          typeof varValue === 'number' ||
          (typeof varValue === 'string' && !isNaN(varValue));
        break;
      case 'primitive':
        properType = isPrimitiveType(varValue);
        if (!properType) {
          // Ensure a descriptive error message is displayed.
          expectedType = 'string, number, boolean, undefined or null';
        }
        break;
      case 'array':
        properType = Array.isArray(varValue);
        break;
      case 'record':
        // Validate that we have a data record. These must be objects, and
        // not arrays
        properType = typeof varValue === 'object' && !Array.isArray(varValue);
        if (properType) {
          // Records must contain only strings, numbers, booleans, undefined, or null.
          const isValidRecord = Object.values(varValue).every(val =>
            isPrimitiveType(val)
          );
          if (!isValidRecord) {
            outputError(i18n.invalidRecordTypeError());
            return false;
          }
        }
        break;
      default:
        properType = typeof varValue === expectedType;
        break;
    }
    properType =
      properType || (opt === OPTIONAL && typeof varValue === 'undefined');
    if (!properType) {
      const outputValue =
        typeof varValue === 'function' ? 'function' : varValue;
      outputWarning(
        `${funcName}() ${varName} parameter value (${outputValue}) is not a ${expectedType}.`
      );
    }
    opts[validatedTypeKey] = properType;
  }
  return !!opts[validatedTypeKey];
}

export function apiValidateTypeAndRange(
  opts,
  funcName,
  varName,
  varValue,
  expectedType,
  minValue,
  maxValue,
  opt
) {
  const validatedTypeKey = 'validated_type_' + varName;
  const validatedRangeKey = 'validated_range_' + varName;
  apiValidateType(opts, funcName, varName, varValue, expectedType, opt);
  if (
    opts[validatedTypeKey] &&
    typeof opts[validatedRangeKey] === 'undefined'
  ) {
    let inRange = typeof minValue === 'undefined' || varValue >= minValue;
    if (inRange) {
      inRange = typeof maxValue === 'undefined' || varValue <= maxValue;
    }
    inRange = inRange || (opt === OPTIONAL && typeof varValue === 'undefined');
    if (!inRange) {
      outputWarning(
        funcName +
          '() ' +
          varName +
          ' parameter value (' +
          varValue +
          ') is not in the expected range.'
      );
    }
    opts[validatedRangeKey] = inRange;
  }
}

/**
 * @param value
 * @returns {boolean} true if value is a string, number, boolean, undefined or null.
 *     returns false for other values, including instances of Number or String.
 */
function isPrimitiveType(value) {
  switch (typeof value) {
    case 'string':
    case 'number':
    case 'boolean':
    case 'undefined':
      return true;
    case 'object':
      return value === null;
    default:
      return false;
  }
}
