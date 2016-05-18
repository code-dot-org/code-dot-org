/* global define */
'use strict';

exports.shallowCopy = function (source) {
  var result = {};
  for (var prop in source) {
    result[prop] = source[prop];
  }

  return result;
};

/**
 * Returns a clone of the object, stripping any functions on it.
 */
exports.cloneWithoutFunctions = function (object) {
  return JSON.parse(JSON.stringify(object));
};

/**
 * Returns a string with a double quote before and after.
 */
exports.quote = function (str) {
  return '"' + str + '"';
};

/**
 * Returns a new object with the properties from defaults overridden by any
 * properties in options. Leaves defaults and options unchanged.
 * NOTE: For new code, use $.extend({}, defaults, options) instead
 */
exports.extend = function (defaults, options) {
  var finalOptions = exports.shallowCopy(defaults);
  for (var prop in options) {
    finalOptions[prop] = options[prop];
  }

  return finalOptions;
};

exports.escapeHtml = function (unsafe) {
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
exports.mod = function (number, mod) {
  return ((number % mod) + mod) % mod;
};

/**
 * Generates an array of integers from start to end inclusive
 */
exports.range = function (start, end) {
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
exports.stripQuotes = function (inputString) {
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
 * Return a random key name from an object.
 *
 * Slightly modified from: http://stackoverflow.com/a/15106541
 */

exports.randomKey = function (obj) {
  var keys = Object.keys(obj);
  return keys[keys.length * Math.random() << 0];
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
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
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
  String.prototype.repeat = function (count) {
    if (this === null) {
      throw new TypeError('can\'t convert ' + this + ' to object');
    }
    var str = '' + this;
    count = +count;
    if (count !== count) {
      count = 0;
    }
    if (count < 0) {
      throw new RangeError('repeat count must be non-negative');
    }
    if (count === Infinity) {
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
  /*eslint-disable */
  // Linter doesn't like our use of InternalError, even though we gate on its
  // existence.
  if (typeof(InternalError) !== 'undefined' && err instanceof InternalError &&
      err.message === 'too much recursion') {
    return true;
  }
  /*eslint-enable */

  // IE
  if (err instanceof Error &&
      err.message === 'Out of stack space') {
    return true;
  }

  return false;
};

// TODO(dave): move this logic to dashboard.
exports.getPegasusHost = function () {
  switch (window.location.hostname) {
    case 'studio.code.org':
    case 'learn.code.org':
      return 'code.org';
    default:
      var name = window.location.hostname.split('.')[0];
      switch (name) {
        case 'localhost':
          return 'localhost.code.org:3000';
        case 'development':
        case 'staging':
        case 'test':
        case 'levelbuilder':
          return name + '.code.org';
        case 'staging-studio':
          return 'staging.code.org';
        case 'test-studio':
          return 'test.code.org';
        case 'levelbuilder-studio':
          return 'levelbuilder.code.org';
        default:
          return null;
      }
  }
};

/**
 * IE9 throws an exception when trying to access the media field of a stylesheet
 */
exports.browserSupportsCssMedia = function () {
  var styleSheets = document.styleSheets;
  for (var i = 0; i < styleSheets.length; i++) {
    var rules = styleSheets[i].cssRules || styleSheets[i].rules;
    try {
      if (rules.length > 0) {
        // see if we can access media
        var media = rules[0].media;
      }
    } catch (e) {
      return false;
    }
  }
  return true;
};

/**
 * Remove escaped characters and HTML to convert some rendered text to what should appear in user-edited controls
 * @param text
 * @returns String that has no more escape characters and multiple divs converted to newlines
 */
exports.unescapeText = function (text) {
  var cleanedText = text;

  // Handling of line breaks:
  // In multiline text it's possible for the first line to render wrapped or unwrapped.
  //     Line 1
  //     Line 2
  //   Can render as any of:
  //     Line 1<div>Line 2</div>
  //     Line 1<br><div>Line 2</div>
  //     <div>Line 1</div><div>Line 2</div>
  //
  // Most blank lines are rendered as <div><br></div>
  //     Line 1
  //
  //     Line 3
  //   Can render as any of:
  //     Line 1<div><br></div><div>Line 3</div>
  //     Line 1<br><div><br></div><div>Line 3</div>
  //     <div>Line 1</div><div><br></div><div>Line 3</div>
  //
  // Leading blank lines render wrapped or as placeholder breaks and should be preserved
  //
  //     Line 2
  //   Renders as any of:
  //    <br><div>Line 2</div>
  //    <div><br></div><div>Line 2</div>

  // First, convert every <div> tag that isn't at the very beginning of the string
  // to a newline.  This avoids generating an incorrect blank line at the start
  // if the first line is wrapped in a <div>.
  cleanedText = cleanedText.replace(/(?!^)<div[^>]*>/gi, '\n');

  cleanedText = cleanedText.replace(/<[^>]+>/gi, ''); // Strip all other tags
  cleanedText = cleanedText.replace(/&nbsp;/gi, ' '); // Unescape nonbreaking spaces
  cleanedText = cleanedText.replace(/&gt;/gi, '>');   // Unescape >
  cleanedText = cleanedText.replace(/&lt;/gi, '<');   // Unescape <
  cleanedText = cleanedText.replace(/&amp;/gi, '&');  // Unescape & (must happen last!)
  return cleanedText;
};

/**
 * Escape special characters in a piece of text, and convert newlines to seperate divs
 * @param text
 * @returns String with special characters escaped and newlines converted divs
 */
exports.escapeText = function (text) {
  var escapedText = text.toString();
  escapedText = escapedText.replace(/&/g, '&amp;');   // Escape & (must happen first!)
  escapedText = escapedText.replace(/</g, '&lt;');    // Escape <
  escapedText = escapedText.replace(/>/g, '&gt;');    // Escape >
  escapedText = escapedText.replace(/ {2}/g,' &nbsp;'); // Escape doubled spaces

  // Now wrap each line except the first line in a <div>,
  // replacing blank lines with <div><br><div>
  var lines = escapedText.split('\n');
  var first = lines[0];
  var rest = lines.slice(1);

  // If first line is blank and not the only line, convert it to a <br> tag:
  if (first.length === 0 && lines.length > 1) {
    first = '<br>';
  }

  // Wrap the rest of the lines
  return first + rest.map(function (line) {
    return '<div>' + (line.length ? line : '<br>') + '</div>';
  }).join('');
};

/**
 * Converts degrees into radians.
 *
 * @param degrees - The degrees to convert to radians
 * @return `degrees` converted to radians
 */
exports.degreesToRadians = function (degrees) {
    return degrees * (Math.PI / 180);
};

/**
 * Simple wrapper around localStorage.setItem that catches any exceptions (for
 * example when we call setItem in Safari's private mode)
 * @return {boolean} True if we set successfully
 */
exports.trySetLocalStorage = function (item, value) {
  try {
    localStorage.setItem(item, value);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Generates a simple enum object
 * @example
 *   var Seasons = enum('SPRING', 'SUMMER', 'FALL', 'WINTER');
 *   Seasons.SPRING === 'SPRING';
 *   Seasons.SUMMER === 'SUMMER';
 *   // etc...
 */
exports.makeEnum = function () {
  var result = {}, key;
  for (var i = 0; i < arguments.length; i++) {
    key = String(arguments[i]);
    if (result[key]) {
      throw new Error('Key "' + key + '" occurred twice while constructing enum');
    }
    result[key] = key;
  }
  if (Object.freeze) {
    Object.freeze(result);
  }
  return result;
};

/**
 * If the string is too long, truncate it and append an ellipsis.
 * @param {string} inputText
 * @param {number} maxLength
 * @returns {string}
 */
exports.ellipsify = function (inputText, maxLength) {
  if (inputText && inputText.length > maxLength) {
    return inputText.substr(0, maxLength - 3) + "...";
  }
  return inputText || '';
};
