import $ from 'jquery';
import _ from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';
import {changeInterfaceMode, viewAnimationJson} from './actions';
import {startInAnimationTab} from './stateQueries';
import {
  GameLabInterfaceMode,
  GAME_WIDTH,
  SpritelabReservedWords
} from './constants';
import experiments from '../util/experiments';
import {outputError, injectErrorHandler} from '../lib/util/javascriptMode';
import JavaScriptModeErrorHandler from '../JavaScriptModeErrorHandler';
import BlocklyModeErrorHandler from '../BlocklyModeErrorHandler';
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
import {initializeSubmitHelper, onSubmitComplete} from '../submitHelper';
var dom = require('../dom');
import {initFirebaseStorage} from '../storage/firebaseStorage';
import {getStore} from '../redux';
import {
  allAnimationsSingleFrameSelector,
  setInitialAnimationList,
  saveAnimations,
  withAbsoluteSourceUrls
} from './animationListModule';
import {getSerializedAnimationList} from './shapes';
import {add as addWatcher} from '../redux/watchedExpressions';
var reducers = require('./reducers');
var GameLabView = require('./GameLabView');
var Provider = require('react-redux').Provider;
import {shouldOverlaysBeVisible} from '../templates/VisualizationOverlay';
import {
  getContainedLevelResultInfo,
  postContainedLevelAttempt,
  runAfterPostContainedLevel
} from '../containedLevels';
import {hasValidContainedLevelResult} from '../code-studio/levels/codeStudioLevels';
import {actions as jsDebugger} from '../lib/tools/jsdebugger/redux';
import {addConsoleMessage, clearConsole} from './textConsoleModule';
import {captureThumbnailFromCanvas} from '../util/thumbnail';
import Sounds from '../Sounds';
import {TestResults, ResultType} from '../constants';
import {showHideWorkspaceCallouts} from '../code-studio/callouts';
import defaultSprites from './defaultSprites.json';
import {GamelabAutorunOptions} from '@cdo/apps/util/sharedConstants';
import wrap from './debugger/replay';
import firehoseClient from '@cdo/apps/lib/util/firehose';
import {
  clearMarks,
  clearMeasures,
  getEntriesByName,
  mark,
  measure
} from '@cdo/apps/util/performance';
import MobileControls from './MobileControls';
import Exporter from './Exporter';
import {generateExpoApk} from '../util/exporter';

const defaultMobileControlsConfig = {
  spaceButtonVisible: true,
  dpadVisible: true,
  dpadFourWay: true,
  mobileOnly: true
};

var MAX_INTERPRETER_STEPS_PER_TICK = 500000;

// Number of ticks after which to capture a thumbnail image of the play space.
const CAPTURE_TICK_COUNT = 250;

const validationLibraryName = 'ValidationSetup';

const DRAW_LOOP_START = 'drawLoopStart';
const DRAW_LOOP_MEASURE = 'drawLoop';

/**
 * An instantiable GameLab class
 * @constructor
 * @implements LogTarget
 */
var GameLab = function() {
  this.skin = null;
  this.level = null;
  this.tickIntervalId = 0;
  this.tickCount = 0;
  this.drawLoopTotalTime = 0;
  this.spriteTotalCount = 0;

  /** @type {StudioApp} */
  this.studioApp_ = null;

  /** @type {JSInterpreter} */
  this.JSInterpreter = null;

  /** @private {JsInterpreterLogger} */
  this.consoleLogger_ = new JsInterpreterLogger(window.console);

  this.eventHandlers = {};
  this.Globals = {};
  this.currentCmdQueue = null;
  this.interpreterStarted = false;
  this.globalCodeRunsDuringPreload = false;
  this.drawInProgress = false;
  this.setupInProgress = false;
  this.reportPreloadEventHandlerComplete_ = null;
  this.gameLabP5 = new GameLabP5();
  this.apiJS = apiJavascript;
  this.apiJS.injectGameLab(this);
  this.reportPerf =
    experiments.isEnabled('reportGameLabPerf') || Math.random() < 0.05;

  dropletConfig.injectGameLab(this);

  consoleApi.setLogMethod(this.log.bind(this));

  /** Expose for testing **/
  window.__mostRecentGameLabInstance = this;

  /** Expose for levelbuilders (usable on prod) */
  window.viewExportableAnimationList = () => {
    this.getExportableAnimationList(list => {
      getStore().dispatch(viewAnimationJson(JSON.stringify(list, null, 2)));
    });
  };

  this.showMobileControls = (
    spaceButtonVisible,
    dpadVisible,
    dpadFourWay,
    mobileOnly
  ) => {
    const mobileControlsConfig = {
      spaceButtonVisible,
      dpadVisible,
      dpadFourWay,
      mobileOnly
    };

    this.mobileControls.update(
      mobileControlsConfig,
      getStore().getState().pageConstants.isShareView
    );
  };

  this.appendSpriteConsole = spriteMessage => {
    getStore().dispatch(addConsoleMessage(spriteMessage));
  };
};

module.exports = GameLab;

/**
 * Forward a log message to both logger objects.
 * @param {?} object
 * @param {string} logLevel
 */
GameLab.prototype.log = function(object, logLevel) {
  this.consoleLogger_.log(object);
  if (this.debuggerEnabled) {
    getStore().dispatch(jsDebugger.appendLog(object, logLevel));
  }
};

/**
 * Inject the studioApp singleton.
 */
GameLab.prototype.injectStudioApp = function(studioApp) {
  this.studioApp_ = studioApp;
  this.studioApp_.reset = this.resetHandler.bind(this);
  this.studioApp_.runButtonClick = this.runButtonClick.bind(this);

  this.studioApp_.setCheckForEmptyBlocks(true);
};

/**
 * Initialize Blockly and this GameLab instance.  Called on page load.
 * @param {!AppOptionsConfig} config
 * @param {!GameLabLevel} config.level
 */
GameLab.prototype.init = function(config) {
  if (!this.studioApp_) {
    throw new Error('GameLab requires a StudioApp');
  }

  this.skin = config.skin;
  if (this.studioApp_.isUsingBlockly()) {
    const MEDIA_URL = '/blockly/media/spritelab/';
    this.skin.smallStaticAvatar = MEDIA_URL + 'avatar.png';
    this.skin.staticAvatar = MEDIA_URL + 'avatar.png';
    this.skin.winAvatar = MEDIA_URL + 'avatar.png';
    this.skin.failureAvatar = MEDIA_URL + 'avatar.png';

    injectErrorHandler(
      new BlocklyModeErrorHandler(() => this.JSInterpreter, null)
    );
  } else {
    this.skin.smallStaticAvatar = null;
    this.skin.staticAvatar = null;
    this.skin.winAvatar = null;
    this.skin.failureAvatar = null;

    injectErrorHandler(
      new JavaScriptModeErrorHandler(() => this.JSInterpreter, this)
    );
  }
  this.level = config.level;

  this.shouldAutoRunSetup =
    config.level.autoRunSetup && !this.level.edit_blocks;

  this.level.helperLibraries = this.level.helperLibraries || [];

  this.level.softButtons = this.level.softButtons || [];
  if (this.level.useDefaultSprites) {
    this.startAnimations = defaultSprites;
  } else if (
    this.level.startAnimations &&
    this.level.startAnimations.length > 0
  ) {
    try {
      this.startAnimations = JSON.parse(this.level.startAnimations);
    } catch (err) {
      console.error('Unable to parse default animation list', err);
    }
  }

  config.usesAssets = true;

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

  config.afterClearPuzzle = function() {
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
  config.noHowItWorks = config.droplet;

  config.shareWarningInfo = {
    hasDataAPIs: function() {
      return this.hasDataStoreAPIs(this.studioApp_.getCode());
    }.bind(this),
    onWarningsComplete: function() {
      if (config.share) {
        window.setTimeout(this.studioApp_.runButtonClick, 0);
      }
    }.bind(this)
  };

  // Display CSF-style instructions when using Blockly. Otherwise provide a way
  // for us to have top pane instructions disabled by default, but able to turn
  // them on.
  config.noInstructionsWhenCollapsed = !this.studioApp_.isUsingBlockly();

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
    config.afterEditorReady = this.afterEditorReady_.bind(
      this,
      breakpointsEnabled
    );

    // Store p5specialFunctions in the unusedConfig array so we don't give warnings
    // about these functions not being called:
    config.unusedConfig = this.gameLabP5.p5specialFunctions;

    // Ignore user's code on embedded levels, so that changes made
    // to starting code by levelbuilders will be shown.
    config.ignoreLastAttempt = config.embed;

    if (this.studioApp_.isUsingBlockly()) {
      // Custom blockly config options for game lab jr
      config.valueTypeTabShapeMap = GameLab.valueTypeTabShapeMap(Blockly);
    }

    this.studioApp_.init(config);

    var finishButton = document.getElementById('finishButton');
    if (finishButton) {
      dom.addClickTouchEvent(finishButton, () => this.onPuzzleComplete(false));
    }

    initializeSubmitHelper({
      studioApp: this.studioApp_,
      onPuzzleComplete: this.onPuzzleComplete.bind(this),
      unsubmitUrl: this.level.unsubmitUrl
    });

    this.setCrosshairCursorForPlaySpace();

    if (this.shouldAutoRunSetup) {
      this.studioApp_.addChangeHandler(this.rerunSetupCode.bind(this));
    }
  };

  var showFinishButton =
    !this.level.isProjectLevel && !this.level.validationCode;
  var finishButtonFirstLine = _.isEmpty(this.level.softButtons);

  var showDebugButtons =
    config.level.editCode &&
    (!config.hideSource && !config.level.debuggerDisabled);
  var showDebugConsole = config.level.editCode && !config.hideSource;
  this.debuggerEnabled = showDebugButtons || showDebugConsole;

  if (this.debuggerEnabled) {
    getStore().dispatch(
      jsDebugger.initialize({
        runApp: this.runButtonClick
      })
    );
    if (config.level.expandDebugger) {
      getStore().dispatch(jsDebugger.open());
    }
  }

  this.studioApp_.setPageConstants(config, {
    allowExportExpo: experiments.isEnabled('exportExpo'),
    exportApp: this.exportApp.bind(this),
    channelId: config.channel,
    nonResponsiveVisualizationColumnWidth: GAME_WIDTH,
    showDebugButtons: showDebugButtons,
    showDebugConsole: showDebugConsole,
    showDebugWatch:
      config.level.showDebugWatch || experiments.isEnabled('showWatchers'),
    showDebugSlider: experiments.isEnabled('showDebugSlider'),
    showAnimationMode: !config.level.hideAnimationMode,
    startInAnimationTab: config.level.startInAnimationTab,
    allAnimationsSingleFrame:
      config.level.allAnimationsSingleFrame || this.studioApp_.isUsingBlockly(),
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
    config.initialAnimationList && !config.embed && !config.hasContainedLevels
      ? config.initialAnimationList
      : this.startAnimations;
  getStore().dispatch(setInitialAnimationList(initialAnimationList));

  // Pre-register all audio preloads with our Sounds API, which will load
  // them into memory so they can play immediately:
  $('link[as=fetch][rel=preload]').each((i, {href}) => {
    const soundConfig = {id: href};
    soundConfig[Sounds.getExtensionFromUrl(href)] = href;
    Sounds.getSingleton().register(soundConfig);
  });

  this.loadValidationCodeIfNeeded_();
  const loader = this.studioApp_
    .loadLibraries(this.level.helperLibraries)
    .then(() =>
      ReactDOM.render(
        <Provider store={getStore()}>
          <GameLabView
            showFinishButton={finishButtonFirstLine && showFinishButton}
            onMount={onMount}
          />
        </Provider>,
        document.getElementById(config.containerId)
      )
    );

  if (IN_UNIT_TEST) {
    return loader.catch(() => {});
  }
  return loader;
};

/**
 * Export the project for web or use within Expo.
 * @param {Object} expoOpts
 */
GameLab.prototype.exportApp = async function(expoOpts) {
  // TODO: find another way to get this info that doesn't rely on globals.
  const appName =
    (window.dashboard && window.dashboard.project.getCurrentName()) || 'my-app';
  const {mode, expoSnackId, iconUri, splashImageUri} = expoOpts || {};
  if (mode === 'expoGenerateApk') {
    return generateExpoApk(
      {
        appName,
        expoSnackId,
        iconUri,
        splashImageUri
      },
      this.studioApp_.config
    );
  }
  await this.whenAnimationsAreReady();
  return this.exportAppWithAnimations(
    appName,
    getStore().getState().animationList,
    expoOpts
  );
};

/**
 * Export the project for web or use within Expo.
 * @param {string} appName
 * @param {Object} animationList - object of {AnimationKey} to {AnimationProps}
 * @param {Object} expoOpts
 */
GameLab.prototype.exportAppWithAnimations = function(
  appName,
  animationList,
  expoOpts
) {
  const {pauseAnimationsByDefault} = this.level;
  const allAnimationsSingleFrame = allAnimationsSingleFrameSelector(
    getStore().getState()
  );
  return Exporter.exportApp(
    appName,
    this.studioApp_.editor.getValue(),
    {
      animationList,
      allAnimationsSingleFrame,
      pauseAnimationsByDefault
    },
    expoOpts,
    this.studioApp_.config
  );
};

/**
 * Subscribe to state changes on the store.
 * @param {!Store} store
 */
GameLab.prototype.setupReduxSubscribers = function(store) {
  var state = {};
  store.subscribe(() => {
    var lastState = state;
    state = store.getState();

    const awaitingContainedLevel =
      this.studioApp_.hasContainedLevels && !hasValidContainedLevelResult();

    if (state.interfaceMode !== lastState.interfaceMode) {
      if (
        state.interfaceMode === GameLabInterfaceMode.ANIMATION &&
        !awaitingContainedLevel
      ) {
        this.studioApp_.resetButtonClick();
      }
      requestAnimationFrame(() => showHideWorkspaceCallouts());
    }

    if (
      !lastState.runState ||
      state.runState.isRunning !== lastState.runState.isRunning
    ) {
      this.onIsRunningChange(state.runState.isRunning);
    }

    if (
      !lastState.runState ||
      state.runState.isDebuggingSprites !==
        lastState.runState.isDebuggingSprites
    ) {
      this.onIsDebuggingSpritesChange(state.runState.isDebuggingSprites);
    }

    if (
      !lastState.runState ||
      state.runState.stepSpeed !== lastState.runState.stepSpeed
    ) {
      this.onStepSpeedChange(state.runState.stepSpeed);
    }
  });
};

GameLab.prototype.onIsRunningChange = function() {
  this.setCrosshairCursorForPlaySpace();
};

GameLab.prototype.onIsDebuggingSpritesChange = function(isDebuggingSprites) {
  this.gameLabP5.debugSprites(isDebuggingSprites);
};

GameLab.prototype.onStepSpeedChange = function(stepSpeed) {
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
GameLab.prototype.setCrosshairCursorForPlaySpace = function() {
  var showOverlays = shouldOverlaysBeVisible(getStore().getState());
  $('#divGameLab').toggleClass('withCrosshair', showOverlays);
};

GameLab.prototype.loadAudio_ = function() {
  this.studioApp_.loadAudio(this.skin.winSound, 'win');
  this.studioApp_.loadAudio(this.skin.startSound, 'start');
  this.studioApp_.loadAudio(this.skin.failureSound, 'failure');
};

GameLab.prototype.calculateVisualizationScale_ = function() {
  var divGameLab = document.getElementById('divGameLab');
  // Calculate current visualization scale:
  return divGameLab.getBoundingClientRect().width / divGameLab.offsetWidth;
};

/**
 * @param {string} code The code to search for Data Storage APIs
 * @return {boolean} True if the code uses any data storage APIs
 */
GameLab.prototype.hasDataStoreAPIs = function(code) {
  return (
    /createRecord/.test(code) ||
    /updateRecord/.test(code) ||
    /setKeyValue/.test(code)
  );
};

/**
 * Code called after the blockly div + blockly core is injected into the document
 */
GameLab.prototype.afterInject_ = function(config) {
  this.mobileControls = new MobileControls();
  this.mobileControls.init({
    notifyKeyCodeDown: code => this.gameLabP5.notifyKeyCodeDown(code),
    notifyKeyCodeUp: code => this.gameLabP5.notifyKeyCodeUp(code),
    softButtonIds: this.level.softButtons
  });
  this.mobileControls.update(
    defaultMobileControlsConfig,
    getStore().getState().pageConstants.isShareView
  );

  if (this.studioApp_.isUsingBlockly()) {
    // Add to reserved word list: API, local variables in execution evironment
    // (execute) and the infinite loop detection function.
    Blockly.JavaScript.addReservedWords(
      [
        'GameLab',
        'code',
        'validationState',
        'validationResult',
        'validationProps',
        'levelSuccess',
        'levelFailure'
      ].join(',')
    );
    Blockly.JavaScript.addReservedWords(SpritelabReservedWords.join(','));

    // Don't add infinite loop protection
    Blockly.JavaScript.INFINITE_LOOP_TRAP = '';
  }

  // Update gameLabP5's scale and keep it updated with future resizes:
  this.gameLabP5.scale = this.calculateVisualizationScale_();

  window.addEventListener(
    'resize',
    function() {
      this.gameLabP5.scale = this.calculateVisualizationScale_();
    }.bind(this)
  );
};

/**
 * Initialization to run after ace/droplet is initialized.
 * @param {!boolean} areBreakpointsEnabled
 * @private
 */
GameLab.prototype.afterEditorReady_ = function(areBreakpointsEnabled) {
  if (areBreakpointsEnabled) {
    this.studioApp_.enableBreakpoints();
  }
};

GameLab.prototype.haltExecution_ = function() {
  this.reportMetrics();
  clearMarks(DRAW_LOOP_START);
  clearMeasures(DRAW_LOOP_MEASURE);
  this.spriteTotalCount = 0;

  this.eventHandlers = {};
  this.stopTickTimer();
  this.tickCount = 0;
};

GameLab.prototype.isTickTimerRunning = function() {
  return this.tickIntervalId !== 0;
};

GameLab.prototype.stopTickTimer = function() {
  if (this.tickIntervalId !== 0) {
    window.clearInterval(this.tickIntervalId);
    this.tickIntervalId = 0;
  }
};

GameLab.prototype.startTickTimer = function() {
  if (this.isTickTimerRunning()) {
    console.warn('Tick timer is already running in startTickTimer()');
  }
  // Set to 1ms interval, but note that browser minimums are actually 5-16ms:
  const fastPeriod = 1;
  // Set to 100ms interval when we are in the experiment with the speed slider
  // and the slider has been slowed down (we only support two speeds for now):
  const slowPeriod = 100;
  const intervalPeriod = this.gameLabP5.stepSpeed < 1 ? slowPeriod : fastPeriod;
  this.tickIntervalId = window.setInterval(
    this.onTick.bind(this),
    intervalPeriod
  );
};

/**
 * Reset GameLab to its initial state and optionally run setup code
 * @param {boolean} ignore Required by the API but ignored by this
 *     implementation.
 */
GameLab.prototype.resetHandler = function(ignore) {
  if (this.shouldAutoRunSetup) {
    this.execute(false /* shouldLoop */);
  } else {
    this.reset();
  }
};

/**
 * Reset GameLab to its initial state.
 */
GameLab.prototype.reset = function() {
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

  if (this.debuggerEnabled) {
    getStore().dispatch(jsDebugger.detach());
  }
  this.consoleLogger_.detach();

  // Discard the interpreter.
  if (this.JSInterpreter) {
    this.JSInterpreter.deinitialize();
    this.JSInterpreter = null;
    this.interpreterStarted = false;
  }
  this.executionError = null;

  this.mobileControls.reset();
  this.mobileControls.update(
    defaultMobileControlsConfig,
    getStore().getState().pageConstants.isShareView
  );

  getStore().dispatch(clearConsole());
};

GameLab.prototype.rerunSetupCode = function() {
  if (
    getStore().getState().runState.isRunning ||
    !this.gameLabP5.p5 ||
    !this.areAnimationsReady_()
  ) {
    return;
  }
  Sounds.getSingleton().muteURLs();
  this.gameLabP5.p5.allSprites.removeSprites();
  delete this.gameLabP5.p5.World.background_color;
  this.JSInterpreter.deinitialize();
  this.initInterpreter(false /* attachDebugger */);
  this.onP5Setup();
  this.gameLabP5.p5.redraw();
};

GameLab.prototype.onPuzzleComplete = function(submit, testResult) {
  if (this.executionError) {
    this.result = ResultType.ERROR;
  } else {
    // In most cases, submit all results as success
    this.result = ResultType.SUCCESS;
  }

  // If we know they succeeded, mark levelComplete true
  const levelComplete = this.result === ResultType.SUCCESS;

  if (this.executionError) {
    this.testResults = this.studioApp_.getTestResults(levelComplete, {
      executionError: this.executionError
    });
  } else if (testResult) {
    this.testResults = testResult;
  } else {
    this.testResults = TestResults.FREE_PLAY;
  }

  // Stop everything on screen
  this.reset();

  let program;
  const containedLevelResultsInfo =
    this.studioApp_.hasContainedLevels && getContainedLevelResultInfo();
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
    const onComplete = submit
      ? onSubmitComplete
      : this.onReportComplete.bind(this);

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
GameLab.prototype.onReportComplete = function(response) {
  this.response = response;
  this.waitingForReport = false;
  this.studioApp_.onReportComplete(response);
  this.displayFeedback_();
};

/**
 * Click the run button.  Start the program.
 */
GameLab.prototype.runButtonClick = function() {
  this.studioApp_.toggleRunReset('reset');
  // document.getElementById('spinner').style.visibility = 'visible';
  if (this.studioApp_.isUsingBlockly()) {
    Blockly.mainBlockSpace.traceOn(true);
  }
  this.studioApp_.attempts++;
  this.execute();

  // Enable the Finish button if is present:
  var shareCell = document.getElementById('share-cell');
  if (shareCell && !this.level.validationCode) {
    shareCell.className = 'share-cell-enabled';

    // Adding completion button changes layout.  Force a resize.
    this.studioApp_.onResize();
  }

  postContainedLevelAttempt(this.studioApp_);
};

/**
 * Execute the user's code.  Heaven help us...
 * @param {boolean} shouldLoop - If true, runs user code in a loop. Otherwise,
 * only executes once. Defaults to true.
 */
GameLab.prototype.execute = function(shouldLoop = true) {
  if (shouldLoop) {
    Sounds.getSingleton().unmuteURLs();
  } else {
    Sounds.getSingleton().muteURLs();
  }
  this.result = ResultType.UNSET;
  this.testResults = TestResults.NO_TESTS_RUN;
  this.waitingForReport = false;
  this.response = null;

  // Reset all state.
  this.reset();
  this.studioApp_.clearAndAttachRuntimeAnnotations();

  if (
    this.studioApp_.isUsingBlockly() &&
    (this.studioApp_.hasUnwantedExtraTopBlocks() ||
      this.studioApp_.hasDuplicateVariablesInForLoops())
  ) {
    // immediately check answer, which will fail and report top level blocks
    this.onPuzzleComplete(false);
    return;
  }

  this.gameLabP5.startExecution();
  this.gameLabP5.setLoop(shouldLoop);

  if (
    !this.JSInterpreter ||
    !this.JSInterpreter.initialized() ||
    this.executionError
  ) {
    return;
  }

  if (this.studioApp_.isUsingBlockly() && shouldLoop) {
    // Disable toolbox while running
    Blockly.mainBlockSpaceEditor.setEnableToolbox(false);
  }

  if (shouldLoop) {
    this.startTickTimer();
  }
};

GameLab.prototype.initInterpreter = function(attachDebugger = true) {
  const injectGamelabGlobals = () => {
    if (experiments.isEnabled('replay')) {
      wrap(this.gameLabP5.p5);
    }
    const propList = this.gameLabP5.getGlobalPropertyList();
    for (const prop in propList) {
      // Each entry in the propList is an array with 2 elements:
      // propListItem[0] - a native property value
      // propListItem[1] - the property's parent object
      this.JSInterpreter.createGlobalProperty(
        prop,
        propList[prop][0],
        propList[prop][1]
      );
    }

    this.JSInterpreter.createGlobalProperty(
      'showMobileControls',
      this.showMobileControls,
      null
    );

    this.JSInterpreter.createGlobalProperty(
      'appendSpriteConsole',
      this.appendSpriteConsole,
      null
    );
  };

  this.JSInterpreter = new JSInterpreter({
    studioApp: this.studioApp_,
    maxInterpreterStepsPerTick: MAX_INTERPRETER_STEPS_PER_TICK,
    shouldRunAtMaxSpeed: () => this.gameLabP5.stepSpeed >= 1,
    customMarshalGlobalProperties: this.gameLabP5.getCustomMarshalGlobalProperties(),
    customMarshalBlockedProperties: this.gameLabP5.getCustomMarshalBlockedProperties(),
    customMarshalObjectList: this.gameLabP5.getCustomMarshalObjectList()
  });
  this.JSInterpreter.onExecutionError.register(
    this.handleExecutionError.bind(this)
  );
  this.consoleLogger_.attachTo(this.JSInterpreter);
  if (attachDebugger && this.debuggerEnabled) {
    getStore().dispatch(jsDebugger.attach(this.JSInterpreter));
  }
  let code = '';
  if (this.level.helperLibraries) {
    code +=
      this.level.helperLibraries
        .map(lib => this.studioApp_.libraries[lib])
        .join('\n') + '\n';
  }
  if (this.level.sharedBlocks) {
    code +=
      this.level.sharedBlocks
        .map(blockOptions => blockOptions.helperCode)
        .filter(helperCode => helperCode)
        .join('\n') + '\n';
  }
  if (this.level.customHelperLibrary) {
    code += this.level.customHelperLibrary + '\n';
  }
  const userCodeStartOffset = code.length;
  code += this.studioApp_.getCode();
  this.JSInterpreter.parse({
    code,
    blocks: dropletConfig.blocks,
    blockFilter: this.level.executePaletteApisOnly && this.level.codeFunctions,
    enableEvents: true,
    initGlobals: injectGamelabGlobals,
    userCodeStartOffset
  });
  if (!this.JSInterpreter.initialized()) {
    return;
  }

  gameLabSprite.injectJSInterpreter(this.JSInterpreter);
  gameLabGroup.injectJSInterpreter(this.JSInterpreter);

  this.gameLabP5.p5specialFunctions.forEach(function(eventName) {
    var func = this.JSInterpreter.findGlobalFunction(eventName);
    if (func) {
      this.eventHandlers[
        eventName
      ] = CustomMarshalingInterpreter.createNativeFunctionFromInterpreterFunction(
        func
      );
    }
  }, this);

  this.globalCodeRunsDuringPreload = !!this.eventHandlers.setup;

  /*
  if (this.checkForEditCodePreExecutionFailure()) {
   return this.onPuzzleComplete();
  }
  */
};

GameLab.prototype.onTick = function() {
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
GameLab.prototype.onP5ExecutionStarting = function() {
  this.gameLabP5.p5eventNames.forEach(function(eventName) {
    this.gameLabP5.registerP5EventHandler(
      eventName,
      function() {
        if (this.JSInterpreter && this.eventHandlers[eventName]) {
          this.eventHandlers[eventName].apply(null);
        }
      }.bind(this)
    );
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
GameLab.prototype.onP5Preload = function() {
  Promise.all([
    this.preloadAnimations_(this.level.pauseAnimationsByDefault),
    this.runPreloadEventHandler_()
  ]).then(() => {
    this.gameLabP5.notifyPreloadPhaseComplete();
  });
  return false;
};

GameLab.prototype.loadValidationCodeIfNeeded_ = function() {
  if (
    this.level.validationCode &&
    !this.level.helperLibraries.some(name => name === validationLibraryName)
  ) {
    this.level.helperLibraries.unshift(validationLibraryName);
  }
};

/**
 * Wait for animations to be loaded into memory and ready to use, then pass
 * those animations to P5 to be loaded into the engine as animations.
 * @param {Boolean} pauseAnimationsByDefault whether animations should be paused
 * @returns {Promise} which resolves once animations are in memory in the redux
 *          store and we've started loading them into P5.
 *          Loading to P5 is also an async process but it has its own internal
 *          effect on the P5 preloadCount, so we don't need to track it here.
 * @private
 */
GameLab.prototype.preloadAnimations_ = async function(
  pauseAnimationsByDefault
) {
  await this.whenAnimationsAreReady();
  // Animations are ready - send them to p5 to be loaded into the engine.
  return this.gameLabP5.preloadAnimations(
    getStore().getState().animationList,
    pauseAnimationsByDefault
  );
};

/**
 * Check whether all animations in the project animation list have been loaded
 * into memory and are ready to use.
 * @returns {boolean}
 * @private
 */
GameLab.prototype.areAnimationsReady_ = function() {
  const animationList = getStore().getState().animationList;
  return animationList.orderedKeys.every(
    key => animationList.propsByKey[key].loadedFromSource
  );
};

/**
 * Returns a Promise that resolves once the store says animations are ready.
 * @returns {Promise}
 */
GameLab.prototype.whenAnimationsAreReady = function() {
  return new Promise(resolve => {
    if (this.areAnimationsReady_()) {
      resolve();
      return;
    }
    const unsubscribe = getStore().subscribe(() => {
      if (this.areAnimationsReady_()) {
        unsubscribe();
        resolve();
      }
    });
  });
};

/**
 * Run the preload event handler, and optionally global code, and report when
 * it is done by resolving a returned Promise.
 * @returns {Promise} Which will resolve immediately if there is no code to run,
 *          otherwise will resolve when the preload handler has completed.
 * @private
 */
GameLab.prototype.runPreloadEventHandler_ = function() {
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
          this.log(
            'WARNING: preload() was ignored because setup() was not provided'
          );
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
GameLab.prototype.completePreloadIfPreloadComplete = function() {
  // This function will have been created in runPreloadEventHandler if we
  // actually had an interpreter and might have run preload code.  It could
  // be null if we didn't have an interpreter, or we've already called it.
  if (typeof this.reportPreloadEventHandlerComplete_ !== 'function') {
    return;
  }

  if (
    this.globalCodeRunsDuringPreload &&
    !this.JSInterpreter.startedHandlingEvents
  ) {
    // Global code should run during the preload phase, but global code hasn't
    // completed.
    return;
  }

  if (
    !this.eventHandlers.preload ||
    this.JSInterpreter.seenReturnFromCallbackDuringExecution
  ) {
    this.reportPreloadEventHandlerComplete_();
  }
};

/**
 * This is called while this.gameLabP5 is in the setup phase. We restore the
 * interpreter methods that were modified during preload, then call the user's
 * setup function.
 */
GameLab.prototype.onP5Setup = function() {
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
        this.gameLabP5.p5
      );
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

GameLab.prototype.completeSetupIfSetupComplete = function() {
  if (!this.setupInProgress) {
    return;
  }

  if (
    !this.globalCodeRunsDuringPreload &&
    !this.JSInterpreter.startedHandlingEvents
  ) {
    // Global code should run during the setup phase, but global code hasn't
    // completed.
    this.gameLabP5.afterSetupStarted();
    return;
  }

  if (
    !this.eventHandlers.setup ||
    this.JSInterpreter.seenReturnFromCallbackDuringExecution
  ) {
    this.gameLabP5.afterSetupComplete();
    this.setupInProgress = false;
  }
};

GameLab.prototype.runValidationCode = function() {
  if (this.level.validationCode) {
    try {
      const validationResult = this.JSInterpreter.interpreter.marshalInterpreterToNative(
        this.JSInterpreter.evalInCurrentScope(`
            (function () {
              validationState = null;
              validationResult = null;
              ${this.level.validationCode}
              return {
                state: validationState,
                result: validationResult
              };
            })();
          `)
      );
      if (validationResult.state === 'succeeded') {
        const testResult = validationResult.result || TestResults.ALL_PASS;
        this.onPuzzleComplete(false, testResult);
      } else if (validationResult === 'failed') {
        // TODO(ram): Show failure feedback
      }
    } catch (e) {
      // If validation code errors, assume it was neither a success nor failure
      console.error(e);
    }
  }
};

GameLab.prototype.measureDrawLoop = function(name, callback) {
  if (this.reportPerf) {
    mark(`${name}_start`);
    callback();
    measure(name, `${name}_start`);
    clearMarks(`${name}_start`);
    this.spriteTotalCount += this.gameLabP5.p5.allSprites.length;
  } else {
    callback();
  }
};

/**
 * This is called while this.gameLabP5 is in a draw() call. We call the user's
 * draw function.
 */
GameLab.prototype.onP5Draw = function() {
  if (this.JSInterpreter && this.eventHandlers.draw) {
    this.drawInProgress = true;
    if (getStore().getState().runState.isRunning) {
      this.measureDrawLoop(DRAW_LOOP_MEASURE, () => {
        this.eventHandlers.draw.apply(null);
        this.runValidationCode();
      });
    } else if (this.shouldAutoRunSetup) {
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
GameLab.prototype.captureInitialImage = function() {
  if (this.initialCaptureComplete || this.tickCount < CAPTURE_TICK_COUNT) {
    return;
  }
  this.initialCaptureComplete = true;
  captureThumbnailFromCanvas(document.getElementById('defaultCanvas0'));
};

/**
 * Log some performance numbers to firehose
 */
GameLab.prototype.reportMetrics = function() {
  const drawLoopTimes = getEntriesByName(DRAW_LOOP_MEASURE)
    .map(entry => entry.duration)
    .sort();
  if (!drawLoopTimes.length) {
    return;
  }

  const levelType = this.level.editCode
    ? 'GameLab'
    : this.level.helperLibraries && this.level.helperLibraries[0];
  firehoseClient.putRecord({
    study: 'gamelab_performance',
    event: 'performance_report',
    data_string: levelType,
    data_json: JSON.stringify({
      drawLoopAverageMs: drawLoopTimes[Math.floor(drawLoopTimes.length / 2)],
      spriteAverageCount: this.spriteTotalCount / drawLoopTimes.length
    })
  });
};

GameLab.prototype.completeRedrawIfDrawComplete = function() {
  if (
    this.drawInProgress &&
    this.JSInterpreter.seenReturnFromCallbackDuringExecution
  ) {
    this.gameLabP5.afterDrawComplete();
    this.drawInProgress = false;
    $('#bubble').text('FPS: ' + this.gameLabP5.getFrameRate().toFixed(0));
  }
};

GameLab.prototype.handleExecutionError = function(
  err,
  lineNumber,
  outputString
) {
  outputError(outputString, lineNumber);
  if (err.native) {
    console.error(err.stack);
  }
  this.executionError = {err: err, lineNumber: lineNumber};
  this.haltExecution_();
};

/**
 * Executes an API command.
 */
GameLab.prototype.executeCmd = function(id, name, opts) {
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
GameLab.prototype.displayFeedback_ = function() {
  var level = this.level;

  this.studioApp_.displayFeedback({
    feedbackType: this.testResults,
    message: this.message,
    response: this.response,
    level: level,
    // feedbackImage: feedbackImageCanvas.canvas.toDataURL("image/png"),
    // add 'impressive':true to non-freeplay levels that we deem are relatively impressive (see #66990480)
    showingSharing:
      !level.disableSharing && level.freePlay /* || level.impressive */,
    // impressive levels are already saved
    // alreadySaved: level.impressive,
    // allow users to save freeplay levels to their gallery (impressive non-freeplay levels are autosaved)
    saveToLegacyGalleryUrl:
      level.freePlay && this.response && this.response.save_to_gallery_url,
    appStrings: {
      reinfFeedbackMsg: msg.reinfFeedbackMsg(),
      sharingText: msg.shareGame()
    },
    hideXButton: true
  });
};

/**
 * Get the project's animation metadata for upload to the sources API.
 * Bound to appOptions in gamelab/main.js, used in project.js for autosave.
 * @param {function(SerializedAnimationList)} callback
 */
GameLab.prototype.getSerializedAnimationList = function(callback) {
  getStore().dispatch(
    saveAnimations(() => {
      callback(getSerializedAnimationList(getStore().getState().animationList));
    })
  );
};

/**
 * Get the project's animation metadata, this time for use in a level
 * configuration.  The major difference with SerializedAnimationList is that
 * it includes a sourceUrl for local project animations.
 * @param {function(SerializedAnimationList)} callback
 */
GameLab.prototype.getExportableAnimationList = function(callback) {
  getStore().dispatch(
    saveAnimations(() => {
      const state = getStore().getState();
      const list = state.animationList;
      const serializedList = getSerializedAnimationList(list);
      const exportableList = withAbsoluteSourceUrls(
        serializedList,
        state.pageConstants && state.pageConstants.channelId
      );
      callback(exportableList);
    })
  );
};

GameLab.prototype.getAnimationDropdown = function() {
  const animationList = getStore().getState().animationList;
  return animationList.orderedKeys.map(key => {
    const name = animationList.propsByKey[key].name;
    return {
      text: utils.quote(name),
      display: utils.quote(name)
    };
  });
};

GameLab.prototype.getAppReducers = function() {
  return reducers;
};

GameLab.valueTypeTabShapeMap = function(blockly) {
  return {
    [blockly.BlockValueType.SPRITE]: 'angle',
    [blockly.BlockValueType.BEHAVIOR]: 'rounded',
    [blockly.BlockValueType.LOCATION]: 'square'
  };
};
