import $ from 'jquery';
import _ from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';
import {changeInterfaceMode, viewAnimationJson} from './actions';
import {startInAnimationTab} from './stateQueries';
import {GameLabInterfaceMode, GAME_WIDTH} from './constants';
import experiments from '../util/experiments';
import {
  outputError,
  injectErrorHandler
} from '../lib/util/javascriptMode';
import JavaScriptModeErrorHandler from '../JavaScriptModeErrorHandler';
var msg = require('@cdo/gamelab/locale');
import CustomMarshalingInterpreter from '../lib/tools/jsinterpreter/CustomMarshalingInterpreter';
var apiJavascript = require('./apiJavascript');
var consoleApi = require('../consoleApi');
var utils = require('../utils');
var dropletConfig = require('./dropletConfig');
var JSInterpreter = require('../lib/tools/jsinterpreter/JSInterpreter');
import * as apiTimeoutList from '../lib/util/timeoutList';
var JsInterpreterLogger = require('../JsInterpreterLogger');
var GameLabP5 = require('./GameLabP5');
var gameLabSprite = require('./GameLabSprite');
var gameLabGroup = require('./GameLabGroup');
var gamelabCommands = require('./commands');
import {
  initializeSubmitHelper,
  onSubmitComplete
} from '../submitHelper';
var dom = require('../dom');
import { initFirebaseStorage } from '../storage/firebaseStorage';
import {getStore} from '../redux';
import {
  setInitialAnimationList,
  saveAnimations,
  withAbsoluteSourceUrls
} from './animationListModule';
import {getSerializedAnimationList} from './shapes';
import {add as addWatcher} from '../redux/watchedExpressions';
var reducers = require('./reducers');
var GameLabView = require('./GameLabView');
var Provider = require('react-redux').Provider;
import { shouldOverlaysBeVisible } from '../templates/VisualizationOverlay';
import {
  getContainedLevelResultInfo,
  postContainedLevelAttempt,
  runAfterPostContainedLevel
} from '../containedLevels';
import { hasValidContainedLevelResult } from '../code-studio/levels/codeStudioLevels';
import {actions as jsDebugger} from '../lib/tools/jsdebugger/redux';
import {captureThumbnailFromCanvas} from '../util/thumbnail';
import Sounds from '../Sounds';
import {TestResults, ResultType} from '../constants';
import {showHideWorkspaceCallouts} from '../code-studio/callouts';
import GameLabJrLib from './GameLabJr.interpreted';
import defaultSprites from './defaultSprites.json';
import {GamelabAutorunOptions} from '@cdo/apps/util/sharedConstants';

const LIBRARIES = {
  'GameLabJr': GameLabJrLib,
};

var MAX_INTERPRETER_STEPS_PER_TICK = 500000;

// Number of ticks after which to capture a thumbnail image of the play space.
const CAPTURE_TICK_COUNT = 250;

var ButtonState = {
  UP: 0,
  DOWN: 1
};

var ArrowIds = {
  LEFT: 'leftButton',
  UP: 'upButton',
  RIGHT: 'rightButton',
  DOWN: 'downButton',
  SPACE: 'studio-space-button',
};

/**
 * An instantiable GameLab class
 * @constructor
 * @implements LogTarget
 */
var GameLab = function () {
  this.skin = null;
  this.level = null;
  this.tickIntervalId = 0;
  this.tickCount = 0;

  /** @type {StudioApp} */
  this.studioApp_ = null;

  /** @type {JSInterpreter} */
  this.JSInterpreter = null;

  /** @private {JsInterpreterLogger} */
  this.consoleLogger_ = new JsInterpreterLogger(window.console);

  this.eventHandlers = {};
  this.Globals = {};
  this.btnState = {};
  this.dPadState = {};
  this.currentCmdQueue = null;
  this.interpreterStarted = false;
  this.globalCodeRunsDuringPreload = false;
  this.drawInProgress = false;
  this.setupInProgress = false;
  this.reportPreloadEventHandlerComplete_ = null;
  this.gameLabP5 = new GameLabP5();
  this.apiJS = apiJavascript;
  this.apiJS.injectGameLab(this);

  dropletConfig.injectGameLab(this);

  injectErrorHandler(new JavaScriptModeErrorHandler(
    () => this.JSInterpreter,
    this
  ));
  consoleApi.setLogMethod(this.log.bind(this));

  /** Expose for testing **/
  window.__mostRecentGameLabInstance = this;

  /** Expose for levelbuilders (usable on prod) */
  window.viewExportableAnimationList = () => {
    this.getExportableAnimationList(list => {
      getStore().dispatch(viewAnimationJson(JSON.stringify(list, null, 2)));
    });
  };
};

module.exports = GameLab;

/**
 * Forward a log message to both logger objects.
 * @param {?} object
 * @param {string} logLevel
 */
GameLab.prototype.log = function (object, logLevel) {
  this.consoleLogger_.log(object);
  getStore().dispatch(jsDebugger.appendLog(object, logLevel));
};

/**
 * Inject the studioApp singleton.
 */
GameLab.prototype.injectStudioApp = function (studioApp) {
  this.studioApp_ = studioApp;
  this.studioApp_.reset = this.resetHandler.bind(this);
  this.studioApp_.runButtonClick = this.runButtonClick.bind(this);

  this.studioApp_.setCheckForEmptyBlocks(true);
};

GameLab.baseP5loadImage = null;

/**
 * Initialize Blockly and this GameLab instance.  Called on page load.
 * @param {!AppOptionsConfig} config
 * @param {!GameLabLevel} config.level
 */
GameLab.prototype.init = function (config) {
  if (!this.studioApp_) {
    throw new Error("GameLab requires a StudioApp");
  }

  this.skin = config.skin;
  this.skin.smallStaticAvatar = null;
  this.skin.staticAvatar = null;
  this.skin.winAvatar = null;
  this.skin.failureAvatar = null;
  this.level = config.level;
  this.showDPad = config.level.showDPad && config.share && dom.isMobile();

  this.shouldAutoRunSetup = config.level.autoRunSetup &&
    !this.level.edit_blocks;

  this.level.softButtons = this.level.softButtons || {};
  if (this.level.useDefaultSprites) {
    this.startAnimations = defaultSprites;
  } else if (this.level.startAnimations && this.level.startAnimations.length > 0) {
    try {
      this.startAnimations = JSON.parse(this.level.startAnimations);
    } catch (err) {
      console.error("Unable to parse default animation list", err);
    }
  }

  config.usesAssets = true;

  gameLabSprite.injectLevel(this.level);

  this.studioApp_.labUserId = config.labUserId;
  this.studioApp_.storage = initFirebaseStorage({
    channelId: config.channel,
    firebaseName: config.firebaseName,
    firebaseAuthToken: config.firebaseAuthToken,
    firebaseChannelIdSuffix: config.firebaseChannelIdSuffix || '',
    showRateLimitAlert: this.studioApp_.showRateLimitAlert
  });

  this.gameLabP5.init({
    gameLab: this,
    onExecutionStarting: this.onP5ExecutionStarting.bind(this),
    onPreload: this.onP5Preload.bind(this),
    onSetup: this.onP5Setup.bind(this),
    onDraw: this.onP5Draw.bind(this)
  });

  config.afterClearPuzzle = function () {
    getStore().dispatch(setInitialAnimationList(this.startAnimations));
    this.studioApp_.resetButtonClick();
  }.bind(this);

  config.dropletConfig = dropletConfig;
  config.appMsg = msg;

  // hide makeYourOwn on the share page
  config.makeYourOwn = false;

  config.centerEmbedded = false;
  config.wireframeShare = true;
  config.responsiveEmbedded = true;
  config.noHowItWorks = true;

  config.shareWarningInfo = {
    hasDataAPIs: function () {
      return this.hasDataStoreAPIs(this.studioApp_.getCode());
    }.bind(this),
    onWarningsComplete: function () {
      if (config.share) {
        window.setTimeout(this.studioApp_.runButtonClick, 0);
      }
    }.bind(this)
  };

  // Provide a way for us to have top pane instructions disabled by default, but
  // able to turn them on.
  config.noInstructionsWhenCollapsed = true;

  var breakpointsEnabled = !config.level.debuggerDisabled;
  config.enableShowCode = true;
  config.enableShowLinesCount = false;

  const onMount = () => {
    this.setupReduxSubscribers(getStore());
    if (config.level.watchersPrepopulated) {
      try {
        JSON.parse(config.level.watchersPrepopulated).forEach(option => {
          getStore().dispatch(addWatcher(option));
        });
      } catch (e) {
        console.warn('Error pre-populating watchers.');
      }
    }
    config.loadAudio = this.loadAudio_.bind(this);
    config.afterInject = this.afterInject_.bind(this, config);
    config.afterEditorReady = this.afterEditorReady_.bind(this, breakpointsEnabled);

    // Store p5specialFunctions in the unusedConfig array so we don't give warnings
    // about these functions not being called:
    config.unusedConfig = this.gameLabP5.p5specialFunctions;

    // Ignore user's code on embedded levels, so that changes made
    // to starting code by levelbuilders will be shown.
    config.ignoreLastAttempt = config.embed;

    if (this.studioApp_.isUsingBlockly()) {
      // Custom blockly config options for game lab jr
      config.valueTypeTabShapeMap = { Sprite: 'angle' };
    }

    this.studioApp_.init(config);

    var finishButton = document.getElementById('finishButton');
    if (finishButton) {
      dom.addClickTouchEvent(finishButton, this.onPuzzleComplete.bind(this, false));
    }

    initializeSubmitHelper({
      studioApp: this.studioApp_,
      onPuzzleComplete: this.onPuzzleComplete.bind(this),
      unsubmitUrl: this.level.unsubmitUrl
    });

    this.setCrosshairCursorForPlaySpace();

    if (this.shouldAutoRunSetup) {
      const changeHandler = this.rerunSetupCode.bind(this);
      if (this.studioApp_.isUsingBlockly()) {
        const blocklyCanvas = Blockly.mainBlockSpace.getCanvas();
        blocklyCanvas.addEventListener('blocklyBlockSpaceChange',
          changeHandler);
      } else {
        this.studioApp_.editor.on('change', changeHandler);
        // Droplet doesn't automatically bubble up aceEditor changes
        this.studioApp_.editor.aceEditor.on('change', changeHandler);
      }
    }
  };

  var showFinishButton = !this.level.isProjectLevel;
  var finishButtonFirstLine = _.isEmpty(this.level.softButtons);

  var showDebugButtons = config.level.editCode &&
    (!config.hideSource && !config.level.debuggerDisabled);
  var showDebugConsole = config.level.editCode && !config.hideSource;

  if (showDebugButtons || showDebugConsole) {
    getStore().dispatch(jsDebugger.initialize({
      runApp: this.runButtonClick,
    }));
    if (config.level.expandDebugger) {
      getStore().dispatch(jsDebugger.open());
    }
  }

  this.studioApp_.setPageConstants(config, {
    channelId: config.channel,
    nonResponsiveVisualizationColumnWidth: GAME_WIDTH,
    showDebugButtons: showDebugButtons,
    showDebugConsole: showDebugConsole,
    showDebugWatch: config.level.showDebugWatch || experiments.isEnabled('showWatchers'),
    showDebugSlider: experiments.isEnabled('showDebugSlider'),
    showAnimationMode: !config.level.hideAnimationMode,
    startInAnimationTab: config.level.startInAnimationTab,
    allAnimationsSingleFrame: config.level.allAnimationsSingleFrame,
    isIframeEmbed: !!config.level.iframeEmbed,
    isProjectLevel: !!config.level.isProjectLevel,
    isSubmittable: !!config.level.submittable,
    isSubmitted: !!config.level.submitted
  });

  if (startInAnimationTab(getStore().getState())) {
    getStore().dispatch(changeInterfaceMode(GameLabInterfaceMode.ANIMATION));
  }

  // Push project-sourced animation metadata into store. Always use the
  // animations specified by the level definition for embed and contained
  // levels.
  const initialAnimationList =
    (config.initialAnimationList && !config.embed && !config.hasContainedLevels) ?
    config.initialAnimationList : this.startAnimations;
  getStore().dispatch(setInitialAnimationList(initialAnimationList));

  ReactDOM.render((
    <Provider store={getStore()}>
      <GameLabView
        showFinishButton={finishButtonFirstLine && showFinishButton}
        onMount={onMount}
      />
    </Provider>
  ), document.getElementById(config.containerId));
};

/**
 * Subscribe to state changes on the store.
 * @param {!Store} store
 */
GameLab.prototype.setupReduxSubscribers = function (store) {
  var state = {};
  store.subscribe(() => {
    var lastState = state;
    state = store.getState();

    const awaitingContainedLevel = this.studioApp_.hasContainedLevels &&
      !hasValidContainedLevelResult();

    if (state.interfaceMode !== lastState.interfaceMode) {
      if (state.interfaceMode === GameLabInterfaceMode.ANIMATION &&
        !awaitingContainedLevel) {
          this.studioApp_.resetButtonClick();
      }
      requestAnimationFrame(() => showHideWorkspaceCallouts());
    }

    if (!lastState.runState || state.runState.isRunning !== lastState.runState.isRunning) {
      this.onIsRunningChange(state.runState.isRunning);
    }

    if (!lastState.runState || state.runState.isDebuggingSprites !== lastState.runState.isDebuggingSprites) {
      this.onIsDebuggingSpritesChange(state.runState.isDebuggingSprites);
    }

    if (!lastState.runState || state.runState.stepSpeed !== lastState.runState.stepSpeed) {
      this.onStepSpeedChange(state.runState.stepSpeed);
    }
  });
};

GameLab.prototype.onIsRunningChange = function () {
  this.setCrosshairCursorForPlaySpace();
};

GameLab.prototype.onIsDebuggingSpritesChange = function (isDebuggingSprites) {
  this.gameLabP5.debugSprites(isDebuggingSprites);
};

GameLab.prototype.onStepSpeedChange = function (stepSpeed) {
  this.gameLabP5.changeStepSpeed(stepSpeed);

  if (this.isTickTimerRunning()) {
    this.stopTickTimer();
    this.startTickTimer();
  }
};

/**
 * Hopefully a temporary measure - we do this ourselves for now because this is
 * a 'protected' div that React doesn't update, but eventually would rather do
 * this with React.
 */
GameLab.prototype.setCrosshairCursorForPlaySpace = function () {
  var showOverlays = shouldOverlaysBeVisible(getStore().getState());
  $('#divGameLab').toggleClass('withCrosshair', showOverlays);
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
  if (this.showDPad) {
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
  this.stopTickTimer();
  this.tickCount = 0;
};

GameLab.prototype.isTickTimerRunning = function () {
  return this.tickIntervalId !== 0;
};

GameLab.prototype.stopTickTimer = function () {
  if (this.tickIntervalId !== 0) {
    window.clearInterval(this.tickIntervalId);
    this.tickIntervalId = 0;
  }
};

GameLab.prototype.startTickTimer = function () {
  if (this.isTickTimerRunning()) {
    console.warn('Tick timer is already running in startTickTimer()');
  }
  // Set to 1ms interval, but note that browser minimums are actually 5-16ms:
  const fastPeriod = 1;
  // Set to 100ms interval when we are in the experiment with the speed slider
  // and the slider has been slowed down (we only support two speeds for now):
  const slowPeriod = 100;
  const intervalPeriod = this.gameLabP5.stepSpeed < 1 ? slowPeriod : fastPeriod;
  this.tickIntervalId = window.setInterval(this.onTick.bind(this), intervalPeriod);
};

/**
 * Reset GameLab to its initial state and optionally run setup code
 * @param {boolean} ignore Required by the API but ignored by this
 *     implementation.
 */
GameLab.prototype.resetHandler = function (ignore) {
  if (this.shouldAutoRunSetup) {
    this.execute(false /* keepTicking */);
  } else {
    this.reset();
  }
};

/**
 * Reset GameLab to its initial state.
 */
GameLab.prototype.reset = function () {
  this.haltExecution_();

  /*
  var divGameLab = document.getElementById('divGameLab');
  while (divGameLab.firstChild) {
    divGameLab.removeChild(divGameLab.firstChild);
  }
  */

  apiTimeoutList.clearTimeouts();
  apiTimeoutList.clearIntervals();
  Sounds.getSingleton().stopAllAudio();

  this.gameLabP5.resetExecution();

  // Import to reset these after this.gameLabP5 has been reset
  this.drawInProgress = false;
  this.setupInProgress = false;
  this.initialCaptureComplete = false;
  this.reportPreloadEventHandlerComplete_ = null;
  this.globalCodeRunsDuringPreload = false;

  getStore().dispatch(jsDebugger.detach());
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

  if (this.showDPad) {
    $('#studio-dpad').removeClass('studio-dpad-none');
    this.resetDPad();
  }
};

GameLab.prototype.rerunSetupCode = function () {
  if (getStore().getState().runState.isRunning ||
      !this.gameLabP5.p5 ||
      !this.areAnimationsReady_()) {
    return;
  }
  this.gameLabP5.p5.allSprites.removeSprites();
  this.JSInterpreter.deinitialize();
  this.initInterpreter(false /* attachDebugger */);
  this.onP5Setup();
  this.gameLabP5.p5.redraw();
};

GameLab.prototype.onPuzzleComplete = function (submit) {
  if (this.executionError) {
    this.result = ResultType.ERROR;
  } else {
    // In most cases, submit all results as success
    this.result = ResultType.SUCCESS;
  }

  // If we know they succeeded, mark levelComplete true
  const levelComplete = (this.result === ResultType.SUCCESS);

  if (this.executionError) {
    this.testResults = this.studioApp_.getTestResults(levelComplete, {
        executionError: this.executionError
    });
  } else {
    this.testResults = TestResults.FREE_PLAY;
  }

  // Stop everything on screen
  this.reset();

  let program;
  const containedLevelResultsInfo = this.studioApp_.hasContainedLevels &&
    getContainedLevelResultInfo();
  if (containedLevelResultsInfo) {
    // Keep our this.testResults as always passing so the feedback dialog
    // shows Continue (the proper results will be reported to the service)
    this.testResults = TestResults.ALL_PASS;
    this.message = containedLevelResultsInfo.feedback;
  } else if (this.level.editCode) {
    // If we want to "normalize" the JavaScript to avoid proliferation of nearly
    // identical versions of the code on the service, we could do either of these:

    // do an acorn.parse and then use escodegen to generate back a "clean" version
    // or minify (uglifyjs) and that or js-beautify to restore a "clean" version

    program = encodeURIComponent(this.studioApp_.getCode());
    this.message = null;
  } else {
    // We're using blockly, report the program as xml
    var xml = Blockly.Xml.blockSpaceToDom(Blockly.mainBlockSpace);
    program = encodeURIComponent(Blockly.Xml.domToText(xml));
  }

  if (this.testResults >= TestResults.FREE_PLAY) {
    this.studioApp_.playAudio('win');
  } else {
    this.studioApp_.playAudio('failure');
  }

  this.waitingForReport = true;

  const sendReport = () => {
    const onComplete = submit ? onSubmitComplete : this.onReportComplete.bind(this);

    if (containedLevelResultsInfo) {
      // We already reported results when run was clicked. Make sure that call
      // finished, then call onCompelte
      runAfterPostContainedLevel(onComplete);
    } else {
      this.studioApp_.report({
        app: 'gamelab',
        level: this.level.id,
        result: levelComplete,
        testResult: this.testResults,
        submitted: submit,
        program: program,
        image: this.encodedFeedbackImage,
        onComplete
      });
    }

    if (this.studioApp_.isUsingBlockly()) {
      // reenable toolbox
      Blockly.mainBlockSpaceEditor.setEnableToolbox(true);
    }
  };

  sendReport();
};

/**
 * Function to be called when the service report call is complete
 * @param {MilestoneResponse} response - JSON response (if available)
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

    // Adding completion button changes layout.  Force a resize.
    this.studioApp_.onResize();
  }

  postContainedLevelAttempt(this.studioApp_);
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
    case ArrowIds.SPACE:
      return window.p5.prototype.KEY.SPACE;
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
  const dPadButton = $('#studio-dpad-button');
  const dPadCone = $('#studio-dpad-cone');
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
        dPadCone.addClass(cssClass);
      }
    } else if (prev < start) {
      self.gameLabP5.notifyKeyCodeUp(keyCode);
      dPadButton.removeClass(cssClass);
      dPadCone.removeClass(cssClass);
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

  if (e.touches && e.touches.length > 0) {
    return;
  }

  for (var buttonId in this.btnState) {
    if (this.btnState[buttonId] === ButtonState.DOWN) {

      this.btnState[buttonId] = ButtonState.UP;
      this.gameLabP5.notifyKeyCodeUp(p5KeyCodeFromArrow(buttonId));
    }
  }

  this.resetDPad();
};

/**
 * Execute the user's code.  Heaven help us...
 */
GameLab.prototype.execute = function (keepTicking = true) {
  this.result = ResultType.UNSET;
  this.testResults = TestResults.NO_TESTS_RUN;
  this.waitingForReport = false;
  this.response = null;

  // Reset all state.
  this.reset();
  this.studioApp_.clearAndAttachRuntimeAnnotations();

  if (this.studioApp_.isUsingBlockly() &&
      (this.studioApp_.hasUnwantedExtraTopBlocks() ||
        this.studioApp_.hasDuplicateVariablesInForLoops())) {
    // immediately check answer, which will fail and report top level blocks
    this.onPuzzleComplete(false);
    return;
  }

  this.gameLabP5.startExecution();
  this.gameLabP5.setLoop(keepTicking);

  if (!this.JSInterpreter ||
      !this.JSInterpreter.initialized() ||
      this.executionError) {
    return;
  }

  if (this.studioApp_.isUsingBlockly() && keepTicking) {
    // Disable toolbox while running
    Blockly.mainBlockSpaceEditor.setEnableToolbox(false);
  }

  if (keepTicking) {
    this.startTickTimer();
  }
};

GameLab.prototype.initInterpreter = function (attachDebugger=true) {

  var self = this;
  function injectGamelabGlobals() {
    var propList = self.gameLabP5.getGlobalPropertyList();
    for (var prop in propList) {
      // Each entry in the propList is an array with 2 elements:
      // propListItem[0] - a native property value
      // propListItem[1] - the property's parent object
      self.JSInterpreter.createGlobalProperty(
          prop,
          propList[prop][0],
          propList[prop][1]);
    }
  }

  this.JSInterpreter = new JSInterpreter({
    studioApp: this.studioApp_,
    maxInterpreterStepsPerTick: MAX_INTERPRETER_STEPS_PER_TICK,
    shouldRunAtMaxSpeed: () => (this.gameLabP5.stepSpeed >= 1),
    customMarshalGlobalProperties: this.gameLabP5.getCustomMarshalGlobalProperties(),
    customMarshalBlockedProperties: this.gameLabP5.getCustomMarshalBlockedProperties(),
    customMarshalObjectList: this.gameLabP5.getCustomMarshalObjectList(),
  });
  window.tempJSInterpreter = this.JSInterpreter;
  this.JSInterpreter.onExecutionError.register(this.handleExecutionError.bind(this));
  this.consoleLogger_.attachTo(this.JSInterpreter);
  if (attachDebugger) {
    getStore().dispatch(jsDebugger.attach(this.JSInterpreter));
  }
  let code = this.studioApp_.getCode();
  if (this.level.customHelperLibrary) {
    code = this.level.customHelperLibrary + code;
  }
  if (this.level.helperLibraries) {
    const libs = this.level.helperLibraries
      .map((lib) => LIBRARIES[lib])
      .join("\n");
    code = libs + code;
  }
  this.JSInterpreter.parse({
    code,
    blocks: dropletConfig.blocks,
    blockFilter: this.level.executePaletteApisOnly && this.level.codeFunctions,
    enableEvents: true,
    initGlobals: injectGamelabGlobals
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
          CustomMarshalingInterpreter.createNativeFunctionFromInterpreterFunction(func);
    }
  }, this);

  this.globalCodeRunsDuringPreload = !!this.eventHandlers.setup;

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

      if (this.gameLabP5.stepSpeed < 1) {
        this.gameLabP5.drawDebugSpriteColliders();
      }
    }

    this.completePreloadIfPreloadComplete();
    this.completeSetupIfSetupComplete();
    this.captureInitialImage();
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
 * This is called while this.gameLabP5 is in the preload phase. Do the following:
 *
 * - load animations into the P5 engine
 * - initialize the interpreter
 * - start its execution
 * - (optional) execute global code
 * - call the user's preload function
 *
 * @return {Boolean} FALSE so that P5 will internally increment a preload count;
 *         calling notifyPreloadPhaseComplete is then necessary to continue
 *         loading the game.
 */
GameLab.prototype.onP5Preload = function () {
  Promise.all([
      this.preloadAnimations_(),
      this.runPreloadEventHandler_()
  ]).then(() => {
    this.gameLabP5.notifyPreloadPhaseComplete();
  });
  return false;
};

/**
 * Wait for animations to be loaded into memory and ready to use, then pass
 * those animations to P5 to be loaded into the engine as animations.
 * @returns {Promise} which resolves once animations are in memory in the redux
 *          store and we've started loading them into P5.
 *          Loading to P5 is also an async process but it has its own internal
 *          effect on the P5 preloadCount, so we don't need to track it here.
 * @private
 */
GameLab.prototype.preloadAnimations_ = function () {
  let store = getStore();
  return new Promise(resolve => {
    if (this.areAnimationsReady_()) {
      resolve();
    } else {
      // Watch store changes until all the animations are ready.
      const unsubscribe = store.subscribe(() => {
        if (this.areAnimationsReady_()) {
          unsubscribe();
          resolve();
        }
      });
    }
  }).then(() => {
    // Animations are ready - send them to p5 to be loaded into the engine.
    return this.gameLabP5.preloadAnimations(store.getState().animationList);
  });
};

/**
 * Check whether all animations in the project animation list have been loaded
 * into memory and are ready to use.
 * @returns {boolean}
 * @private
 */
GameLab.prototype.areAnimationsReady_ = function () {
  const animationList = getStore().getState().animationList;
  return animationList.orderedKeys.every(key => animationList.propsByKey[key].loadedFromSource);
};

/**
 * Run the preload event handler, and optionally global code, and report when
 * it is done by resolving a returned Promise.
 * @returns {Promise} Which will resolve immediately if there is no code to run,
 *          otherwise will resolve when the preload handler has completed.
 * @private
 */
GameLab.prototype.runPreloadEventHandler_ = function () {
  return new Promise(resolve => {
    this.initInterpreter();
    // Execute the interpreter for the first time:
    if (this.JSInterpreter && this.JSInterpreter.initialized()) {
      // Start executing the interpreter's global code as long as a setup() method
      // was provided. If not, we will skip running any interpreted code in the
      // preload phase and wait until the setup phase.
      this.reportPreloadEventHandlerComplete_ = () => {
        this.reportPreloadEventHandlerComplete_ = null;
        resolve();
      };
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
    } else {
      // If we didn't run anything resolve now.
      resolve();
    }
  });
};

/**
 * Called on tick to check whether preload code is done running, and trigger
 * the appropriate report of completion if it is.
 */
GameLab.prototype.completePreloadIfPreloadComplete = function () {
  // This function will have been created in runPreloadEventHandler if we
  // actually had an interpreter and might have run preload code.  It could
  // be null if we didn't have an interpreter, or we've already called it.
  if (typeof this.reportPreloadEventHandlerComplete_ !== 'function') {
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
    this.reportPreloadEventHandlerComplete_();
  }
};

/**
 * This is called while this.gameLabP5 is in the setup phase. We restore the
 * interpreter methods that were modified during preload, then call the user's
 * setup function.
 */
GameLab.prototype.onP5Setup = function () {
  if (this.JSInterpreter) {
    // Re-marshal restored preload methods for the interpreter:
    const preloadMethods = _.intersection(
      this.gameLabP5.p5._preloadMethods,
      this.gameLabP5.getMarshallableP5Properties()
    );
    for (const method in preloadMethods) {
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
    this.gameLabP5.afterSetupStarted();
    return;
  }

  if (!this.eventHandlers.setup ||
      this.JSInterpreter.seenReturnFromCallbackDuringExecution) {
    this.gameLabP5.afterSetupComplete();
    this.setupInProgress = false;
  }
};

/**
 * This is called while this.gameLabP5 is in a draw() call. We call the user's
 * draw function.
 */
GameLab.prototype.onP5Draw = function () {
  if (this.JSInterpreter && this.eventHandlers.draw) {
    this.drawInProgress = true;
    if (getStore().getState().runState.isRunning) {
      this.eventHandlers.draw.apply(null);
    } else if (this.shouldAutoRunSetup) {
      this.gameLabP5.p5.background('white');
      switch (this.level.autoRunSetup) {
        case GamelabAutorunOptions.draw_loop:
          this.eventHandlers.draw.apply(null);
          break;
        case GamelabAutorunOptions.draw_sprites:
          this.JSInterpreter.evalInCurrentScope('drawSprites();');
          break;
        case GamelabAutorunOptions.custom:
          this.JSInterpreter.evalInCurrentScope(this.level.customSetupCode);
          break;
      }
    }
  }
  this.completeRedrawIfDrawComplete();
};

/**
 * Capture a thumbnail image of the play space if the app has been running
 * for long enough and we have not done so already.
 */
GameLab.prototype.captureInitialImage = function () {
  if (this.initialCaptureComplete || this.tickCount < CAPTURE_TICK_COUNT) {
    return;
  }
  this.initialCaptureComplete = true;
  captureThumbnailFromCanvas(document.getElementById('defaultCanvas0'));
};


GameLab.prototype.completeRedrawIfDrawComplete = function () {
  if (this.drawInProgress && this.JSInterpreter.seenReturnFromCallbackDuringExecution) {
    this.gameLabP5.afterDrawComplete();
    this.drawInProgress = false;
    $('#bubble').text('FPS: ' + this.gameLabP5.getFrameRate().toFixed(0));
  }
};

GameLab.prototype.handleExecutionError = function (err, lineNumber, outputString) {
  outputError(outputString, lineNumber);
  this.executionError = { err: err, lineNumber: lineNumber };
  this.haltExecution_();
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
    saveToLegacyGalleryUrl: level.freePlay && this.response && this.response.save_to_gallery_url,
    appStrings: {
      reinfFeedbackMsg: msg.reinfFeedbackMsg(),
      sharingText: msg.shareGame()
    },
    hideXButton: true,
  });
};

/**
 * Get the project's animation metadata for upload to the sources API.
 * Bound to appOptions in gamelab/main.js, used in project.js for autosave.
 * @param {function(SerializedAnimationList)} callback
 */
GameLab.prototype.getSerializedAnimationList = function (callback) {
  getStore().dispatch(saveAnimations(() => {
    callback(getSerializedAnimationList(getStore().getState().animationList));
  }));
};

/**
 * Get the project's animation metadata, this time for use in a level
 * configuration.  The major difference with SerializedAnimationList is that
 * it includes a sourceUrl for local project animations.
 * @param {function(SerializedAnimationList)} callback
 */
GameLab.prototype.getExportableAnimationList = function (callback) {
  getStore().dispatch(saveAnimations(() => {
    const state = getStore().getState();
    const list = state.animationList;
    const serializedList = getSerializedAnimationList(list);
    const exportableList = withAbsoluteSourceUrls(serializedList, state.pageConstants && state.pageConstants.channelId);
    callback(exportableList);
  }));
};

GameLab.prototype.getAnimationDropdown = function () {
  const animationList = getStore().getState().animationList;
  return animationList.orderedKeys.map(key => {
    const name = animationList.propsByKey[key].name;
    return {
      text: utils.quote(name),
      display: utils.quote(name)
    };
  });
};

GameLab.prototype.getAppReducers = function () {
  return reducers;
};
