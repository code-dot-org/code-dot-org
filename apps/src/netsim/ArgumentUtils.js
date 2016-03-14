/**
 * @overview Utilities for validating and retrieving arguments to a method.
 */
'use strict';

/**
 * Makes sure the given argument is provided and passes the validation check.
 * @param {?} arg - the argument to validate
 * @param {!string} argName - Argument name (for useful error reporting)
 * @param {function(?)} [validator] - validation check to run on the argument.
 *        Defaults to no check (anything passes).
 * @returns {?} the original argument.
 * @throws {TypeError} if the argument is missing or invalid.
 */
exports.validateRequired = function (arg, argName, validator) {
  if (undefined === arg) {
    throw new TypeError(argName + ' is required.');
  } else if (typeof validator === 'function' && !validator(arg)) {
    throw new TypeError('Cannot set ' + argName + ' to ' + arg + '.');
  }
  return arg;
};

/**
 * Adds an option getter to the provided options Object that validates
 * the passed arguments and can provide default values.
 * @param {Object} optionsObject - the raw options object.  May be passed
 *        undefined (as in an omitted options object) but must not be null
 *        or a non-object type.  Not modified.
 * @returns {Object} that includes a `get` method.  Will be an object
 *          even if original optionsObject argument was undefined.
 * @throws {TypeError} if a non-object is passed to the constructor.
 * @throws {Error} if extending the object would overwrite an existing property.
 */
exports.extendOptionsObject = function (optionsObject) {
  // Allow `undefined` and all objects except for `null`
  var isUndefined = (optionsObject === undefined);
  var isRealObject = (typeof optionsObject === 'object' && optionsObject !== null);
  if (!(isUndefined || isRealObject)) {
    throw new TypeError('Options object must be an object.');
  }

  if (optionsObject && optionsObject.hasOwnProperty('get')) {
    throw new Error('Cannot extend options; property "get" would be overwritten.');
  }

  return $.extend({}, optionsObject, {
    /**
     * Retrieve an optional value from the options object, passing it through the
     * provided validation function, and returning the given default value if
     * the requested option was not set.
     * @param {!string} optionKey - name of the option in the raw options object.
     * @param {function(?)} [validator] - validation check to run on the value,
     *        if it has been set.  Should return TRUE if valid and FALSE otherwise.
     *        Defaults to no check (anything passes).
     * @param {?} [defaultValue] - What to return if the option was not set.
     *        Defaults to `undefined`.
     * @returns {?} The value of the option if it was set, and the provided
     *          default value if it was not set.
     * @throws {TypeError} if the validator function returns FALSE when called
     *         on the option value.
     */
    get: function (optionKey, validator, defaultValue) {
      if (!optionsObject || optionsObject[optionKey] === undefined) {
        return defaultValue;
      }

      if (typeof validator === 'function' && !validator(optionsObject[optionKey])) {
        throw new TypeError('Cannot set ' + optionKey + ' to ' +
            optionsObject[optionKey] + '.');
      }

      return optionsObject[optionKey];
    }
  });
};


/**
 * Validator function that verifies that the argument is a number, is
 * greater than or equal to zero, and is not Infinity.
 * @param arg
 * @returns {boolean} TRUE if provided argument is valid.
 * @static
 */
exports.isPositiveNoninfiniteNumber = function (arg) {
  return typeof arg === 'number' &&
      !isNaN(arg) &&
      arg >= 0 &&
      arg !== Infinity;
};

/**
 * Validator function that verifies that the argument is a number, is
 * greater than or equal to zero, and is not Infinity.
 * @param {?} arg
 * @returns {boolean} TRUE if provided argument is valid.
 * @static
 */
exports.isBoolean = function (arg) {
  return typeof arg === 'boolean';
};

/**
 * Validator function that verifies that the argument is a string.
 * @param {?} arg
 * @returns {boolean} TRUE if provided argument is valid.
 * @static
 */
exports.isString = function (arg) {
  return typeof arg === 'string';
};

/**
 * Validator function that verifies the argument is an array.
 * Sure this seems redundant, but included here for discoverability.
 * @param {?} arg
 * @returns {boolean} TRUE if the provided argument is an array.
 */
exports.isArray = function (arg) {
  return Array.isArray(arg);
};

/**
 * Validator function that verifies that argument is an array of strings.
 * @param {?} arg
 * @returns {boolean} TRUE if provided argument is an array and every element
 *          in the array is a string.
 * @static
 */
exports.isArrayOfStrings = function (arg) {
  return Array.isArray(arg) && arg.every(exports.isString);
};
