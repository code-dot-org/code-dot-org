/**
 * CodeOrgApp: Applab
 *
 * Copyright 2014-2015 Code.org
 *
 */
import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import {singleton as studioApp} from '../StudioApp';
import commonMsg from '@cdo/locale';
import applabMsg from '@cdo/applab/locale';
import codegen from '../codegen';
import AppLabView from './AppLabView';
import {
  initializeSubmitHelper,
  onSubmitComplete
} from '../submitHelper';
import dom from '../dom';
import * as utils from '../utils';
import * as dropletConfig from './dropletConfig';
import AppStorage from './appStorage';
import { initFirebaseStorage } from '../storage/firebaseStorage';
import { getColumnsRef, onColumnNames, addMissingColumns } from '../storage/firebaseMetadata';
import { getDatabase } from '../storage/firebaseUtils';
import experiments from "../util/experiments";
import * as apiTimeoutList from '../lib/util/timeoutList';
import designMode from './designMode';
import applabTurtle from './applabTurtle';
import applabCommands from './commands';
import JSInterpreter from '../JSInterpreter';
import JsInterpreterLogger from '../JsInterpreterLogger';
import * as elementUtils from './designElements/elementUtils';
import { shouldOverlaysBeVisible } from '../templates/VisualizationOverlay';
import logToCloud from '../logToCloud';
import DialogButtons from '../templates/DialogButtons';
import executionLog from '../executionLog';
import annotationList from '../acemode/annotationList';
import Exporter from './Exporter';
import {Provider} from 'react-redux';
import {getStore} from '../redux';
import {actions, reducers} from './redux/applab';
import {add as addWatcher} from '../redux/watchedExpressions';
import { changeScreen } from './redux/screens';
import * as applabConstants from './constants';
const { ApplabInterfaceMode } = applabConstants;
import { DataView } from '../storage/constants';
import consoleApi from '../consoleApi';
import { addTableName, deleteTableName, updateTableColumns, updateTableRecords, updateKeyValueData } from '../storage/redux/data';
import {setStepSpeed} from '../redux/runState';
import {
  getContainedLevelResultInfo,
  postContainedLevelAttempt,
  runAfterPostContainedLevel
} from '../containedLevels';
import SmallFooter from '@cdo/apps/code-studio/components/SmallFooter';
import {
  outputError,
  injectErrorHandler
} from '../lib/util/javascriptMode';
import {
  actions as jsDebugger,
} from '../lib/tools/jsdebugger/redux';
import JavaScriptModeErrorHandler from '../JavaScriptModeErrorHandler';
import connectToMakerBoard from '../lib/kits/maker/connectToMakerBoard';
import * as makerCommands from '../lib/kits/maker/commands';
import * as makerDropletConfig from '../lib/kits/maker/dropletConfig';
import {
  enable as enableMaker,
  isEnabled as isMakerEnabled
} from '../lib/kits/maker/redux';
var project = require('@cdo/apps/code-studio/initApp/project');

var ResultType = studioApp.ResultType;
var TestResults = studioApp.TestResults;

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
 * Maker Toolkit Board Controller for a currently-connected board, simulator,
 * or stub implementation.
 * In Maker Toolkit levels, should be initialized on run and cleared on reset.
 * @private {CircuitPlaygroundBoard}
 */
let makerBoard = null;

/**
 * Temporary: Some code depends on global access to logging, but only Applab
 * knows about the debugger UI where logging should occur.
 * Eventually, I'd like to replace this with window events that the debugger
 * UI listens to, so that the Applab global is not involved.
 * @param {*} object
 */
Applab.log = function (object) {
  if (jsInterpreterLogger) {
    jsInterpreterLogger.log(object);
  }

  getStore().dispatch(jsDebugger.appendLog(object));
};
consoleApi.setLogMethod(Applab.log);

var level;
var skin;
var copyrightStrings;

//TODO: Make configurable.
studioApp.setCheckForEmptyBlocks(true);

var MAX_INTERPRETER_STEPS_PER_TICK = 10000;

// Default Scalings
Applab.scale = {
  'snapRadius': 1,
  'stepSpeed': 0
};

var twitterOptions = {
  text: applabMsg.shareApplabTwitter(),
  hashtag: "ApplabCode"
};

// The unscaled dimensions of the visualization area
var vizAppWidth = 400;
var VIZ_APP_HEIGHT = 400;

function stepDelayFromStepSpeed(stepSpeed) {
  return 300 * Math.pow(1 - stepSpeed, 2);
}

function loadLevel() {
  Applab.timeoutFailureTick = level.timeoutFailureTick || Infinity;
  Applab.minWorkspaceHeight = level.minWorkspaceHeight;
  Applab.softButtons_ = level.softButtons || {};

  // Historically, appWidth and appHeight were customizable on a per level basis.
  // This led to lots of hackery in the code to properly scale the visualization
  // area. Width/height are now constant, but much of the hackery still remains
  // since I don't understand it well enough.
  Applab.appWidth = applabConstants.APP_WIDTH;
  Applab.appHeight = applabConstants.APP_HEIGHT;

  // In share mode we need to reserve some number of pixels for our in-app
  // footer. We do that by making the play space slightly smaller elsewhere.
  // Applab.appHeight represents the height of the entire app (footer + other)
  // Applab.footerlessAppHeight represents the height of only the "other"
  Applab.footerlessAppHeight = applabConstants.APP_HEIGHT - applabConstants.FOOTER_HEIGHT;

  // Override scalars.
  for (var key in level.scale) {
    Applab.scale[key] = level.scale[key];
  }
}

//
// Adjust a media height rule (if needed). This is called by adjustAppSizeStyles
// for all media rules. We look for a specific set of rules that should be in
// the stylesheet and swap out the defaultHeightRules with the newHeightRules
//

function adjustMediaHeightRule(mediaList, defaultHeightRules, newHeightRules) {
  // The media rules we are looking for always have two components. The first
  // component is for screen width, which we ignore. The second is for screen
  // height, which we want to modify:
  if (mediaList.length === 2) {
    var lastHeightRuleIndex = defaultHeightRules.length - 1;
    for (var i = 0; i <= lastHeightRuleIndex; i++) {
      if (-1 !== mediaList.item(1).indexOf("(min-height: " +
          (defaultHeightRules[i] + 1) + "px)")) {
        if (i === 0) {
          // Matched the first rule (no max height)
          mediaList.mediaText = mediaList.item(0) +
              ", screen and (min-height: " + (newHeightRules[i] + 1) + "px)";
        } else {
          // Matched one of the middle rules with a min and a max height
          mediaList.mediaText = mediaList.item(0) +
              ", screen and (min-height: " + (newHeightRules[i] + 1) + "px)" +
              " and (max-height: " + newHeightRules[i - 1] + "px)";
        }
        break;
      } else if (mediaList.item(1) === "screen and (max-height: " +
                 defaultHeightRules[lastHeightRuleIndex] + "px)") {
        // Matched the last rule (no min height)
        mediaList.mediaText = mediaList.item(0) +
            ", screen and (max-height: " +
            newHeightRules[lastHeightRuleIndex] + "px)";
        break;
      }
    }
  }
}

//
// The visualization area adjusts its size using a series of CSS rules that are
// tuned to make adjustments assuming a 400x400 visualization. Since applab
// allows its visualization size to be set on a per-level basis, the function
// below modifies the CSS rules to account for the per-level coordinates
//
// It also adjusts the height rules based on the adjusted visualization size
// and the offset where the app has been embedded in the page
//
// The visualization column will remain at 400 pixels wide in the max-width
// case and scale downward from there. The visualization height will be set
// to preserve the proper aspect ratio with respect to the current width.
//
// The visualization coordinate space will be Applab.appWidth by Applab.appHeight.
// The scale values are then adjusted such that the max-width case may result
// in a scaled-up version of the visualization area and the min-width case will
// typically result in a scaled-down version of the visualization area.
//
// @returns {Array.<number>} Array of scale factors which will be used
//     on the applab app area at the following screen widths, respectively:
//     1151px+; 1101-1150px; 1051-1100px; 1001-1050px; 0-1000px.
//

function adjustAppSizeStyles(container) {
  var vizScale = 1;
  // We assume these are listed in this order:
  var defaultScaleFactors = [1.0, 0.875, 0.75, 0.625, 0.5];
  var scaleFactors = defaultScaleFactors.slice(0);
  if (vizAppWidth !== Applab.appWidth) {
    vizScale = vizAppWidth / Applab.appWidth;
    for (var ind = 0; ind < scaleFactors.length; ind++) {
      scaleFactors[ind] *= vizScale;
    }
  }
  var targetVizAppHeight = Applab.footerlessAppHeight * vizScale;

  // Compute new height rules:
  // (1) defaults are scaleFactors * VIZ_APP_HEIGHT + 200 (belowViz estimate)
  // (2) we adjust the height rules to take into account where the codeApp
  // div is anchored on the page. If this changes after this function is called,
  // the media rules for height are no longer valid.
  // (3) we assume that there is nothing below codeApp on the page that also
  // needs to be included in the height rules
  // (4) there is no 5th height rule in the array because the 5th rule in the
  // stylesheet has no minimum specified. It just uses the max-height from the
  // 4th item in the array.
  var defaultHeightRules = [600, 550, 500, 450];
  var newHeightRules = defaultHeightRules.slice(0);
  for (var z = 0; z < newHeightRules.length; z++) {
    newHeightRules[z] += container.offsetTop +
        (targetVizAppHeight - VIZ_APP_HEIGHT) * defaultScaleFactors[z];
  }

  if (!utils.browserSupportsCssMedia()) {
    return;
  }

  var ss = document.styleSheets;
  // Match applab.css or (for production) applab-{hex-fingerprint}.css
  var applabStyleSheetRegex = /\/applab-?[0-9a-f]*\.css$/i;
  for (var i = 0; i < ss.length; i++) {
    if (ss[i].href && (applabStyleSheetRegex.test(ss[i].href))) {
      // We found our applab specific stylesheet:
      var rules = ss[i].cssRules || ss[i].rules;
      var changedRules = 0;
      var curScaleIndex = 0;
      // Change the width/height plus a set of rules for each scale factor:
      var totalRules = 1 + scaleFactors.length;
      for (var j = 0; j < rules.length && changedRules < totalRules; j++) {
        var childRules = rules[j].cssRules || rules[j].rules;
        if (rules[j].selectorText === "div#visualization") {
          // set the 'normal' width/height for the visualization itself
          rules[j].style.cssText = "height: " + targetVizAppHeight +
                                   "px; width: " + vizAppWidth + "px;";
          changedRules++;
        } else if (rules[j].media && childRules) {
          adjustMediaHeightRule(rules[j].media, defaultHeightRules, newHeightRules);

          // NOTE: selectorText can appear in two different forms when styles and IDs
          // are both present. IE places the styles before the IDs, so we match both forms:
          var changedChildRules = 0;
          var maxChangedRules = 8;
          var scale = scaleFactors[curScaleIndex];
          for (var k = 0; k < childRules.length && changedChildRules < maxChangedRules; k++) {
            if (childRules[k].selectorText === "div#visualization.responsive" ||
                childRules[k].selectorText === "div.responsive#visualization") {
              // For this scale factor...
              // set the max-height and max-width for the visualization
              childRules[k].style.cssText = "max-height: " +
                  Applab.footerlessAppHeight * scale + "px; max-width: " +
                  Applab.appWidth * scale + "px;";
              changedChildRules++;
            } else if (childRules[k].selectorText === "div#visualizationColumn.responsive" ||
                       childRules[k].selectorText === "div.responsive#visualizationColumn") {
              // set the max-width for the parent visualizationColumn
              childRules[k].style.cssText = "max-width: " +
                  Applab.appWidth * scale + "px;";
              changedChildRules++;
            } else if (childRules[k].selectorText === "div#visualizationColumn.responsive.with_padding" ||
                       childRules[k].selectorText === "div.with_padding.responsive#visualizationColumn") {
              // set the max-width for the parent visualizationColumn (with_padding)
              childRules[k].style.cssText = "max-width: " +
                  (Applab.appWidth * scale + 2) + "px;";
              changedChildRules++;
            } else if (childRules[k].selectorText === "div.workspace-right") {
              // set the left for the codeWorkspace
              childRules[k].style.cssText = "left: " +
                  Applab.appWidth * scale + "px;";
              changedChildRules++;
            } else if (childRules[k].selectorText === "div#visualizationResizeBar") {
              // set the left for the visualizationResizeBar
              childRules[k].style.cssText = "left: " +
                  Applab.appWidth * scale + "px; line-height: " +
              Applab.footerlessAppHeight * scale + "px;";
              changedChildRules++;
            } else if (childRules[k].selectorText === "html[dir='rtl'] div.workspace-right") {
              // set the right for the codeWorkspace (RTL mode)
              childRules[k].style.cssText = "right: " +
                  Applab.appWidth * scale + "px;";
              changedChildRules++;
            } else if (childRules[k].selectorText === "html[dir='rtl'] div#visualizationResizeBar") {
              // set the right for the visualizationResizeBar (RTL mode)
              childRules[k].style.cssText = "right: " +
                  Applab.appWidth * scale + "px;";
              changedChildRules++;
            } else if (childRules[k].selectorText === "div#visualization.responsive > *" ||
                       childRules[k].selectorText === "div.responsive#visualization > *") {
              // and set the scale factor for all children of the visualization
              // (importantly, the divApplab and designModeViz elements)
              childRules[k].style.cssText = "-webkit-transform: scale(" + scale +
                  ");-ms-transform: scale(" + scale +
                  ");transform: scale(" + scale + ");";
              changedChildRules++;
            }
          }
          if (changedChildRules) {
            curScaleIndex++;
            changedRules++;
          }
        }
      }
      // After processing the applab.css, stop looking for stylesheets:
      break;
    }
  }
}

var drawDiv = function () {
  ['divApplab', 'visualizationOverlay', 'designModeViz'].forEach(function (divId) {
    var div = document.getElementById(divId);
    div.style.width = Applab.appWidth + "px";
    div.style.height = Applab.footerlessAppHeight + "px";
  });

  if (shouldRenderFooter()) {
    renderFooterInSharedGame();
  }
};

function shouldRenderFooter() {
  return studioApp.share;
}

function renderFooterInSharedGame() {
  const divApplab = document.getElementById('divApplab');
  const footerDiv = document.createElement('div');
  footerDiv.setAttribute('id', 'footerDiv');
  divApplab.parentNode.insertBefore(footerDiv, divApplab.nextSibling);

  const isIframeEmbed = getStore().getState().pageConstants.isIframeEmbed;

  const menuItems = [
    {
      text: commonMsg.reportAbuse(),
      link: '/report_abuse',
      newWindow: true
    },
    isIframeEmbed && !dom.isMobile() && {
      text: applabMsg.makeMyOwnApp(),
      link: '/projects/applab/new',
    },
    window.location.search.indexOf('nosource') < 0 && {
      text: commonMsg.openWorkspace(),
      link: project.getProjectUrl('/view'),
      newWindow: true,
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

  ReactDOM.render(
    <SmallFooter
      i18nDropdown={''}
      privacyPolicyInBase={false}
      copyrightInBase={false}
      copyrightStrings={copyrightStrings}
      baseMoreMenuString={commonMsg.builtOnCodeStudio()}
      rowHeight={applabConstants.FOOTER_HEIGHT}
      style={{fontSize:18}}
      baseStyle={{
        width: $("#divApplab").width(),
        paddingLeft: 0
      }}
      className="dark"
      menuItems={menuItems}
      phoneFooter={true}
    />,
    footerDiv);
}

/**
 * @param {string} code The code to search for Data Storage APIs
 * @return {boolean} True if the code uses any data storage APIs
 */
Applab.hasDataStoreAPIs = function (code) {
  return /createRecord/.test(code) || /updateRecord/.test(code) ||
    /setKeyValue/.test(code);
};

/**
 * Set the current interpreter step speed as a value from 0 (stopped)
 * to 1 (full speed).
 * @param {!number} speed - range 0..1
 */
Applab.setStepSpeed = function (speed) {
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

function handleExecutionError(err, lineNumber) {
  outputError(String(err), lineNumber);
  Applab.executionError = { err: err, lineNumber: lineNumber };

  // prevent further execution
  Applab.clearEventHandlersKillTickLoop();

  // Used by level tests
  if (Applab.onExecutionError) {
    Applab.onExecutionError();
  }
}

Applab.getCode = function () {
  return studioApp.getCode();
};

Applab.getHtml = function () {
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
Applab.setLevelHtml = function (html) {
  if (html === '') {
    Applab.levelHtml = '';
  } else {
    Applab.levelHtml = designMode.addScreenIfNecessary(html);
  }
  var designModeViz = document.getElementById('designModeViz');
  designMode.parseFromLevelHtml(designModeViz, true, applabConstants.DESIGN_ELEMENT_ID_PREFIX);

  // Make sure at least one screen exists, and that the first
  // screen is visible.
  designMode.loadDefaultScreen();
  designMode.serializeToLevelHtml();
};

Applab.onTick = function () {
  if (!Applab.running) {
    return;
  }

  Applab.tickCount++;
  queueOnTick();

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
Applab.initReadonly = function (config) {
  // Do some minimal level loading so that
  // we can ensure that the blocks are appropriately modified for this level
  skin = config.skin;
  level = config.level;
  copyrightStrings = config.copyrightStrings;
  config.appMsg = applabMsg;
  loadLevel();

  // Applab.initMinimal();

  studioApp.initReadonly(config);
};

/**
 * Initialize Blockly and the Applab app.  Called on page load.
 */
Applab.init = function (config) {
  // Gross, but necessary for tests, until we can instantiate AppLab and make
  // this a member variable: Reset this thing until we're ready to create it!
  jsInterpreterLogger = null;

  // replace studioApp methods with our own
  studioApp.reset = this.reset.bind(this);
  studioApp.runButtonClick = this.runButtonClick.bind(this);

  config.runButtonClickWrapper = runButtonClickWrapper;

  if (!config.level.editCode) {
    throw 'App Lab requires Droplet';
  }

  if (!config.channel) {
    throw new Error('Cannot initialize App Lab without a channel id. ' +
      'You may need to sign in to your code studio account first.');
  }
  Applab.channelId = config.channel;
  var useFirebase = window.dashboard.project.useFirebase() || false;
  Applab.storage = useFirebase ? initFirebaseStorage({
    channelId: config.channel,
    firebaseName: config.firebaseName,
    firebaseAuthToken: config.firebaseAuthToken,
    firebaseChannelIdSuffix: config.firebaseChannelIdSuffix || '',
    showRateLimitAlert: studioApp.showRateLimitAlert
  }) : AppStorage;
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
    isAdmin: (config.isAdmin === true),
    isSignedIn: config.isSignedIn
  };
  Applab.isReadOnlyView = config.readonlyWorkspace;

  Applab.onExecutionError = config.onExecutionError;

  loadLevel();

  if (studioApp.hideSource) {
    // always run at max speed if source is hidden
    config.level.sliderSpeed = 1.0;
  }

  // If we are in mobile sharing mode, allow the viewport to handle scaling
  // and override our default width target in vizAppWidth with the actual width
  if (dom.isMobile() && config.hideSource) {
    vizAppWidth = Applab.appWidth;
  }

  const containerEl = document.getElementById(config.containerId);
  if (containerEl) {
    adjustAppSizeStyles(containerEl);
  }

  var showDebugButtons = (!config.hideSource && !config.level.debuggerDisabled);
  var breakpointsEnabled = !config.level.debuggerDisabled;
  var showDebugConsole = !config.hideSource;

  // Construct a logging observer for interpreter events
  if (!config.hideSource) {
    jsInterpreterLogger = new JsInterpreterLogger(window.console);
  }

  if (showDebugButtons || showDebugConsole) {
    getStore().dispatch(jsDebugger.initialize({
      runApp: Applab.runButtonClick,
    }));
    if (config.level.expandDebugger) {
      getStore().dispatch(jsDebugger.open());
    }
  }

  // Set up an error handler for student errors and warnings.
  injectErrorHandler(new JavaScriptModeErrorHandler(
    () => Applab.JSInterpreter,
    Applab
  ));

  config.loadAudio = function () {
    studioApp.loadAudio(skin.failureSound, 'failure');
  };

  config.shareWarningInfo = {
    hasDataAPIs: function () {
      return Applab.hasDataStoreAPIs(Applab.getCode());
    },
    onWarningsComplete: function () {
      if (config.share) {
        // If this is a share page, autostart the app after warnings closed.
        window.setTimeout(Applab.runButtonClick.bind(studioApp), 0);
      }
    }
  };

  config.afterInject = function () {
    if (studioApp.isUsingBlockly()) {
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
    // levels so that updates made to startHtml by levelbuilders are shown.
    if (!getStore().getState().pageConstants.hasDesignMode ||
        getStore().getState().pageConstants.isEmbedView) {
      config.level.levelHtml = '';
    }

    // Set designModeViz contents after it is created in configureDom()
    // and sized in drawDiv().
    Applab.setLevelHtml(level.levelHtml || level.startHtml || "");

    // IE9 doesnt support the way we handle responsiveness. Instead, explicitly
    // resize our visualization (user can still resize with grippy)
    if (!utils.browserSupportsCssMedia()) {
      studioApp.resizeVisualization(300);
    }
  };

  config.afterEditorReady = function () {
    if (breakpointsEnabled) {
      studioApp.enableBreakpoints();
    }
  };

  config.afterClearPuzzle = function () {
    designMode.resetIds();
    Applab.setLevelHtml(config.level.startHtml || '');
    Applab.storage.populateTable(level.dataTables, true, () => {}, outputError); // overwrite = true
    Applab.storage.populateKeyValue(level.dataProperties, true, () => {}, outputError); // overwrite = true
    studioApp.resetButtonClick();
  };

  // arrangeStartBlocks(config);

  config.twitter = twitterOptions;

  // hide makeYourOwn on the share page
  config.makeYourOwn = false;

  config.varsInGlobals = true;

  config.dropletConfig = utils.deepMergeConcatArrays(dropletConfig, makerDropletConfig);

  // Set the custom set of blocks (may have had maker blocks merged in) so
  // we can later pass the custom set to the interpreter.
  config.level.levelBlocks = config.dropletConfig.blocks;

  config.pinWorkspaceToBottom = true;

  config.vizAspectRatio = Applab.appWidth / Applab.footerlessAppHeight;
  config.nativeVizWidth = Applab.appWidth;

  config.appMsg = applabMsg;

  config.mobileNoPaddingShareWidth = applabConstants.APP_WIDTH;

  config.enableShowLinesCount = false;

  // In Applab, we want our embedded levels to look the same as regular levels,
  // just without the editor
  config.centerEmbedded = false;
  config.wireframeShare = true;
  config.responsiveEmbedded = true;

  // Provide a way for us to have top pane instructions disabled by default, but
  // able to turn them on.
  config.noInstructionsWhenCollapsed = true;

  // Ignore user's code on embedded levels, so that changes made
  // to starting code by levelbuilders will be shown.
  config.ignoreLastAttempt = config.embed;

  // Print any json parsing errors to the applab debug console and the browser debug
  // console. If a json parse error is thrown before the applab debug console
  // initializes, the error will be printed only to the browser debug console.
  if (level.dataTables) {
    Applab.storage.populateTable(level.dataTables, false, () => {}, outputError); // overwrite = false
  }
  if (level.dataProperties) {
    Applab.storage.populateKeyValue(level.dataProperties, false, () => {}, outputError); // overwrite = false
  }

  Applab.handleVersionHistory = studioApp.getVersionHistoryHandler(config);

  var onMount = function () {
    studioApp.init(config);

    var finishButton = document.getElementById('finishButton');
    if (finishButton) {
      dom.addClickTouchEvent(finishButton, Applab.onPuzzleFinish);
    }

    initializeSubmitHelper({
      studioApp: studioApp,
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

    getStore().dispatch(actions.changeInterfaceMode(
      Applab.startInDesignMode() ? ApplabInterfaceMode.DESIGN : ApplabInterfaceMode.CODE));

    designMode.configureDragAndDrop();

    var designModeViz = document.getElementById('designModeViz');
    designModeViz.addEventListener('click', designMode.onDesignModeVizClick);
  }.bind(this);

  // Push initial level properties into the Redux store
  studioApp.setPageConstants(config, {
    playspacePhoneFrame: !config.share,
    channelId: config.channel,
    nonResponsiveVisualizationColumnWidth: applabConstants.APP_WIDTH,
    visualizationHasPadding: !config.noPadding,
    hasDataMode: useFirebase && !config.level.hideViewDataButton,
    hasDesignMode: !config.level.hideDesignMode,
    isIframeEmbed: !!config.level.iframeEmbed,
    isViewDataButtonHidden: !!config.level.hideViewDataButton,
    isProjectLevel: !!config.level.isProjectLevel,
    isSubmittable: !!config.level.submittable,
    isSubmitted: !!config.level.submitted,
    showDebugButtons: showDebugButtons,
    showDebugConsole: showDebugConsole,
    showDebugSlider: showDebugConsole,
    showDebugWatch: config.level.showDebugWatch || experiments.isEnabled('showWatchers'),
  });

  if (config.level.makerlabEnabled) {
    getStore().dispatch(enableMaker());
  }

  getStore().dispatch(actions.changeInterfaceMode(
    Applab.startInDesignMode() ? ApplabInterfaceMode.DESIGN : ApplabInterfaceMode.CODE));

  Applab.reactInitialProps_ = {
    onMount: onMount
  };

  Applab.reactMountPoint_ = document.getElementById(config.containerId);

  Applab.render();
};

function changedToDataMode(state, lastState) {
  return state.interfaceMode !== lastState.interfaceMode &&
      state.interfaceMode === ApplabInterfaceMode.DATA;
}

/**
 * Subscribe to state changes on the store.
 * @param {!Store} store
 */
function setupReduxSubscribers(store) {
  designMode.setupReduxSubscribers(store);

  var state = {};
  store.subscribe(function () {
    var lastState = state;
    state = store.getState();

    if (state.interfaceMode !== lastState.interfaceMode) {
      onInterfaceModeChange(state.interfaceMode);
    }

    // Simulate a data view change when switching into data mode.
    const view = state.data && state.data.view;
    const lastView = lastState.data && lastState.data.view;
    const isDataMode = (state.interfaceMode === ApplabInterfaceMode.DATA);
    if ((isDataMode && view !== lastView) || changedToDataMode(state, lastState)) {
      onDataViewChange(state.data.view, lastState.data.tableName, state.data.tableName);
    }

    if (!lastState.runState || state.runState.isRunning !== lastState.runState.isRunning) {
      Applab.onIsRunningChange();
    }
  });

  if (store.getState().pageConstants.hasDataMode) {
    // Initialize redux's list of tables from firebase, and keep it up to date as
    // new tables are added and removed.
    const tablesRef = getDatabase(Applab.channelId).child('counters/tables');
    tablesRef.on('child_added', snapshot => {
      store.dispatch(addTableName(snapshot.key()));
    });
    tablesRef.on('child_removed', snapshot => {
      store.dispatch(deleteTableName(snapshot.key()));
    });
  }
}

Applab.onIsRunningChange = function () {
  Applab.setCrosshairCursorForPlaySpace();
};

/**
 * Hopefully a temporary measure - we do this ourselves for now because this is
 * a 'protected' div that React doesn't update, but eventually would rather do
 * this with React.
 */
Applab.setCrosshairCursorForPlaySpace = function () {
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
Applab.render = function () {
  var nextProps = Object.assign({}, Applab.reactInitialProps_, {
    isEditingProject: window.dashboard && window.dashboard.project.isEditing(),
    screenIds: designMode.getAllScreenIds(),
    onScreenCreate: designMode.createScreen,
    handleVersionHistory: Applab.handleVersionHistory
  });
  ReactDOM.render(
    <Provider store={getStore()}>
      <AppLabView {...nextProps} />
    </Provider>,
    Applab.reactMountPoint_);
};

Applab.exportApp = function () {
  Applab.runButtonClick();
  var html = document.getElementById('divApplab').outerHTML;
  studioApp.resetButtonClick();
  return Exporter.exportApp(
    // TODO: find another way to get this info that doesn't rely on globals.
    window.dashboard && window.dashboard.project.getCurrentName() || 'my-app',
    studioApp.editor.getValue(),
    html
  );
};

/**
 * @param {string} newCode Code to append to the end of the editor
 */
Applab.appendToEditor = function (newCode) {
  var code = studioApp.editor.addEmptyLine(studioApp.editor.getValue()) + newCode;
  studioApp.editor.setValue(code);
};

Applab.scrollToEnd = function () {
  studioApp.editor.scrollCursorToEndOfDocument();
};

/**
 * Clear the event handlers and stop the onTick timer.
 */
Applab.clearEventHandlersKillTickLoop = function () {
  Applab.whenRunFunc = null;
  Applab.running = false;
  $('#headers').removeClass('dimmed');
  $('#codeWorkspace').removeClass('dimmed');
  Applab.tickCount = 0;
};

/**
 * @returns {boolean}
 */
Applab.isRunning = function () {
  return studioApp.isRunning();
};

/**
 * Toggle whether divApplab or designModeViz is visible.
 * @param isVisible whether divApplab should be visible.
 */
Applab.toggleDivApplab = function (isVisible) {
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
Applab.resetTurtle = function () {
  Applab.turtle = {};
  Applab.turtle.heading = 0;
  Applab.turtle.x = Applab.appWidth / 2;
  Applab.turtle.y = Applab.appHeight / 2;
};

/**
 * Reset the app to the start position and kill any pending animation tasks.
 * @param {boolean} first True if an opening animation is to be played.
 */
Applab.reset = function () {
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

  if (studioApp.cdoSounds) {
    studioApp.cdoSounds.stopAllAudio();
  }

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

  if (makerBoard) {
    makerBoard.destroy();
    makerBoard = null;
  }

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
Applab.serializeAndSave = function (callback) {
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
Applab.runButtonClick = function () {
  studioApp.toggleRunReset('reset');
  if (studioApp.isUsingBlockly()) {
    Blockly.mainBlockSpace.traceOn(true);
  }
  Applab.execute();

  // Enable the Finish button if is present:
  var shareCell = document.getElementById('share-cell');
  if (shareCell) {
    shareCell.className = 'share-cell-enabled';
    // adding finish button changes layout. force a resize
    studioApp.onResize();
  }

  if (studioApp.editor) {
    logToCloud.addPageAction(logToCloud.PageAction.RunButtonClick, {
      usingBlocks: studioApp.editor.currentlyUsingBlocks,
      app: 'applab'
    }, 1/100);
  }

  postContainedLevelAttempt(studioApp);
};

/**
 * App specific displayFeedback function that calls into
 * studioApp.displayFeedback when appropriate
 */
var displayFeedback = function () {
  if (!Applab.waitingForReport) {
    studioApp.displayFeedback({
      app: 'applab', //XXX
      skin: skin.id,
      feedbackType: Applab.testResults,
      executionError: Applab.executionError,
      response: Applab.response,
      level: level,
      showingSharing: level.freePlay,
      tryAgainText: applabMsg.tryAgainText(),
      feedbackImage: Applab.feedbackImage,
      twitter: twitterOptions,
      // allow users to save freeplay levels to their gallery (impressive non-freeplay levels are autosaved)
      saveToGalleryUrl: level.freePlay && Applab.response && Applab.response.save_to_gallery_url,
      message: Applab.message,
      appStrings: {
        reinfFeedbackMsg: applabMsg.reinfFeedbackMsg(),
        sharingText: applabMsg.shareGame()
      }
    });
  }
};

/**
 * Function to be called when the service report call is complete
 * @param {object} JSON response (if available)
 */
Applab.onReportComplete = function (response) {
  Applab.response = response;
  Applab.waitingForReport = false;
  studioApp.onReportComplete(response);
  displayFeedback();
};

/**
 * Execute the app
 */
Applab.execute = function () {
  Applab.result = ResultType.UNSET;
  Applab.testResults = TestResults.NO_TESTS_RUN;
  Applab.waitingForReport = false;
  Applab.response = null;

  studioApp.reset(false);
  studioApp.clearAndAttachRuntimeAnnotations();
  studioApp.attempts++;

  // Set event handlers and start the onTick timer

  var codeWhenRun;
  codeWhenRun = studioApp.getCode();
  Applab.currentExecutionLog = [];

  if (codeWhenRun) {
    // Create a new interpreter for this run
    Applab.JSInterpreter = new JSInterpreter({
      studioApp: studioApp,
      logExecution: !!level.logConditions,
      shouldRunAtMaxSpeed: function () { return getCurrentTickLength() === 0; },
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

  if (isMakerEnabled(getStore().getState())) {
    connectToMakerBoard()
        .then(board => {
          board.installOnInterpreter(codegen, Applab.JSInterpreter);
          makerCommands.injectBoardController(board);
          board.once('disconnect', () => studioApp.resetButtonClick());
          makerBoard = board;
        })
        .catch(error => studioApp.displayPlayspaceAlert('error',
            <div>{`Board connection error: ${error}`}</div>))
        .then(Applab.beginVisualizationRun);
  } else {
    Applab.beginVisualizationRun();
  }
};

Applab.beginVisualizationRun = function () {
  // Call change screen on the default screen to ensure it has focus
  var defaultScreenId = Applab.getScreens().first().attr('id');
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
  var showDivApplab = (mode !== ApplabInterfaceMode.DESIGN);
  Applab.toggleDivApplab(showDivApplab);

  if (mode === ApplabInterfaceMode.DESIGN) {
    studioApp.resetButtonClick();
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
}

/**
 * Handle a view change within data mode.
 * @param {DataView} view
 */
function onDataViewChange(view, oldTableName, newTableName) {
  if (!getStore().getState().pageConstants.hasDataMode) {
    throw new Error('onDataViewChange triggered without data mode enabled');
  }
  const storageRef = getDatabase(Applab.channelId).child('storage');

  // Unlisten from previous data view. This should not interfere with events listened to
  // by onRecordEvent, which listens for added/updated/deleted events, whereas we are
  // only unlistening from 'value' events here.
  storageRef.child('keys').off('value');
  storageRef.child(`tables/${oldTableName}/records`).off('value');
  getColumnsRef(oldTableName).off();

  switch (view) {
    case DataView.PROPERTIES:
      storageRef.child('keys').on('value', snapshot => {
        getStore().dispatch(updateKeyValueData(snapshot.val()));
      });
      return;
    case DataView.TABLE:
      // Add any columns which appear in records in Firebase to the list of columns in
      // Firebase. Do NOT do this every time the records change, to avoid adding back
      // a column shortly after it was explicitly renamed or deleted.
      addMissingColumns(newTableName);

      onColumnNames(newTableName, columnNames => {
        getStore().dispatch(updateTableColumns(newTableName, columnNames));
      });

      storageRef.child(`tables/${newTableName}/records`).on('value', snapshot => {
        getStore().dispatch(updateTableRecords(newTableName, snapshot.val()));
      });
      return;
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

Applab.showConfirmationDialog = function (config) {
  config.text = config.text || "";
  config.title = config.title || "";

  var contentDiv = document.createElement('div');
  contentDiv.innerHTML = '<p class="dialog-title">' + config.title + '</p>' +
      '<p>' + config.text + '</p>';

  var buttons = document.createElement('div');
  ReactDOM.render(React.createElement(DialogButtons, {
    confirmText: commonMsg.dialogOK(),
    cancelText: commonMsg.dialogCancel()
  }), buttons);
  contentDiv.appendChild(buttons);

  var dialog = studioApp.createModalDialog({
    contentDiv: contentDiv,
    defaultBtnSelector: '#confirm-button'
  });

  var cancelButton = buttons.querySelector('#again-button');
  if (cancelButton) {
    dom.addClickTouchEvent(cancelButton, function () {
      dialog.hide();
    });
  }

  var confirmButton = buttons.querySelector('#confirm-button');
  if (confirmButton) {
    dom.addClickTouchEvent(confirmButton, function () {
      if (config.onConfirm) {
        config.onConfirm();
      }
      dialog.hide();
    });
  }

  dialog.show();
};

Applab.onPuzzleFinish = function () {
  Applab.onPuzzleComplete(false); // complete without submitting
};

Applab.onPuzzleComplete = function (submit) {
  if (Applab.executionError) {
    Applab.result = ResultType.ERROR;
  } else {
    // In most cases, submit all results as success
    Applab.result = ResultType.SUCCESS;
  }

  // If we know they succeeded, mark levelComplete true
  var levelComplete = (Applab.result === ResultType.SUCCESS);

  if (Applab.executionError) {
    Applab.testResults = studioApp.getTestResults(levelComplete, {
        executionError: Applab.executionError
    });
  } else if (level.logConditions) {
    var results = executionLog.getResultsFromLog(level.logConditions,
        Applab.currentExecutionLog);
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
    studioApp.playAudio('win');
  } else {
    studioApp.playAudio('failure');
  }

  var program;
  const containedLevelResultsInfo = studioApp.hasContainedLevels ? getContainedLevelResultInfo() : null;
  if (containedLevelResultsInfo) {
    // Keep our this.testResults as always passing so the feedback dialog
    // shows Continue (the proper results will be reported to the service)
    Applab.testResults = studioApp.TestResults.ALL_PASS;
    Applab.message = containedLevelResultsInfo.feedback;
  } else {
    // If we want to "normalize" the JavaScript to avoid proliferation of nearly
    // identical versions of the code on the service, we could do either of these:

    // do an acorn.parse and then use escodegen to generate back a "clean" version
    // or minify (uglifyjs) and that or js-beautify to restore a "clean" version

    program = studioApp.getCode();
  }

  Applab.waitingForReport = true;

  const sendReport = function () {
    const onComplete = (submit ? onSubmitComplete : Applab.onReportComplete);

    if (containedLevelResultsInfo) {
      // We already reported results when run was clicked. Make sure that call
      // finished, then call onCompelte
      runAfterPostContainedLevel(onComplete);
    } else {
      studioApp.report({
        app: 'applab',
        level: level.id,
        result: levelComplete,
        testResult: Applab.testResults,
        submitted: submit ? "true" : false,
        program: encodeURIComponent(program),
        image: Applab.encodedFeedbackImage,
        containedLevelResultsInfo: containedLevelResultsInfo,
        onComplete
      });
    }
  };

  var divApplab = document.getElementById('divApplab');
  if (!divApplab || typeof divApplab.toDataURL === 'undefined') { // don't try it if function is not defined
    sendReport();
  } else {
    divApplab.toDataURL("image/png", {
      callback: function (pngDataUrl) {
        Applab.feedbackImage = pngDataUrl;
        Applab.encodedFeedbackImage = encodeURIComponent(Applab.feedbackImage.split(',')[1]);

        sendReport();
      }
    });
  }
};

Applab.executeCmd = function (id, name, opts) {
  var cmd = {
    'id': id,
    'name': name,
    'opts': opts
  };
  return Applab.callCmd(cmd);
};

//
// Execute an API command
//

Applab.callCmd = function (cmd) {
  var retVal = false;
  if (applabCommands[cmd.name] instanceof Function) {
    studioApp.highlight(cmd.id);
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

Applab.timedOut = function () {
  return Applab.tickCount > Applab.timeoutFailureTick;
};

var checkFinished = function () {
  // if we have a succcess condition and have accomplished it, we're done and successful
  if (level.goal && level.goal.successCondition && level.goal.successCondition()) {
    Applab.result = ResultType.SUCCESS;
    return true;
  }

  // if we have a failure condition, and it's been reached, we're done and failed
  if (level.goal && level.goal.failureCondition && level.goal.failureCondition()) {
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

Applab.startInDesignMode = function () {
  return !!level.designModeAtStart;
};

Applab.isInDesignMode = function () {
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
Applab.getIdDropdown = function (filterSelector) {
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
Applab.getIdDropdownFromDom_ = function (documentRoot, filterSelector) {
  var elements = documentRoot.find('#designModeViz [id^="' + applabConstants.DESIGN_ELEMENT_ID_PREFIX + '"]');

  // Return all elements when no filter is given
  if (filterSelector) {
    elements = elements.filter(filterSelector);
  }

  return elements.sort(byId).map(function (_, element) {
    var id = quote(elementUtils.getId(element));
    return {text: id, display: id};
  }).get();
};

function byId(a, b) {
  return a.id > b.id ? 1 : -1;
}

/**
 * Returns a list of IDs currently present in the DOM of the current screen,
 * including the screen, sorted by z-index.
 */
Applab.getIdDropdownForCurrentScreen = function () {
  return Applab.getIdDropdownForCurrentScreenFromDom_($('#designModeViz'));
};

/**
 * Internal helper for getIdDropdownForCurrentScreen.
 * @private
 */
Applab.getIdDropdownForCurrentScreenFromDom_ = function (documentRoot) {
  var screen = documentRoot.find('.screen').filter(function () {
    return this.style.display !== 'none';
  }).first();

  var elements = screen.find('[id^="' + applabConstants.DESIGN_ELEMENT_ID_PREFIX + '"]').add(screen);

  return elements.map(function (_, element) {
    return elementUtils.getId(element);
  }).get();
};

/**
 * @returns {HTMLElement} The first "screen" that isn't hidden.
 */
Applab.activeScreen = function () {
  return Applab.getScreens().filter(function () {
    return this.style.display !== 'none';
  }).first()[0];
};

/**
 * Changes the active screen for the visualization by toggling all screens in
 * divApplab to be non-visible, unless they match the provided screenId. Also
 * focuses the screen.
 */
Applab.changeScreen = function (screenId) {
  Applab.getScreens().each(function () {
    $(this).toggle(this.id === screenId);
    if ((this.id === screenId)) {
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

Applab.getScreens = function () {
  return $('#divApplab > .screen');
};

// Wrap design mode function so that we can call from commands
Applab.updateProperty = function (element, property, value) {
  return designMode.updateProperty(element, property, value);
};

// Wrap design mode function so that we can call from commands
Applab.readProperty = function (element, property) {
  return designMode.readProperty(element, property);
};

Applab.getAppReducers = function () {
  return reducers;
};
