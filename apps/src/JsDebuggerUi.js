/** @file Debugger controls and debug console used in our rich JavaScript IDEs */
'use strict';

var CommandHistory = require('./CommandHistory');
var constants = require('./constants');
var DebugArea = require('./DebugArea');
var dom = require('./dom');
var JSInterpreter = require('./JSInterpreter');
var Observer = require('./Observer');
var Slider = require('./slider');
var utils = require('./utils');

var KeyCodes = constants.KeyCodes;
var StepType = JSInterpreter.StepType;

/** @const {number} */
var MIN_DEBUG_AREA_HEIGHT = 120;
/** @const {number} */
var MAX_DEBUG_AREA_HEIGHT = 400;
/** @const {number} (in milliseconds) */
var WATCH_TIMER_PERIOD = 500;
/** @const {string} */
var WATCH_COMMAND_PREFIX = "$watch ";

/**
 * Debugger controls and debug console used in our rich JavaScript IDEs, like
 * App Lab, Game Lab, etc.
 * @param {!function} runApp - callback for "launching" the app, which is used
 *        by the "Step In" button when the app isn't running.
 * @constructor
 */
var JsDebuggerUi = module.exports = function (runApp) {
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
   * Browseable history of commands entered into the debug console.
   * @private {CommandHistory}
   */
  this.history_ = new CommandHistory();

  /**
   * Collection of watch expressions.
   * @private {object}
   */
  this.watchExpressions_ = {};

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

  this.watchIntervalId_ = setInterval(this.onWatchTimer_.bind(this),
      WATCH_TIMER_PERIOD);

  this.updatePauseUiState();
  this.clearDebugOutput();
  this.clearDebugInput();
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

  var debugWatchDiv = this.getElement_('#debug-watch');
  if (debugWatchDiv) {
    clearAllChildElements(debugWatchDiv);
  }
  this.watchExpressions_ = {};
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

  // Attach click handler for focusing on console input when clicking output
  var debugOutput = this.rootDiv_.querySelector('#debug-output');
  if (debugOutput) {
    debugOutput.addEventListener('mouseup', this.onDebugOutputMouseUp.bind(this));
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
JsDebuggerUi.prototype.getStepDelay = function () {
  if (this.speedSlider_) {
    return JsDebuggerUi.stepDelayFromStepSpeed(this.speedSlider_.getValue());
  }
  return undefined;
};

/**
 * Set the speed slider position.
 * @param {!number} speed - in range 0..1
 */
JsDebuggerUi.prototype.setStepSpeed = function (speed) {
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
    if (jsInterpreter) {
      if (0 === input.indexOf(WATCH_COMMAND_PREFIX)) {
        var watchExpression = input.substring(WATCH_COMMAND_PREFIX.length);
        this.watchExpressions_[watchExpression] = {};
      } else {
        try {
          var result = jsInterpreter.evalInCurrentScope(input);
          this.log('< ' + String(result));
        } catch (err) {
          this.log('< ' + String(err));
        }
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
    // We have code and are either running or paused
    if (jsInterpreter.paused &&
        jsInterpreter.nextStep === StepType.RUN) {
      jsInterpreter.paused = false;
    } else {
      jsInterpreter.paused = true;
      jsInterpreter.nextStep = StepType.RUN;
    }

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
    jsInterpreter.paused = true;
    jsInterpreter.nextStep = StepType.OVER;
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
  jsInterpreter.paused = true;
  jsInterpreter.nextStep = StepType.IN;
  this.updatePauseUiState();
};

JsDebuggerUi.prototype.onStepOutButton = function () {
  var jsInterpreter = this.jsInterpreter_;
  if (jsInterpreter) {
    jsInterpreter.paused = true;
    jsInterpreter.nextStep = StepType.OUT;
    this.updatePauseUiState();
  }
};

function clearAllChildElements(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

/**
 * Refresh the watch expressions.
 * @private
 */
JsDebuggerUi.prototype.onWatchTimer_ = function () {
  var jsInterpreter = this.jsInterpreter_;
  if (jsInterpreter) {

    for (var watchExpression in this.watchExpressions_) {
      var currentValue = jsInterpreter.evaluateWatchExpression(watchExpression);
      if (this.watchExpressions_[watchExpression].lastValue !== currentValue) {
        // Store new value
        this.watchExpressions_[watchExpression].lastValue = currentValue;
      }
      var debugWatchDiv = this.getElement_('#debug-watch');
      if (debugWatchDiv) {
        clearAllChildElements(debugWatchDiv);
        var watchItem = document.createElement('div');
        watchItem.className = 'debug-watch-item';
        watchItem.innerHTML = require('./JsDebuggerWatchItem.html.ejs')({
          varName: watchExpression,
          varValue: currentValue
        });
        debugWatchDiv.appendChild(watchItem);
      }
    }
  }
};
