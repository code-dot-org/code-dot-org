/** @file Debugger controls and debug console used in our rich JavaScript IDEs */
var CommandHistory = require('./CommandHistory');
var constants = require('./constants');
var DebugArea = require('./DebugArea');
var dom = require('./dom');
var JSInterpreter = require('./JSInterpreter');
var Observer = require('./Observer');
var utils = require('./utils');
import {setStepSpeed} from './redux/runState';
import {add, update, remove} from './redux/watchedExpressions';

var KeyCodes = constants.KeyCodes;
var StepType = JSInterpreter.StepType;

/** @const {number} */
var MIN_DEBUG_AREA_HEIGHT = 120;
/** @const {number} */
var MAX_DEBUG_AREA_HEIGHT = 400;
/** @const {number} */
const MIN_WATCHERS_AREA_WIDTH = 120;
/** @const {number} */
const MAX_WATCHERS_AREA_WIDTH = 400;
/** @const {number} (in milliseconds) */
const WATCH_TIMER_PERIOD = 250;
/** @const {string} */
var WATCH_COMMAND_PREFIX = "$watch ";
/** @const {string} */
var UNWATCH_COMMAND_PREFIX = "$unwatch ";

/**
 * Debugger controls and debug console used in our rich JavaScript IDEs, like
 * App Lab, Game Lab, etc.
 * @param {!function} runApp - callback for "launching" the app, which is used
 *        by the "Step In" button when the app isn't running.
 * @param {!Store} reduxStore
 * @constructor
 * @implements LogTarget
 */
var JsDebuggerUi = module.exports = function (runApp, reduxStore) {
  /**
   * Reference to currently attached JSInterpreter, null if unattached.
   * @private {JSInterpreter}
   */
  this.jsInterpreter_ = null;

  /** @private {Observer} */
  this.observer_ = new Observer();

  /**
   * Callback for "launching" the app, used by the "Step In" button when the app
   * isn't currently running.
   * @private {function}
   */
  this.runApp_ = runApp;

  /**
   * Reference to application Redux store.
   * @private {ReduxStore}
   */
  this.reduxStore_ = reduxStore;

  /**
   * Browseable history of commands entered into the debug console.
   * @private {CommandHistory}
   */
  this.history_ = new CommandHistory();

  /**
   * Id for watch timer setInterval.
   * @private {number}
   */
  this.watchIntervalId_ = 0;

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
 * Attach the debugger to a particular JSInterpreter instance.  Reinitializes
 * the UI state and begins listening for interpreter events.
 * @param {JSInterpreter} jsInterpreter
 */
JsDebuggerUi.prototype.attachTo = function (jsInterpreter) {
  this.jsInterpreter_ = jsInterpreter;
  this.observer_.observe(jsInterpreter.onNextStepChanged,
      this.updatePauseUiState.bind(this));
  this.observer_.observe(jsInterpreter.onPause,
      this.onPauseContinueButton.bind(this));
  this.observer_.observe(jsInterpreter.onExecutionWarning,
      this.log.bind(this));

  this.updatePauseUiState();
  this.clearDebugOutput();
  this.clearDebugInput();
  this.watchIntervalId_ = setInterval(this.updateWatchExpressions_.bind(this),
      WATCH_TIMER_PERIOD);
};

/**
 * Detach the debugger from whatever interpreter instance it is currently
 * attached to, unregistering handlers and resetting the controls to a
 * 'detached' state.
 * Safe to call when the debugger is already detached.
 */
JsDebuggerUi.prototype.detach = function () {
  this.observer_.unobserveAll();
  this.jsInterpreter_ = null;

  clearInterval(this.watchIntervalId_);
  this.watchIntervalId_ = 0;

  this.resetDebugControls_();
};

/**
 * Element getter for elements within the debugger UI.
 * @type {Function}
 * @private
 * @param {string} selector
 * @returns {HTMLElement}
 */
JsDebuggerUi.prototype.getElement_ = function (selector) {
  var rootDiv = document.getElementById('debug-area');
  if (rootDiv) {
    return rootDiv.querySelector(selector);
  }
  return undefined;
};

/**
 * Post-DOM initialization, which allows this controller to grab all the DOM
 * references it needs, bind handlers, and create any subordinate controllers.
 * @param {!Object} options
 * @param {number} [options.defaultStepSpeed] in range 0..1
 */
JsDebuggerUi.prototype.initializeAfterDomCreated = function (options) {
  // Get references to important elements of the DOM
  this.rootDiv_ = document.getElementById('debug-area');

  // Create controller for open/shut behavior of debug area
  this.debugOpenShutController_ = new DebugArea(
      this.rootDiv_,
      document.getElementById('codeTextbox'));

  // Change default speed (eg Speed up levels that have lots of steps).
  if (options.defaultStepSpeed) {
    this.setStepSpeed(options.defaultStepSpeed);
  }

  // Attach keydown handler for debug console input area
  var debugInput = this.rootDiv_.querySelector('#debug-input');
  if (debugInput) {
    debugInput.addEventListener('keydown', this.onDebugInputKeyDown.bind(this));
  }

  // Attach click handler for focusing on console input when clicking output
  var debugOutput = this.rootDiv_.querySelector('#debug-output');
  if (debugOutput) {
    debugOutput.addEventListener('mouseup', this.onDebugOutputMouseUp.bind(this));
  }

  const mouseUpTouchEventName = dom.getTouchEventName('mouseup');

  // Attach handlers for the debug area resize control
  var resizeBar = this.getElement_('#debugResizeBar');
  if (resizeBar) {
    dom.addMouseDownTouchEvent(resizeBar, this.onMouseDownDebugResizeBar.bind(this));

    // Can't use dom.addMouseUpTouchEvent() because it will preventDefault on
    // all touchend events on the page, breaking click events...
    document.body.addEventListener('mouseup',
        this.onMouseUpDebugResizeBar.bind(this));
    if (mouseUpTouchEventName) {
      document.body.addEventListener(mouseUpTouchEventName,
          this.onMouseUpDebugResizeBar.bind(this));
    }
  }
  // Attach handlers for the debug area resize control
  const watchersResizeBar = this.getElement_('#watchersResizeBar');
  if (watchersResizeBar) {
    dom.addMouseDownTouchEvent(watchersResizeBar, this.onMouseDownWatchersResizeBar.bind(this));

    // Can't use dom.addMouseUpTouchEvent() because it will preventDefault on
    // all touchend events on the page, breaking click events...
    document.body.addEventListener('mouseup',
        this.onMouseUpWatchersResizeBar.bind(this));
    if (mouseUpTouchEventName) {
      document.body.addEventListener(mouseUpTouchEventName,
          this.onMouseUpWatchersResizeBar.bind(this));
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
JsDebuggerUi.prototype.getStepDelay = function () {
  return JsDebuggerUi.stepDelayFromStepSpeed(this.reduxStore_.getState().runState.stepSpeed);
};

/**
 * Set the speed slider position.
 * @param {!number} speed - in range 0..1
 */
JsDebuggerUi.prototype.setStepSpeed = function (speed) {
  this.reduxStore_.dispatch(setStepSpeed(speed));
};

/**
 * Exponential conversion from step speed (as slider position, range 0..1) to
 * a step delay in milliseconds.
 * @param {!number} stepSpeed in range 0..1
 * @returns {number} step delay in milliseconds
 */
JsDebuggerUi.stepDelayFromStepSpeed = function (stepSpeed) {
  return 300 * Math.pow(1 - stepSpeed, 2);
};

/**
 * Given some object or message, attempt to log it both to the browser console
 * and to the user-facing debug console.
 * @param {*} output
 */
JsDebuggerUi.prototype.log = function (output) {
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
JsDebuggerUi.prototype.onDebugInputKeyDown = function (e) {
  var input = e.target.textContent;
  if (e.keyCode === KeyCodes.ENTER) {
    e.preventDefault();
    this.history_.push(input);
    e.target.textContent = '';
    this.log('> ' + input);
    var jsInterpreter = this.jsInterpreter_;
    if (0 === input.indexOf(WATCH_COMMAND_PREFIX)) {
      this.reduxStore_.dispatch(add(input.substring(WATCH_COMMAND_PREFIX.length)));
    } else if (0 === input.indexOf(UNWATCH_COMMAND_PREFIX)) {
      this.reduxStore_.dispatch(remove(input.substring(UNWATCH_COMMAND_PREFIX.length)));
    } else if (jsInterpreter) {
      try {
        var result = jsInterpreter.evalInCurrentScope(input);
        this.log('< ' + String(result));
      } catch (err) {
        this.log('< ' + String(err));
      }
    } else {
      this.log('< (not running)');
    }
  } else if (e.keyCode === KeyCodes.UP) {
    e.target.textContent = this.history_.goBack(input);
    moveCaretToEndOfDiv(e.target);
    e.preventDefault(); // Block default Home/End-like behavior in Chrome
  } else if (e.keyCode === KeyCodes.DOWN) {
    e.target.textContent = this.history_.goForward(input);
    moveCaretToEndOfDiv(e.target);
    e.preventDefault(); // Block default Home/End-like behavior in Chrome
  }
};

/**
 * Set the cursor position to the end of the text content in a div element.
 * @see http://stackoverflow.com/a/6249440/5000129
 * @param {!HTMLDivElement} element
 */
function moveCaretToEndOfDiv(element) {
  var range = document.createRange();
  if (element.childNodes.length === 0) {
    return;
  }

  range.setStart(element.lastChild, element.lastChild.nodeValue.length);
  range.collapse(true);

  // Change window selection to new range to set cursor position
  var selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
}

/**
 * On mouseup over the console output, if the user hasn't just selected some
 * text, place the focus in the console input box.
 * @param {MouseEvent} e
 */
JsDebuggerUi.prototype.onDebugOutputMouseUp = function (e) {
  var debugInput = this.getElement_('#debug-input');
  if (debugInput && e.target.tagName === "DIV" &&
      window.getSelection().toString().length === 0) {
    debugInput.focus();
  }
};

/** @type {boolean} */
var draggingDebugResizeBar = false;

/** @type {function} */
var boundMouseMoveHandler;

/** @type {string} */
var mouseMoveTouchEventName;

/** @type {boolean} */
let draggingWatchersResizeBar = false;

/** @type {function} */
let boundMouseMoveHandlerWatchers;

let watchersReferences = {};

function getWatchersElements() {
  watchersReferences.watchersResizeBar = watchersReferences.watchersResizeBar ||
    document.getElementById('watchersResizeBar');
  watchersReferences.watchersDiv = watchersReferences.watchersDiv ||
    document.getElementById('debug-watch');
  watchersReferences.watchersHeaderDiv = watchersReferences.watchersHeaderDiv ||
    document.getElementById('debug-watch-header');
  watchersReferences.debugConsoleDiv = watchersReferences.debugConsoleDiv ||
    document.getElementById('debug-console');
  return watchersReferences;
}

function resetWatchersElements() {
  watchersReferences = {};
}

JsDebuggerUi.prototype.onMouseDownDebugResizeBar = function (event) {
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

JsDebuggerUi.prototype.onMouseDownWatchersResizeBar = function (event) {
  // When we see a mouse down in the resize bar, start tracking mouse moves:
  var eventSourceElm = event.srcElement || event.target;
  if (eventSourceElm.id === 'watchersResizeBar') {
    draggingWatchersResizeBar = true;
    boundMouseMoveHandlerWatchers = this.onMouseMoveWatchersResizeBar.bind(this);
    document.body.addEventListener('mousemove', boundMouseMoveHandlerWatchers);
    mouseMoveTouchEventName = dom.getTouchEventName('mousemove');
    if (mouseMoveTouchEventName) {
      document.body.addEventListener(mouseMoveTouchEventName,
          boundMouseMoveHandlerWatchers);
    }

    event.preventDefault();
  }
};

document.addEventListener('resetWatchersResizableElements', function () {
  const {watchersDiv, debugConsoleDiv, watchersResizeBar, watchersHeaderDiv} = getWatchersElements();
  watchersDiv.style.removeProperty('width');
  debugConsoleDiv.style.removeProperty('right');
  watchersResizeBar.style.removeProperty('right');
  watchersHeaderDiv.style.removeProperty('width');
  resetWatchersElements();
}.bind(this));

/**
 *  Handle mouse moves while dragging the debug resize bar.
 */
JsDebuggerUi.prototype.onMouseMoveDebugResizeBar = function (event) {
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

/**
 *  Handle mouse moves while dragging the debug resize bar.
 */
JsDebuggerUi.prototype.onMouseMoveWatchersResizeBar = function (event) {
  const {watchersDiv, debugConsoleDiv, watchersResizeBar, watchersHeaderDiv} = getWatchersElements();
  const watchersRect = watchersDiv.getBoundingClientRect();
  const movement = watchersRect.left - event.clientX;
  const newDesiredWidth = watchersRect.width + movement;
  const newWatchersWidth = Math.max(MIN_WATCHERS_AREA_WIDTH,
    Math.min(MAX_WATCHERS_AREA_WIDTH, newDesiredWidth));

  const watchersResizeRect = watchersResizeBar.getBoundingClientRect();
  const watchersResizeRight = (newWatchersWidth - watchersResizeRect.width / 2);

  watchersDiv.style.width = newWatchersWidth + 'px';
  debugConsoleDiv.style.right = newWatchersWidth + 'px';
  watchersResizeBar.style.right = watchersResizeRight + 'px';

  const headerLBorderWidth = 1;
  const watchersLRBorderWidth = 2;
  const extraWidthForHeader = watchersLRBorderWidth - headerLBorderWidth;
  watchersHeaderDiv.style.width = newWatchersWidth + extraWidthForHeader + 'px';
};

JsDebuggerUi.prototype.onMouseUpDebugResizeBar = function () {
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

JsDebuggerUi.prototype.onMouseUpWatchersResizeBar = function () {
  // If we have been tracking mouse moves, remove the handler now:
  if (draggingWatchersResizeBar) {
    document.body.removeEventListener('mousemove', boundMouseMoveHandlerWatchers);
    if (mouseMoveTouchEventName) {
      document.body.removeEventListener(mouseMoveTouchEventName,
          boundMouseMoveHandlerWatchers);
    }
    draggingWatchersResizeBar = false;
  }
};

/**
 * Empty the contents of the debug console scrollback area.
 */
JsDebuggerUi.prototype.clearDebugOutput = function () {
  var debugOutputDiv = this.getElement_('#debug-output');
  if (debugOutputDiv) {
    debugOutputDiv.textContent = '';
  }
};

/**
 * Empty the debug console input area.
 */
JsDebuggerUi.prototype.clearDebugInput = function () {
  var debugInput = this.getElement_('#debug-input');
  if (debugInput) {
    debugInput.textContent = '';
  }
};

JsDebuggerUi.prototype.onPauseContinueButton = function () {
  var jsInterpreter = this.jsInterpreter_;
  if (jsInterpreter) {
    jsInterpreter.handlePauseContinue();

    this.updatePauseUiState();
  }
};

JsDebuggerUi.prototype.updatePauseUiState = function () {
  var jsInterpreter = this.jsInterpreter_;
  if (!jsInterpreter) {
    return;
  }

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

/**
 * Put the debug controls back into a detached state.
 * @private
 */
JsDebuggerUi.prototype.resetDebugControls_ = function () {
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

JsDebuggerUi.prototype.onStepOverButton = function () {
  var jsInterpreter = this.jsInterpreter_;
  if (jsInterpreter) {
    jsInterpreter.handleStepOver();
    this.updatePauseUiState();
  }
};

JsDebuggerUi.prototype.onStepInButton = function () {
  var jsInterpreter = this.jsInterpreter_;
  if (!jsInterpreter) {
    this.runApp_();
    this.onPauseContinueButton();
    jsInterpreter = this.jsInterpreter_;
  }
  jsInterpreter.handleStepIn();
  this.updatePauseUiState();
};

JsDebuggerUi.prototype.onStepOutButton = function () {
  var jsInterpreter = this.jsInterpreter_;
  if (jsInterpreter) {
    jsInterpreter.handleStepOut();
    this.updatePauseUiState();
  }
};

/**
 * Refresh values of watched expressions.
 * @private
 */
JsDebuggerUi.prototype.updateWatchExpressions_ = function () {
  var jsInterpreter = this.jsInterpreter_;
  this.reduxStore_.getState().watchedExpressions.forEach(we => {
    const currentValue = jsInterpreter.evaluateWatchExpression(we.get('expression'));
    this.reduxStore_.dispatch(update(we.get('expression'), currentValue));
  });
};
