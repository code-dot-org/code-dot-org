'use strict';

var commonMsg = require('../locale');
var msg = require('./locale');
var levels = require('./levels');
var codegen = require('../codegen');
var api = require('./api');
var apiJavascript = require('./apiJavascript');
var consoleApi = require('../consoleApi');
var ProtectedStatefulDiv = require('../templates/ProtectedStatefulDiv');
var ConnectedCodeWorkspace = require('../templates/ConnectedCodeWorkspace');
var utils = require('../utils');
var dropletUtils = require('../dropletUtils');
var _ = require('../lodash');
var dropletConfig = require('./dropletConfig');
var JsDebuggerUi = require('../JsDebuggerUi');
var JSInterpreter = require('../JSInterpreter');
var JsInterpreterLogger = require('../JsInterpreterLogger');
var GameLabP5 = require('./GameLabP5');
var gameLabSprite = require('./GameLabSprite');
var gameLabGroup = require('./GameLabGroup');
var assetPrefix = require('../assetManagement/assetPrefix');
var gamelabCommands = require('./commands');
var errorHandler = require('../errorHandler');
var outputError = errorHandler.outputError;
var ErrorLevel = errorHandler.ErrorLevel;
var dom = require('../dom');
var experiments = require('../experiments');

var actions = require('./actions');
var setInitialLevelProps = require('../redux/levelProperties').setInitialLevelProps;
var createStore = require('../redux').createStore;
var gamelabReducer = require('./reducers').gamelabReducer;
var GameLabView = require('./GameLabView');
var Provider = require('react-redux').Provider;

var MAX_INTERPRETER_STEPS_PER_TICK = 500000;

var ButtonState = {
  UP: 0,
  DOWN: 1
};

var ArrowIds = {
  LEFT: 'leftButton',
  UP: 'upButton',
  RIGHT: 'rightButton',
  DOWN: 'downButton'
};

/**
 * An instantiable GameLab class
 */
var GameLab = function () {
  this.skin = null;
  this.level = null;
  this.tickIntervalId = 0;
  this.tickCount = 0;

  /**
   * Redux Store holding application state, transformable by actions.
   * @private {Store}
   * @see http://redux.js.org/docs/basics/Store.html
   */
  this.reduxStore_ = createStore(gamelabReducer);

  /** @type {StudioApp} */
  this.studioApp_ = null;

  /** @type {JSInterpreter} */
  this.JSInterpreter = null;

  /** @private {JsInterpreterLogger} */
  this.consoleLogger_ = new JsInterpreterLogger(window.console);

  /** @type {JsDebuggerUi} */
  this.debugger_ = null;

  this.eventHandlers = {};
  this.Globals = {};
  this.btnState = {};
  this.dPadState = {};
  this.currentCmdQueue = null;
  this.interpreterStarted = false;
  this.globalCodeRunsDuringPreload = false;
  this.drawInProgress = false;
  this.setupInProgress = false;
  this.preloadInProgress = false;
  this.gameLabP5 = new GameLabP5();
  this.api = api;
  this.api.injectGameLab(this);
  this.apiJS = apiJavascript;
  this.apiJS.injectGameLab(this);

  dropletConfig.injectGameLab(this);

  consoleApi.setLogMethod(this.log.bind(this));
  errorHandler.setLogMethod(this.log.bind(this));

  /** Expose for testing **/
  window.__mostRecentGameLabInstance = this;
};

module.exports = GameLab;

/**
 * Forward a log message to both logger objects.
 * @param {?} object
 */
GameLab.prototype.log = function (object) {
  this.consoleLogger_.log(object);
  if (this.debugger_) {
    this.debugger_.log(object);
  }
};

/**
 * Inject the studioApp singleton.
 */
GameLab.prototype.injectStudioApp = function (studioApp) {
  this.studioApp_ = studioApp;
  this.studioApp_.reset = this.reset.bind(this);
  this.studioApp_.runButtonClick = this.runButtonClick.bind(this);

  this.studioApp_.setCheckForEmptyBlocks(true);
};

GameLab.baseP5loadImage = null;

/**
 * Initialize Blockly and this GameLab instance.  Called on page load.
 */
GameLab.prototype.init = function (config) {
  if (!this.studioApp_) {
    throw new Error("GameLab requires a StudioApp");
  }

  this.skin = config.skin;
  this.level = config.level;

  this.level.softButtons = this.level.softButtons || {};

  config.usesAssets = true;

  this.gameLabP5.init({
    gameLab: this,
    onExecutionStarting: this.onP5ExecutionStarting.bind(this),
    onPreload: this.onP5Preload.bind(this),
    onSetup: this.onP5Setup.bind(this),
    onDraw: this.onP5Draw.bind(this)
  });

  config.afterClearPuzzle = function () {
    this.studioApp_.resetButtonClick();
  }.bind(this);

  config.dropletConfig = dropletConfig;
  config.appMsg = msg;

  // hide makeYourOwn on the share page
  config.makeYourOwn = false;

  config.centerEmbedded = false;
  config.wireframeShare = true;
  config.noHowItWorks = true;

  config.shareWarningInfo = {
    hasDataAPIs: function () {
      return this.hasDataStoreAPIs(this.studioApp_.getCode());
    }.bind(this),
    onWarningsComplete: function () {
      window.setTimeout(this.studioApp_.runButtonClick, 0);
    }.bind(this)
  };

  // Provide a way for us to have top pane instructions disabled by default, but
  // able to turn them on.
  config.showInstructionsInTopPane = experiments.isEnabled('topInstructions');

  config.reduxStore = this.reduxStore_;

  var breakpointsEnabled = !config.level.debuggerDisabled;

  var onMount = function () {
    config.loadAudio = this.loadAudio_.bind(this);
    config.afterInject = this.afterInject_.bind(this, config);
    config.afterEditorReady = this.afterEditorReady_.bind(this, breakpointsEnabled);

    // Store p5specialFunctions in the unusedConfig array so we don't give warnings
    // about these functions not being called:
    config.unusedConfig = this.gameLabP5.p5specialFunctions;

    this.studioApp_.init(config);

    var finishButton = document.getElementById('finishButton');
    if (finishButton) {
      dom.addClickTouchEvent(finishButton, this.onPuzzleComplete.bind(this, false));
    }

    if (this.debugger_) {
      this.debugger_.initializeAfterDomCreated({
        defaultStepSpeed: 1
      });
    }
  }.bind(this);

  var showFinishButton = !this.level.isProjectLevel;
  var finishButtonFirstLine = _.isEmpty(this.level.softButtons);
  var showDebugButtons = (!config.hideSource &&
                          config.level.editCode &&
                          !config.level.debuggerDisabled);
  var showDebugConsole = !config.hideSource && config.level.editCode;

  if (showDebugButtons || showDebugConsole) {
    this.debugger_ = new JsDebuggerUi(this.runButtonClick.bind(this));
  }

  this.reduxStore_.dispatch(setInitialLevelProps({
    assetUrl: this.studioApp_.assetUrl,
    isEmbedView: !!config.embed,
    isReadOnlyWorkspace: !!config.readonlyWorkspace,
    isShareView: !!config.share,
    instructionsMarkdown: config.level.markdownInstructions,
    instructionsInTopPane: config.showInstructionsInTopPane,
    puzzleNumber: config.level.puzzle_number,
    stageTotal: config.level.stage_total,
    showDebugButtons: showDebugButtons,
    showDebugConsole: showDebugConsole,
    showDebugWatch: true,
    localeDirection: this.studioApp_.localeDirection()
  }));

  // Push project-sourced animation metadata into store
  if (typeof config.initialAnimationMetadata !== 'undefined') {
    this.reduxStore_.dispatch(actions.setInitialAnimationMetadata(config.initialAnimationMetadata));
  }

  var codeWorkspace = <ConnectedCodeWorkspace/>;

  ReactDOM.render(<Provider store={this.reduxStore_}>
    <GameLabView
      codeWorkspace={codeWorkspace}
      showFinishButton={finishButtonFirstLine && showFinishButton}
      hideSource={!!config.hideSource}
      onMount={onMount} />
  </Provider>, document.getElementById(config.containerId));
};

GameLab.prototype.loadAudio_ = function () {
  this.studioApp_.loadAudio(this.skin.winSound, 'win');
  this.studioApp_.loadAudio(this.skin.startSound, 'start');
  this.studioApp_.loadAudio(this.skin.failureSound, 'failure');
};

GameLab.prototype.calculateVisualizationScale_ = function () {
  var divGameLab = document.getElementById('divGameLab');
  // Calculate current visualization scale:
  return divGameLab.getBoundingClientRect().width / divGameLab.offsetWidth;
};

/**
 * @param {string} code The code to search for Data Storage APIs
 * @return {boolean} True if the code uses any data storage APIs
 */
GameLab.prototype.hasDataStoreAPIs = function (code) {
  return /createRecord/.test(code) || /updateRecord/.test(code) ||
      /setKeyValue/.test(code);
};

/**
 * Code called after the blockly div + blockly core is injected into the document
 */
GameLab.prototype.afterInject_ = function (config) {

  // Connect up arrow button event handlers
  for (var btn in ArrowIds) {
    dom.addMouseUpTouchEvent(document.getElementById(ArrowIds[btn]),
        this.onArrowButtonUp.bind(this, ArrowIds[btn]));
    dom.addMouseDownTouchEvent(document.getElementById(ArrowIds[btn]),
        this.onArrowButtonDown.bind(this, ArrowIds[btn]));
  }
  if (this.level.showDPad) {
    dom.addMouseDownTouchEvent(document.getElementById('studio-dpad-button'),
        this.onDPadButtonDown.bind(this));
  }
  // Can't use dom.addMouseUpTouchEvent() because it will preventDefault on
  // all touchend events on the page, breaking click events...
  document.addEventListener('mouseup', this.onMouseUp.bind(this), false);
  var mouseUpTouchEventName = dom.getTouchEventName('mouseup');
  if (mouseUpTouchEventName) {
    document.body.addEventListener(mouseUpTouchEventName, this.onMouseUp.bind(this));
  }

  if (this.studioApp_.isUsingBlockly()) {
    // Add to reserved word list: API, local variables in execution evironment
    // (execute) and the infinite loop detection function.
    Blockly.JavaScript.addReservedWords('GameLab,code');
  }

  // Adjust visualizationColumn width.
  var visualizationColumn = document.getElementById('visualizationColumn');
  visualizationColumn.style.width = '400px';

  var divGameLab = document.getElementById('divGameLab');
  divGameLab.style.width = '400px';
  divGameLab.style.height = '400px';

  // Update gameLabP5's scale and keep it updated with future resizes:
  this.gameLabP5.scale = this.calculateVisualizationScale_();

  window.addEventListener('resize', function () {
    this.gameLabP5.scale = this.calculateVisualizationScale_();
  }.bind(this));
};

/**
 * Initialization to run after ace/droplet is initialized.
 * @param {!boolean} areBreakpointsEnabled
 * @private
 */
GameLab.prototype.afterEditorReady_ = function (areBreakpointsEnabled) {
  if (areBreakpointsEnabled) {
    this.studioApp_.enableBreakpoints();
  }
};

GameLab.prototype.haltExecution_ = function () {
  this.eventHandlers = {};
  if (this.tickIntervalId !== 0) {
    window.clearInterval(this.tickIntervalId);
  }
  this.tickIntervalId = 0;
  this.tickCount = 0;
};

/**
 * Reset GameLab to its initial state.
 * @param {boolean} ignore Required by the API but ignored by this
 *     implementation.
 */
GameLab.prototype.reset = function (ignore) {
  this.haltExecution_();

  /*
  var divGameLab = document.getElementById('divGameLab');
  while (divGameLab.firstChild) {
    divGameLab.removeChild(divGameLab.firstChild);
  }
  */

  this.gameLabP5.resetExecution();

  // Import to reset these after this.gameLabP5 has been reset
  this.drawInProgress = false;
  this.setupInProgress = false;
  this.preloadInProgress = false;
  this.globalCodeRunsDuringPreload = false;

  if (this.debugger_) {
    this.debugger_.detach();
  }
  this.consoleLogger_.detach();

  // Discard the interpreter.
  if (this.JSInterpreter) {
    this.JSInterpreter.deinitialize();
    this.JSInterpreter = null;
    this.interpreterStarted = false;
  }
  this.executionError = null;

  // Soft buttons
  var softButtonCount = 0;
  for (var i = 0; i < this.level.softButtons.length; i++) {
    document.getElementById(this.level.softButtons[i]).style.display = 'inline';
    softButtonCount++;
  }
  if (softButtonCount) {
    $('#soft-buttons').removeClass('soft-buttons-none').addClass('soft-buttons-' + softButtonCount);
  }

  if (this.level.showDPad) {
    $('#studio-dpad').removeClass('studio-dpad-none');
    this.resetDPad();
  }
};

GameLab.prototype.onPuzzleComplete = function (submit) {
  if (this.executionError) {
    this.result = this.studioApp_.ResultType.ERROR;
  } else {
    // In most cases, submit all results as success
    this.result = this.studioApp_.ResultType.SUCCESS;
  }

  // If we know they succeeded, mark levelComplete true
  var levelComplete = (this.result === this.studioApp_.ResultType.SUCCESS);

  if (this.executionError) {
    this.testResults = this.studioApp_.getTestResults(levelComplete, {
        executionError: this.executionError
    });
  } else if (!submit) {
    this.testResults = this.studioApp_.TestResults.FREE_PLAY;
  }

  // Stop everything on screen
  this.reset();

  if (this.testResults >= this.studioApp_.TestResults.FREE_PLAY) {
    this.studioApp_.playAudio('win');
  } else {
    this.studioApp_.playAudio('failure');
  }

  var program;

  if (this.level.editCode) {
    // If we want to "normalize" the JavaScript to avoid proliferation of nearly
    // identical versions of the code on the service, we could do either of these:

    // do an acorn.parse and then use escodegen to generate back a "clean" version
    // or minify (uglifyjs) and that or js-beautify to restore a "clean" version

    program = this.studioApp_.getCode();
  } else {
    var xml = Blockly.Xml.blockSpaceToDom(Blockly.mainBlockSpace);
    program = Blockly.Xml.domToText(xml);
  }

  this.waitingForReport = true;

  var sendReport = function () {
    this.studioApp_.report({
      app: 'gamelab',
      level: this.level.id,
      result: levelComplete,
      testResult: this.testResults,
      submitted: submit,
      program: encodeURIComponent(program),
      image: this.encodedFeedbackImage,
      onComplete: (submit ? this.onSubmitComplete.bind(this) : this.onReportComplete.bind(this))
    });

    if (this.studioApp_.isUsingBlockly()) {
      // reenable toolbox
      Blockly.mainBlockSpaceEditor.setEnableToolbox(true);
    }
  }.bind(this);

  var divGameLab = document.getElementById('divGameLab');
  if (!divGameLab || typeof divGameLab.toDataURL === 'undefined') { // don't try it if function is not defined
    sendReport();
  } else {
    divGameLab.toDataURL("image/png", {
      callback: function (pngDataUrl) {
        this.feedbackImage = pngDataUrl;
        this.encodedFeedbackImage = encodeURIComponent(this.feedbackImage.split(',')[1]);

        sendReport();
      }.bind(this)
    });
  }
};

GameLab.prototype.onSubmitComplete = function (response) {
  window.location.href = response.redirect;
};

/**
 * Function to be called when the service report call is complete
 * @param {object} JSON response (if available)
 */
GameLab.prototype.onReportComplete = function (response) {
  this.response = response;
  this.waitingForReport = false;
  this.studioApp_.onReportComplete(response);
  this.displayFeedback_();
};

/**
 * Click the run button.  Start the program.
 */
GameLab.prototype.runButtonClick = function () {
  this.studioApp_.toggleRunReset('reset');
  // document.getElementById('spinner').style.visibility = 'visible';
  if (this.studioApp_.isUsingBlockly()) {
    Blockly.mainBlockSpace.traceOn(true);
  }
  this.studioApp_.attempts++;
  this.execute();

  // Enable the Finish button if is present:
  var shareCell = document.getElementById('share-cell');
  if (shareCell) {
    shareCell.className = 'share-cell-enabled';
  }
};

function p5KeyCodeFromArrow(idBtn) {
  switch (idBtn) {
    case ArrowIds.LEFT:
      return window.p5.prototype.LEFT_ARROW;
    case ArrowIds.RIGHT:
      return window.p5.prototype.RIGHT_ARROW;
    case ArrowIds.UP:
      return window.p5.prototype.UP_ARROW;
    case ArrowIds.DOWN:
      return window.p5.prototype.DOWN_ARROW;
  }
}

GameLab.prototype.onArrowButtonDown = function (buttonId, e) {
  // Store the most recent event type per-button
  this.btnState[buttonId] = ButtonState.DOWN;
  e.preventDefault();  // Stop normal events so we see mouseup later.

  this.gameLabP5.notifyKeyCodeDown(p5KeyCodeFromArrow(buttonId));
};

GameLab.prototype.onArrowButtonUp = function (buttonId, e) {
  // Store the most recent event type per-button
  this.btnState[buttonId] = ButtonState.UP;

  this.gameLabP5.notifyKeyCodeUp(p5KeyCodeFromArrow(buttonId));
};

GameLab.prototype.onDPadButtonDown = function (e) {
  this.dPadState = {};
  this.dPadState.boundHandler = this.onDPadMouseMove.bind(this);
  document.body.addEventListener('mousemove', this.dPadState.boundHandler);
  this.dPadState.touchEventName = dom.getTouchEventName('mousemove');
  if (this.dPadState.touchEventName) {
    document.body.addEventListener(this.dPadState.touchEventName,
        this.dPadState.boundHandler);
  }
  if (e.touches) {
    this.dPadState.startingX = e.touches[0].clientX;
    this.dPadState.startingY = e.touches[0].clientY;
    this.dPadState.previousX = e.touches[0].clientX;
    this.dPadState.previousY = e.touches[0].clientY;
  } else {
    this.dPadState.startingX = e.clientX;
    this.dPadState.startingY = e.clientY;
    this.dPadState.previousX = e.clientX;
    this.dPadState.previousY = e.clientY;
  }

  $('#studio-dpad-button').addClass('active');

  e.preventDefault();  // Stop normal events so we see mouseup later.
};

var DPAD_DEAD_ZONE = 3;

GameLab.prototype.onDPadMouseMove = function (e) {
  var dPadButton = $('#studio-dpad-button');
  var self = this;

  function notifyKeyHelper(keyCode, cssClass, start, prev, cur, invert) {
    if (invert) {
      start *= -1;
      prev *= -1;
      cur *= -1;
    }
    start -= DPAD_DEAD_ZONE;

    if (cur < start) {
      if (prev >= start) {
        self.gameLabP5.notifyKeyCodeDown(keyCode);
        dPadButton.addClass(cssClass);
      }
    } else if (prev < start) {
      self.gameLabP5.notifyKeyCodeUp(keyCode);
      dPadButton.removeClass(cssClass);
    }
  }

  var clientX = e.clientX;
  var clientY = e.clientY;
  if (e.touches) {
    clientX = e.touches[0].clientX;
    clientY = e.touches[0].clientY;
  }

  notifyKeyHelper(window.p5.prototype.LEFT_ARROW, 'left',
      this.dPadState.startingX, this.dPadState.previousX, clientX, false);
  notifyKeyHelper(window.p5.prototype.RIGHT_ARROW, 'right',
      this.dPadState.startingX, this.dPadState.previousX, clientX, true);
  notifyKeyHelper(window.p5.prototype.UP_ARROW, 'up',
      this.dPadState.startingY, this.dPadState.previousY, clientY, false);
  notifyKeyHelper(window.p5.prototype.DOWN_ARROW, 'down',
      this.dPadState.startingY, this.dPadState.previousY, clientY, true);

  this.dPadState.previousX = clientX;
  this.dPadState.previousY = clientY;
};

GameLab.prototype.resetDPad = function () {
  if (this.dPadState.boundHandler) {
    // Fake a final mousemove back at the original starting position, which
    // will reset buttons back to "up":
    this.onDPadMouseMove({
      clientX: this.dPadState.startingX,
      clientY: this.dPadState.startingY,
    });

    document.body.removeEventListener('mousemove', this.dPadState.boundHandler);
    if (this.dPadState.touchEventName) {
      document.body.removeEventListener(this.dPadState.touchEventName,
          this.dPadState.boundHandler);
    }

    $('#studio-dpad-button').removeClass('active');

    this.dPadState = {};
  }
};

GameLab.prototype.onMouseUp = function (e) {
  // Reset all arrow buttons on "global mouse up" - this handles the case where
  // the mouse moved off the arrow button and was released somewhere else
  for (var buttonId in this.btnState) {
    if (this.btnState[buttonId] === ButtonState.DOWN) {

      this.btnState[buttonId] = ButtonState.UP;
      this.gameLabP5.notifyKeyCodeUp(p5KeyCodeFromArrow(buttonId));
    }
  }

  this.resetDPad();
};

GameLab.prototype.evalCode = function (code) {
  try {
    codegen.evalWith(code, {
      GameLab: this.api
    });
  } catch (e) {
    // Infinity is thrown if we detect an infinite loop. In that case we'll
    // stop further execution, animate what occured before the infinite loop,
    // and analyze success/failure based on what was drawn.
    // Otherwise, abnormal termination is a user error.
    if (e !== Infinity) {
      // call window.onerror so that we get new relic collection.  prepend with
      // UserCode so that it's clear this is in eval'ed code.
      if (window.onerror) {
        window.onerror("UserCode:" + e.message, document.URL, 0);
      }
      window.alert(e);
    }
  }
};

/**
 * Execute the user's code.  Heaven help us...
 */
GameLab.prototype.execute = function () {
  this.result = this.studioApp_.ResultType.UNSET;
  this.testResults = this.studioApp_.TestResults.NO_TESTS_RUN;
  this.waitingForReport = false;
  this.response = null;

  // Reset all state.
  this.studioApp_.reset();
  this.studioApp_.clearAndAttachRuntimeAnnotations();

  if (this.studioApp_.isUsingBlockly() &&
      (this.studioApp_.hasExtraTopBlocks() ||
        this.studioApp_.hasDuplicateVariablesInForLoops())) {
    // immediately check answer, which will fail and report top level blocks
    this.onPuzzleComplete();
    return;
  }

  this.gameLabP5.startExecution();

  if (this.level.editCode) {
    if (!this.JSInterpreter || !this.JSInterpreter.initialized()) {
      return;
    }
  } else {
    this.code = Blockly.Generator.blockSpaceToCode('JavaScript');
    this.evalCode(this.code);
  }

  this.studioApp_.playAudio('start');

  if (this.studioApp_.isUsingBlockly()) {
    // Disable toolbox while running
    Blockly.mainBlockSpaceEditor.setEnableToolbox(false);
  }

  // Set to 1ms interval, but note that browser minimums are actually 5-16ms:
  this.tickIntervalId = window.setInterval(this.onTick.bind(this), 1);
};

GameLab.prototype.initInterpreter = function () {
  if (!this.level.editCode) {
    return;
  }

  this.JSInterpreter = new JSInterpreter({
    studioApp: this.studioApp_,
    maxInterpreterStepsPerTick: MAX_INTERPRETER_STEPS_PER_TICK,
    customMarshalGlobalProperties: this.gameLabP5.getCustomMarshalGlobalProperties(),
    customMarshalBlockedProperties: this.gameLabP5.getCustomMarshalBlockedProperties()
  });
  this.JSInterpreter.onExecutionError.register(this.handleExecutionError.bind(this));
  this.consoleLogger_.attachTo(this.JSInterpreter);
  if (this.debugger_) {
    this.debugger_.attachTo(this.JSInterpreter);
  }
  this.JSInterpreter.parse({
    code: this.studioApp_.getCode(),
    blocks: dropletConfig.blocks,
    blockFilter: this.level.executePaletteApisOnly && this.level.codeFunctions,
    enableEvents: true
  });
  if (!this.JSInterpreter.initialized()) {
    return;
  }

  gameLabSprite.injectJSInterpreter(this.JSInterpreter);
  gameLabGroup.injectJSInterpreter(this.JSInterpreter);

  this.gameLabP5.p5specialFunctions.forEach(function (eventName) {
    var func = this.JSInterpreter.findGlobalFunction(eventName);
    if (func) {
      this.eventHandlers[eventName] =
          codegen.createNativeFunctionFromInterpreterFunction(func);
    }
  }, this);

  this.globalCodeRunsDuringPreload = !!this.eventHandlers.setup;

  codegen.customMarshalObjectList = this.gameLabP5.getCustomMarshalObjectList();

  var propList = this.gameLabP5.getGlobalPropertyList();
  for (var prop in propList) {
    // Each entry in the propList is an array with 2 elements:
    // propListItem[0] - a native property value
    // propListItem[1] - the property's parent object
    this.JSInterpreter.createGlobalProperty(
        prop,
        propList[prop][0],
        propList[prop][1]);
  }

  /*
  if (this.checkForEditCodePreExecutionFailure()) {
   return this.onPuzzleComplete();
  }
  */
};

GameLab.prototype.onTick = function () {
  this.tickCount++;

  if (this.JSInterpreter) {
    if (this.interpreterStarted) {
      this.JSInterpreter.executeInterpreter();
    }

    this.completePreloadIfPreloadComplete();
    this.completeSetupIfSetupComplete();
    this.completeRedrawIfDrawComplete();
  }
};

/**
 * This is called while this.gameLabP5 is in startExecution(). We use the
 * opportunity to create native event handlers that call down into interpreter
 * code for each event name.
 */
GameLab.prototype.onP5ExecutionStarting = function () {
  this.gameLabP5.p5eventNames.forEach(function (eventName) {
    this.gameLabP5.registerP5EventHandler(eventName, function () {
      if (this.JSInterpreter && this.eventHandlers[eventName]) {
        this.eventHandlers[eventName].apply(null);
      }
    }.bind(this));
  }, this);
};

/**
 * This is called while this.gameLabP5 is in the preload phase. We initialize
 * the interpreter, start its execution, and call the user's preload function.
 *
 * @return {Boolean} whether or not the preload has completed
 */
GameLab.prototype.onP5Preload = function () {
  this.gameLabP5.preloadAnimations(this.getAnimationMetadata());

  this.initInterpreter();
  // And execute the interpreter for the first time:
  if (this.JSInterpreter && this.JSInterpreter.initialized()) {
    // Start executing the interpreter's global code as long as a setup() method
    // was provided. If not, we will skip running any interpreted code in the
    // preload phase and wait until the setup phase.
    this.preloadInProgress = true;
    if (this.globalCodeRunsDuringPreload) {
      this.JSInterpreter.executeInterpreter(true);
      this.interpreterStarted = true;

      // In addition, execute the global function called preload()
      if (this.eventHandlers.preload) {
        this.eventHandlers.preload.apply(null);
      }
    } else {
      if (this.eventHandlers.preload) {
        this.log("WARNING: preload() was ignored because setup() was not provided");
        this.eventHandlers.preload = null;
      }
    }
    this.completePreloadIfPreloadComplete();
  }
  return !this.preloadInProgress;
};

/**
 * This is called while this.gameLabP5 is in the setup phase. We restore the
 * interpreter methods that were modified during preload, then call the user's
 * setup function.
 */
GameLab.prototype.onP5Setup = function () {
  if (this.JSInterpreter) {
    // Re-marshal restored preload methods for the interpreter:
    for (var method in this.gameLabP5.p5._preloadMethods) {
      this.JSInterpreter.createGlobalProperty(
          method,
          this.gameLabP5.p5[method],
          this.gameLabP5.p5);
    }

    this.setupInProgress = true;
    if (!this.globalCodeRunsDuringPreload) {
      // If the setup() method was not provided, we need to run the interpreter
      // for the first time at this point:
      this.JSInterpreter.executeInterpreter(true);
      this.interpreterStarted = true;
    }
    if (this.eventHandlers.setup) {
      this.eventHandlers.setup.apply(null);
    }
    this.completeSetupIfSetupComplete();
  }
};

GameLab.prototype.completeSetupIfSetupComplete = function () {
  if (!this.setupInProgress) {
    return;
  }

  if (!this.globalCodeRunsDuringPreload &&
      !this.JSInterpreter.startedHandlingEvents) {
    // Global code should run during the setup phase, but global code hasn't
    // completed.
    return;
  }

  if (!this.eventHandlers.setup ||
      this.JSInterpreter.seenReturnFromCallbackDuringExecution) {
    this.gameLabP5.afterSetupComplete();
    this.setupInProgress = false;
  }
};

GameLab.prototype.completePreloadIfPreloadComplete = function () {
  if (!this.preloadInProgress) {
    return;
  }

  if (this.globalCodeRunsDuringPreload &&
      !this.JSInterpreter.startedHandlingEvents) {
    // Global code should run during the preload phase, but global code hasn't
    // completed.
    return;
  }

  if (!this.eventHandlers.preload ||
      this.JSInterpreter.seenReturnFromCallbackDuringExecution) {
    this.gameLabP5.notifyPreloadPhaseComplete();
    this.preloadInProgress = false;
  }
};

/**
 * This is called while this.gameLabP5 is in a draw() call. We call the user's
 * draw function.
 */
GameLab.prototype.onP5Draw = function () {
  if (this.JSInterpreter && this.eventHandlers.draw) {
    this.drawInProgress = true;
    this.eventHandlers.draw.apply(null);
  }
  this.completeRedrawIfDrawComplete();
};

GameLab.prototype.completeRedrawIfDrawComplete = function () {
  if (this.drawInProgress && this.JSInterpreter.seenReturnFromCallbackDuringExecution) {
    this.gameLabP5.afterDrawComplete();
    this.drawInProgress = false;
    $('#bubble').text('FPS: ' + this.gameLabP5.getFrameRate().toFixed(0));
  }
};

GameLab.prototype.handleExecutionError = function (err, lineNumber) {
  outputError(String(err), ErrorLevel.ERROR, lineNumber);
  this.executionError = { err: err, lineNumber: lineNumber };
  this.haltExecution_();
  // TODO: Call onPuzzleComplete?
};

/**
 * Executes an API command.
 */
GameLab.prototype.executeCmd = function (id, name, opts) {
  var retVal = false;
  if (gamelabCommands[name] instanceof Function) {
    retVal = gamelabCommands[name](opts);
  }
  return retVal;
};

/**
 * App specific displayFeedback function that calls into
 * this.studioApp_.displayFeedback when appropriate
 */
GameLab.prototype.displayFeedback_ = function () {
  var level = this.level;

  this.studioApp_.displayFeedback({
    app: 'gamelab',
    skin: this.skin.id,
    feedbackType: this.testResults,
    message: this.message,
    response: this.response,
    level: level,
    // feedbackImage: feedbackImageCanvas.canvas.toDataURL("image/png"),
    // add 'impressive':true to non-freeplay levels that we deem are relatively impressive (see #66990480)
    showingSharing: !level.disableSharing && (level.freePlay /* || level.impressive */),
    // impressive levels are already saved
    // alreadySaved: level.impressive,
    // allow users to save freeplay levels to their gallery (impressive non-freeplay levels are autosaved)
    saveToGalleryUrl: level.freePlay && this.response && this.response.save_to_gallery_url,
    appStrings: {
      reinfFeedbackMsg: msg.reinfFeedbackMsg(),
      sharingText: msg.shareGame()
    }
  });
};

/**
 * Get the project's animation metadata for upload to the sources API.
 * Bound to appOptions in gamelab/main.js, used in project.js for autosave.
 */
GameLab.prototype.getAnimationMetadata = function () {
  return this.reduxStore_.getState().animations;
};

GameLab.prototype.getAnimationDropdown = function () {
  return this.getAnimationMetadata().map(function (animation) {
    return {
      text: utils.quote(animation.name),
      display: utils.quote(animation.name)
    };
  });
};
