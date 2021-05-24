import $ from 'jquery';
import Immutable from 'immutable';
import MD5 from 'crypto-js/md5';
import RGBColor from 'rgbcolor';
import {Position} from './constants';
import {dataURIFromURI} from './imageUtils';
import './polyfills';

/**
 * Checks whether the given subsequence is truly a subsequence of the given sequence,
 * and whether the elements appear in the same order as the sequence.
 *
 * @param sequence Array - The sequence that the subsequence should be a subsequence of.
 * @param subsequence Array - A subsequence of the given sequence.
 * @returns boolean - whether or not subsequence is really a subsequence of sequence.
 */
export function isSubsequence(sequence, subsequence) {
  let superIndex = 0,
    subIndex = 0;
  while (subIndex < subsequence.length) {
    while (
      superIndex < sequence.length &&
      subsequence[subIndex] !== sequence[superIndex]
    ) {
      superIndex++;
    }
    if (superIndex >= sequence.length) {
      // we went off the end while searching
      return false;
    }
    subIndex++;
    superIndex++;
  }
  return true;
}

export function shallowCopy(source) {
  var result = {};
  for (var prop in source) {
    result[prop] = source[prop];
  }

  return result;
}

/**
 * Returns a clone of the object, stripping any functions on it.
 */
export function cloneWithoutFunctions(object) {
  return JSON.parse(JSON.stringify(object));
}

/**
 * Returns a string with a double quote before and after.
 */
export function quote(str) {
  return '"' + str + '"';
}

/**
 * Returns a new object with the properties from defaults overridden by any
 * properties in options. Leaves defaults and options unchanged.
 * NOTE: For new code, use Object.assign({}, defaults, options) instead
 */
export function extend(defaults, options) {
  var finalOptions = exports.shallowCopy(defaults);
  for (var prop in options) {
    finalOptions[prop] = options[prop];
  }

  return finalOptions;
}

/**
 * Replaces special characters in string by HTML entities.
 * List of special characters is taken from
 * https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html.
 * @param {string} unsafe - The string to escape.
 * @returns {string} Escaped string. Returns an empty string if input is null or undefined.
 */
export function escapeHtml(unsafe) {
  return unsafe
    ? unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/\//g, '&#47;')
    : '';
}

/**
 * Version of modulo which, unlike javascript's `%` operator,
 * will always return a positive remainder.
 * @param number
 * @param mod
 */
export function mod(number, mod) {
  return ((number % mod) + mod) % mod;
}

/**
 * Generates an array of integers from start to end inclusive
 */
export function range(start, end) {
  var ints = [];
  for (var i = start; i <= end; i++) {
    ints.push(i);
  }
  return ints;
}

/**
 * Given two functions, generates a function that returns the result of the
 * second function if and only if the first function returns true
 */
export function executeIfConditional(conditional, fn) {
  return function() {
    if (conditional()) {
      return fn.apply(this, arguments);
    }
  };
}

/**
 * Removes all single and double quotes from a string
 * @param inputString
 * @returns {string} string without quotes
 */
export function stripQuotes(inputString) {
  return inputString.replace(/["']/g, '');
}

/**
 * Defines an inheritance relationship between parent class and this class.
 */
Function.prototype.inherits = function(parent) {
  this.prototype = Object.create(parent.prototype);
  this.prototype.constructor = this;
  this.superPrototype = parent.prototype;
};

/**
 * Wrap a couple of our Blockly number validators to allow for ???.  This is
 * done so that level builders can specify required blocks with wildcard fields.
 */
export function wrapNumberValidatorsForLevelBuilder() {
  var nonNeg = Blockly.FieldTextInput.nonnegativeIntegerValidator;
  var numVal = Blockly.FieldTextInput.numberValidator;

  Blockly.FieldTextInput.nonnegativeIntegerValidator = function(text) {
    if (text === '???') {
      return text;
    }
    return nonNeg(text);
  };

  Blockly.FieldTextInput.numberValidator = function(text) {
    if (text === '???') {
      return text;
    }
    return numVal(text);
  };
}

/**
 * Return a random value from an array
 */
export function randomValue(values) {
  let key = Math.floor(Math.random() * values.length);
  return values[key];
}

/**
 * Return a random key name from an object.
 */
export function randomKey(obj) {
  return randomValue(Object.keys(obj));
}

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
export function createUuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function fireResizeEvent() {
  var ev = document.createEvent('Event');
  ev.initEvent('resize', true, true);
  window.dispatchEvent(ev);
}

/**
 * Similar to val || defaultVal, except it's gated on whether or not val is
 * undefined instead of whether val is falsey.
 * @returns {*} val if not undefined, otherwise defaultVal
 */
export function valueOr(val, defaultVal) {
  return val === undefined ? defaultVal : val;
}

/**
 * Attempts to analyze whether or not err represents infinite recursion having
 * occurred. This error differs per browser, and it's possible that we don't
 * properly discover all cases.
 * Note: Other languages probably have localized messages, meaning we won't
 * catch them.
 */
export function isInfiniteRecursionError(err) {
  // Chrome/Safari: message ends in a period in Safari, not in Chrome
  if (
    err instanceof RangeError &&
    /^Maximum call stack size exceeded/.test(err.message)
  ) {
    return true;
  }

  // Firefox
  /*eslint-disable */
  // Linter doesn't like our use of InternalError, even though we gate on its
  // existence.
  if (
    typeof InternalError !== 'undefined' &&
    err instanceof InternalError &&
    err.message === 'too much recursion'
  ) {
    return true;
  }
  /*eslint-enable */

  // IE
  if (err instanceof Error && err.message === 'Out of stack space') {
    return true;
  }

  return false;
}

/**
 * Remove escaped characters and HTML to convert some rendered text to what should appear in user-edited controls
 * @param text
 * @returns String that has no more escape characters and multiple divs converted to newlines
 */
export function unescapeText(text) {
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
  cleanedText = cleanedText.replace(/&gt;/gi, '>'); // Unescape >
  cleanedText = cleanedText.replace(/&lt;/gi, '<'); // Unescape <
  cleanedText = cleanedText.replace(/&amp;/gi, '&'); // Unescape & (must happen last!)
  return cleanedText;
}

/**
 * Escape special characters in a piece of text, and convert newlines to seperate divs
 * @param text
 * @returns String with special characters escaped and newlines converted divs
 */
export function escapeText(text) {
  var escapedText = text.toString();
  escapedText = escapedText.replace(/&/g, '&amp;'); // Escape & (must happen first!)
  escapedText = escapedText.replace(/</g, '&lt;'); // Escape <
  escapedText = escapedText.replace(/>/g, '&gt;'); // Escape >
  escapedText = escapedText.replace(/ {2}/g, ' &nbsp;'); // Escape doubled spaces

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
  return (
    first +
    rest
      .map(function(line) {
        return '<div>' + (line.length ? line : '<br>') + '</div>';
      })
      .join('')
  );
}

export function showGenericQtip(targetElement, title, message, position) {
  $(targetElement)
    .qtip({
      content: {
        text: `
        <h4>${title}</h4>
        <p>${message}</p>
      `,
        title: {
          button: $('<div class="tooltip-x-close"/>')
        }
      },
      position,
      style: {
        classes: 'cdo-qtips',
        tip: {
          width: 20,
          height: 20
        }
      },
      hide: {
        event: 'unfocus'
      },
      show: false // don't show on mouseover
    })
    .qtip('show');
}

export function showUnusedBlockQtip(targetElement) {
  const msg = require('@cdo/locale');
  const title = msg.unattachedBlockTipTitle();
  const message = msg.unattachedBlockTipBody();
  const position = {
    my: 'bottom left',
    at: 'top right'
  };

  showGenericQtip(targetElement, title, message, position);
}

/**
 * @param {string} key
 * @param {string} defaultValue
 * @return {string}
 */
export function tryGetLocalStorage(key, defaultValue) {
  if (defaultValue === undefined) {
    throw 'tryGetLocalStorage requires defaultValue';
  }
  let returnValue = defaultValue;
  try {
    returnValue = localStorage.getItem(key);
  } catch (e) {
    // Ignore, return default
  }
  return returnValue;
}

/**
 * Simple wrapper around localStorage.setItem that catches any exceptions (for
 * example when we call setItem in Safari's private mode)
 * @param {string} item
 * @param {string} value
 * @return {boolean} True if we set successfully
 */
export function trySetLocalStorage(item, value) {
  try {
    localStorage.setItem(item, value);
    return true;
  } catch (e) {
    return false;
  }
}

export function tryGetSessionStorage(key, defaultValue) {
  if (defaultValue === undefined) {
    throw 'tryGetSessionStorage requires defaultValue';
  }
  let returnValue = defaultValue;
  try {
    returnValue = sessionStorage.getItem(key);
  } catch (e) {
    // Ignore, return default
  }
  return returnValue;
}

/**
 * Simple wrapper around sessionStorage.setItem that catches the quota exceeded
 * exceptions we get when we call setItem in Safari's private mode.
 * @param {string} item
 * @param {string} value
 * @return {boolean} True if we set successfully
 */
export function trySetSessionStorage(item, value) {
  try {
    sessionStorage.setItem(item, value);
    return true;
  } catch (e) {
    if (e.name !== 'QuotaExceededError') {
      throw e;
    }
    return false;
  }
}

/**
 * Generates a simple enum object
 * @return {Object<String, String>}
 * @example
 *   var Seasons = enum('SPRING', 'SUMMER', 'FALL', 'WINTER');
 *   Seasons.SPRING === 'SPRING';
 *   Seasons.SUMMER === 'SUMMER';
 *   // etc...
 */
export function makeEnum() {
  var result = {},
    key;
  for (var i = 0; i < arguments.length; i++) {
    key = String(arguments[i]);
    if (result[key]) {
      throw new Error(
        'Key "' + key + '" occurred twice while constructing enum'
      );
    }
    result[key] = key;
  }
  if (Object.freeze) {
    Object.freeze(result);
  }
  return result;
}

/**
 * If the string is too long, truncate it and append an ellipsis.
 * @param {string} inputText
 * @param {number} maxLength
 * @returns {string}
 */
export function ellipsify(inputText, maxLength) {
  if (inputText && inputText.length > maxLength) {
    return inputText.substr(0, maxLength - 3) + '...';
  }
  return inputText || '';
}

/**
 * Returns deep merge of two objects, concatenating rather than overwriting
 * array properites. Does not mutate either object.
 *
 * Note: new properties in overrides are always added to end, not in-order.
 *
 * TODO(bjordan): Replace with _.mergeWith when lodash upgraded to 4.x.
 *
 * Note: may become default behavior of mergeDeep in future immutable versions.
 *   @see https://github.com/facebook/immutable-js/issues/406
 *
 * @param {Object} baseObject
 * @param {Object} overrides
 * @returns {Object} original object (now modified in-place)
 */
export function deepMergeConcatArrays(baseObject, overrides) {
  function deepConcatMerger(a, b) {
    const isList = Immutable.List.isList;
    if (isList(a) && isList(b)) {
      return a.concat(b);
    }
    if (a && a.mergeWith) {
      return a.mergeWith(deepConcatMerger, b);
    }
    return b;
  }

  var baseImmutable = Immutable.fromJS(baseObject);
  return baseImmutable.mergeWith(deepConcatMerger, overrides).toJS();
}

/**
 * Creates a new event in a cross-browswer-compatible way.
 *
 * createEvent functionality is officially deprecated in favor of
 * the Event constructor, but some older browsers do not yet support
 * event constructors. Attempt to use the new functionality, fall
 * back to the old if it fails.
 *
 * @param {String} type
 * @param {boolean} [bubbles=false]
 * @param {boolean} [cancelable=false]
 */
export function createEvent(type, bubbles = false, cancelable = false) {
  var customEvent;
  try {
    customEvent = new Event(type, {bubbles, cancelable});
  } catch (e) {
    customEvent = document.createEvent('Event');
    customEvent.initEvent(type, bubbles, cancelable);
  }
  return customEvent;
}

/**
 * @param {Object} vector with x and y coordinates
 * @returns {Object} vector with x and y coordinates and length 1 (or 0 if
 *   the argument also had length 0)
 */
export function normalize(vector) {
  var mag = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
  if (mag === 0) {
    return vector;
  }
  return {
    x: vector.x / mag,
    y: vector.y / mag
  };
}

/**
 * @param {number} position selected from constants.Position
 * @param {number} containerWidth width of the element we are
 *        positioning within
 * @param {number} spriteWidth width of the element being positioned
 * @returns {number} left-most point of sprite given position constant
 */
export function xFromPosition(position, containerWidth = 0, spriteWidth = 0) {
  switch (position) {
    case Position.OUTTOPOUTLEFT:
    case Position.TOPOUTLEFT:
    case Position.MIDDLEOUTLEFT:
    case Position.BOTTOMOUTLEFT:
    case Position.OUTBOTTOMOUTLEFT:
      return -spriteWidth;
    case Position.OUTTOPLEFT:
    case Position.TOPLEFT:
    case Position.MIDDLELEFT:
    case Position.BOTTOMLEFT:
    case Position.OUTBOTTOMLEFT:
      return 0;
    case Position.OUTTOPCENTER:
    case Position.TOPCENTER:
    case Position.MIDDLECENTER:
    case Position.BOTTOMCENTER:
    case Position.OUTBOTTOMCENTER:
      return (containerWidth - spriteWidth) / 2;
    case Position.OUTTOPRIGHT:
    case Position.TOPRIGHT:
    case Position.MIDDLERIGHT:
    case Position.BOTTOMRIGHT:
    case Position.OUTBOTTOMRIGHT:
      return containerWidth - spriteWidth;
    case Position.OUTTOPOUTRIGHT:
    case Position.TOPOUTRIGHT:
    case Position.MIDDLEOUTRIGHT:
    case Position.BOTTOMOUTRIGHT:
    case Position.OUTBOTTOMOUTRIGHT:
      return containerWidth;
  }
}

/**
 * @param {number} position selected from constants.Position
 * @param {number} containerHeight height of the element we are
 *        positioning within
 * @param {number} spriteHeight height of the element being positioned
 * @returns {number} top-most point of sprite given position constant
 */
export function yFromPosition(position, containerHeight = 0, spriteHeight = 0) {
  switch (position) {
    case Position.OUTTOPOUTLEFT:
    case Position.OUTTOPLEFT:
    case Position.OUTTOPCENTER:
    case Position.OUTTOPRIGHT:
    case Position.OUTTOPOUTRIGHT:
      return -spriteHeight;
    case Position.TOPOUTLEFT:
    case Position.TOPLEFT:
    case Position.TOPCENTER:
    case Position.TOPRIGHT:
    case Position.TOPOUTRIGHT:
      return 0;
    case Position.MIDDLEOUTLEFT:
    case Position.MIDDLELEFT:
    case Position.MIDDLECENTER:
    case Position.MIDDLERIGHT:
    case Position.MIDDLEOUTRIGHT:
      return (containerHeight - spriteHeight) / 2;
    case Position.BOTTOMOUTLEFT:
    case Position.BOTTOMLEFT:
    case Position.BOTTOMCENTER:
    case Position.BOTTOMRIGHT:
    case Position.BOTTOMOUTRIGHT:
      return containerHeight - spriteHeight;
    case Position.OUTBOTTOMOUTLEFT:
    case Position.OUTBOTTOMLEFT:
    case Position.OUTBOTTOMCENTER:
    case Position.OUTBOTTOMRIGHT:
    case Position.OUTBOTTOMOUTRIGHT:
      return containerHeight;
  }
}

/**
 * Calculate the Levenshtein distance between two strings
 * @param {string} a
 * @param {string} b
 * @return {number} distance
 */
export function levenshtein(a, b) {
  if (!a || !b) {
    return (a || b).length;
  }

  const matrix = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
    if (i === 0) {
      continue;
    }

    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
      if (j === 0) {
        continue;
      }

      matrix[i][j] =
        b.charAt(i - 1) === a.charAt(j - 1)
          ? matrix[i - 1][j - 1]
          : Math.min(
              matrix[i - 1][j - 1] + 1,
              matrix[i][j - 1] + 1,
              matrix[i - 1][j] + 1
            );
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Bisects the given array based on the given conditional
 * @param {Array} array
 * @param {Function} conditional
 * @return {Array.<Array>} an array with two elements; the first is an
 *         array containing those values for which the given conditional
 *         function is true and the second is an array containing those
 *         values for which it is false
 */
export function bisect(array, conditional) {
  const positive = array.filter(x => conditional(x));
  const negative = array.filter(x => !conditional(x));
  return [positive, negative];
}

/**
 * Recursively flatten the given array
 * from https://stackoverflow.com/a/15030117/1810460
 */
export function flatten(array) {
  return array.reduce(
    (flat, toFlatten) =>
      flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten),
    []
  );
}

/**
 * Helper function that wraps window.location.reload, which we cannot stub
 * in unit tests if we're running them in Chrome.
 */
export function reload() {
  window.location.reload();
}

export function currentLocation() {
  return window.location;
}

/**
 * Helper that wraps window.open, for stubbing in unit tests.
 */
export function windowOpen(...args) {
  return window.open(...args);
}

/**
 * Wrapper for window.location.href which we can stub in unit tests.
 * @param {string} href Location to navigate to.
 */
export function navigateToHref(href) {
  if (!IN_UNIT_TEST) {
    window.location.href = href;
  }
}

/**
 * Takes a simple object and returns it represented as a chain of url query
 * params, including ? and & as necessary. Does not perform escaping. Examples:
 * {} -> ''
 * {a: 1} -> '?a=1'
 * {a: 1, b: 'c'} -> '?a=1&b=c'
 *
 * @param {Object} params Object to stringify.
 */
export function stringifyQueryParams(params) {
  if (!params) {
    return '';
  }
  const keys = Object.keys(params);
  if (!keys.length) {
    return '';
  }
  return '?' + keys.map(key => `${key}=${params[key]}`).join('&');
}

/**
 * Takes a link, looks for params already in the current URL
 * and generates a new link with those params
 */
export function linkWithQueryParams(link) {
  const queryParams = window.location.search || '';
  return link + queryParams;
}

/**
 * Resets the animation of an aniGif by unsetting and setting the src
 * @param {Element} element the <img> element that needs to be reset
 */
export function resetAniGif(element) {
  if (!element) {
    return;
  }
  const src = element.src;
  element.src = '#';
  setTimeout(() => (element.src = src), 0);
}

/**
 * Compute a color an arbitrary distance between from and to, useful for
 * react-motion based color transitions.
 *
 * @param {string} from a hex color string
 * @param {string} to another hex color string
 * @param {number} value A number between 0 and 1, expressing how far along
 *   the way from 'from' to 'to' the returned color should be
 * @returns {string} a color between from and to
 */
export function interpolateColors(from, to, value) {
  const fromRGB = new RGBColor(from);
  const toRGB = new RGBColor(to);
  const r = fromRGB.r * (1 - value) + toRGB.r * value;
  const g = fromRGB.g * (1 - value) + toRGB.g * value;
  const b = fromRGB.b * (1 - value) + toRGB.b * value;
  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Return a random id which will be consistent for this browser tab or window as long as it remains
 * open, including if this page is reloaded or if we navigate away and then back to it. The id will
 * be different for other tabs, including tabs in other browsers or on other machines. Unfortunately,
 * duplicating a browser tab will result in two tabs with the same id, but this is not common.
 *
 * @returns {string} A string representing a float between 0 and 1.
 */
export function getTabId() {
  let tabId = tryGetSessionStorage('tabId', false);
  if (tabId) {
    return tabId;
  }
  trySetSessionStorage('tabId', Math.random() + '');
  return tryGetSessionStorage('tabId', false);
}

export function createHiddenPrintWindow(src) {
  dataURIFromURI(src).then(data => {
    var iframe = $(
      '<iframe style="position: absolute; visibility: hidden;"></iframe>'
    ); // Created a hidden iframe with just the desired image as its contents
    iframe.appendTo('body');
    iframe[0].contentWindow.document.write(
      `<img src="${data}" style="border: 1px solid #000;" onload="if (document.execCommand('print', false, null)) {  } else { window.print(); }"/>`
    );
  });
}

export function calculateOffsetCoordinates(element, clientX, clientY) {
  const rect = element.getBoundingClientRect();
  return {
    x: Math.round(((clientX - rect.left) * element.offsetWidth) / rect.width),
    y: Math.round(((clientY - rect.top) * element.offsetHeight) / rect.height)
  };
}

export function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Detects profanity in a string.
 * @param {string} text
 * @param {string} locale Optional.
 * @param {string} authenticityToken Rails authenticity token. Optional.
 * @returns {Array<string>|null} Array of profane words.
 */
export const findProfanity = (text, locale, authenticityToken = null) => {
  let request = {
    url: '/profanity/find',
    method: 'POST',
    contentType: 'application/json;charset=UTF-8',
    data: JSON.stringify({text, locale})
  };

  if (authenticityToken) {
    request.headers = {'X-CSRF-Token': authenticityToken};
  }

  return $.ajax(request);
};

/**
 * Convert a string to an MD5 hash.
 * @param {string} str
 * @returns {string} A string representing an MD5 hash.
 */
export function hashString(str) {
  return MD5(str).toString();
}

/*
 * Add tooltip toggles to vocabulary definitions, as generated by the
 * MarkdownPreprocessor
 * @see https://getbootstrap.com/2.3.2/javascript.html#tooltips
 */
export function tooltipifyVocabulary() {
  $('.vocab').each(function() {
    $(this).tooltip({placement: 'bottom'});
  });
}
