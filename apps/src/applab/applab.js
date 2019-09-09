/**
 * CodeOrgApp: Applab
 *
 * Copyright 2014-2015 Code.org
 *
 */
import $ from 'jquery';
import cookies from 'js-cookie';
import _ from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';
import {singleton as studioApp} from '../StudioApp';
import commonMsg from '@cdo/locale';
import applabMsg from '@cdo/applab/locale';
import AppLabView from './AppLabView';
import {initializeSubmitHelper, onSubmitComplete} from '../submitHelper';
import dom from '../dom';
import * as utils from '../utils';
import * as dropletConfig from './dropletConfig';
import {initFirebaseStorage} from '../storage/firebaseStorage';
import {
  getColumnsRef,
  onColumnNames,
  addMissingColumns
} from '../storage/firebaseMetadata';
import {getProjectDatabase, getSharedDatabase} from '../storage/firebaseUtils';
import * as apiTimeoutList from '../lib/util/timeoutList';
import designMode from './designMode';
import applabTurtle from './applabTurtle';
import applabCommands from './commands';
import JSInterpreter from '../lib/tools/jsinterpreter/JSInterpreter';
import JsInterpreterLogger from '../JsInterpreterLogger';
import * as elementUtils from './designElements/elementUtils';
import {shouldOverlaysBeVisible} from '../templates/VisualizationOverlay';
import logToCloud from '../logToCloud';
import DialogButtons from '../templates/DialogButtons';
import executionLog from '../executionLog';
import annotationList from '../acemode/annotationList';
import Exporter from './Exporter';
import {Provider} from 'react-redux';
import {getStore} from '../redux';
import {actions, reducers} from './redux/applab';
import {add as addWatcher} from '../redux/watchedExpressions';
import {changeScreen} from './redux/screens';
import * as applabConstants from './constants';
const {ApplabInterfaceMode} = applabConstants;
import {DataView} from '../storage/constants';
import consoleApi from '../consoleApi';
import {
  tableType,
  addTableName,
  deleteTableName,
  updateTableColumns,
  updateTableRecords,
  updateKeyValueData
} from '../storage/redux/data';
import {setStepSpeed} from '../redux/runState';
import {
  getContainedLevelResultInfo,
  postContainedLevelAttempt,
  runAfterPostContainedLevel
} from '../containedLevels';
import SmallFooter from '@cdo/apps/code-studio/components/SmallFooter';
import {outputError, injectErrorHandler} from '../lib/util/javascriptMode';
import {actions as jsDebugger} from '../lib/tools/jsdebugger/redux';
import JavaScriptModeErrorHandler from '../JavaScriptModeErrorHandler';
import * as makerToolkit from '../lib/kits/maker/toolkit';
import * as makerToolkitRedux from '../lib/kits/maker/redux';
import project from '../code-studio/initApp/project';
import * as thumbnailUtils from '../util/thumbnail';
import Sounds from '../Sounds';
import {makeDisabledConfig} from '../dropletUtils';
import {getRandomDonorTwitter} from '../util/twitterHelper';
import {showHideWorkspaceCallouts} from '../code-studio/callouts';
import experiments from '../util/experiments';
import header from '../code-studio/header';
import {TestResults, ResultType} from '../constants';
import i18n from '../code-studio/i18n';
import {
  expoGenerateApk,
  expoCheckApkBuild,
  expoCancelApkBuild
} from '../util/exporter';
import {setExportGeneratedProperties} from '../code-studio/components/exportDialogRedux';

/**
 * Create a namespace for the application.
 * @implements LogTarget
 */
const Applab = {};
export default Applab;

/**
 * @type {JsInterpreterLogger} observes the interpreter and logs to console
 */
var jsInterpreterLogger = null;

/**
 * Temporary: Some code depends on global access to logging, but only Applab
 * knows about the debugger UI where logging should occur.
 * Eventually, I'd like to replace this with window events that the debugger
 * UI listens to, so that the Applab global is not involved.
 * @param {*} object
 * @param {string} logLevel
 */
Applab.log = function(object, logLevel) {
  if (jsInterpreterLogger) {
    jsInterpreterLogger.log({output: object, fromConsoleLog: true});
  }

  getStore().dispatch(
    jsDebugger.appendLog({output: object, fromConsoleLog: true}, logLevel)
  );
};
consoleApi.setLogMethod(Applab.log);

var level;
var skin;
var copyrightStrings;

//TODO: Make configurable.
studioApp().setCheckForEmptyBlocks(true);

var MAX_INTERPRETER_STEPS_PER_TICK = 10000;

// Default Scalings
Applab.scale = {
  snapRadius: 1,
  stepSpeed: 0
};

var twitterOptions = {
  text: applabMsg.shareApplabTwitterDonor({donor: getRandomDonorTwitter()}),
  hashtag: 'ApplabCode'
};

function stepDelayFromStepSpeed(stepSpeed) {
  // 1.5 sec per socket in turtle mode
  return 1500 * Math.pow(1 - stepSpeed, 2);
}

function loadLevel() {
  Applab.timeoutFailureTick = level.timeoutFailureTick || Infinity;
  Applab.minWorkspaceHeight = level.minWorkspaceHeight;
  Applab.softButtons_ = level.softButtons || {};

  // Historically, appWidth and appHeight were customizable on a per level basis.
  // This led to lots of hackery in the code to properly scale the visualization
  // area. Width/height are now constant, but much of the hackery still remains
  // since I don't understand it well enough.
  Applab.appWidth = level.widgetMode
    ? applabConstants.WIDGET_WIDTH
    : applabConstants.APP_WIDTH;

  Applab.appHeight = applabConstants.APP_HEIGHT;

  // In share mode we need to reserve some number of pixels for our in-app
  // footer. We do that by making the play space slightly smaller elsewhere.
  // Applab.appHeight represents the height of the entire app (footer + other)
  // Applab.footerlessAppHeight represents the height of only the "other"
  Applab.footerlessAppHeight =
    applabConstants.APP_HEIGHT - applabConstants.FOOTER_HEIGHT;

  // Override scalars.
  for (var key in level.scale) {
    Applab.scale[key] = level.scale[key];
  }
}

var drawDiv = function() {
  ['divApplab', 'visualizationOverlay', 'designModeViz'].forEach(function(
    divId
  ) {
    var div = document.getElementById(divId);
    div.style.width = Applab.appWidth + 'px';
    div.style.height = Applab.footerlessAppHeight + 'px';
  });

  if (shouldRenderFooter()) {
    renderFooterInSharedGame();
  }
};

function shouldRenderFooter() {
  return studioApp().share;
}

Applab.makeFooterMenuItems = function(isIframeEmbed) {
  const footerMenuItems = [
    window.location.search.indexOf('nosource') < 0 && {
      key: 'how-it-works',
      text: i18n.t('footer.how_it_works'),
      link: project.getProjectUrl('/view'),
      newWindow: true
    },
    isIframeEmbed &&
      !dom.isMobile() && {
        text: applabMsg.makeMyOwnApp(),
        link: '/projects/applab/new'
      },
    {
      key: 'report-abuse',
      text: commonMsg.reportAbuse(),
      link: '/report_abuse',
      newWindow: true
    },
    {
      text: commonMsg.copyright(),
      link: '#',
      copyright: true
    },
    {
      text: commonMsg.privacyPolicy(),
      link: 'https://code.org/privacy',
      newWindow: true
    }
  ].filter(item => item);

  var userAlreadyReportedAbuse =
    cookies.get('reported_abuse') &&
    _.includes(
      JSON.parse(cookies.get('reported_abuse')),
      project.getCurrentId()
    );

  if (userAlreadyReportedAbuse) {
    _.remove(footerMenuItems, function(menuItem) {
      return menuItem.key === 'report-abuse';
    });
  }

  return footerMenuItems;
};

function renderFooterInSharedGame() {
  const divApplab = document.getElementById('divApplab');
  const footerDiv = document.createElement('div');
  footerDiv.setAttribute('id', 'footerDiv');
  divApplab.parentNode.insertBefore(footerDiv, divApplab.nextSibling);

  const isIframeEmbed = getStore().getState().pageConstants.isIframeEmbed;

  const menuItems = Applab.makeFooterMenuItems(isIframeEmbed);

  ReactDOM.render(
    <SmallFooter
      i18nDropdown={''}
      privacyPolicyInBase={false}
      copyrightInBase={false}
      copyrightStrings={copyrightStrings}
      baseMoreMenuString={commonMsg.builtOnCodeStudio()}
      rowHeight={applabConstants.FOOTER_HEIGHT}
      style={{fontSize: 18}}
      baseStyle={{
        width: $('#divApplab').width(),
        paddingLeft: 0
      }}
      className="dark"
      menuItems={menuItems}
      phoneFooter={true}
    />,
    footerDiv
  );
}

/**
 * @param {string} code The code to search for Data Storage APIs
 * @return {boolean} True if the code uses any data storage APIs
 */
Applab.hasDataStoreAPIs = function(code) {
  return (
    /createRecord/.test(code) ||
    /updateRecord/.test(code) ||
    /setKeyValue/.test(code)
  );
};

/**
 * Set the current interpreter step speed as a value from 0 (stopped)
 * to 1 (full speed).
 * @param {!number} speed - range 0..1
 */
Applab.setStepSpeed = function(speed) {
  getStore().dispatch(setStepSpeed(speed));
  Applab.scale.stepSpeed = stepDelayFromStepSpeed(speed);
};

function getCurrentTickLength() {
  var debugStepDelay = stepDelayFromStepSpeed(
    getStore().getState().runState.stepSpeed
  );
  return debugStepDelay !== undefined ? debugStepDelay : Applab.scale.stepSpeed;
}

function queueOnTick() {
  window.setTimeout(Applab.onTick, getCurrentTickLength());
}

function handleExecutionError(err, lineNumber, outputString) {
  outputError(outputString, lineNumber);
  Applab.executionError = {err: err, lineNumber: lineNumber};

  // prevent further execution
  Applab.clearEventHandlersKillTickLoop();

  // Used by level tests
  if (Applab.onExecutionError) {
    Applab.onExecutionError();
  }
}

Applab.getCode = function() {
  return studioApp().getCode();
};

Applab.getHtml = function() {
  // This method is called on autosave. If we're about to autosave, let's update
  // levelHtml to include our current state.
  if ($('#designModeViz').is(':visible')) {
    designMode.serializeToLevelHtml();
  }
  return Applab.levelHtml;
};

/**
 * Sets Applab.levelHtml as well as #designModeViz contents.
 * designModeViz is the source of truth for the app's HTML.
 * levelHtml can be lazily updated from designModeViz via serializeToLevelHtml.
 * @param html
 */
Applab.setLevelHtml = function(html) {
  if (html === '') {
    Applab.levelHtml = '';
  } else {
    Applab.levelHtml = designMode.addScreenIfNecessary(html);
  }
  var designModeViz = document.getElementById('designModeViz');
  designMode.parseFromLevelHtml(
    designModeViz,
    true,
    applabConstants.DESIGN_ELEMENT_ID_PREFIX
  );

  // Make sure at least one screen exists, and that the first
  // screen is visible.
  designMode.loadDefaultScreen();
  designMode.serializeToLevelHtml();
};

Applab.onTick = function() {
  if (!Applab.running) {
    return;
  }

  Applab.tickCount++;
  queueOnTick();

  if (Applab.tickCount === applabConstants.CAPTURE_TICK_COUNT) {
    const visualization = document.getElementById('visualization');
    thumbnailUtils.captureThumbnailFromElement(visualization);
  }
  if (Applab.JSInterpreter) {
    Applab.JSInterpreter.executeInterpreter(Applab.tickCount === 1);
  }

  if (checkFinished()) {
    Applab.onPuzzleFinish();
  }
};

/**
 * Initialize Blockly and Applab for read-only (blocks feedback).
 * Called on iframe load for read-only.
 */
Applab.initReadonly = function(config) {
  // Do some minimal level loading so that
  // we can ensure that the blocks are appropriately modified for this level
  skin = config.skin;
  level = config.level;
  copyrightStrings = config.copyrightStrings;
  config.appMsg = applabMsg;
  loadLevel();

  // Applab.initMinimal();

  studioApp().initReadonly(config);
};

/**
 * Initialize Blockly and the Applab app.  Called on page load.
 */
Applab.init = function(config) {
  // Gross, but necessary for tests, until we can instantiate AppLab and make
  // this a member variable: Reset this thing until we're ready to create it!
  jsInterpreterLogger = null;

  // Necessary for tests.
  thumbnailUtils.init();

  Applab.generatedProperties = {
    ...config.initialGeneratedProperties
  };
  getStore().dispatch(
    setExportGeneratedProperties(Applab.generatedProperties.export)
  );
  config.getGeneratedProperties = getGeneratedProperties;

  // Set information about the current Applab level being displayed.
  getStore().dispatch(
    actions.setLevelData({
      name: config.level.name,
      isStartMode: config.isStartMode
    })
  );

  // replace studioApp methods with our own
  studioApp().reset = this.reset.bind(this);
  studioApp().runButtonClick = this.runButtonClick.bind(this);

  config.runButtonClickWrapper = runButtonClickWrapper;

  if (!config.level.editCode) {
    throw 'App Lab requires Droplet';
  }

  if (config.level.editBlocks) {
    header.showLevelBuilderSaveButton(() => ({
      start_blocks: Applab.getCode(),
      start_html: Applab.getHtml()
    }));
  }
  Applab.channelId = config.channel;
  Applab.storage = initFirebaseStorage({
    channelId: config.channel,
    firebaseName: config.firebaseName,
    firebaseAuthToken: config.firebaseAuthToken,
    firebaseChannelIdSuffix: config.firebaseChannelIdSuffix || '',
    showRateLimitAlert: studioApp().showRateLimitAlert
  });
  // inlcude channel id in any new relic actions we generate
  logToCloud.setCustomAttribute('channelId', Applab.channelId);

  config.usesAssets = true;

  Applab.clearEventHandlersKillTickLoop();
  skin = config.skin;
  skin.smallStaticAvatar = null;
  skin.staticAvatar = null;
  skin.winAvatar = null;
  skin.failureAvatar = null;
  level = config.level;
  copyrightStrings = config.copyrightStrings;
  Applab.user = {
    labUserId: config.labUserId,
    isSignedIn: config.isSignedIn
  };
  Applab.isReadOnlyView = config.readonlyWorkspace;

  Applab.onExecutionError = config.onExecutionError;

  loadLevel();

  if (studioApp().hideSource) {
    // always run at max speed if source is hidden
    config.level.sliderSpeed = 1.0;
  }

  var showDebugButtons = !config.hideSource && !config.level.debuggerDisabled;
  var breakpointsEnabled = !config.level.debuggerDisabled;
  var showDebugConsole = !config.hideSource;

  // Construct a logging observer for interpreter events
  if (!config.hideSource) {
    jsInterpreterLogger = new JsInterpreterLogger(window.console);
  }

  if (showDebugButtons || showDebugConsole) {
    getStore().dispatch(
      jsDebugger.initialize({
        runApp: Applab.runButtonClick
      })
    );
    if (config.level.expandDebugger) {
      getStore().dispatch(jsDebugger.open());
    }
  }

  //Mobile share pages do not show the logo
  if (dom.isMobile() && config.share) {
    $('#main-logo').hide();
  }

  // Set up an error handler for student errors and warnings.
  injectErrorHandler(
    new JavaScriptModeErrorHandler(() => Applab.JSInterpreter, Applab)
  );

  config.loadAudio = function() {
    studioApp().loadAudio(skin.failureSound, 'failure');
  };

  config.shareWarningInfo = {
    hasDataAPIs: function() {
      return Applab.hasDataStoreAPIs(Applab.getCode());
    },
    onWarningsComplete: function() {
      if (config.share) {
        // If this is a share page, autostart the app after warnings closed.
        window.setTimeout(Applab.runButtonClick.bind(studioApp()), 0);
      }
    }
  };

  config.afterInject = function() {
    if (studioApp().isUsingBlockly()) {
      /**
       * The richness of block colours, regardless of the hue.
       * MOOC blocks should be brighter (target audience is younger).
       * Must be in the range of 0 (inclusive) to 1 (exclusive).
       * Blockly's default is 0.45.
       */
      Blockly.HSV_SATURATION = 0.6;

      Blockly.SNAP_RADIUS *= Applab.scale.snapRadius;
    }
    drawDiv();

    // Ignore the user's levelHtml for levels without design mode. levelHtml
    // should never be present on such levels, however some levels do
    // have levelHtml stored due to a previous bug. HTML set by levelbuilder
    // is stored in startHtml, not levelHtml. Also ignore levelHtml for embedded
    // or contained levels so that updates made to startHtml by levelbuilders
    // are shown.
    if (
      !getStore().getState().pageConstants.hasDesignMode ||
      getStore().getState().pageConstants.isEmbedView ||
      getStore().getState().pageConstants.hasContainedLevels
    ) {
      config.level.levelHtml = '';
    }

    // Set designModeViz contents after it is created in configureDom()
    // and sized in drawDiv().
    Applab.setLevelHtml(level.levelHtml || level.startHtml || '');
  };

  config.afterEditorReady = function() {
    if (breakpointsEnabled) {
      studioApp().enableBreakpoints();
    }
  };

  config.afterClearPuzzle = function() {
    designMode.resetIds();
    Applab.setLevelHtml(config.level.startHtml || '');
    Applab.storage.populateTable(level.dataTables, true, () => {}, outputError); // overwrite = true
    Applab.storage.populateKeyValue(
      level.dataProperties,
      true,
      () => {},
      outputError
    ); // overwrite = true
    studioApp().resetButtonClick();
  };

  // arrangeStartBlocks(config);

  config.twitter = twitterOptions;

  // hide makeYourOwn on the share page
  config.makeYourOwn = false;

  config.varsInGlobals = true;

  config.pinWorkspaceToBottom = true;

  config.vizAspectRatio = Applab.appWidth / Applab.footerlessAppHeight;
  config.nativeVizWidth = Applab.appWidth;

  config.appMsg = applabMsg;

  config.mobileNoPaddingShareWidth = applabConstants.APP_WIDTH;

  config.enableShowLinesCount = false;

  config.wireframeShare = true;

  // Provide a way for us to have top pane instructions disabled by default, but
  // able to turn them on.
  config.noInstructionsWhenCollapsed = true;

  // Ignore user's code on embedded levels, so that changes made
  // to starting code by levelbuilders will be shown.
  config.ignoreLastAttempt = config.embed;

  // Tell droplet to only allow dropping anonymous functions into known function
  // call params when we have marked that param with allowFunctionDrop
  config.lockFunctionDropIntoKnownParams = true;

  // Print any json parsing errors to the applab debug console and the browser debug
  // console. If a json parse error is thrown before the applab debug console
  // initializes, the error will be printed only to the browser debug console.
  if (level.dataTables) {
    Applab.storage.populateTable(
      level.dataTables,
      false,
      () => {},
      outputError
    ); // overwrite = false
  }
  if (level.dataProperties) {
    Applab.storage.populateKeyValue(
      level.dataProperties,
      false,
      () => {},
      outputError
    ); // overwrite = false
  }

  Applab.handleVersionHistory = studioApp().getVersionHistoryHandler(config);

  var onMount = function() {
    studioApp().init(config);

    var finishButton = document.getElementById('finishButton');
    if (finishButton) {
      dom.addClickTouchEvent(finishButton, Applab.onPuzzleFinish);
    }

    initializeSubmitHelper({
      studioApp: studioApp(),
      onPuzzleComplete: this.onPuzzleComplete.bind(this),
      unsubmitUrl: level.unsubmitUrl
    });

    setupReduxSubscribers(getStore());
    if (config.level.watchersPrepopulated) {
      try {
        JSON.parse(config.level.watchersPrepopulated).forEach(option => {
          getStore().dispatch(addWatcher(option));
        });
      } catch (e) {
        console.warn('Error pre-populating watchers.');
      }
    }

    designMode.addKeyboardHandlers();
    designMode.renderDesignWorkspace();
    designMode.loadDefaultScreen();

    designMode.configureDragAndDrop();

    var designModeViz = document.getElementById('designModeViz');
    designModeViz.addEventListener('click', designMode.onDesignModeVizClick);
  }.bind(this);

  // Push initial level properties into the Redux store
  studioApp().setPageConstants(config, {
    playspacePhoneFrame: !(config.share || config.level.widgetMode),
    channelId: config.channel,
    allowExportExpo: experiments.isEnabled('exportExpo'),
    exportApp: Applab.exportApp,
    expoGenerateApk: expoGenerateApk.bind(
      null,
      config.expoSession,
      Applab.setAndroidExportProps
    ),
    expoCheckApkBuild: expoCheckApkBuild.bind(
      null,
      config.expoSession,
      Applab.setAndroidExportProps
    ),
    expoCancelApkBuild: expoCancelApkBuild.bind(
      null,
      config.expoSession,
      Applab.setAndroidExportProps
    ),
    nonResponsiveVisualizationColumnWidth: applabConstants.APP_WIDTH,
    visualizationHasPadding: !config.noPadding,
    hasDataMode: !(config.level.hideViewDataButton || config.level.widgetMode),
    hasDesignMode: !(config.level.hideDesignMode || config.level.widgetMode),
    isIframeEmbed: !!config.level.iframeEmbed,
    isProjectLevel: !!config.level.isProjectLevel,
    isSubmittable: !!config.level.submittable,
    isSubmitted: !!config.level.submitted,
    showDebugButtons: showDebugButtons,
    showDebugConsole: showDebugConsole,
    showDebugSlider: showDebugConsole,
    showDebugWatch:
      !!config.level.isProjectLevel || config.level.showDebugWatch,
    showMakerToggle:
      !!config.level.isProjectLevel || config.level.makerlabEnabled,
    widgetMode: config.level.widgetMode
  });

  config.dropletConfig = dropletConfig;

  if (config.level.makerlabEnabled) {
    makerToolkit.enable();
    config.dropletConfig = utils.deepMergeConcatArrays(
      config.dropletConfig,
      makerToolkit.dropletConfig
    );
  } else {
    // Push gray, no-autocomplete versions of maker blocks for display purposes.
    const disabledMakerDropletConfig = makeDisabledConfig(
      makerToolkit.dropletConfig
    );
    config.dropletConfig = utils.deepMergeConcatArrays(
      config.dropletConfig,
      disabledMakerDropletConfig
    );
  }

  let customFunctions = level.codeFunctions
    ? level.codeFunctions['customFunctions']
    : undefined;
  if (customFunctions) {
    Object.keys(customFunctions).map(key => {
      customFunctions[key]['func'] = key;
      config.dropletConfig.blocks.push(customFunctions[key]);
      level.codeFunctions[key] = null;
    });
  }

  // Set the custom set of blocks (may have had maker blocks merged in) so
  // we can later pass the custom set to the interpreter.
  config.level.levelBlocks = config.dropletConfig.blocks;

  getStore().dispatch(
    actions.changeInterfaceMode(
      !Applab.isReadOnlyView && Applab.startInDesignMode()
        ? ApplabInterfaceMode.DESIGN
        : ApplabInterfaceMode.CODE
    )
  );

  Applab.reactInitialProps_ = {
    onMount: onMount
  };

  Applab.reactMountPoint_ = document.getElementById(config.containerId);

  const loader = studioApp()
    .loadLibraries(level.helperLibraries)
    .then(() => {
      Applab.render();

      //Scale old-sized apps to fit the new sized display. Old height - 480.
      if ($('.screen').height() === 480) {
        const ratio = 450 / 480;
        if (studioApp().share) {
          //share and embed pages
          $('#divApplab').css(
            'transform',
            'scale(' + ratio + ', ' + ratio + ')'
          );
          $('.small-footer-base').css('transform', 'scale(' + ratio + ', 1)');
        } else {
          //includes the frame on the edit page
          $('#phoneFrameWrapper').css(
            'transform',
            'scale(' + ratio + ', ' + ratio + ')'
          );
        }
      }

      if (getStore().getState().pageConstants.widgetMode) {
        Applab.runButtonClick();
      }
    });

  if (IN_UNIT_TEST) {
    return loader.catch(() => {});
  }
  return loader;
};

function changedToDataMode(state, lastState) {
  return (
    state.interfaceMode !== lastState.interfaceMode &&
    state.interfaceMode === ApplabInterfaceMode.DATA
  );
}

/**
 * Subscribe to state changes on the store.
 * @param {!Store} store
 */
function setupReduxSubscribers(store) {
  designMode.setupReduxSubscribers(store);

  var state = {};
  store.subscribe(function() {
    var lastState = state;
    state = store.getState();

    if (state.interfaceMode !== lastState.interfaceMode) {
      onInterfaceModeChange(state.interfaceMode);
    }

    // Simulate a data view change when switching into data mode.
    const view = state.data && state.data.view;
    const lastView = lastState.data && lastState.data.view;
    const isDataMode = state.interfaceMode === ApplabInterfaceMode.DATA;
    if (
      (isDataMode && view !== lastView) ||
      changedToDataMode(state, lastState)
    ) {
      onDataViewChange(
        state.data.view,
        lastState.data.tableName,
        state.data.tableName
      );
    }

    if (
      !lastState.runState ||
      state.runState.isRunning !== lastState.runState.isRunning
    ) {
      Applab.onIsRunningChange();
    }
  });

  // Initialize redux's list of tables from firebase, and keep it up to date as
  // new tables are added and removed.
  let subscribeToTable = function(tableRef, tableType) {
    tableRef.on('child_added', snapshot => {
      store.dispatch(
        addTableName(
          typeof snapshot.key === 'function' ? snapshot.key() : snapshot.key,
          tableType
        )
      );
    });
    tableRef.on('child_removed', snapshot => {
      store.dispatch(
        deleteTableName(
          typeof snapshot.key === 'function' ? snapshot.key() : snapshot.key
        )
      );
    });
  };

  if (store.getState().pageConstants.hasDataMode) {
    if (experiments.isEnabled(experiments.APPLAB_DATASETS)) {
      subscribeToTable(
        getSharedDatabase().child('counters/tables'),
        tableType.SHARED
      );
    }

    subscribeToTable(
      getProjectDatabase().child('counters/tables'),
      tableType.PROJECT
    );
  }
}

Applab.onIsRunningChange = function() {
  Applab.setCrosshairCursorForPlaySpace();
};

/**
 * Hopefully a temporary measure - we do this ourselves for now because this is
 * a 'protected' div that React doesn't update, but eventually would rather do
 * this with React.
 */
Applab.setCrosshairCursorForPlaySpace = function() {
  var showOverlays = shouldOverlaysBeVisible(getStore().getState());
  $('#divApplab').toggleClass('withCrosshair', showOverlays);
  $('#designModeViz').toggleClass('withCrosshair', true);
};

/**
 * Cache of props, established during init, to use when re-rendering top-level
 * view.  Eventually, it would be best to replace these with a Redux store.
 * @type {Object}
 */
Applab.reactInitialProps_ = {};

/**
 * Element on which to mount the top-level React view.
 * @type {Element}
 * @private
 */
Applab.reactMountPoint_ = null;

/**
 * Trigger a top-level React render
 */
Applab.render = function() {
  var nextProps = Object.assign({}, Applab.reactInitialProps_, {
    isEditingProject: project.isEditing(),
    screenIds: designMode.getAllScreenIds(),
    onScreenCreate: designMode.createScreen,
    handleVersionHistory: Applab.handleVersionHistory
  });
  ReactDOM.render(
    <Provider store={getStore()}>
      <AppLabView {...nextProps} />
    </Provider>,
    Applab.reactMountPoint_
  );
};

/**
 * Export the project for web or use within Expo.
 * @param {Object} expoOpts
 */
Applab.exportApp = function(expoOpts) {
  // Run, grab the html from divApplab, then reset:
  Applab.runButtonClick();
  var html = document.getElementById('divApplab').outerHTML;
  studioApp().resetButtonClick();

  return Exporter.exportApp(
    project.getCurrentName() || 'my-app',
    studioApp().editor.getValue(),
    html,
    expoOpts,
    studioApp().config
  );
};

Applab.setAndroidExportProps = function(props) {
  // Spread the previous object so changes here will always fail shallow
  // compare and trigger react prop changes
  Applab.generatedProperties.export = {
    ...Applab.generatedProperties.export,
    android: props
  };
  project.projectChanged();
  project.saveIfSourcesChanged();
  getStore().dispatch(
    setExportGeneratedProperties(Applab.generatedProperties.export)
  );
};

/**
 * @param {string} newCode Code to append to the end of the editor
 */
Applab.appendToEditor = function(newCode) {
  var code =
    studioApp().editor.addEmptyLine(studioApp().editor.getValue()) + newCode;
  studioApp().editor.setValue(code);
};

Applab.scrollToEnd = function() {
  studioApp().editor.scrollCursorToEndOfDocument();
};

/**
 * Clear the event handlers and stop the onTick timer.
 */
Applab.clearEventHandlersKillTickLoop = function() {
  Applab.whenRunFunc = null;
  Applab.running = false;
  $('#headers').removeClass('dimmed');
  $('#codeWorkspace').removeClass('dimmed');
  Applab.tickCount = 0;
};

/**
 * @returns {boolean}
 */
Applab.isRunning = function() {
  return studioApp().isRunning();
};

/**
 * Toggle whether divApplab or designModeViz is visible.
 * @param isVisible whether divApplab should be visible.
 */
Applab.toggleDivApplab = function(isVisible) {
  if (isVisible) {
    $('#divApplab').show();
    $('#designModeViz').hide();
  } else {
    $('#divApplab').hide();
    $('#designModeViz').show();
  }
};

/**
 * reset and initialize the state of the turtle object
 */
Applab.resetTurtle = function() {
  Applab.turtle = {};
  Applab.turtle.heading = 0;
  Applab.turtle.x = Applab.appWidth / 2;
  Applab.turtle.y = Applab.appHeight / 2;
};

/**
 * Reset the app to the start position and kill any pending animation tasks.
 * @param {boolean} first True if an opening animation is to be played.
 */
Applab.reset = function() {
  Applab.clearEventHandlersKillTickLoop();

  // Reset configurable variables
  Applab.message = null;
  delete Applab.activeCanvas;
  Applab.resetTurtle();
  apiTimeoutList.clearTimeouts();
  apiTimeoutList.clearIntervals();

  var divApplab = document.getElementById('divApplab');
  while (divApplab.firstChild) {
    divApplab.removeChild(divApplab.firstChild);
  }

  Sounds.getSingleton().stopAllAudio();

  // Clone and replace divApplab (this removes all attached event listeners):
  var newDivApplab = divApplab.cloneNode(true);
  divApplab.parentNode.replaceChild(newDivApplab, divApplab);

  $('#divApplab').toggleClass('running', Applab.isRunning());
  $('#divApplab').toggleClass('notRunning', !Applab.isRunning());

  var isDesigning = Applab.isInDesignMode() && !Applab.isRunning();
  Applab.toggleDivApplab(!isDesigning);
  designMode.parseFromLevelHtml(newDivApplab, false);
  if (Applab.isInDesignMode()) {
    designMode.resetElementTray(isDesigning);
    designMode.resetPropertyTab();
  }

  makerToolkit.reset();

  if (level.showTurtleBeforeRun) {
    applabTurtle.turtleSetVisibility(true);
  }

  // Reset goal successState:
  if (level.goal) {
    level.goal.successState = {};
  }

  getStore().dispatch(jsDebugger.detach());

  if (jsInterpreterLogger) {
    jsInterpreterLogger.detach();
  }

  Applab.storage.resetRecordListener();

  // Reset the Globals object used to contain program variables:
  Applab.Globals = {};
  Applab.executionError = null;
  if (Applab.JSInterpreter) {
    Applab.JSInterpreter.deinitialize();
    Applab.JSInterpreter = null;
  }
};

/**
 * Save the app state and trigger any callouts, then call the callback.
 * @param callback {Function}
 */
function runButtonClickWrapper(callback) {
  $(window).trigger('run_button_pressed');

  const defaultScreenId = elementUtils.getDefaultScreenId();
  // Reset our design mode screen to be the default one, so that after we reset
  // we'll end up on the default screen rather than whichever one we were last
  // editing.
  getStore().dispatch(changeScreen(defaultScreenId));
  // Also set the visualization screen to be the default one before we serialize
  // so that our serialization isn't changing based on whichever screen we were
  // last editing.
  Applab.changeScreen(defaultScreenId);
  Applab.serializeAndSave(callback);
}

/**
 * We also want to serialize in save in some other cases (i.e. entering code
 * mode from design mode).
 */
Applab.serializeAndSave = function(callback) {
  designMode.serializeToLevelHtml();
  $(window).trigger('appModeChanged');
  if (callback) {
    callback();
  }
};

/**
 * Click the run button.  Start the program.
 */
// XXX This is the only method used by the templates!
Applab.runButtonClick = function() {
  Sounds.getSingleton().unmuteURLs();
  studioApp().toggleRunReset('reset');
  if (studioApp().isUsingBlockly()) {
    Blockly.mainBlockSpace.traceOn(true);
  }
  Applab.execute();

  // Enable the Finish button if is present:
  var shareCell = document.getElementById('share-cell');
  if (shareCell) {
    shareCell.className = 'share-cell-enabled';
    // adding finish button changes layout. force a resize
    studioApp().onResize();
  }

  if (studioApp().editor) {
    logToCloud.addPageAction(
      logToCloud.PageAction.RunButtonClick,
      {
        usingBlocks: studioApp().editor.session.currentlyUsingBlocks,
        app: 'applab'
      },
      1 / 100
    );
  }

  postContainedLevelAttempt(studioApp());
};

/**
 * App specific displayFeedback function that calls into
 * studioApp.displayFeedback when appropriate
 */
var displayFeedback = function() {
  if (!Applab.waitingForReport) {
    studioApp().displayFeedback({
      feedbackType: Applab.testResults,
      executionError: Applab.executionError,
      response: Applab.response,
      level: level,
      showingSharing: false,
      tryAgainText: applabMsg.tryAgainText(),
      feedbackImage: Applab.feedbackImage,
      twitter: twitterOptions,
      // allow users to save freeplay levels to their gallery (impressive non-freeplay levels are autosaved)
      saveToLegacyGalleryUrl:
        level.freePlay &&
        Applab.response &&
        Applab.response.save_to_gallery_url,
      message: Applab.message,
      appStrings: {
        reinfFeedbackMsg: applabMsg.reinfFeedbackMsg(),
        sharingText: applabMsg.shareGame()
      },
      hideXButton: true
    });
  }
};

/**
 * Function to be called when the service report call is complete
 * @param {MilestoneResponse} response - JSON response (if available)
 */
Applab.onReportComplete = function(response) {
  Applab.response = response;
  Applab.waitingForReport = false;
  studioApp().onReportComplete(response);
  displayFeedback();
};

function getGeneratedProperties() {
  // Must return a new object instance each time so the project
  // system can properly compare currentSources vs newSources
  return {
    ...Applab.generatedProperties
  };
}

/**
 * Execute the app
 */
Applab.execute = function() {
  Applab.result = ResultType.UNSET;
  Applab.testResults = TestResults.NO_TESTS_RUN;
  Applab.waitingForReport = false;
  Applab.response = null;

  studioApp().reset(false);
  studioApp().clearAndAttachRuntimeAnnotations();
  studioApp().attempts++;

  // Set event handlers and start the onTick timer

  var codeWhenRun = '';
  if (level.helperLibraries) {
    codeWhenRun +=
      level.helperLibraries.map(lib => studioApp().libraries[lib]).join('\n') +
      '\n';
  }
  codeWhenRun += studioApp().getCode();
  Applab.currentExecutionLog = [];

  if (typeof codeWhenRun === 'string') {
    // Create a new interpreter for this run
    Applab.JSInterpreter = new JSInterpreter({
      studioApp: studioApp(),
      logExecution: !!level.logConditions,
      shouldRunAtMaxSpeed: function() {
        return getCurrentTickLength() === 0;
      },
      maxInterpreterStepsPerTick: MAX_INTERPRETER_STEPS_PER_TICK
    });

    // Register to handle interpreter events
    Applab.JSInterpreter.onExecutionError.register(handleExecutionError);
    if (jsInterpreterLogger) {
      jsInterpreterLogger.attachTo(Applab.JSInterpreter);
    }
    getStore().dispatch(jsDebugger.attach(Applab.JSInterpreter));

    // Initialize the interpreter and parse the student code
    Applab.JSInterpreter.parse({
      code: codeWhenRun,
      blocks: level.levelBlocks,
      blockFilter: level.executePaletteApisOnly && level.codeFunctions,
      enableEvents: true
    });
    // Maintain a reference here so we can still examine this after we
    // discard the JSInterpreter instance during reset
    Applab.currentExecutionLog = Applab.JSInterpreter.executionLog;
    if (!Applab.JSInterpreter.initialized()) {
      return;
    }
  }

  if (makerToolkitRedux.isEnabled(getStore().getState())) {
    makerToolkit
      .connect({
        interpreter: Applab.JSInterpreter,
        onDisconnect: () => studioApp().resetButtonClick()
      })
      .then(Applab.beginVisualizationRun)
      .catch(error => {
        // Don't just throw any error away, but squelch errors that we already
        // handle gracefully (like early disconnect or a missing board).
        if (!(error instanceof makerToolkit.MakerError)) {
          Applab.log(error);
          return Promise.reject(error);
        }
      });
  } else {
    Applab.beginVisualizationRun();
  }
};

Applab.beginVisualizationRun = function() {
  // Call change screen on the default screen to ensure it has focus
  var defaultScreenId = Applab.getScreens()
    .first()
    .attr('id');
  Applab.changeScreen(defaultScreenId);

  Applab.running = true;
  $('#headers').addClass('dimmed');
  $('#codeWorkspace').addClass('dimmed');
  designMode.renderDesignWorkspace();
  queueOnTick();
};

Applab.feedbackImage = '';
Applab.encodedFeedbackImage = '';

/**
 * Handle code/design mode change.
 * @param {ApplabInterfaceMode} mode
 */
function onInterfaceModeChange(mode) {
  var showDivApplab = mode !== ApplabInterfaceMode.DESIGN;
  Applab.toggleDivApplab(showDivApplab);

  if (mode === ApplabInterfaceMode.DESIGN) {
    studioApp().resetButtonClick();
    designMode.setAppSpaceClipping(true);
  } else if (mode === ApplabInterfaceMode.CODE) {
    setTimeout(() => utils.fireResizeEvent(), 0);
    if (!Applab.isRunning()) {
      Applab.serializeAndSave();
      var divApplab = document.getElementById('divApplab');
      designMode.parseFromLevelHtml(divApplab, false);
      Applab.changeScreen(getStore().getState().screens.currentScreenId);
    } else {
      Applab.activeScreen().focus();
    }
  }
  requestAnimationFrame(() => showHideWorkspaceCallouts());
}

/**
 * Handle a view change within data mode.
 * @param {DataView} view
 */
function onDataViewChange(view, oldTableName, newTableName) {
  if (!getStore().getState().pageConstants.hasDataMode) {
    throw new Error('onDataViewChange triggered without data mode enabled');
  }

  const projectStorageRef = getProjectDatabase().child('storage');
  const sharedStorageRef = getSharedDatabase().child('storage');

  // Unlisten from previous data view. This should not interfere with events listened to
  // by onRecordEvent, which listens for added/updated/deleted events, whereas we are
  // only unlistening from 'value' events here.
  projectStorageRef.child('keys').off('value');
  projectStorageRef.child(`tables/${oldTableName}/records`).off('value');
  sharedStorageRef.child(`tables/${oldTableName}/records`).off('value');
  getColumnsRef(getProjectDatabase(), oldTableName).off();

  switch (view) {
    case DataView.PROPERTIES:
      projectStorageRef.child('keys').on('value', snapshot => {
        getStore().dispatch(updateKeyValueData(snapshot.val()));
      });
      return;
    case DataView.TABLE: {
      let newTableType = getStore().getState().data.tableListMap[newTableName];
      let storageRef;
      if (
        experiments.isEnabled(experiments.APPLAB_DATASETS) &&
        newTableType === tableType.SHARED
      ) {
        storageRef = sharedStorageRef.child(`tables/${newTableName}/records`);
      } else {
        storageRef = projectStorageRef.child(`tables/${newTableName}/records`);
      }
      if (newTableType === tableType.PROJECT) {
        addMissingColumns(newTableName);
      }
      onColumnNames(
        newTableType === tableType.PROJECT
          ? getProjectDatabase()
          : getSharedDatabase(),
        newTableName,
        columnNames => {
          getStore().dispatch(updateTableColumns(newTableName, columnNames));
        }
      );

      storageRef.on('value', snapshot => {
        getStore().dispatch(updateTableRecords(newTableName, snapshot.val()));
      });
      return;
    }
    default:
      return;
  }
}

/**
 * Show a modal dialog with a title, text, and OK and Cancel buttons
 * @param {title}
 * @param {text}
 * @param {callback} [onConfirm] what to do when the user clicks OK
 * @param {string} [filterSelector] Optional selector to filter for.
 */

Applab.showConfirmationDialog = function(config) {
  config.text = config.text || '';
  config.title = config.title || '';

  var contentDiv = document.createElement('div');
  contentDiv.innerHTML =
    '<p class="dialog-title">' +
    config.title +
    '</p>' +
    '<p>' +
    config.text +
    '</p>';

  var buttons = document.createElement('div');
  ReactDOM.render(
    React.createElement(DialogButtons, {
      confirmText: commonMsg.dialogOK(),
      cancelText: commonMsg.dialogCancel()
    }),
    buttons
  );
  contentDiv.appendChild(buttons);

  var dialog = studioApp().createModalDialog({
    contentDiv: contentDiv,
    defaultBtnSelector: '#confirm-button'
  });

  var cancelButton = buttons.querySelector('#again-button');
  if (cancelButton) {
    dom.addClickTouchEvent(cancelButton, function() {
      dialog.hide();
    });
  }

  var confirmButton = buttons.querySelector('#confirm-button');
  if (confirmButton) {
    dom.addClickTouchEvent(confirmButton, function() {
      if (config.onConfirm) {
        config.onConfirm();
      }
      dialog.hide();
    });
  }

  dialog.show();
};

Applab.onPuzzleFinish = function() {
  Applab.onPuzzleComplete(false); // complete without submitting
};

Applab.onPuzzleComplete = function(submit) {
  if (Applab.executionError) {
    Applab.result = ResultType.ERROR;
  } else {
    // In most cases, submit all results as success
    Applab.result = ResultType.SUCCESS;
  }

  // If we know they succeeded, mark levelComplete true
  var levelComplete = Applab.result === ResultType.SUCCESS;

  if (Applab.executionError) {
    Applab.testResults = studioApp().getTestResults(levelComplete, {
      executionError: Applab.executionError
    });
  } else if (level.logConditions) {
    var results = executionLog.getResultsFromLog(
      level.logConditions,
      Applab.currentExecutionLog
    );
    Applab.testResults = results.testResult;
    Applab.message = results.message;
  } else if (!submit) {
    Applab.testResults = TestResults.FREE_PLAY;
  }

  // If we're failing due to failOnLintErrors, replace the previous test result
  // when it is a more positive (relatively more successful) test result
  if (level.failOnLintErrors && annotationList.getJSLintAnnotations().length) {
    if (Applab.testResults > TestResults.GENERIC_LINT_FAIL) {
      Applab.testResults = TestResults.GENERIC_LINT_FAIL;
    }
  }

  // Stop everything on screen
  Applab.clearEventHandlersKillTickLoop();

  if (Applab.testResults >= TestResults.FREE_PLAY) {
    studioApp().playAudio('win');
  } else {
    studioApp().playAudio('failure');
  }

  var program;
  const containedLevelResultsInfo = studioApp().hasContainedLevels
    ? getContainedLevelResultInfo()
    : null;
  if (containedLevelResultsInfo) {
    // Keep our this.testResults as always passing so the feedback dialog
    // shows Continue (the proper results will be reported to the service)
    Applab.testResults = TestResults.ALL_PASS;
    Applab.message = containedLevelResultsInfo.feedback;
  } else {
    // If we want to "normalize" the JavaScript to avoid proliferation of nearly
    // identical versions of the code on the service, we could do either of these:

    // do an acorn.parse and then use escodegen to generate back a "clean" version
    // or minify (uglifyjs) and that or js-beautify to restore a "clean" version

    program = studioApp().getCode();
  }

  Applab.waitingForReport = true;

  const sendReport = function() {
    const onComplete = submit ? onSubmitComplete : Applab.onReportComplete;

    if (containedLevelResultsInfo) {
      // We already reported results when run was clicked. Make sure that call
      // finished, then call onComplete.
      runAfterPostContainedLevel(onComplete);
    } else {
      studioApp().report({
        app: 'applab',
        level: level.id,
        result: levelComplete,
        testResult: Applab.testResults,
        submitted: submit,
        program: encodeURIComponent(program),
        image: Applab.encodedFeedbackImage,
        containedLevelResultsInfo: containedLevelResultsInfo,
        onComplete
      });
    }
  };

  sendReport();
};

Applab.executeCmd = function(id, name, opts) {
  var cmd = {
    id: id,
    name: name,
    opts: opts
  };
  return Applab.callCmd(cmd);
};

//
// Execute an API command
//

Applab.callCmd = function(cmd) {
  var retVal = false;
  if (applabCommands[cmd.name] instanceof Function) {
    studioApp().highlight(cmd.id);
    retVal = applabCommands[cmd.name](cmd.opts);
  }
  return retVal;
};

/*
var onWaitComplete = function (opts) {
  if (!opts.complete) {
    if (opts.waitCallback) {
      opts.waitCallback();
    }
    opts.complete = true;
  }
};

Studio.wait = function (opts) {
  if (!opts.started) {
    opts.started = true;

    // opts.value is the number of milliseconds to wait - or 'click' which means
    // "wait for click"
    if ('click' === opts.value) {
      opts.waitForClick = true;
    } else {
      opts.waitTimeout = window.setTimeout(
        delegate(this, onWaitComplete, opts),
        opts.value);
    }
  }

  return opts.complete;
};
*/

Applab.timedOut = function() {
  return Applab.tickCount > Applab.timeoutFailureTick;
};

var checkFinished = function() {
  // if we have a succcess condition and have accomplished it, we're done and successful
  if (
    level.goal &&
    level.goal.successCondition &&
    level.goal.successCondition()
  ) {
    Applab.result = ResultType.SUCCESS;
    return true;
  }

  // if we have a failure condition, and it's been reached, we're done and failed
  if (
    level.goal &&
    level.goal.failureCondition &&
    level.goal.failureCondition()
  ) {
    Applab.result = ResultType.FAILURE;
    return true;
  }

  /*
  if (Applab.allGoalsVisited()) {
    Applab.result = ResultType.SUCCESS;
    return true;
  }
  */

  if (Applab.timedOut()) {
    Applab.result = ResultType.FAILURE;
    return true;
  }

  return false;
};

Applab.startInDesignMode = function() {
  return !!level.designModeAtStart;
};

Applab.isInDesignMode = function() {
  const mode = getStore().getState().interfaceMode;
  return ApplabInterfaceMode.DESIGN === mode;
};

function quote(str) {
  return '"' + str + '"';
}

/**
 * Return droplet dropdown options representing a list of ids currently present
 * in the DOM, optionally limiting the result to a certain HTML element tagName.
 * @param {string} [filterSelector] Optional selector to filter for.
 * @returns {Array}
 */
Applab.getIdDropdown = function(filterSelector) {
  return Applab.getIdDropdownFromDom_($(document), filterSelector);
};

/**
 * Internal helper for getIdDropdown, which takes a documentRoot
 * argument to remove its global dependency and make it testable.
 * @param {jQuery} documentRoot
 * @param {string} filterSelector
 * @returns {Array}
 * @private
 */
Applab.getIdDropdownFromDom_ = function(documentRoot, filterSelector) {
  var elements = documentRoot.find(
    '#designModeViz [id^="' + applabConstants.DESIGN_ELEMENT_ID_PREFIX + '"]'
  );

  // Return all elements when no filter is given
  if (filterSelector) {
    elements = elements.filter(filterSelector);
  }

  return elements
    .sort(byId)
    .map(function(_, element) {
      var id = quote(elementUtils.getId(element));
      return {text: id, display: id};
    })
    .get();
};

function byId(a, b) {
  return a.id > b.id ? 1 : -1;
}

/**
 * Returns a list of IDs currently present in the DOM of the current screen,
 * including the screen, sorted by z-index.
 */
Applab.getIdDropdownForCurrentScreen = function() {
  return Applab.getIdDropdownForCurrentScreenFromDom_($('#designModeViz'));
};

/**
 * Internal helper for getIdDropdownForCurrentScreen.
 * @private
 */
Applab.getIdDropdownForCurrentScreenFromDom_ = function(documentRoot) {
  var screen = documentRoot
    .find('.screen')
    .filter(function() {
      return this.style.display !== 'none';
    })
    .first();

  var elements = screen
    .find('[id^="' + applabConstants.DESIGN_ELEMENT_ID_PREFIX + '"]')
    .add(screen);

  return elements
    .map(function(_, element) {
      return elementUtils.getId(element);
    })
    .get();
};

/**
 * @returns {HTMLElement} The first "screen" that isn't hidden.
 */
Applab.activeScreen = function() {
  return Applab.getScreens()
    .filter(function() {
      return this.style.display !== 'none';
    })
    .first()[0];
};

/**
 * Changes the active screen for the visualization by toggling all screens in
 * divApplab to be non-visible, unless they match the provided screenId. Also
 * focuses the screen.
 */
Applab.changeScreen = function(screenId) {
  Applab.getScreens().each(function() {
    $(this).toggle(this.id === screenId);
    if (this.id === screenId) {
      // Allow the active screen to receive keyboard events.
      this.focus();
    }
  });

  // Hacky - showTurtleBeforeRun option is designed for authored levels, so we
  // probably ought to make sure it's shown regardless of what screen we display.
  if (!Applab.isRunning()) {
    if (level.showTurtleBeforeRun) {
      applabTurtle.turtleSetVisibility(true);
    }
  }
};

Applab.getScreens = function() {
  return $('#divApplab > .screen');
};

// Wrap design mode function so that we can call from commands
Applab.updateProperty = function(element, property, value) {
  return designMode.updateProperty(element, property, value);
};

// Wrap design mode function so that we can call from commands
Applab.readProperty = function(element, property) {
  return designMode.readProperty(element, property);
};

Applab.getAppReducers = function() {
  return reducers;
};
