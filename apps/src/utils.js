/* global define */

var xml = require('./xml');
var savedAmd;

// Do some hackery to make it so that lodash doesn't think it's being loaded
// via require js
if (typeof define == 'function' && typeof define.amd == 'object' && define.amd) {
  savedAmd = define.amd;
  define.amd = false;
}

// get lodash
var _ = require('./lodash');
var Hammer = require('./hammer');

// undo hackery
if (typeof define == 'function' && savedAmd) {
  define.amd = savedAmd;
  savedAmd = null;
}

exports.getLodash = function () {
  return _;
};

exports.getHammer = function () {
  return Hammer;
};

exports.shallowCopy = function(source) {
  var result = {};
  for (var prop in source) {
    result[prop] = source[prop];
  }

  return result;
};

/**
 * Returns a clone of the object, stripping any functions on it.
 */
exports.cloneWithoutFunctions = function(object) {
  return JSON.parse(JSON.stringify(object));
};

/**
 * Returns a new object with the properties from defaults overriden by any
 * properties in options. Leaves defaults and options unchanged.
 */
exports.extend = function(defaults, options) {
  var finalOptions = exports.shallowCopy(defaults);
  for (var prop in options) {
    finalOptions[prop] = options[prop];
  }

  return finalOptions;
};

exports.escapeHtml = function(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

/**
 * Version of modulo which, unlike javascript's `%` operator,
 * will always return a positive remainder.
 * @param number
 * @param mod
 */
exports.mod = function(number, mod) {
  return ((number % mod) + mod) % mod;
};

/**
 * Generates an array of integers from start to end inclusive
 */
exports.range = function(start, end) {
  var ints = [];
  for (var i = start; i <= end; i++) {
    ints.push(i);
  }
  return ints;
};

/**
 * Given two functions, generates a function that returns the result of the
 * second function if and only if the first function returns true
 */
exports.executeIfConditional = function (conditional, fn) {
  return function () {
    if (conditional()) {
      return fn.apply(this, arguments);
    }
  };
};

/**
 * Removes all single and double quotes from a string
 * @param inputString
 * @returns {string} string without quotes
 */
exports.stripQuotes = function(inputString) {
  return inputString.replace(/["']/g, "");
};

/**
 * Defines an inheritance relationship between parent class and this class.
 */
Function.prototype.inherits = function (parent) {
  this.prototype = Object.create(parent.prototype);
  this.prototype.constructor = this;
  this.superPrototype = parent.prototype;
};

/**
 * Wrap a couple of our Blockly number validators to allow for ???.  This is
 * done so that level builders can specify required blocks with wildcard fields.
 */
exports.wrapNumberValidatorsForLevelBuilder = function () {
  var nonNeg = Blockly.FieldTextInput.nonnegativeIntegerValidator;
  var numVal = Blockly.FieldTextInput.numberValidator;

  Blockly.FieldTextInput.nonnegativeIntegerValidator = function (text) {
    if (text === '???') {
      return text;
    }
    return nonNeg(text);
  };

  Blockly.FieldTextInput.numberValidator = function (text) {
    if (text === '???') {
      return text;
    }
    return numVal(text);
  };
};

/**
 * Generate a random identifier in a format matching the RFC-4122 specification.
 *
 * Taken from
 * {@link http://byronsalau.com/blog/how-to-create-a-guid-uuid-in-javascript/}
 *
 * @see RFC-4122 standard {@link http://www.ietf.org/rfc/rfc4122.txt}
 *
 * @returns {string} RFC4122-compliant UUID
 */
exports.createUuid = function () {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random()*16|0, v = c === 'x' ? r : (r&0x3|0x8);
    return v.toString(16);
  });
};

exports.fireResizeEvent = function () {
  var ev = document.createEvent('Event');
  ev.initEvent('resize', true, true);
  window.dispatchEvent(ev);
};

// ECMAScript 6 polyfill for String.prototype.repeat
// Polyfill adapted from
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference
//        /Global_Objects/String/repeat
if (!String.prototype.repeat) {
  /**
   * The repeat() method constructs and returns a new string which contains
   * the specified number of copies of the string on which it was called,
   * concatenated together?
   * @param {number} count
   * @returns {string}
   */
  String.prototype.repeat = function(count) {
    'use strict';
    if (this === null) {
      throw new TypeError('can\'t convert ' + this + ' to object');
    }
    var str = '' + this;
    count = +count;
    if (count != count) {
      count = 0;
    }
    if (count < 0) {
      throw new RangeError('repeat count must be non-negative');
    }
    if (count == Infinity) {
      throw new RangeError('repeat count must be less than infinity');
    }
    count = Math.floor(count);
    if (str.length === 0 || count === 0) {
      return '';
    }
    // Ensuring count is a 31-bit integer allows us to heavily optimize the
    // main part. But anyway, most current (august 2014) browsers can't handle
    // strings 1 << 28 chars or longer, so:
    if (str.length * count >= 1 << 28) {
      throw new RangeError('repeat count must not overflow maximum string size');
    }
    var rpt = '';
    for (;;) {
      if ((count & 1) === 1) {
        rpt += str;
      }
      count >>>= 1;
      if (count === 0) {
        break;
      }
      str += str;
    }
    return rpt;
  };
}

/**
 * Similar to val || defaultVal, except it's gated on whether or not val is
 * undefined instead of whether val is falsey.
 * @returns {*} val if not undefined, otherwise defaultVal
 */
exports.valueOr = function (val, defaultVal) {
  return val === undefined ? defaultVal : val;
};


/**
 * Attempts to analyze whether or not err represents infinite recursion having
 * occurred. This error differs per browser, and it's possible that we don't
 * properly discover all cases.
 * Note: Other languages probably have localized messages, meaning we won't
 * catch them.
 */
exports.isInfiniteRecursionError = function (err) {
  // Chrome/Safari: message ends in a period in Safari, not in Chrome
  if (err instanceof RangeError &&
    /^Maximum call stack size exceeded/.test(err.message)) {
    return true;
  }

  // Firefox
  /* jshint ignore:start */
  // Linter doesn't like our use of InternalError, even though we gate on its
  // existence.
  if (typeof(InternalError) !== 'undefined' && err instanceof InternalError &&
      err.message === 'too much recursion') {
    return true;
  }
  /* jshint ignore:end */

  // IE
  if (err instanceof Error &&
      err.message === 'Out of stack space') {
    return true;
  }

  return false;
};
