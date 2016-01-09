/**
 * @file Replacement for application.js.erb in dashboard as much as possible.
 *       Code added here will be loaded for (almost) every page in dashboard,
 *       so use sparingly!
 *
 * Note: This is included _after_ application.js.erb during our transition period,
 * so when moving things preserve the include order as much as possible.
 */
'use strict';
/* global Sounds */

require('./videos');

(function () {

  // Prevent callstack exceptions when opening multiple dialogs
  // http://stackoverflow.com/a/15856139/2506748
  $.fn.modal.Constructor.prototype.enforceFocus = function () {};

  // In IE console is only defined when developer tools is open. Define it as a
  // noop when undefined (otherwise exceptions get thrown)
  if (!window.console) {
    window.console = {};
  }
  if (!window.console.log) {
    window.console.log = function () { };
  }

  // Wrap existing window onerror caller with a script error check.  If we have a
  // script error and a url, throw that so that we have the info in new relic.
  var windowOnError = window.onerror;
  window.onerror = function (msg, url, ln) {
    if (/^Script error/.test(msg) && url) {
      arguments[0] = 'Script Error: ' + url;
    }
    if (windowOnError) {
      return windowOnError.apply(this, arguments);
    }
  };

  // Prevent escape from canceling page loads.
  var KEY_ESCAPE = 27;
  $(document).keydown(function(e) {
    if (e.keyCode === KEY_ESCAPE) {
      e.stopPropagation();
      e.preventDefault();
    }
  });

  setTimeout(function() {
    $('#codeApp .slow_load').show();
  }, 10000);

  window.CDOSounds = new Sounds();
})();
