/**
 * CodeOrgApp: Applab
 *
 * Copyright 2014-2015 Code.org
 *
 */
/* global dashboard */

'use strict';
var studioApp = require('../StudioApp').singleton;
var commonMsg = require('../locale');
var applabMsg = require('./locale');
var skins = require('../skins');
var codegen = require('../codegen');
var api = require('./api');
var apiBlockly = require('./apiBlockly');
var dontMarshalApi = require('./dontMarshalApi');
var blocks = require('./blocks');
var AppLabView = require('./AppLabView');
var codeWorkspaceEjs = require('../templates/codeWorkspace.html.ejs');
var Visualization = require('./Visualization');
var Controls = require('./Controls');
var VisualizationColumn = require('../templates/VisualizationColumn');
var visualizationColumnEjs = require('../templates/visualizationColumn.html.ejs');
var dom = require('../dom');
var parseXmlElement = require('../xml').parseElement;
var utils = require('../utils');
var dropletUtils = require('../dropletUtils');
var dropletConfig = require('./dropletConfig');
var AppStorage = require('./appStorage');
var constants = require('../constants');
var KeyCodes = constants.KeyCodes;
var _ = utils.getLodash();
// var Hammer = utils.getHammer();
var apiTimeoutList = require('../timeoutList');
var designMode = require('./designMode');
var applabTurtle = require('./applabTurtle');
var applabCommands = require('./commands');
var JSInterpreter = require('../JSInterpreter');
var JsInterpreterLogger = require('../JsInterpreterLogger');
var JsDebuggerUi = require('../JsDebuggerUi');
var elementLibrary = require('./designElements/library');
var elementUtils = require('./designElements/elementUtils');
var VisualizationOverlay = require('./VisualizationOverlay');
var ShareWarningsDialog = require('../templates/ShareWarningsDialog');
var logToCloud = require('../logToCloud');
var DialogButtons = require('../templates/DialogButtons');
var executionLog = require('../executionLog');
var annotationList = require('../acemode/annotationList');

var createStore = require('../redux');
var Provider = require('react-redux').Provider;
var rootReducer = require('./reducers').rootReducer;
var actions = require('./actions');
var setInitialLevelProps = actions.setInitialLevelProps;
var changeInterfaceMode = actions.changeInterfaceMode;
var setInstructionsInTopPane = actions.setInstructionsInTopPane;

var applabConstants = require('./constants');
var consoleApi = require('../consoleApi');

var BoardController = require('../makerlab/BoardController');

var ResultType = studioApp.ResultType;
var TestResults = studioApp.TestResults;
var ApplabInterfaceMode = applabConstants.ApplabInterfaceMode;

/**
 * Create a namespace for the application.
 */
var Applab = module.exports;

/**
 * @type {JsInterpreterLogger} observes the interpreter and logs to console
 */
var jsInterpreterLogger = null;

/**
 * @type {JsDebuggerUi} Controller for JS debug buttons and console area
 */
var debuggerUi = null;

/**
 * Redux Store holding application state, transformable by actions.
 * @type {Store}
 * @see http://redux.js.org/docs/basics/Store.html
 */
Applab.reduxStore = createStore(rootReducer);

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

  if (debuggerUi) {
    debuggerUi.log(object);
  }
};
consoleApi.setLogMethod(Applab.log);

var errorHandler = require('../errorHandler');
errorHandler.setLogMethod(Applab.log);
var outputError = errorHandler.outputError;
var ErrorLevel = errorHandler.ErrorLevel;

var level;
var skin;
var copyrightStrings;

//TODO: Make configurable.
studioApp.setCheckForEmptyBlocks(true);

var MAX_INTERPRETER_STEPS_PER_TICK = 10000;

// For proxying non-https assets
var MEDIA_PROXY = '//' + location.host + '/media?u=';

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

var hasSeenRateLimitAlert = false;

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
  Applab.makerlabEnabled = level.makerlabEnabled;

  // In share mode we need to reserve some number of pixels for our in-app
  // footer. We do that by making the play space slightly smaller elsewhere.
  // Applab.appHeight represents the height of the entire app (footer + other)
  // Applab.footerlessAppHeight represents the height of only the "other"
  Applab.footerlessAppHeight = applabConstants.APP_HEIGHT - applabConstants.FOOTER_HEIGHT;

  // Override scalars.
  for (var key in level.scale) {
    Applab.scale[key] = level.scale[key];
  }

  if (Applab.makerlabEnabled) {
    Applab.makerlabController = new BoardController();
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
  var divApplab = document.getElementById('divApplab');
  var footerDiv = document.createElement('div');
  footerDiv.setAttribute('id', 'footerDiv');
  divApplab.parentNode.insertBefore(footerDiv, divApplab.nextSibling);

  var menuItems = [
    {
      text: applabMsg.reportAbuse(),
      link: '/report_abuse',
      newWindow: true
    },
    {
      text: applabMsg.makeMyOwnApp(),
      link: '/projects/applab/new',
      hideOnMobile: true
    },
    {
      text: commonMsg.openWorkspace(),
      link: location.href + '/view'
    },
    {
      text: applabMsg.copyright(),
      link: '#',
      copyright: true
    },
    {
      text: applabMsg.privacyPolicy(),
      link: 'https://code.org/privacy',
      newWindow: true
    }
  ];
  if (dom.isMobile()) {
    menuItems = menuItems.filter(function (item) {
      return !item.hideOnMobile;
    });
  }

  ReactDOM.render(React.createElement(window.dashboard.SmallFooter,{
    i18nDropdown: '',
    copyrightInBase: false,
    copyrightStrings: copyrightStrings,
    baseMoreMenuString: applabMsg.builtOnCodeStudio(),
    rowHeight: applabConstants.FOOTER_HEIGHT,
    style: {
      fontSize: 18
    },
    baseStyle: {
      width: $("#divApplab").width(),
      paddingLeft: 0
    },
    className: 'dark',
    menuItems: menuItems,
    phoneFooter: true
  }), footerDiv);
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
  if (debuggerUi) {
    debuggerUi.setStepSpeed(speed);
  }
  Applab.scale.stepSpeed = JsDebuggerUi.stepDelayFromStepSpeed(speed);
};

function getCurrentTickLength() {
  var debugStepDelay;
  if (debuggerUi) {
    // debugStepDelay will be undefined if no speed slider is present
    debugStepDelay = debuggerUi.getStepDelay();
  }
  return debugStepDelay !== undefined ? debugStepDelay : Applab.scale.stepSpeed;
}

function queueOnTick() {
  window.setTimeout(Applab.onTick, getCurrentTickLength());
}

function handleExecutionError(err, lineNumber) {
  outputError(String(err), ErrorLevel.ERROR, lineNumber);
  Applab.executionError = { err: err, lineNumber: lineNumber };

  // complete puzzle, which will prevent further execution
  Applab.onPuzzleComplete();
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
  } else {
    Applab.executeNativeJS();
  }

  if (checkFinished()) {
    Applab.onPuzzleFinish();
  }
};

Applab.executeNativeJS = function () {
  if (Applab.tickCount === 1) {
    try { Applab.whenRunFunc(studioApp, apiBlockly, Applab.Globals); } catch (e) { }
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

function hasSeenDataAlert(channelId) {
  var dataAlerts = localStorage.getItem('dataAlerts');
  if (!dataAlerts) {
    return false;
  }
  var channelIds = JSON.parse(dataAlerts);
  return channelIds.indexOf(channelId) !== -1;
}

function markSeenDataAlert(channelId) {
  var dataAlerts = localStorage.getItem('dataAlerts');
  if (!dataAlerts) {
    dataAlerts = '[]';
  }
  var channelIds = JSON.parse(dataAlerts);
  channelIds.push(channelId);
  localStorage.setItem('dataAlerts', JSON.stringify(channelIds));
}

function onCloseShareWarnings(showStoreDataAlert) {
  // we closed the dialog without hitting too_young
  // Only want to ask about age once across apps
  if (!Applab.user.isSignedIn) {
    utils.trySetLocalStorage('is13Plus', 'true');
  }
  // Only want to ask about storing data once per app.
  if (showStoreDataAlert) {
    markSeenDataAlert(Applab.channelId);
  }
  window.setTimeout(Applab.runButtonClick.bind(studioApp), 0);
}

function handleShareWarningsTooYoung() {
  utils.trySetLocalStorage('is13Plus', 'false');
  window.location.href = '/too_young';
}

/**
 * Starts the app after (potentially) Showing a modal warning about data sharing
 * (if appropriate) and determining user is old enough
 */
Applab.startSharedAppAfterWarnings = function () {
  // dashboard will redirect young signed in users
  var is13Plus = Applab.user.isSignedIn || localStorage.getItem('is13Plus') === "true";
  var showStoreDataAlert = Applab.hasDataStoreAPIs(Applab.getCode()) &&
    !hasSeenDataAlert(Applab.channelId);

  var modal = document.createElement('div');
  document.body.appendChild(modal);

  return ReactDOM.render(<ShareWarningsDialog
    showStoreDataAlert={showStoreDataAlert}
    is13Plus={is13Plus}
    handleClose={onCloseShareWarnings.bind(null, showStoreDataAlert)}
    handleTooYoung={handleShareWarningsTooYoung}/>, modal);
};

/**
 * Look at localStorage to see if we want to show instructions in the top pane.
 */
function showInstructionsInTopPane() {
  // enable instructions in top pane based on query param
  if (/topInstructions=true/.test(location.search)) {
    localStorage.setItem('showInstructionsInTopPane', true);
  }
  // disable instructions in top pane based on query param
  if (/topInstructions=false/.test(location.search)) {
    localStorage.removeItem('showInstructionsInTopPane');
  }
  return !!localStorage.getItem('showInstructionsInTopPane');
}

/**
 * Initialize Blockly and the Applab app.  Called on page load.
 */
Applab.init = function (config) {
  // Gross, but necessary for tests, until we can instantiate AppLab and make
  // this a member variable: Reset this thing until we're ready to create it!
  jsInterpreterLogger = null;
  debuggerUi = null;

  // replace studioApp methods with our own
  studioApp.reset = this.reset.bind(this);
  studioApp.runButtonClick = this.runButtonClick.bind(this);

  Applab.channelId = config.channel;
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
    applabUserId: config.applabUserId,
    isAdmin: (config.isAdmin === true),
    isSignedIn: config.isSignedIn
  };
  Applab.isReadOnlyView = config.readonlyWorkspace;

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

  adjustAppSizeStyles(document.getElementById(config.containerId));

  var showSlider = !config.hideSource && config.level.editCode;
  var showDebugButtons = (!config.hideSource &&
                          config.level.editCode &&
                          !config.level.debuggerDisabled);
  var breakpointsEnabled = !config.level.debuggerDisabled;
  var showDebugConsole = !config.hideSource && config.level.editCode;
  var extraControlRows = '';

  // Construct a logging observer for interpreter events
  if (!config.hideSource) {
    jsInterpreterLogger = new JsInterpreterLogger(window.console);
  }

  if (showDebugButtons || showDebugConsole) {
    debuggerUi = new JsDebuggerUi(Applab.runButtonClick);
    extraControlRows = debuggerUi.getMarkup(studioApp.assetUrl, {
      showButtons: showDebugButtons,
      showConsole: showDebugConsole
    });
  }

  config.loadAudio = function () {
    studioApp.loadAudio(skin.failureSound, 'failure');
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
    // is stored in startHtml, not levelHtml.
    if (Applab.reduxStore.getState().level.isDesignModeHidden) {
      config.level.levelHtml = '';
    }

    // Set designModeViz contents after it is created in configureDom()
    // and sized in drawDiv().
    Applab.setLevelHtml(level.levelHtml || level.startHtml || "");

    if (!!config.level.projectTemplateLevelName) {
      studioApp.displayWorkspaceAlert('warning', <div>{commonMsg.projectWarning()}</div>);
    }

    studioApp.alertIfAbusiveProject('#codeWorkspace');

    // IE9 doesnt support the way we handle responsiveness. Instead, explicitly
    // resize our visualization (user can still resize with grippy)
    if (!utils.browserSupportsCssMedia()) {
      studioApp.resizeVisualization(300);
    }

    if (studioApp.share) {
      Applab.startSharedAppAfterWarnings();
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
    AppStorage.populateTable(level.dataTables, true); // overwrite = true
    AppStorage.populateKeyValue(level.dataProperties, true); // overwrite = true
    studioApp.resetButtonClick();
  };

  // arrangeStartBlocks(config);

  config.twitter = twitterOptions;

  // hide makeYourOwn on the share page
  config.makeYourOwn = false;

  config.varsInGlobals = true;

  config.dropletConfig = dropletConfig;

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

  // Provide a way for us to have top pane instructions disabled by default, but
  // able to turn them on.
  config.showInstructionsInTopPane = showInstructionsInTopPane();

  // Applab.initMinimal();

  AppStorage.populateTable(level.dataTables, false); // overwrite = false
  AppStorage.populateKeyValue(level.dataProperties, false); // overwrite = false

  var generateCodeWorkspaceHtmlFromEjs = function () {
    return codeWorkspaceEjs({
      assetUrl: studioApp.assetUrl,
      data: {
        localeDirection: studioApp.localeDirection(),
        extraControlRows: extraControlRows,
        blockUsed: undefined,
        idealBlockNumber: undefined,
        editCode: level.editCode,
        blockCounterClass: 'block-counter-default',
        pinWorkspaceToBottom: true,
        readonlyWorkspace: Applab.reduxStore.getState().level.isReadOnlyWorkspace
      }
    });
  }.bind(this);

  var generateVisualizationColumnHtmlFromEjs = function () {
    var visualizationElement = (
      <Visualization
        appWidth={Applab.appWidth}
        appHeight={Applab.footerlessAppHeight}/>
    );
    var controlsElement = (
      <Controls
        imgUrl={studioApp.assetUrl('media/1x1.gif')}
        projectLevel={!!level.isProjectLevel}
        submittable={!!level.submittable}
        submitted={!!level.submitted}
      />
    );

    return React.renderToStaticMarkup(
      <VisualizationColumn
          imgUrl={studioApp.assetUrl('media/1x1.gif')}
          visualizationElement={visualizationElement}
          controlsElement={controlsElement}
      />
    );
  }.bind(this);

  var onMount = function () {
    studioApp.init(config);

    var viz = document.getElementById('visualization');
    var vizCol = document.getElementById('visualizationColumn');

    if (!config.noPadding) {
      viz.className += " with_padding";
      vizCol.className += " with_padding";
    }

    if (Applab.reduxStore.getState().level.isEmbedView || config.hideSource) {
      // no responsive styles active in embed or hideSource mode, so set sizes:
      viz.style.width = Applab.appWidth + 'px';
      viz.style.height = (shouldRenderFooter() ? Applab.appHeight : Applab.footerlessAppHeight) + 'px';
      // Use offsetWidth of viz so we can include any possible border width:
      vizCol.style.maxWidth = viz.offsetWidth + 'px';
    }

    if (debuggerUi) {
      debuggerUi.initializeAfterDomCreated({
        defaultStepSpeed: config.level.sliderSpeed
      });
    }

    window.addEventListener('resize', Applab.renderVisualizationOverlay);

    var finishButton = document.getElementById('finishButton');
    if (finishButton) {
      dom.addClickTouchEvent(finishButton, Applab.onPuzzleFinish);
    }

    var submitButton = document.getElementById('submitButton');
    if (submitButton) {
      dom.addClickTouchEvent(submitButton, Applab.onPuzzleSubmit);
    }

    var unsubmitButton = document.getElementById('unsubmitButton');
    if (unsubmitButton) {
      dom.addClickTouchEvent(unsubmitButton, Applab.onPuzzleUnsubmit);
    }

    if (level.editCode) {
      // Prevent the backspace key from navigating back. Make sure it's still
      // allowed on other elements.
      // Based on http://stackoverflow.com/a/2768256/2506748
      $(document).on('keydown', function (event) {
        var doPrevent = false;
        if (event.keyCode !== KeyCodes.BACKSPACE) {
          return;
        }
        var d = event.srcElement || event.target;
        if ((d.tagName.toUpperCase() === 'INPUT' && (
            d.type.toUpperCase() === 'TEXT' ||
            d.type.toUpperCase() === 'PASSWORD' ||
            d.type.toUpperCase() === 'FILE' ||
            d.type.toUpperCase() === 'EMAIL' ||
            d.type.toUpperCase() === 'SEARCH' ||
            d.type.toUpperCase() === 'NUMBER' ||
            d.type.toUpperCase() === 'DATE' )) ||
            d.tagName.toUpperCase() === 'TEXTAREA') {
          doPrevent = d.readOnly || d.disabled;
        } else {
          doPrevent = !d.isContentEditable;
        }

        if (doPrevent) {
          event.preventDefault();
        }
      });

      setupReduxSubscribers(Applab.reduxStore);

      designMode.addKeyboardHandlers();

      designMode.renderDesignWorkspace();

      designMode.loadDefaultScreen();

      designMode.toggleDesignMode(Applab.startInDesignMode());

      designMode.configureDragAndDrop();

      var designModeViz = document.getElementById('designModeViz');
      designModeViz.addEventListener('click', designMode.onDesignModeVizClick);
    }
  }.bind(this);

  // Push initial level properties into the Redux store
  Applab.reduxStore.dispatch(setInitialLevelProps({
    assetUrl: studioApp.assetUrl,
    isDesignModeHidden: !!config.level.hideDesignMode,
    isEmbedView: !!config.embed,
    isReadOnlyWorkspace: !!config.readonlyWorkspace,
    isShareView: !!config.share,
    isViewDataButtonHidden: !!config.level.hideViewDataButton,
    instructionsMarkdown: config.level.markdownInstructions,
    instructionsInTopPane: config.showInstructionsInTopPane,
    puzzleNumber: config.level.puzzle_number,
    stageTotal: config.level.stage_total,
  }));

  Applab.reduxStore.dispatch(changeInterfaceMode(
    Applab.startInDesignMode() ? ApplabInterfaceMode.DESIGN : ApplabInterfaceMode.CODE));

  Applab.reactInitialProps_ = {
    generateCodeWorkspaceHtml: generateCodeWorkspaceHtmlFromEjs,
    generateVisualizationColumnHtml: generateVisualizationColumnHtmlFromEjs,
    onMount: onMount
  };

  Applab.reactMountPoint_ = document.getElementById(config.containerId);

  Applab.render();
};

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
  });
}

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
  var nextProps = $.extend({}, Applab.reactInitialProps_, {
    isEditingProject: window.dashboard && window.dashboard.project.isEditing(),
    screenIds: designMode.getAllScreenIds(),
    onViewDataButton: Applab.onViewData,
    onScreenCreate: designMode.createScreen
  });
  ReactDOM.render(
    <Provider store={Applab.reduxStore}>
      <AppLabView {...nextProps} />
    </Provider>,
    Applab.reactMountPoint_);
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
  // We are _always_ running in share mode.
  // TODO: (bbuchanan) Needs a better condition. Tracked in bug:
  //      https://www.pivotaltracker.com/story/show/105022102
  return !!($('#resetButton').is(':visible') || studioApp.share);
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
 * Reset the app to the start position and kill any pending animation tasks.
 * @param {boolean} first True if an opening animation is to be played.
 */
Applab.reset = function (first) {
  var i;
  Applab.clearEventHandlersKillTickLoop();

  // Reset configurable variables
  Applab.message = null;
  delete Applab.activeCanvas;
  Applab.turtle = {};
  Applab.turtle.heading = 0;
  Applab.turtle.x = Applab.appWidth / 2;
  Applab.turtle.y = Applab.appHeight / 2;
  apiTimeoutList.clearTimeouts();
  apiTimeoutList.clearIntervals();

  var divApplab = document.getElementById('divApplab');
  while (divApplab.firstChild) {
    divApplab.removeChild(divApplab.firstChild);
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

  if (Applab.makerlabController) {
    Applab.makerlabController.reset();
  }

  if (level.showTurtleBeforeRun) {
    applabTurtle.turtleSetVisibility(true);
  }

  Applab.renderVisualizationOverlay();

  // Reset goal successState:
  if (level.goal) {
    level.goal.successState = {};
  }

  if (debuggerUi) {
    debuggerUi.detach();
  }

  if (jsInterpreterLogger) {
    jsInterpreterLogger.detach();
  }

  AppStorage.resetRecordListener();

  // Reset the Globals object used to contain program variables:
  Applab.Globals = {};
  Applab.executionError = null;
  if (Applab.JSInterpreter) {
    Applab.JSInterpreter.deinitialize();
    Applab.JSInterpreter = null;
  }
};

/**
 * Manually re-render visualization SVG overlay.
 * Should call whenever its state/props would change.
 */
Applab.renderVisualizationOverlay = function () {
  var divApplab = document.getElementById('divApplab');
  var designModeViz = document.getElementById('designModeViz');
  var visualizationOverlay = document.getElementById('visualizationOverlay');
  if (!divApplab || !designModeViz || !visualizationOverlay) {
    return;
  }

  // Enable crosshair cursor for divApplab and designModeViz
  $(divApplab).toggleClass('withCrosshair', Applab.isCrosshairAllowed());
  $(designModeViz).toggleClass('withCrosshair', true);

  if (!Applab.visualizationOverlay_) {
    Applab.visualizationOverlay_ = new VisualizationOverlay();
  }

  // Calculate current visualization scale to pass to the overlay component.
  var unscaledWidth = parseInt(visualizationOverlay.getAttribute('width'));
  var scaledWidth = visualizationOverlay.getBoundingClientRect().width;

  Applab.visualizationOverlay_.render(visualizationOverlay, {
    isCrosshairAllowed: Applab.isCrosshairAllowed(),
    scale: scaledWidth / unscaledWidth,
    isInDesignMode: Applab.isInDesignMode()
  });
};

/**
 * Save the app state and trigger any callouts, then call the callback.
 * @param callback {Function}
 */
studioApp.runButtonClickWrapper = function (callback) {
  $(window).trigger('run_button_pressed');
  Applab.serializeAndSave(callback);
};

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
  var runButton = document.getElementById('runButton');
  var resetButton = document.getElementById('resetButton');
  // Ensure that Reset button is at least as wide as Run button.
  if (!resetButton.style.minWidth) {
    resetButton.style.minWidth = runButton.offsetWidth + 'px';
  }
  studioApp.toggleRunReset('reset');
  if (studioApp.isUsingBlockly()) {
    Blockly.mainBlockSpace.traceOn(true);
  }
  Applab.execute();

  // Re-render overlay to update cursor rules.
  Applab.renderVisualizationOverlay();

  // Enable the Finish button if is present:
  var shareCell = document.getElementById('share-cell');
  if (shareCell) {
    shareCell.className = 'share-cell-enabled';
  }


  if (studioApp.editor) {
    logToCloud.addPageAction(logToCloud.PageAction.RunButtonClick, {
      usingBlocks: studioApp.editor.currentlyUsingBlocks,
      app: 'applab'
    }, 1/100);
  }
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

Applab.onSubmitComplete = function (response) {
  window.location.href = response.redirect;
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

//
// Generates code with user-generated function definitions and evals that code
// so these can be called from event handlers. This should be called for each
// block type that defines functions.
//

var defineProcedures = function (blockType) {
  var code = Blockly.Generator.blockSpaceToCode('JavaScript', blockType);
  // TODO: handle editCode JS interpreter
  try {
    codegen.evalWith(code, {
      studioApp: studioApp,
      Applab: apiBlockly,
      Globals: Applab.Globals
    });
  } catch (e) { }
};

/**
 * Execute the app
 */
Applab.execute = function () {
  Applab.result = ResultType.UNSET;
  Applab.testResults = TestResults.NO_TESTS_RUN;
  Applab.waitingForReport = false;
  Applab.response = null;
  var i;

  studioApp.reset(false);
  studioApp.clearAndAttachRuntimeAnnotations();
  studioApp.attempts++;

  // Set event handlers and start the onTick timer

  var codeWhenRun;
  if (level.editCode) {
    codeWhenRun = studioApp.getCode();
  } else {
    // Define any top-level procedures the user may have created
    // (must be after reset(), which resets the Applab.Globals namespace)
    defineProcedures('procedures_defreturn');
    defineProcedures('procedures_defnoreturn');

    var blocks = Blockly.mainBlockSpace.getTopBlocks();
    for (var x = 0; blocks[x]; x++) {
      var block = blocks[x];
      if (block.type === 'when_run') {
        codeWhenRun = Blockly.Generator.blocksToCode('JavaScript', [block]);
        break;
      }
    }
  }
  if (codeWhenRun) {
    if (level.editCode) {
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
      if (debuggerUi) {
        debuggerUi.attachTo(Applab.JSInterpreter);
      }

      // Initialize the interpreter and parse the student code
      Applab.JSInterpreter.parse({
        code: codeWhenRun,
        blocks: dropletConfig.blocks,
        blockFilter: level.executePaletteApisOnly && level.codeFunctions,
        enableEvents: true
      });
      // Maintain a reference here so we can still examine this after we
      // discard the JSInterpreter instance during reset
      Applab.currentExecutionLog = Applab.JSInterpreter.executionLog;
      if (!Applab.JSInterpreter.initialized()) {
        return;
      }
    } else {
      Applab.whenRunFunc = codegen.functionFromCode(codeWhenRun, {
        StudioApp: studioApp,
        Applab: apiBlockly,
        Globals: Applab.Globals
      });
    }
  }

  if (Applab.makerlabController) {
    Applab.makerlabController
        .connectAndInitialize(codegen, Applab.JSInterpreter)
        .then(Applab.beginVisualizationRun);
  } else {
    Applab.beginVisualizationRun();
  }
};

Applab.beginVisualizationRun = function () {
  // Set focus on the default screen so key events can be handled
  // right from the start without requiring the user to adjust focus.
  Applab.loadDefaultScreen();

  Applab.running = true;
  $('#headers').addClass('dimmed');
  $('#codeWorkspace').addClass('dimmed');
  designMode.renderDesignWorkspace();
  queueOnTick();
};

Applab.feedbackImage = '';
Applab.encodedFeedbackImage = '';

Applab.onViewData = function () {
  window.open(
    '//' + utils.getPegasusHost() + '/v3/edit-csp-app/' + Applab.channelId,
    '_blank');
};

/**
 * Handle code/design mode change.
 * @param {ApplabInterfaceMode} mode
 */
function onInterfaceModeChange(mode) {
  if (mode === ApplabInterfaceMode.DESIGN) {
    studioApp.resetButtonClick();
  } else if (mode === ApplabInterfaceMode.CODE) {
    utils.fireResizeEvent();
    if (!Applab.isRunning()) {
      Applab.serializeAndSave();
      var divApplab = document.getElementById('divApplab');
      designMode.parseFromLevelHtml(divApplab, false);
      Applab.changeScreen(Applab.reduxStore.getState().currentScreenId);
    } else {
      Applab.activeScreen().focus();
    }
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

Applab.onPuzzleSubmit = function () {
  Applab.showConfirmationDialog({
    title: commonMsg.submitYourProject(),
    text: commonMsg.submitYourProjectConfirm(),
    onConfirm: function () {
      Applab.onPuzzleComplete(true);
    }
  });
};

Applab.unsubmit = function () {
  $.post(level.unsubmitUrl,
         {"_method": 'PUT', user_level: {submitted: false}},
         function ( data ) {
           location.reload();
         });
};

Applab.onPuzzleUnsubmit = function () {
  Applab.showConfirmationDialog({
    title: commonMsg.unsubmitYourProject(),
    text: commonMsg.unsubmitYourProjectConfirm(),
    onConfirm: function () {
      Applab.unsubmit();
    }
  });
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

  if (level.editCode) {
    // If we want to "normalize" the JavaScript to avoid proliferation of nearly
    // identical versions of the code on the service, we could do either of these:

    // do an acorn.parse and then use escodegen to generate back a "clean" version
    // or minify (uglifyjs) and that or js-beautify to restore a "clean" version

    program = studioApp.getCode();
  } else {
    var xml = Blockly.Xml.blockSpaceToDom(Blockly.mainBlockSpace);
    program = Blockly.Xml.domToText(xml);
  }

  Applab.waitingForReport = true;

  var sendReport = function () {
    studioApp.report({
      app: 'applab',
      level: level.id,
      result: levelComplete,
      testResult: Applab.testResults,
      submitted: submit,
      program: encodeURIComponent(program),
      image: Applab.encodedFeedbackImage,
      onComplete: (submit ? Applab.onSubmitComplete : Applab.onReportComplete)
    });
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
  return $('#designWorkspace').is(':visible');
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
 * Changes the active screen by toggling all screens in divApplab to be non-visible,
 * unless they match the provided screenId. Also focuses the screen.
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

Applab.loadDefaultScreen = function () {
  var defaultScreenId = Applab.getScreens().first().attr('id');
  Applab.changeScreen(defaultScreenId);
};

Applab.getScreens = function () {
  return $('#divApplab > .screen');
};

// Wrap design mode function so that we can call from commands
Applab.updateProperty = function (element, property, value) {
  return designMode.updateProperty(element, property, value);
};

Applab.isCrosshairAllowed = function () {
  return !Applab.isReadOnlyView && !Applab.isRunning();
};

Applab.showRateLimitAlert = function () {
  // only show the alert once per session
  if (hasSeenRateLimitAlert) {
    return false;
  }
  hasSeenRateLimitAlert = true;

  var alert = <div>{applabMsg.dataLimitAlert()}</div>;
  if (studioApp.share) {
    studioApp.displayPlayspaceAlert("error", alert);
  } else {
    studioApp.displayWorkspaceAlert("error", alert);
  }
};
