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

var constants = require('./constants');
var DebugArea = require('./DebugArea');
var dom = require('./dom');
var JSInterpreter = require('./JSInterpreter');
var Slider = require('./slider');
var utils = require('./utils');

var KeyCodes = constants.KeyCodes;
var StepType = JSInterpreter.StepType;

/** @const {number} */
var MIN_DEBUG_AREA_HEIGHT = 120;
/** @const {number} */
var MAX_DEBUG_AREA_HEIGHT = 400;

/**
 * Debugger controls and debug console used in our rich JavaScript IDEs, like
 * App Lab, Game Lab, etc.
 * @param {!function} getJSInterpreter - Must be a function that returns the
 *        current active interpreter, or a falsy value if no interpreter is
 *        running.
 * @param {!function} runApp - callback for "launching" the app, which is used
 *        by the "Step In" button when the app isn't running.
 * @constructor
 */
var JSDebuggerUI = module.exports = function (getJSInterpreter, runApp) {

  /**
   * Function for getting the active JSInterpreter (which may get replaced on a
   * regular basis, i.e. for each run).  Should return undefined/null if no
   * interpreter is currently running.
   * @private {function}
   */
  this.getJSInterpreter_ = getJSInterpreter;

  /**
   * Callback for "launching" the app, used by the "Step In" button when the app
   * isn't currently running.
   * @private {function}
   */
  this.runApp_ = runApp;

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
  this.resizeBar_ = this.rootDiv_.querySelector('#debugResizeBar');
  this.pauseButton_ = this.rootDiv_.querySelector('#pauseButton');
  this.continueButton_ = this.rootDiv_.querySelector('#continueButton');
  this.stepInButton_ = this.rootDiv_.querySelector('#stepInButton');
  this.stepOverButton_ = this.rootDiv_.querySelector('#stepOverButton');
  this.stepOutButton_ = this.rootDiv_.querySelector('#stepOutButton');
  this.spinner_ = this.rootDiv_.querySelector('#running-spinner');
  this.pausedIcon_ = this.rootDiv_.querySelector('#paused-icon');

  // Create controller for open/shut behavior of debug area
  this.debugOpenShutController_ = new DebugArea(
      this.rootDiv_,
      document.getElementById('codeTextbox'));

  // Initialize debug speed slider
  var slider = this.rootDiv_.querySelector('#speed-slider');
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

  // Attach keydown handler for debug console input area
  var debugInput = this.rootDiv_.querySelector('#debug-input');
  if (debugInput) {
    debugInput.addEventListener('keydown', this.onDebugInputKeyDown.bind(this));
  }

  // Attach handlers for the debug area resize control
  if (this.resizeBar_) {
    dom.addMouseDownTouchEvent(this.resizeBar_,
        this.onMouseDownDebugResizeBar.bind(this));

    // Can't use dom.addMouseUpTouchEvent() because it will preventDefault on
    // all touchend events on the page, breaking click events...
    document.body.addEventListener('mouseup',
        this.onMouseUpDebugResizeBar.bind(this));
    var mouseUpTouchEventName = dom.getTouchEventName('mouseup');
    if (mouseUpTouchEventName) {
      document.body.addEventListener(mouseUpTouchEventName,
          this.onMouseUpDebugResizeBar.bind(this));
    }
  }

  // Attach handler for console clear button
  var clearButton = this.rootDiv_.querySelector('#clear-console-header');
  if (clearButton) {
    dom.addClickTouchEvent(clearButton, this.clearDebugOutput.bind(this));
  }

  // Attach handlers for debugger controls
  if (this.pauseButton_ && this.continueButton_ && this.stepInButton_ &&
      this.stepOverButton_ && this.stepOutButton_) {
    dom.addClickTouchEvent(this.pauseButton_, this.onPauseContinueButton.bind(this));
    dom.addClickTouchEvent(this.continueButton_, this.onPauseContinueButton.bind(this));
    dom.addClickTouchEvent(this.stepInButton_, this.onStepInButton.bind(this));
    dom.addClickTouchEvent(this.stepOverButton_, this.onStepOverButton.bind(this));
    dom.addClickTouchEvent(this.stepOutButton_, this.onStepOutButton.bind(this));
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

/**
 * Handler for key events in the debug console input box.
 * @param {KeyboardEvent} e
 */
JSDebuggerUI.prototype.onDebugInputKeyDown = function (e) {
  var input = e.target.textContent;
  if (e.keyCode === KeyCodes.ENTER) {
    e.preventDefault();
    pushDebugConsoleHistory(input);
    e.target.textContent = '';
    this.log('> ' + input);
    var jsInterpreter = this.getJSInterpreter_();
    if (jsInterpreter) {
      try {
        var result = jsInterpreter.evalInCurrentScope(input);
        this.log('< ' + String(result));
      } catch (err) {
        this.log('< ' + String(err));
      }
    } else {
      this.log('< (not running)');
    }
  }
  if (e.keyCode === KeyCodes.UP) {
    updateDebugConsoleHistory(input);
    e.target.textContent = moveUpDebugConsoleHistory(input);
  }
  if (e.keyCode === KeyCodes.DOWN) {
    updateDebugConsoleHistory(input);
    e.target.textContent = moveDownDebugConsoleHistory(input);
  }
};

//Debug console history
var consoleHistory = {
  history: [],
  currentIndex: 0
};

function pushDebugConsoleHistory(commandText) {
  consoleHistory.currentIndex = consoleHistory.history.length + 1;
  consoleHistory.history[consoleHistory.currentIndex - 1] = commandText;
}

function updateDebugConsoleHistory(commandText) {
  if (typeof consoleHistory.history[consoleHistory.currentIndex]!== 'undefined') {
    consoleHistory.history[consoleHistory.currentIndex] = commandText;
  }
}

function moveUpDebugConsoleHistory(currentInput) {
  if (consoleHistory.currentIndex > 0) {
    consoleHistory.currentIndex -= 1;
  }
  if (typeof consoleHistory.history[consoleHistory.currentIndex] !== 'undefined') {
    return consoleHistory.history[consoleHistory.currentIndex];
  }
  return currentInput;
}

function moveDownDebugConsoleHistory(currentInput) {
  if (consoleHistory.currentIndex < consoleHistory.history.length) {
    consoleHistory.currentIndex += 1;
  }
  if (consoleHistory.currentIndex === consoleHistory.history.length &&
      currentInput === consoleHistory.history[consoleHistory.currentIndex - 1]) {
    return '';
  }
  if (typeof consoleHistory.history[consoleHistory.currentIndex] !== 'undefined') {
    return consoleHistory.history[consoleHistory.currentIndex];
  }
  return currentInput;
}

/** @type {boolean} */
var draggingDebugResizeBar = false;

/** @type {function} */
var boundMouseMoveHandler;

/** @type {string} */
var mouseMoveTouchEventName;

JSDebuggerUI.prototype.onMouseDownDebugResizeBar = function (event) {
  // When we see a mouse down in the resize bar, start tracking mouse moves:
  var eventSourceElm = event.srcElement || event.target;
  if (eventSourceElm.id === 'debugResizeBar') {
    draggingDebugResizeBar = true;
    boundMouseMoveHandler = this.onMouseMoveDebugResizeBar.bind(this);
    document.body.addEventListener('mousemove', boundMouseMoveHandler);
    mouseMoveTouchEventName = dom.getTouchEventName('mousemove');
    if (mouseMoveTouchEventName) {
      document.body.addEventListener(mouseMoveTouchEventName,
          boundMouseMoveHandler);
    }

    event.preventDefault();
  }
};

/**
 *  Handle mouse moves while dragging the debug resize bar.
 */
JSDebuggerUI.prototype.onMouseMoveDebugResizeBar = function (event) {
  var codeApp = document.getElementById('codeApp');
  var codeTextbox = document.getElementById('codeTextbox');

  var rect = this.resizeBar_.getBoundingClientRect();
  var offset = (parseInt(window.getComputedStyle(codeApp).bottom, 10) || 0) -
      rect.height / 2;
  var newDbgHeight = Math.max(MIN_DEBUG_AREA_HEIGHT,
      Math.min(MAX_DEBUG_AREA_HEIGHT,
          (window.innerHeight - event.pageY) - offset));

  if (this.debugOpenShutController_.isShut()) {
    this.debugOpenShutController_.snapOpen();
  }

  codeTextbox.style.bottom = newDbgHeight + 'px';
  this.rootDiv_.style.height = newDbgHeight + 'px';

  // Fire resize so blockly and droplet handle this type of resize properly:
  utils.fireResizeEvent();
};

JSDebuggerUI.prototype.onMouseUpDebugResizeBar = function () {
  // If we have been tracking mouse moves, remove the handler now:
  if (draggingDebugResizeBar) {
    document.body.removeEventListener('mousemove', boundMouseMoveHandler);
    if (mouseMoveTouchEventName) {
      document.body.removeEventListener(mouseMoveTouchEventName,
          boundMouseMoveHandler);
    }
    draggingDebugResizeBar = false;
  }
};

/**
 * Empty the contents of the debug console scrollback area.
 */
JSDebuggerUI.prototype.clearDebugOutput = function () {
  if (this.debugOutputDiv_) {
    this.debugOutputDiv_.textContent = '';
  }
};

JSDebuggerUI.prototype.onPauseContinueButton = function() {
  var jsInterpreter = this.getJSInterpreter_();
  if (jsInterpreter) {
    // We have code and are either running or paused
    if (jsInterpreter.paused &&
        jsInterpreter.nextStep === StepType.RUN) {
      jsInterpreter.paused = false;
    } else {
      jsInterpreter.paused = true;
      jsInterpreter.nextStep = StepType.RUN;
    }

    this.updatePauseUIState();
  }
};

JSDebuggerUI.prototype.updatePauseUIState = function() {
  var jsInterpreter = this.getJSInterpreter_();

  if (this.pauseButton_ && this.continueButton_ && this.spinner_ && this.pausedIcon_) {
    if (jsInterpreter.paused && jsInterpreter.nextStep === StepType.RUN) {
      this.pauseButton_.style.display = "none";
      this.continueButton_.style.display = "inline-block";
      this.continueButton_.disabled = false;
      this.spinner_.style.display = 'none';
      this.pausedIcon_.style.display = 'inline-block';
    } else {
      this.pauseButton_.style.display = "inline-block";
      this.pauseButton_.disabled = false;
      this.continueButton_.style.display = "none";
      this.spinner_.style.display = 'inline-block';
      this.pausedIcon_.style.display = 'none';
    }
  }

  if (this.stepInButton_ && this.stepOverButton_ && this.stepOutButton_) {
    this.stepInButton_.disabled = !jsInterpreter.paused;
    this.stepOverButton_.disabled = !jsInterpreter.paused;
    this.stepOutButton_.disabled = !jsInterpreter.paused;
  }
};

JSDebuggerUI.prototype.onStepOverButton = function() {
  var jsInterpreter = this.getJSInterpreter_();
  if (jsInterpreter) {
    jsInterpreter.paused = true;
    jsInterpreter.nextStep = StepType.OVER;
    this.updatePauseUIState();
  }
};

JSDebuggerUI.prototype.onStepInButton = function() {
  var jsInterpreter = this.getJSInterpreter_();
  if (!jsInterpreter) {
    this.runApp_();
    this.onPauseContinueButton();
    jsInterpreter = this.getJSInterpreter_();
  }
  jsInterpreter.paused = true;
  jsInterpreter.nextStep = StepType.IN;
  this.updatePauseUIState();
};

JSDebuggerUI.prototype.onStepOutButton = function() {
  var jsInterpreter = this.getJSInterpreter_();
  if (jsInterpreter) {
    jsInterpreter.paused = true;
    jsInterpreter.nextStep = StepType.OUT;
    this.updatePauseUIState();
  }
};
