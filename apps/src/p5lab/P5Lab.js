import $ from 'jquery';
import _ from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';

import BlocklyModeErrorHandler from '@cdo/apps/BlocklyModeErrorHandler';
import JavaScriptModeErrorHandler from '@cdo/apps/JavaScriptModeErrorHandler';
import CustomMarshalingInterpreter from '@cdo/apps/lib/tools/jsinterpreter/CustomMarshalingInterpreter';
import {
  outputError,
  injectErrorHandler,
} from '@cdo/apps/lib/util/javascriptMode';
import experiments from '@cdo/apps/util/experiments';

import {TOOLBOX_EDIT_MODE} from '../constants';

import {changeInterfaceMode, viewAnimationJson} from './actions';
import {P5LabInterfaceMode, APP_WIDTH} from './constants';
import {
  SpritelabReservedWords,
  valueTypeTabShapeMap,
} from './spritelab/constants';
import {startInAnimationTab} from './stateQueries';

// eslint autocorrection was unable to automatically fix these violations of the import/order rule.
// Because moving the require statements may have unintended side effects, we disable the rule for these statements
// until we are able to investigate whether any behavior is changed by order, at which point we can apply the reordering manually.
/* eslint-disable import/order */
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
import {initStorage, DATABLOCK_STORAGE} from '../storage/storage';
import {getStore} from '@cdo/apps/redux';
import {
  allAnimationsSingleFrameSelector,
  setInitialAnimationList,
  saveAnimations,
  withAbsoluteSourceUrls,
} from './redux/animationList';
import {getSerializedAnimationList} from './shapes';
import {add as addWatcher} from '@cdo/apps/redux/watchedExpressions';
var reducers = require('./reducers');
var P5LabView = require('./P5LabView');
var Provider = require('react-redux').Provider;
import {shouldOverlaysBeVisible} from '@cdo/apps/templates/VisualizationOverlay';
import {
  getContainedLevelResultInfo,
  postContainedLevelAttempt,
  runAfterPostContainedLevel,
} from '@cdo/apps/containedLevels';
import {hasValidContainedLevelResult} from '@cdo/apps/code-studio/levels/codeStudioLevels';
import {actions as jsDebugger} from '@cdo/apps/lib/tools/jsdebugger/redux';
import {addConsoleMessage, clearConsole} from './redux/textConsole';
import {captureThumbnailFromCanvas} from '@cdo/apps/util/thumbnail';
import Sounds from '@cdo/apps/Sounds';
import {TestResults, ResultType} from '@cdo/apps/constants';
import {showHideWorkspaceCallouts} from '@cdo/apps/code-studio/callouts';
import wrap from './gamelab/debugger/replay';
import firehoseClient from '@cdo/apps/lib/util/firehose';
import {
  clearMarks,
  clearMeasures,
  getEntriesByName,
  mark,
  measure,
} from '@cdo/apps/util/performance';
import MobileControls from './gamelab/MobileControls';
import Exporter from './gamelab/Exporter';
import project from '@cdo/apps/code-studio/initApp/project';
import {hasInstructions} from '@cdo/apps/templates/instructions/utils';
import {setLocaleCode} from '@cdo/apps/redux/localesRedux';
import {SignInState} from '@cdo/apps/templates/currentUserRedux';
/* eslint-enable import/order */

const defaultMobileControlsConfig = {
  spaceButtonVisible: true,
  dpadVisible: true,
  dpadFourWay: true,
  mobileOnly: true,
};

var MAX_INTERPRETER_STEPS_PER_TICK = 500000;

// Number of ticks after which to capture a thumbnail image of the play space.
const CAPTURE_TICK_COUNT = 250;

const validationLibraryName = 'ValidationSetup';

const DRAW_LOOP_START = 'drawLoopStart';
const DRAW_LOOP_MEASURE = 'drawLoop';

/**
 * An instantiable GameLab class
 * @implements LogTarget
 */
export default class P5Lab {
  constructor(defaultAnimations = []) {
    this.defaultAnimations = defaultAnimations;

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
    this.p5Wrapper = new P5Wrapper();
    this.apiJS = apiJavascript;
    this.apiJS.injectGameLab(this);
    this.reportPerf =
      experiments.isEnabled('reportGameLabPerf') || Math.random() < 0.05;

    dropletConfig.injectGameLab(this);

    consoleApi.setLogMethod(this.log.bind(this));
    consoleApi.setClearMethod(this.clear.bind(this));

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
        mobileOnly,
      };

      this.mobileControls.update(
        mobileControlsConfig,
        getStore().getState().pageConstants.isShareView
      );
    };

    this.appendSpriteConsole = spriteMessage => {
      getStore().dispatch(addConsoleMessage(spriteMessage));
    };
  }

  /**
   * Forward a log message to both logger objects.
   * @param {?} object
   * @param {string} logLevel
   */
  log(object, logLevel) {
    this.consoleLogger_.log({output: object, fromConsoleLog: true});
    if (this.debuggerEnabled) {
      getStore().dispatch(
        jsDebugger.appendLog({output: object, fromConsoleLog: true}, logLevel)
      );
    }
  }

  /**
   * Clear both loggers.
   */
  clear() {
    this.consoleLogger_.clear();
    if (this.debuggerEnabled) {
      getStore().dispatch(jsDebugger.clearLog());
    }
  }

  /**
   * Inject the studioApp singleton.
   */
  injectStudioApp(studioApp) {
    this.studioApp_ = studioApp;
    this.studioApp_.reset = this.resetHandler.bind(this);
    this.studioApp_.runButtonClick = this.runButtonClick.bind(this);

    this.studioApp_.setCheckForEmptyBlocks(true);
  }

  /**
   * Initialize Blockly and this GameLab instance.  Called on page load.
   * @param {!AppOptionsConfig} config
   * @param {!GameLabLevel} config.level
   */
  init(config) {
    if (!this.studioApp_) {
      throw new Error('P5Lab requires a StudioApp');
    }

    this.isBlockly = this.studioApp_.isUsingBlockly();

    this.skin = config.skin;
    const avatarUrl = this.getAvatarUrl(config.level.instructionsIcon);
    this.skin.smallStaticAvatar = avatarUrl;
    this.skin.staticAvatar = avatarUrl;
    this.skin.winAvatar = avatarUrl;
    this.skin.failureAvatar = avatarUrl;

    if (this.isBlockly) {
      // SpriteLab projects don't allow users to include dpad controls
      defaultMobileControlsConfig.dpadVisible = false;

      injectErrorHandler(
        new BlocklyModeErrorHandler(() => this.JSInterpreter, null)
      );
    } else {
      injectErrorHandler(
        new JavaScriptModeErrorHandler(() => this.JSInterpreter, this)
      );
    }
    this.level = config.level;

    this.level.helperLibraries = this.level.helperLibraries || [];

    this.level.softButtons = this.level.softButtons || [];
    if (this.level.useDefaultSprites) {
      this.startAnimations = this.defaultAnimations;
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

    this.studioApp_.storage = initStorage(DATABLOCK_STORAGE, {
      channelId: config.channel,
    });

    this.p5Wrapper.init({
      gameLab: this,
      onExecutionStarting: this.onP5ExecutionStarting.bind(this),
      onPreload: this.onP5Preload.bind(this),
      onSetup: this.onP5Setup.bind(this),
      onDraw: this.onP5Draw.bind(this),
      spritelab: this.isBlockly,
    });

    config.afterClearPuzzle = function () {
      let startLibraries;
      if (config.level.startLibraries) {
        startLibraries = JSON.parse(config.level.startLibraries);
      }
      project.sourceHandler.setInitialLibrariesList(startLibraries);
      getStore().dispatch(
        setInitialAnimationList(
          this.startAnimations,
          null /* animationsForV3Migration */,
          this.isBlockly
        )
      );
      // If we reset a puzzle, it no longer has any custom uploads.
      // Therefore we can set restricted share mode to false.
      project.sourceHandler.setInRestrictedShareMode(false);
      // If we reset a puzzle, we should reset the selected poem on that project.
      project.sourceHandler.setSelectedPoem(null);
      this.studioApp_.resetButtonClick();
    }.bind(this);

    config.dropletConfig = dropletConfig;
    config.appMsg = this.getMsg();
    this.studioApp_.loadLibraryBlocks(config);

    // hide makeYourOwn on the share page
    config.makeYourOwn = false;

    config.wireframeShare = true;
    config.noHowItWorks = config.droplet;

    config.shareWarningInfo = {
      hasDataAPIs: function () {
        return this.hasDataStoreAPIs(
          this.studioApp_.getCode(true /* opt_showHidden */)
        );
      }.bind(this),
      onWarningsComplete: function () {
        if (config.share) {
          window.setTimeout(this.studioApp_.runButtonClick, 0);
        }
      }.bind(this),
    };

    // Display CSF-style instructions when using Blockly (unless there are no
    // instructions to display). Otherwise provide a way for us to have top pane
    // instructions disabled by default, but able to turn them on.
    config.noInstructionsWhenCollapsed =
      !this.isBlockly ||
      (this.isBlockly &&
        !hasInstructions(
          this.level.shortInstructions,
          this.level.longInstructions,
          config.hasContainedLevels
        ));

    var breakpointsEnabled = !config.level.debuggerDisabled;
    config.enableShowCode = true;
    config.enableShowLinesCount = false;

    const onMount = () => {
      try {
        const localeCode = window.appOptions.locale;
        getStore().dispatch(setLocaleCode(localeCode));
      } catch (exception) {
        console.warn(
          'Unable to retrieve locale code, defaulting to en_us',
          exception
        );
        getStore().dispatch(setLocaleCode('en_us'));
      }

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
      config.unusedConfig = [...this.p5Wrapper.p5specialFunctions];
      // remove 'setup' from unusedConfig so that we can show a warning for redefining it.
      if (config.unusedConfig.indexOf('setup') !== -1) {
        config.unusedConfig.splice(config.unusedConfig.indexOf('setup'), 1);
      }

      // Ignore user's code on embedded levels, so that changes made
      // to starting code by levelbuilders will be shown.
      config.ignoreLastAttempt = config.embed;

      if (this.studioApp_.isUsingBlockly()) {
        // Custom blockly config options for game lab jr
        config.valueTypeTabShapeMap = valueTypeTabShapeMap(Blockly);
      }

      this.studioApp_.init(config);

      if (startInAnimationTab(getStore().getState())) {
        getStore().dispatch(changeInterfaceMode(P5LabInterfaceMode.ANIMATION));
      }

      var finishButton = document.getElementById('finishButton');
      if (finishButton) {
        dom.addClickTouchEvent(finishButton, () =>
          this.onPuzzleComplete(false)
        );
      }

      initializeSubmitHelper({
        studioApp: this.studioApp_,
        onPuzzleComplete: this.onPuzzleComplete.bind(this),
        unsubmitUrl: this.level.unsubmitUrl,
        aiRubric: true,
      });

      this.setCrosshairCursorForPlaySpace();

      if (this.isBlockly) {
        this.currentCode = Blockly.getWorkspaceCode();
        this.studioApp_.addChangeHandler(() => {
          const newCode = Blockly.getWorkspaceCode();
          if (newCode !== this.currentCode) {
            this.currentCode = newCode;
            if (!getStore().getState().runState.isRunning) {
              this.reset();
              this.preview.apply(this);
            }
          }
        });
      }
    };

    var showFinishButton =
      !this.level.isProjectLevel && !this.level.validationCode;
    var finishButtonFirstLine = _.isEmpty(this.level.softButtons);

    var showDebugButtons =
      config.level.editCode &&
      !config.hideSource &&
      !config.level.debuggerDisabled &&
      !config.level.iframeEmbedAppAndCode;
    var showPauseButton = this.isBlockly && !config.level.hidePauseButton;
    var showDebugConsole = config.level.editCode && !config.hideSource;
    this.debuggerEnabled =
      showDebugButtons || showPauseButton || showDebugConsole;

    if (this.debuggerEnabled) {
      getStore().dispatch(
        jsDebugger.initialize({
          runApp: this.runButtonClick,
        })
      );
      if (config.level.expandDebugger) {
        getStore().dispatch(jsDebugger.open());
      }
    }

    this.studioApp_.setPageConstants(config, {
      exportApp: this.exportApp.bind(this),
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
        config.level.allAnimationsSingleFrame || this.isBlockly,
      isIframeEmbed: !!config.level.iframeEmbed,
      isProjectLevel: !!config.level.isProjectLevel,
      isSubmittable: !!config.level.submittable,
      isSubmitted: !!config.level.submitted,
      librariesEnabled: !!config.level.librariesEnabled,
      validationEnabled: !!config.level.validationEnabled,
    });

    // Push project-sourced animation metadata into store. Always use the
    // animations specified by the level definition for embed and contained
    // levels.
    const useConfig =
      config.initialAnimationList &&
      !config.embed &&
      !config.hasContainedLevels;
    let initialAnimationList = useConfig
      ? config.initialAnimationList
      : this.startAnimations;
    initialAnimationList = this.loadAnyMissingDefaultAnimations(
      initialAnimationList,
      this.defaultAnimations
    );

    getStore().dispatch(
      setInitialAnimationList(
        initialAnimationList,
        this.defaultAnimations /* animationsForV3Migration */,
        this.isBlockly
      )
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
              pauseHandler={this.onPause?.bind(this)}
              hidePauseButton={!!this.level.hidePauseButton}
              onPromptAnswer={this.onPromptAnswer?.bind(this)}
              labType={this.getLabType()}
            />
          </Provider>,
          document.getElementById(config.containerId)
        )
      );

    if (IN_UNIT_TEST) {
      return loader.catch(() => {});
    }
    return loader;
  }

  /**
   * Load any necessary missing animations. For now, this is mainly for
   * the "set background to" block, which needs to have backgrounds in the
   * animation list at the start in order to look not broken.
   * @param {Object} initialAnimationList
   * @param {Object} defaultAnimations
   */
  loadAnyMissingDefaultAnimations(
    initialAnimationList,
    defaultAnimations = {orderedKeys: [], propsByKey: {}}
  ) {
    if (!this.isBlockly) {
      return initialAnimationList;
    }
    let configDictionary = {};
    initialAnimationList.orderedKeys.forEach(key => {
      const name = initialAnimationList.propsByKey[key].name;
      configDictionary[name] = key;
    });
    // Check if initialAnimationList has backgrounds. If the list doesn't have backgrounds, add some from defaultAnimations.
    // This is primarily to handle pre existing levels that don't have animations in their list yet
    const categoryCheck = initialAnimationList.orderedKeys.filter(key => {
      const {categories} = initialAnimationList.propsByKey[key];
      return categories && categories.includes('backgrounds');
    });
    const nameCheck = defaultAnimations.orderedKeys.filter(key => {
      return (
        defaultAnimations.propsByKey[key].categories.includes('backgrounds') &&
        configDictionary[defaultAnimations.propsByKey[key].name]
      );
    });
    const hasBackgrounds = categoryCheck.length > 0 || nameCheck.length > 0;
    if (!hasBackgrounds) {
      defaultAnimations.orderedKeys.forEach(key => {
        if (
          defaultAnimations.propsByKey[key].categories.includes('backgrounds')
        ) {
          initialAnimationList.orderedKeys.push(key);
          initialAnimationList.propsByKey[key] =
            defaultAnimations.propsByKey[key];
        }
      });
    }
    return initialAnimationList;
  }

  /**
   * Export the project for web.
   */
  async exportApp() {
    await this.whenAnimationsAreReady();
    return this.exportAppWithAnimations(
      project.getCurrentName() || 'my-app',
      getStore().getState().animationList
    );
  }

  /**
   * Export the project for web.
   * @param {string} appName
   * @param {Object} animationList - object of {AnimationKey} to {AnimationProps}
   */
  exportAppWithAnimations(appName, animationList) {
    const {pauseAnimationsByDefault} = this.level;
    const allAnimationsSingleFrame = allAnimationsSingleFrameSelector(
      getStore().getState()
    );
    return Exporter.exportApp(appName, this.studioApp_.editor.getValue(), {
      animationList,
      allAnimationsSingleFrame,
      pauseAnimationsByDefault,
    });
  }

  /**
   * Subscribe to state changes on the store.
   * @param {!Store} store
   */
  setupReduxSubscribers(store) {
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
  }

  /**
   * Override to change pause behavior.
   */
  onPause() {}

  reactToExecutionError(msg) {}

  onIsRunningChange() {
    this.setCrosshairCursorForPlaySpace();
  }

  onIsDebuggingSpritesChange(isDebuggingSprites) {
    this.p5Wrapper.debugSprites(isDebuggingSprites);
  }

  onStepSpeedChange(stepSpeed) {
    this.p5Wrapper.changeStepSpeed(stepSpeed);

    if (this.isTickTimerRunning()) {
      this.stopTickTimer();
      this.startTickTimer();
    }
  }

  /**
   * Hopefully a temporary measure - we do this ourselves for now because this is
   * a 'protected' div that React doesn't update, but eventually would rather do
   * this with React.
   */
  setCrosshairCursorForPlaySpace() {
    var showOverlays = shouldOverlaysBeVisible(getStore().getState());
    $('#divGameLab').toggleClass('withCrosshair', showOverlays);
  }

  loadAudio_() {
    this.studioApp_.loadAudio(this.skin.winSound, 'win');
    this.studioApp_.loadAudio(this.skin.startSound, 'start');
    this.studioApp_.loadAudio(this.skin.failureSound, 'failure');
  }

  calculateVisualizationScale_() {
    var divGameLab = document.getElementById('divGameLab');
    // Calculate current visualization scale:
    return divGameLab.getBoundingClientRect().width / divGameLab.offsetWidth;
  }

  /**
   * @param {string} code The code to search for Data Storage APIs
   * @return {boolean} True if the code uses any data storage APIs
   */
  hasDataStoreAPIs(code) {
    return (
      /createRecord/.test(code) ||
      /updateRecord/.test(code) ||
      /setKeyValue/.test(code)
    );
  }

  /**
   * Code called after the blockly div + blockly core is injected into the document
   */
  afterInject_(config) {
    this.mobileControls = new MobileControls();
    this.mobileControls.init({
      notifyKeyCodeDown: code => this.p5Wrapper.notifyKeyCodeDown(code),
      notifyKeyCodeUp: code => this.p5Wrapper.notifyKeyCodeUp(code),
      softButtonIds: this.level.softButtons,
    });
    this.mobileControls.update(
      defaultMobileControlsConfig,
      getStore().getState().pageConstants.isShareView
    );

    if (this.isBlockly) {
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
          'levelFailure',
        ].join(',')
      );
      Blockly.JavaScript.addReservedWords(SpritelabReservedWords.join(','));

      // Don't add infinite loop protection
      Blockly.clearInfiniteLoopTrap();
    }

    if (this.level.blocklyVariables) {
      Blockly.mainBlockSpace.registerGlobalVariables(
        this.level.blocklyVariables.split(',').map(varName => varName.trim())
      );
    }

    // Update p5Wrapper's scale and keep it updated with future resizes:
    this.p5Wrapper.scale = this.calculateVisualizationScale_();

    window.addEventListener(
      'resize',
      function () {
        this.p5Wrapper.scale = this.calculateVisualizationScale_();
      }.bind(this)
    );
  }

  /**
   * Initialization to run after ace/droplet is initialized.
   * @param {!boolean} areBreakpointsEnabled
   * @private
   */
  afterEditorReady_(areBreakpointsEnabled) {
    if (areBreakpointsEnabled) {
      this.studioApp_.enableBreakpoints();
    }
  }

  haltExecution_() {
    this.reportMetrics();
    clearMarks(DRAW_LOOP_START);
    clearMeasures(DRAW_LOOP_MEASURE);
    this.spriteTotalCount = 0;

    this.eventHandlers = {};
    this.stopTickTimer();
    this.tickCount = 0;
  }

  isTickTimerRunning() {
    return this.tickIntervalId !== 0;
  }

  stopTickTimer() {
    if (this.tickIntervalId !== 0) {
      window.clearInterval(this.tickIntervalId);
      this.tickIntervalId = 0;
    }
  }

  startTickTimer() {
    if (this.isTickTimerRunning()) {
      console.warn('Tick timer is already running in startTickTimer()');
    }
    // Set to 1ms interval, but note that browser minimums are actually 5-16ms:
    const fastPeriod = 1;
    // Set to 100ms interval when we are in the experiment with the speed slider
    // and the slider has been slowed down (we only support two speeds for now):
    const slowPeriod = 100;
    const intervalPeriod =
      this.p5Wrapper.stepSpeed < 1 ? slowPeriod : fastPeriod;
    this.tickIntervalId = window.setInterval(
      this.onTick.bind(this),
      intervalPeriod
    );
  }

  /**
   * Reset GameLab to its initial state and optionally run setup code
   * @param {boolean} ignore Required by the API but ignored by this
   *     implementation.
   */
  resetHandler(ignore) {
    this.reset();
  }

  /**
   * Reset GameLab to its initial state.
   */
  reset() {
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
  }

  onPuzzleComplete(submit, testResult, message) {
    let msg = this.getMsg();
    if (message && msg[message]) {
      this.message = msg[message]();
    }
    const sourcesUnchanged = !this.studioApp_.validateCodeChanged();
    if (this.executionError) {
      this.result = ResultType.ERROR;
    } else if (sourcesUnchanged) {
      this.result = ResultType.FAILURE;
    } else {
      // In most cases, submit all results as success
      this.result = ResultType.SUCCESS;
    }

    // If we know they succeeded, mark levelComplete true
    const levelComplete = this.result === ResultType.SUCCESS;

    if (this.executionError) {
      this.testResults = this.studioApp_.getTestResults(levelComplete, {
        executionError: this.executionError,
      });
    } else if (testResult) {
      this.testResults = testResult;
    } else if (sourcesUnchanged) {
      this.testResults = TestResults.FREE_PLAY_UNCHANGED_FAIL;
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
      let textBlocks;
      if (Blockly.version === 'Google') {
        textBlocks = Blockly.cdoUtils.getCode(Blockly.mainBlockSpace);
      } else {
        // We're using CDO Blockly, report the program as xml
        var xml = Blockly.Xml.blockSpaceToDom(Blockly.mainBlockSpace);

        // When SharedFunctions (aka shared behavior_definitions) are enabled, they
        // are always appended to startBlocks on page load.
        // See StudioApp -> setStartBlocks_
        // Because of this, we need to remove the SharedFunctions when we are in
        // toolbox edit mode. Otherwise, they end up in a student's toolbox.
        if (this.level.edit_blocks === TOOLBOX_EDIT_MODE) {
          var allBlocks = Array.from(xml.querySelectorAll('xml > block'));
          var toRemove = allBlocks.filter(element => {
            return (
              element.getAttribute('type') === 'behavior_definition' &&
              element.getAttribute('usercreated') !== 'true'
            );
          });
          toRemove.forEach(element => {
            xml.removeChild(element);
          });
        }
        textBlocks = Blockly.Xml.domToText(xml);
      }
      program = encodeURIComponent(textBlocks);
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
          onComplete,
        });
      }
    };

    sendReport();
  }

  /**
   * Function to be called when the service report call is complete
   * @param {MilestoneResponse} response - JSON response (if available)
   */
  onReportComplete(response) {
    this.response = response;
    this.waitingForReport = false;
    this.studioApp_.onReportComplete(response);
    this.displayFeedback_();
  }

  /**
   * Click the run button.  Start the program.
   */
  runButtonClick() {
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
  }

  /**
   * Execute the user's code.  Heaven help us...
   */
  execute() {
    Sounds.getSingleton().unmuteURLs();

    this.result = ResultType.UNSET;
    this.testResults = TestResults.NO_TESTS_RUN;
    this.waitingForReport = false;
    this.response = null;

    // Reset all state.
    this.reset();
    this.studioApp_.clearAndAttachRuntimeAnnotations();

    if (
      this.isBlockly &&
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

    this.startTickTimer();
  }

  initInterpreter(attachDebugger = true) {
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

      if (this.isBlockly) {
        this.library = this.createLibrary({p5: this.p5Wrapper.p5});

        const libraryCommands = this.library.commands;
        for (const command in libraryCommands) {
          this.JSInterpreter.createGlobalProperty(
            command,
            libraryCommands[command].bind(this.library),
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
      customMarshalGlobalProperties:
        this.p5Wrapper.getCustomMarshalGlobalProperties(),
      customMarshalBlockedProperties:
        this.p5Wrapper.getCustomMarshalBlockedProperties(),
      customMarshalObjectList: this.p5Wrapper.getCustomMarshalObjectList(),
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
    code += this.studioApp_.getCode(true /* opt_showHidden */);
    this.JSInterpreter.parse({
      code,
      projectLibraries: this.level.projectLibraries,
      blocks: dropletConfig.blocks,
      blockFilter:
        this.level.executePaletteApisOnly && this.level.codeFunctions,
      enableEvents: true,
      initGlobals: injectGamelabGlobals,
      userCodeStartOffset,
    });
    if (!this.JSInterpreter.initialized()) {
      return;
    }

    p5SpriteWrapper.injectJSInterpreter(this.JSInterpreter);
    p5GroupWrapper.injectJSInterpreter(this.JSInterpreter);

    this.p5Wrapper.p5specialFunctions.forEach(function (eventName) {
      var func = this.JSInterpreter.findGlobalFunction(eventName);
      if (func) {
        this.eventHandlers[eventName] =
          CustomMarshalingInterpreter.createNativeFunctionFromInterpreterFunction(
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
  }

  onTick() {
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
  }

  /**
   * This is called while this.p5Wrapper is in startExecution(). We use the
   * opportunity to create native event handlers that call down into interpreter
   * code for each event name.
   */
  onP5ExecutionStarting() {
    this.p5Wrapper.p5eventNames.forEach(function (eventName) {
      this.p5Wrapper.registerP5EventHandler(
        eventName,
        function () {
          if (this.JSInterpreter && this.eventHandlers[eventName]) {
            this.eventHandlers[eventName].apply(null);
          }
        }.bind(this)
      );
    }, this);
  }

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
  onP5Preload() {
    this.preloadLabAssets()
      .then(this.runPreloadEventHandler_())
      .then(() => this.p5Wrapper.notifyPreloadPhaseComplete());
    return false;
  }

  loadValidationCodeIfNeeded_() {
    if (
      this.level.validationCode &&
      !this.level.helperLibraries.some(name => name === validationLibraryName)
    ) {
      this.level.helperLibraries.unshift(validationLibraryName);
    }
  }

  /**
   * Check whether all animations in the project animation list have been loaded
   * into memory and are ready to use.
   * @returns {boolean}
   * @private
   */
  areAnimationsReady_() {
    const animationList = getStore().getState().animationList;
    return animationList.orderedKeys.every(
      key => animationList.propsByKey[key].loadedFromSource
    );
  }

  /**
   * Returns a Promise that resolves once the store says animations are ready.
   * @returns {Promise}
   */
  whenAnimationsAreReady() {
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
  }

  /**
   * Run the preload event handler, and optionally global code, and report when
   * it is done by resolving a returned Promise.
   * @returns {Promise} Which will resolve immediately if there is no code to run,
   *          otherwise will resolve when the preload handler has completed.
   * @private
   */
  runPreloadEventHandler_() {
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
  }

  /**
   * Called on tick to check whether preload code is done running, and trigger
   * the appropriate report of completion if it is.
   */
  completePreloadIfPreloadComplete() {
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
  }

  /**
   * This is called while this.p5Wrapper is in the setup phase. We restore the
   * interpreter methods that were modified during preload, then call the user's
   * setup function.
   */
  onP5Setup() {
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
  }

  completeSetupIfSetupComplete() {
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
  }

  runValidationCode() {
    if (this.level.validationCode) {
      try {
        const validationResult =
          this.JSInterpreter.interpreter.marshalInterpreterToNative(
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
  }

  measureDrawLoop(name, callback) {
    if (this.reportPerf) {
      mark(`${name}_start`);
      callback();
      measure(name, `${name}_start`);
      clearMarks(`${name}_start`);
      this.spriteTotalCount += this.p5Wrapper.p5.allSprites.length;
    } else {
      callback();
    }
  }

  /**
   * This is called while this.p5Wrapper is in a draw() call. We call the user's
   * draw function.
   */
  onP5Draw() {
    if (this.JSInterpreter && this.eventHandlers.draw) {
      this.drawInProgress = true;
      if (getStore().getState().runState.isRunning) {
        this.measureDrawLoop(DRAW_LOOP_MEASURE, () => {
          this.eventHandlers.draw.apply(null);
          this.runValidationCode();
        });
      } else if (this.isBlockly) {
        this.eventHandlers.draw.apply(null);
      }
    }

    if (this.JSInterpreter?.executionError) {
      this.reactToExecutionError(this.JSInterpreter.executionError.message);
    }

    this.completeRedrawIfDrawComplete();
  }

  /**
   * Capture a thumbnail image of the play space if the app has been running
   * for long enough and we have not done so already.
   */
  captureInitialImage() {
    if (this.initialCaptureComplete || this.tickCount < CAPTURE_TICK_COUNT) {
      return;
    }
    this.initialCaptureComplete = true;
    captureThumbnailFromCanvas(document.getElementById('defaultCanvas0'));
  }

  /**
   * Log some performance numbers to firehose
   */
  reportMetrics() {
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
        spriteAverageCount: this.spriteTotalCount / drawLoopTimes.length,
      }),
    });
  }

  completeRedrawIfDrawComplete() {
    if (
      this.drawInProgress &&
      this.JSInterpreter.seenReturnFromCallbackDuringExecution
    ) {
      this.p5Wrapper.afterDrawComplete();
      this.drawInProgress = false;
      $('#bubble').text('FPS: ' + this.p5Wrapper.getFrameRate().toFixed(0));
    }
  }

  handleExecutionError(err, lineNumber, outputString) {
    outputError(outputString, lineNumber);
    if (err.native) {
      console.error(err.stack);
    }
    this.executionError = {err: err, lineNumber: lineNumber};
    this.haltExecution_();
  }

  /**
   * Executes an API command.
   */
  executeCmd(id, name, opts) {
    var retVal = false;
    if (gamelabCommands[name] instanceof Function) {
      retVal = gamelabCommands[name](opts);
    }
    return retVal;
  }

  /**
   * Override to change whether the current app wants to show the
   * save & publish buttons in the "finish" feedback dialog, shown
   * by calling this.studioApp_.displayFeedback() in
   * displayFeedback_(), below.
   */
  saveToProjectGallery() {
    return false;
  }

  /**
   * Get the feedback message for the feedback dialog.
   * Subclasses can override this behavior.
   * @param {boolean} _isFinalFreePlayLevel Unused by this implementation
   * @returns {string}
   */
  getReinfFeedbackMsg(_isFinalFreePlayLevel) {
    return this.getMsg().reinfFeedbackMsg();
  }

  /**
   * App specific displayFeedback function that calls into
   * this.studioApp_.displayFeedback when appropriate
   */
  displayFeedback_() {
    var level = this.level;
    let msg = this.getMsg();

    // Allow P5Labs to decide what string should be rendered in the feedback dialog.
    const isFinalFreePlayLevel = level.freePlay && level.isLastLevelInLesson;
    const reinfFeedbackMsg = this.getReinfFeedbackMsg(isFinalFreePlayLevel);

    const isSignedIn =
      getStore().getState().currentUser.signInState === SignInState.SignedIn;

    // Find out whether the current app (e.g. SpriteLab, GameLab, or Poetry) wants
    // to show the save & publish buttons in this dialog.
    const saveToProjectGallery = this.saveToProjectGallery();

    this.studioApp_.displayFeedback({
      feedbackType: this.testResults,
      message: this.message,
      response: this.response,
      level: level,
      // feedbackImage: feedbackImageCanvas.canvas.toDataURL("image/png")
      showingSharing: !level.disableSharing && level.freePlay,
      appStrings: {
        reinfFeedbackMsg,
        sharingText: msg.shareGame(),
      },
      hideXButton: true,
      saveToProjectGallery: saveToProjectGallery,
      disableSaveToGallery: !isSignedIn,
    });
  }

  /**
   * Get the project's animation metadata for upload to the sources API.
   * Bound to appOptions in gamelab/main.js, used in project.js for autosave.
   * @param {function(SerializedAnimationList)} callback
   */
  getSerializedAnimationList(callback) {
    getStore().dispatch(
      saveAnimations(() => {
        callback(
          getSerializedAnimationList(getStore().getState().animationList)
        );
      })
    );
  }

  /**
   * Get the project's animation metadata, this time for use in a level
   * configuration.  The major difference with SerializedAnimationList is that
   * it includes a sourceUrl for local project animations.
   * @param {function(SerializedAnimationList)} callback
   */
  getExportableAnimationList(callback) {
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
  }

  getAnimationDropdown() {
    const animationList = getStore().getState().animationList;
    return animationList.orderedKeys.map(key => {
      const name = animationList.propsByKey[key].name;
      return {
        text: utils.quote(name),
        display: utils.quote(name),
      };
    });
  }

  getAppReducers() {
    return reducers;
  }
}
