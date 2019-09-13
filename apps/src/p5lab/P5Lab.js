import $ from 'jquery';
import _ from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';
import {changeInterfaceMode, viewAnimationJson} from './actions';
import {startInAnimationTab} from './stateQueries';
import {P5LabInterfaceMode, APP_WIDTH} from './constants';
import {SpritelabReservedWords} from './spritelab/constants';
import experiments from '@cdo/apps/util/experiments';
import {
  outputError,
  injectErrorHandler
} from '@cdo/apps/lib/util/javascriptMode';
import JavaScriptModeErrorHandler from '@cdo/apps/JavaScriptModeErrorHandler';
import BlocklyModeErrorHandler from '@cdo/apps/BlocklyModeErrorHandler';
var gamelabMsg = require('@cdo/gamelab/locale');
var spritelabMsg = require('@cdo/spritelab/locale');
import CustomMarshalingInterpreter from '@cdo/apps/lib/tools/jsinterpreter/CustomMarshalingInterpreter';
var apiJavascript = require('./gamelab/apiJavascript');
var consoleApi = require('@cdo/apps/consoleApi');
var utils = require('@cdo/apps/utils');
var dropletConfig = require('./gamelab/dropletConfig');
var JSInterpreter = require('@cdo/apps/lib/tools/jsinterpreter/JSInterpreter');
import * as apiTimeoutList from '@cdo/apps/lib/util/timeoutList';
var JsInterpreterLogger = require('@cdo/apps/JsInterpreterLogger');
var P5Wrapper = require('./P5Wrapper');
var p5SpriteWrapper = require('./P5SpriteWrapper');
var p5GroupWrapper = require('./P5GroupWrapper');
var gamelabCommands = require('./gamelab/commands');
import {initializeSubmitHelper, onSubmitComplete} from '@cdo/apps/submitHelper';
var dom = require('@cdo/apps/dom');
import {initFirebaseStorage} from '@cdo/apps/storage/firebaseStorage';
import {getStore} from '@cdo/apps/redux';
import {
  allAnimationsSingleFrameSelector,
  setInitialAnimationList,
  saveAnimations,
  withAbsoluteSourceUrls
} from './animationListModule';
import {getSerializedAnimationList} from './shapes';
import {add as addWatcher} from '@cdo/apps/redux/watchedExpressions';
var reducers = require('./reducers');
var P5LabView = require('./P5LabView');
var Provider = require('react-redux').Provider;
import {shouldOverlaysBeVisible} from '@cdo/apps/templates/VisualizationOverlay';
import {
  getContainedLevelResultInfo,
  postContainedLevelAttempt,
  runAfterPostContainedLevel
} from '@cdo/apps/containedLevels';
import {hasValidContainedLevelResult} from '@cdo/apps/code-studio/levels/codeStudioLevels';
import {actions as jsDebugger} from '@cdo/apps/lib/tools/jsdebugger/redux';
import {addConsoleMessage, clearConsole} from './spritelab/textConsoleModule';
import {captureThumbnailFromCanvas} from '@cdo/apps/util/thumbnail';
import Sounds from '@cdo/apps/Sounds';
import {TestResults, ResultType} from '@cdo/apps/constants';
import {showHideWorkspaceCallouts} from '@cdo/apps/code-studio/callouts';
import defaultSprites from './spritelab/defaultSprites.json';
import wrap from './gamelab/debugger/replay';
import firehoseClient from '@cdo/apps/lib/util/firehose';
import {
  clearMarks,
  clearMeasures,
  getEntriesByName,
  mark,
  measure
} from '@cdo/apps/util/performance';
import MobileControls from './gamelab/MobileControls';
import Exporter from './gamelab/Exporter';
import {
  expoGenerateApk,
  expoCheckApkBuild,
  expoCancelApkBuild
} from '@cdo/apps/util/exporter';
import project from '@cdo/apps/code-studio/initApp/project';
import {setExportGeneratedProperties} from '@cdo/apps/code-studio/components/exportDialogRedux';

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
var P5Lab = function() {
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

  this.generatedProperties = {};
  this.eventHandlers = {};
  this.Globals = {};
  this.currentCmdQueue = null;
  this.interpreterStarted = false;
  this.globalCodeRunsDuringPreload = false;
  this.drawInProgress = false;
  this.setupInProgress = false;
  this.reportPreloadEventHandlerComplete_ = null;
  this.p5Wrapper = new P5Wrapper();
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

module.exports = P5Lab;

/**
 * Forward a log message to both logger objects.
 * @param {?} object
 * @param {string} logLevel
 */
P5Lab.prototype.log = function(object, logLevel) {
  this.consoleLogger_.log({output: object, fromConsoleLog: true});
  if (this.debuggerEnabled) {
    getStore().dispatch(
      jsDebugger.appendLog({output: object, fromConsoleLog: true}, logLevel)
    );
  }
};

/**
 * Inject the studioApp singleton.
 */
P5Lab.prototype.injectStudioApp = function(studioApp) {
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
P5Lab.prototype.init = function(config) {
  if (!this.studioApp_) {
    throw new Error('P5Lab requires a StudioApp');
  }

  this.isSpritelab = this.studioApp_.isUsingBlockly();

  this.skin = config.skin;
  if (this.isSpritelab) {
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

  this.p5Wrapper.init({
    gameLab: this,
    onExecutionStarting: this.onP5ExecutionStarting.bind(this),
    onPreload: this.onP5Preload.bind(this),
    onSetup: this.onP5Setup.bind(this),
    onDraw: this.onP5Draw.bind(this),
    spritelab: this.isSpritelab
  });

  config.afterClearPuzzle = function() {
    getStore().dispatch(setInitialAnimationList(this.startAnimations));
    this.studioApp_.resetButtonClick();
  }.bind(this);

  config.dropletConfig = dropletConfig;
  config.appMsg = this.isSpritelab ? spritelabMsg : gamelabMsg;

  // hide makeYourOwn on the share page
  config.makeYourOwn = false;

  config.wireframeShare = true;
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
  config.noInstructionsWhenCollapsed = !this.isSpritelab;

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
    // Clone p5specialFunctions so we can remove 'setup' from unusedConfig but not p5specialFunctions
    config.unusedConfig = this.p5Wrapper.p5specialFunctions.slice(0);
    // remove 'setup' from unusedConfig so that we can show a warning for redefining it.
    if (config.unusedConfig.indexOf('setup') !== -1) {
      config.unusedConfig.splice(config.unusedConfig.indexOf('setup'), 1);
    }

    // Ignore user's code on embedded levels, so that changes made
    // to starting code by levelbuilders will be shown.
    config.ignoreLastAttempt = config.embed;

    if (this.studioApp_.isUsingBlockly()) {
      // Custom blockly config options for game lab jr
      config.valueTypeTabShapeMap = P5Lab.valueTypeTabShapeMap(Blockly);
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

    if (this.isSpritelab) {
      this.studioApp_.addChangeHandler(() => {
        if (!getStore().getState().runState.isRunning) {
          this.reset();
          this.preview.apply(this);
        }
      });
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

  const setAndroidExportProps = this.setAndroidExportProps.bind(this);

  this.studioApp_.setPageConstants(config, {
    allowExportExpo: experiments.isEnabled('exportExpo'),
    exportApp: this.exportApp.bind(this),
    expoGenerateApk: expoGenerateApk.bind(
      null,
      config.expoSession,
      setAndroidExportProps
    ),
    expoCheckApkBuild: expoCheckApkBuild.bind(
      null,
      config.expoSession,
      setAndroidExportProps
    ),
    expoCancelApkBuild: expoCancelApkBuild.bind(
      null,
      config.expoSession,
      setAndroidExportProps
    ),
    channelId: config.channel,
    nonResponsiveVisualizationColumnWidth: APP_WIDTH,
    showDebugButtons: showDebugButtons,
    showDebugConsole: showDebugConsole,
    showDebugWatch:
      config.level.showDebugWatch || experiments.isEnabled('showWatchers'),
    showDebugSlider: experiments.isEnabled('showDebugSlider'),
    showAnimationMode: !config.level.hideAnimationMode,
    startInAnimationTab: config.level.startInAnimationTab,
    allAnimationsSingleFrame:
      config.level.allAnimationsSingleFrame || this.isSpritelab,
    isIframeEmbed: !!config.level.iframeEmbed,
    isProjectLevel: !!config.level.isProjectLevel,
    isSubmittable: !!config.level.submittable,
    isSubmitted: !!config.level.submitted
  });

  if (startInAnimationTab(getStore().getState())) {
    getStore().dispatch(changeInterfaceMode(P5LabInterfaceMode.ANIMATION));
  }

  // Push project-sourced animation metadata into store. Always use the
  // animations specified by the level definition for embed and contained
  // levels.
  const initialAnimationList =
    config.initialAnimationList && !config.embed && !config.hasContainedLevels
      ? config.initialAnimationList
      : this.startAnimations;
  getStore().dispatch(setInitialAnimationList(initialAnimationList));

  this.generatedProperties = {
    ...config.initialGeneratedProperties
  };
  getStore().dispatch(
    setExportGeneratedProperties(this.generatedProperties.export)
  );

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
          <P5LabView
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
P5Lab.prototype.exportApp = async function(expoOpts) {
  await this.whenAnimationsAreReady();
  return this.exportAppWithAnimations(
    project.getCurrentName() || 'my-app',
    getStore().getState().animationList,
    expoOpts
  );
};

P5Lab.prototype.setAndroidExportProps = function(props) {
  // Spread the previous object so changes here will always fail shallow
  // compare and trigger react prop changes
  this.generatedProperties.export = {
    ...this.generatedProperties.export,
    android: props
  };
  project.projectChanged();
  project.saveIfSourcesChanged();
  getStore().dispatch(
    setExportGeneratedProperties(this.generatedProperties.export)
  );
};

/**
 * Export the project for web or use within Expo.
 * @param {string} appName
 * @param {Object} animationList - object of {AnimationKey} to {AnimationProps}
 * @param {Object} expoOpts
 */
P5Lab.prototype.exportAppWithAnimations = function(
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
P5Lab.prototype.setupReduxSubscribers = function(store) {
  var state = {};
  store.subscribe(() => {
    var lastState = state;
    state = store.getState();

    const awaitingContainedLevel =
      this.studioApp_.hasContainedLevels && !hasValidContainedLevelResult();

    if (state.interfaceMode !== lastState.interfaceMode) {
      if (
        state.interfaceMode === P5LabInterfaceMode.ANIMATION &&
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

P5Lab.prototype.onIsRunningChange = function() {
  this.setCrosshairCursorForPlaySpace();
};

P5Lab.prototype.onIsDebuggingSpritesChange = function(isDebuggingSprites) {
  this.p5Wrapper.debugSprites(isDebuggingSprites);
};

P5Lab.prototype.onStepSpeedChange = function(stepSpeed) {
  this.p5Wrapper.changeStepSpeed(stepSpeed);

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
P5Lab.prototype.setCrosshairCursorForPlaySpace = function() {
  var showOverlays = shouldOverlaysBeVisible(getStore().getState());
  $('#divGameLab').toggleClass('withCrosshair', showOverlays);
};

P5Lab.prototype.loadAudio_ = function() {
  this.studioApp_.loadAudio(this.skin.winSound, 'win');
  this.studioApp_.loadAudio(this.skin.startSound, 'start');
  this.studioApp_.loadAudio(this.skin.failureSound, 'failure');
};

P5Lab.prototype.calculateVisualizationScale_ = function() {
  var divGameLab = document.getElementById('divGameLab');
  // Calculate current visualization scale:
  return divGameLab.getBoundingClientRect().width / divGameLab.offsetWidth;
};

/**
 * @param {string} code The code to search for Data Storage APIs
 * @return {boolean} True if the code uses any data storage APIs
 */
P5Lab.prototype.hasDataStoreAPIs = function(code) {
  return (
    /createRecord/.test(code) ||
    /updateRecord/.test(code) ||
    /setKeyValue/.test(code)
  );
};

/**
 * Code called after the blockly div + blockly core is injected into the document
 */
P5Lab.prototype.afterInject_ = function(config) {
  this.mobileControls = new MobileControls();
  this.mobileControls.init({
    notifyKeyCodeDown: code => this.p5Wrapper.notifyKeyCodeDown(code),
    notifyKeyCodeUp: code => this.p5Wrapper.notifyKeyCodeUp(code),
    softButtonIds: this.level.softButtons
  });
  this.mobileControls.update(
    defaultMobileControlsConfig,
    getStore().getState().pageConstants.isShareView
  );

  if (this.isSpritelab) {
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

  // Update p5Wrapper's scale and keep it updated with future resizes:
  this.p5Wrapper.scale = this.calculateVisualizationScale_();

  window.addEventListener(
    'resize',
    function() {
      this.p5Wrapper.scale = this.calculateVisualizationScale_();
    }.bind(this)
  );
};

/**
 * Initialization to run after ace/droplet is initialized.
 * @param {!boolean} areBreakpointsEnabled
 * @private
 */
P5Lab.prototype.afterEditorReady_ = function(areBreakpointsEnabled) {
  if (areBreakpointsEnabled) {
    this.studioApp_.enableBreakpoints();
  }
};

P5Lab.prototype.haltExecution_ = function() {
  this.reportMetrics();
  clearMarks(DRAW_LOOP_START);
  clearMeasures(DRAW_LOOP_MEASURE);
  this.spriteTotalCount = 0;

  this.eventHandlers = {};
  this.stopTickTimer();
  this.tickCount = 0;
};

P5Lab.prototype.isTickTimerRunning = function() {
  return this.tickIntervalId !== 0;
};

P5Lab.prototype.stopTickTimer = function() {
  if (this.tickIntervalId !== 0) {
    window.clearInterval(this.tickIntervalId);
    this.tickIntervalId = 0;
  }
};

P5Lab.prototype.startTickTimer = function() {
  if (this.isTickTimerRunning()) {
    console.warn('Tick timer is already running in startTickTimer()');
  }
  // Set to 1ms interval, but note that browser minimums are actually 5-16ms:
  const fastPeriod = 1;
  // Set to 100ms interval when we are in the experiment with the speed slider
  // and the slider has been slowed down (we only support two speeds for now):
  const slowPeriod = 100;
  const intervalPeriod = this.p5Wrapper.stepSpeed < 1 ? slowPeriod : fastPeriod;
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
P5Lab.prototype.resetHandler = function(ignore) {
  this.reset();
};

/**
 * Reset GameLab to its initial state.
 */
P5Lab.prototype.reset = function() {
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

  this.p5Wrapper.resetExecution();

  // Import to reset these after this.p5Wrapper has been reset
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

P5Lab.prototype.onPuzzleComplete = function(submit, testResult, message) {
  let msg = this.isSpritelab ? spritelabMsg : gamelabMsg;
  if (message && msg[message]) {
    this.message = msg[message]();
  }
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
P5Lab.prototype.onReportComplete = function(response) {
  this.response = response;
  this.waitingForReport = false;
  this.studioApp_.onReportComplete(response);
  this.displayFeedback_();
};

/**
 * Click the run button.  Start the program.
 */
P5Lab.prototype.runButtonClick = function() {
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
 */
P5Lab.prototype.execute = function() {
  Sounds.getSingleton().unmuteURLs();

  this.result = ResultType.UNSET;
  this.testResults = TestResults.NO_TESTS_RUN;
  this.waitingForReport = false;
  this.response = null;

  // Reset all state.
  this.reset();
  this.studioApp_.clearAndAttachRuntimeAnnotations();

  if (
    this.isSpritelab &&
    (this.studioApp_.hasUnwantedExtraTopBlocks() ||
      this.studioApp_.hasDuplicateVariablesInForLoops())
  ) {
    // immediately check answer, which will fail and report top level blocks
    this.onPuzzleComplete(false);
    return;
  }

  this.p5Wrapper.startExecution();
  this.p5Wrapper.setLoop(true);

  if (
    !this.JSInterpreter ||
    !this.JSInterpreter.initialized() ||
    this.executionError
  ) {
    return;
  }

  if (this.studioApp_.isUsingBlockly()) {
    // Disable toolbox while running
    Blockly.mainBlockSpaceEditor.setEnableToolbox(false);
  }

  this.startTickTimer();
};

P5Lab.prototype.initInterpreter = function(attachDebugger = true) {
  const injectGamelabGlobals = () => {
    if (experiments.isEnabled('replay')) {
      wrap(this.p5Wrapper.p5);
    }
    const propList = this.p5Wrapper.getGlobalPropertyList();
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

    if (this.isSpritelab) {
      const spritelabCommands = this.commands;
      for (const command in spritelabCommands) {
        this.JSInterpreter.createGlobalProperty(
          command,
          spritelabCommands[command].bind(this.p5Wrapper.p5),
          null
        );
      }
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
    shouldRunAtMaxSpeed: () => this.p5Wrapper.stepSpeed >= 1,
    customMarshalGlobalProperties: this.p5Wrapper.getCustomMarshalGlobalProperties(),
    customMarshalBlockedProperties: this.p5Wrapper.getCustomMarshalBlockedProperties(),
    customMarshalObjectList: this.p5Wrapper.getCustomMarshalObjectList()
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

  p5SpriteWrapper.injectJSInterpreter(this.JSInterpreter);
  p5GroupWrapper.injectJSInterpreter(this.JSInterpreter);

  this.p5Wrapper.p5specialFunctions.forEach(function(eventName) {
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

P5Lab.prototype.onTick = function() {
  this.tickCount++;

  if (this.JSInterpreter) {
    if (this.interpreterStarted) {
      this.JSInterpreter.executeInterpreter();

      if (this.p5Wrapper.stepSpeed < 1) {
        this.p5Wrapper.drawDebugSpriteColliders();
      }
    }

    this.completePreloadIfPreloadComplete();
    this.completeSetupIfSetupComplete();
    this.captureInitialImage();
    this.completeRedrawIfDrawComplete();
  }
};

/**
 * This is called while this.p5Wrapper is in startExecution(). We use the
 * opportunity to create native event handlers that call down into interpreter
 * code for each event name.
 */
P5Lab.prototype.onP5ExecutionStarting = function() {
  this.p5Wrapper.p5eventNames.forEach(function(eventName) {
    this.p5Wrapper.registerP5EventHandler(
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
 * This is called while this.p5Wrapper is in the preload phase. Do the following:
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
P5Lab.prototype.onP5Preload = function() {
  Promise.all([
    this.isSpritelab
      ? this.preloadSpriteImages_()
      : this.preloadAnimations_(this.level.pauseAnimationsByDefault),
    this.maybePreloadBackgrounds_(),
    this.runPreloadEventHandler_()
  ]).then(() => {
    this.p5Wrapper.notifyPreloadPhaseComplete();
  });
  return false;
};

P5Lab.prototype.loadValidationCodeIfNeeded_ = function() {
  if (
    this.level.validationCode &&
    !this.level.helperLibraries.some(name => name === validationLibraryName)
  ) {
    this.level.helperLibraries.unshift(validationLibraryName);
  }
};

// Preloads background images if this is Sprite Lab
P5Lab.prototype.maybePreloadBackgrounds_ = function() {
  if (!this.isSpritelab) {
    return Promise.resolve();
  }
  return this.p5Wrapper.preloadBackgrounds();
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
P5Lab.prototype.preloadAnimations_ = async function(pauseAnimationsByDefault) {
  await this.whenAnimationsAreReady();
  // Animations are ready - send them to p5 to be loaded into the engine.
  return this.p5Wrapper.preloadAnimations(
    getStore().getState().animationList,
    pauseAnimationsByDefault
  );
};

P5Lab.prototype.preloadSpriteImages_ = async function() {
  await this.whenAnimationsAreReady();
  return this.p5Wrapper.preloadSpriteImages(
    getStore().getState().animationList
  );
};
/**
 * Check whether all animations in the project animation list have been loaded
 * into memory and are ready to use.
 * @returns {boolean}
 * @private
 */
P5Lab.prototype.areAnimationsReady_ = function() {
  const animationList = getStore().getState().animationList;
  return animationList.orderedKeys.every(
    key => animationList.propsByKey[key].loadedFromSource
  );
};

/**
 * Returns a Promise that resolves once the store says animations are ready.
 * @returns {Promise}
 */
P5Lab.prototype.whenAnimationsAreReady = function() {
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
P5Lab.prototype.runPreloadEventHandler_ = function() {
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
P5Lab.prototype.completePreloadIfPreloadComplete = function() {
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
 * This is called while this.p5Wrapper is in the setup phase. We restore the
 * interpreter methods that were modified during preload, then call the user's
 * setup function.
 */
P5Lab.prototype.onP5Setup = function() {
  if (this.JSInterpreter) {
    // Re-marshal restored preload methods for the interpreter:
    const preloadMethods = _.intersection(
      this.p5Wrapper.p5._preloadMethods,
      this.p5Wrapper.getMarshallableP5Properties()
    );
    for (const method in preloadMethods) {
      this.JSInterpreter.createGlobalProperty(
        method,
        this.p5Wrapper.p5[method],
        this.p5Wrapper.p5
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

P5Lab.prototype.completeSetupIfSetupComplete = function() {
  if (!this.setupInProgress) {
    return;
  }

  if (
    !this.globalCodeRunsDuringPreload &&
    !this.JSInterpreter.startedHandlingEvents
  ) {
    // Global code should run during the setup phase, but global code hasn't
    // completed.
    this.p5Wrapper.afterSetupStarted();
    return;
  }

  if (
    !this.eventHandlers.setup ||
    this.JSInterpreter.seenReturnFromCallbackDuringExecution
  ) {
    this.p5Wrapper.afterSetupComplete();
    this.setupInProgress = false;
  }
};

P5Lab.prototype.runValidationCode = function() {
  if (this.level.validationCode) {
    try {
      const validationResult = this.JSInterpreter.interpreter.marshalInterpreterToNative(
        this.JSInterpreter.evalInCurrentScope(`
            (function () {
              validationState = null;
              validationResult = null;
              validationMessage = null;
              ${this.level.validationCode}
              return {
                state: validationState,
                result: validationResult,
                message: validationMessage
              };
            })();
          `)
      );
      if (validationResult.state === 'succeeded') {
        const testResult = validationResult.result || TestResults.ALL_PASS;
        this.onPuzzleComplete(false, testResult);
      } else if (validationResult.state === 'failed') {
        const testResult = validationResult.result;
        const failureMessage = validationResult.message;
        this.onPuzzleComplete(false, testResult, failureMessage);
      }
    } catch (e) {
      // If validation code errors, assume it was neither a success nor failure
      console.error(e);
    }
  }
};

P5Lab.prototype.measureDrawLoop = function(name, callback) {
  if (this.reportPerf) {
    mark(`${name}_start`);
    callback();
    measure(name, `${name}_start`);
    clearMarks(`${name}_start`);
    this.spriteTotalCount += this.p5Wrapper.p5.allSprites.length;
  } else {
    callback();
  }
};

/**
 * This is called while this.p5Wrapper is in a draw() call. We call the user's
 * draw function.
 */
P5Lab.prototype.onP5Draw = function() {
  if (this.JSInterpreter && this.eventHandlers.draw) {
    this.drawInProgress = true;
    if (getStore().getState().runState.isRunning) {
      this.measureDrawLoop(DRAW_LOOP_MEASURE, () => {
        this.eventHandlers.draw.apply(null);
        this.runValidationCode();
      });
    } else if (this.isSpritelab) {
      this.eventHandlers.draw.apply(null);
    }
  }
  this.completeRedrawIfDrawComplete();
};

/**
 * Capture a thumbnail image of the play space if the app has been running
 * for long enough and we have not done so already.
 */
P5Lab.prototype.captureInitialImage = function() {
  if (this.initialCaptureComplete || this.tickCount < CAPTURE_TICK_COUNT) {
    return;
  }
  this.initialCaptureComplete = true;
  captureThumbnailFromCanvas(document.getElementById('defaultCanvas0'));
};

/**
 * Log some performance numbers to firehose
 */
P5Lab.prototype.reportMetrics = function() {
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

P5Lab.prototype.completeRedrawIfDrawComplete = function() {
  if (
    this.drawInProgress &&
    this.JSInterpreter.seenReturnFromCallbackDuringExecution
  ) {
    this.p5Wrapper.afterDrawComplete();
    this.drawInProgress = false;
    $('#bubble').text('FPS: ' + this.p5Wrapper.getFrameRate().toFixed(0));
  }
};

P5Lab.prototype.handleExecutionError = function(err, lineNumber, outputString) {
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
P5Lab.prototype.executeCmd = function(id, name, opts) {
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
P5Lab.prototype.displayFeedback_ = function() {
  var level = this.level;
  let msg = this.isSpritelab ? spritelabMsg : gamelabMsg;

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
P5Lab.prototype.getSerializedAnimationList = function(callback) {
  getStore().dispatch(
    saveAnimations(() => {
      callback(getSerializedAnimationList(getStore().getState().animationList));
    })
  );
};

/**
 * Get the project properties for upload to the sources API.
 * Bound to appOptions in gamelab/main.js, used in project.js for autosave.
 */
P5Lab.prototype.getGeneratedProperties = function() {
  // Must return a new object instance each time so the project
  // system can properly compare currentSources vs newSources
  return {
    ...this.generatedProperties
  };
};

/**
 * Get the project's animation metadata, this time for use in a level
 * configuration.  The major difference with SerializedAnimationList is that
 * it includes a sourceUrl for local project animations.
 * @param {function(SerializedAnimationList)} callback
 */
P5Lab.prototype.getExportableAnimationList = function(callback) {
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

P5Lab.prototype.getAnimationDropdown = function() {
  const animationList = getStore().getState().animationList;
  return animationList.orderedKeys.map(key => {
    const name = animationList.propsByKey[key].name;
    return {
      text: utils.quote(name),
      display: utils.quote(name)
    };
  });
};

P5Lab.prototype.getAppReducers = function() {
  return reducers;
};

P5Lab.valueTypeTabShapeMap = function(blockly) {
  return {
    [blockly.BlockValueType.SPRITE]: 'angle',
    [blockly.BlockValueType.BEHAVIOR]: 'rounded',
    [blockly.BlockValueType.LOCATION]: 'square'
  };
};
