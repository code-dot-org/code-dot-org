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

var _ = utils.getLodash();
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
 * Element getter for elements within the debugger UI, which caches its results
 * so that it's cheap to use over and over.
 * @type {Function}
 * @private
 * @param {string} selector
 * @returns {HTMLElement}
 */
JSDebuggerUI.prototype.getElement_ = _.memoize(function (selector) {
  var rootDiv = document.getElementById('debug-area');
  return rootDiv.querySelector(selector);
});

/**
 * Post-DOM initialization, which allows this controller to grab all the DOM
 * references it needs, bind handlers, and create any subordinate controllers.
 * @param {!Object} options
 * @param {number} [options.defaultStepSpeed] in range 0..1
 */
JSDebuggerUI.prototype.initializeAfterDOMCreated = function (options) {
  // Get references to important elements of the DOM
  this.rootDiv_ = document.getElementById('debug-area');

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
    if (options.defaultStepSpeed) {
      this.setStepSpeed(options.defaultStepSpeed);
    }
  }

  // Attach keydown handler for debug console input area
  var debugInput = this.rootDiv_.querySelector('#debug-input');
  if (debugInput) {
    debugInput.addEventListener('keydown', this.onDebugInputKeyDown.bind(this));
  }

  // Attach handlers for the debug area resize control
  var resizeBar = this.getElement_('#debugResizeBar');
  if (resizeBar) {
    dom.addMouseDownTouchEvent(resizeBar, this.onMouseDownDebugResizeBar.bind(this));

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
  var pauseButton = this.getElement_('#pauseButton');
  var continueButton = this.getElement_('#continueButton');
  var stepInButton = this.getElement_('#stepInButton');
  var stepOverButton = this.getElement_('#stepOverButton');
  var stepOutButton = this.getElement_('#stepOutButton');
  if (pauseButton && continueButton && stepInButton && stepOverButton && stepOutButton) {
    dom.addClickTouchEvent(pauseButton, this.onPauseContinueButton.bind(this));
    dom.addClickTouchEvent(continueButton, this.onPauseContinueButton.bind(this));
    dom.addClickTouchEvent(stepInButton, this.onStepInButton.bind(this));
    dom.addClickTouchEvent(stepOverButton, this.onStepOverButton.bind(this));
    dom.addClickTouchEvent(stepOutButton, this.onStepOutButton.bind(this));
  }
};

/**
 * Get the step delay in milliseconds from the speed slider in the debugger UI.
 * If no speed slider is present, returns undefined.
 * @return {number|undefined}
 */
JSDebuggerUI.prototype.getStepDelay = function () {
  if (this.speedSlider_) {
    return JSDebuggerUI.stepDelayFromStepSpeed(this.speedSlider_.getValue());
  }
  return undefined;
};

/**
 * Set the speed slider position.
 * @param {!number} speed - in range 0..1
 */
JSDebuggerUI.prototype.setStepSpeed = function (speed) {
  if (this.speedSlider_) {
    this.speedSlider_.setValue(speed);
  }
};

/**
 * Exponential conversion from step speed (as slider position, range 0..1) to
 * a step delay in milliseconds.
 * @param {!number} stepSpeed in range 0..1
 * @returns {number} step delay in milliseconds
 */
JSDebuggerUI.stepDelayFromStepSpeed = function (stepSpeed) {
  return 300 * Math.pow(1 - stepSpeed, 2);
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
  var debugOutputDiv = this.getElement_('#debug-output');
  if (debugOutputDiv) {
    if (debugOutputDiv.textContent.length > 0) {
      debugOutputDiv.textContent += '\n';
    }
    debugOutputDiv.textContent += stringifyNonStrings(output);

    debugOutputDiv.scrollTop = debugOutputDiv.scrollHeight;
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

  var resizeBar = this.getElement_('#debugResizeBar');
  var rect = resizeBar.getBoundingClientRect();
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
  var debugOutputDiv = this.getElement_('#debug-output');
  if (debugOutputDiv) {
    debugOutputDiv.textContent = '';
  }
};

/**
 * Empty the debug console input area.
 */
JSDebuggerUI.prototype.clearDebugInput = function () {
  var debugInput = this.getElement_('#debug-input');
  if (debugInput) {
    debugInput.textContent = '';
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

  var pauseButton = this.getElement_('#pauseButton');
  var continueButton = this.getElement_('#continueButton');
  var spinner = this.getElement_('#running-spinner');
  var pausedIcon = this.getElement_('#paused-icon');
  if (pauseButton && continueButton && spinner && pausedIcon) {
    if (jsInterpreter.paused && jsInterpreter.nextStep === StepType.RUN) {
      pauseButton.style.display = "none";
      continueButton.style.display = "inline-block";
      continueButton.disabled = false;
      spinner.style.display = 'none';
      pausedIcon.style.display = 'inline-block';
    } else {
      pauseButton.style.display = "inline-block";
      pauseButton.disabled = false;
      continueButton.style.display = "none";
      spinner.style.display = 'inline-block';
      pausedIcon.style.display = 'none';
    }
  }

  var stepInButton = this.getElement_('#stepInButton');
  var stepOverButton = this.getElement_('#stepOverButton');
  var stepOutButton = this.getElement_('#stepOutButton');
  if (stepInButton && stepOverButton && stepOutButton) {
    stepInButton.disabled = !jsInterpreter.paused;
    stepOverButton.disabled = !jsInterpreter.paused;
    stepOutButton.disabled = !jsInterpreter.paused;
  }
};

JSDebuggerUI.prototype.resetDebugControls = function () {
  var spinner = this.getElement_('#running-spinner');
  if (spinner) {
    spinner.style.display = 'none';
  }

  var pausedIcon = this.getElement_('#paused-icon');
  if (pausedIcon) {
    pausedIcon.style.display = 'none';
  }

  var pauseButton = this.getElement_('#pauseButton');
  var continueButton = this.getElement_('#continueButton');
  var stepInButton = this.getElement_('#stepInButton');
  var stepOverButton = this.getElement_('#stepOverButton');
  var stepOutButton = this.getElement_('#stepOutButton');
  if (pauseButton && continueButton && stepInButton &&
      stepOverButton && stepOutButton) {
    pauseButton.style.display = "inline-block";
    pauseButton.disabled = true;
    continueButton.style.display = "none";
    stepInButton.disabled = false;
    stepOverButton.disabled = true;
    stepOutButton.disabled = true;
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
