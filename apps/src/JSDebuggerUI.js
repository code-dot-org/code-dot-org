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
var Slider = require('./slider');

/**
 * Debugger controls and debug console used in our rich JavaScript IDEs, like
 * App Lab, Game Lab, etc.
 * @constructor
 */
var JSDebuggerUI = module.exports = function () {
  /**
   * Helper that handles open/shut actions for debugger UI
   * @private {DebugArea}
   */
  this.debugOpenShutController_ = null;

  /**
   * Root element for debug UI: div#debug-area
   * @private {HTMLDivElement}
   */
  this.rootDiv_ = null;

  /**
   * Container for debug console output.
   * @private {HTMLDivElement}
   */
  this.debugOutputDiv_ = null;
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
 * @param {!Object} options
 * @param {number} [options.defaultStepSpeedPercent]
 */
JSDebuggerUI.prototype.initializeAfterDOMCreated = function (options) {
  // Get references to important elements of the DOM
  this.rootDiv_ = document.getElementById('debug-area');
  this.debugOutputDiv_ = this.rootDiv_.querySelector('#debug-output');

  // Create controller for open/shut behavior of debug area
  this.debugOpenShutController_ = new DebugArea(
      this.rootDiv_,
      document.getElementById('codeTextbox'));

  // Initialize debug speed slider
  var slider = this.rootDiv_.querySelector('#applab-slider');
  if (slider) {
    var sliderXOffset = 10,
        sliderYOffset = 22,
        sliderWidth = 130;
    this.speedSlider_ = new Slider(sliderXOffset, sliderYOffset, sliderWidth,
        slider);

    // Change default speed (eg Speed up levels that have lots of steps).
    if (options.defaultStepSpeedPercent) {
      this.setStepSpeedPercent(options.defaultStepSpeedPercent);
    }
  }
};

/**
 * Get the step delay in milliseconds from the speed slider in the debugger UI.
 * If no speed slider is present, returns undefined.
 * @return {number|undefined}
 */
JSDebuggerUI.prototype.getStepDelay = function () {
  if (this.speedSlider_) {
    return JSDebuggerUI.stepDelayFromSliderPercent(this.speedSlider_.getValue());
  }
  return undefined;
};

/**
 * Set the speed slider position.
 * @param {!number} percent - range 0.0-1.0
 */
JSDebuggerUI.prototype.setStepSpeedPercent = function (percent) {
  if (this.speedSlider_) {
    this.speedSlider_.setValue(percent);
  }
};

/**
 * Exponential conversion from slider position as a percentile to a step delay
 * in milliseconds.
 * @param {!number} stepSpeedPercentage range 0.0-1.0
 * @returns {number} step delay in milliseconds
 */
JSDebuggerUI.stepDelayFromSliderPercent = function (stepSpeedPercentage) {
  return 300 * Math.pow(1 - stepSpeedPercentage, 2);
};

/**
 * Opens the debugger area if it is closed.
 */
JSDebuggerUI.prototype.ensureOpen = function () {
  if (this.debugOpenShutController_.isShut()) {
    this.debugOpenShutController_.snapOpen();
  }
};

/**
 * Given some object or message, attempt to log it both to the browser console
 * and to the user-facing debug console.
 * @param {*} output
 */
JSDebuggerUI.prototype.log = function (output) {
  // first pass through to the real browser console log if available:
  if (console && console.log) {
    console.log(output);
  }

  // then put it in the debug console visible to the user:
  if (this.debugOutputDiv_) {
    if (this.debugOutputDiv_.textContent.length > 0) {
      this.debugOutputDiv_.textContent += '\n';
    }
    this.debugOutputDiv_.textContent += stringifyNonStrings(output);

    this.debugOutputDiv_.scrollTop = this.debugOutputDiv_.scrollHeight;
  }
};

/**
 * @param {*} object
 * @returns {string}
 */
function stringifyNonStrings(object) {
  if (typeof object === 'string' || object instanceof String) {
    return object;
  } else {
    return JSON.stringify(object);
  }
}
