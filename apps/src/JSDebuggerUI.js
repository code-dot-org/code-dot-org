/** @file Debugger controls and debug console used in our rich JavaScript IDEs */
/* jshint
 funcscope: true,
 newcap: true,
 nonew: true,
 shadow: false,
 unused: true,
 eqeqeq: true,

 maxlen: 90,
 maxparams: 3,
 maxstatements: 200
 */
'use strict';

var DebugArea = require('./applab/DebugArea');

/**
 * Debugger controls and debug console used in our rich JavaScript IDEs, like
 * App Lab, Game Lab, etc.
 * @constructor
 */
var JSDebuggerUI = module.exports = function () {
  /**
   * Helper that handles open/shut actions for debugger UI
   * @type {DebugArea}
   * @private
   */
  this.debugOpenShutController_ = null;
};

/**
 * Generate DOM element markup from an ejs file for the debug area.
 * @param {!function} assetUrl - Helper for getting asset URLs.
 * @param {!boolean} showButtons - Whether to show the debug buttons
 * @param {!boolean} showConsole - Whether to show the debug console
 * @returns {string} of HTML markup to be embedded in page.html.ejs
 */
JSDebuggerUI.prototype.getMarkup = function (assetUrl, showButtons, showConsole) {
  return require('./JSDebuggerUI.html.ejs')({
    assetUrl: assetUrl,
    debugButtons: showButtons,
    debugConsole: showConsole
  });
};

/**
 * Post-DOM initialization, which allows this controller to grab all the DOM
 * references it needs, bind handlers, and create any subordinate controllers.
 */
JSDebuggerUI.prototype.initializeAfterDOMCreated = function () {
  this.debugOpenShutController_ = new DebugArea(
      document.getElementById('debug-area'),
      document.getElementById('codeTextbox'));
};

/**
 * Opens the debugger area if it is closed.
 */
JSDebuggerUI.prototype.ensureOpen = function () {
  if (this.debugOpenShutController_.isShut()) {
    this.debugOpenShutController_.snapOpen();
  }
};