/**
 * @file Replacement for application.js.erb in dashboard as much as possible.
 *       Code added here will be loaded for (almost) every page in dashboard,
 *       so use sparingly!
 *
 * Note: This is included _after_ application.js.erb during our transition period,
 * so when moving things preserve the include order as much as possible.
 */
'use strict';

// Require this first at each bundle entry point for full ES6 support.
require("babel-polyfill");

import $ from 'jquery';
var _ = require('lodash');

// Shim window.console to be safe in IE
require('./consoleShim')(window);

var Sounds = require('@cdo/apps/Sounds');
var activateReferenceAreaOnLoad = require('./reference_area');

window.React = require('react');
window.ReactDOM = require('react-dom');
window.Radium = require('radium');

// TODO (bbuchanan): Stop including these components in a global way, just
//                   require them specifically where needed.
require('./components/abuse_error');
require('./components/report_abuse_form');
require('./components/SendToPhone');
require('./components/small_footer');
require('./components/GridEditor');
require('./components/Attachments');

// Prevent callstack exceptions when opening multiple dialogs
// http://stackoverflow.com/a/15856139/2506748
$.fn.modal.Constructor.prototype.enforceFocus = function () {};

window.dashboard = window.dashboard || {};
window.dashboard.clientState = require('./clientState.js');
window.dashboard.createCallouts = require('./callouts');
window.dashboard.hashEmail = require('./hashEmail');
window.dashboard.funometer = require('./funometerPercentagesByDay');
window.dashboard.levelCompletions = require('./levelCompletions');
window.dashboard.popupWindow = require('./popup-window');
window.dashboard.progress = require('./progress');
window.dashboard.reporting = require('./reporting');
window.dashboard.utils = {
  debounce: _.debounce,
  throttle: _.throttle
};
window.dashboard.header = require('./header');
window.dashboard.videos = require('./videos');
window.dashboard.assets = require('./assets');

// usages: _dialogHelper.js, frequency.js, text-compression.js, levelGroup.js, multi.js
// arguably each of the above files belongs in code-studio
window.Dialog = require('./dialog');

// When we were in browserify world, all modules in a bundle (i.e. code-studio-common)
// would get preloaded. In webpack, they're only loaded as needed. We were
// depending on these two modules being loaded when code-studio-common was
// included, so force that load here.
require('./levels/multi');
require('./levels/textMatch');

// Wrap existing window onerror caller with a script error check.  If we have a
// script error and a url, throw that so that we have the info in New Relic.
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
$(document).keydown(function (e) {
  if (e.keyCode === KEY_ESCAPE) {
    e.stopPropagation();
    e.preventDefault();
  }
});

setTimeout(function () {
  $('#codeApp .slow_load').show();
}, 10000);

activateReferenceAreaOnLoad();

window.CDOSounds = new Sounds();
