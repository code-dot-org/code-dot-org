/**
 * @file Provide no-op fills for missing window.console methods.  Doesn't add
 *       any special functionality, just makes the console safe to use on our
 *       supported browsers.  Based on the fasted implementation I could find.
 *
 * @see http://jsperf.com/console-polyfill
 * @see https://getfirebug.com/wiki/index.php/Console_API
 */
'use strict';

/**
 * Call this method, passing in the window object, to fill missing console
 * methods with no-op functions.
 * @param {!Window} window
 */
module.exports = function (window) {
  // Add console if it doesn't exist
  var console = (window.console = window.console || {});

  // Add methods (based on the Firebug Console API) if they don't exist
  var methods = ['assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
    'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
    'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
    'timeStamp', 'trace', 'warn'];
  var method;
  for (var i = 0; i < methods.length; i++) {
    method = methods[i];
    if (!console[method]) {
      console[method] = function () {};
    }
  }
};
