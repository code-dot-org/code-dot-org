/**
 * CodeOrgApp: Applab
 *
 * Copyright 2014-2015 Code.org
 *
 */
/* global Dialog */
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
var page = require('../templates/page.html.ejs');
var dom = require('../dom');
var parseXmlElement = require('../xml').parseElement;
var utils = require('../utils');
var dropletUtils = require('../dropletUtils');
var dropletConfig = require('./dropletConfig');
var Slider = require('../slider');
var AppStorage = require('./appStorage');
var constants = require('../constants');
var KeyCodes = constants.KeyCodes;
var _ = utils.getLodash();
// var Hammer = utils.getHammer();
var apiTimeoutList = require('../timeoutList');
var annotationList = require('../acemode/annotationList');
var designMode = require('./designMode');
var applabTurtle = require('./applabTurtle');
var applabCommands = require('./commands');
var JSInterpreter = require('../JSInterpreter');
var StepType = JSInterpreter.StepType;
var elementLibrary = require('./designElements/library');
var elementUtils = require('./designElements/elementUtils');
var assetsApi = require('../clientApi').assets;
var assetListStore = require('./assetManagement/assetListStore');
var showAssetManager = require('./assetManagement/show.js');
var DebugArea = require('./DebugArea');

var applabConstants = require('./constants');

var ResultType = studioApp.ResultType;
var TestResults = studioApp.TestResults;

/**
 * Create a namespace for the application.
 */
var Applab = module.exports;

/**
 * Controller for debug console and controls on page
 * TODO: Rename to debugArea once other debugArea references are moved out of
 *       this file.
 * @type {DebugArea}
 */
var debugAreaController = null;

//Debug console history
Applab.debugConsoleHistory = {
  'history': [],
  'currentHistoryIndex': 0
};

var errorHandler = require('./errorHandler');
var outputApplabConsole = errorHandler.outputApplabConsole;
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

var MIN_DEBUG_AREA_HEIGHT = 120;
var MAX_DEBUG_AREA_HEIGHT = 400;

var FOOTER_HEIGHT = applabConstants.FOOTER_HEIGHT;

// The typical width of the visualization area (indepdendent of appWidth)
var vizAppWidth = 400;
// The default values for appWidth and appHeight (if not specified in the level)
var defaultAppWidth = 400;
var defaultAppHeight = 400;

function loadLevel() {
  Applab.hideDesignMode = level.hideDesignMode;
  Applab.timeoutFailureTick = level.timeoutFailureTick || Infinity;
  Applab.minWorkspaceHeight = level.minWorkspaceHeight;
  Applab.softButtons_ = level.softButtons || {};
  Applab.appWidth = level.appWidth || defaultAppWidth;
  Applab.appHeight = level.appHeight || defaultAppHeight;
  // In share mode we need to reserve some number of pixels for our in-app
  // footer. We do that by making the play space slightly smaller elsewhere.
  // Applab.appHeight represents the height of the entire app (footer + other)
  // Applab.footerlessAppHeight represents the height of only the "other"
  if (Applab.appHeight > 480) {
    throw new Error('Strange things may happen with appHeight > 480');
  }
  if (Applab.appHeight + FOOTER_HEIGHT >= 480) {
    // If footer will extend past 480, make room for it.
    Applab.footerlessAppHeight = Applab.appHeight - FOOTER_HEIGHT;
  } else {
    Applab.footerlessAppHeight = Applab.appHeight;
  }

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
  var defaultScaleFactors = [ 1.0, 0.875, 0.75, 0.625, 0.5 ];
  var scaleFactors = defaultScaleFactors.slice(0);
  if (vizAppWidth !== Applab.appWidth) {
    vizScale = vizAppWidth / Applab.appWidth;
    for (var ind = 0; ind < scaleFactors.length; ind++) {
      scaleFactors[ind] *= vizScale;
    }
  }
  var vizAppHeight = Applab.footerlessAppHeight * vizScale;

  // Compute new height rules:
  // (1) defaults are scaleFactors * defaultAppHeight + 200 (belowViz estimate)
  // (2) we adjust the height rules to take into account where the codeApp
  // div is anchored on the page. If this changes after this function is called,
  // the media rules for height are no longer valid.
  // (3) we assume that there is nothing below codeApp on the page that also
  // needs to be included in the height rules
  // (4) there is no 5th height rule in the array because the 5th rule in the
  // stylesheet has no minimum specified. It just uses the max-height from the
  // 4th item in the array.
  var defaultHeightRules = [ 600, 550, 500, 450 ];
  var newHeightRules = defaultHeightRules.slice(0);
  for (var z = 0; z < newHeightRules.length; z++) {
    newHeightRules[z] += container.offsetTop +
        (vizAppHeight - defaultAppHeight) * defaultScaleFactors[z];
  }

  if (!utils.browserSupportsCssMedia()) {
    return;
  }

  var ss = document.styleSheets;
  for (var i = 0; i < ss.length; i++) {
    if (ss[i].href && (ss[i].href.indexOf('applab.css') !== -1)) {
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
          rules[j].style.cssText = "height: " + vizAppHeight +
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
            } else if (childRules[k].selectorText === "div#codeWorkspace") {
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
            } else if (childRules[k].selectorText === "html[dir='rtl'] div#codeWorkspace") {
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
  var divApplab = document.getElementById('divApplab');
  divApplab.style.width = Applab.appWidth + "px";
  divApplab.style.height = Applab.footerlessAppHeight + "px";
  var designModeViz = document.getElementById('designModeViz');
  designModeViz.style.width = Applab.appWidth + "px";
  designModeViz.style.height = Applab.footerlessAppHeight + "px";

  if (studioApp.share) {
    renderFooterInSharedGame();
  }
};

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
      link: '/projects/applab'
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
    menuItems.splice(0, 1); // no make my own app on mobile
  }

  window.dashboard.footer.render(React, {
    i18nDropdown: '',
    copyrightInBase: false,
    copyrightStrings: copyrightStrings,
    baseMoreMenuString: applabMsg.builtOnCodeStudio(),
    rowHeight: FOOTER_HEIGHT,
    style: {
      fontSize: 18
    },
    baseStyle: {
      width: $("#divApplab").width(),
      paddingLeft: 0
    },
    className: 'dark',
    menuItems: menuItems
  }, footerDiv);
}

Applab.stepSpeedFromSliderSpeed = function (sliderSpeed) {
  return 300 * Math.pow(1 - sliderSpeed, 2);
};

function getCurrentTickLength() {
  var stepSpeed = Applab.scale.stepSpeed;
  if (Applab.speedSlider) {
    stepSpeed = Applab.stepSpeedFromSliderSpeed(Applab.speedSlider.getValue());
  }
  return stepSpeed;
}

function queueOnTick() {
  window.setTimeout(Applab.onTick, getCurrentTickLength());
}

function pushDebugConsoleHistory(commandText) {
  Applab.debugConsoleHistory.currentHistoryIndex = Applab.debugConsoleHistory.history.length + 1;
  Applab.debugConsoleHistory.history[Applab.debugConsoleHistory.currentHistoryIndex - 1] = commandText;
}

function updateDebugConsoleHistory(commandText) {
  if (typeof Applab.debugConsoleHistory.history[Applab.debugConsoleHistory.currentHistoryIndex] !== 'undefined') {
    Applab.debugConsoleHistory.history[Applab.debugConsoleHistory.currentHistoryIndex] = commandText;
  }
}

function moveUpDebugConsoleHistory(currentInput) {
  if (Applab.debugConsoleHistory.currentHistoryIndex > 0) {
    Applab.debugConsoleHistory.currentHistoryIndex -= 1;
  }
  if (typeof Applab.debugConsoleHistory.history[Applab.debugConsoleHistory.currentHistoryIndex] !== 'undefined') {
    return Applab.debugConsoleHistory.history[Applab.debugConsoleHistory.currentHistoryIndex];
  }
  return currentInput;
}

function moveDownDebugConsoleHistory(currentInput) {
  if (Applab.debugConsoleHistory.currentHistoryIndex < Applab.debugConsoleHistory.history.length) {
    Applab.debugConsoleHistory.currentHistoryIndex += 1;
  }
  if (Applab.debugConsoleHistory.currentHistoryIndex == Applab.debugConsoleHistory.history.length &&
      currentInput == Applab.debugConsoleHistory.history[Applab.debugConsoleHistory.currentHistoryIndex - 1]) {
    return '';
  }
  if (typeof Applab.debugConsoleHistory.history[Applab.debugConsoleHistory.currentHistoryIndex] !== 'undefined') {
    return Applab.debugConsoleHistory.history[Applab.debugConsoleHistory.currentHistoryIndex];
  }
  return currentInput;
}

function onDebugInputKeyDown(e) {
  var input = e.target.textContent;
  if (e.keyCode === KeyCodes.ENTER) {
    e.preventDefault();
    pushDebugConsoleHistory(input);
    e.target.textContent = '';
    outputApplabConsole('> ' + input);
    if (Applab.JSInterpreter) {
      var currentScope = Applab.JSInterpreter.interpreter.getScope();
      var evalInterpreter = new window.Interpreter(input);
      // Set console scope to the current scope of the running program

      // NOTE: we are being a little tricky here (we are re-running
      // part of the Interpreter constructor with a different interpreter's
      // scope)
      evalInterpreter.populateScope_(evalInterpreter.ast, currentScope);
      evalInterpreter.stateStack = [{
          node: evalInterpreter.ast,
          scope: currentScope,
          thisExpression: currentScope
      }];
      // Copy these properties directly into the evalInterpreter so the .isa()
      // method behaves as expected
      ['ARRAY', 'BOOLEAN', 'DATE', 'FUNCTION', 'NUMBER', 'OBJECT', 'STRING',
        'UNDEFINED'].forEach(
        function (prop) {
          evalInterpreter[prop] = Applab.JSInterpreter.interpreter[prop];
        });
      try {
        evalInterpreter.run();
        outputApplabConsole('< ' + String(evalInterpreter.value));
      }
      catch (err) {
        outputApplabConsole('< ' + String(err));
      }
    } else {
      outputApplabConsole('< (not running)');
    }
  }
  if (e.keyCode === KeyCodes.UP) {
    updateDebugConsoleHistory(input);
    e.target.textContent = moveUpDebugConsoleHistory(input);
  }
  if (e.keyCode === KeyCodes.DOWN) {
    updateDebugConsoleHistory(input);
    e.target.textContent = moveDownDebugConsoleHistory(input);
  }
}

function handleExecutionError(err, lineNumber) {
  if (!lineNumber && err instanceof SyntaxError) {
    // syntax errors came before execution (during parsing), so we need
    // to determine the proper line number by looking at the exception
    lineNumber = err.loc.line;
    // Now select this location in the editor, since we know we didn't hit
    // this while executing (in which case, it would already have been selected)
    codegen.selectEditorRowColError(studioApp.editor, lineNumber - 1, err.loc.column);
  }
  if (Applab.JSInterpreter) {
    // Select code that just executed:
    Applab.JSInterpreter.selectCurrentCode("ace_error");
    // Grab line number if we don't have one already:
    if (!lineNumber) {
      lineNumber = 1 + Applab.JSInterpreter.getNearestUserCodeLine();
    }
  }
  outputError(String(err), ErrorLevel.ERROR, lineNumber);
  Applab.executionError = { err: err, lineNumber: lineNumber };

  // NOTE: We call onPuzzleComplete() here only when we hit syntax errors,
  // because we can't enter the onTick loop when the interpreter didn't
  // parse the program and instantiate properly.
  // In the future, we may want to call it on non freeplay-levels to handle
  // runtime errors (as part of level validation):
  if (err instanceof SyntaxError) {
    Applab.onPuzzleComplete();
  }
}

Applab.getCode = function () {
  return studioApp.editor.getValue();
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

Applab.onTick = function() {
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
Applab.initReadonly = function(config) {
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
Applab.init = function(config) {
  // replace studioApp methods with our own
  studioApp.reset = this.reset.bind(this);
  studioApp.runButtonClick = this.runButtonClick.bind(this);

  // Pre-populate asset list
  if (window.dashboard && dashboard.project.getCurrentId()) {
    assetsApi.ajax('GET', '', function (xhr) {
      assetListStore.reset(JSON.parse(xhr.responseText));
    }, function () {
      // Unable to load asset list
    });
  }

  Applab.clearEventHandlersKillTickLoop();
  skin = config.skin;
  skin.smallStaticAvatar = null;
  skin.staticAvatar = null;
  level = config.level;
  copyrightStrings = config.copyrightStrings;
  Applab.user = {
    applabUserId: config.applabUserId,
    isAdmin: (config.isAdmin === true)
  };

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
  var firstControlsRow = require('./controls.html.ejs')({
    assetUrl: studioApp.assetUrl,
    showSlider: showSlider,
    finishButton: (!level.isProjectLevel && !level.submittable),
    submitButton: level.submittable
  });
  var extraControlsRow = require('./extraControlRows.html.ejs')({
    assetUrl: studioApp.assetUrl,
    debugButtons: showDebugButtons,
    debugConsole: showDebugConsole
  });

  config.html = page({
    assetUrl: studioApp.assetUrl,
    data: {
      localeDirection: studioApp.localeDirection(),
      visualization: require('./visualization.html.ejs')(),
      controls: firstControlsRow,
      extraControlRows: extraControlsRow,
      blockUsed: undefined,
      idealBlockNumber: undefined,
      editCode: level.editCode,
      blockCounterClass: 'block-counter-default',
      pinWorkspaceToBottom: true,
      // TODO (brent) - seems a little gross that we've made this part of a
      // template shared across all apps
      hasDesignMode: true,
      readonlyWorkspace: config.readonlyWorkspace
    }
  });

  config.loadAudio = function() {
    studioApp.loadAudio(skin.winSound, 'win');
    studioApp.loadAudio(skin.failureSound, 'failure');
  };

  config.afterInject = function() {
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
    if (config.level.hideDesignMode) {
      config.level.levelHtml = '';
    }

    // Set designModeViz contents after it is created in configureDom()
    // and sized in drawDiv().
    Applab.setLevelHtml(level.levelHtml || level.startHtml || "");

    studioApp.alertIfAbusiveProject('#codeWorkspace');

    // IE9 doesnt support the way we handle responsiveness. Instead, explicitly
    // resize our visualization (user can still resize with grippy)
    if (!utils.browserSupportsCssMedia()) {
      studioApp.resizeVisualization(300);
    }
  };

  config.afterEditorReady = function() {
    // Set up an event handler to create breakpoints when clicking in the
    // ace gutter:
    var aceEditor = studioApp.editor.aceEditor;

    if (breakpointsEnabled) {
      studioApp.editor.on('guttermousedown', function(e) {
        var bps = studioApp.editor.getBreakpoints();
        if (bps[e.line]) {
          studioApp.editor.clearBreakpoint(e.line);
        } else {
          studioApp.editor.setBreakpoint(e.line);
        }
      });
    }

    if (studioApp.share) {
      // automatically run in share mode:
      window.setTimeout(Applab.runButtonClick.bind(studioApp), 0);
    }
  };

  config.afterClearPuzzle = function() {
    designMode.resetIds();
    Applab.setLevelHtml(config.level.startHtml || '');
    AppStorage.populateTable(level.dataTables, true); // overwrite = true
    AppStorage.populateKeyValue(level.dataProperties, true); // overwrite = true
    studioApp.resetButtonClick();
    annotationList.clearRuntimeAnnotations();
  };

  // arrangeStartBlocks(config);

  config.twitter = twitterOptions;

  // hide makeYourOwn on the share page
  config.makeYourOwn = false;

  config.varsInGlobals = true;
  config.noButtonsBelowOnMobileShare = true;

  config.dropletConfig = dropletConfig;
  config.pinWorkspaceToBottom = true;

  config.vizAspectRatio = Applab.appWidth / Applab.footerlessAppHeight;
  config.nativeVizWidth = Applab.appWidth;

  config.appMsg = applabMsg;

  // Since the app width may not be 400, set this value in the config to
  // ensure that the viewport is set up properly for scaling it up/down
  config.mobileNoPaddingShareWidth = config.level.appWidth;

  // Applab.initMinimal();

  AppStorage.populateTable(level.dataTables, false); // overwrite = false
  AppStorage.populateKeyValue(level.dataProperties, false); // overwrite = false
  studioApp.init(config);

  var viz = document.getElementById('visualization');
  var vizCol = document.getElementById('visualizationColumn');

  if (!config.noPadding) {
    viz.className += " with_padding";
    vizCol.className += " with_padding";
  }

  if (config.embed || config.hideSource) {
    // no responsive styles active in embed or hideSource mode, so set sizes:
    viz.style.width = Applab.appWidth + 'px';
    viz.style.height = Applab.appHeight + 'px';
    // Use offsetWidth of viz so we can include any possible border width:
    vizCol.style.maxWidth = viz.offsetWidth + 'px';
  }

  debugAreaController = new DebugArea(
      document.getElementById('debug-area'),
      document.getElementById('codeTextbox'));

  if (level.editCode) {
    // Initialize the slider.
    var slider = document.getElementById('applab-slider');
    if (slider) {
      var sliderXOffset = 10,
          sliderYOffset = 22,
          sliderWidth = 130;
      Applab.speedSlider = new Slider(sliderXOffset, sliderYOffset, sliderWidth,
          slider);

      // Change default speed (eg Speed up levels that have lots of steps).
      if (config.level.sliderSpeed) {
        Applab.speedSlider.setValue(config.level.sliderSpeed);
      }
    }
    var debugInput = document.getElementById('debug-input');
    if (debugInput) {
      debugInput.addEventListener('keydown', onDebugInputKeyDown);
    }
  }

  var debugResizeBar = document.getElementById('debugResizeBar');
  if (debugResizeBar) {
    dom.addMouseDownTouchEvent(debugResizeBar,
                               Applab.onMouseDownDebugResizeBar);
    // Can't use dom.addMouseUpTouchEvent() because it will preventDefault on
    // all touchend events on the page, breaking click events...
    document.body.addEventListener('mouseup', Applab.onMouseUpDebugResizeBar);
    var mouseUpTouchEventName = dom.getTouchEventName('mouseup');
    if (mouseUpTouchEventName) {
      document.body.addEventListener(mouseUpTouchEventName,
                                     Applab.onMouseUpDebugResizeBar);
    }
  }

  var finishButton = document.getElementById('finishButton');
  if (finishButton) {
    dom.addClickTouchEvent(finishButton, Applab.onPuzzleFinish);
  }

  var submitButton = document.getElementById('submitButton');
  if (submitButton) {
    dom.addClickTouchEvent(submitButton, Applab.onPuzzleSubmit);
  }

  if (level.editCode) {

    var clearButton = document.getElementById('clear-console-header');
    if (clearButton) {
      dom.addClickTouchEvent(clearButton, clearDebugOutput);
    }
    var pauseButton = document.getElementById('pauseButton');
    var continueButton = document.getElementById('continueButton');
    var stepInButton = document.getElementById('stepInButton');
    var stepOverButton = document.getElementById('stepOverButton');
    var stepOutButton = document.getElementById('stepOutButton');
    if (pauseButton && continueButton && stepInButton && stepOverButton && stepOutButton) {
      dom.addClickTouchEvent(pauseButton, Applab.onPauseContinueButton);
      dom.addClickTouchEvent(continueButton, Applab.onPauseContinueButton);
      dom.addClickTouchEvent(stepInButton, Applab.onStepInButton);
      dom.addClickTouchEvent(stepOverButton, Applab.onStepOverButton);
      dom.addClickTouchEvent(stepOutButton, Applab.onStepOutButton);
    }

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
      }
      else {
        doPrevent = !d.isContentEditable;
      }

      if (doPrevent) {
        event.preventDefault();
      }
    });

    designMode.addKeyboardHandlers();

    designMode.renderDesignWorkspace();

    designMode.configureDesignToggleRow();

    designMode.toggleDesignMode(Applab.startInDesignMode());

    designMode.configureDragAndDrop();

    var designModeViz = document.getElementById('designModeViz');
    designModeViz.addEventListener('click', designMode.onDesignModeVizClick);
  }
};

Applab.appendToEditor = function(newCode) {
  var code = studioApp.editor.addEmptyLine(studioApp.editor.getValue()) + newCode;
  studioApp.editor.setValue(code);
};

Applab.onMouseDownDebugResizeBar = function (event) {
  // When we see a mouse down in the resize bar, start tracking mouse moves:

  if (event.srcElement.id === 'debugResizeBar') {
    Applab.draggingDebugResizeBar = true;
    document.body.addEventListener('mousemove', Applab.onMouseMoveDebugResizeBar);
    Applab.mouseMoveTouchEventName = dom.getTouchEventName('mousemove');
    if (Applab.mouseMoveTouchEventName) {
      document.body.addEventListener(Applab.mouseMoveTouchEventName,
                                     Applab.onMouseMoveDebugResizeBar);
    }

    event.preventDefault();
  }
};

/**
*  Handle mouse moves while dragging the debug resize bar.
*/
Applab.onMouseMoveDebugResizeBar = function (event) {
  var debugResizeBar = document.getElementById('debugResizeBar');
  var codeApp = document.getElementById('codeApp');
  var codeTextbox = document.getElementById('codeTextbox');
  var debugArea = document.getElementById('debug-area');

  var rect = debugResizeBar.getBoundingClientRect();
  var offset = (parseInt(window.getComputedStyle(codeApp).bottom, 10) || 0) -
               rect.height / 2;
  var newDbgHeight = Math.max(MIN_DEBUG_AREA_HEIGHT,
                       Math.min(MAX_DEBUG_AREA_HEIGHT,
                                (window.innerHeight - event.pageY) - offset));

  if (debugAreaController.isShut()) {
    debugAreaController.snapOpen();
  }

  codeTextbox.style.bottom = newDbgHeight + 'px';
  debugArea.style.height = newDbgHeight + 'px';

  // Fire resize so blockly and droplet handle this type of resize properly:
  utils.fireResizeEvent();
};

Applab.onMouseUpDebugResizeBar = function (event) {
  // If we have been tracking mouse moves, remove the handler now:
  if (Applab.draggingDebugResizeBar) {
    document.body.removeEventListener('mousemove', Applab.onMouseMoveDebugResizeBar);
    if (Applab.mouseMoveTouchEventName) {
      document.body.removeEventListener(Applab.mouseMoveTouchEventName,
                                        Applab.onMouseMoveDebugResizeBar);
    }
    Applab.draggingDebugResizeBar = false;
  }
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

  var spinner = document.getElementById('running-spinner');
  if (spinner) {
    spinner.style.display = 'none';
  }

  var pausedIcon = document.getElementById('paused-icon');
  if (pausedIcon) {
    pausedIcon.style.display = 'none';
  }

  var pauseButton = document.getElementById('pauseButton');
  var continueButton = document.getElementById('continueButton');
  var stepInButton = document.getElementById('stepInButton');
  var stepOverButton = document.getElementById('stepOverButton');
  var stepOutButton = document.getElementById('stepOutButton');
  if (pauseButton && continueButton && stepInButton && stepOverButton && stepOutButton) {
    pauseButton.style.display = "inline-block";
    pauseButton.disabled = true;
    continueButton.style.display = "none";
    stepInButton.disabled = true;
    stepOverButton.disabled = true;
    stepOutButton.disabled = true;
  }
};

Applab.isRunning = function () {
  // We are _always_ running in share mode.
  // TODO: (bbuchanan) Needs a better condition. Tracked in bug:
  //      https://www.pivotaltracker.com/story/show/105022102
  return $('#resetButton').is(':visible') || studioApp.share;
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
 * Reset the app to the start position and kill any pending animation tasks.
 * @param {boolean} first True if an opening animation is to be played.
 */
Applab.reset = function(first) {
  var i;
  Applab.clearEventHandlersKillTickLoop();

  // Soft buttons
  var softButtonCount = 0;
  for (i = 0; i < Applab.softButtons_.length; i++) {
    document.getElementById(Applab.softButtons_[i]).style.display = 'inline';
    softButtonCount++;
  }
  if (softButtonCount) {
    var softButtonsCell = document.getElementById('soft-buttons');
    softButtonsCell.className = 'soft-buttons-' + softButtonCount;
  }

  // Reset configurable variables
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

  var isDesigning = Applab.isInDesignMode() && !Applab.isRunning();
  Applab.toggleDivApplab(!isDesigning);
  designMode.parseFromLevelHtml(newDivApplab, false);
  if (Applab.isInDesignMode()) {
    designMode.resetElementTray(isDesigning);
    designMode.resetPropertyTab();
  }

  if (level.showTurtleBeforeRun) {
    applabTurtle.turtleSetVisibility(true);
  }

  // Reset goal successState:
  if (level.goal) {
    level.goal.successState = {};
  }

  if (level.editCode) {
    // Reset the pause button:
    var pauseButton = document.getElementById('pauseButton');
    var continueButton = document.getElementById('continueButton');
    var stepInButton = document.getElementById('stepInButton');
    var stepOverButton = document.getElementById('stepOverButton');
    var stepOutButton = document.getElementById('stepOutButton');
    if (pauseButton && continueButton && stepInButton && stepOverButton && stepOutButton) {
      pauseButton.style.display = "inline-block";
      pauseButton.disabled = true;
      continueButton.style.display = "none";
      stepInButton.disabled = false;
      stepOverButton.disabled = true;
      stepOutButton.disabled = true;
    }
    var spinner = document.getElementById('running-spinner');
    if (spinner) {
      spinner.style.display = 'none';
    }
    var pausedIcon = document.getElementById('paused-icon');
    if (pausedIcon) {
      pausedIcon.style.display = 'none';
    }
    clearDebugOutput();
    clearDebugInput();
  }

  // Reset the Globals object used to contain program variables:
  Applab.Globals = {};
  Applab.executionError = null;
  Applab.JSInterpreter = null;
};

/**
 * Empty the contents of the debug console scrollback area.
 */
function clearDebugOutput() {
  var debugOutput = document.getElementById('debug-output');
  if (debugOutput) {
    debugOutput.textContent = '';
  }
}

/**
 * Empty the debug console input area.
 */
function clearDebugInput() {
  var debugInput = document.getElementById('debug-input');
  if (debugInput) {
    debugInput.textContent = '';
  }
}

// TODO(dave): remove once channel id is passed in appOptions.
/**
 * If channel id has not yet been loaded, delays calling of the callback
 * until the saveProject response comes back. Otherwise, calls the callback
 * directly.
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
  // Behave like other apps when not editing a project or channel id is present.
  if (!window.dashboard || !window.dashboard.project.isEditing() ||
      window.dashboard.project.getCurrentId()) {
    $(window).trigger('appModeChanged');
    if (callback) {
      callback();
    }
  } else {
    // Otherwise, makes sure we don't hit our callback until after we've created
    // a channel
    $(window).trigger('appModeChanged', callback);
  }
};

/**
 * Click the run button.  Start the program.
 */
// XXX This is the only method used by the templates!
Applab.runButtonClick = function() {
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
  studioApp.reset(false);
  studioApp.attempts++;
  Applab.execute();

  // Enable the Finish button if is present:
  var shareCell = document.getElementById('share-cell');
  if (shareCell) {
    shareCell.className = 'share-cell-enabled';
  }
};

/**
 * App specific displayFeedback function that calls into
 * studioApp.displayFeedback when appropriate
 */
var displayFeedback = function() {
  if (!Applab.waitingForReport) {
    studioApp.displayFeedback({
      app: 'applab', //XXX
      skin: skin.id,
      feedbackType: Applab.testResults,
      executionError: Applab.executionError,
      response: Applab.response,
      level: level,
      showingSharing: level.freePlay,
      feedbackImage: Applab.feedbackImage,
      twitter: twitterOptions,
      // allow users to save freeplay levels to their gallery (impressive non-freeplay levels are autosaved)
      saveToGalleryUrl: level.freePlay && Applab.response && Applab.response.save_to_gallery_url,
      appStrings: {
        reinfFeedbackMsg: applabMsg.reinfFeedbackMsg(),
        sharingText: applabMsg.shareGame()
      }
    });
  }
};

Applab.onSubmitComplete = function(response) {
  window.location.href = response.redirect;
};

/**
 * Function to be called when the service report call is complete
 * @param {object} JSON response (if available)
 */
Applab.onReportComplete = function(response) {
  Applab.response = response;
  Applab.waitingForReport = false;
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
  try { codegen.evalWith(code, {
                         studioApp: studioApp,
                         Applab: apiBlockly,
                         Globals: Applab.Globals } ); } catch (e) { }
};

/**
 * Execute the app
 */
Applab.execute = function() {
  Applab.result = ResultType.UNSET;
  Applab.testResults = TestResults.NO_TESTS_RUN;
  Applab.waitingForReport = false;
  Applab.response = null;
  var i;

  studioApp.reset(false);

  // Set event handlers and start the onTick timer

  var codeWhenRun;
  if (level.editCode) {
    codeWhenRun = studioApp.editor.getValue();
    // Our ace worker also calls attachToSession, but it won't run on IE9:
    var session = studioApp.editor.aceEditor.getSession();
    annotationList.attachToSession(session, studioApp.editor);
    annotationList.clearRuntimeAnnotations();
  } else {
    // Define any top-level procedures the user may have created
    // (must be after reset(), which resets the Applab.Globals namespace)
    defineProcedures('procedures_defreturn');
    defineProcedures('procedures_defnoreturn');

    var blocks = Blockly.mainBlockSpace.getTopBlocks();
    for (var x = 0; blocks[x]; x++) {
      var block = blocks[x];
      if (block.type === 'when_run') {
        codeWhenRun = Blockly.Generator.blocksToCode('JavaScript', [ block ]);
        break;
      }
    }
  }
  if (codeWhenRun) {
    if (level.editCode) {
      // Use JS interpreter on editCode levels
      Applab.JSInterpreter = new JSInterpreter({
          code: codeWhenRun,
          blocks: dropletConfig.blocks,
          enableEvents: true,
          studioApp: studioApp,
          shouldRunAtMaxSpeed: function() { return getCurrentTickLength() === 0; },
          maxInterpreterStepsPerTick: MAX_INTERPRETER_STEPS_PER_TICK,
          onNextStepChanged: Applab.updatePauseUIState,
          onPause: Applab.onPauseContinueButton,
          onExecutionError: handleExecutionError,
          onExecutionWarning: outputApplabConsole
      });
      if (!Applab.JSInterpreter.initialized()) {
          return;
      }
    } else {
      Applab.whenRunFunc = codegen.functionFromCode(codeWhenRun, {
                                          StudioApp: studioApp,
                                          Applab: apiBlockly,
                                          Globals: Applab.Globals } );
    }
  }

  if (level.editCode) {
    var pauseButton = document.getElementById('pauseButton');
    var continueButton = document.getElementById('continueButton');
    var stepInButton = document.getElementById('stepInButton');
    var stepOverButton = document.getElementById('stepOverButton');
    var stepOutButton = document.getElementById('stepOutButton');
    if (pauseButton && continueButton && stepInButton && stepOverButton && stepOutButton) {
      pauseButton.style.display = "inline-block";
      pauseButton.disabled = false;
      continueButton.style.display = "none";
      stepInButton.disabled = true;
      stepOverButton.disabled = true;
      stepOutButton.disabled = true;
    }
    var spinner = document.getElementById('running-spinner');
    if (spinner) {
      spinner.style.display = 'inline-block';
    }
    var pausedIcon = document.getElementById('paused-icon');
    if (pausedIcon) {
      pausedIcon.style.display = 'none';
    }
  }

  // Set focus on the default screen so key events can be handled
  // right from the start without requiring the user to adjust focus.
  Applab.loadDefaultScreen();

  Applab.running = true;
  $('#headers').addClass('dimmed');
  $('#codeWorkspace').addClass('dimmed');
  designMode.renderDesignWorkspace();
  queueOnTick();
};

Applab.onPauseContinueButton = function() {
  if (Applab.running) {
    // We have code and are either running or paused
    if (Applab.JSInterpreter.paused &&
        Applab.JSInterpreter.nextStep === StepType.RUN) {
      Applab.JSInterpreter.paused = false;
    } else {
      Applab.JSInterpreter.paused = true;
      Applab.JSInterpreter.nextStep = StepType.RUN;
    }
    Applab.updatePauseUIState();
    var stepInButton = document.getElementById('stepInButton');
    var stepOverButton = document.getElementById('stepOverButton');
    var stepOutButton = document.getElementById('stepOutButton');
    stepInButton.disabled = !Applab.JSInterpreter.paused;
    stepOverButton.disabled = !Applab.JSInterpreter.paused;
    stepOutButton.disabled = !Applab.JSInterpreter.paused;
  }
};

Applab.updatePauseUIState = function() {
  var pauseButton = document.getElementById('pauseButton');
  var continueButton = document.getElementById('continueButton');
  var spinner = document.getElementById('running-spinner');
  var pausedIcon = document.getElementById('paused-icon');

  if (pauseButton && continueButton && spinner && pausedIcon) {
    if (Applab.JSInterpreter.paused &&
        Applab.JSInterpreter.nextStep === StepType.RUN) {
      pauseButton.style.display = "none";
      continueButton.style.display = "inline-block";
      spinner.style.display = 'none';
      pausedIcon.style.display = 'inline-block';
    } else {
      pauseButton.style.display = "inline-block";
      continueButton.style.display = "none";
      spinner.style.display = 'inline-block';
      pausedIcon.style.display = 'none';
    }
  }
};

Applab.onStepOverButton = function() {
  if (Applab.running) {
    Applab.JSInterpreter.paused = true;
    Applab.JSInterpreter.nextStep = StepType.OVER;
    Applab.updatePauseUIState();
  }
};

Applab.onStepInButton = function() {
  if (!Applab.running) {
    Applab.runButtonClick();
    Applab.onPauseContinueButton();
  }
  Applab.JSInterpreter.paused = true;
  Applab.JSInterpreter.nextStep = StepType.IN;
  Applab.updatePauseUIState();
};

Applab.onStepOutButton = function() {
  if (Applab.running) {
    Applab.JSInterpreter.paused = true;
    Applab.JSInterpreter.nextStep = StepType.OUT;
    Applab.updatePauseUIState();
  }
};

Applab.feedbackImage = '';
Applab.encodedFeedbackImage = '';

Applab.onViewData = function() {
  window.open(
    '//' + utils.getPegasusHost() + '/v3/edit-csp-app/' + AppStorage.getChannelId(),
    '_blank');
};

Applab.onDesignModeButton = function() {
  designMode.toggleDesignMode(true);
  studioApp.resetButtonClick();
};

Applab.onCodeModeButton = function() {
  designMode.toggleDesignMode(false);
  utils.fireResizeEvent();
  if (!Applab.isRunning()) {
    Applab.serializeAndSave();
    var divApplab = document.getElementById('divApplab');
    designMode.parseFromLevelHtml(divApplab, false);
    Applab.changeScreen(designMode.getCurrentScreenId());
  } else {
    Applab.activeScreen().focus();
  }
};

var HTTP_REGEXP = new RegExp('^http://');

/**
 * If the filename is relative (contains no slashes), then prepend
 * the path to the assets directory for this project to the filename.
 *
 * If the filename URL is absolute and non-https, route it through the
 * MEDIA_PROXY.
 * @param {string} filename
 * @returns {string}
 */
Applab.maybeAddAssetPathPrefix = function (filename) {

  if (HTTP_REGEXP.test(filename)) {
    return MEDIA_PROXY + encodeURIComponent(filename);
  }

  filename = filename || '';
  if (filename.indexOf('/') !== -1) {
    return filename;
  }

  var channelId = dashboard && dashboard.project.getCurrentId();
  // TODO(dave): remove this check once we always have a channel id.
  if (!channelId) {
    return filename;
  }

  return '/v3/assets/' + channelId + '/'  + filename;
};

Applab.showSubmitConfirmation = function() {
  var contentDiv = document.createElement('div');
  contentDiv.innerHTML = '<p class="dialog-title">' + commonMsg.submitYourProject() + '</p>' +
      '<p>' + commonMsg.submitYourProjectConfirm() + '</p>';

  var buttons = document.createElement('div');
  buttons.innerHTML = require('../templates/buttons.html.ejs')({
    data: {
      confirmText: commonMsg.dialogOK(),
      cancelText: commonMsg.dialogCancel()
    }
  });
  contentDiv.appendChild(buttons);

  var dialog = studioApp.createModalDialog({
    Dialog: Dialog,
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
      Applab.onPuzzleComplete(true);
      dialog.hide();
    });
  }

  dialog.show();
};

Applab.onPuzzleSubmit = function() {
  Applab.showSubmitConfirmation();
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
  var levelComplete = (Applab.result === ResultType.SUCCESS);

  if (Applab.executionError) {
    Applab.testResults = studioApp.getTestResults(levelComplete, {
        executionError: Applab.executionError
    });
  } else {
    if (submit) {
      Applab.testResults = TestResults.SUBMITTED;
    } else {
      Applab.testResults = TestResults.FREE_PLAY;
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

    program = studioApp.editor.getValue();
  } else {
    var xml = Blockly.Xml.blockSpaceToDom(Blockly.mainBlockSpace);
    program = Blockly.Xml.domToText(xml);
  }

  Applab.waitingForReport = true;

  var sendReport = function() {
    studioApp.report({
      app: 'applab',
      level: level.id,
      result: levelComplete,
      testResult: Applab.testResults,
      program: encodeURIComponent(program),
      image: Applab.encodedFeedbackImage,
      onComplete: (submit ? Applab.onSubmitComplete : Applab.onReportComplete)
    });
  };

  if (typeof document.getElementById('divApplab').toDataURL === 'undefined') { // don't try it if function is not defined
    sendReport();
  } else {
    document.getElementById('divApplab').toDataURL("image/png", {
      callback: function(pngDataUrl) {
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

Applab.timedOut = function() {
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

Applab.hideDesignModeToggle = function () {
  return !!level.hideDesignMode || !!studioApp.share;
};

Applab.hideViewDataButton = function () {
  var isEditing = window.dashboard && window.dashboard.project.isEditing();
  return !!level.hideViewDataButton || !!level.hideDesignMode || !!studioApp.share || !isEditing;
};

Applab.isInDesignMode = function () {
  return $('#designWorkspace').is(':visible');
};

function quote(str) {
  return '"' + str + '"';
}

/**
 * Returns a list of options (optionally filtered by type) for code-mode
 * asset dropdowns.
 */
Applab.getAssetDropdown = function (typeFilter) {
  var options = assetListStore.list(typeFilter).map(function (asset) {
    return {
      text: quote(asset.filename),
      display: quote(asset.filename)
    };
  });
  var handleChooseClick = function (callback) {
    showAssetManager(function (filename) {
      callback(quote(filename));
    }, typeFilter);
  };
  options.push({
    display: '<span class="chooseAssetDropdownOption">Choose...</a>',
    click: handleChooseClick
  });
  return options;
};

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
  var divApplabChildren = documentRoot.find('#divApplab').children();
  var elements = divApplabChildren.toArray().concat(
      divApplabChildren.children().toArray());

  // Return all elements when no filter is given
  if (filterSelector) {
    elements = $(elements).filter(filterSelector).get();
  }

  return elements
      .sort(function (elementA, elementB) {
        return elementA.id < elementB.id ? -1 : 1;
      })
      .map(function (element) {
        return {
          text: quote(element.id),
          display: quote(element.id)
        };
      });
};

/**
 * @returns {HTMLElement} The first "screen" that isn't hidden.
 */
Applab.activeScreen = function () {
  return $('#divApplab .screen').filter(function () {
    return this.style.display !== 'none';
  }).first()[0];
};

/**
 * Changes the active screen by toggling all screens in divApplab to be non-visible,
 * unless they match the provided screenId. Also focuses the screen.
 */
Applab.changeScreen = function(screenId) {
  $('#divApplab .screen').each(function () {
    $(this).toggle(this.id === screenId);
    if ((this.id === screenId)) {
      // Allow the active screen to receive keyboard events.
      this.focus();
    }
  });
};

Applab.loadDefaultScreen = function() {
  var defaultScreen = $('#divApplab .screen').first().attr('id');
  Applab.changeScreen(defaultScreen);
};
