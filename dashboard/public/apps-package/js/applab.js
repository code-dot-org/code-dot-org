require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/home/ubuntu/staging/apps/build/js/applab/main.js":[function(require,module,exports){
(function (global){
var appMain = require('../appMain');
window.Applab = require('./applab');
if (typeof global !== 'undefined') {
  global.Applab = window.Applab;
}
var blocks = require('./blocks');
var levels = require('./levels');
var skins = require('./skins');

window.applabMain = function(options) {
  options.skinsModule = skins;
  options.blocksModule = blocks;
  appMain(window.Applab, levels, options);
};


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../appMain":"/home/ubuntu/staging/apps/build/js/appMain.js","./applab":"/home/ubuntu/staging/apps/build/js/applab/applab.js","./blocks":"/home/ubuntu/staging/apps/build/js/applab/blocks.js","./levels":"/home/ubuntu/staging/apps/build/js/applab/levels.js","./skins":"/home/ubuntu/staging/apps/build/js/applab/skins.js"}],"/home/ubuntu/staging/apps/build/js/applab/skins.js":[function(require,module,exports){
/**
 * Load Skin for Applab.
 */

var skinsBase = require('../skins');

var CONFIGS = {
  applab: {
  }
};

exports.load = function(assetUrl, id) {
  var skin = skinsBase.load(assetUrl, id);
  var config = CONFIGS[skin.id];

  return skin;
};


},{"../skins":"/home/ubuntu/staging/apps/build/js/skins.js"}],"/home/ubuntu/staging/apps/build/js/applab/levels.js":[function(require,module,exports){
/*jshint multistr: true */

var msg = require('./locale');
var utils = require('../utils');
var blockUtils = require('../block_utils');
var tb = blockUtils.createToolbox;
var blockOfType = blockUtils.blockOfType;
var createCategory = blockUtils.createCategory;

/*
 * Configuration for all levels.
 */
var levels = module.exports = {};

levels.simple = {
  'requiredBlocks': [
  ],
  'scale': {
    'snapRadius': 2
  },
  'freePlay': true,
  'toolbox':
      tb('<block type="applab_container" inline="true"> \
        <value name="ID"><block type="text"><title name="TEXT">id</title></block></value> \
        <value name="HTML"><block type="text"><title name="TEXT">html</title></block></value></block>'),
  'startBlocks':
   '<block type="when_run" deletable="false" x="20" y="20"></block>'
};

levels.custom = {
  'freePlay': true,
  'editCode': true,
  'sliderSpeed': 0.95,
  'appWidth': 320,
  'appHeight': 480,

  /**
   * This is the default set of functions available to us if the levelbuilder
   * leaves codeFunctions blank.
   * Applab.rb self.palette serves a similar function, intially providing
   * levelbuilders with the text for the default set of blocks.
   * These two places shouldbe kept in sync
   */
  'codeFunctions': {
    // UI Controls
    "onEvent": null,
    "button": null,
    "textInput": null,
    "textLabel": null,
    "dropdown": null,
    "getText": null,
    "setText": null,
    "checkbox": null,
    "radioButton": null,
    "getChecked": null,
    "setChecked": null,
    "image": null,
    "getImageURL": null,
    "setImageURL": null,
    "playSound": null,
    "showElement": null,
    "hideElement": null,
    "deleteElement": null,
    "setPosition": null,
    "setSize": null,
    "write": null,
    "getXPosition": null,
    "getYPosition": null,
    "setScreen": null,

    // Canvas
    "createCanvas": null,
    "setActiveCanvas": null,
    "line": null,
    "circle": null,
    "rect": null,
    "setStrokeWidth": null,
    "setStrokeColor": null,
    "setFillColor": null,
    "drawImage": null,
    "getImageData": null,
    "putImageData": null,
    "clearCanvas": null,
    "getRed": null,
    "getGreen": null,
    "getBlue": null,
    "getAlpha": null,
    "setRed": null,
    "setGreen": null,
    "setBlue": null,
    "setAlpha": null,
    "setRGB": null,

    // Data
    "startWebRequest": null,
    "setKeyValue": null,
    "getKeyValue": null,
    "createRecord": null,
    "readRecords": null,
    "updateRecord": null,
    "deleteRecord": null,
    "getUserId": null,
    "drawChartFromRecords": null,

    // Turtle
    "moveForward": null,
    "moveBackward": null,
    "move": null,
    "moveTo": null,
    "dot": null,
    "turnRight": null,
    "turnLeft": null,
    "turnTo": null,
    "arcRight": null,
    "arcLeft": null,
    "getX": null,
    "getY": null,
    "getDirection": null,
    "penUp": null,
    "penDown": null,
    "penWidth": null,
    "penColor": null,
    "penRGB": null,
    "show": null,
    "hide": null,
    "speed": null,

    // Control
    "forLoop_i_0_4": null,
    "ifBlock": null,
    "ifElseBlock": null,
    "whileBlock": null,
    "setTimeout": null,
    "clearTimeout": null,
    "setInterval": null,
    "clearInterval": null,
    "getTime": null,

    // Math
    "addOperator": null,
    "subtractOperator": null,
    "multiplyOperator": null,
    "divideOperator": null,
    "equalityOperator": null,
    "inequalityOperator": null,
    "greaterThanOperator": null,
    "lessThanOperator": null,
    "andOperator": null,
    "orOperator": null,
    "notOperator": null,
    "randomNumber_min_max": null,
    "mathRound": null,
    "mathAbs": null,
    "mathMax": null,
    "mathMin": null,
    "mathRandom": null,

    // Variables
    "declareAssign_x": null,
    "declareNoAssign_x": null,
    "assign_x": null,
    "declareAssign_x_prompt": null,
    "declareAssign_x_promptNum": null,
    "console.log": null,
    "declareAssign_str_hello_world": null,
    "substring": null,
    "indexOf": null,
    "includes": null,
    "length": null,
    "toUpperCase": null,
    "toLowerCase": null,
    "declareAssign_list_abd": null,
    "listLength": null,
    "insertItem": null,
    "appendItem": null,
    "removeItem": null,

    // Functions
    "functionParams_none": null,
    "functionParams_n": null,
    "callMyFunction": null,
    "callMyFunction_n": null,
    "return": null,
  },

  // "randomNumber_max": null, // DEPRECATED
};

levels.ec_simple = utils.extend(levels.custom, {
});

// Functions in Advanced category currently disabled in all levels:
/*
 "imageUploadButton": null,
 "container": null,
 "innerHTML": null,
 "setStyle": null,
 "getAttribute": null,
 "setAttribute": null,
 "setParent": null,
*/

levels.full_sandbox =  {
  'scrollbars' : true,
  'requiredBlocks': [
  ],
  'scale': {
    'snapRadius': 2
  },
  'softButtons': [
    'leftButton',
    'rightButton',
    'downButton',
    'upButton'
  ],
  'minWorkspaceHeight': 1400,
  'freePlay': true,
  'toolbox':
    tb(createCategory(
        msg.catActions(),
        '<block type="applab_createHtmlBlock" inline="true"> \
          <value name="ID"><block type="text"><title name="TEXT">id</title></block></value> \
          <value name="HTML"><block type="text"><title name="TEXT">html</title></block></value></block>') +
       createCategory(msg.catControl(),
                        blockOfType('controls_whileUntil') +
                       '<block type="controls_for"> \
                          <value name="FROM"> \
                            <block type="math_number"> \
                              <title name="NUM">1</title> \
                            </block> \
                          </value> \
                          <value name="TO"> \
                            <block type="math_number"> \
                              <title name="NUM">10</title> \
                            </block> \
                          </value> \
                          <value name="BY"> \
                            <block type="math_number"> \
                              <title name="NUM">1</title> \
                            </block> \
                          </value> \
                        </block>' +
                        blockOfType('controls_flow_statements')) +
       createCategory(msg.catLogic(),
                        blockOfType('controls_if') +
                        blockOfType('logic_compare') +
                        blockOfType('logic_operation') +
                        blockOfType('logic_negate') +
                        blockOfType('logic_boolean')) +
       createCategory(msg.catMath(),
                        blockOfType('math_number') +
                       '<block type="math_change"> \
                          <value name="DELTA"> \
                            <block type="math_number"> \
                              <title name="NUM">1</title> \
                            </block> \
                          </value> \
                        </block>' +
                       '<block type="math_random_int"> \
                          <value name="FROM"> \
                            <block type="math_number"> \
                              <title name="NUM">1</title> \
                            </block> \
                          </value> \
                          <value name="TO"> \
                            <block type="math_number"> \
                              <title name="NUM">100</title> \
                            </block> \
                          </value> \
                        </block>' +
                        blockOfType('math_arithmetic')) +
       createCategory(msg.catText(),
                        blockOfType('text') +
                        blockOfType('text_join') +
                       '<block type="text_append"> \
                          <value name="TEXT"> \
                            <block type="text"></block> \
                          </value> \
                        </block>') +
       createCategory(msg.catVariables(), '', 'VARIABLE') +
       createCategory(msg.catProcedures(), '', 'PROCEDURE')),
  'startBlocks':
   '<block type="when_run" deletable="false" x="20" y="20"></block>'
};


},{"../block_utils":"/home/ubuntu/staging/apps/build/js/block_utils.js","../utils":"/home/ubuntu/staging/apps/build/js/utils.js","./locale":"/home/ubuntu/staging/apps/build/js/applab/locale.js"}],"/home/ubuntu/staging/apps/build/js/applab/applab.js":[function(require,module,exports){
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
var ShareWarningsDialog = require('../templates/ShareWarningsDialog.jsx');

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
var dropletConfigBlocks;

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
      link: '/projects/applab',
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

/**
 * @param {string} code The code to search for Data Storage APIs
 * @return {boolean} True if the code uses any data storage APIs
 */
Applab.hasDataStoreAPIs = function (code) {
  return /createRecord/.test(code) || /updateRecord/.test(code) ||
    /setKeyValue/.test(code);
};

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
  return React.render(React.createElement(ShareWarningsDialog, {
    showStoreDataAlert: showStoreDataAlert,
    is13Plus: is13Plus,
    handleClose: function () {
      // we closed the dialog without hitting too_young
      // Only want to ask about age once across apps
      if (!Applab.user.isSignedIn) {
        localStorage.setItem('is13Plus', 'true');
      }
      // Only want to ask about storing data once per app.
      if (showStoreDataAlert) {
        markSeenDataAlert(Applab.channelId);
      }
      window.setTimeout(Applab.runButtonClick.bind(studioApp), 0);
    },
    handleTooYoung: function () {
      localStorage.setItem('is13Plus', 'false');
      window.location.href = '/too_young';
    }
  }), modal);
};

/**
 * Initialize Blockly and the Applab app.  Called on page load.
 */
Applab.init = function(config) {
  // replace studioApp methods with our own
  studioApp.reset = this.reset.bind(this);
  studioApp.runButtonClick = this.runButtonClick.bind(this);

  Applab.channelId = config.channel;

  // Pre-populate asset list
  assetsApi.ajax('GET', '', function (xhr) {
    assetListStore.reset(JSON.parse(xhr.responseText));
  }, function () {
    // Unable to load asset list
  });

  Applab.clearEventHandlersKillTickLoop();
  skin = config.skin;
  skin.smallStaticAvatar = null;
  skin.staticAvatar = null;
  level = config.level;
  copyrightStrings = config.copyrightStrings;
  Applab.user = {
    applabUserId: config.applabUserId,
    isAdmin: (config.isAdmin === true),
    isSignedIn: config.isSignedIn
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
    submitButton: level.submittable && !level.submitted,
    unsubmitButton: level.submittable && level.submitted
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

    if (studioApp.share) {
      Applab.startSharedAppAfterWarnings();
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

  // filter blocks to exclude anything that isn't in code functions if
  // autocompletePaletteApisOnly is true
  dropletConfigBlocks = dropletConfig.blocks.filter(function (block) {
    return !(config.level.executePaletteApisOnly &&
      config.level.codeFunctions[block.func] === undefined);
  });

  config.dropletConfig = $.extend({}, dropletConfig, {
    blocks: dropletConfigBlocks
  });

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

  var unsubmitButton = document.getElementById('unsubmitButton');
  if (unsubmitButton) {
    dom.addClickTouchEvent(unsubmitButton, Applab.onPuzzleUnsubmit);
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
    codeWhenRun = studioApp.getCode();
    if (!studioApp.hideSource) {
      // Our ace worker also calls attachToSession, but it won't run on IE9:
      var session = studioApp.editor.aceEditor.getSession();
      annotationList.attachToSession(session, studioApp.editor);
      annotationList.clearRuntimeAnnotations();
    }
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
        blocks: dropletConfigBlocks,
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
        Globals: Applab.Globals
      });
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
    '//' + utils.getPegasusHost() + '/v3/edit-csp-app/' + Applab.channelId,
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

  return '/v3/assets/' + Applab.channelId + '/'  + filename;
};

/**
 * Show a modal dialog with a title, text, and OK and Cancel buttons
 * @param {title}
 * @param {text}
 * @param {callback} [onConfirm] what to do when the user clicks OK
 * @param {string} [filterSelector] Optional selector to filter for.
 */

Applab.showConfirmationDialog = function(config) {
  config.text = config.text || "";
  config.title = config.title || "";

  var contentDiv = document.createElement('div');
  contentDiv.innerHTML = '<p class="dialog-title">' + config.title + '</p>' +
      '<p>' + config.text + '</p>';

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
      if (config.onConfirm) {
        config.onConfirm();
      }
      dialog.hide();
    });
  }

  dialog.show();
};

Applab.onPuzzleSubmit = function() {
  Applab.showConfirmationDialog({
    title: commonMsg.submitYourProject(),
    text: commonMsg.submitYourProjectConfirm(),
    onConfirm: function() {
      Applab.onPuzzleComplete(true);
    }
  });
};

Applab.unsubmit = function() {
  $.post(level.unsubmitUrl,
         {"_method": 'PUT', user_level: {best_result: 1}},
         function( data ) {
           location.reload();
         });
};

Applab.onPuzzleUnsubmit = function() {
  Applab.showConfirmationDialog({
    title: commonMsg.unsubmitYourProject(),
    text: commonMsg.unsubmitYourProjectConfirm(),
    onConfirm: function() {
      Applab.unsubmit();
    }
  });
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

    program = studioApp.getCode();
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


},{"../JSInterpreter":"/home/ubuntu/staging/apps/build/js/JSInterpreter.js","../StudioApp":"/home/ubuntu/staging/apps/build/js/StudioApp.js","../acemode/annotationList":"/home/ubuntu/staging/apps/build/js/acemode/annotationList.js","../clientApi":"/home/ubuntu/staging/apps/build/js/clientApi.js","../codegen":"/home/ubuntu/staging/apps/build/js/codegen.js","../constants":"/home/ubuntu/staging/apps/build/js/constants.js","../dom":"/home/ubuntu/staging/apps/build/js/dom.js","../dropletUtils":"/home/ubuntu/staging/apps/build/js/dropletUtils.js","../locale":"/home/ubuntu/staging/apps/build/js/locale.js","../skins":"/home/ubuntu/staging/apps/build/js/skins.js","../slider":"/home/ubuntu/staging/apps/build/js/slider.js","../templates/ShareWarningsDialog.jsx":"/home/ubuntu/staging/apps/build/js/templates/ShareWarningsDialog.jsx","../templates/buttons.html.ejs":"/home/ubuntu/staging/apps/build/js/templates/buttons.html.ejs","../templates/page.html.ejs":"/home/ubuntu/staging/apps/build/js/templates/page.html.ejs","../timeoutList":"/home/ubuntu/staging/apps/build/js/timeoutList.js","../utils":"/home/ubuntu/staging/apps/build/js/utils.js","../xml":"/home/ubuntu/staging/apps/build/js/xml.js","./DebugArea":"/home/ubuntu/staging/apps/build/js/applab/DebugArea.js","./api":"/home/ubuntu/staging/apps/build/js/applab/api.js","./apiBlockly":"/home/ubuntu/staging/apps/build/js/applab/apiBlockly.js","./appStorage":"/home/ubuntu/staging/apps/build/js/applab/appStorage.js","./applabTurtle":"/home/ubuntu/staging/apps/build/js/applab/applabTurtle.js","./assetManagement/assetListStore":"/home/ubuntu/staging/apps/build/js/applab/assetManagement/assetListStore.js","./assetManagement/show.js":"/home/ubuntu/staging/apps/build/js/applab/assetManagement/show.js","./blocks":"/home/ubuntu/staging/apps/build/js/applab/blocks.js","./commands":"/home/ubuntu/staging/apps/build/js/applab/commands.js","./constants":"/home/ubuntu/staging/apps/build/js/applab/constants.js","./controls.html.ejs":"/home/ubuntu/staging/apps/build/js/applab/controls.html.ejs","./designElements/elementUtils":"/home/ubuntu/staging/apps/build/js/applab/designElements/elementUtils.js","./designElements/library":"/home/ubuntu/staging/apps/build/js/applab/designElements/library.js","./designMode":"/home/ubuntu/staging/apps/build/js/applab/designMode.js","./dontMarshalApi":"/home/ubuntu/staging/apps/build/js/applab/dontMarshalApi.js","./dropletConfig":"/home/ubuntu/staging/apps/build/js/applab/dropletConfig.js","./errorHandler":"/home/ubuntu/staging/apps/build/js/applab/errorHandler.js","./extraControlRows.html.ejs":"/home/ubuntu/staging/apps/build/js/applab/extraControlRows.html.ejs","./locale":"/home/ubuntu/staging/apps/build/js/applab/locale.js","./visualization.html.ejs":"/home/ubuntu/staging/apps/build/js/applab/visualization.html.ejs"}],"/home/ubuntu/staging/apps/build/js/templates/ShareWarningsDialog.jsx":[function(require,module,exports){
var ShareWarnings = require('./ShareWarnings.jsx');

/**
 * Modal for our SharingWarnings.
 */
var SharingWarningsDialog = module.exports = React.createClass({displayName: "exports",
  propTypes: {
    is13Plus: React.PropTypes.bool.isRequired,
    showStoreDataAlert: React.PropTypes.bool.isRequired,
    handleClose: React.PropTypes.func.isRequired,
    handleTooYoung: React.PropTypes.func.isRequired
  },

  getInitialState: function() {
    return { modalIsOpen: !this.props.is13Plus || this.props.showStoreDataAlert };
  },

  componentDidMount: function () {
    // We didn't need to show our modal. Go through the close process so that
    // app becomes unblocked
    if (!this.state.modalIsOpen) {
      this.handleClose();
    }
  },

  handleClose: function() {
    this.setState({modalIsOpen: false});
    this.props.handleClose();
  },

  render: function () {
    if (!this.state.modalIsOpen) {
      return React.createElement("div", null);
    }

    var styles = {
      main: {
        position: 'absolute',
        top: 50,
        left: '50%',
        transform: 'translate(-50%, 0)',
        WebkitTransform: 'translate(-50%, 0)',
        border: '1px solid #ccc',
        background: '#fff',
        overflow: 'auto',
        WebkitOverflowScrolling: 'touch',
        borderRadius: '4px',
        outline: 'none',
        padding: '20px',
        zIndex: 1050, // based off of behavior in dashboard's dialog.js
        width: window.screen.width < 500 ? '80%' : undefined
      },
      overlay: {
        position: 'fixed',
        opacity: 0.8,
        backgroundColor: 'black',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        zIndex: 1040 // based off of behavior in dashboard's dialog.js
      }
    };

    return (
      React.createElement("div", null, 
        React.createElement("div", {style: styles.overlay}), 
        React.createElement("div", {style: styles.main}, 
          React.createElement(ShareWarnings, {
            is13Plus: this.props.is13Plus, 
            showStoreDataAlert: this.props.showStoreDataAlert, 
            handleTooYoung: this.props.handleTooYoung, 
            handleClose: this.handleClose})
        )
      )
    );
  }
});


},{"./ShareWarnings.jsx":"/home/ubuntu/staging/apps/build/js/templates/ShareWarnings.jsx"}],"/home/ubuntu/staging/apps/build/js/templates/ShareWarnings.jsx":[function(require,module,exports){
var colors = require('../sharedJsxStyles').colors;
var AgeDropdown = require('./AgeDropdown.jsx');

var commonMsg = require('../locale');

/**
 * Dialog contents for when you visit a shared Applab page. If not signed in,
 * it will ask your age. If the app stores data, it will also alert you to
 * that.
 */
var SharingWarnings = module.exports = React.createClass({displayName: "exports",
  propTypes: {
    is13Plus: React.PropTypes.bool.isRequired,
    showStoreDataAlert: React.PropTypes.bool.isRequired,
    handleClose: React.PropTypes.func.isRequired,
    handleTooYoung: React.PropTypes.func.isRequired
  },

  handleOk: function() {
    if (this.props.is13Plus) {
      this.props.handleClose();
      return;
    }

    var ageElement = React.findDOMNode(this.refs.age);
    if (ageElement.value === '') {
      // ignore close if we haven't selected a value from dropdown
      return;
    }

    var age = parseInt(ageElement.value, 10);
    if (age >= 13) {
      this.props.handleClose();
    } else {
      this.props.handleTooYoung();
    }
  },

  render: function () {
    var styles = {
      dataMessage: {
        fontSize: 18,
        marginBottom: 30
      },
      ageMessage: {
        fontSize: 18,
        marginBottom: 10
      },
      ageDropdown: {

      },
      moreInfo: {
        marginLeft: 0
      },
      ok: {
        backgroundColor: colors.orange,
        border: '1px solid ' + colors.orange,
        color: colors.white,
        float: 'right'
      }
    };

    var i18n = {
      storeDataMsg: commonMsg.shareWarningsStoreData(),
      ageMsg: commonMsg.shareWarningsAge(),
      moreInfo: commonMsg.shareWarningsMoreInfo(),
      ok: commonMsg.dialogOK()
    };

    var dataPrompt, agePrompt;
    if (this.props.showStoreDataAlert) {
      dataPrompt = React.createElement("div", {style: styles.dataMessage}, i18n.storeDataMsg);
    }
    if (!this.props.is13Plus) {
      agePrompt = React.createElement("div", null, 
        React.createElement("div", {style: styles.ageMessage}, i18n.ageMsg), 
        React.createElement(AgeDropdown, {style: styles.ageDropdonw, ref: "age"})
      );
    }

    return (
      React.createElement("div", null, 
        dataPrompt, 
        agePrompt, 
        React.createElement("div", null, 
          React.createElement("a", {style: styles.moreInfo, target: "_blank", href: "https://code.org/privacy"}, i18n.moreInfo), 
          React.createElement("button", {style: styles.ok, onClick: this.handleOk}, i18n.ok)
        )
      )
    );
  }
});


},{"../locale":"/home/ubuntu/staging/apps/build/js/locale.js","../sharedJsxStyles":"/home/ubuntu/staging/apps/build/js/sharedJsxStyles.js","./AgeDropdown.jsx":"/home/ubuntu/staging/apps/build/js/templates/AgeDropdown.jsx"}],"/home/ubuntu/staging/apps/build/js/templates/AgeDropdown.jsx":[function(require,module,exports){
/**
 * A dropdown with the set of ages we use across our site (4-20, 21+)
 * NOTE: this is pretty similarly to a component in dashboard's
 * report_abuse_form.jsx. In an ideal world, we would have a better way of
 * sharing components between dashboard/apps and have any difference between
 * the two version controlled by props.
 */
module.exports = React.createClass({displayName: "exports",
  propTypes: {
    style: React.PropTypes.object
  },

  render: function () {
    var ages = ['', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14',
      '15', '16', '17', '18', '19', '20', '21+'];

    return (
      React.createElement("select", {name: "age", style: this.props.style}, 
        ages.map(function (age) {
          return React.createElement("option", {key: age, value: age}, age);
        })
      )
    );
  }
});


},{}],"/home/ubuntu/staging/apps/build/js/sharedJsxStyles.js":[function(require,module,exports){
/**
 * A place to share styles for use in inline jsx. There may be value in keeping
 * this in sync with some of our .scss files, in particular when it comes to
 * colors
 */

module.exports = {
  colors: {
    green: '#b9bf15',
    white: 'white',
    orange: '#ffa400'
  }
};


},{}],"/home/ubuntu/staging/apps/build/js/applab/visualization.html.ejs":[function(require,module,exports){
module.exports= (function() {
  var t = function anonymous(locals, filters, escape) {
escape = escape || function (html){
  return String(html)
    .replace(/&(?!\w+;)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
};
var buf = [];
with (locals || {}) { (function(){ 
 buf.push('<div id="divApplab" class="appModern" tabindex="1">\n</div>\n<div id="designModeViz" class="appModern" style="display:none;">\n</div>\n'); })();
} 
return buf.join('');
};
  return function(locals) {
    return t(locals, require("ejs").filters);
  }
}());
},{"ejs":"/home/ubuntu/staging/apps/node_modules/ejs/lib/ejs.js"}],"/home/ubuntu/staging/apps/build/js/applab/extraControlRows.html.ejs":[function(require,module,exports){
module.exports= (function() {
  var t = function anonymous(locals, filters, escape) {
escape = escape || function (html){
  return String(html)
    .replace(/&(?!\w+;)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
};
var buf = [];
with (locals || {}) { (function(){ 
 buf.push('');1; var msg = require('../locale') ; buf.push('\n');2; var applabMsg = require('./locale') ; buf.push('\n\n<div id="debug-area">\n  <div id="debugResizeBar" class="fa fa-ellipsis-h"></div>\n  <div id="debug-area-header">\n    <span class="header-text">', escape((7,  applabMsg.debugConsoleHeader() )), '</span>\n    <i id="show-hide-debug-icon" class="fa fa-chevron-circle-down"></i>\n    ');9; if (debugButtons) { ; buf.push('\n    <div id="debug-commands-header" class="workspace-header">\n      <i id="running-spinner" style="display: none;" class="fa fa-spinner fa-spin"></i>\n      <i id="paused-icon" style="display: none;" class="fa fa-pause"></i>\n      <span class="header-text">', escape((13,  applabMsg.debugCommandsHeaderWhenOpen() )), '</span>\n    </div>\n    <div id="clear-console-header" class="workspace-header workspace-header-button"><span><i class="fa fa-eraser"></i>Clear</span></div>\n    ');16; } ; buf.push('\n    <div id="slider-cell" style="margin-left: ', escape((17,  debugButtons ? 0 : 40 )), 'px">\n      <svg id="applab-slider"\n           xmlns="http://www.w3.org/2000/svg"\n           xmlns:svg="http://www.w3.org/2000/svg"\n           xmlns:xlink="http://www.w3.org/1999/xlink"\n           version="1.1"\n           width="150"\n           height="28">\n          <!-- Slow icon. -->\n          <clipPath id="slowClipPath">\n            <rect width=26 height=12 x=5 y=6 />\n          </clipPath>\n          <image xlink:href="', escape((29,  assetUrl('media/applab/turtle_icons.png') )), '" height=42 width=84 x=-21 y=-18\n              clip-path="url(#slowClipPath)" />\n          <!-- Fast icon. -->\n          <clipPath id="fastClipPath">\n            <rect width=26 height=16 x=120 y=2 />\n          </clipPath>\n          <image xlink:href="', escape((35,  assetUrl('media/applab/turtle_icons.png') )), '" height=42 width=84 x=120 y=-19\n              clip-path="url(#fastClipPath)" />\n      </svg>\n    </div>\n  </div>\n\n  ');41; if (debugButtons) { ; buf.push('\n  <div id="debug-commands" class="debug-commands">\n    <div id="debug-buttons">\n      <button id="pauseButton" class="debugger_button">\n        <img src="', escape((45,  assetUrl('media/1x1.gif') )), '" class="pause-btn icon21">\n        ', escape((46,  applabMsg.pause() )), '\n      </button>\n      <button id="continueButton" class="debugger_button">\n        <img src="', escape((49,  assetUrl('media/1x1.gif') )), '" class="continue-btn icon21">\n        ', escape((50,  applabMsg.continue() )), '\n      </button>\n      <button id="stepOverButton" class="debugger_button">\n        <img src="', escape((53,  assetUrl('media/1x1.gif') )), '" class="step-over-btn icon21">\n        ', escape((54,  applabMsg.stepOver() )), '\n      </button>\n      <button id="stepOutButton" class="debugger_button">\n        <img src="', escape((57,  assetUrl('media/1x1.gif') )), '" class="step-out-btn icon21">\n        ', escape((58,  applabMsg.stepOut() )), '\n      </button>\n      <button id="stepInButton" class="debugger_button">\n        <img src="', escape((61,  assetUrl('media/1x1.gif') )), '" class="step-in-btn icon21">\n        ', escape((62,  applabMsg.stepIn() )), '\n      </button>\n    </div>\n  </div>\n  ');66; } ; buf.push('\n  ');67; if (debugConsole) { ; buf.push('\n  <div id="debug-console" class="debug-console ', escape((68,  debugButtons ? '' : 'full' )), '">\n    <div id="debug-output" class="debug-output"></div>\n    <span class="debug-input-prompt">\n      &gt;\n    </span>\n    <div contenteditable spellcheck="false" id="debug-input" class="debug-input"></div>\n  </div>\n  ');75; } ; buf.push('\n</div>\n'); })();
} 
return buf.join('');
};
  return function(locals) {
    return t(locals, require("ejs").filters);
  }
}());
},{"../locale":"/home/ubuntu/staging/apps/build/js/locale.js","./locale":"/home/ubuntu/staging/apps/build/js/applab/locale.js","ejs":"/home/ubuntu/staging/apps/node_modules/ejs/lib/ejs.js"}],"/home/ubuntu/staging/apps/build/js/applab/dropletConfig.js":[function(require,module,exports){
var api = require('./api');
var dontMarshalApi = require('./dontMarshalApi');
var consoleApi = require('./consoleApi');
var showAssetManager = require('../applab/assetManagement/show.js');
var ChartApi = require('./ChartApi');
var elementUtils = require('./designElements/elementUtils');

var applabConstants = require('./constants');

var DEFAULT_WIDTH = "320";
var DEFAULT_HEIGHT = (480 - applabConstants.FOOTER_HEIGHT).toString();

// Flip the argument order so we can bind `typeFilter`.
function chooseAsset(typeFilter, callback) {
  showAssetManager(callback, typeFilter);
}

var COLOR_LIGHT_GREEN = '#D3E965';
var COLOR_BLUE = '#19C3E1';
var COLOR_RED = '#F78183';
var COLOR_CYAN = '#4DD0E1';
var COLOR_YELLOW = '#FFF176';

/**
 * Generate a list of screen ids for our setScreen dropdown
 */
function getScreenIds() {
  var ret = $("#designModeViz .screen").map(function () {
    return '"' + elementUtils.getId(this) + '"';
  });

  // Convert from jQuery's array-like object to a true array
  return $.makeArray(ret);
}

// NOTE : format of blocks detailed at top of apps/src/dropletUtils.js

module.exports.blocks = [
  {func: 'onEvent', parent: api, category: 'UI controls', paletteParams: ['id','type','callback'], params: ['"id"', '"click"', "function(event) {\n  \n}"], dropdown: { 0: function () { return Applab.getIdDropdown(); }, 1: [ '"click"', '"change"', '"keyup"', '"keydown"', '"keypress"', '"mousemove"', '"mousedown"', '"mouseup"', '"mouseover"', '"mouseout"', '"input"' ] } },
  {func: 'button', parent: api, category: 'UI controls', paletteParams: ['id','text'], params: ['"id"', '"text"'] },
  {func: 'textInput', parent: api, category: 'UI controls', paletteParams: ['id','text'], params: ['"id"', '"text"'] },
  {func: 'textLabel', parent: api, category: 'UI controls', paletteParams: ['id','text','forId'], params: ['"id"', '"text"'] },
  {func: 'dropdown', parent: api, category: 'UI controls', paletteParams: ['id','option1','etc'], params: ['"id"', '"option1"', '"etc"'] },
  {func: 'getText', parent: api, category: 'UI controls', paletteParams: ['id'], params: ['"id"'], dropdown: { 0: function () { return Applab.getIdDropdown(); } }, type: 'value' },
  {func: 'setText', parent: api, category: 'UI controls', paletteParams: ['id','text'], params: ['"id"', '"text"'], dropdown: { 0: function () { return Applab.getIdDropdown(); } } },
  {func: 'checkbox', parent: api, category: 'UI controls', paletteParams: ['id','checked'], params: ['"id"', "false"], dropdown: { 1: [ "true", "false" ] } },
  {func: 'radioButton', parent: api, category: 'UI controls', paletteParams: ['id','checked'], params: ['"id"', "false", '"group"'], dropdown: { 1: [ "true", "false" ] } },
  {func: 'getChecked', parent: api, category: 'UI controls', paletteParams: ['id'], params: ['"id"'], type: 'value' },
  {func: 'setChecked', parent: api, category: 'UI controls', paletteParams: ['id','checked'], params: ['"id"', "true"], dropdown: { 1: [ "true", "false" ] } },
  {func: 'image', parent: api, category: 'UI controls', paletteParams: ['id','url'], params: ['"id"', '"https://code.org/images/logo.png"'], dropdown: { 1: function () { return Applab.getAssetDropdown('image'); } }, 'assetTooltip': { 1: chooseAsset.bind(null, 'image') } },
  {func: 'getImageURL', parent: api, category: 'UI controls', paletteParams: ['id'], params: ['"id"'], dropdown: { 0: function () { return Applab.getIdDropdown("img"); } }, type: 'value' },
  {func: 'setImageURL', parent: api, category: 'UI controls', paletteParams: ['id','url'], params: ['"id"', '"https://code.org/images/logo.png"'], dropdown: { 0: function () { return Applab.getIdDropdown("img"); }, 1: function () { return Applab.getAssetDropdown('image'); } }, 'assetTooltip': { 1: chooseAsset.bind(null, 'image') } },
  {func: 'playSound', parent: api, category: 'UI controls', paletteParams: ['url'], params: ['"https://studio.code.org/blockly/media/skins/studio/1_goal.mp3"'], dropdown: { 0: function () { return Applab.getAssetDropdown('audio'); } }, 'assetTooltip': { 0: chooseAsset.bind(null, 'audio') } },
  {func: 'showElement', parent: api, category: 'UI controls', paletteParams: ['id'], params: ['"id"'], dropdown: { 0: function () { return Applab.getIdDropdown(); } } },
  {func: 'hideElement', parent: api, category: 'UI controls', paletteParams: ['id'], params: ['"id"'], dropdown: { 0: function () { return Applab.getIdDropdown(); } } },
  {func: 'deleteElement', parent: api, category: 'UI controls', paletteParams: ['id'], params: ['"id"'], dropdown: { 0: function () { return Applab.getIdDropdown(); } } },
  {func: 'setPosition', parent: api, category: 'UI controls', paletteParams: ['id','x','y','width','height'], params: ['"id"', "0", "0", "100", "100"], dropdown: { 0: function () { return Applab.getIdDropdown(); } } },
  {func: 'setSize', parent: api, category: 'UI controls', paletteParams: ['id','width','height'], params: ['"id"', "100", "100"], dropdown: { 0: function () { return Applab.getIdDropdown(); } } },
  {func: 'write', parent: api, category: 'UI controls', paletteParams: ['text'], params: ['"text"'] },
  {func: 'getXPosition', parent: api, category: 'UI controls', paletteParams: ['id'], params: ['"id"'], dropdown: { 0: function () { return Applab.getIdDropdown(); } }, type: 'value' },
  {func: 'getYPosition', parent: api, category: 'UI controls', paletteParams: ['id'], params: ['"id"'], dropdown: { 0: function () { return Applab.getIdDropdown(); } }, type: 'value' },
  {func: 'setScreen', parent: api, category: 'UI controls', paletteParams: ['screenId'], params: ['"screen1"'], dropdown: { 0: getScreenIds }},

  {func: 'createCanvas', parent: api, category: 'Canvas', paletteParams: ['id','width','height'], params: ['"id"', DEFAULT_WIDTH, DEFAULT_HEIGHT] },
  {func: 'setActiveCanvas', parent: api, category: 'Canvas', paletteParams: ['id'], params: ['"id"'], dropdown: { 0: function () { return Applab.getIdDropdown("canvas"); } } },
  {func: 'line', parent: api, category: 'Canvas', paletteParams: ['x1','y1','x2','y2'], params: ["0", "0", "160", "240"] },
  {func: 'circle', parent: api, category: 'Canvas', paletteParams: ['x','y','radius'], params: ["160", "240", "100"] },
  {func: 'rect', parent: api, category: 'Canvas', paletteParams: ['x','y','width','height'], params: ["80", "120", "160", "240"] },
  {func: 'setStrokeWidth', parent: api, category: 'Canvas', paletteParams: ['width'], params: ["3"] },
  {func: 'setStrokeColor', parent: api, category: 'Canvas', paletteParams: ['color'], params: ['"red"'], dropdown: { 0: [ '"red"', '"rgb(255,0,0)"', '"rgba(255,0,0,0.5)"', '"#FF0000"' ] } },
  {func: 'setFillColor', parent: api, category: 'Canvas', paletteParams: ['color'], params: ['"yellow"'], dropdown: { 0: [ '"yellow"', '"rgb(255,255,0)"', '"rgba(255,255,0,0.5)"', '"#FFFF00"' ] } },
  {func: 'drawImage', parent: api, category: 'Canvas', paletteParams: ['id','x','y'], params: ['"id"', "0", "0"], dropdown: { 0: function () { return Applab.getIdDropdown("img"); } } },
  {func: 'getImageData', parent: api, category: 'Canvas', paletteParams: ['x','y','width','height'], params: ["0", "0", DEFAULT_WIDTH, DEFAULT_HEIGHT], type: 'value' },
  {func: 'putImageData', parent: api, category: 'Canvas', paletteParams: ['imgData','x','y'], params: ["imgData", "0", "0"] },
  {func: 'clearCanvas', parent: api, category: 'Canvas', },
  {func: 'getRed', parent: dontMarshalApi, category: 'Canvas', paletteParams: ['imgData','x','y'], params: ["imgData", "0", "0"], type: 'value', dontMarshal: true },
  {func: 'getGreen', parent: dontMarshalApi, category: 'Canvas', paletteParams: ['imgData','x','y'], params: ["imgData", "0", "0"], type: 'value', dontMarshal: true },
  {func: 'getBlue', parent: dontMarshalApi, category: 'Canvas', paletteParams: ['imgData','x','y'], params: ["imgData", "0", "0"], type: 'value', dontMarshal: true },
  {func: 'getAlpha', parent: dontMarshalApi, category: 'Canvas', paletteParams: ['imgData','x','y'], params: ["imgData", "0", "0"], type: 'value', dontMarshal: true },
  {func: 'setRed', parent: dontMarshalApi, category: 'Canvas', paletteParams: ['imgData','x','y','r'], params: ["imgData", "0", "0", "255"], dontMarshal: true },
  {func: 'setGreen', parent: dontMarshalApi, category: 'Canvas', paletteParams: ['imgData','x','y','g'], params: ["imgData", "0", "0", "255"], dontMarshal: true },
  {func: 'setBlue', parent: dontMarshalApi, category: 'Canvas', paletteParams: ['imgData','x','y','b'], params: ["imgData", "0", "0", "255"], dontMarshal: true },
  {func: 'setAlpha', parent: dontMarshalApi, category: 'Canvas', paletteParams: ['imgData','x','y','a'], params: ["imgData", "0", "0", "255"], dontMarshal: true },
  {func: 'setRGB', parent: dontMarshalApi, category: 'Canvas', paletteParams: ['imgData','x','y','r','g','b'], params: ["imgData", "0", "0", "255", "255", "255"], dontMarshal: true },

  {func: 'startWebRequest', parent: api, category: 'Data', paletteParams: ['url','callback'], params: ['"http://api.openweathermap.org/data/2.5/weather?q=London,uk"', "function(status, type, content) {\n  \n}"] },
  {func: 'setKeyValue', parent: api, category: 'Data', paletteParams: ['key','value','callback'], params: ['"key"', '"value"', "function () {\n  \n}"] },
  {func: 'getKeyValue', parent: api, category: 'Data', paletteParams: ['key','callback'], params: ['"key"', "function (value) {\n  \n}"] },
  {func: 'createRecord', parent: api, category: 'Data', paletteParams: ['table','record','callback'], params: ['"mytable"', "{name:'Alice'}", "function(record) {\n  \n}"] },
  {func: 'readRecords', parent: api, category: 'Data', paletteParams: ['table','terms','callback'], params: ['"mytable"', "{}", "function(records) {\n  for (var i =0; i < records.length; i++) {\n    textLabel('id', records[i].id + ': ' + records[i].name);\n  }\n}"] },
  {func: 'updateRecord', parent: api, category: 'Data', paletteParams: ['table','record','callback'], params: ['"mytable"', "{id:1, name:'Bob'}", "function(record) {\n  \n}"] },
  {func: 'deleteRecord', parent: api, category: 'Data', paletteParams: ['table','record','callback'], params: ['"mytable"', "{id:1}", "function() {\n  \n}"] },
  {func: 'getUserId', parent: api, category: 'Data', type: 'value' },
  {func: 'drawChartFromRecords', parent: api, category: 'Data', paletteParams: ['chartId', 'chartType', 'tableName', 'columns'], params: ['"chartId"', '"bar"', '"mytable"', '["columnOne", "columnTwo"]'], dropdown: { 0: function () { return Applab.getIdDropdown(".chart"); }, 1: ChartApi.getChartTypeDropdown } },

  {func: 'moveForward', parent: api, category: 'Turtle', paletteParams: ['pixels'], params: ["25"], dropdown: { 0: [ "25", "50", "100", "200" ] } },
  {func: 'moveBackward', parent: api, category: 'Turtle', paletteParams: ['pixels'], params: ["25"], dropdown: { 0: [ "25", "50", "100", "200" ] } },
  {func: 'move', parent: api, category: 'Turtle', paletteParams: ['x','y'], params: ["25", "25"], dropdown: { 0: [ "25", "50", "100", "200" ], 1: [ "25", "50", "100", "200" ] } },
  {func: 'moveTo', parent: api, category: 'Turtle', paletteParams: ['x','y'], params: ["0", "0"] },
  {func: 'dot', parent: api, category: 'Turtle', paletteParams: ['radius'], params: ["5"], dropdown: { 0: [ "1", "5", "10" ] } },
  {func: 'turnRight', parent: api, category: 'Turtle', paletteParams: ['angle'], params: ["90"], dropdown: { 0: [ "30", "45", "60", "90" ] } },
  {func: 'turnLeft', parent: api, category: 'Turtle', paletteParams: ['angle'], params: ["90"], dropdown: { 0: [ "30", "45", "60", "90" ] } },
  {func: 'turnTo', parent: api, category: 'Turtle', paletteParams: ['angle'], params: ["0"], dropdown: { 0: [ "0", "90", "180", "270" ] } },
  {func: 'arcRight', parent: api, category: 'Turtle', paletteParams: ['angle','radius'], params: ["90", "25"], dropdown: { 0: [ "30", "45", "60", "90" ], 1: [ "25", "50", "100", "200" ] } },
  {func: 'arcLeft', parent: api, category: 'Turtle', paletteParams: ['angle','radius'], params: ["90", "25"], dropdown: { 0: [ "30", "45", "60", "90" ], 1: [ "25", "50", "100", "200" ] } },
  {func: 'getX', parent: api, category: 'Turtle', type: 'value' },
  {func: 'getY', parent: api, category: 'Turtle', type: 'value' },
  {func: 'getDirection', parent: api, category: 'Turtle', type: 'value' },
  {func: 'penUp', parent: api, category: 'Turtle' },
  {func: 'penDown', parent: api, category: 'Turtle' },
  {func: 'penWidth', parent: api, category: 'Turtle', paletteParams: ['width'], params: ["3"], dropdown: { 0: [ "1", "3", "5" ] } },
  {func: 'penColor', parent: api, category: 'Turtle', paletteParams: ['color'], params: ['"red"'], dropdown: { 0: [ '"red"', '"rgb(255,0,0)"', '"rgba(255,0,0,0.5)"', '"#FF0000"' ] } },
  {func: 'penRGB', parent: api, category: 'Turtle', paletteParams: ['r','g','b'], params: ["120", "180", "200"] },
  {func: 'show', parent: api, category: 'Turtle' },
  {func: 'hide', parent: api, category: 'Turtle' },
  {func: 'speed', parent: api, category: 'Turtle', paletteParams: ['value'], params: ["50"], dropdown: { 0: [ "25", "50", "75", "100" ] } },

  {func: 'setTimeout', parent: api, category: 'Control', type: 'either', paletteParams: ['callback','ms'], params: ["function() {\n  \n}", "1000"] },
  {func: 'clearTimeout', parent: api, category: 'Control', paletteParams: ['__'], params: ["__"] },
  {func: 'setInterval', parent: api, category: 'Control', type: 'either', paletteParams: ['callback','ms'], params: ["function() {\n  \n}", "1000"] },
  {func: 'clearInterval', parent: api, category: 'Control', paletteParams: ['__'], params: ["__"] },

  {func: 'console.log', parent: consoleApi, category: 'Variables', paletteParams: ['message'], params: ['"message"'] },
  {func: 'declareAssign_str_hello_world', block: 'var str = "Hello World";', category: 'Variables', noAutocomplete: true },
  {func: 'substring', blockPrefix: 'str.substring', category: 'Variables', paletteParams: ['start','end'], params: ["6", "11"], modeOptionName: '*.substring', type: 'value' },
  {func: 'indexOf', blockPrefix: 'str.indexOf', category: 'Variables', paletteParams: ['searchValue'], params: ['"World"'], modeOptionName: '*.indexOf', type: 'value' },
  {func: 'includes', blockPrefix: 'str.includes', category: 'Variables', paletteParams: ['searchValue'], params: ['"World"'], modeOptionName: '*.includes', type: 'value' },
  {func: 'length', block: 'str.length', category: 'Variables', modeOptionName: '*.length' },
  {func: 'toUpperCase', blockPrefix: 'str.toUpperCase', category: 'Variables', modeOptionName: '*.toUpperCase', type: 'value' },
  {func: 'toLowerCase', blockPrefix: 'str.toLowerCase', category: 'Variables', modeOptionName: '*.toLowerCase', type: 'value' },
  {func: 'declareAssign_list_abd', block: 'var list = ["a", "b", "d"];', category: 'Variables', noAutocomplete: true },
  {func: 'listLength', block: 'list.length', category: 'Variables', noAutocomplete: true },
  {func: 'insertItem', parent: dontMarshalApi, category: 'Variables', paletteParams: ['list','index','item'], params: ["list", "2", '"c"'], dontMarshal: true },
  {func: 'appendItem', parent: dontMarshalApi, category: 'Variables', paletteParams: ['list','item'], params: ["list", '"f"'], dontMarshal: true },
  {func: 'removeItem', parent: dontMarshalApi, category: 'Variables', paletteParams: ['list','index'], params: ["list", "0"], dontMarshal: true },

  {func: 'imageUploadButton', parent: api, category: 'Advanced', params: ['"id"', '"text"'] },
  {func: 'container', parent: api, category: 'Advanced', params: ['"id"', '"html"'] },
  {func: 'innerHTML', parent: api, category: 'Advanced', params: ['"id"', '"html"'] },
  {func: 'setParent', parent: api, category: 'Advanced', params: ['"id"', '"parentId"'] },
  {func: 'setStyle', parent: api, category: 'Advanced', params: ['"id"', '"color:red;"'] },
  {func: 'getAttribute', parent: api, category: 'Advanced', params: ['"id"', '"scrollHeight"'], type: 'value' },
  {func: 'setAttribute', parent: api, category: 'Advanced', params: ['"id"', '"scrollHeight"', "200"]},
];

module.exports.categories = {
  'UI controls': {
    color: 'yellow',
    rgb: COLOR_YELLOW,
    blocks: []
  },
  Canvas: {
    color: 'red',
    rgb: COLOR_RED,
    blocks: []
  },
  Data: {
    color: 'lightgreen',
    rgb: COLOR_LIGHT_GREEN,
    blocks: []
  },
  Turtle: {
    color: 'cyan',
    rgb: COLOR_CYAN,
    blocks: []
  },
  Advanced: {
    color: 'blue',
    rgb: COLOR_BLUE,
    blocks: []
  },
};

/*
 * Set the showExamplesLink config value so that the droplet tooltips will show
 * an 'Examples' link that opens documentation in a lightbox:
 */
module.exports.showExamplesLink = true;


},{"../applab/assetManagement/show.js":"/home/ubuntu/staging/apps/build/js/applab/assetManagement/show.js","./ChartApi":"/home/ubuntu/staging/apps/build/js/applab/ChartApi.js","./api":"/home/ubuntu/staging/apps/build/js/applab/api.js","./consoleApi":"/home/ubuntu/staging/apps/build/js/applab/consoleApi.js","./constants":"/home/ubuntu/staging/apps/build/js/applab/constants.js","./designElements/elementUtils":"/home/ubuntu/staging/apps/build/js/applab/designElements/elementUtils.js","./dontMarshalApi":"/home/ubuntu/staging/apps/build/js/applab/dontMarshalApi.js"}],"/home/ubuntu/staging/apps/build/js/applab/consoleApi.js":[function(require,module,exports){
var codegen = require('../codegen');
var vsprintf = require('./sprintf').vsprintf;
var errorHandler = require('./errorHandler');
var outputApplabConsole = errorHandler.outputApplabConsole;

var consoleApi = module.exports;

consoleApi.log = function() {
  var nativeArgs = Array.prototype.map.call(arguments, function (item) {
    if (item === null || item === undefined) {
      return item;
    }
    return codegen.marshalInterpreterToNative(Applab.JSInterpreter.interpreter, item);
  });

  var output = '';
  var firstArg = nativeArgs[0];
  if (typeof firstArg === 'string' || firstArg instanceof String) {
    output = vsprintf(firstArg, nativeArgs.slice(1));
  } else if (nativeArgs.length === 1) {
    output = firstArg;
  } else {
    for (var i = 0; i < nativeArgs.length; i++) {
      output += nativeArgs[i].toString();
      if (i < nativeArgs.length - 1) {
        output += '\n';
      }
    }
  }
  outputApplabConsole(output);
};


},{"../codegen":"/home/ubuntu/staging/apps/build/js/codegen.js","./errorHandler":"/home/ubuntu/staging/apps/build/js/applab/errorHandler.js","./sprintf":"/home/ubuntu/staging/apps/build/js/applab/sprintf.js"}],"/home/ubuntu/staging/apps/build/js/applab/sprintf.js":[function(require,module,exports){
/*jshint asi:true */
/*jshint -W064 */

//
// Extracted from https://github.com/alexei/sprintf.js
//
// Copyright (c) 2007-2014, Alexandru Marasteanu <hello [at) alexei (dot] ro>
// All rights reserved.
//
// Current as of 10/30/14
// commit c3ac006aff511dda804589af8f5b3c0d5da5afb1
//

var re = {
    not_string: /[^s]/,
    number: /[dief]/,
    text: /^[^\x25]+/,
    modulo: /^\x25{2}/,
    placeholder: /^\x25(?:([1-9]\d*)\$|\(([^\)]+)\))?(\+)?(0|'[^$])?(-)?(\d+)?(?:\.(\d+))?([b-fiosuxX])/,
    key: /^([a-z_][a-z_\d]*)/i,
    key_access: /^\.([a-z_][a-z_\d]*)/i,
    index_access: /^\[(\d+)\]/,
    sign: /^[\+\-]/
}

function sprintf() {
    var key = arguments[0], cache = sprintf.cache
    if (!(cache[key] && cache.hasOwnProperty(key))) {
        cache[key] = sprintf.parse(key)
    }
    return sprintf.format.call(null, cache[key], arguments)
}

sprintf.format = function(parse_tree, argv) {
    var cursor = 1, tree_length = parse_tree.length, node_type = "", arg, output = [], i, k, match, pad, pad_character, pad_length, is_positive = true, sign = ""
    for (i = 0; i < tree_length; i++) {
        node_type = get_type(parse_tree[i])
        if (node_type === "string") {
            output[output.length] = parse_tree[i]
        }
        else if (node_type === "array") {
            match = parse_tree[i] // convenience purposes only
            if (match[2]) { // keyword argument
                arg = argv[cursor]
                for (k = 0; k < match[2].length; k++) {
                    if (!arg.hasOwnProperty(match[2][k])) {
                        throw new Error(sprintf("[sprintf] property '%s' does not exist", match[2][k]))
                    }
                    arg = arg[match[2][k]]
                }
            }
            else if (match[1]) { // positional argument (explicit)
                arg = argv[match[1]]
            }
            else { // positional argument (implicit)
                arg = argv[cursor++]
            }

            if (get_type(arg) == "function") {
                arg = arg()
            }

            if (re.not_string.test(match[8]) && (get_type(arg) != "number" && isNaN(arg))) {
                throw new TypeError(sprintf("[sprintf] expecting number but found %s", get_type(arg)))
            }

            if (re.number.test(match[8])) {
                is_positive = arg >= 0
            }

            switch (match[8]) {
                case "b":
                    arg = arg.toString(2)
                break
                case "c":
                    arg = String.fromCharCode(arg)
                break
                case "d":
                case "i":
                    arg = parseInt(arg, 10)
                break
                case "e":
                    arg = match[7] ? arg.toExponential(match[7]) : arg.toExponential()
                break
                case "f":
                    arg = match[7] ? parseFloat(arg).toFixed(match[7]) : parseFloat(arg)
                break
                case "o":
                    arg = arg.toString(8)
                break
                case "s":
                    arg = ((arg = String(arg)) && match[7] ? arg.substring(0, match[7]) : arg)
                break
                case "u":
                    arg = arg >>> 0
                break
                case "x":
                    arg = arg.toString(16)
                break
                case "X":
                    arg = arg.toString(16).toUpperCase()
                break
            }
            if (re.number.test(match[8]) && (!is_positive || match[3])) {
                sign = is_positive ? "+" : "-"
                arg = arg.toString().replace(re.sign, "")
            }
            else {
                sign = ""
            }
            pad_character = match[4] ? match[4] === "0" ? "0" : match[4].charAt(1) : " "
            pad_length = match[6] - (sign + arg).length
            pad = match[6] ? (pad_length > 0 ? str_repeat(pad_character, pad_length) : "") : ""
            output[output.length] = match[5] ? sign + arg + pad : (pad_character === "0" ? sign + pad + arg : pad + sign + arg)
        }
    }
    return output.join("")
}

sprintf.cache = {}

sprintf.parse = function(fmt) {
    var _fmt = fmt, match = [], parse_tree = [], arg_names = 0
    while (_fmt) {
        if ((match = re.text.exec(_fmt)) !== null) {
            parse_tree[parse_tree.length] = match[0]
        }
        else if ((match = re.modulo.exec(_fmt)) !== null) {
            parse_tree[parse_tree.length] = "%"
        }
        else if ((match = re.placeholder.exec(_fmt)) !== null) {
            if (match[2]) {
                arg_names |= 1
                var field_list = [], replacement_field = match[2], field_match = []
                if ((field_match = re.key.exec(replacement_field)) !== null) {
                    field_list[field_list.length] = field_match[1]
                    while ((replacement_field = replacement_field.substring(field_match[0].length)) !== "") {
                        if ((field_match = re.key_access.exec(replacement_field)) !== null) {
                            field_list[field_list.length] = field_match[1]
                        }
                        else if ((field_match = re.index_access.exec(replacement_field)) !== null) {
                            field_list[field_list.length] = field_match[1]
                        }
                        else {
                            throw new SyntaxError("[sprintf] failed to parse named argument key")
                        }
                    }
                }
                else {
                    throw new SyntaxError("[sprintf] failed to parse named argument key")
                }
                match[2] = field_list
            }
            else {
                arg_names |= 2
            }
            if (arg_names === 3) {
                throw new Error("[sprintf] mixing positional and named placeholders is not (yet) supported")
            }
            parse_tree[parse_tree.length] = match
        }
        else {
            throw new SyntaxError("[sprintf] unexpected placeholder")
        }
        _fmt = _fmt.substring(match[0].length)
    }
    return parse_tree
}

var vsprintf = function(fmt, argv, _argv) {
    _argv = (argv || []).slice(0)
    _argv.splice(0, 0, fmt)
    return sprintf.apply(null, _argv)
}

/**
 * helpers
 */
function get_type(variable) {
    return Object.prototype.toString.call(variable).slice(8, -1).toLowerCase()
}

function str_repeat(input, multiplier) {
    return Array(multiplier + 1).join(input)
}

module.exports = {
  vsprintf: vsprintf
};


},{}],"/home/ubuntu/staging/apps/build/js/applab/dontMarshalApi.js":[function(require,module,exports){
var errorHandler = require('./errorHandler');
var outputApplabConsole = errorHandler.outputApplabConsole;
var outputError = errorHandler.outputError;
var ErrorLevel = errorHandler.ErrorLevel;

var OPTIONAL = true;


function outputWarning(errorString) {
  var line = 1 + window.Applab.JSInterpreter.getNearestUserCodeLine();
  outputError(errorString, ErrorLevel.WARNING, line);
}

// APIs designed specifically to run on interpreter data structures without marshalling
// (valuable for performance or to support in/out parameters)
//
// dropletConfig for each of these APIs should be marked with dontMarshal:true


function dmapiValidateType(funcName, varName, varValue, expectedType, opt) {
  var properType;
  if (typeof varValue !== 'undefined') {
    if (expectedType === 'number') {
      properType = (typeof varValue.data === 'number' ||
                    (typeof varValue.data === 'string' && !isNaN(varValue.data)));
    } else if (expectedType === 'array') {
      properType = varValue.parent == window.Applab.JSInterpreter.interpreter.ARRAY;
    } else {
      properType = (typeof varValue.data === expectedType);
    }
  }
  properType = properType ||
              (opt === OPTIONAL &&
               (varValue === window.Applab.JSInterpreter.interpreter.UNDEFINED ||
                typeof varValue === 'undefined'));
  if (!properType) {
    outputWarning(funcName + "() " + varName + " parameter value (" +
                    varValue + ") is not a " + expectedType + ".");
  }
}

// Array functions

var getInt = function(obj, def) {
  // Return an integer, or the default.
  var n = obj ? Math.floor(obj.toNumber()) : def;
  if (isNaN(n)) {
    n = def;
  }
  return n;
};

exports.insertItem = function (array, index, item) {
  dmapiValidateType('insertItem', 'list', array, 'array');
  dmapiValidateType('insertItem', 'index', index, 'number');

  index = getInt(index, 0);
  if (index < 0) {
    index = Math.max(array.length + index, 0);
  } else {
    index = Math.min(index, array.length);
  }
  // Insert item.
  for (var i = array.length - 1; i >= index; i--) {
    array.properties[i + 1] = array.properties[i];
  }
  array.length += 1;
  array.properties[index] = item;
};

exports.removeItem = function (array, index) {
  dmapiValidateType('removeItem', 'list', array, 'array');
  dmapiValidateType('removeItem', 'index', index, 'number');

  index = getInt(index, 0);
  if (index < 0) {
    index = Math.max(array.length + index, 0);
  }
  // Remove by shifting items after index downward.
  for (var i = index; i < array.length - 1; i++) {
    array.properties[i] = array.properties[i + 1];
  }
  if (index < array.length) {
    delete array.properties[array.length - 1];
    array.length -= 1;
  } else {
    // index is out of bounds (too large):
    outputWarning("removeItem() index parameter value (" + index +
                    ") is larger than the number of items in the list (" +
                    array.length + ").");
  }
};

exports.appendItem = function (array, item) {
  dmapiValidateType('appendItem', 'list', array, 'array');

  array.properties[array.length] = item;
  array.length++;
  return window.Applab.JSInterpreter.createPrimitive(array.length);
};

// ImageData RGB helper functions

// TODO: more parameter validation (data array type, length), error output

exports.getRed = function (imageData, x, y) {
  if (imageData.properties.data && imageData.properties.width) {
    var pixelOffset = y * imageData.properties.width * 4 + x * 4;
    return imageData.properties.data.properties[pixelOffset].toNumber();
  }
};
exports.getGreen = function (imageData, x, y) {
  if (imageData.properties.data && imageData.properties.width) {
    var pixelOffset = y * imageData.properties.width * 4 + x * 4;
    return imageData.properties.data.properties[pixelOffset + 1].toNumber();
  }
};
exports.getBlue = function (imageData, x, y) {
  if (imageData.properties.data && imageData.properties.width) {
    var pixelOffset = y * imageData.properties.width * 4 + x * 4;
    return imageData.properties.data.properties[pixelOffset + 2].toNumber();
  }
};
exports.getAlpha = function (imageData, x, y) {
  if (imageData.properties.data && imageData.properties.width) {
    var pixelOffset = y * imageData.properties.width * 4 + x * 4;
    return imageData.properties.data.properties[pixelOffset + 3].toNumber();
  }
};

exports.setRed = function (imageData, x, y, value) {
  if (imageData.properties.data && imageData.properties.width) {
    var pixelOffset = y * imageData.properties.width * 4 + x * 4;
    imageData.properties.data.properties[pixelOffset] = value;
  }
};
exports.setGreen = function (imageData, x, y, value) {
  if (imageData.properties.data && imageData.properties.width) {
    var pixelOffset = y * imageData.properties.width * 4 + x * 4;
    imageData.properties.data.properties[pixelOffset + 1] = value;
  }
};
exports.setBlue = function (imageData, x, y, value) {
  if (imageData.properties.data && imageData.properties.width) {
    var pixelOffset = y * imageData.properties.width * 4 + x * 4;
    imageData.properties.data.properties[pixelOffset + 2] = value;
  }
};
exports.setAlpha = function (imageData, x, y, value) {
  if (imageData.properties.data && imageData.properties.width) {
    var pixelOffset = y * imageData.properties.width * 4 + x * 4;
    imageData.properties.data.properties[pixelOffset + 3] = value;
  }
};
exports.setRGB = function (imageData, x, y, r, g, b, a) {
  if (imageData.properties.data && imageData.properties.width) {
    var pixelOffset = y * imageData.properties.width * 4 + x * 4;
    imageData.properties.data.properties[pixelOffset] = r;
    imageData.properties.data.properties[pixelOffset + 1] = g;
    imageData.properties.data.properties[pixelOffset + 2] = b;
    imageData.properties.data.properties[pixelOffset + 3] =
      (typeof a === 'undefined') ? window.Applab.JSInterpreter.createPrimitive(255) : a;
  }
};


},{"./errorHandler":"/home/ubuntu/staging/apps/build/js/applab/errorHandler.js"}],"/home/ubuntu/staging/apps/build/js/applab/designMode.js":[function(require,module,exports){
/* global Applab, dashboard */

// TODO (brent) - make it so that we dont need to specify .jsx. This currently
// works in our grunt build, but not in tests
var DesignWorkspace = require('./DesignWorkspace.jsx');
var DesignToggleRow = require('./DesignToggleRow.jsx');
var showAssetManager = require('./assetManagement/show.js');
var elementLibrary = require('./designElements/library');
var elementUtils = require('./designElements/elementUtils');
var studioApp = require('../StudioApp').singleton;
var KeyCodes = require('../constants').KeyCodes;

var designMode = module.exports;

var currentlyEditedElement = null;
var currentScreenId = null;

var GRID_SIZE = 5;

/**
 * If in design mode and program is not running, display Properties
 * pane for editing the clicked element.
 * @param event
 */
designMode.onDesignModeVizClick = function (event) {
  if (!Applab.isInDesignMode() ||
      $('#resetButton').is(':visible')) {
    return;
  }
  event.preventDefault();

  var element = event.target;
  if (element.id === 'designModeViz') {
    element = designMode.activeScreen();
  }

  if ($(element).is('.ui-resizable')) {
    element = getInnerElement(element);
  } else if ($(element).is('.ui-resizable-handle')) {
    element = getInnerElement(element.parentNode);
  }
  // give the div focus so that we can listen for keyboard events
  $("#designModeViz").focus();
  designMode.editElementProperties(element);
};

/**
 * @returns {HTMLElement} The currently visible screen element.
 */
designMode.activeScreen = function () {
  return $('#designModeViz .screen').filter(function () {
    return this.style.display !== 'none';
  }).first()[0];
};

/**
 * Create a new element of the specified type within the play space.
 * @param {ElementType} elementType Type of element to create
 * @param {number} left Position from left.
 * @param {number} top Position from top.
 * @returns {HTMLElement} The generated element
 */
designMode.createElement = function (elementType, left, top) {
  var element = elementLibrary.createElement(elementType, left, top);

  var parent;
  var isScreen = $(element).hasClass('screen');
  if (isScreen) {
    parent = document.getElementById('designModeViz');
  } else {
    parent = designMode.activeScreen();
  }
  parent.appendChild(element);

  if (!isScreen) {
    makeDraggable($(element));
  }
  designMode.editElementProperties(element);

  return element;
};

designMode.editElementProperties = function(element) {
  var designPropertiesElement = document.getElementById('design-properties');
  if (!designPropertiesElement) {
    // design-properties won't exist when !user.isAdmin
    return;
  }

  highlightElement(element);

  currentlyEditedElement = element;
  designMode.renderDesignWorkspace(element);
};

/**
 * Loads the current element or current screen into the property tab.
 * Also makes sure we re-render design mode to update properties such as isDimmed.
 */
designMode.resetPropertyTab = function() {
  var element = currentlyEditedElement || designMode.activeScreen();
  designMode.editElementProperties(element);
};

/**
 * Enable (or disable) dragging of new elements from the element tray
 * @param allowEditing {boolean}
 */
designMode.resetElementTray = function (allowEditing) {
  $('#design-toolbox .new-design-element').each(function() {
    $(this).draggable(allowEditing ? 'enable' : 'disable');
  });
};

/**
 * Given an input value produce a valid css value that is
 * either in pixels or empty.
 */
var appendPx = function (inp) {
  return inp ? inp + 'px' : '';
};

/**
 * Handle a change from our properties table.
 * @param element {Element}
 * @param name {string}
 * @param value {string}
 */
designMode.onPropertyChange = function(element, name, value) {
  designMode.updateProperty(element, name, value);
  designMode.editElementProperties(element);
};

/**
 * After handling properties generically, give elementLibrary a chance
 * to do any element specific changes.
 * @param element
 * @param name
 * @param value
 */
designMode.updateProperty = function(element, name, value) {
  var handled = true;
  switch (name) {
    case 'id':
      elementUtils.setId(element, value);
      if (elementLibrary.getElementType(element) ===
          elementLibrary.ElementType.SCREEN) {
        // rerender design toggle, which has a dropdown of screen ids
        designMode.changeScreen(value);
      }
      break;
    case 'left':
      var newLeft = appendPx(value);
      element.style.left = newLeft;
      element.parentNode.style.left = newLeft;
      break;
    case 'top':
      var newTop = appendPx(value);
      element.style.top = newTop;
      element.parentNode.style.top = newTop;
      break;
    case 'width':
      element.setAttribute('width', appendPx(value));
      break;
    case 'height':
      element.setAttribute('height', appendPx(value));
      break;
    case 'style-width':
      var newWidth = appendPx(value);
      element.style.width = newWidth;
      element.parentNode.style.width = newWidth;

      if (element.style.backgroundSize) {
        element.style.backgroundSize = element.style.width + ' ' +
          element.style.height;
      }
      break;
    case 'style-height':
      var newHeight = appendPx(value);
      element.style.height = newHeight;
      element.parentNode.style.height = newHeight;

      if (element.style.backgroundSize) {
        element.style.backgroundSize = element.style.width + ' ' +
          element.style.height;
      }
      break;
    case 'text':
      element.textContent = value;
      break;
    case 'textColor':
      element.style.color = value;
      break;
    case 'backgroundColor':
      element.style.backgroundColor = value;
      break;
    case 'fontSize':
      element.style.fontSize = appendPx(value);
      break;

    case 'image':
      var image = new Image();
      var backgroundImage = new Image();
      var originalImage = element.style.backgroundImage;
      backgroundImage.src = Applab.maybeAddAssetPathPrefix(value);
      element.setAttribute('data-canonical-image-url', value);
      if (backgroundImage.src !== originalImage) {
        backgroundImage.onload = function() {
          // remove loader so that API calls dont hit this
          element.style.backgroundImage = 'url(' + backgroundImage.src + ')';
          if (originalImage === element.style.backgroundImage) {
            return;
          }
          element.style.backgroundSize = backgroundImage.naturalWidth + 'px ' +
            backgroundImage.naturalHeight + 'px';
          element.style.width = backgroundImage.naturalWidth + 'px';
          element.style.height = backgroundImage.naturalHeight + 'px';
          // Re-render properties
          if (currentlyEditedElement === element) {
            designMode.editElementProperties(element);
          }
        };
      }
      break;

    case 'screen-image':
      // We stretch the image to fit the element
      var width = parseInt(element.style.width, 10);
      var height = parseInt(element.style.height, 10);
      element.style.backgroundImage = 'url(' + Applab.maybeAddAssetPathPrefix(value) + ')';
      element.setAttribute('data-canonical-image-url', value);
      element.style.backgroundSize = width + 'px ' + height + 'px';
      break;

    case 'picture':
      var originalSrc = element.src;
      element.src = Applab.maybeAddAssetPathPrefix(value);
      element.setAttribute('data-canonical-image-url', value);

      if (element.src !== originalSrc) {
        element.onload = function () {
          // naturalWidth/Height aren't populated until image has loaded.
          element.style.width = element.naturalWidth + 'px';
          element.style.height = element.naturalHeight + 'px';
          if ($(element.parentNode).is('.ui-resizable')) {
            element.parentNode.style.width = element.naturalWidth + 'px';
            element.parentNode.style.height = element.naturalHeight + 'px';
          }
          // Re-render properties
          if (currentlyEditedElement === element) {
            designMode.editElementProperties(element);
          }
        };
      }
      break;
    case 'hidden':
      // Add a class that shows as 30% opacity in design mode, and invisible
      // in code mode.
      $(element).toggleClass('design-mode-hidden', value === true);
      break;
    case 'checked':
      // element.checked represents the current state, the attribute represents
      // the serialized state
      element.checked = value;

      if (value) {
        var groupName = element.getAttribute('name');
        if (groupName) {
          // Remove checked attribute from all other radio buttons in group
          var buttons = document.getElementsByName(groupName);
          Array.prototype.forEach.call(buttons, function (item) {
            if (item.type === 'radio') {
              item.removeAttribute('checked');
            }
          });
        }
        element.setAttribute('checked', 'checked');
      } else {
        element.removeAttribute('checked');
      }
      break;
    case 'options':
      // value should be an array of options in this case
      for (var i = 0; i < value.length; i++) {
        var optionElement = element.children[i];
        if (!optionElement) {
          optionElement = document.createElement('option');
          element.appendChild(optionElement);
        }
        optionElement.textContent = value[i];
      }
      // remove any extra options
      for (i = value.length; i < element.children.length; i++) {
        element.removeChild(element.children[i]);
      }
      break;
    case 'groupId':
      element.setAttribute('name', value);
      break;
    case 'placeholder':
      element.setAttribute('placeholder', value);
      break;
    case 'rows':
      element.setAttribute('rows', value);
      break;
    case 'cols':
      element.setAttribute('rows', value);
      break;
    default:
      // Mark as unhandled, but give typeSpecificPropertyChange a chance to
      // handle it
      handled = false;
  }

  if (elementLibrary.typeSpecificPropertyChange(element, name, value)) {
    handled = true;
  }

  if (!handled) {
    throw "unknown property name " + name;
  }
};

designMode.onDeletePropertiesButton = function(element, event) {
  var isScreen = $(element).hasClass('screen');
  if ($(element.parentNode).is('.ui-resizable')) {
    element = element.parentNode;
  }
  $(element).remove();

  if (isScreen) {
    designMode.loadDefaultScreen();
  } else {
    designMode.editElementProperties(elementUtils.getPrefixedElementById(currentScreenId));
  }
};

designMode.onDepthChange = function (element, depthDirection) {
  // move to outer resizable div
  var outerElement = element.parentNode;
  var parent = outerElement.parentNode;
  var index = Array.prototype.indexOf.call(parent.children, outerElement);

  if (depthDirection === 'forward' && index + 2 >= parent.children.length) {
    // We're either the last or second to last element
    depthDirection = 'toFront';
  }

  var removed;

  // TODO (brent) - use an enum?
  switch (depthDirection) {
    case 'forward':
      var twoAhead = outerElement.nextSibling.nextSibling;
      removed = parent.removeChild(outerElement);
      parent.insertBefore(removed, twoAhead);
      break;

    case 'toFront':
      removed = parent.removeChild(outerElement);
      parent.appendChild(removed);
      break;

    case 'backward':
      var previous = outerElement.previousSibling;
      if (!previous) {
        return;
      }

      removed = parent.removeChild(outerElement);
      parent.insertBefore(removed, previous);
      break;

    case 'toBack':
      if (parent.children.length === 1) {
        return;
      }
      removed = parent.removeChild(outerElement);
      parent.insertBefore(removed, parent.children[0]);
      break;

    default:
      throw new Error('unknown depthDirection: ' + depthDirection);
  }

  element.focus();
  designMode.editElementProperties(element);
};

designMode.onInsertEvent = function(code) {
  Applab.appendToEditor(code);
  $('#codeModeButton').click(); // TODO(dave): reactify / extract toggle state
};

/**/
designMode.serializeToLevelHtml = function () {
  var designModeViz = $('#designModeViz');
  // Children are screens. Want to operate on grandchildren
  var madeUndraggable = makeUndraggable(designModeViz.children().children());

  // Make a copy so that we don't affect designModeViz contents as we
  // remove prefixes from the element ids.
  var designModeVizClone = designModeViz.clone();
  designModeVizClone.children().each(function() {
    elementUtils.removeIdPrefix(this);
  });
  designModeVizClone.children().children().each(function() {
    elementUtils.removeIdPrefix(this);
  });

  var serialization = new XMLSerializer().serializeToString(designModeVizClone[0]);
  if (madeUndraggable) {
    makeDraggable(designModeViz.children().children());
  }
  Applab.levelHtml = serialization;
};

/**
 * Replace the contents of rootEl with the children of the DOM node obtained by
 * parsing Applab.levelHtml (the root node in the levelHtml is ignored).
 * @param rootEl {Element} Element whose children should be replaced.
 * @param allowDragging {boolean} Whether to make elements resizable and draggable.
 * @param prefix {string} Optional prefix to attach to element ids of children and
 *     grandchildren after parsing. Defaults to ''.
 */
designMode.parseFromLevelHtml = function(rootEl, allowDragging, prefix) {
  if (!rootEl) {
    return;
  }
  while (rootEl.firstChild) {
    rootEl.removeChild(rootEl.firstChild);
  }

  if (!Applab.levelHtml) {
    return;
  }
  var levelDom = $.parseHTML(Applab.levelHtml);
  var children = $(levelDom).children();

  children.each(function () {
    elementUtils.addIdPrefix(this, prefix);
  });
  children.children().each(function() {
    elementUtils.addIdPrefix(this, prefix);
  });

  children.appendTo(rootEl);
  if (allowDragging) {
    // children are screens. make grandchildren draggable
    makeDraggable(children.children());
  }

  children.each(function () {
    elementLibrary.onDeserialize(this, designMode.updateProperty.bind(this));
  });
  children.children().each(function() {
    elementLibrary.onDeserialize(this, designMode.updateProperty.bind(this));
  });
};

designMode.toggleDesignMode = function(enable) {
  var designWorkspace = document.getElementById('designWorkspace');
  if (!designWorkspace) {
    // Currently we don't run design mode in some circumstances (i.e. user is
    // not an admin)
    return;
  }
  designWorkspace.style.display = enable ? 'block' : 'none';

  var codeWorkspaceWrapper = document.getElementById('codeWorkspaceWrapper');
  codeWorkspaceWrapper.style.display = enable ? 'none' : 'block';

  var debugArea = document.getElementById('debug-area');
  debugArea.style.display = enable ? 'none' : 'block';

  Applab.toggleDivApplab(!enable);
};

/**
 * When we make elements resizable, we wrap them in an outer div. Given an outer
 * div, this returns the inner element
 */
function getInnerElement(outerElement) {
  // currently assume inner element is first child.
  return outerElement.children[0];
}

/**
 *
 * @param {jQuery} jqueryElements jQuery object containing DOM elements to make
 *   draggable.
 */
function makeDraggable (jqueryElements) {
  // For a non-div to be draggable & resizable it needs to be wrapped in a div.
  jqueryElements.each(function () {
    var elm = $(this);
    var wrapper = elm.wrap('<div>').parent().resizable({
      create: function () {
        // resizable sets z-index to 90, which we don't want
        $(this).children().css('z-index', '');
      },
      resize: function (event, ui) {
        // Wishing for a vector maths library...

        // Customize motion according to current visualization scale.
        var scale = getVisualizationScale();
        var deltaWidth = ui.size.width - ui.originalSize.width;
        var deltaHeight = ui.size.height - ui.originalSize.height;
        var newWidth = ui.originalSize.width + (deltaWidth / scale);
        var newHeight = ui.originalSize.height + (deltaHeight / scale);

        // snap width/height to nearest grid increment
        newWidth = snapToGridSize(newWidth, GRID_SIZE);
        newHeight = snapToGridSize(newHeight, GRID_SIZE);

        // Bound at app edges
        var container = $('#designModeViz');
        var maxWidth = container.outerWidth() - ui.position.left;
        var maxHeight = container.outerHeight() - ui.position.top;
        newWidth = Math.min(newWidth, maxWidth);
        newWidth = Math.max(newWidth, 20);
        newHeight = Math.min(newHeight, maxHeight);
        newHeight = Math.max(newHeight, 20);

        ui.size.width = newWidth;
        ui.size.height = newHeight;
        wrapper.css({
          width: newWidth,
          height: newHeight
        });

        elm.outerWidth(wrapper.width());
        elm.outerHeight(wrapper.height());
        var element = elm[0];
        // canvas uses width/height. other elements use style.width/style.height
        var widthProperty = 'style-width';
        var heightProperty = 'style-height';
        if (element.hasAttribute('width') || element.hasAttribute('height')) {
          widthProperty = 'width';
          heightProperty = 'height';
        }
        designMode.updateProperty(element, widthProperty, element.style.width);
        designMode.updateProperty(element, heightProperty, element.style.height);

        highlightElement(elm[0]);
      }
    }).draggable({
      cancel: false,  // allow buttons and inputs to be dragged
      drag: function (event, ui) {
        // draggables are not compatible with CSS transform-scale,
        // so adjust the position in various ways here.

        // dragging
        var scale = getVisualizationScale();
        var newLeft  = ui.position.left / scale;
        var newTop = ui.position.top / scale;

        // snap top-left corner to nearest location in the grid
        newLeft = snapToGridSize(newLeft, GRID_SIZE);
        newTop = snapToGridSize(newTop, GRID_SIZE);

        // containment
        var container = $('#designModeViz');
        var maxLeft = container.outerWidth() - ui.helper.outerWidth(true);
        var maxTop = container.outerHeight() - ui.helper.outerHeight(true);
        newLeft = Math.min(newLeft, maxLeft);
        newLeft = Math.max(newLeft, 0);
        newTop = Math.min(newTop, maxTop);
        newTop = Math.max(newTop, 0);

        ui.position.left = newLeft;
        ui.position.top = newTop;

        elm.css({
          top: newTop,
          left: newLeft
        });

        designMode.renderDesignWorkspace(elm[0]);
      },
      start: function () {
        highlightElement(elm[0]);
      },
    }).css({
      position: 'absolute',
      lineHeight: '0px'
    });

    wrapper.css({
      top: elm.css('top'),
      left: elm.css('left')
    });

    // Chrome/Safari both have issues where they don't properly render the
    // wrapper if the inner element is a div. This is a hack that causes a
    // rerender to happen in chrome
    var currHeight = wrapper.parent().height();
    wrapper.parent().height(currHeight + 1);
    wrapper.parent().height(currHeight);

    // And a hack for Safari
    if (this.tagName === 'DIV') {
      setTimeout(function () {
        wrapper.hide().show(0);
      }, 0);
    }

    elm.css('position', 'static');
  });
}

/**
 * Calculate the current visualization scale factor, as screenWidth / domWidth.
 * @returns {number}
 */
function getVisualizationScale() {
  var div = document.getElementById('designModeViz');
  return div.getBoundingClientRect().width / div.offsetWidth;
}

/**
 * Given a coordinate on either axis and a grid size, returns a coordinate
 * near the given coordinate that snaps to the given grid size.
 * @param {number} coordinate
 * @param {number} gridSize
 * @returns {number}
 */
var snapToGridSize = function (coordinate, gridSize) {
  var halfGrid = gridSize / 2;
  return coordinate - ((coordinate + halfGrid) % gridSize - halfGrid);
};

/**
 * Inverse of `makeDraggable`.
 * @param {jQuery} jqueryElements jQuery object containing DOM elements to make
 *   undraggable.
 * @returns {boolean} True if we made something undraggable
 */
function makeUndraggable(jqueryElements) {
  var foundOne = false;
  jqueryElements.each(function () {
    var wrapper = $(this);
    var elm = $(getInnerElement(this));

    // Don't unwrap elements that aren't wrapped with a draggable div.
    if (!wrapper.hasClass('ui-draggable')) {
      return;
    }

    foundOne = true;

    wrapper.resizable('destroy').draggable('destroy');
    elm.css('position', 'absolute');
    elm.unwrap();
  });

  return foundOne;
}

/**
 * Highlights an element with a dashed border, removes border from all other elements
 * Must only be called on an element wrapped in a draggable div
 */
function highlightElement(element) {
  removeElementHighlights();

  if ($(element).is('#designModeViz img[src!=""], #designModeViz label')) {
    $(element).parent().css({
      outlineStyle: 'dashed',
      outlineWidth: '1px',
    });
  }
}

/**
 * Remove dashed borders from all elements
 */
function removeElementHighlights() {
  $('#designModeViz .ui-draggable').css({
    outlineStyle: '',
    outlineWidth: ''
  });
}

designMode.configureDragAndDrop = function () {
  // Allow elements to be dragged and dropped from the design mode
  // element tray to the play space.
  $('#visualization').droppable({
    accept: '.new-design-element',
    drop: function (event, ui) {
      var elementType = ui.draggable[0].getAttribute('data-element-type');

      var div = document.getElementById('designModeViz');
      var xScale = div.getBoundingClientRect().width / div.offsetWidth;
      var yScale = div.getBoundingClientRect().height / div.offsetHeight;

      var left = (ui.helper.offset().left - $('#designModeViz').offset().left) / xScale;
      var top = (ui.helper.offset().top - $('#designModeViz').offset().top) / yScale;

      // snap top-left corner to nearest location in the grid
      left -= (left + GRID_SIZE / 2) % GRID_SIZE - GRID_SIZE / 2;
      top -= (top + GRID_SIZE / 2) % GRID_SIZE - GRID_SIZE / 2;

      var element = designMode.createElement(elementType, left, top);
      if (elementType === elementLibrary.ElementType.SCREEN) {
        designMode.changeScreen(elementUtils.getId(element));
      }
    }
  });
};

designMode.configureDesignToggleRow = function () {
  var designToggleRow = document.getElementById('designToggleRow');
  if (!designToggleRow) {
    return;
  }

  var firstScreen = elementUtils.getId($('#designModeViz .screen')[0]);
  designMode.changeScreen(firstScreen);
};

/**
 * Create a new screen
 * @returns {string} The id of the newly created screen
 */
designMode.createScreen = function () {
  var newScreen = elementLibrary.createElement('SCREEN', 0, 0);
  $("#designModeViz").append(newScreen);

  return elementUtils.getId(newScreen);
};

/**
 * Changes the active screen by toggling all screens to be non-visible, unless
 * they match the provided screenId. Also updates our dropdown to reflect the
 * change, and opens the element property editor for the new screen.
 */
designMode.changeScreen = function (screenId) {
  currentScreenId = screenId;
  var screenIds = [];
  $('#designModeViz .screen').each(function () {
    screenIds.push(elementUtils.getId(this));
    $(this).toggle(elementUtils.getId(this) === screenId);
  });

  var designToggleRow = document.getElementById('designToggleRow');
  if (designToggleRow) {
    React.render(
      React.createElement(DesignToggleRow, {
        hideToggle: Applab.hideDesignModeToggle(),
        hideViewDataButton: Applab.hideViewDataButton(),
        startInDesignMode: Applab.startInDesignMode(),
        initialScreen: screenId,
        screens: screenIds,
        onDesignModeButton: Applab.onDesignModeButton,
        onCodeModeButton: Applab.onCodeModeButton,
        onViewDataButton: Applab.onViewData,
        onScreenChange: designMode.changeScreen,
        onScreenCreate: designMode.createScreen
      }),
      designToggleRow
    );
  }

  designMode.editElementProperties(elementUtils.getPrefixedElementById(screenId));
};

designMode.getCurrentScreenId = function() {
  return currentScreenId;
};

/**
 * Load our default screen (ie. the first one in the DOM), creating a screen
 * if we have none.
 */
designMode.loadDefaultScreen = function () {
  var defaultScreen;
  if ($('#designModeViz .screen').length === 0) {
    defaultScreen = designMode.createScreen();
  } else {
    defaultScreen = elementUtils.getId($('#designModeViz .screen')[0]);
  }
  designMode.changeScreen(defaultScreen);
};

designMode.renderDesignWorkspace = function(element) {
  var designWorkspace = document.getElementById('designWorkspace');
  if (!designWorkspace) {
    return;
  }

  var props = {
    handleDragStart: function() {
      if ($('#resetButton').is(':visible')) {
        studioApp.resetButtonClick();
      }
    },
    element: element || null,
    handleChange: designMode.onPropertyChange.bind(this, element),
    onDepthChange: designMode.onDepthChange,
    onDelete: designMode.onDeletePropertiesButton.bind(this, element),
    onInsertEvent: designMode.onInsertEvent.bind(this),
    handleManageAssets: showAssetManager,
    isDimmed: Applab.running
  };
  React.render(React.createElement(DesignWorkspace, props), designWorkspace);
};

/**
 * Early versions of applab didn't have screens, and instead all elements
 * existed under the root div. If we find one of those, convert it to be a single
 * screen app.
 */
designMode.addScreenIfNecessary = function(html) {
  var rootDiv = $(html);
  if (rootDiv.children().length === 0 ||
      rootDiv.children().eq(0).hasClass('screen')) {
    // no children, or first child is a screen
    return html;
  }

  var screenElement = elementLibrary.createElement(
    elementLibrary.ElementType.SCREEN);
  rootDiv.children().appendTo(screenElement);
  rootDiv.append(screenElement);

  return rootDiv[0].outerHTML;
};

designMode.addKeyboardHandlers = function () {
  $('#designModeViz').keydown(function (event) {
    if (!Applab.isInDesignMode() || Applab.isRunning()) {
      return;
    }
    if (!currentlyEditedElement || $(currentlyEditedElement).hasClass('screen')) {
      return;
    }

    var current, property, newValue;

    switch (event.which) {
      case KeyCodes.LEFT:
        current = parseInt(currentlyEditedElement.style.left, 10);
        newValue = current - 1;
        property = 'left';
        break;
      case KeyCodes.RIGHT:
        current = parseInt(currentlyEditedElement.style.left, 10);
        newValue = current + 1;
        property = 'left';
        break;
      case KeyCodes.UP:
        current = parseInt(currentlyEditedElement.style.top, 10);
        newValue = current - 1;
        property = 'top';
        break;
      case KeyCodes.DOWN:
        current = parseInt(currentlyEditedElement.style.top, 10);
        newValue = current + 1;
        property = 'top';
        break;
      default:
        return;
    }
    designMode.onPropertyChange(currentlyEditedElement, property, newValue);
  });
};

designMode.resetIds = function() {
  elementLibrary.resetIds();
};


},{"../StudioApp":"/home/ubuntu/staging/apps/build/js/StudioApp.js","../constants":"/home/ubuntu/staging/apps/build/js/constants.js","./DesignToggleRow.jsx":"/home/ubuntu/staging/apps/build/js/applab/DesignToggleRow.jsx","./DesignWorkspace.jsx":"/home/ubuntu/staging/apps/build/js/applab/DesignWorkspace.jsx","./assetManagement/show.js":"/home/ubuntu/staging/apps/build/js/applab/assetManagement/show.js","./designElements/elementUtils":"/home/ubuntu/staging/apps/build/js/applab/designElements/elementUtils.js","./designElements/library":"/home/ubuntu/staging/apps/build/js/applab/designElements/library.js"}],"/home/ubuntu/staging/apps/build/js/applab/controls.html.ejs":[function(require,module,exports){
module.exports= (function() {
  var t = function anonymous(locals, filters, escape) {
escape = escape || function (html){
  return String(html)
    .replace(/&(?!\w+;)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
};
var buf = [];
with (locals || {}) { (function(){ 
 buf.push('');1;
  var msg = require('../locale');
; buf.push('\n');4; // Comment so this file is not identical to studio/controls.html.ejs 
; buf.push('\n\n<div id="soft-buttons" class="soft-buttons-none">\n  <button id="leftButton" disabled=true class="arrow">\n    <img src="', escape((8,  assetUrl('media/1x1.gif') )), '" class="left-btn icon21">\n  </button>\n  <button id="rightButton" disabled=true class="arrow">\n    <img src="', escape((11,  assetUrl('media/1x1.gif') )), '" class="right-btn icon21">\n  </button>\n  <button id="upButton" disabled=true class="arrow">\n    <img src="', escape((14,  assetUrl('media/1x1.gif') )), '" class="up-btn icon21">\n  </button>\n  <button id="downButton" disabled=true class="arrow">\n    <img src="', escape((17,  assetUrl('media/1x1.gif') )), '" class="down-btn icon21">\n  </button>\n</div>\n\n');21; if (finishButton) { ; buf.push('\n  <div id="share-cell" class="share-cell-none">\n    <button id="finishButton" class="share">\n      <img src="', escape((24,  assetUrl('media/1x1.gif') )), '">', escape((24,  msg.finish() )), '\n    </button>\n  </div>\n');27; } ; buf.push('\n\n');29; if (submitButton) { ; buf.push('\n  <div id="share-cell" class="share-cell-none">\n    <button id="submitButton" class="share">\n      <img src="', escape((32,  assetUrl('media/1x1.gif') )), '">', escape((32,  msg.submit() )), '\n    </button>\n  </div>\n');35; } ; buf.push('\n\n');37; if (unsubmitButton) { ; buf.push('\n  <div id="share-cell" class="share-cell-enabled">\n    <button id="unsubmitButton" class="share">\n      <img src="', escape((40,  assetUrl('media/1x1.gif') )), '">', escape((40,  msg.unsubmit() )), '\n    </button>\n  </div>\n');43; } ; buf.push('\n'); })();
} 
return buf.join('');
};
  return function(locals) {
    return t(locals, require("ejs").filters);
  }
}());
},{"../locale":"/home/ubuntu/staging/apps/build/js/locale.js","ejs":"/home/ubuntu/staging/apps/node_modules/ejs/lib/ejs.js"}],"/home/ubuntu/staging/apps/build/js/applab/blocks.js":[function(require,module,exports){
/**
 * CodeOrgApp: Applab
 *
 * Copyright 2014-2015 Code.org
 *
 */
'use strict';

var msg = require('./locale');
var commonMsg = require('../locale');
var codegen = require('../codegen');
var utils = require('../utils');
var _ = utils.getLodash();

var RANDOM_VALUE = 'random';
var HIDDEN_VALUE = '"hidden"';
var CLICK_VALUE = '"click"';
var VISIBLE_VALUE = '"visible"';

var generateSetterCode = function (opts) {
  var value = opts.ctx.getTitleValue('VALUE');
  if (value === RANDOM_VALUE) {
    var possibleValues =
      _(opts.ctx.VALUES)
        .map(function (item) { return item[1]; })
        .without(RANDOM_VALUE, HIDDEN_VALUE, CLICK_VALUE);
    value = 'Applab.randomFromArray([' + possibleValues + '])';
  }

  return 'Applab.' + opts.name + '(\'block_id_' + opts.ctx.id + '\', ' +
    (opts.extraParams ? opts.extraParams + ', ' : '') + value + ');\n';
};

// Install extensions to Blockly's language and JavaScript generator.
exports.install = function(blockly, blockInstallOptions) {
  var skin = blockInstallOptions.skin;
  var isK1 = blockInstallOptions.isK1;
  var generator = blockly.Generator.get('JavaScript');
  blockly.JavaScript = generator;

  generator.applab_eventHandlerPrologue = function() {
    return '\n';
  };

  installContainer(blockly, generator, blockInstallOptions);
};

function installContainer(blockly, generator, blockInstallOptions) {
  blockly.Blocks.applab_container = {
    helpUrl: '',
    init: function() {
      this.setHSV(184, 1.00, 0.74);
      this.appendDummyInput().appendTitle(msg.container());
      this.appendValueInput('ID');
      this.appendValueInput('HTML');
      this.setPreviousStatement(true);
      this.setInputsInline(true);
      this.setNextStatement(true);
      this.setTooltip(msg.containerTooltip());
    }
  };

  generator.applab_container = function() {
    var idParam = Blockly.JavaScript.valueToCode(this, 'ID',
        Blockly.JavaScript.ORDER_NONE) || '';
    var htmlParam = Blockly.JavaScript.valueToCode(this, 'HTML',
        Blockly.JavaScript.ORDER_NONE) || '';
    return 'Applab.container(\'block_id_' + this.id +
               '\', ' + idParam + ', ' + htmlParam + ');\n';
  };
}


},{"../codegen":"/home/ubuntu/staging/apps/build/js/codegen.js","../locale":"/home/ubuntu/staging/apps/build/js/locale.js","../utils":"/home/ubuntu/staging/apps/build/js/utils.js","./locale":"/home/ubuntu/staging/apps/build/js/applab/locale.js"}],"/home/ubuntu/staging/apps/build/js/applab/applabTurtle.js":[function(require,module,exports){
var studioApp = require('../StudioApp').singleton;
var applabCommands = require('./commands');

var applabTurtle = module.exports;

// These offset are used to ensure that the turtle image is centered over
// its x,y coordinates. The image is currently 48x48, rendered at 24x24.
var TURTLE_WIDTH = 24;
var TURTLE_HEIGHT = 24;
var TURTLE_ROTATION_OFFSET = -45;

applabTurtle.getTurtleContext = function () {
  var canvas = document.getElementById('turtleCanvas');

  if (!canvas) {
    // If there is not yet a turtleCanvas, create it:
    applabCommands.createCanvas({ 'elementId': 'turtleCanvas', 'turtleCanvas': true });
    canvas = document.getElementById('turtleCanvas');

    // And create the turtle (defaults to visible):
    Applab.turtle.visible = true;
    var divApplab = document.getElementById('divApplab');
    var turtleImage = document.createElement("img");
    turtleImage.src = studioApp.assetUrl('media/applab/723-location-arrow-toolbar-48px-centered.png');
    turtleImage.id = 'turtleImage';
    applabTurtle.updateTurtleImage(turtleImage);
    turtleImage.ondragstart = function () { return false; };
    Applab.activeScreen().appendChild(turtleImage);
  }

  return canvas.getContext("2d");
};

applabTurtle.updateTurtleImage = function (turtleImage) {
  if (!turtleImage) {
    turtleImage = document.getElementById('turtleImage');
  }
  turtleImage.style.left = (Applab.turtle.x - TURTLE_WIDTH / 2) + 'px';
  turtleImage.style.top = (Applab.turtle.y - TURTLE_HEIGHT / 2) + 'px';
  var heading = Applab.turtle.heading + TURTLE_ROTATION_OFFSET;
  var transform = 'rotate(' + heading + 'deg)';
  turtleImage.style.transform = transform;
  turtleImage.style.msTransform = transform;
  turtleImage.style.webkitTransform = transform;
};

applabTurtle.turtleSetVisibility = function (visible) {
  // call this first to ensure there is a turtle (in case this is the first API)
  applabTurtle.getTurtleContext();
  var turtleImage = document.getElementById('turtleImage');
  turtleImage.style.visibility = visible ? 'visible' : 'hidden';
};


},{"../StudioApp":"/home/ubuntu/staging/apps/build/js/StudioApp.js","./commands":"/home/ubuntu/staging/apps/build/js/applab/commands.js"}],"/home/ubuntu/staging/apps/build/js/applab/commands.js":[function(require,module,exports){
var studioApp = require('../StudioApp').singleton;
var AppStorage = require('./appStorage');
var apiTimeoutList = require('../timeoutList');
var ChartApi = require('./ChartApi');
var RGBColor = require('./rgbcolor.js');
var codegen = require('../codegen');
var keyEvent = require('./keyEvent');

var errorHandler = require('./errorHandler');
var outputApplabConsole = errorHandler.outputApplabConsole;
var outputError = errorHandler.outputError;
var ErrorLevel = errorHandler.ErrorLevel;
var applabTurtle = require('./applabTurtle');
var ChangeEventHandler = require('./ChangeEventHandler');

var OPTIONAL = true;

var applabCommands = module.exports;

/**
 * Lookup table of asset URLs. If an asset isn't listed here, initiate a
 * separate request to ensure it is downloaded without interruption. Otherwise
 * a quickly changing src could cancel the download before it can be cached by
 * the browser.
 */
var toBeCached = {};

/**
 * @param value
 * @returns {boolean} true if value is a string, number, boolean, undefined or null.
 *     returns false for other values, including instances of Number or String.
 */
function isPrimitiveType(value) {
  switch (typeof value) {
    case 'string':
    case 'number':
    case 'boolean':
    case 'undefined':
      return true;
    case 'object':
      return (value === null);
    default:
      return false;
  }
}

function apiValidateType(opts, funcName, varName, varValue, expectedType, opt) {
  var validatedTypeKey = 'validated_type_' + varName;
  if (typeof opts[validatedTypeKey] === 'undefined') {
    var properType;
    if (expectedType === 'color') {
      // Special handling for colors, must be a string and a valid RGBColor:
      properType = (typeof varValue === 'string');
      if (properType) {
        var color = new RGBColor(varValue);
        properType = color.ok;
      }
    } else if (expectedType === 'uistring') {
      properType = (typeof varValue === 'string') ||
                   (typeof varValue === 'number') ||
                   (typeof varValue === 'boolean');
    } else if (expectedType === 'function') {
      // Special handling for functions, it must be an interpreter function:
      properType = (typeof varValue === 'object') && (varValue.type === 'function');
    } else if (expectedType === 'number') {
      properType = (typeof varValue === 'number' ||
                    (typeof varValue === 'string' && !isNaN(varValue)));
    } else if (expectedType === 'primitive') {
      properType = isPrimitiveType(varValue);
      if (!properType) {
        // Ensure a descriptive error message is displayed.
        expectedType = 'string, number, boolean, undefined or null';
      }
    } else if (expectedType === 'array') {
      properType = Array.isArray(varValue);
    } else {
      properType = (typeof varValue === expectedType);
    }
    properType = properType || (opt === OPTIONAL && (typeof varValue === 'undefined'));
    if (!properType) {
      var line = 1 + Applab.JSInterpreter.getNearestUserCodeLine();
      var errorString = funcName + "() " + varName + " parameter value (" +
        varValue + ") is not a " + expectedType + ".";
      outputError(errorString, ErrorLevel.WARNING, line);
    }
    opts[validatedTypeKey] = properType;
  }
}

function apiValidateTypeAndRange(opts, funcName, varName, varValue,
                                 expectedType, minValue, maxValue, opt) {
  var validatedTypeKey = 'validated_type_' + varName;
  var validatedRangeKey = 'validated_range_' + varName;
  apiValidateType(opts, funcName, varName, varValue, expectedType, opt);
  if (opts[validatedTypeKey] && typeof opts[validatedRangeKey] === 'undefined') {
    var inRange = (typeof minValue === 'undefined') || (varValue >= minValue);
    if (inRange) {
      inRange = (typeof maxValue === 'undefined') || (varValue <= maxValue);
    }
    inRange = inRange || (opt === OPTIONAL && (typeof varValue === 'undefined'));
    if (!inRange) {
      var line = 1 + Applab.JSInterpreter.getNearestUserCodeLine();
      var errorString = funcName + "() " + varName + " parameter value (" +
        varValue + ") is not in the expected range.";
      outputError(errorString, ErrorLevel.WARNING, line);
    }
    opts[validatedRangeKey] = inRange;
  }
}

function apiValidateActiveCanvas(opts, funcName) {
  var validatedActiveCanvasKey = 'validated_active_canvas';
  if (!opts || typeof opts[validatedActiveCanvasKey] === 'undefined') {
    var activeCanvas = Boolean(Applab.activeCanvas);
    if (!activeCanvas) {
      var line = 1 + Applab.JSInterpreter.getNearestUserCodeLine();
      var errorString = funcName + "() called without an active canvas. Call " +
        "createCanvas() first.";
      outputError(errorString, ErrorLevel.WARNING, line);
    }
    if (opts) {
      opts[validatedActiveCanvasKey] = activeCanvas;
    }
  }
}

function apiValidateDomIdExistence(opts, funcName, varName, id, shouldExist) {
  var divApplab = document.getElementById('divApplab');
  var validatedTypeKey = 'validated_type_' + varName;
  var validatedDomKey = 'validated_id_' + varName;
  apiValidateType(opts, funcName, varName, id, 'string');
  if (opts[validatedTypeKey] && typeof opts[validatedDomKey] === 'undefined') {
    var element = document.getElementById(id);
    var exists = Boolean(element && divApplab.contains(element));
    var valid = exists == shouldExist;
    if (!valid) {
      var line = 1 + Applab.JSInterpreter.getNearestUserCodeLine();
      var errorString = funcName + "() " + varName +
        " parameter refers to an id (" +id + ") which " +
        (exists ? "already exists." : "does not exist.");
      outputError(errorString, ErrorLevel.WARNING, line);
    }
    opts[validatedDomKey] = valid;
  }
}

// (brent) We may in the future also provide a second option that allows you to
// reset the state of the screen to it's original (design mode) state.
applabCommands.setScreen = function (opts) {
  apiValidateDomIdExistence(opts, 'setScreen', 'screenId', opts.screenId, true);
  var element = document.getElementById(opts.screenId);
  var divApplab = document.getElementById('divApplab');
  if (!divApplab.contains(element)) {
    return;
  }

  Applab.changeScreen(opts.screenId);
};

applabCommands.container = function (opts) {
  var newDiv = document.createElement("div");
  if (typeof opts.elementId !== "undefined") {
    newDiv.id = opts.elementId;
  }
  newDiv.innerHTML = opts.html;
  newDiv.style.position = 'relative';

  return Boolean(Applab.activeScreen().appendChild(newDiv));
};

applabCommands.write = function (opts) {
  apiValidateType(opts, 'write', 'text', opts.html, 'uistring');
  return applabCommands.container(opts);
};

applabCommands.button = function (opts) {
  // PARAMNAME: button: id vs. buttonId
  apiValidateDomIdExistence(opts, 'button', 'id', opts.elementId, false);
  apiValidateType(opts, 'button', 'text', opts.text, 'uistring');

  var newButton = document.createElement("button");
  var textNode = document.createTextNode(opts.text);
  newButton.id = opts.elementId;
  newButton.style.position = 'relative';
  newButton.style.color = '#fff';
  newButton.style.backgroundColor = '#1abc9c';

  return Boolean(newButton.appendChild(textNode) &&
    Applab.activeScreen().appendChild(newButton));
};

applabCommands.image = function (opts) {
  apiValidateType(opts, 'image', 'id', opts.elementId, 'string');
  apiValidateType(opts, 'image', 'url', opts.src, 'string');

  var newImage = document.createElement("img");
  newImage.src = Applab.maybeAddAssetPathPrefix(opts.src);
  newImage.id = opts.elementId;
  newImage.style.position = 'relative';

  return Boolean(Applab.activeScreen().appendChild(newImage));
};

applabCommands.imageUploadButton = function (opts) {
  // To avoid showing the ugly fileupload input element, we create a label
  // element with an img-upload class that will ensure it looks like a button
  var newLabel = document.createElement("label");
  var textNode = document.createTextNode(opts.text);
  newLabel.id = opts.elementId;
  newLabel.className = 'img-upload';
  newLabel.style.position = 'relative';

  // We then create an offscreen input element and make it a child of the new
  // label element
  var newInput = document.createElement("input");
  newInput.type = "file";
  newInput.accept = "image/*";
  newInput.capture = "camera";
  newInput.style.position = "absolute";
  newInput.style.left = "-9999px";

  return Boolean(newLabel.appendChild(newInput) &&
                 newLabel.appendChild(textNode) &&
                 Applab.activeScreen().appendChild(newLabel));
};

applabCommands.show = function (opts) {
  applabTurtle.turtleSetVisibility(true);
};

applabCommands.hide = function (opts) {
  applabTurtle.turtleSetVisibility(false);
};

applabCommands.moveTo = function (opts) {
  apiValidateType(opts, 'moveTo', 'x', opts.x, 'number');
  apiValidateType(opts, 'moveTo', 'y', opts.y, 'number');
  var ctx = applabTurtle.getTurtleContext();
  if (ctx) {
    ctx.beginPath();
    ctx.moveTo(Applab.turtle.x, Applab.turtle.y);
    Applab.turtle.x = opts.x;
    Applab.turtle.y = opts.y;
    ctx.lineTo(Applab.turtle.x, Applab.turtle.y);
    ctx.stroke();
    applabTurtle.updateTurtleImage();
  }
};

applabCommands.move = function (opts) {
  apiValidateType(opts, 'move', 'x', opts.x, 'number');
  apiValidateType(opts, 'move', 'y', opts.y, 'number');
  opts.x += Applab.turtle.x;
  opts.y += Applab.turtle.y;
  applabCommands.moveTo(opts);
};

applabCommands.moveForward = function (opts) {
  apiValidateType(opts, 'moveForward', 'pixels', opts.distance, 'number', OPTIONAL);
  var newOpts = {};
  var distance = 25;
  if (typeof opts.distance !== 'undefined') {
    distance = opts.distance;
  }
  newOpts.x = Applab.turtle.x +
    distance * Math.sin(2 * Math.PI * Applab.turtle.heading / 360);
  newOpts.y = Applab.turtle.y -
    distance * Math.cos(2 * Math.PI * Applab.turtle.heading / 360);
  applabCommands.moveTo(newOpts);
};

applabCommands.moveBackward = function (opts) {
  apiValidateType(opts, 'moveBackward', 'pixels', opts.distance, 'number', OPTIONAL);
  var distance = -25;
  if (typeof opts.distance !== 'undefined') {
    distance = -opts.distance;
  }
  applabCommands.moveForward({'distance': distance });
};

applabCommands.turnRight = function (opts) {
  apiValidateType(opts, 'turnRight', 'angle', opts.degrees, 'number', OPTIONAL);
  // call this first to ensure there is a turtle (in case this is the first API)
  applabTurtle.getTurtleContext();

  var degrees = 90;
  if (typeof opts.degrees !== 'undefined') {
    degrees = opts.degrees;
  }

  Applab.turtle.heading += degrees;
  Applab.turtle.heading = (Applab.turtle.heading + 360) % 360;
  applabTurtle.updateTurtleImage();
};

applabCommands.turnLeft = function (opts) {
  apiValidateType(opts, 'turnLeft', 'angle', opts.degrees, 'number', OPTIONAL);
  var degrees = -90;
  if (typeof opts.degrees !== 'undefined') {
    degrees = -opts.degrees;
  }
  applabCommands.turnRight({'degrees': degrees });
};

applabCommands.turnTo = function (opts) {
  apiValidateType(opts, 'turnTo', 'angle', opts.direction, 'number');
  var degrees = opts.direction - Applab.turtle.heading;
  applabCommands.turnRight({'degrees': degrees });
};

// Turn along an arc with a specified radius (by default, turn clockwise, so
// the center of the arc is 90 degrees clockwise of the current heading)
// if opts.counterclockwise, the center point is 90 degrees counterclockwise

applabCommands.arcRight = function (opts) {
  apiValidateType(opts, 'arcRight', 'angle', opts.degrees, 'number');
  apiValidateType(opts, 'arcRight', 'radius', opts.radius, 'number');

  // call this first to ensure there is a turtle (in case this is the first API)
  var centerAngle = opts.counterclockwise ? -90 : 90;
  var clockwiseDegrees = opts.counterclockwise ? -opts.degrees : opts.degrees;
  var ctx = applabTurtle.getTurtleContext();
  if (ctx) {
    var centerX = Applab.turtle.x +
      opts.radius * Math.sin(2 * Math.PI * (Applab.turtle.heading + centerAngle) / 360);
    var centerY = Applab.turtle.y -
      opts.radius * Math.cos(2 * Math.PI * (Applab.turtle.heading + centerAngle) / 360);

    var startAngle =
      2 * Math.PI * (Applab.turtle.heading + (opts.counterclockwise ? 0 : 180)) / 360;
    var endAngle = startAngle + (2 * Math.PI * clockwiseDegrees / 360);

    ctx.beginPath();
    ctx.arc(centerX, centerY, opts.radius, startAngle, endAngle, opts.counterclockwise);
    ctx.stroke();

    Applab.turtle.heading = (Applab.turtle.heading + clockwiseDegrees + 360) % 360;
    var xMovement = opts.radius * Math.cos(2 * Math.PI * Applab.turtle.heading / 360);
    var yMovement = opts.radius * Math.sin(2 * Math.PI * Applab.turtle.heading / 360);
    Applab.turtle.x = centerX + (opts.counterclockwise ? xMovement : -xMovement);
    Applab.turtle.y = centerY + (opts.counterclockwise ? yMovement : -yMovement);
    applabTurtle.updateTurtleImage();
  }
};

applabCommands.arcLeft = function (opts) {
  apiValidateType(opts, 'arcLeft', 'angle', opts.degrees, 'number');
  apiValidateType(opts, 'arcLeft', 'radius', opts.radius, 'number');

  opts.counterclockwise = true;
  applabCommands.arcRight(opts);
};

applabCommands.getX = function (opts) {
  var ctx = applabTurtle.getTurtleContext();
  return Applab.turtle.x;
};

applabCommands.getY = function (opts) {
  var ctx = applabTurtle.getTurtleContext();
  return Applab.turtle.y;
};

applabCommands.getDirection = function (opts) {
  var ctx = applabTurtle.getTurtleContext();
  return Applab.turtle.heading;
};

applabCommands.dot = function (opts) {
  apiValidateTypeAndRange(opts, 'dot', 'radius', opts.radius, 'number', 0.0001);
  var ctx = applabTurtle.getTurtleContext();
  if (ctx && opts.radius > 0) {
    ctx.beginPath();
    if (Applab.turtle.penUpColor) {
      // If the pen is up and the color has been changed, use that color:
      ctx.strokeStyle = Applab.turtle.penUpColor;
    }
    var savedLineWidth = ctx.lineWidth;
    ctx.lineWidth = 1;
    ctx.arc(Applab.turtle.x, Applab.turtle.y, opts.radius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
    if (Applab.turtle.penUpColor) {
      // If the pen is up, reset strokeStyle back to transparent:
      ctx.strokeStyle = "rgba(255, 255, 255, 0)";
    }
    ctx.lineWidth = savedLineWidth;
    return true;
  }

};

applabCommands.penUp = function (opts) {
  var ctx = applabTurtle.getTurtleContext();
  if (ctx) {
    if (ctx.strokeStyle !== "rgba(255, 255, 255, 0)") {
      Applab.turtle.penUpColor = ctx.strokeStyle;
      ctx.strokeStyle = "rgba(255, 255, 255, 0)";
    }
  }
};

applabCommands.penDown = function (opts) {
  var ctx = applabTurtle.getTurtleContext();
  if (ctx && Applab.turtle.penUpColor) {
    ctx.strokeStyle = Applab.turtle.penUpColor;
    delete Applab.turtle.penUpColor;
  }
};

applabCommands.penWidth = function (opts) {
  apiValidateTypeAndRange(opts, 'penWidth', 'width', opts.width, 'number', 0.0001);
  var ctx = applabTurtle.getTurtleContext();
  if (ctx) {
    ctx.lineWidth = opts.width;
  }
};

applabCommands.penColorInternal = function (rgbstring) {
  var ctx = applabTurtle.getTurtleContext();
  if (ctx) {
    if (Applab.turtle.penUpColor) {
      // pen is currently up, store this color for pen down
      Applab.turtle.penUpColor = rgbstring;
    } else {
      ctx.strokeStyle = rgbstring;
    }
    ctx.fillStyle = rgbstring;
  }
};

applabCommands.penColor = function (opts) {
  apiValidateType(opts, 'penColor', 'color', opts.color, 'color');
  applabCommands.penColorInternal(opts.color);
};

applabCommands.penRGB = function (opts) {
  // PARAMNAME: penRGB: red vs. r
  // PARAMNAME: penRGB: green vs. g
  // PARAMNAME: penRGB: blue vs. b
  apiValidateTypeAndRange(opts, 'penRGB', 'r', opts.r, 'number', 0, 255);
  apiValidateTypeAndRange(opts, 'penRGB', 'g', opts.g, 'number', 0, 255);
  apiValidateTypeAndRange(opts, 'penRGB', 'b', opts.b, 'number', 0, 255);
  apiValidateTypeAndRange(opts, 'penRGB', 'a', opts.a, 'number', 0, 1, OPTIONAL);
  var alpha = (typeof opts.a === 'undefined') ? 1 : opts.a;
  var rgbstring = "rgba(" + opts.r + "," + opts.g + "," + opts.b + "," + alpha + ")";
  applabCommands.penColorInternal(rgbstring);
};

applabCommands.speed = function (opts) {
  // DOCBUG: range is 0-100, not 1-100
  apiValidateTypeAndRange(opts, 'speed', 'value', opts.percent, 'number', 0, 100);
  if (opts.percent >= 0 && opts.percent <= 100) {
    var sliderSpeed = opts.percent / 100;
    if (Applab.speedSlider) {
      Applab.speedSlider.setValue(sliderSpeed);
    }
    Applab.scale.stepSpeed = Applab.stepSpeedFromSliderSpeed(sliderSpeed);
  }
};

applabCommands.createCanvas = function (opts) {
  // PARAMNAME: createCanvas: id vs. canvasId
  apiValidateDomIdExistence(opts, 'createCanvas', 'canvasId', opts.elementId, false);
  apiValidateType(opts, 'createCanvas', 'width', width, 'number', OPTIONAL);
  apiValidateType(opts, 'createCanvas', 'height', height, 'number', OPTIONAL);

  var newElement = document.createElement("canvas");
  var ctx = newElement.getContext("2d");
  if (newElement && ctx) {
    newElement.id = opts.elementId;
    // default width/height if params are missing
    var width = opts.width || Applab.appWidth;
    var height = opts.height || Applab.footerlessAppHeight;
    newElement.width = width;
    newElement.height = height;
    newElement.setAttribute('width', width + 'px');
    newElement.setAttribute('height', height + 'px');
    // Unlike other elements, we use absolute position, otherwise our z-index
    // doesn't work
    newElement.style.position = 'absolute';
    if (!opts.turtleCanvas) {
      // set transparent fill by default (unless it is the turtle canvas):
      ctx.fillStyle = "rgba(255, 255, 255, 0)";
    }
    ctx.lineCap = "round";

    if (!Applab.activeCanvas && !opts.turtleCanvas) {
      // If there is no active canvas and this isn't the turtleCanvas,
      // we'll make this the active canvas for subsequent API calls:
      Applab.activeCanvas = newElement;
    }

    return Boolean(Applab.activeScreen().appendChild(newElement));
  }
  return false;
};

applabCommands.setActiveCanvas = function (opts) {
  var divApplab = document.getElementById('divApplab');
  // PARAMNAME: setActiveCanvas: id vs. canvasId
  apiValidateDomIdExistence(opts, 'setActiveCanvas', 'canvasId', opts.elementId, true);
  var canvas = document.getElementById(opts.elementId);
  if (divApplab.contains(canvas)) {
    Applab.activeCanvas = canvas;
    return true;
  }
  return false;
};

applabCommands.line = function (opts) {
  apiValidateActiveCanvas(opts, 'line');
  apiValidateType(opts, 'line', 'x1', opts.x1, 'number');
  apiValidateType(opts, 'line', 'x2', opts.x2, 'number');
  apiValidateType(opts, 'line', 'y1', opts.y1, 'number');
  apiValidateType(opts, 'line', 'y2', opts.y2, 'number');
  var ctx = Applab.activeCanvas && Applab.activeCanvas.getContext("2d");
  if (ctx) {
    ctx.beginPath();
    ctx.moveTo(opts.x1, opts.y1);
    ctx.lineTo(opts.x2, opts.y2);
    ctx.stroke();
    return true;
  }
  return false;
};

applabCommands.circle = function (opts) {
  apiValidateActiveCanvas(opts, 'circle');
  // PARAMNAME: circle: centerX vs. x
  // PARAMNAME: circle: centerY vs. y
  apiValidateType(opts, 'circle', 'centerX', opts.x, 'number');
  apiValidateType(opts, 'circle', 'centerY', opts.y, 'number');
  apiValidateType(opts, 'circle', 'radius', opts.radius, 'number');
  var ctx = Applab.activeCanvas && Applab.activeCanvas.getContext("2d");
  if (ctx) {
    ctx.beginPath();
    ctx.arc(opts.x, opts.y, opts.radius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
    return true;
  }
  return false;
};

applabCommands.rect = function (opts) {
  apiValidateActiveCanvas(opts, 'rect');
  // PARAMNAME: rect: upperLeftX vs. x
  // PARAMNAME: rect: upperLeftY vs. y
  apiValidateType(opts, 'rect', 'upperLeftX', opts.x, 'number');
  apiValidateType(opts, 'rect', 'upperLeftY', opts.y, 'number');
  apiValidateType(opts, 'rect', 'width', opts.width, 'number');
  apiValidateType(opts, 'rect', 'height', opts.height, 'number');
  var ctx = Applab.activeCanvas && Applab.activeCanvas.getContext("2d");
  if (ctx) {
    ctx.beginPath();
    ctx.rect(opts.x, opts.y, opts.width, opts.height);
    ctx.fill();
    ctx.stroke();
    return true;
  }
  return false;
};

applabCommands.setStrokeWidth = function (opts) {
  apiValidateActiveCanvas(opts, 'setStrokeWidth');
  apiValidateTypeAndRange(opts, 'setStrokeWidth', 'width', opts.width, 'number', 0.0001);
  var ctx = Applab.activeCanvas && Applab.activeCanvas.getContext("2d");
  if (ctx) {
    ctx.lineWidth = opts.width;
    return true;
  }
  return false;
};

applabCommands.setStrokeColor = function (opts) {
  apiValidateActiveCanvas(opts, 'setStrokeColor');
  apiValidateType(opts, 'setStrokeColor', 'color', opts.color, 'color');
  var ctx = Applab.activeCanvas && Applab.activeCanvas.getContext("2d");
  if (ctx) {
    ctx.strokeStyle = String(opts.color);
    return true;
  }
  return false;
};

applabCommands.setFillColor = function (opts) {
  apiValidateActiveCanvas(opts, 'setFillColor');
  apiValidateType(opts, 'setFillColor', 'color', opts.color, 'color');
  var ctx = Applab.activeCanvas && Applab.activeCanvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = String(opts.color);
    return true;
  }
  return false;
};

applabCommands.clearCanvas = function (opts) {
  apiValidateActiveCanvas(opts, 'clearCanvas');
  var ctx = Applab.activeCanvas && Applab.activeCanvas.getContext("2d");
  if (ctx) {
    ctx.clearRect(0,
                  0,
                  Applab.activeCanvas.width,
                  Applab.activeCanvas.height);
    return true;
  }
  return false;
};

applabCommands.drawImage = function (opts) {
  var divApplab = document.getElementById('divApplab');
  // PARAMNAME: drawImage: imageId vs. id
  apiValidateActiveCanvas(opts, 'drawImage');
  apiValidateDomIdExistence(opts, 'drawImage', 'id', opts.imageId, true);
  apiValidateType(opts, 'drawImage', 'x', opts.x, 'number');
  apiValidateType(opts, 'drawImage', 'y', opts.y, 'number');
  var image = document.getElementById(opts.imageId);
  var ctx = Applab.activeCanvas && Applab.activeCanvas.getContext("2d");
  if (ctx && divApplab.contains(image)) {
    var xScale, yScale;
    xScale = yScale = 1;
    if (typeof opts.width !== 'undefined') {
      apiValidateType(opts, 'drawImage', 'width', opts.width, 'number');
      xScale = xScale * (opts.width / image.width);
    }
    if (typeof opts.height !== 'undefined') {
      apiValidateType(opts, 'drawImage', 'height', opts.height, 'number');
      yScale = yScale * (opts.height / image.height);
    }
    ctx.save();
    ctx.setTransform(xScale, 0, 0, yScale, opts.x, opts.y);
    ctx.drawImage(image, 0, 0);
    ctx.restore();
    return true;
  }
  return false;
};

applabCommands.getImageData = function (opts) {
  apiValidateActiveCanvas(opts, 'getImageData');
  // PARAMNAME: getImageData: all params + doc bugs
  apiValidateType(opts, 'getImageData', 'x', opts.x, 'number');
  apiValidateType(opts, 'getImageData', 'y', opts.y, 'number');
  apiValidateType(opts, 'getImageData', 'width', opts.width, 'number');
  apiValidateType(opts, 'getImageData', 'height', opts.height, 'number');
  var ctx = Applab.activeCanvas && Applab.activeCanvas.getContext("2d");
  if (ctx) {
    return ctx.getImageData(opts.x, opts.y, opts.width, opts.height);
  }
};

applabCommands.putImageData = function (opts) {
  apiValidateActiveCanvas(opts, 'putImageData');
  // PARAMNAME: putImageData: imageData vs. imgData
  // PARAMNAME: putImageData: startX vs. x
  // PARAMNAME: putImageData: startY vs. y
  apiValidateType(opts, 'putImageData', 'imgData', opts.imageData, 'object');
  apiValidateType(opts, 'putImageData', 'x', opts.x, 'number');
  apiValidateType(opts, 'putImageData', 'y', opts.y, 'number');
  var ctx = Applab.activeCanvas && Applab.activeCanvas.getContext("2d");
  if (ctx) {
    // Create tmpImageData and initialize it because opts.imageData is not
    // going to be a real ImageData object if it came from the interpreter
    var tmpImageData = ctx.createImageData(opts.imageData.width,
                                           opts.imageData.height);
    tmpImageData.data.set(opts.imageData.data);
    return ctx.putImageData(tmpImageData, opts.x, opts.y);
  }
};

applabCommands.textInput = function (opts) {
  // PARAMNAME: textInput: id vs. inputId
  apiValidateDomIdExistence(opts, 'textInput', 'id', opts.elementId, false);
  apiValidateType(opts, 'textInput', 'text', opts.text, 'uistring');

  var newInput = document.createElement("input");
  newInput.value = opts.text;
  newInput.id = opts.elementId;
  newInput.style.position = 'relative';
  newInput.style.height = '30px';
  newInput.style.width = '200px';

  return Boolean(Applab.activeScreen().appendChild(newInput));
};

applabCommands.textLabel = function (opts) {
  // PARAMNAME: textLabel: id vs. labelId
  apiValidateDomIdExistence(opts, 'textLabel', 'id', opts.elementId, false);
  apiValidateType(opts, 'textLabel', 'text', opts.text, 'uistring');
  if (typeof opts.forId !== 'undefined') {
    apiValidateDomIdExistence(opts, 'textLabel', 'forId', opts.forId, true);
  }

  var newLabel = document.createElement("label");
  var textNode = document.createTextNode(opts.text);
  newLabel.id = opts.elementId;
  newLabel.style.position = 'relative';
  var forElement = document.getElementById(opts.forId);
  if (forElement && Applab.activeScreen().contains(forElement)) {
    newLabel.setAttribute('for', opts.forId);
  }

  return Boolean(newLabel.appendChild(textNode) &&
                 Applab.activeScreen().appendChild(newLabel));
};

applabCommands.checkbox = function (opts) {
  // PARAMNAME: checkbox: id vs. checkboxId
  apiValidateDomIdExistence(opts, 'checkbox', 'id', opts.elementId, false);
  // apiValidateType(opts, 'checkbox', 'checked', opts.checked, 'boolean');

  var newCheckbox = document.createElement("input");
  newCheckbox.setAttribute("type", "checkbox");
  newCheckbox.checked = opts.checked;
  newCheckbox.id = opts.elementId;
  newCheckbox.style.position = 'relative';

  return Boolean(Applab.activeScreen().appendChild(newCheckbox));
};

applabCommands.radioButton = function (opts) {
  apiValidateDomIdExistence(opts, 'radioButton', 'id', opts.elementId, false);
  // apiValidateType(opts, 'radioButton', 'checked', opts.checked, 'boolean');
  apiValidateType(opts, 'radioButton', 'group', opts.name, 'string', OPTIONAL);

  var newRadio = document.createElement("input");
  newRadio.setAttribute("type", "radio");
  newRadio.name = opts.name;
  newRadio.checked = opts.checked;
  newRadio.id = opts.elementId;
  newRadio.style.position = 'relative';

  return Boolean(Applab.activeScreen().appendChild(newRadio));
};

applabCommands.dropdown = function (opts) {
  // PARAMNAME: dropdown: id vs. dropdownId
  apiValidateDomIdExistence(opts, 'dropdown', 'id', opts.elementId, false);

  var newSelect = document.createElement("select");

  if (opts.optionsArray) {
    for (var i = 0; i < opts.optionsArray.length; i++) {
      var option = document.createElement("option");
      apiValidateType(opts, 'dropdown', 'option_' + (i + 1), opts.optionsArray[i], 'uistring');
      option.text = opts.optionsArray[i];
      newSelect.add(option);
    }
  }
  newSelect.id = opts.elementId;
  newSelect.style.position = 'relative';
  newSelect.style.color = '#fff';
  newSelect.style.backgroundColor = '#1abc9c';

  return Boolean(Applab.activeScreen().appendChild(newSelect));
};

applabCommands.getAttribute = function (opts) {
  var divApplab = document.getElementById('divApplab');
  var element = document.getElementById(opts.elementId);
  var attribute = String(opts.attribute);
  return divApplab.contains(element) ? element[attribute] : false;
};

// Whitelist of HTML Element attributes which can be modified, to
// prevent DOM manipulation which would violate the sandbox.
var MUTABLE_ATTRIBUTES = ['innerHTML', 'scrollTop'];

applabCommands.setAttribute = function (opts) {
  var divApplab = document.getElementById('divApplab');
  var element = document.getElementById(opts.elementId);
  var attribute = String(opts.attribute);
  if (divApplab.contains(element) &&
      MUTABLE_ATTRIBUTES.indexOf(attribute) !== -1) {
    element[attribute] = opts.value;
    return true;
  }
  return false;
};

applabCommands.getText = function (opts) {
  var divApplab = document.getElementById('divApplab');
  apiValidateDomIdExistence(opts, 'getText', 'id', opts.elementId, true);

  var element = document.getElementById(opts.elementId);
  if (divApplab.contains(element)) {
    if (element.tagName === 'INPUT' || element.tagName === 'SELECT') {
      return String(element.value);
    } else if (element.tagName === 'IMG') {
      return String(element.alt);
    } else {
      return applabCommands.getElementInnerText_(element);
    }
  }
  return false;
};

applabCommands.setText = function (opts) {
  var divApplab = document.getElementById('divApplab');
  apiValidateDomIdExistence(opts, 'setText', 'id', opts.elementId, true);
  apiValidateType(opts, 'setText', 'text', opts.text, 'uistring');

  var element = document.getElementById(opts.elementId);
  if (divApplab.contains(element)) {
    if (element.tagName === 'INPUT' || element.tagName === 'SELECT') {
      element.value = opts.text;
    } else if (element.tagName === 'IMG') {
      element.alt = opts.text;
    } else {
      applabCommands.setElementInnerText_(element, opts.text);
    }
    return true;
  }
  return false;
};

/**
 * Attempts to emulate Chrome's version of innerText by way of innerHTML, only
 * for the simplified case of plain text content (in, for example, a
 * contentEditable div).
 * @param {Element} element
 * @private
 */
applabCommands.getElementInnerText_ = function (element) {
  var cleanedText = element.innerHTML;
  cleanedText = cleanedText.replace(/<div>/gi, '\n'); // Divs generate newlines
  cleanedText = cleanedText.replace(/<[^>]+>/gi, ''); // Strip all other tags

  // This next step requires some explanation
  // In multiline text it's possible for the first line to render wrapped or unwrapped.
  //     Line 1
  //     Line 2
  //   Can render as either of:
  //     Line 1<div>Line 2</div>
  //     <div>Line 1</div><div>Line 2</div>
  //
  // But leading blank lines will always render wrapped and should be preserved
  //
  //     Line 2
  //     Line 3
  //   Renders as
  //    <div><br></div><div>Line 2</div><div>Line 3</div>
  //
  // To handle this behavior we strip leading newlines UNLESS they are followed
  // by another newline, using a negative lookahead (?!)
  cleanedText = cleanedText.replace(/^\n(?!\n)/, ''); // Strip leading nondoubled newline

  cleanedText = cleanedText.replace(/&nbsp;/gi, ' '); // Unescape nonbreaking spaces
  cleanedText = cleanedText.replace(/&gt;/gi, '>');   // Unescape >
  cleanedText = cleanedText.replace(/&lt;/gi, '<');   // Unescape <
  cleanedText = cleanedText.replace(/&amp;/gi, '&');  // Unescape & (must happen last!)
  return cleanedText;
};

/**
 * Attempts to emulate Chrome's version of innerText by way of innerHTML, only
 * for the simplified case of plain text content (in, for example, a
 * contentEditable div).
 * @param {Element} element
 * @param {string} newText
 * @private
 */
applabCommands.setElementInnerText_ = function (element, newText) {
  var escapedText = newText.toString();
  escapedText = escapedText.replace(/&/g, '&amp;');   // Escape & (must happen first!)
  escapedText = escapedText.replace(/</g, '&lt;');    // Escape <
  escapedText = escapedText.replace(/>/g, '&gt;');    // Escape >
  escapedText = escapedText.replace(/  /g,' &nbsp;'); // Escape doubled spaces

  // Now wrap each line except the first line in a <div>,
  // replacing blank lines with <div><br><div>
  var lines = escapedText.split('\n');
  element.innerHTML = lines[0] + lines.slice(1).map(function (line) {
    return '<div>' + (line.length ? line : '<br>') + '</div>';
  }).join('');
};

applabCommands.getChecked = function (opts) {
  var divApplab = document.getElementById('divApplab');
  apiValidateDomIdExistence(opts, 'getChecked', 'id', opts.elementId, true);

  var element = document.getElementById(opts.elementId);
  if (divApplab.contains(element) && element.tagName === 'INPUT') {
    return element.checked;
  }
  return false;
};

applabCommands.setChecked = function (opts) {
  var divApplab = document.getElementById('divApplab');
  apiValidateDomIdExistence(opts, 'setChecked', 'id', opts.elementId, true);
  // apiValidateType(opts, 'setChecked', 'checked', opts.checked, 'boolean');

  var element = document.getElementById(opts.elementId);
  if (divApplab.contains(element) && element.tagName === 'INPUT') {
    element.checked = opts.checked;
    return true;
  }
  return false;
};

applabCommands.getImageURL = function (opts) {
  var divApplab = document.getElementById('divApplab');
  // PARAMNAME: getImageURL: id vs. imageId
  apiValidateDomIdExistence(opts, 'getImageURL', 'id', opts.elementId, true);

  var element = document.getElementById(opts.elementId);
  if (divApplab.contains(element)) {
    // We return a URL if it is an IMG element or our special img-upload label
    if (element.tagName === 'IMG') {
      return element.src;
    } else if (element.tagName === 'LABEL' && element.className === 'img-upload') {
      var fileObj = element.children[0].files[0];
      if (fileObj) {
        return window.URL.createObjectURL(fileObj);
      }
    }
  }
};

applabCommands.setImageURL = function (opts) {
  var divApplab = document.getElementById('divApplab');
  apiValidateDomIdExistence(opts, 'setImageURL', 'id', opts.elementId, true);
  apiValidateType(opts, 'setImageURL', 'url', opts.src, 'string');

  var element = document.getElementById(opts.elementId);
  if (divApplab.contains(element) && element.tagName === 'IMG') {
    element.src = Applab.maybeAddAssetPathPrefix(opts.src);

    if (!toBeCached[element.src]) {
      var img = new Image();
      img.src = element.src;
      toBeCached[element.src] = true;
    }

    return true;
  }
  return false;
};

applabCommands.playSound = function (opts) {
  apiValidateType(opts, 'playSound', 'url', opts.url, 'string');

  if (studioApp.cdoSounds) {
    var url = Applab.maybeAddAssetPathPrefix(opts.url);
    studioApp.cdoSounds.playURL(url,
                               {volume: 1.0,
                                forceHTML5: true,
                                allowHTML5Mobile: true
    });
  }
};

applabCommands.innerHTML = function (opts) {
  var divApplab = document.getElementById('divApplab');
  var div = document.getElementById(opts.elementId);
  if (divApplab.contains(div)) {
    div.innerHTML = opts.html;
    return true;
  }
  return false;
};

applabCommands.deleteElement = function (opts) {
  var divApplab = document.getElementById('divApplab');
  apiValidateDomIdExistence(opts, 'deleteElement', 'id', opts.elementId, true);

  var div = document.getElementById(opts.elementId);
  if (divApplab.contains(div)) {
    // Special check to see if the active canvas is being deleted
    if (div == Applab.activeCanvas || div.contains(Applab.activeCanvas)) {
      delete Applab.activeCanvas;
    }
    return Boolean(div.parentElement.removeChild(div));
  }
  return false;
};

applabCommands.showElement = function (opts) {
  var divApplab = document.getElementById('divApplab');
  apiValidateDomIdExistence(opts, 'showElement', 'id', opts.elementId, true);

  var div = document.getElementById(opts.elementId);
  if (divApplab.contains(div)) {
    div.style.visibility = 'visible';
    return true;
  }
  return false;
};

applabCommands.hideElement = function (opts) {
  var divApplab = document.getElementById('divApplab');
  apiValidateDomIdExistence(opts, 'hideElement', 'id', opts.elementId, true);

  var div = document.getElementById(opts.elementId);
  if (divApplab.contains(div)) {
    div.style.visibility = 'hidden';
    return true;
  }
  return false;
};

applabCommands.setStyle = function (opts) {
  var divApplab = document.getElementById('divApplab');
  var div = document.getElementById(opts.elementId);
  if (divApplab.contains(div)) {
    div.style.cssText += opts.style;
    return true;
  }
  return false;
};

applabCommands.setParent = function (opts) {
  var divApplab = document.getElementById('divApplab');
  var div = document.getElementById(opts.elementId);
  var divNewParent = document.getElementById(opts.parentId);
  if (divApplab.contains(div) && divApplab.contains(divNewParent)) {
    return Boolean(div.parentElement.removeChild(div) &&
                   divNewParent.appendChild(div));
  }
  return false;
};

applabCommands.setPosition = function (opts) {
  var divApplab = document.getElementById('divApplab');
  apiValidateDomIdExistence(opts, 'setPosition', 'id', opts.elementId, true);
  apiValidateType(opts, 'setPosition', 'x', opts.left, 'number');
  apiValidateType(opts, 'setPosition', 'y', opts.top, 'number');

  var el = document.getElementById(opts.elementId);
  if (divApplab.contains(el)) {
    el.style.position = 'absolute';
    el.style.left = opts.left + 'px';
    el.style.top = opts.top + 'px';
    var setWidthHeight = false;
    // don't set width/height if
    // (1) both parameters are undefined AND
    // (2) width/height already specified OR IMG element with width/height attributes
    if ((el.style.width.length > 0 && el.style.height.length > 0) ||
        (el.tagName === 'IMG' && el.width > 0 && el.height > 0)) {
      if (typeof opts.width !== 'undefined' || typeof opts.height !== 'undefined') {
        setWidthHeight = true;
      }
    } else {
      setWidthHeight = true;
    }
    if (setWidthHeight) {
      apiValidateType(opts, 'setPosition', 'width', opts.width, 'number');
      apiValidateType(opts, 'setPosition', 'height', opts.height, 'number');
      setSize_(opts.elementId, opts.width, opts.height);
    }
    return true;
  }
  return false;
};

applabCommands.setSize = function (opts) {
  apiValidateType(opts, 'setSize', 'width', opts.width, 'number');
  apiValidateType(opts, 'setSize', 'height', opts.height, 'number');
  setSize_(opts.elementId, opts.width, opts.height);

  return true;
};

/**
 * Logic shared between setPosition and setSize for setting the size
 */
function setSize_(elementId, width, height) {
  var element = document.getElementById(elementId);
  var divApplab = document.getElementById('divApplab');
  if (divApplab.contains(element)) {
    element.style.width = width + 'px';
    element.style.height = height + 'px';
  }
}

applabCommands.getXPosition = function (opts) {
  var divApplab = document.getElementById('divApplab');
  apiValidateDomIdExistence(opts, 'getXPosition', 'id', opts.elementId, true);

  var div = document.getElementById(opts.elementId);
  if (divApplab.contains(div)) {
    var x = div.offsetLeft;
    while (div !== divApplab) {
      // TODO (brent) using offsetParent may be ill advised:
      // This property will return null on Webkit if the element is hidden
      // (the style.display of this element or any ancestor is "none") or if the
      // style.position of the element itself is set to "fixed".
      // This property will return null on Internet Explorer (9) if the
      // style.position of the element itself is set to "fixed".
      // (Having display:none does not affect this browser.)
      div = div.offsetParent;
      x += div.offsetLeft;
    }
    return x;
  }
  return 0;
};

applabCommands.getYPosition = function (opts) {
  var divApplab = document.getElementById('divApplab');
  apiValidateDomIdExistence(opts, 'getYPosition', 'id', opts.elementId, true);

  var div = document.getElementById(opts.elementId);
  if (divApplab.contains(div)) {
    var y = div.offsetTop;
    while (div !== divApplab) {
      div = div.offsetParent;
      y += div.offsetTop;
    }
    return y;
  }
  return 0;
};

applabCommands.onEventFired = function (opts, e) {
  if (typeof e != 'undefined') {
    var div = document.getElementById('divApplab');
    var xScale = div.getBoundingClientRect().width / div.offsetWidth;
    var yScale = div.getBoundingClientRect().height / div.offsetHeight;
    var xOffset = 0;
    var yOffset = 0;
    while (div) {
      xOffset += div.offsetLeft;
      yOffset += div.offsetTop;
      div = div.offsetParent;
    }

    var applabEvent = {};
    // Pass these properties through to applabEvent:
    ['altKey', 'button', 'charCode', 'ctrlKey', 'keyCode', 'keyIdentifier',
      'keyLocation', 'location', 'metaKey', 'movementX', 'movementY', 'offsetX',
      'offsetY', 'repeat', 'shiftKey', 'type', 'which'].forEach(
      function (prop) {
        if (typeof e[prop] !== 'undefined') {
          applabEvent[prop] = e[prop];
        }
      });
    // Convert x coordinates and then pass through to applabEvent:
    ['clientX', 'pageX', 'x'].forEach(
      function (prop) {
        if (typeof e[prop] !== 'undefined') {
          applabEvent[prop] = (e[prop] - xOffset) / xScale;
        }
      });
    // Convert y coordinates and then pass through to applabEvent:
    ['clientY', 'pageY', 'y'].forEach(
      function (prop) {
        if (typeof e[prop] !== 'undefined') {
          applabEvent[prop] = (e[prop] - yOffset) / yScale;
        }
      });
    // Replace DOM elements with IDs and then add them to applabEvent:
    ['fromElement', 'srcElement', 'currentTarget', 'relatedTarget', 'target',
      'toElement'].forEach(
      function (prop) {
        if (e[prop]) {
          applabEvent[prop + "Id"] = e[prop].id;
        }
      });
    // Attempt to populate key property (not yet supported in Chrome/Safari):
    //
    // keyup/down has no charCode and can be translated with the keyEvent[] map
    // keypress can use charCode
    //
    var keyProp = e.charCode ? String.fromCharCode(e.charCode) : keyEvent[e.keyCode];
    if (typeof keyProp !== 'undefined') {
      applabEvent.key = keyProp;
    }

    // Push a function call on the queue with an array of arguments consisting
    // of the applabEvent parameter (and any extraArgs originally supplied)
    Applab.JSInterpreter.queueEvent(opts.func, [applabEvent].concat(opts.extraArgs));
  } else {
    Applab.JSInterpreter.queueEvent(opts.func, opts.extraArgs);
  }
  if (Applab.JSInterpreter) {
    // Execute the interpreter and if a return value is sent back from the
    // interpreter's event handler, pass that back in the native world

    // NOTE: the interpreter will not execute forever, if the event handler
    // takes too long, executeInterpreter() will return and the native side
    // will just see 'undefined' as the return value. The rest of the interpreter
    // event handler will run in the next onTick(), but the return value will
    // no longer have any effect.
    Applab.JSInterpreter.executeInterpreter(false, true);
    return Applab.JSInterpreter.lastCallbackRetVal;
  }
};

applabCommands.onEvent = function (opts) {
  var divApplab = document.getElementById('divApplab');
  // Special case the id of 'body' to mean the app's container (divApplab)
  // TODO (cpirich): apply this logic more broadly (setStyle, etc.)
  if (opts.elementId === 'body') {
    opts.elementId = 'divApplab';
  } else {
    apiValidateDomIdExistence(opts, 'onEvent', 'id', opts.elementId, true);
  }
  apiValidateType(opts, 'onEvent', 'type', opts.eventName, 'string');
  // PARAMNAME: onEvent: callback vs. callbackFunction
  apiValidateType(opts, 'onEvent', 'callback', opts.func, 'function');
  var domElement = document.getElementById(opts.elementId);
  if (divApplab.contains(domElement)) {
    if (domElement.tagName.toUpperCase() === 'DIV' && domElement.contentEditable && opts.eventName === 'change') {
      // contentEditable divs don't generate a change event, so
      // synthesize one here.
      var callback = applabCommands.onEventFired.bind(this, opts);
      ChangeEventHandler.addChangeEventHandler(domElement, callback);
      return true;
    }
    switch (opts.eventName) {
      /*
      Check for a specific set of Hammer v1 event names (full set below) and if
      we find a match, instantiate Hammer on that element

      TODO (cpirich): review the following:
      * whether using Hammer v1 events is the right choice
      * choose the specific list of events
      * consider instantiating Hammer just once per-element or on divApplab
      * review use of preventDefault

      case 'hold':
      case 'tap':
      case 'doubletap':
      case 'swipe':
      case 'swipeup':
      case 'swipedown':
      case 'swipeleft':
      case 'swiperight':
      case 'rotate':
      case 'release':
      case 'gesture':
      case 'pinch':
      case 'pinchin':
      case 'pinchout':
        var hammerElement = new Hammer(divApplab, { 'preventDefault': true });
        hammerElement.on(opts.eventName,
                         applabCommands.onEventFired.bind(this, opts));
        break;
      */
      case 'click':
      case 'change':
      case 'keyup':
      case 'mousemove':
      case 'dblclick':
      case 'mousedown':
      case 'mouseup':
      case 'mouseover':
      case 'mouseout':
      case 'keydown':
      case 'keypress':
      case 'input':
        // For now, we're not tracking how many of these we add and we don't allow
        // the user to detach the handler. We detach all listeners by cloning the
        // divApplab DOM node inside of reset()
        domElement.addEventListener(
            opts.eventName,
            applabCommands.onEventFired.bind(this, opts));
        break;
      default:
        return false;
    }
    return true;
  }
  return false;
};

applabCommands.onHttpRequestEvent = function (opts) {
  // Ensure that this event was requested by the same instance of the interpreter
  // that is currently active before proceeding...
  if (opts.JSInterpreter === Applab.JSInterpreter) {
    if (this.readyState === 4) {
      Applab.JSInterpreter.queueEvent(
        opts.func,
        [ Number(this.status),
          String(this.getResponseHeader('content-type')),
          String(this.responseText)
        ]);
    }
  }
};

applabCommands.startWebRequest = function (opts) {
  apiValidateType(opts, 'startWebRequest', 'url', opts.url, 'string');
  apiValidateType(opts, 'startWebRequest', 'callback', opts.func, 'function');
  opts.JSInterpreter = Applab.JSInterpreter;
  var req = new XMLHttpRequest();
  req.onreadystatechange = applabCommands.onHttpRequestEvent.bind(req, opts);
  req.open('GET', opts.url, true);
  req.send();
};

applabCommands.onTimerFired = function (opts) {
  // ensure that this event came from the active interpreter instance:
  Applab.JSInterpreter.queueEvent(opts.func);
  // NOTE: the interpreter will not execute forever, if the event handler
  // takes too long, executeInterpreter() will return and the rest of the
  // user's code will execute in the next onTick()
  Applab.JSInterpreter.executeInterpreter(false, true);
};

applabCommands.setTimeout = function (opts) {
  // PARAMNAME: setTimeout: callback vs. function
  // PARAMNAME: setTimeout: ms vs. milliseconds
  apiValidateType(opts, 'setTimeout', 'callback', opts.func, 'function');
  apiValidateType(opts, 'setTimeout', 'milliseconds', opts.milliseconds, 'number');

  return apiTimeoutList.setTimeout(applabCommands.onTimerFired.bind(this, opts), opts.milliseconds);
};

applabCommands.clearTimeout = function (opts) {
  apiValidateType(opts, 'clearTimeout', 'timeout', opts.timeoutId, 'number');
  // NOTE: we do not currently check to see if this is a timer created by
  // our applabCommands.setTimeout() function
  apiTimeoutList.clearTimeout(opts.timeoutId);
};

applabCommands.setInterval = function (opts) {
  // PARAMNAME: setInterval: callback vs. function
  // PARAMNAME: setInterval: ms vs. milliseconds
  apiValidateType(opts, 'setInterval', 'callback', opts.func, 'function');
  apiValidateType(opts, 'setInterval', 'milliseconds', opts.milliseconds, 'number');

  return apiTimeoutList.setInterval(applabCommands.onTimerFired.bind(this, opts), opts.milliseconds);
};

applabCommands.clearInterval = function (opts) {
  apiValidateType(opts, 'clearInterval', 'interval', opts.intervalId, 'number');
  // NOTE: we do not currently check to see if this is a timer created by
  // our applabCommands.setInterval() function
  apiTimeoutList.clearInterval(opts.intervalId);
};

applabCommands.createRecord = function (opts) {
  // PARAMNAME: createRecord: table vs. tableName
  // PARAMNAME: createRecord: callback vs. callbackFunction
  apiValidateType(opts, 'createRecord', 'table', opts.table, 'string');
  apiValidateType(opts, 'createRecord', 'record', opts.record, 'object');
  apiValidateType(opts, 'createRecord', 'record.id', opts.record.id, 'undefined');
  apiValidateType(opts, 'createRecord', 'callback', opts.onSuccess, 'function', OPTIONAL);
  apiValidateType(opts, 'createRecord', 'onError', opts.onError, 'function', OPTIONAL);
  opts.JSInterpreter = Applab.JSInterpreter;
  var onSuccess = applabCommands.handleCreateRecord.bind(this, opts);
  var onError = errorHandler.handleError.bind(this, opts);
  AppStorage.createRecord(opts.table, opts.record, onSuccess, onError);
};

applabCommands.handleCreateRecord = function(opts, record) {
  // Ensure that this event was requested by the same instance of the interpreter
  // that is currently active before proceeding...
  if (opts.onSuccess && opts.JSInterpreter === Applab.JSInterpreter) {
    Applab.JSInterpreter.queueEvent(opts.onSuccess, [record]);
  }
};

applabCommands.getKeyValue = function(opts) {
  // PARAMNAME: getKeyValue: callback vs. callbackFunction
  apiValidateType(opts, 'getKeyValue', 'key', opts.key, 'string');
  apiValidateType(opts, 'getKeyValue', 'callback', opts.onSuccess, 'function');
  apiValidateType(opts, 'getKeyValue', 'onError', opts.onError, 'function', OPTIONAL);
  opts.JSInterpreter = Applab.JSInterpreter;
  var onSuccess = applabCommands.handleReadValue.bind(this, opts);
  var onError = errorHandler.handleError.bind(this, opts);
  AppStorage.getKeyValue(opts.key, onSuccess, onError);
};

applabCommands.handleReadValue = function(opts, value) {
  // Ensure that this event was requested by the same instance of the interpreter
  // that is currently active before proceeding...
  if (opts.onSuccess && opts.JSInterpreter === Applab.JSInterpreter) {
    Applab.JSInterpreter.queueEvent(opts.onSuccess, [value]);
  }
};

applabCommands.setKeyValue = function(opts) {
  // PARAMNAME: setKeyValue: callback vs. callbackFunction
  apiValidateType(opts, 'setKeyValue', 'key', opts.key, 'string');
  apiValidateType(opts, 'setKeyValue', 'value', opts.value, 'primitive');
  apiValidateType(opts, 'setKeyValue', 'callback', opts.onSuccess, 'function', OPTIONAL);
  apiValidateType(opts, 'setKeyValue', 'onError', opts.onError, 'function', OPTIONAL);
  opts.JSInterpreter = Applab.JSInterpreter;
  var onSuccess = applabCommands.handleSetKeyValue.bind(this, opts);
  var onError = errorHandler.handleError.bind(this, opts);
  AppStorage.setKeyValue(opts.key, opts.value, onSuccess, onError);
};

applabCommands.handleSetKeyValue = function(opts) {
  // Ensure that this event was requested by the same instance of the interpreter
  // that is currently active before proceeding...
  if (opts.onSuccess && opts.JSInterpreter === Applab.JSInterpreter) {
    Applab.JSInterpreter.queueEvent(opts.onSuccess);
  }
};

applabCommands.readRecords = function (opts) {
  // PARAMNAME: readRecords: table vs. tableName
  // PARAMNAME: readRecords: callback vs. callbackFunction
  // PARAMNAME: readRecords: terms vs. searchTerms
  apiValidateType(opts, 'readRecords', 'table', opts.table, 'string');
  apiValidateType(opts, 'readRecords', 'searchTerms', opts.searchParams, 'object');
  apiValidateType(opts, 'readRecords', 'callback', opts.onSuccess, 'function');
  apiValidateType(opts, 'readRecords', 'onError', opts.onError, 'function', OPTIONAL);
  opts.JSInterpreter = Applab.JSInterpreter;
  var onSuccess = applabCommands.handleReadRecords.bind(this, opts);
  var onError = errorHandler.handleError.bind(this, opts);
  AppStorage.readRecords(opts.table, opts.searchParams, onSuccess, onError);
};

applabCommands.handleReadRecords = function(opts, records) {
  // Ensure that this event was requested by the same instance of the interpreter
  // that is currently active before proceeding...
  if (opts.onSuccess && opts.JSInterpreter === Applab.JSInterpreter) {
    Applab.JSInterpreter.queueEvent(opts.onSuccess, [records]);
  }
};

applabCommands.updateRecord = function (opts) {
  // PARAMNAME: updateRecord: table vs. tableName
  // PARAMNAME: updateRecord: callback vs. callbackFunction
  apiValidateType(opts, 'updateRecord', 'table', opts.table, 'string');
  apiValidateType(opts, 'updateRecord', 'record', opts.record, 'object');
  apiValidateTypeAndRange(opts, 'updateRecord', 'record.id', opts.record.id, 'number', 1, Infinity);
  apiValidateType(opts, 'updateRecord', 'callback', opts.onSuccess, 'function', OPTIONAL);
  apiValidateType(opts, 'updateRecord', 'onError', opts.onError, 'function', OPTIONAL);
  opts.JSInterpreter = Applab.JSInterpreter;
  var onSuccess = applabCommands.handleUpdateRecord.bind(this, opts);
  var onError = errorHandler.handleError.bind(this, opts);
  AppStorage.updateRecord(opts.table, opts.record, onSuccess, onError);
};

applabCommands.handleUpdateRecord = function(opts, record) {
  // Ensure that this event was requested by the same instance of the interpreter
  // that is currently active before proceeding...
  if (opts.onSuccess && opts.JSInterpreter === Applab.JSInterpreter) {
    Applab.JSInterpreter.queueEvent(opts.onSuccess, [record]);
  }
};

applabCommands.deleteRecord = function (opts) {
  // PARAMNAME: deleteRecord: table vs. tableName
  // PARAMNAME: deleteRecord: callback vs. callbackFunction
  apiValidateType(opts, 'deleteRecord', 'table', opts.table, 'string');
  apiValidateType(opts, 'deleteRecord', 'record', opts.record, 'object');
  apiValidateTypeAndRange(opts, 'deleteRecord', 'record.id', opts.record.id, 'number', 1, Infinity);
  apiValidateType(opts, 'deleteRecord', 'callback', opts.onSuccess, 'function', OPTIONAL);
  apiValidateType(opts, 'deleteRecord', 'onError', opts.onError, 'function', OPTIONAL);
  opts.JSInterpreter = Applab.JSInterpreter;
  var onSuccess = applabCommands.handleDeleteRecord.bind(this, opts);
  var onError = errorHandler.handleError.bind(this, opts);
  AppStorage.deleteRecord(opts.table, opts.record, onSuccess, onError);
};

applabCommands.handleDeleteRecord = function(opts) {
  // Ensure that this event was requested by the same instance of the interpreter
  // that is currently active before proceeding...
  if (opts.onSuccess && opts.JSInterpreter === Applab.JSInterpreter) {
    Applab.JSInterpreter.queueEvent(opts.onSuccess);
  }
};

applabCommands.getUserId = function (opts) {
  if (!Applab.user.applabUserId) {
    throw new Error("User ID failed to load.");
  }
  return Applab.user.applabUserId;
};

/**
 * How to execute the 'drawChartFromRecords' function.
 * Delegates most work to ChartApi.drawChartFromRecords, but a few things are
 * handled directly at this layer:
 *   - Type validation (before execution)
 *   - Queueing callbacks (after execution)
 *   - Reporting errors and warnings (after execution)
 * @see {ChartApi}
 * @param {Object} opts
 * @param {string} opts.chartId
 * @param {ChartType} opts.chartType
 * @param {string} opts.tableName
 * @param {string[]} opts.columns
 * @param {Object} opts.options
 * @param {function} opts.callback
 */
applabCommands.drawChartFromRecords = function (opts) {
  apiValidateType(opts, 'drawChartFromRecords', 'chartId', opts.chartId, 'string');
  apiValidateType(opts, 'drawChartFromRecords', 'chartType', opts.chartType, 'string');
  apiValidateType(opts, 'drawChartFromRecords', 'tableName', opts.tableName, 'string');
  apiValidateType(opts, 'drawChartFromRecords', 'columns', opts.columns, 'array');
  apiValidateType(opts, 'drawChartFromRecords', 'options', opts.options, 'object', OPTIONAL);
  apiValidateType(opts, 'drawChartFromRecords', 'callback', opts.callback, 'function', OPTIONAL);
  apiValidateDomIdExistence(opts, 'drawChartFromRecords', 'chartId', opts.chartId, true);

  // Bind a reference to the current interpreter so we can later make sure we're
  // not doing anything asynchronous across re-runs.
  var jsInterpreter = Applab.JSInterpreter;

  var currentLineNumber = getCurrentLineNumber(jsInterpreter);

  var chartApi = new ChartApi();

  /**
   * What to do after drawing the chart succeeds/completes:
   *   1. Report any warnings, attributed to the current line.
   *   2. Queue the user-provided success callback.
   *
   * @param {Error[]} warnings - Any non-terminal errors generated by the
   *        drawChartFromRecords call, which we will report on after the fact
   *        without halting execution.
   */
  var onSuccess = function () {
    stopLoadingSpinnerFor(opts.chartId);
    chartApi.warnings.forEach(function (warning) {
      outputError(warning.message, ErrorLevel.WARNING, currentLineNumber);
    });
    queueCallback(jsInterpreter, opts.callback);
  };

  /**
   * What to do if something goes wrong:
   *   1. Report the error.
   *
   * @param {Error} error - A rejected promise usually passes an error.
   */
  var onError = function (error) {
    stopLoadingSpinnerFor(opts.chartId);
    outputError(error.message, ErrorLevel.ERROR, currentLineNumber);
  };

  startLoadingSpinnerFor(opts.chartId);
  chartApi.drawChartFromRecords(
      opts.chartId,
      opts.chartType,
      opts.tableName,
      opts.columns,
      opts.options
  ).then(onSuccess, onError);
};

/**
 * If the element is found, add the 'loading' class to it so that it
 * displays the loading spinner.
 * @param {string} elementId
 */
function startLoadingSpinnerFor(elementId) {
  var element = document.getElementById(elementId);
  if (!element) {
    return;
  }

  // Add 'loading' class
  element.className += ' loading';
}

/**
 * If the element is found, make sure to remove the 'loading' class from it
 * so that it hides the loading spinner.
 * @param {string} elementId
 */
function stopLoadingSpinnerFor(elementId) {
  var element = document.getElementById(elementId);
  if (!element) {
    return;
  }

  // Remove 'loading' class
  element.className = element.className.split(/\s+/).filter(function (x) {
    return !(/loading/i.test(x));
  }).join(' ');
}

/**
 * Queue the given callback in the given interpreter IF the callback exists
 * AND the interpreter is still the active interpreter for Applab.
 * @param {JSInterpreter} jsInterpreter
 * @param {function} callback
 */
var queueCallback = function (jsInterpreter, callback) {
  // Ensure that this event was requested by the same instance of the interpreter
  // that is currently active, so we don't queue callbacks for slow async events
  // from past executions of the app.
  // (We use a different interpreter instance for every run.)
  if (callback && jsInterpreter === Applab.JSInterpreter) {
    Applab.JSInterpreter.queueEvent(callback);
  }
};

/**
 * For the provided interpreter, get the nearest line number in user code
 * up the stack from the last executed command.
 * @param {JSInterpreter} jsInterpreter
 * @returns {number}
 */
var getCurrentLineNumber = function (jsInterpreter) {
  return 1 + jsInterpreter.getNearestUserCodeLine();
};


},{"../StudioApp":"/home/ubuntu/staging/apps/build/js/StudioApp.js","../codegen":"/home/ubuntu/staging/apps/build/js/codegen.js","../timeoutList":"/home/ubuntu/staging/apps/build/js/timeoutList.js","./ChangeEventHandler":"/home/ubuntu/staging/apps/build/js/applab/ChangeEventHandler.js","./ChartApi":"/home/ubuntu/staging/apps/build/js/applab/ChartApi.js","./appStorage":"/home/ubuntu/staging/apps/build/js/applab/appStorage.js","./applabTurtle":"/home/ubuntu/staging/apps/build/js/applab/applabTurtle.js","./errorHandler":"/home/ubuntu/staging/apps/build/js/applab/errorHandler.js","./keyEvent":"/home/ubuntu/staging/apps/build/js/applab/keyEvent.js","./rgbcolor.js":"/home/ubuntu/staging/apps/build/js/applab/rgbcolor.js"}],"/home/ubuntu/staging/apps/build/js/applab/rgbcolor.js":[function(require,module,exports){
/**
 * A class to parse color values
 * @author Stoyan Stefanov <sstoo@gmail.com>
 * @link   http://www.phpied.com/rgb-color-parser-in-javascript/
 * @license Use it if you like it
 */

 // hex regular expressions updated to require [0-9a-f] (cpirich)
 // channels declared as local variable to avoid conflicts (cpirich)
 // cleanup jshint errors (cpirich)
 // add rgba support (davidsbailey)
 
module.exports = function(color_string)
{
    this.ok = false;

    // strip any leading #
    if (color_string.charAt(0) == '#') { // remove # if any
        color_string = color_string.substr(1,6);
    }

    color_string = color_string.replace(/ /g,'');
    color_string = color_string.toLowerCase();

    // before getting into regexps, try simple matches
    // and overwrite the input
    var simple_colors = {
        aliceblue: 'f0f8ff',
        antiquewhite: 'faebd7',
        aqua: '00ffff',
        aquamarine: '7fffd4',
        azure: 'f0ffff',
        beige: 'f5f5dc',
        bisque: 'ffe4c4',
        black: '000000',
        blanchedalmond: 'ffebcd',
        blue: '0000ff',
        blueviolet: '8a2be2',
        brown: 'a52a2a',
        burlywood: 'deb887',
        cadetblue: '5f9ea0',
        chartreuse: '7fff00',
        chocolate: 'd2691e',
        coral: 'ff7f50',
        cornflowerblue: '6495ed',
        cornsilk: 'fff8dc',
        crimson: 'dc143c',
        cyan: '00ffff',
        darkblue: '00008b',
        darkcyan: '008b8b',
        darkgoldenrod: 'b8860b',
        darkgray: 'a9a9a9',
        darkgreen: '006400',
        darkkhaki: 'bdb76b',
        darkmagenta: '8b008b',
        darkolivegreen: '556b2f',
        darkorange: 'ff8c00',
        darkorchid: '9932cc',
        darkred: '8b0000',
        darksalmon: 'e9967a',
        darkseagreen: '8fbc8f',
        darkslateblue: '483d8b',
        darkslategray: '2f4f4f',
        darkturquoise: '00ced1',
        darkviolet: '9400d3',
        deeppink: 'ff1493',
        deepskyblue: '00bfff',
        dimgray: '696969',
        dodgerblue: '1e90ff',
        feldspar: 'd19275',
        firebrick: 'b22222',
        floralwhite: 'fffaf0',
        forestgreen: '228b22',
        fuchsia: 'ff00ff',
        gainsboro: 'dcdcdc',
        ghostwhite: 'f8f8ff',
        gold: 'ffd700',
        goldenrod: 'daa520',
        gray: '808080',
        green: '008000',
        greenyellow: 'adff2f',
        honeydew: 'f0fff0',
        hotpink: 'ff69b4',
        indianred : 'cd5c5c',
        indigo : '4b0082',
        ivory: 'fffff0',
        khaki: 'f0e68c',
        lavender: 'e6e6fa',
        lavenderblush: 'fff0f5',
        lawngreen: '7cfc00',
        lemonchiffon: 'fffacd',
        lightblue: 'add8e6',
        lightcoral: 'f08080',
        lightcyan: 'e0ffff',
        lightgoldenrodyellow: 'fafad2',
        lightgrey: 'd3d3d3',
        lightgreen: '90ee90',
        lightpink: 'ffb6c1',
        lightsalmon: 'ffa07a',
        lightseagreen: '20b2aa',
        lightskyblue: '87cefa',
        lightslateblue: '8470ff',
        lightslategray: '778899',
        lightsteelblue: 'b0c4de',
        lightyellow: 'ffffe0',
        lime: '00ff00',
        limegreen: '32cd32',
        linen: 'faf0e6',
        magenta: 'ff00ff',
        maroon: '800000',
        mediumaquamarine: '66cdaa',
        mediumblue: '0000cd',
        mediumorchid: 'ba55d3',
        mediumpurple: '9370d8',
        mediumseagreen: '3cb371',
        mediumslateblue: '7b68ee',
        mediumspringgreen: '00fa9a',
        mediumturquoise: '48d1cc',
        mediumvioletred: 'c71585',
        midnightblue: '191970',
        mintcream: 'f5fffa',
        mistyrose: 'ffe4e1',
        moccasin: 'ffe4b5',
        navajowhite: 'ffdead',
        navy: '000080',
        oldlace: 'fdf5e6',
        olive: '808000',
        olivedrab: '6b8e23',
        orange: 'ffa500',
        orangered: 'ff4500',
        orchid: 'da70d6',
        palegoldenrod: 'eee8aa',
        palegreen: '98fb98',
        paleturquoise: 'afeeee',
        palevioletred: 'd87093',
        papayawhip: 'ffefd5',
        peachpuff: 'ffdab9',
        peru: 'cd853f',
        pink: 'ffc0cb',
        plum: 'dda0dd',
        powderblue: 'b0e0e6',
        purple: '800080',
        red: 'ff0000',
        rosybrown: 'bc8f8f',
        royalblue: '4169e1',
        saddlebrown: '8b4513',
        salmon: 'fa8072',
        sandybrown: 'f4a460',
        seagreen: '2e8b57',
        seashell: 'fff5ee',
        sienna: 'a0522d',
        silver: 'c0c0c0',
        skyblue: '87ceeb',
        slateblue: '6a5acd',
        slategray: '708090',
        snow: 'fffafa',
        springgreen: '00ff7f',
        steelblue: '4682b4',
        tan: 'd2b48c',
        teal: '008080',
        thistle: 'd8bfd8',
        tomato: 'ff6347',
        turquoise: '40e0d0',
        violet: 'ee82ee',
        violetred: 'd02090',
        wheat: 'f5deb3',
        white: 'ffffff',
        whitesmoke: 'f5f5f5',
        yellow: 'ffff00',
        yellowgreen: '9acd32'
    };
    for (var key in simple_colors) {
        if (color_string == key) {
            color_string = simple_colors[key];
        }
    }
    // emd of simple type-in colors

    // array of color definition objects
    var color_defs = [
        {
            re: /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/,
            example: ['rgb(123, 234, 45)', 'rgb(255,234,245)'],
            process: function (bits){
                return [
                    parseInt(bits[1]),
                    parseInt(bits[2]),
                    parseInt(bits[3])
                ];
            }
        },
        {
          re: /^rgba\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*((?:\d+(?:\.\d+)?)|(?:\.\d+))\s*\)$/,
          example: ['rgba(123, 234, 45, .33)', 'rgba(255,234,245,1)'],
          process: function (bits){
            return [
              parseInt(bits[1]),
              parseInt(bits[2]),
              parseInt(bits[3]),
              parseInt(bits[4])
            ];
          }
        },
        {
            re: /^([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/,
            example: ['#00ff00', '336699'],
            process: function (bits){
                return [
                    parseInt(bits[1], 16),
                    parseInt(bits[2], 16),
                    parseInt(bits[3], 16)
                ];
            }
        },
        {
            re: /^([0-9a-f]{1})([0-9a-f]{1})([0-9a-f]{1})$/,
            example: ['#fb0', 'f0f'],
            process: function (bits){
                return [
                    parseInt(bits[1] + bits[1], 16),
                    parseInt(bits[2] + bits[2], 16),
                    parseInt(bits[3] + bits[3], 16)
                ];
            }
        }
    ];

    // search through the definitions to find a match
    for (var i = 0; i < color_defs.length; i++) {
        var re = color_defs[i].re;
        var processor = color_defs[i].process;
        var bits = re.exec(color_string);
        if (bits) {
            var channels = processor(bits);
            this.r = channels[0];
            this.g = channels[1];
            this.b = channels[2];
            this.a = channels[3];
            this.ok = true;
        }

    }

    // validate/cleanup values
    this.r = (this.r < 0 || isNaN(this.r)) ? 0 : ((this.r > 255) ? 255 : this.r);
    this.g = (this.g < 0 || isNaN(this.g)) ? 0 : ((this.g > 255) ? 255 : this.g);
    this.b = (this.b < 0 || isNaN(this.b)) ? 0 : ((this.b > 255) ? 255 : this.b);
    this.a = (this.a < 0) ? 0 : ((this.a > 1 || isNaN(this.a)) ? 1 : this.a);

    // some getters
    this.toRGB = function () {
        return 'rgb(' + this.r + ', ' + this.g + ', ' + this.b + ')';
    };
    this.toRGBA = function () {
      return 'rgba(' + this.r + ', ' + this.g + ', ' + this.b + ', ' + this.a + ')';
    };
    this.toHex = function () {
        var r = this.r.toString(16);
        var g = this.g.toString(16);
        var b = this.b.toString(16);
        if (r.length == 1) { r = '0' + r; }
        if (g.length == 1) { g = '0' + g; }
        if (b.length == 1) { b = '0' + b; }
        return '#' + r + g + b;
    };
};


},{}],"/home/ubuntu/staging/apps/build/js/applab/keyEvent.js":[function(require,module,exports){
// Table provided by https://www.jabcreations.com/blog/polyfill-for-event.key

module.exports = {
  '65':'a',
  '66':'b',
  '67':'c',
  '68':'d',
  '69':'e',
  '70':'f',
  '71':'g',
  '72':'h',
  '73':'i',
  '74':'j',
  '75':'k',
  '76':'l',
  '77':'m',
  '78':'n',
  '79':'o',
  '80':'p',
  '81':'q',
  '82':'r',
  '83':'s',
  '84':'t',
  '85':'u',
  '86':'v',
  '87':'w',
  '88':'x',
  '89':'y',
  '90':'z',
  '8':'Backspace',
  '9':'Tab',
  '13':'Enter',
  '16':'Shift',
  '17':'Control',
  '18':'Alt',
  '20':'CapsLock',
  '27':'Esc',
  '32':' ',
  '33':'PageUp',
  '34':'PageDown',
  '35':'End',
  '36':'Home',
  '37':'Left',
  '38':'Up',
  '39':'Right',
  '40':'Down',
  '45':'Insert',
  '46':'Del',
  '48':'0',
  '49':'1',
  '50':'2',
  '51':'3',
  '52':'4',
  '53':'5',
  '54':'6',
  '55':'7',
  '56':'8',
  '57':'9',
  '91':'OS',
  '92':'OS',
  '93':'Menu',
  '96':'0',
  '97':'1',
  '98':'2',
  '99':'3',
  '100':'4',
  '101':'5',
  '102':'6',
  '103':'7',
  '104':'8',
  '105':'9',
  '106':'*',
  '107':'+',
  '109':'-',
  '110':'.',
  '111':'/',
  '112':'F1',
  '113':'F2',
  '114':'F3',
  '115':'F4',
  '116':'F5',
  '117':'F6',
  '118':'F7',
  '119':'F8',
  '120':'F9',
  '121':'F10',
  '122':'F11',
  '123':'F12',
  '144':'NumLock',
  '145':'ScrollLock',
  '186':':',
  '187':'=',
  '188':',',
  '189':'-',
  '190':'.',
  '191':'/',
  '192':'`',
  '219':'[',
  '220':'\\',
  '221':']',
  '222':'\''
 };


},{}],"/home/ubuntu/staging/apps/build/js/applab/errorHandler.js":[function(require,module,exports){
var annotationList = require('../acemode/annotationList');

var ErrorLevel = {
  WARNING: 'WARNING',
  ERROR: 'ERROR'
};

function outputApplabConsole(output) {
  // first pass through to the real browser console log if available:
  if (console.log) {
    console.log(output);
  }
  // then put it in the applab console visible to the user:
  var debugOutput = document.getElementById('debug-output');
  if (debugOutput) {
    if (debugOutput.textContent.length > 0) {
      debugOutput.textContent += '\n' + output;
    } else {
      debugOutput.textContent = String(output);
    }
    debugOutput.scrollTop = debugOutput.scrollHeight;
  }
}

/**
 * Output error to console and gutter as appropriate
 * @param {string} warning Text for warning
 * @param {ErrorLevel} level
 * @param {number} lineNum One indexed line number
 */
function outputError(warning, level, lineNum) {
  var text = level + ': ';
  if (lineNum !== undefined) {
    text += 'Line: ' + lineNum + ': ';
  }
  text += warning;
  outputApplabConsole(text);
  if (lineNum !== undefined) {
    annotationList.addRuntimeAnnotation(level, lineNum, warning);
  }
}

function handleError(opts, message) {
  // Ensure that this event was requested by the same instance of the interpreter
  // that is currently active before proceeding...
  if (opts.onError && opts.JSInterpreter === Applab.JSInterpreter) {
    Applab.JSInterpreter.queueEvent(opts.onError, [message]);
  } else {
    outputApplabConsole(message);
  }
}


module.exports = {
  ErrorLevel: ErrorLevel,
  outputApplabConsole: outputApplabConsole,
  outputError: outputError,
  handleError: handleError
};


},{"../acemode/annotationList":"/home/ubuntu/staging/apps/build/js/acemode/annotationList.js"}],"/home/ubuntu/staging/apps/build/js/applab/apiBlockly.js":[function(require,module,exports){

exports.randomFromArray = function (values) {
  var key = Math.floor(Math.random() * values.length);
  return values[key];
};

// APIs needed for blockly (must include blockId) (keep in sync with api.js):

exports.container = function (blockId, elementId, html) {
  return Applab.executeCmd(blockId,
                          'container',
                          {'elementId': elementId,
                           'html': html });
};

exports.write = function (blockId, html) {
  return Applab.executeCmd(blockId,
                          'write',
                          {'html': html });
};

exports.innerHTML = function (blockId, elementId, html) {
  return Applab.executeCmd(blockId,
                          'innerHTML',
                          {'elementId': elementId,
                           'html': html });
};

exports.deleteElement = function (blockId, elementId) {
  return Applab.executeCmd(blockId,
                          'deleteElement',
                          {'elementId': elementId });
};

exports.showElement = function (blockId, elementId) {
  return Applab.executeCmd(blockId,
                          'showElement',
                          {'elementId': elementId });
};

exports.hideElement = function (blockId, elementId) {
  return Applab.executeCmd(blockId,
                          'hideElement',
                          {'elementId': elementId });
};

exports.setScreen = function (blockId, screenId) {
  return Applab.executeCmd(blockId,
                          'setScreen',
                          {'screenId': screenId });
};

exports.button = function (blockId, elementId, text) {
  return Applab.executeCmd(blockId,
                          'button',
                          {'elementId': elementId,
                           'text': text });
};

exports.image = function (blockId, elementId, src) {
  return Applab.executeCmd(blockId,
                          'image',
                          {'elementId': elementId,
                           'src': src });
};

exports.setPosition = function (blockId, elementId, left, top, width, height) {
  return Applab.executeCmd(blockId,
                          'setPosition',
                          {'elementId': elementId,
                           'left': left,
                           'top': top,
                           'width': width,
                           'height': height });
};

exports.setSize = function (blockId, elementId, width, height) {
  return Applab.executeCmd(blockId,
                          'setSize',
                          {'elementId': elementId,
                           'width': width,
                           'height': height });
};


exports.getXPosition = function (blockId, elementId) {
  return Applab.executeCmd(blockId,
                          'getXPosition',
                          {'elementId': elementId });
};

exports.getYPosition = function (blockId, elementId) {
  return Applab.executeCmd(blockId,
                          'getYPosition',
                          {'elementId': elementId });
};

exports.createCanvas = function (blockId, elementId, width, height) {
  return Applab.executeCmd(blockId,
                          'createCanvas',
                          {'elementId': elementId,
                           'width': width,
                           'height': height });
};

exports.setActiveCanvas = function (blockId, elementId) {
  return Applab.executeCmd(blockId,
                          'setActiveCanvas',
                          {'elementId': elementId  });
};

exports.line = function (blockId, x1, y1, x2, y2) {
  return Applab.executeCmd(blockId,
                          'line',
                          {'x1': x1,
                           'y1': y1,
                           'x2': x2,
                           'y2': y2 });
};

exports.circle = function (blockId, x, y, radius) {
  return Applab.executeCmd(blockId,
                          'circle',
                          {'x': x,
                           'y': y,
                           'radius': radius });
};

exports.rect = function (blockId, x, y, width, height) {
  return Applab.executeCmd(blockId,
                          'rect',
                          {'x': x,
                           'y': y,
                           'width': width,
                           'height': height });
};

exports.setStrokeWidth = function (blockId, width) {
  return Applab.executeCmd(blockId,
                          'setStrokeWidth',
                          {'width': width });
};

exports.setStrokeColor = function (blockId, color) {
  return Applab.executeCmd(blockId,
                          'setStrokeColor',
                          {'color': color });
};

exports.setFillColor = function (blockId, color) {
  return Applab.executeCmd(blockId,
                          'setFillColor',
                          {'color': color });
};

exports.clearCanvas = function (blockId) {
  return Applab.executeCmd(blockId, 'clearCanvas');
};

exports.drawImage = function (blockId, imageId, x, y, width, height) {
  return Applab.executeCmd(blockId,
                          'drawImage',
                          {'imageId': imageId,
                           'x': x,
                           'y': y,
                           'width': width,
                           'height': height });
};

exports.getImageData = function (blockId, x, y, width, height) {
  return Applab.executeCmd(blockId,
                          'getImageData',
                          {'x': x,
                           'y': y,
                           'width': width,
                           'height': height });
};

exports.putImageData = function (blockId, imageData, x, y) {
  return Applab.executeCmd(blockId,
                          'putImageData',
                          {'imageData': imageData,
                           'x': x,
                           'y': y });
};

exports.textInput = function (blockId, elementId, text) {
  return Applab.executeCmd(blockId,
                          'textInput',
                          {'elementId': elementId,
                           'text': text });
};

exports.textLabel = function (blockId, elementId, text, forId) {
  return Applab.executeCmd(blockId,
                          'textLabel',
                          {'elementId': elementId,
                           'text': text,
                           'forId': forId });
};

exports.checkbox = function (blockId, elementId, checked) {
  return Applab.executeCmd(blockId,
                          'checkbox',
                          {'elementId': elementId,
                           'checked': checked });
};

exports.radioButton = function (blockId, elementId, checked, name) {
  return Applab.executeCmd(blockId,
                          'radioButton',
                          {'elementId': elementId,
                           'checked': checked,
                           'name': name });
};

exports.getChecked = function (blockId, elementId) {
  return Applab.executeCmd(blockId,
                          'getChecked',
                          {'elementId': elementId });
};

exports.setChecked = function (blockId, elementId, checked) {
  return Applab.executeCmd(blockId,
                          'setChecked',
                          {'elementId': elementId,
                           'checked': checked });
};

exports.dropdown = function (blockId, elementId) {
  var optionsArray = Array.prototype.slice.call(arguments, 2);
  return Applab.executeCmd(blockId,
                          'dropdown',
                          {'elementId': elementId,
                           'optionsArray': optionsArray });
};

exports.getAttribute = function(blockId, elementId, attribute) {
  return Applab.executeCmd(blockId,
                           'getAttribute',
                           {elementId: elementId,
                            attribute: attribute});
};

exports.setAttribute = function(blockId, elementId, attribute, value) {
  return Applab.executeCmd(blockId,
                           'setAttribute',
                           {elementId: elementId,
                            attribute: attribute,
                            value: value});
};

exports.getText = function (blockId, elementId) {
  return Applab.executeCmd(blockId,
                          'getText',
                          {'elementId': elementId });
};

exports.setText = function (blockId, elementId, text) {
  return Applab.executeCmd(blockId,
                          'setText',
                          {'elementId': elementId,
                           'text': text });
};

exports.getImageURL = function (blockId, elementId) {
  return Applab.executeCmd(blockId,
                          'getImageURL',
                          {'elementId': elementId });
};

exports.setImageURL = function (blockId, elementId, src) {
  return Applab.executeCmd(blockId,
                          'setImageURL',
                          {'elementId': elementId,
                           'src': src });
};

exports.imageUploadButton = function (blockId, elementId, text) {
  return Applab.executeCmd(blockId,
                           'imageUploadButton',
                           {'elementId': elementId,
                            'text': text });
};

exports.setParent = function (blockId, elementId, parentId) {
  return Applab.executeCmd(blockId,
                          'setParent',
                          {'elementId': elementId,
                           'parentId': parentId });
};

exports.setStyle = function (blockId, elementId, style) {
  return Applab.executeCmd(blockId,
                           'setStyle',
                           {'elementId': elementId,
                           'style': style });
};

exports.onEvent = function (blockId, elementId, eventName, func) {
  var extraArgs = Array.prototype.slice.call(arguments).slice(4);
  return Applab.executeCmd(blockId,
                          'onEvent',
                          {'elementId': elementId,
                           'eventName': eventName,
                           'func': func,
                           'extraArgs': extraArgs});
};

exports.startWebRequest = function (blockId, url, func) {
  return Applab.executeCmd(blockId,
                          'startWebRequest',
                          {'url': url,
                           'func': func });
};

exports.setTimeout = function (blockId, func, milliseconds) {
  return Applab.executeCmd(blockId,
                          'setTimeout',
                          {'func': func,
                           'milliseconds': milliseconds });
};

exports.clearTimeout = function (blockId, timeoutId) {
  return Applab.executeCmd(blockId,
                           'clearTimeout',
                           {'timeoutId': timeoutId });
};

exports.setInterval = function (blockId, func, milliseconds) {
  return Applab.executeCmd(blockId,
                          'setInterval',
                          {'func': func,
                           'milliseconds': milliseconds });
};

exports.clearInterval = function (blockId, intervalId) {
  return Applab.executeCmd(blockId,
                           'clearInterval',
                           {'intervalId': intervalId });
};

exports.playSound = function (blockId, url) {
  return Applab.executeCmd(blockId,
                          'playSound',
                          {'url': url});
};

exports.getKeyValue = function(blockId, key, onSuccess, onError) {
  return Applab.executeCmd(blockId,
                           'getKeyValue',
                           {'key':key,
                            'onSuccess': onSuccess,
                            'onError': onError});
};

exports.setKeyValue = function(blockId, key, value, onSuccess, onError) {
  return Applab.executeCmd(blockId,
                           'setKeyValue',
                           {'key':key,
                            'value': value,
                            'onSuccess': onSuccess,
                            'onError': onError});
};

exports.createRecord = function (blockId, table, record, onSuccess, onError) {
  return Applab.executeCmd(blockId,
                          'createRecord',
                          {'table': table,
                           'record': record,
                           'onSuccess': onSuccess,
                           'onError': onError});
};

exports.readRecords = function (blockId, table, searchParams, onSuccess, onError) {
  return Applab.executeCmd(blockId,
                          'readRecords',
                          {'table': table,
                           'searchParams': searchParams,
                           'onSuccess': onSuccess,
                           'onError': onError});
};

exports.updateRecord = function (blockId, table, record, onSuccess, onError) {
  return Applab.executeCmd(blockId,
                          'updateRecord',
                          {'table': table,
                           'record': record,
                           'onSuccess': onSuccess,
                           'onError': onError});
};

exports.deleteRecord = function (blockId, table, record, onSuccess, onError) {
  return Applab.executeCmd(blockId,
                          'deleteRecord',
                          {'table': table,
                           'record': record,
                           'onSuccess': onSuccess,
                           'onError': onError});
};

exports.getUserId = function (blockId) {
  return Applab.executeCmd(blockId,
                          'getUserId',
                          {});
};

exports.moveForward = function (blockId, distance) {
  return Applab.executeCmd(blockId,
                          'moveForward',
                          {'distance': distance });
};

exports.moveBackward = function (blockId, distance) {
  return Applab.executeCmd(blockId,
                          'moveBackward',
                          {'distance': distance });
};

exports.move = function (blockId, x, y) {
  return Applab.executeCmd(blockId,
                          'move',
                          {'x': x,
                           'y': y });
};

exports.moveTo = function (blockId, x, y) {
  return Applab.executeCmd(blockId,
                          'moveTo',
                          {'x': x,
                           'y': y });
};

exports.turnRight = function (blockId, degrees) {
  return Applab.executeCmd(blockId,
                          'turnRight',
                          {'degrees': degrees });
};

exports.turnLeft = function (blockId, degrees) {
  return Applab.executeCmd(blockId,
                          'turnLeft',
                          {'degrees': degrees });
};

exports.turnTo = function (blockId, direction) {
  return Applab.executeCmd(blockId,
                           'turnTo',
                           {'direction': direction });
};

exports.arcRight = function (blockId, degrees, radius) {
  return Applab.executeCmd(blockId,
                           'arcRight',
                           {'degrees': degrees,
                            'radius': radius });
};

exports.arcLeft = function (blockId, degrees, radius) {
  return Applab.executeCmd(blockId,
                           'arcLeft',
                           {'degrees': degrees,
                            'radius': radius });
};

exports.dot = function (blockId, radius) {
  return Applab.executeCmd(blockId,
                           'dot',
                           {'radius': radius });
};

exports.getX = function (blockId) {
  return Applab.executeCmd(blockId, 'getX');
};

exports.getY = function (blockId) {
  return Applab.executeCmd(blockId, 'getY');
};

exports.getDirection = function (blockId) {
  return Applab.executeCmd(blockId, 'getDirection');
};

exports.penUp = function (blockId) {
  return Applab.executeCmd(blockId, 'penUp');
};

exports.penDown = function (blockId) {
  return Applab.executeCmd(blockId, 'penDown');
};

exports.show = function (blockId) {
  return Applab.executeCmd(blockId, 'show');
};

exports.hide = function (blockId) {
  return Applab.executeCmd(blockId, 'hide');
};

exports.speed = function (blockId, percent) {
  return Applab.executeCmd(blockId,
                           'speed',
                           {'percent': percent});
};

exports.penWidth = function (blockId, width) {
  return Applab.executeCmd(blockId,
                          'penWidth',
                          {'width': width });
};

exports.penColor = function (blockId, color) {
  return Applab.executeCmd(blockId,
                          'penColor',
                          {'color': color });
};

exports.penRGB = function (blockId, r, g, b, a) {
  return Applab.executeCmd(blockId,
                          'penRGB',
                          {'r': r,
                           'g': g,
                           'b': b,
                           'a': a });
};

exports.insertItem = function (blockId, array, index, item) {
  return Applab.executeCmd(blockId,
                          'insertItem',
                          {'array': array,
                           'index': index,
                           'item': item });
};

exports.appendItem = function (blockId, array, item) {
  return Applab.executeCmd(blockId,
                          'appendItem',
                          {'array': array,
                           'item': item });
};

exports.removeItem = function (blockId, array, index) {
  return Applab.executeCmd(blockId,
                          'removeItem',
                          {'array': array,
                           'index': index });
};

exports.drawChartFromRecords = function (chartId, chartType, tableName, columns, options, callback) {
  return Applab.executeCmd(null,
                          'drawChartFromRecords',
                          {'chartId': chartId,
                            'chartType': chartType,
                            'tableName': tableName,
                            'columns': columns,
                            'options': options,
                            'callback': callback });
};


},{}],"/home/ubuntu/staging/apps/build/js/applab/api.js":[function(require,module,exports){
// APIs needed for droplet (keep in sync with apiBlockly.js):

exports.container = function (elementId, html) {
  return Applab.executeCmd(null,
                          'container',
                          {'elementId': elementId,
                           'html': html });
};

exports.write = function (html) {
  return Applab.executeCmd(null,
                          'write',
                          {'html': html });
};

exports.innerHTML = function (elementId, html) {
  return Applab.executeCmd(null,
                          'innerHTML',
                          {'elementId': elementId,
                           'html': html });
};

exports.deleteElement = function (elementId) {
  return Applab.executeCmd(null,
                          'deleteElement',
                          {'elementId': elementId });
};

exports.showElement = function (elementId) {
  return Applab.executeCmd(null,
                          'showElement',
                          {'elementId': elementId });
};

exports.hideElement = function (elementId) {
  return Applab.executeCmd(null,
                          'hideElement',
                          {'elementId': elementId });
};

exports.setScreen = function (screenId) {
  return Applab.executeCmd(null,
                          'setScreen',
                          {'screenId': screenId });
};

exports.button = function (elementId, text) {
  return Applab.executeCmd(null,
                          'button',
                          {'elementId': elementId,
                           'text': text });
};

exports.image = function (elementId, src) {
  return Applab.executeCmd(null,
                          'image',
                          {'elementId': elementId,
                           'src': src });
};

exports.setPosition = function (elementId, left, top, width, height) {
  return Applab.executeCmd(null,
                          'setPosition',
                          {'elementId': elementId,
                           'left': left,
                           'top': top,
                           'width': width,
                           'height': height });
};

exports.setSize = function (elementId, width, height) {
  return Applab.executeCmd(null,
                          'setSize',
                          {'elementId': elementId,
                           'width': width,
                           'height': height });
};

exports.getXPosition = function (elementId) {
  return Applab.executeCmd(null,
                          'getXPosition',
                          {'elementId': elementId });
};

exports.getYPosition = function (elementId) {
  return Applab.executeCmd(null,
                          'getYPosition',
                          {'elementId': elementId });
};

exports.createCanvas = function (elementId, width, height) {
  return Applab.executeCmd(null,
                          'createCanvas',
                          {'elementId': elementId,
                           'width': width,
                           'height': height });
};

exports.setActiveCanvas = function (elementId) {
  return Applab.executeCmd(null,
                          'setActiveCanvas',
                          {'elementId': elementId  });
};

exports.line = function (x1, y1, x2, y2) {
  return Applab.executeCmd(null,
                          'line',
                          {'x1': x1,
                           'y1': y1,
                           'x2': x2,
                           'y2': y2 });
};

exports.circle = function (x, y, radius) {
  return Applab.executeCmd(null,
                          'circle',
                          {'x': x,
                           'y': y,
                           'radius': radius });
};

exports.rect = function (x, y, width, height) {
  return Applab.executeCmd(null,
                          'rect',
                          {'x': x,
                           'y': y,
                           'width': width,
                           'height': height });
};

exports.setStrokeWidth = function (width) {
  return Applab.executeCmd(null,
                          'setStrokeWidth',
                          {'width': width });
};

exports.setStrokeColor = function (color) {
  return Applab.executeCmd(null,
                          'setStrokeColor',
                          {'color': color });
};

exports.setFillColor = function (color) {
  return Applab.executeCmd(null,
                          'setFillColor',
                          {'color': color });
};

exports.clearCanvas = function () {
  return Applab.executeCmd(null, 'clearCanvas');
};

exports.drawImage = function (imageId, x, y, width, height) {
  return Applab.executeCmd(null,
                          'drawImage',
                          {'imageId': imageId,
                           'x': x,
                           'y': y,
                           'width': width,
                           'height': height });
};

exports.getImageData = function (x, y, width, height) {
  return Applab.executeCmd(null,
                          'getImageData',
                          {'x': x,
                           'y': y,
                           'width': width,
                           'height': height });
};

exports.putImageData = function (imageData, x, y) {
  return Applab.executeCmd(null,
                          'putImageData',
                          {'imageData': imageData,
                           'x': x,
                           'y': y });
};

exports.textInput = function (elementId, text) {
  return Applab.executeCmd(null,
                          'textInput',
                          {'elementId': elementId,
                           'text': text });
};

exports.textLabel = function (elementId, text, forId) {
  return Applab.executeCmd(null,
                          'textLabel',
                          {'elementId': elementId,
                           'text': text,
                           'forId': forId });
};

exports.checkbox = function (elementId, checked) {
  return Applab.executeCmd(null,
                          'checkbox',
                          {'elementId': elementId,
                           'checked': checked });
};

exports.radioButton = function (elementId, checked, name) {
  return Applab.executeCmd(null,
                          'radioButton',
                          {'elementId': elementId,
                           'checked': checked,
                           'name': name });
};

exports.getChecked = function (elementId) {
  return Applab.executeCmd(null,
                          'getChecked',
                          {'elementId': elementId });
};

exports.setChecked = function (elementId, checked) {
  return Applab.executeCmd(null,
                          'setChecked',
                          {'elementId': elementId,
                           'checked': checked });
};

exports.dropdown = function (elementId) {
  var optionsArray = Array.prototype.slice.call(arguments, 1);
  return Applab.executeCmd(null,
                          'dropdown',
                          {'elementId': elementId,
                           'optionsArray': optionsArray });
};

exports.getAttribute = function(elementId, attribute) {
  return Applab.executeCmd(null,
                           'getAttribute',
                           {elementId: elementId,
                            attribute: attribute});
};

exports.setAttribute = function(elementId, attribute, value) {
  return Applab.executeCmd(null,
                           'setAttribute',
                           {elementId: elementId,
                            attribute: attribute,
                            value: value});
};

exports.getText = function (elementId) {
  return Applab.executeCmd(null,
                          'getText',
                          {'elementId': elementId });
};

exports.setText = function (elementId, text) {
  return Applab.executeCmd(null,
                          'setText',
                          {'elementId': elementId,
                           'text': text });
};

exports.getImageURL = function (elementId) {
  return Applab.executeCmd(null,
                          'getImageURL',
                          {'elementId': elementId });
};

exports.setImageURL = function (elementId, src) {
  return Applab.executeCmd(null,
                          'setImageURL',
                          {'elementId': elementId,
                           'src': src });
};

exports.imageUploadButton = function (elementId, text) {
  return Applab.executeCmd(null,
                           'imageUploadButton',
                           {'elementId': elementId,
                            'text': text });
};

exports.setParent = function (elementId, parentId) {
  return Applab.executeCmd(null,
                          'setParent',
                          {'elementId': elementId,
                           'parentId': parentId });
};

exports.setStyle = function (elementId, style) {
  return Applab.executeCmd(null,
                           'setStyle',
                           {'elementId': elementId,
                           'style': style });
};

exports.onEvent = function (elementId, eventName, func) {
  var extraArgs = Array.prototype.slice.call(arguments).slice(3);
  return Applab.executeCmd(null,
                          'onEvent',
                          {'elementId': elementId,
                           'eventName': eventName,
                           'func': func,
                           'extraArgs': extraArgs});
};

exports.startWebRequest = function (url, func) {
  return Applab.executeCmd(null,
                          'startWebRequest',
                          {'url': url,
                           'func': func });
};

exports.setTimeout = function (func, milliseconds) {
  return Applab.executeCmd(null,
                          'setTimeout',
                          {'func': func,
                           'milliseconds': milliseconds });
};

exports.clearTimeout = function (timeoutId) {
  return Applab.executeCmd(null,
                           'clearTimeout',
                           {'timeoutId': timeoutId });
};

exports.setInterval = function (func, milliseconds) {
  return Applab.executeCmd(null,
                          'setInterval',
                          {'func': func,
                           'milliseconds': milliseconds });
};

exports.clearInterval = function (intervalId) {
  return Applab.executeCmd(null,
                           'clearInterval',
                           {'intervalId': intervalId });
};

exports.playSound = function (url) {
  return Applab.executeCmd(null,
                          'playSound',
                          {'url': url});
};

exports.getKeyValue = function(key, onSuccess, onError) {
  return Applab.executeCmd(null,
                           'getKeyValue',
                           {'key':key,
                            'onSuccess': onSuccess,
                            'onError': onError});
};

exports.setKeyValue = function(key, value, onSuccess, onError) {
  return Applab.executeCmd(null,
                           'setKeyValue',
                           {'key':key,
                            'value': value,
                            'onSuccess': onSuccess,
                            'onError': onError});
};

exports.createRecord = function (table, record, onSuccess, onError) {
  return Applab.executeCmd(null,
                          'createRecord',
                          {'table': table,
                           'record': record,
                           'onSuccess': onSuccess,
                           'onError': onError});
};

exports.readRecords = function (table, searchParams, onSuccess, onError) {
  return Applab.executeCmd(null,
                          'readRecords',
                          {'table': table,
                           'searchParams': searchParams,
                           'onSuccess': onSuccess,
                           'onError': onError});
};

exports.updateRecord = function (table, record, onSuccess, onError) {
  return Applab.executeCmd(null,
                          'updateRecord',
                          {'table': table,
                           'record': record,
                           'onSuccess': onSuccess,
                           'onError': onError});
};

exports.deleteRecord = function (table, record, onSuccess, onError) {
  return Applab.executeCmd(null,
                          'deleteRecord',
                          {'table': table,
                           'record': record,
                           'onSuccess': onSuccess,
                           'onError': onError});
};

exports.getUserId = function () {
  return Applab.executeCmd(null,
                          'getUserId',
                          {});
};

exports.moveForward = function (distance) {
  return Applab.executeCmd(null,
                          'moveForward',
                          {'distance': distance });
};

exports.moveBackward = function (distance) {
  return Applab.executeCmd(null,
                          'moveBackward',
                          {'distance': distance });
};

exports.move = function (x, y) {
  return Applab.executeCmd(null,
                          'move',
                          {'x': x,
                           'y': y });
};

exports.moveTo = function (x, y) {
  return Applab.executeCmd(null,
                          'moveTo',
                          {'x': x,
                           'y': y });
};

exports.turnRight = function (degrees) {
  return Applab.executeCmd(null,
                          'turnRight',
                          {'degrees': degrees });
};

exports.turnLeft = function (degrees) {
  return Applab.executeCmd(null,
                          'turnLeft',
                          {'degrees': degrees });
};

exports.turnTo = function (direction) {
  return Applab.executeCmd(null,
                           'turnTo',
                           {'direction': direction });
};

exports.arcRight = function (degrees, radius) {
  return Applab.executeCmd(null,
                           'arcRight',
                           {'degrees': degrees,
                            'radius': radius });
};

exports.arcLeft = function (degrees, radius) {
  return Applab.executeCmd(null,
                           'arcLeft',
                           {'degrees': degrees,
                            'radius': radius });
};

exports.dot = function (radius) {
  return Applab.executeCmd(null,
                           'dot',
                           {'radius': radius });
};

exports.getX = function () {
  return Applab.executeCmd(null, 'getX');
};

exports.getY = function () {
  return Applab.executeCmd(null, 'getY');
};

exports.getDirection = function () {
  return Applab.executeCmd(null, 'getDirection');
};

exports.penUp = function () {
  return Applab.executeCmd(null, 'penUp');
};

exports.penDown = function () {
  return Applab.executeCmd(null, 'penDown');
};

exports.show = function () {
  return Applab.executeCmd(null, 'show');
};

exports.hide = function () {
  return Applab.executeCmd(null, 'hide');
};

exports.speed = function (percent) {
  return Applab.executeCmd(null,
                           'speed',
                           {'percent': percent});
};

exports.penWidth = function (width) {
  return Applab.executeCmd(null,
                          'penWidth',
                          {'width': width });
};

exports.penColor = function (color) {
  return Applab.executeCmd(null,
                          'penColor',
                          {'color': color });
};

exports.penRGB = function (r, g, b, a) {
  return Applab.executeCmd(null,
                          'penRGB',
                          {'r': r,
                           'g': g,
                           'b': b,
                           'a': a });
};

exports.insertItem = function (array, index, item) {
  return Applab.executeCmd(null,
                          'insertItem',
                          {'array': array,
                           'index': index,
                           'item': item });
};

exports.appendItem = function (array, item) {
  return Applab.executeCmd(null,
                          'appendItem',
                          {'array': array,
                           'item': item });
};

exports.removeItem = function (array, index) {
  return Applab.executeCmd(null,
                          'removeItem',
                          {'array': array,
                           'index': index });
};

exports.drawChartFromRecords = function (chartId, chartType, tableName, columns, options, callback) {
  return Applab.executeCmd(null,
                          'drawChartFromRecords',
                          {'chartId': chartId,
                           'chartType': chartType,
                           'tableName': tableName,
                           'columns': columns,
                           'options': options,
                           'callback': callback });
};


},{}],"/home/ubuntu/staging/apps/build/js/applab/DesignWorkspace.jsx":[function(require,module,exports){
var applabMsg = require('./locale');
var DesignModeBox = require('./DesignModeBox.jsx');
var DesignModeHeaders = require('./DesignModeHeaders.jsx');

module.exports = React.createClass({displayName: "exports",
  propTypes: {
    handleManageAssets: React.PropTypes.func.isRequired,
    handleDragStart: React.PropTypes.func,
    element: React.PropTypes.instanceOf(HTMLElement),
    handleChange: React.PropTypes.func.isRequired,
    onDepthChange: React.PropTypes.func.isRequired,
    onDelete: React.PropTypes.func.isRequired,
    onInsertEvent: React.PropTypes.func.isRequired,
    isDimmed: React.PropTypes.bool.isRequired
  },

  getInitialState: function() {
    return {
      isToolboxVisible: true
    };
  },

  onToggleToolbox: function() {
    this.setState({
      isToolboxVisible: !this.state.isToolboxVisible
    });
  },

  render: function() {
    return React.createElement("div", {id: "designWorkspaceWrapper"}, 
      React.createElement(DesignModeHeaders, {
        handleManageAssets: this.props.handleManageAssets, 
        onToggleToolbox: this.onToggleToolbox, 
        isToolboxVisible: this.state.isToolboxVisible}), 
      React.createElement(DesignModeBox, {
        handleDragStart: this.props.handleDragStart, 
        element: this.props.element, 
        handleChange: this.props.handleChange, 
        onDepthChange: this.props.onDepthChange, 
        onDelete: this.props.onDelete, 
        onInsertEvent: this.props.onInsertEvent, 
        isToolboxVisible: this.state.isToolboxVisible, 
        isDimmed: this.props.isDimmed})
    );
  }
});


},{"./DesignModeBox.jsx":"/home/ubuntu/staging/apps/build/js/applab/DesignModeBox.jsx","./DesignModeHeaders.jsx":"/home/ubuntu/staging/apps/build/js/applab/DesignModeHeaders.jsx","./locale":"/home/ubuntu/staging/apps/build/js/applab/locale.js"}],"/home/ubuntu/staging/apps/build/js/applab/DesignToggleRow.jsx":[function(require,module,exports){
/* global $ */

var msg = require('../locale');
var applabMsg = require('./locale');

var NEW_SCREEN = 'New screen...';

var Mode = {
  CODE: 'CODE',
  DESIGN: 'DESIGN'
};

module.exports = React.createClass({displayName: "exports",
  propTypes: {
    hideToggle: React.PropTypes.bool.isRequired,
    hideViewDataButton: React.PropTypes.bool.isRequired,
    startInDesignMode: React.PropTypes.bool.isRequired,
    initialScreen: React.PropTypes.string.isRequired,
    screens: React.PropTypes.array.isRequired,
    onDesignModeButton: React.PropTypes.func.isRequired,
    onCodeModeButton: React.PropTypes.func.isRequired,
    onViewDataButton: React.PropTypes.func.isRequired,
    onScreenChange: React.PropTypes.func.isRequired,
    onScreenCreate: React.PropTypes.func.isRequired
  },

  getInitialState: function () {
    return {
      mode: this.props.startInDesignMode ? Mode.DESIGN :  Mode.CODE,
      activeScreen: null
    };
  },

  handleSetMode: function (newMode) {
    if (this.state.mode === newMode) {
      return;
    }
    if (newMode === Mode.CODE) {
      this.props.onCodeModeButton();
    } else {
      this.props.onDesignModeButton();
    }

    this.setState({
      mode: newMode
    });
  },

  handleScreenChange: function (evt) {
    var screenId = evt.target.value;
    if (screenId === NEW_SCREEN) {
      screenId = this.props.onScreenCreate();
    }
    this.props.onScreenChange(screenId);
  },

  componentWillReceiveProps: function (newProps) {
    this.setState({ activeScreen: newProps.initialScreen });
  },

  render: function () {
    var showDataButton;
    var selectDropdown;
    var dropdownStyle = {
      display: 'inline-block',
      verticalAlign: 'top',
      width: '100%',
      height: 28,
      marginBottom: 6,
      borderColor: '#949ca2'
    };

    var buttonStyle = {
      display: 'inline-block',
      verticalAlign: 'top',
      border: '1px solid #949ca2',
      margin: '0 0 8px 0',
      padding: '2px 6px',
      fontSize: 14
    };
    var codeButtonStyle = $.extend({}, buttonStyle, {
      borderBottomRightRadius: 0,
      borderTopRightRadius: 0,
      borderRightWidth: 0
    });
    var designButtonStyle = $.extend({}, buttonStyle, {
      borderBottomLeftRadius: 0,
      borderTopLeftRadius: 0
    });
    var active = {
      backgroundColor: '#ffa000',
      color: '#fff',
      boxShadow: '2px 2px 5px rgba(0, 0, 0, 0.3) inset'
    };
    var inactive = {
      backgroundColor: '#fff',
      color: '#949ca2',
      boxShadow: '0px 1px 5px rgba(0, 0, 0, 0.3)'
    };
    var hidden = {
      display: 'none'
    };

    var showDataButtonStyle = $.extend(
      {
        float: 'right',
        textAlign: 'left',
        maxWidth: '100%',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      },
      buttonStyle,
      inactive,
      this.props.hideViewDataButton ? hidden : null
    );
    var iconStyle = {
      margin: '0 0.3em'
    };

    if (this.state.mode === Mode.CODE) {
      showDataButton = (
        React.createElement("button", {
            id: "viewDataButton", 
            style: showDataButtonStyle, 
            className: "no-outline", 
            onClick: this.props.onViewDataButton}, 
          React.createElement("i", {className: "fa fa-database", style: iconStyle}), 
          applabMsg.viewData()
        )
      );
    } else if (this.state.mode === Mode.DESIGN) {
      var options = this.props.screens.map(function (item) {
        return React.createElement("option", {key: item}, item);
      });

      selectDropdown = (
        React.createElement("select", {
          id: "screenSelector", 
          style: dropdownStyle, 
          value: this.state.activeScreen, 
          onChange: this.handleScreenChange, 
          disabled: Applab.isRunning()}, 
          options, 
          React.createElement("option", null, NEW_SCREEN)
        )
      );
    }

    return (
      React.createElement("table", {style: {width: '100%'}}, 
        React.createElement("tbody", null, 
          React.createElement("tr", null, 
            React.createElement("td", {style: {width: '120px'}}, 
              React.createElement("button", {
                  id: "codeModeButton", 
                  style: $.extend({}, codeButtonStyle,
                      this.state.mode === Mode.CODE ? active : inactive,
                      this.props.hideToggle ? hidden : null), 
                  className: "no-outline", 
                  onClick: this.handleSetMode.bind(this, Mode.CODE)}, 
                msg.codeMode()
              ), 
              React.createElement("button", {
                  id: "designModeButton", 
                  style: $.extend({}, designButtonStyle,
                      this.state.mode === Mode.DESIGN ? active : inactive,
                      this.props.hideToggle ? hidden : null), 
                  className: "no-outline", 
                  onClick: this.handleSetMode.bind(this, Mode.DESIGN)}, 
                msg.designMode()
              )
            ), 
            React.createElement("td", {style: {maxWidth: 0}}, 
              selectDropdown, 
              showDataButton
            )
          )
        )
      )
    );
  }
});


},{"../locale":"/home/ubuntu/staging/apps/build/js/locale.js","./locale":"/home/ubuntu/staging/apps/build/js/applab/locale.js"}],"/home/ubuntu/staging/apps/build/js/applab/DesignModeHeaders.jsx":[function(require,module,exports){
var applabMsg = require('./locale');
var msg = require('../locale');

module.exports = React.createClass({displayName: "exports",
  propTypes: {
    handleManageAssets: React.PropTypes.func.isRequired,
    onToggleToolbox: React.PropTypes.func.isRequired,
    isToolboxVisible: React.PropTypes.bool.isRequired
  },

  handleManageAssets: function() {
    this.props.handleManageAssets();
  },

  onToggleToolbox: function() {
    this.props.onToggleToolbox();
  },

  render: function() {
    var styles = {
      toolboxHeader: {
        display: this.props.isToolboxVisible ? 'block' : 'none',
        width: 270,
        borderRight: '1px solid gray',
        float: 'left'
      },
      showToolboxHeader: {
        float: 'left',
        display: this.props.isToolboxVisible ? 'none' : 'block',
        paddingLeft: 10
      },
      iconContainer: {
        float: 'right',
        marginRight: 10,
        marginLeft: 10,
        height: '100%'
      },
      assetsIcon: {
        fontSize: 18,
        verticalAlign: 'middle'
      }
    };

    var manageAssetsIcon = (
      React.createElement("span", {style: styles.iconContainer}, 
        React.createElement("i", {className: "fa fa-cog workspace-header-clickable", 
          id: "manage-assets-button", 
          style: styles.assetsIcon, 
          onClick: this.handleManageAssets, 
          title: applabMsg.manageAssets()})
      )
    );

    return (
      React.createElement("div", {id: "design-headers"}, 
        React.createElement("div", {id: "design-toolbox-header", className: "workspace-header", style: styles.toolboxHeader}, 
          manageAssetsIcon, 
          React.createElement("span", null, applabMsg.designToolboxHeader()), 
          React.createElement("span", {className: "workspace-header-clickable", onClick: this.onToggleToolbox}, " ", msg.hideToolbox())
        ), 
        React.createElement("div", {className: "workspace-header", onClick: this.onToggleToolbox, 
            style: styles.showToolboxHeader}, 
          React.createElement("span", {className: "workspace-header-clickable"}, msg.showToolbox()), 
          manageAssetsIcon
        ), 
        React.createElement("div", {id: "design-workspace-header", className: "workspace-header"}, 
          React.createElement("span", null, applabMsg.designWorkspaceHeader())
        )
      )
    );
  }
});


},{"../locale":"/home/ubuntu/staging/apps/build/js/locale.js","./locale":"/home/ubuntu/staging/apps/build/js/applab/locale.js"}],"/home/ubuntu/staging/apps/build/js/applab/DesignModeBox.jsx":[function(require,module,exports){
/* global $ */

var DesignToolbox = require('./DesignToolbox.jsx');
var DesignProperties = require('./designProperties.jsx');

module.exports = React.createClass({displayName: "exports",
  propTypes: {
    handleDragStart: React.PropTypes.func,
    element: React.PropTypes.instanceOf(HTMLElement),
    handleChange: React.PropTypes.func.isRequired,
    onDepthChange: React.PropTypes.func.isRequired,
    onDelete: React.PropTypes.func.isRequired,
    onInsertEvent: React.PropTypes.func.isRequired,
    isToolboxVisible: React.PropTypes.bool.isRequired,
    isDimmed: React.PropTypes.bool.isRequired
  },

  render: function() {
    var styles = {
      container: {
        position: 'absolute',
        width: '100%',
        top: 30,
        bottom: 0,
        backgroundColor: 'white',
        boxSizing: 'border-box',
        borderLeft: '1px solid gray',
        borderRight: '1px solid gray',
        borderBottom: '1px solid gray'
      },
      designProperties: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: this.props.isToolboxVisible ? 270 : 0,
        right: 0,
        boxSizing: 'border-box',
        padding: 10
      },
      transparent: {
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        position: 'relative',
        zIndex: 1
      }
    };

    var transparencyLayer;
    // Slightly gray everything while running
    if (this.props.isDimmed) {
      transparencyLayer = (
        React.createElement("div", {id: "design-mode-dimmed", style: styles.transparent})
      );
    }

    return (
      React.createElement("div", {id: "design-mode-container", style: styles.container}, 
        React.createElement(DesignToolbox, {
            handleDragStart: this.props.handleDragStart, 
            isToolboxVisible: this.props.isToolboxVisible}), 
        React.createElement("div", {id: "design-properties", style: styles.designProperties}, 
          React.createElement(DesignProperties, {
            element: this.props.element, 
            handleChange: this.props.handleChange, 
            onDepthChange: this.props.onDepthChange, 
            onDelete: this.props.onDelete, 
            onInsertEvent: this.props.onInsertEvent})
        ), 
        transparencyLayer
      )
    );
  }
});


},{"./DesignToolbox.jsx":"/home/ubuntu/staging/apps/build/js/applab/DesignToolbox.jsx","./designProperties.jsx":"/home/ubuntu/staging/apps/build/js/applab/designProperties.jsx"}],"/home/ubuntu/staging/apps/build/js/applab/designProperties.jsx":[function(require,module,exports){
/* global $*/

var applabMsg = require('./locale');
var elementLibrary = require('./designElements/library');

var DeleteElementButton = require('./designElements/DeleteElementButton.jsx');

var nextKey = 0;

var DesignProperties = module.exports = React.createClass({displayName: "exports",
  propTypes: {
    element: React.PropTypes.instanceOf(HTMLElement),
    handleChange: React.PropTypes.func.isRequired,
    onDepthChange: React.PropTypes.func.isRequired,
    onDelete: React.PropTypes.func.isRequired,
    onInsertEvent: React.PropTypes.func.isRequired
  },

  getInitialState: function() {
    return {selectedTab: TabType.PROPERTIES};
  },

  /**
   * Handle a click on a tab, such as 'properties' or 'events'.
   * @param newTab {TabType} Tab to switch to.
   */
  handleTabClick: function(newTab) {
    this.setState({selectedTab: newTab});
  },

  render: function() {
    if (!this.props.element || !this.props.element.parentNode) {
      return React.createElement("p", null, applabMsg.designWorkspaceDescription());
    }

    // We want to have a unique key that doesn't change when the element id
    // changes, and has no risk of collisions between elements. We add this to
    // the backing element using jquery.data(), which keeps its own per-session
    // store of data, without affecting the serialiazation
    var key = $(this.props.element).data('key');
    if (!key) {
      key = nextKey++;
      $(this.props.element).data('key', key);
    }

    var elementType = elementLibrary.getElementType(this.props.element);
    var propertyClass = elementLibrary.getElementPropertyTab(elementType);

    var propertiesElement = React.createElement(propertyClass, {
      element: this.props.element,
      handleChange: this.props.handleChange,
      onDepthChange: this.props.onDepthChange
    });

    var eventClass = elementLibrary.getElementEventTab(elementType);
    var eventsElement = React.createElement(eventClass, {
      element: this.props.element,
      handleChange: this.props.handleChange,
      onInsertEvent: this.props.onInsertEvent
    });

    var deleteButton;
    var element = this.props.element;
    // First screen is not deletable
    var firstScreen = elementType === elementLibrary.ElementType.SCREEN &&
        element.parentNode.firstChild === element;
    if (!firstScreen) {
      deleteButton = (React.createElement(DeleteElementButton, {
        shouldConfirm: elementType === elementLibrary.ElementType.SCREEN, 
        handleDelete: this.props.onDelete}));
    }

    var tabHeight = 35;
    var borderColor = '#c6cacd';
    var bgColor = '#e7e8ea';

    // Diagram of how tabs outlines are drawn. 'x' represents solid border.
    // '-' and '|' represent no border.
    //
    // x----------------------------------------------------------------------|
    // x designWorkspaceTabs                                                  |
    // x                                                                      |
    // x  |xxxxxxxxxxxxxx  |xxxxxxxxxxxxxx  |xxxxxxxxxxxxxx  |-------------|  |
    // x  | inactiveTab x  |  activeTab  x  | inactiveTab x  |  emptyTab   |  |
    // x  |xxxxxxxxxxxxxx  |-------------x  |xxxxxxxxxxxxxx  |xxxxxxxxxxxxx|  |
    // x                                                                      |
    // x----------------------------------------------------------------------|
    //
    // x----------------------------------------------------------------------x
    // x designWorkspaceBody                                                  x
    // x                                                                      x
    // xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

    var baseTabStyle = {
      borderColor: borderColor,
      borderStyle: 'solid',
      boxSizing: 'border-box',
      height: tabHeight,
      padding: '0 10px'
    };

    /** @constant {Object} */
    var styles = {
      activeTab: $.extend({}, baseTabStyle, {
        backgroundColor: bgColor,
        borderTopWidth: 1,
        borderRightWidth: 1,
        borderBottomWidth: 0,
        borderLeftWidth: 0,
        float: 'left'
      }),
      inactiveTab: $.extend({}, baseTabStyle, {
        borderTopWidth: 1,
        borderRightWidth: 1,
        borderBottomWidth: 1,
        borderLeftWidth: 0,
        float: 'left'
      }),
      // This tab should fill the remaining horizontal space.
      emptyTab: $.extend({}, baseTabStyle, {
        borderTopWidth: 0,
        borderRightWidth: 0,
        borderBottomWidth: 1,
        borderLeftWidth: 0,
        width: '100%'
      }),
      workspaceDescription: {
        height: 28,
        overflow: 'hidden'
      },
      workspaceTabs: {
        borderColor: borderColor,
        borderStyle: 'solid',
        borderTopWidth: 0,
        borderRightWidth: 0,
        borderBottomWidth: 0,
        borderLeftWidth: 1
      },
      tabLabel: {
        lineHeight: tabHeight + 'px',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        userSelect: 'none'
      },
      workspaceBody: {
        height: 'calc(100% - 83px)',
        padding: '10px 10px 10px 0',
        borderColor: borderColor,
        borderStyle: 'solid',
        borderTopWidth: 0,
        borderRightWidth: 1,
        borderBottomWidth: 1,
        borderLeftWidth: 1,
        backgroundColor: bgColor
      },
      activeBody: {
        height: '100%',
        overflowY: 'scroll'
      },
      inactiveBody: {
        display: 'none',
        height: '100%',
        overflowY: 'scroll'
      }
    };

    return (
      React.createElement("div", {style: {height: '100%'}}, 
        React.createElement("div", {id: "designDescription", style: styles.workspaceDescription}, 
          React.createElement("p", null, applabMsg.designWorkspaceDescription())
        ), 
        React.createElement("div", {id: "designWorkspaceTabs", style: styles.workspaceTabs}, 
          React.createElement("div", {id: "propertiesTab", 
              style: this.state.selectedTab === TabType.PROPERTIES ? styles.activeTab : styles.inactiveTab, 
              className: "hover-pointer", 
              onClick: this.handleTabClick.bind(this, TabType.PROPERTIES)}, 
            React.createElement("span", {style: styles.tabLabel}, "PROPERTIES")
          ), 
          React.createElement("div", {id: "eventsTab", 
              style: this.state.selectedTab === TabType.EVENTS ? styles.activeTab : styles.inactiveTab, 
              className: "hover-pointer", 
              onClick: this.handleTabClick.bind(this, TabType.EVENTS)}, 
            React.createElement("span", {style: styles.tabLabel}, "EVENTS")
          ), 
          React.createElement("div", {id: "emptyTab", style: styles.emptyTab}
          )
        ), 
        React.createElement("div", {id: "designWorkspaceBody", style: styles.workspaceBody}, 
          React.createElement("div", {id: "propertiesBody", 
              style: this.state.selectedTab === TabType.PROPERTIES ? styles.activeBody : styles.inactiveBody}, 
            /* We provide a key to the outer div so that element foo and element bar are
               seen to be two completely different tables. Otherwise the defaultValues
               in inputs don't update correctly. */
            React.createElement("div", {key: key}, 
              propertiesElement, 
              deleteButton
            )
          ), 
          React.createElement("div", {id: "eventsBody", 
              style: this.state.selectedTab === TabType.EVENTS ? styles.activeBody : styles.inactiveBody}, 
            eventsElement
          )
        )
      )
    );
  }
});

/**
 * @readonly
 * @enum {string}
 */
var TabType = {
  PROPERTIES: 'properties',
  EVENTS: 'events'
};
DesignProperties.TabType = TabType;


},{"./designElements/DeleteElementButton.jsx":"/home/ubuntu/staging/apps/build/js/applab/designElements/DeleteElementButton.jsx","./designElements/library":"/home/ubuntu/staging/apps/build/js/applab/designElements/library.js","./locale":"/home/ubuntu/staging/apps/build/js/applab/locale.js"}],"/home/ubuntu/staging/apps/build/js/applab/designElements/DeleteElementButton.jsx":[function(require,module,exports){
/* global $ */
var rowStyle = require('./rowStyle');

/**
 * A delete button that will also ask for confirmation when shouldConfirm is
 * true.
 */
var DeleteElementButton = React.createClass({displayName: "DeleteElementButton",
  propTypes: {
    shouldConfirm: React.PropTypes.bool.isRequired,
    handleDelete: React.PropTypes.func.isRequired
  },

  getInitialState: function () {
    return {
      confirming: false
    };
  },

  handleDeleteInternal: function(event) {
    if (this.props.shouldConfirm) {
      this.setState({confirming: true});
    } else {
      this.finishDelete();
    }
  },

  finishDelete: function () {
    this.props.handleDelete();
  },

  abortDelete: function (event) {
    this.setState({confirming: false});
  },

  render: function() {
    var buttonStyle = {
      paddingTop: '5px',
      paddingBottom: '5px',
      fontSize: '14px',
    };

    var redButtonStyle = $.extend({}, buttonStyle, {
      backgroundColor: '#c00', // $red
      color: 'white'
    });

    var confirm;
    if (this.state.confirming) {
      return (
        React.createElement("div", {style: {marginLeft: 20}}, 
          "Delete?", 
          React.createElement("button", {
            style: buttonStyle, 
            onClick: this.abortDelete}, 
            "No"
          ), 
          React.createElement("button", {
            style: redButtonStyle, 
            onClick: this.finishDelete}, 
            "Yes"
          )
        )
      );
    }
    return (
      React.createElement("div", {style: {marginLeft: 15}}, 
        React.createElement("button", {
          style: redButtonStyle, 
          onClick: this.handleDeleteInternal}, 
          "Delete"
        )
      )
    );
  }
});

module.exports = DeleteElementButton;


},{"./rowStyle":"/home/ubuntu/staging/apps/build/js/applab/designElements/rowStyle.js"}],"/home/ubuntu/staging/apps/build/js/applab/DesignToolbox.jsx":[function(require,module,exports){
/* global $ */

var DesignToolboxElement = require('./DesignToolboxElement.jsx');
var applabMsg = require('./locale');

var IMAGE_BASE_URL = '/blockly/media/applab/design_toolbox/';

module.exports = React.createClass({displayName: "exports",
  propTypes: {
    handleDragStart: React.PropTypes.func.isRequired,
    isToolboxVisible: React.PropTypes.bool.isRequired
  },

  render: function () {
    var toolboxStyle = {
      display: this.props.isToolboxVisible ? 'block' : 'none',
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: 270,
        boxSizing: 'border-box',
        borderRight: '1px solid gray',
        padding: 10
    };

    return (
      React.createElement("div", {id: "design-toolbox", style: toolboxStyle}, 
        React.createElement("p", null, applabMsg.designToolboxDescription()), 
        React.createElement(DesignToolboxElement, {
            imageUrl: IMAGE_BASE_URL + 'button.png', 
            desc: 'Button', 
            elementType: 'BUTTON', 
            handleDragStart: this.props.handleDragStart}), 
        React.createElement(DesignToolboxElement, {
            imageUrl: IMAGE_BASE_URL + 'input.png', 
            desc: 'Text Input', 
            elementType: 'TEXT_INPUT', 
            handleDragStart: this.props.handleDragStart}), 
        React.createElement(DesignToolboxElement, {
            imageUrl: IMAGE_BASE_URL + 'label.png', 
            desc: 'Label', 
            elementType: 'LABEL', 
            handleDragStart: this.props.handleDragStart}), 
        React.createElement(DesignToolboxElement, {
            imageUrl: IMAGE_BASE_URL + 'dropdown.png', 
            desc: 'Dropdown', 
            elementType: 'DROPDOWN', 
            handleDragStart: this.props.handleDragStart}), 
        React.createElement(DesignToolboxElement, {
            imageUrl: IMAGE_BASE_URL + 'radio.png', 
            desc: 'Radio Button', 
            elementType: 'RADIO_BUTTON', 
            handleDragStart: this.props.handleDragStart}), 
        React.createElement(DesignToolboxElement, {
            imageUrl: IMAGE_BASE_URL + 'checkbox.png', 
            desc: 'Checkbox', 
            elementType: 'CHECKBOX', 
            handleDragStart: this.props.handleDragStart}), 
        React.createElement(DesignToolboxElement, {
            imageUrl: IMAGE_BASE_URL + 'image.png', 
            desc: 'Image', 
            elementType: 'IMAGE', 
            handleDragStart: this.props.handleDragStart}), 
        React.createElement(DesignToolboxElement, {
            imageUrl: IMAGE_BASE_URL + 'canvas.png', 
            desc: 'Canvas', 
            elementType: 'CANVAS', 
            handleDragStart: this.props.handleDragStart}), 
        React.createElement(DesignToolboxElement, {
            imageUrl: IMAGE_BASE_URL + 'screen.png', 
            desc: 'Screen', 
            elementType: 'SCREEN', 
            handleDragStart: this.props.handleDragStart}), 
        React.createElement(DesignToolboxElement, {
            imageUrl: IMAGE_BASE_URL + 'textarea.png', 
            desc: 'Text Area', 
            elementType: 'TEXT_AREA', 
            handleDragStart: this.props.handleDragStart}), 
        React.createElement(DesignToolboxElement, {
            imageUrl: IMAGE_BASE_URL + 'chart.png', 
            desc: 'Chart', 
            elementType: 'CHART', 
            handleDragStart: this.props.handleDragStart})
      )
    );
  }
});


},{"./DesignToolboxElement.jsx":"/home/ubuntu/staging/apps/build/js/applab/DesignToolboxElement.jsx","./locale":"/home/ubuntu/staging/apps/build/js/applab/locale.js"}],"/home/ubuntu/staging/apps/build/js/applab/DesignToolboxElement.jsx":[function(require,module,exports){
/* global $ */

var library = require('./designElements/library');

module.exports = React.createClass({displayName: "exports",
  propTypes: {
    imageUrl: React.PropTypes.string.isRequired,
    desc: React.PropTypes.string.isRequired,
    elementType: React.PropTypes.string.isRequired,
    handleDragStart: React.PropTypes.func.isRequired
  },

  render: function() {
    var styles = {
      outerContainer: {
        // The icon images are 120px wide and depend on this width for scaling.
        width: 120,
        display: 'inline-block',
        textAlign: 'center',
        paddingBottom: 15
      },
      innerContainer: {
        textAlign: 'center'
      },
      image: {
        marginBottom: 5
      }
    };

    return (
      React.createElement("div", {style: styles.outerContainer}, 
        React.createElement("div", {style: styles.innerContainer, 
          "data-element-type": this.props.elementType, 
          className: "new-design-element"}, 
          React.createElement("img", {src: this.props.imageUrl, 
              className: "design-element-image", 
              style: styles.image}
          ), 
          React.createElement("div", null, this.props.desc)
        )
      )
    );
  },

  componentDidMount: function () {
    this.makeDraggable();
  },

  componentDidUpdate: function () {
    this.makeDraggable();
  },

  /**
   * Create a draggable item as we drag an item from the toolbox.
   */
  makeDraggable: function () {
    $(this.getDOMNode()).find('.new-design-element').draggable({
      // Create an item (without an id) for dragging that looks identical to the
      // element that will ultimately be dropped. Note, this item has no
      // containment, and doesn't snap to a grid as we drag (but does on drop)
      helper: function (event) {
        var elementType = this.getAttribute('data-element-type');
        if (elementType === library.ElementType.SCREEN) {
          return $(this).clone();
        }
        var element = library.createElement(elementType, 0, 0, true);
        element.style.position = 'static';

        var div = document.getElementById('divApplab');
        var xScale = div.getBoundingClientRect().width / div.offsetWidth;
        var yScale = div.getBoundingClientRect().height / div.offsetHeight;

        var parent = $('<div/>').addClass('draggingParent');

        parent[0].style.transform = "scale(" + xScale + ", " + yScale + ")";
        parent[0].style.webkitTransform = "scale(" + xScale + ", " + yScale + ")";
        parent[0].style.backgroundColor = 'transparent';

        // Have the cursor be in the center of the dragged item.
        // element.width/height() returns 0 for canvas (probably because it
        // hasn't actually been renderd yet)
        var elementWidth = $(element).width() ||
          parseInt(element.getAttribute('width'), 10);
        var elementHeight = $(element).height() ||
          parseInt(element.getAttribute('height'), 10);
        // phantom/FF seem to not have event.offsetY, so go calculate it
        var offsetY = (event.offsetY || event.pageY - $(event.target).offset().top);
        $(this).draggable('option', 'cursorAt', {
          left: elementWidth / 2,
          top: Math.min(offsetY, elementHeight)
        });

        return parent.append(element)[0];
      },
      containment: 'document',
      appendTo: '#codeApp',
      revert: 'invalid',
      // Make sure the dragged element appears in front of #belowVisualization,
      // which has z-index 1.
      zIndex: 2,
      start: this.props.handleDragStart
    });
  }
});


},{"./designElements/library":"/home/ubuntu/staging/apps/build/js/applab/designElements/library.js"}],"/home/ubuntu/staging/apps/build/js/applab/designElements/library.js":[function(require,module,exports){
var utils = require('../../utils');
var _ = utils.getLodash();
var elementUtils = require('./elementUtils');

/**
 * A map from prefix to the next numerical suffix to try to
 * use as an id in the applab app's DOM.
 * @type {Object.<string, number>}
 */
var nextElementIdMap = {};

/**
 * @readonly
 * @enum {string}
 */
var ElementType = {
  BUTTON: 'BUTTON',
  LABEL: 'LABEL',
  TEXT_INPUT: 'TEXT_INPUT',
  CHECKBOX: 'CHECKBOX',
  DROPDOWN: 'DROPDOWN',
  RADIO_BUTTON: 'RADIO_BUTTON',
  TEXT_AREA: 'TEXT_AREA',
  IMAGE: 'IMAGE',
  CANVAS: 'CANVAS',
  SCREEN: 'SCREEN',
  CHART: 'CHART'
};

var elements = {};
elements[ElementType.BUTTON] = require('./button.jsx');
elements[ElementType.LABEL] = require('./label.jsx');
elements[ElementType.TEXT_INPUT] = require('./textInput.jsx');
elements[ElementType.CHECKBOX] = require('./checkbox.jsx');
elements[ElementType.DROPDOWN] = require('./dropdown.jsx');
elements[ElementType.RADIO_BUTTON] = require('./radioButton.jsx');
elements[ElementType.TEXT_AREA] = require('./textarea.jsx');
elements[ElementType.IMAGE] = require('./image.jsx');
elements[ElementType.CANVAS] = require('./canvas.jsx');
elements[ElementType.SCREEN] = require('./screen.jsx');
elements[ElementType.CHART] = require('./chart.jsx');

module.exports = {
  ElementType: ElementType,
  /**
   * Returns an element id with the given prefix which is unused within
   * the applab app's DOM.
   * @param {string} prefix
   * @returns {string}
   */
  // TODO (brent) - the following seems a little bit strange to me:
  // 1) Add item1, item2, delete item1
  // 2) Add another item, it gets id item3
  // 3) Reload page, add another item, it gets item1
  // Seems a little like we should always get the lowest available (as in step 3)
  // or always get the next (as in step 2)
  getUnusedElementId: function (prefix) {
    var i = nextElementIdMap[prefix] || 1;
    while (elementUtils.getPrefixedElementById(prefix + i)) {
      i++;
    }
    nextElementIdMap[prefix] = i + 1;
    return prefix + i;
  },

  /**
   * Resets the next element id for all prefixes to be 1. Called after clearing
   * all design mode elements
   */
  resetIds: function () {
    nextElementIdMap = {};
  },

  /**
   * Create a new element of the specified type
   * @param {ElementType} elementType Type of element to create
   * @param {number} left Position from left.
   * @param {number} top Position from top.
   * @param {boolean} [withoutId] If true, don't generate an id
   */
  createElement: function (elementType, left, top, withoutId) {
    var elementClass = elements[elementType];
    if (!elementClass) {
      throw new Error('Unknown elementType: ' + elementType);
    }

    var element = elementClass.create();

    // Stuff that's common across all elements
    if (!withoutId) {
      elementUtils.setId(element, this.getUnusedElementId(elementType.toLowerCase()));
    }

    if (elementType !== ElementType.SCREEN) {
      element.style.position = 'absolute';
      element.style.left = left + 'px';
      element.style.top = top + 'px';
      element.style.margin = '0px';
    }

    return element;
  },

  getElementPropertyTab: function (elementType) {
    return elements[elementType].PropertyTab;
  },

  getElementEventTab: function(elementType) {
    return elements[elementType].EventTab;
  },

  /**
   * @param {HTMLElement} element
   * @returns {string} String representing elementType
   */
  getElementType: function (element) {
    var tagname = element.tagName.toLowerCase();

    switch (tagname) {
      case 'button':
        return ElementType.BUTTON;
      case 'label':
        return ElementType.LABEL;
      case 'select':
        return ElementType.DROPDOWN;
      case 'div':
        if ($(element).hasClass('screen')) {
          return ElementType.SCREEN;
        } else if ($(element).hasClass('chart')) {
          return ElementType.CHART;
        }
        return ElementType.TEXT_AREA;
      case 'img':
        return ElementType.IMAGE;
      case 'canvas':
        return ElementType.CANVAS;
      case 'input':
        switch (element.getAttribute('type')) {
          case 'checkbox':
            return ElementType.CHECKBOX;
          case 'radio':
            return ElementType.RADIO_BUTTON;
          default:
            return ElementType.TEXT_INPUT;
        }
        break;
    }
    throw new Error('unknown element type');
  },

  /**
   * Code to be called after deserializing element, allowing us to attach any
   * necessary event handlers.
   */
  onDeserialize: function (element, updateProperty) {
    var elementType = this.getElementType(element);
    if (elements[elementType] && elements[elementType].onDeserialize) {
      elements[elementType].onDeserialize(element, updateProperty);
    }
  },

  /**
   * Handle any element specific property changes. Called after designMode gets
   * first crack at handling change.
   * @returns {boolean} True if we modified the element in such a way that the
   *   property table needs to be updated.
   */
  typeSpecificPropertyChange: function (element, name, value) {
    var elementType = this.getElementType(element);
    if (elements[elementType].onPropertyChange) {
      return elements[elementType].onPropertyChange(element, name, value);
    }
    return false;
  }
};


},{"../../utils":"/home/ubuntu/staging/apps/build/js/utils.js","./button.jsx":"/home/ubuntu/staging/apps/build/js/applab/designElements/button.jsx","./canvas.jsx":"/home/ubuntu/staging/apps/build/js/applab/designElements/canvas.jsx","./chart.jsx":"/home/ubuntu/staging/apps/build/js/applab/designElements/chart.jsx","./checkbox.jsx":"/home/ubuntu/staging/apps/build/js/applab/designElements/checkbox.jsx","./dropdown.jsx":"/home/ubuntu/staging/apps/build/js/applab/designElements/dropdown.jsx","./elementUtils":"/home/ubuntu/staging/apps/build/js/applab/designElements/elementUtils.js","./image.jsx":"/home/ubuntu/staging/apps/build/js/applab/designElements/image.jsx","./label.jsx":"/home/ubuntu/staging/apps/build/js/applab/designElements/label.jsx","./radioButton.jsx":"/home/ubuntu/staging/apps/build/js/applab/designElements/radioButton.jsx","./screen.jsx":"/home/ubuntu/staging/apps/build/js/applab/designElements/screen.jsx","./textInput.jsx":"/home/ubuntu/staging/apps/build/js/applab/designElements/textInput.jsx","./textarea.jsx":"/home/ubuntu/staging/apps/build/js/applab/designElements/textarea.jsx"}],"/home/ubuntu/staging/apps/build/js/applab/designElements/textarea.jsx":[function(require,module,exports){
/* global $ */

var PropertyRow = require('./PropertyRow.jsx');
var BooleanPropertyRow = require('./BooleanPropertyRow.jsx');
var ColorPickerPropertyRow = require('./ColorPickerPropertyRow.jsx');
var ZOrderRow = require('./ZOrderRow.jsx');
var EventHeaderRow = require('./EventHeaderRow.jsx');
var EventRow = require('./EventRow.jsx');

var elementUtils = require('./elementUtils');

var TextAreaProperties = React.createClass({displayName: "TextAreaProperties",
  propTypes: {
    element: React.PropTypes.instanceOf(HTMLElement).isRequired,
    handleChange: React.PropTypes.func.isRequired,
    onDepthChange: React.PropTypes.func.isRequired
  },

  render: function () {
    var element = this.props.element;

    return (
      React.createElement("div", {id: "propertyRowContainer"}, 
        React.createElement(PropertyRow, {
          desc: 'id', 
          initialValue: elementUtils.getId(element), 
          handleChange: this.props.handleChange.bind(this, 'id'), 
          isIdRow: true}), 
        React.createElement(PropertyRow, {
          desc: 'text', 
          isMultiLine: true, 
          initialValue: $(element).text(), 
          handleChange: this.props.handleChange.bind(this, 'text')}), 
        React.createElement(PropertyRow, {
          desc: 'width (px)', 
          isNumber: true, 
          initialValue: parseInt(element.style.width, 10), 
          foo: parseInt(element.style.width, 10), 
          handleChange: this.props.handleChange.bind(this, 'style-width')}), 
        React.createElement(PropertyRow, {
          desc: 'height (px)', 
          isNumber: true, 
          initialValue: parseInt(element.style.height, 10), 
          handleChange: this.props.handleChange.bind(this, 'style-height')}), 
        React.createElement(PropertyRow, {
          desc: 'x position (px)', 
          isNumber: true, 
          initialValue: parseInt(element.style.left, 10), 
          handleChange: this.props.handleChange.bind(this, 'left')}), 
        React.createElement(PropertyRow, {
          desc: 'y position (px)', 
          isNumber: true, 
          initialValue: parseInt(element.style.top, 10), 
          handleChange: this.props.handleChange.bind(this, 'top')}), 
        React.createElement(ColorPickerPropertyRow, {
          desc: 'text color', 
          initialValue: elementUtils.rgb2hex(element.style.color), 
          handleChange: this.props.handleChange.bind(this, 'textColor')}), 
        React.createElement(ColorPickerPropertyRow, {
          desc: 'background color', 
          initialValue: elementUtils.rgb2hex(element.style.backgroundColor), 
          handleChange: this.props.handleChange.bind(this, 'backgroundColor')}), 
        React.createElement(PropertyRow, {
          desc: 'font size (px)', 
          isNumber: true, 
          initialValue: parseInt(element.style.fontSize, 10), 
          handleChange: this.props.handleChange.bind(this, 'fontSize')}), 
        React.createElement(BooleanPropertyRow, {
          desc: 'hidden', 
          initialValue: $(element).hasClass('design-mode-hidden'), 
          handleChange: this.props.handleChange.bind(this, 'hidden')}), 
        React.createElement(ZOrderRow, {
          element: this.props.element, 
          onDepthChange: this.props.onDepthChange})

      ));

    // TODO:
    // bold/italics/underline (p2)
    // textAlignment (p2)
    // enabled (p2)
  }
});

var TextAreaEvents = React.createClass({displayName: "TextAreaEvents",
  propTypes: {
    element: React.PropTypes.instanceOf(HTMLElement).isRequired,
    handleChange: React.PropTypes.func.isRequired
  },

  getChangeEventCode: function() {
    var id = elementUtils.getId(this.props.element);
    var code =
      'onEvent("' + id + '", "change", function(event) {\n' +
      '  console.log("' + id + ' entered text: " + getText("' + id + '"));\n' +
      '});\n';
    return code;
  },

  insertChange: function() {
    this.props.onInsertEvent(this.getChangeEventCode());
  },

  render: function () {
    var element = this.props.element;
    var changeName = 'Change';
    var changeDesc = 'Triggered when the text area loses focus if the text has changed.';

    return (
      React.createElement("div", {id: "eventRowContainer"}, 
        React.createElement(PropertyRow, {
          desc: 'id', 
          initialValue: elementUtils.getId(element), 
          handleChange: this.props.handleChange.bind(this, 'id'), 
          isIdRow: true}), 
        React.createElement(EventHeaderRow, null), 
        React.createElement(EventRow, {
          name: changeName, 
          desc: changeDesc, 
          handleInsert: this.insertChange})
      )
    );
  }
});

module.exports = {
  PropertyTab: TextAreaProperties,
  EventTab: TextAreaEvents,

  create: function() {
    var element = document.createElement('div');
    element.setAttribute('contenteditable', true);
    element.style.width = '200px';
    element.style.height = '100px';
    element.style.fontSize = '14px';
    element.style.color = '#000000';
    element.style.backgroundColor = '#ffffff';

    this.onDeserialize(element);

    return element;
  },

  onDeserialize: function (element) {
    // swallow keydown unless we're running
    $(element).on('keydown', function (e) {
      if (!Applab.isRunning()) {
        e.preventDefault();
      }
    });
  }
};


},{"./BooleanPropertyRow.jsx":"/home/ubuntu/staging/apps/build/js/applab/designElements/BooleanPropertyRow.jsx","./ColorPickerPropertyRow.jsx":"/home/ubuntu/staging/apps/build/js/applab/designElements/ColorPickerPropertyRow.jsx","./EventHeaderRow.jsx":"/home/ubuntu/staging/apps/build/js/applab/designElements/EventHeaderRow.jsx","./EventRow.jsx":"/home/ubuntu/staging/apps/build/js/applab/designElements/EventRow.jsx","./PropertyRow.jsx":"/home/ubuntu/staging/apps/build/js/applab/designElements/PropertyRow.jsx","./ZOrderRow.jsx":"/home/ubuntu/staging/apps/build/js/applab/designElements/ZOrderRow.jsx","./elementUtils":"/home/ubuntu/staging/apps/build/js/applab/designElements/elementUtils.js"}],"/home/ubuntu/staging/apps/build/js/applab/designElements/textInput.jsx":[function(require,module,exports){
/* global $ */


var PropertyRow = require('./PropertyRow.jsx');
var BooleanPropertyRow = require('./BooleanPropertyRow.jsx');
var ColorPickerPropertyRow = require('./ColorPickerPropertyRow.jsx');
var ZOrderRow = require('./ZOrderRow.jsx');
var EventHeaderRow = require('./EventHeaderRow.jsx');
var EventRow = require('./EventRow.jsx');

var elementUtils = require('./elementUtils');

var TextInputProperties = React.createClass({displayName: "TextInputProperties",
  propTypes: {
    element: React.PropTypes.instanceOf(HTMLElement).isRequired,
    handleChange: React.PropTypes.func.isRequired,
    onDepthChange: React.PropTypes.func.isRequired
  },

  render: function () {
    var element = this.props.element;

    return (
      React.createElement("div", {id: "propertyRowContainer"}, 
        React.createElement(PropertyRow, {
          desc: 'id', 
          initialValue: elementUtils.getId(element), 
          handleChange: this.props.handleChange.bind(this, 'id'), 
          isIdRow: true}), 
        React.createElement(PropertyRow, {
          desc: 'placeholder', 
          initialValue: element.getAttribute('placeholder') || '', 
          handleChange: this.props.handleChange.bind(this, 'placeholder')}), 
        React.createElement(PropertyRow, {
          desc: 'width (px)', 
          isNumber: true, 
          initialValue: parseInt(element.style.width, 10), 
          handleChange: this.props.handleChange.bind(this, 'style-width')}), 
        React.createElement(PropertyRow, {
          desc: 'height (px)', 
          isNumber: true, 
          initialValue: parseInt(element.style.height, 10), 
          handleChange: this.props.handleChange.bind(this, 'style-height')}), 
        React.createElement(PropertyRow, {
          desc: 'x position (px)', 
          isNumber: true, 
          initialValue: parseInt(element.style.left, 10), 
          handleChange: this.props.handleChange.bind(this, 'left')}), 
        React.createElement(PropertyRow, {
          desc: 'y position (px)', 
          isNumber: true, 
          initialValue: parseInt(element.style.top, 10), 
          handleChange: this.props.handleChange.bind(this, 'top')}), 
        React.createElement(ColorPickerPropertyRow, {
          desc: 'text color', 
          initialValue: elementUtils.rgb2hex(element.style.color), 
          handleChange: this.props.handleChange.bind(this, 'textColor')}), 
        React.createElement(ColorPickerPropertyRow, {
          desc: 'background color', 
          initialValue: elementUtils.rgb2hex(element.style.backgroundColor), 
          handleChange: this.props.handleChange.bind(this, 'backgroundColor')}), 
        React.createElement(PropertyRow, {
          desc: 'font size (px)', 
          isNumber: true, 
          initialValue: parseInt(element.style.fontSize, 10), 
          handleChange: this.props.handleChange.bind(this, 'fontSize')}), 
        React.createElement(BooleanPropertyRow, {
          desc: 'hidden', 
          initialValue: $(element).hasClass('design-mode-hidden'), 
          handleChange: this.props.handleChange.bind(this, 'hidden')}), 
        React.createElement(ZOrderRow, {
          element: this.props.element, 
          onDepthChange: this.props.onDepthChange})
      ));
  }
});

var TextInputEvents = React.createClass({displayName: "TextInputEvents",
  propTypes: {
    element: React.PropTypes.instanceOf(HTMLElement).isRequired,
    handleChange: React.PropTypes.func.isRequired,
    onInsertEvent: React.PropTypes.func.isRequired
  },

  getChangeEventCode: function() {
    var id = elementUtils.getId(this.props.element);
    var code =
      'onEvent("' + id + '", "change", function(event) {\n' +
      '  console.log("' + id + ' entered text: " + getText("' + id + '"));\n' +
      '});\n';
    return code;
  },

  insertChange: function() {
    this.props.onInsertEvent(this.getChangeEventCode());
  },

  getInputEventCode: function() {
    var id = elementUtils.getId(this.props.element);
    var code =
      'onEvent("' + id + '", "input", function(event) {\n' +
      '  console.log("' + id + ' current text: " + getText("' + id + '"));\n' +
      '});\n';
    return code;
  },

  insertInput: function() {
    this.props.onInsertEvent(this.getInputEventCode());
  },

  render: function () {
    var element = this.props.element;

    var changeName = 'Change';
    var changeDesc = 'Triggered when the text input loses focus if the text has changed.';

    var inputName = 'Input';
    var inputDesc = 'Triggered immediately every time the text input contents change.';

    return (
      React.createElement("div", {id: "eventRowContainer"}, 
        React.createElement(PropertyRow, {
          desc: 'id', 
          initialValue: elementUtils.getId(element), 
          handleChange: this.props.handleChange.bind(this, 'id'), 
          isIdRow: true}), 
        React.createElement(EventHeaderRow, null), 
        React.createElement(EventRow, {
          name: changeName, 
          desc: changeDesc, 
          handleInsert: this.insertChange}), 
        React.createElement(EventRow, {
          name: inputName, 
          desc: inputDesc, 
          handleInsert: this.insertInput})
      )
    );
  }
});

module.exports = {
  PropertyTab: TextInputProperties,
  EventTab: TextInputEvents,

  create: function () {
    var element = document.createElement('input');
    element.style.margin = '0px';
    element.style.width = '200px';
    element.style.height = '30px';
    element.style.color = '#000000';
    element.style.backgroundColor = '';

    return element;
  }
};


},{"./BooleanPropertyRow.jsx":"/home/ubuntu/staging/apps/build/js/applab/designElements/BooleanPropertyRow.jsx","./ColorPickerPropertyRow.jsx":"/home/ubuntu/staging/apps/build/js/applab/designElements/ColorPickerPropertyRow.jsx","./EventHeaderRow.jsx":"/home/ubuntu/staging/apps/build/js/applab/designElements/EventHeaderRow.jsx","./EventRow.jsx":"/home/ubuntu/staging/apps/build/js/applab/designElements/EventRow.jsx","./PropertyRow.jsx":"/home/ubuntu/staging/apps/build/js/applab/designElements/PropertyRow.jsx","./ZOrderRow.jsx":"/home/ubuntu/staging/apps/build/js/applab/designElements/ZOrderRow.jsx","./elementUtils":"/home/ubuntu/staging/apps/build/js/applab/designElements/elementUtils.js"}],"/home/ubuntu/staging/apps/build/js/applab/designElements/screen.jsx":[function(require,module,exports){

var PropertyRow = require('./PropertyRow.jsx');
var ColorPickerPropertyRow = require('./ColorPickerPropertyRow.jsx');
var ImagePickerPropertyRow = require('./ImagePickerPropertyRow.jsx');
var EventHeaderRow = require('./EventHeaderRow.jsx');
var EventRow = require('./EventRow.jsx');

var elementUtils = require('./elementUtils');

var ScreenProperties = React.createClass({displayName: "ScreenProperties",
  propTypes: {
    element: React.PropTypes.instanceOf(HTMLElement).isRequired,
    handleChange: React.PropTypes.func.isRequired
  },

  render: function () {
    var element = this.props.element;

    return (
      React.createElement("div", {id: "propertyRowContainer"}, 
        React.createElement(PropertyRow, {
          desc: 'id', 
          initialValue: elementUtils.getId(element), 
          handleChange: this.props.handleChange.bind(this, 'id'), 
          isIdRow: true}), 
        React.createElement(ColorPickerPropertyRow, {
          desc: 'background color', 
          initialValue: elementUtils.rgb2hex(element.style.backgroundColor), 
          handleChange: this.props.handleChange.bind(this, 'backgroundColor')}), 
        React.createElement(ImagePickerPropertyRow, {
          desc: 'image', 
          initialValue: element.getAttribute('data-canonical-image-url') || '', 
          handleChange: this.props.handleChange.bind(this, 'screen-image')})
      ));
  }
});

var ScreenEvents = React.createClass({displayName: "ScreenEvents",
  propTypes: {
    element: React.PropTypes.instanceOf(HTMLElement).isRequired,
    handleChange: React.PropTypes.func.isRequired
  },

  // The screen click event handler code currently receives clicks to any
  // other design element. This could be worked around by checking for
  // event.targetId === "<id>" here, at the expense of added complexity.
  getClickEventCode: function() {
    var id = elementUtils.getId(this.props.element);
    var code =
      'onEvent("' + id + '", "click", function(event) {\n' +
      '  console.log("' + id + ' clicked!");\n' +
      '  moveTo(event.x, event.y);\n' +
      '});\n';
    return code;
  },

  insertClick: function() {
    this.props.onInsertEvent(this.getClickEventCode());
  },

  getKeyEventCode: function() {
    var id = elementUtils.getId(this.props.element);
    var code =
      'onEvent("' + id + '", "keydown", function(event) {\n' +
      '  console.log("Key: " + event.key);\n' +
      '});\n';
    return code;
  },

  insertKey: function() {
    this.props.onInsertEvent(this.getKeyEventCode());
  },

  render: function () {
    var element = this.props.element;
    var clickName = 'Click';
    var clickDesc = 'Triggered when the screen is clicked with a mouse or tapped on a screen.';
    var keyName = 'Key';
    var keyDesc = 'Triggered when a key is pressed.';

    return (
      React.createElement("div", {id: "eventRowContainer"}, 
        React.createElement(PropertyRow, {
          desc: 'id', 
          initialValue: elementUtils.getId(element), 
          handleChange: this.props.handleChange.bind(this, 'id'), 
          isIdRow: true}), 
        React.createElement(EventHeaderRow, null), 
        React.createElement(EventRow, {
          name: clickName, 
          desc: clickDesc, 
          handleInsert: this.insertClick}), 
        React.createElement(EventRow, {
          name: keyName, 
          desc: keyDesc, 
          handleInsert: this.insertKey})
      )
    );
  }
});

module.exports = {
  PropertyTab: ScreenProperties,
  EventTab: ScreenEvents,

  create: function () {
    var element = document.createElement('div');
    element.setAttribute('class', 'screen');
    element.setAttribute('tabIndex', '1');
    element.style.display = 'block';
    element.style.height = Applab.footerlessAppHeight + 'px';
    element.style.width = Applab.appWidth + 'px';
    element.style.left = '0px';
    element.style.top = '0px';
    // We want our screen to be behind canvases. By setting any z-index on the
    // screen element, we create a new stacking context with this div as its
    // root, which results in all children (including canvas) to appear in front
    // of it, regardless of their z-index value.
    // see http://philipwalton.com/articles/what-no-one-told-you-about-z-index/
    element.style.position = 'absolute';
    element.style.zIndex = 0;

    return element;
  },
  onDeserialize: function (element, updateProperty) {
    var url = element.getAttribute('data-canonical-image-url');
    if (url) {
      updateProperty(element, 'screen-image', url);
    }
    // Properly position existing screens, so that canvases appear correctly.
    element.style.position = 'absolute';
    element.style.zIndex = 0;

    element.setAttribute('tabIndex', '1');
  }
};


},{"./ColorPickerPropertyRow.jsx":"/home/ubuntu/staging/apps/build/js/applab/designElements/ColorPickerPropertyRow.jsx","./EventHeaderRow.jsx":"/home/ubuntu/staging/apps/build/js/applab/designElements/EventHeaderRow.jsx","./EventRow.jsx":"/home/ubuntu/staging/apps/build/js/applab/designElements/EventRow.jsx","./ImagePickerPropertyRow.jsx":"/home/ubuntu/staging/apps/build/js/applab/designElements/ImagePickerPropertyRow.jsx","./PropertyRow.jsx":"/home/ubuntu/staging/apps/build/js/applab/designElements/PropertyRow.jsx","./elementUtils":"/home/ubuntu/staging/apps/build/js/applab/designElements/elementUtils.js"}],"/home/ubuntu/staging/apps/build/js/applab/designElements/radioButton.jsx":[function(require,module,exports){
/* global $ */

var PropertyRow = require('./PropertyRow.jsx');
var BooleanPropertyRow = require('./BooleanPropertyRow.jsx');
var ColorPickerPropertyRow = require('./ColorPickerPropertyRow.jsx');
var ZOrderRow = require('./ZOrderRow.jsx');
var EventHeaderRow = require('./EventHeaderRow.jsx');
var EventRow = require('./EventRow.jsx');

var elementUtils = require('./elementUtils');

var RadioButtonProperties = React.createClass({displayName: "RadioButtonProperties",
  propTypes: {
    element: React.PropTypes.instanceOf(HTMLElement).isRequired,
    handleChange: React.PropTypes.func.isRequired,
    onDepthChange: React.PropTypes.func.isRequired
  },

  render: function () {
    var element = this.props.element;

    return (
      React.createElement("div", {id: "propertyRowContainer"}, 
        React.createElement(PropertyRow, {
          desc: 'id', 
          initialValue: elementUtils.getId(element), 
          handleChange: this.props.handleChange.bind(this, 'id'), 
          isIdRow: true}), 
        React.createElement(PropertyRow, {
          desc: 'group id', 
          initialValue: element.getAttribute('name') || '', 
          handleChange: this.props.handleChange.bind(this, 'groupId')}), 
        React.createElement(PropertyRow, {
          desc: 'width (px)', 
          isNumber: true, 
          initialValue: parseInt(element.style.width, 10), 
          handleChange: this.props.handleChange.bind(this, 'style-width')}), 
        React.createElement(PropertyRow, {
          desc: 'height (px)', 
          isNumber: true, 
          initialValue: parseInt(element.style.height, 10), 
          handleChange: this.props.handleChange.bind(this, 'style-height')}), 
        React.createElement(PropertyRow, {
          desc: 'x position (px)', 
          isNumber: true, 
          initialValue: parseInt(element.style.left, 10), 
          handleChange: this.props.handleChange.bind(this, 'left')}), 
        React.createElement(PropertyRow, {
          desc: 'y position (px)', 
          isNumber: true, 
          initialValue: parseInt(element.style.top, 10), 
          handleChange: this.props.handleChange.bind(this, 'top')}), 
        React.createElement(BooleanPropertyRow, {
          desc: 'hidden', 
          initialValue: $(element).hasClass('design-mode-hidden'), 
          handleChange: this.props.handleChange.bind(this, 'hidden')}), 
        React.createElement(BooleanPropertyRow, {
          desc: 'checked', 
          initialValue: element.checked, 
          handleChange: this.props.handleChange.bind(this, 'checked')}), 
        React.createElement(ZOrderRow, {
          element: this.props.element, 
          onDepthChange: this.props.onDepthChange})
      ));

    // TODO:
    // enabled (p2)
  }
});

var RadioButtonEvents = React.createClass({displayName: "RadioButtonEvents",
  propTypes: {
    element: React.PropTypes.instanceOf(HTMLElement).isRequired,
    handleChange: React.PropTypes.func.isRequired,
    onInsertEvent: React.PropTypes.func.isRequired
  },

  getChangeEventCode: function() {
    var id = elementUtils.getId(this.props.element);
    var code =
      'onEvent("' + id + '", "change", function(event) {\n' +
      '  console.log("' + id + ' checked? " + getChecked("' + id + '"));\n' +
      '});\n';
    return code;
  },

  insertChange: function() {
    this.props.onInsertEvent(this.getChangeEventCode());
  },

  render: function () {
    var element = this.props.element;
    var changeName = 'Change';
    var changeDesc = 'Triggered when the radio button state changes ' +
        'both from selected to de-selected, and from de-selected to selected.';

    return (
      React.createElement("div", {id: "eventRowContainer"}, 
        React.createElement(PropertyRow, {
          desc: 'id', 
          initialValue: elementUtils.getId(element), 
          handleChange: this.props.handleChange.bind(this, 'id'), 
          isIdRow: true}), 
        React.createElement(EventHeaderRow, null), 
        React.createElement(EventRow, {
          name: changeName, 
          desc: changeDesc, 
          handleInsert: this.insertChange})
      )
    );
  }
});

module.exports = {
  PropertyTab: RadioButtonProperties,
  EventTab: RadioButtonEvents,

  create: function() {
    var element = document.createElement('input');
    element.type = 'radio';
    element.style.width = '12px';
    element.style.height = '12px';
    element.style.margin = '0px';

    this.onDeserialize(element);

    return element;
  },

  onDeserialize: function (element) {
    // Disable click events unless running
    $(element).on('click', function(e) {
      if (!Applab.isRunning()) {
        element.checked = !element.checked;
      }
    });
  }
};


},{"./BooleanPropertyRow.jsx":"/home/ubuntu/staging/apps/build/js/applab/designElements/BooleanPropertyRow.jsx","./ColorPickerPropertyRow.jsx":"/home/ubuntu/staging/apps/build/js/applab/designElements/ColorPickerPropertyRow.jsx","./EventHeaderRow.jsx":"/home/ubuntu/staging/apps/build/js/applab/designElements/EventHeaderRow.jsx","./EventRow.jsx":"/home/ubuntu/staging/apps/build/js/applab/designElements/EventRow.jsx","./PropertyRow.jsx":"/home/ubuntu/staging/apps/build/js/applab/designElements/PropertyRow.jsx","./ZOrderRow.jsx":"/home/ubuntu/staging/apps/build/js/applab/designElements/ZOrderRow.jsx","./elementUtils":"/home/ubuntu/staging/apps/build/js/applab/designElements/elementUtils.js"}],"/home/ubuntu/staging/apps/build/js/applab/designElements/label.jsx":[function(require,module,exports){
/* global $ */

var PropertyRow = require('./PropertyRow.jsx');
var BooleanPropertyRow = require('./BooleanPropertyRow.jsx');
var ColorPickerPropertyRow = require('./ColorPickerPropertyRow.jsx');
var ZOrderRow = require('./ZOrderRow.jsx');
var EventHeaderRow = require('./EventHeaderRow.jsx');
var EventRow = require('./EventRow.jsx');

var elementUtils = require('./elementUtils');

var LabelProperties = React.createClass({displayName: "LabelProperties",
  propTypes: {
    element: React.PropTypes.instanceOf(HTMLElement).isRequired,
    handleChange: React.PropTypes.func.isRequired,
    onDepthChange: React.PropTypes.func.isRequired
  },

  render: function () {
    var element = this.props.element;

    return (
      React.createElement("div", {id: "propertyRowContainer"}, 
        React.createElement(PropertyRow, {
          desc: 'id', 
          initialValue: elementUtils.getId(element), 
          handleChange: this.props.handleChange.bind(this, 'id'), 
          isIdRow: true}), 
        React.createElement(PropertyRow, {
          desc: 'text', 
          initialValue: $(element).text(), 
          handleChange: this.props.handleChange.bind(this, 'text')}), 
        React.createElement(PropertyRow, {
          desc: 'width (px)', 
          isNumber: true, 
          lockState: $(element).data('lock-width') || PropertyRow.LockState.UNLOCKED, 
          handleLockChange: this.props.handleChange.bind(this, 'lock-width'), 
          initialValue: parseInt(element.style.width, 10), 
          handleChange: this.props.handleChange.bind(this, 'style-width')}), 
        React.createElement(PropertyRow, {
          desc: 'height (px)', 
          isNumber: true, 
          lockState: $(element).data('lock-height') || PropertyRow.LockState.UNLOCKED, 
          handleLockChange: this.props.handleChange.bind(this, 'lock-height'), 
          initialValue: parseInt(element.style.height, 10), 
          handleChange: this.props.handleChange.bind(this, 'style-height')}), 
        React.createElement(PropertyRow, {
          desc: 'x position (px)', 
          isNumber: true, 
          initialValue: parseInt(element.style.left, 10), 
          handleChange: this.props.handleChange.bind(this, 'left')}), 
        React.createElement(PropertyRow, {
          desc: 'y position (px)', 
          isNumber: true, 
          initialValue: parseInt(element.style.top, 10), 
          handleChange: this.props.handleChange.bind(this, 'top')}), 
        React.createElement(ColorPickerPropertyRow, {
          desc: 'text color', 
          initialValue: elementUtils.rgb2hex(element.style.color), 
          handleChange: this.props.handleChange.bind(this, 'textColor')}), 
        React.createElement(ColorPickerPropertyRow, {
          desc: 'background color', 
          initialValue: elementUtils.rgb2hex(element.style.backgroundColor), 
          handleChange: this.props.handleChange.bind(this, 'backgroundColor')}), 
        React.createElement(PropertyRow, {
          desc: 'font size (px)', 
          isNumber: true, 
          initialValue: parseInt(element.style.fontSize, 10), 
          handleChange: this.props.handleChange.bind(this, 'fontSize')}), 
        React.createElement(BooleanPropertyRow, {
          desc: 'hidden', 
          initialValue: $(element).hasClass('design-mode-hidden'), 
          handleChange: this.props.handleChange.bind(this, 'hidden')}), 
        React.createElement(ZOrderRow, {
          element: this.props.element, 
          onDepthChange: this.props.onDepthChange})
      ));

    // TODO:
    // bold/italics/underline (p2)
    // textAlignment (p2)
    // enabled (p2)
  }
});

var LabelEvents = React.createClass({displayName: "LabelEvents",
  propTypes: {
    element: React.PropTypes.instanceOf(HTMLElement).isRequired,
    handleChange: React.PropTypes.func.isRequired,
    onInsertEvent: React.PropTypes.func.isRequired
  },

  getClickEventCode: function() {
    var id = elementUtils.getId(this.props.element);
    var code =
      'onEvent("' + id + '", "click", function(event) {\n' +
      '  console.log("' + id + ' clicked!");\n' +
      '});\n';
    return code;
  },

  insertClick: function() {
    this.props.onInsertEvent(this.getClickEventCode());
  },

  render: function () {
    var element = this.props.element;
    var clickName = 'Click';
    var clickDesc = 'Triggered when the label is clicked with a mouse or tapped on a screen.';

    return (
      React.createElement("div", {id: "eventRowContainer"}, 
        React.createElement(PropertyRow, {
          desc: 'id', 
          initialValue: elementUtils.getId(element), 
          handleChange: this.props.handleChange.bind(this, 'id'), 
          isIdRow: true}), 
        React.createElement(EventHeaderRow, null), 
        React.createElement(EventRow, {
          name: clickName, 
          desc: clickDesc, 
          handleInsert: this.insertClick})
      )
    );
  }
});

module.exports = {
  PropertyTab: LabelProperties,
  EventTab: LabelEvents,

  create: function () {
    var element = document.createElement('label');
    element.style.margin = '0px';
    element.style.padding = '2px';
    element.style.lineHeight = '1';
    element.style.fontSize = '14px';
    element.style.overflow = 'hidden';
    element.style.wordWrap = 'break-word';
    element.textContent = 'text';
    element.style.color = '#333333';
    element.style.backgroundColor = '';
    element.style.maxWidth = Applab.appWidth + 'px';

    this.resizeToFitText(element);
    return element;
  },

  resizeToFitText: function (element) {
    var clone = $(element).clone().css({
      position: 'absolute',
      visibility: 'hidden',
      width: 'auto',
      height: 'auto',
      maxWidth: (Applab.appWidth - parseInt(element.style.left, 10)) + 'px',
    }).appendTo($(document.body));

    var padding = parseInt(element.style.padding, 10);

    if ($(element).data('lock-width') !== PropertyRow.LockState.LOCKED) {
      //Truncate the width before it runs off the edge of the screen
      element.style.width = Math.min(clone.width() + 1 + 2 * padding, Applab.appWidth - clone.position().left) + 'px';
    }
    if ($(element).data('lock-height') !== PropertyRow.LockState.LOCKED) {
      element.style.height = clone.height() + 1 + 2 * padding + 'px';
    }

    clone.remove();
  },

  /**
   * @returns {boolean} True if it modified the backing element
   */
  onPropertyChange: function (element, name, value) {
    switch (name) {
      case 'text':
      case 'fontSize':
        this.resizeToFitText(element);
        break;
      case 'lock-width':
        $(element).data('lock-width', value);
        break;
      case 'lock-height':
        $(element).data('lock-height', value);
        break;
      default:
        return false;
    }
    return true;
  }
};


},{"./BooleanPropertyRow.jsx":"/home/ubuntu/staging/apps/build/js/applab/designElements/BooleanPropertyRow.jsx","./ColorPickerPropertyRow.jsx":"/home/ubuntu/staging/apps/build/js/applab/designElements/ColorPickerPropertyRow.jsx","./EventHeaderRow.jsx":"/home/ubuntu/staging/apps/build/js/applab/designElements/EventHeaderRow.jsx","./EventRow.jsx":"/home/ubuntu/staging/apps/build/js/applab/designElements/EventRow.jsx","./PropertyRow.jsx":"/home/ubuntu/staging/apps/build/js/applab/designElements/PropertyRow.jsx","./ZOrderRow.jsx":"/home/ubuntu/staging/apps/build/js/applab/designElements/ZOrderRow.jsx","./elementUtils":"/home/ubuntu/staging/apps/build/js/applab/designElements/elementUtils.js"}],"/home/ubuntu/staging/apps/build/js/applab/designElements/image.jsx":[function(require,module,exports){
/* global $ */


var PropertyRow = require('./PropertyRow.jsx');
var BooleanPropertyRow = require('./BooleanPropertyRow.jsx');
var ImagePickerPropertyRow = require('./ImagePickerPropertyRow.jsx');
var ZOrderRow = require('./ZOrderRow.jsx');
var EventHeaderRow = require('./EventHeaderRow.jsx');
var EventRow = require('./EventRow.jsx');

var elementUtils = require('./elementUtils');

var ImageProperties = React.createClass({displayName: "ImageProperties",
  propTypes: {
    element: React.PropTypes.instanceOf(HTMLElement).isRequired,
    handleChange: React.PropTypes.func.isRequired,
    onDepthChange: React.PropTypes.func.isRequired
  },

  render: function () {
    var element = this.props.element;

    return (
      React.createElement("div", {id: "propertyRowContainer"}, 
        React.createElement(PropertyRow, {
          desc: 'id', 
          initialValue: elementUtils.getId(element), 
          handleChange: this.props.handleChange.bind(this, 'id'), 
          isIdRow: true}), 
        React.createElement(PropertyRow, {
          desc: 'text', 
          initialValue: $(element).text(), 
          handleChange: this.props.handleChange.bind(this, 'text')}), 
        React.createElement(PropertyRow, {
          desc: 'width (px)', 
          isNumber: true, 
          initialValue: parseInt(element.style.width, 10), 
          handleChange: this.props.handleChange.bind(this, 'style-width')}), 
        React.createElement(PropertyRow, {
          desc: 'height (px)', 
          isNumber: true, 
          initialValue: parseInt(element.style.height, 10), 
          handleChange: this.props.handleChange.bind(this, 'style-height')}), 
        React.createElement(PropertyRow, {
          desc: 'x position (px)', 
          isNumber: true, 
          initialValue: parseInt(element.style.left, 10), 
          handleChange: this.props.handleChange.bind(this, 'left')}), 
        React.createElement(PropertyRow, {
          desc: 'y position (px)', 
          isNumber: true, 
          initialValue: parseInt(element.style.top, 10), 
          handleChange: this.props.handleChange.bind(this, 'top')}), 
        React.createElement(ImagePickerPropertyRow, {
          desc: 'picture', 
          initialValue: element.getAttribute('data-canonical-image-url') || '', 
          handleChange: this.props.handleChange.bind(this, 'picture')}), 
        React.createElement(BooleanPropertyRow, {
          desc: 'hidden', 
          initialValue: $(element).hasClass('design-mode-hidden'), 
          handleChange: this.props.handleChange.bind(this, 'hidden')}), 
        React.createElement(ZOrderRow, {
          element: this.props.element, 
          onDepthChange: this.props.onDepthChange})
      ));

    // TODO (brent):
    // bold/italics/underline (p2)
    // shape (p2)
    // textAlignment (p2)
    // enabled (p2)
  }
});

var ImageEvents = React.createClass({displayName: "ImageEvents",
  propTypes: {
    element: React.PropTypes.instanceOf(HTMLElement).isRequired,
    handleChange: React.PropTypes.func.isRequired,
    onInsertEvent: React.PropTypes.func.isRequired
  },

  getClickEventCode: function() {
    var id = elementUtils.getId(this.props.element);
    var code =
      'onEvent("' + id + '", "click", function(event) {\n' +
      '  console.log("' + id + ' clicked!");\n' +
      '});\n';
    return code;
  },

  insertClick: function() {
    this.props.onInsertEvent(this.getClickEventCode());
  },

  render: function () {
    var element = this.props.element;
    var clickName = 'Click';
    var clickDesc = 'Triggered when the image is clicked with a mouse or tapped on a screen.';

    return (
      React.createElement("div", {id: "eventRowContainer"}, 
        React.createElement(PropertyRow, {
          desc: 'id', 
          initialValue: elementUtils.getId(element), 
          handleChange: this.props.handleChange.bind(this, 'id'), 
          isIdRow: true}), 
        React.createElement(EventHeaderRow, null), 
        React.createElement(EventRow, {
          name: clickName, 
          desc: clickDesc, 
          handleInsert: this.insertClick})
      )
    );
  }
});


module.exports = {
  PropertyTab: ImageProperties,
  EventTab: ImageEvents,

  create: function () {
    var element = document.createElement('img');
    element.style.height = '100px';
    element.style.width = '100px';
    element.setAttribute('src', '');

    return element;
  },
  onDeserialize: function (element, updateProperty) {
    var url = element.getAttribute('data-canonical-image-url');
    if (url) {
      updateProperty(element, 'picture', url);
    }
  }
};


},{"./BooleanPropertyRow.jsx":"/home/ubuntu/staging/apps/build/js/applab/designElements/BooleanPropertyRow.jsx","./EventHeaderRow.jsx":"/home/ubuntu/staging/apps/build/js/applab/designElements/EventHeaderRow.jsx","./EventRow.jsx":"/home/ubuntu/staging/apps/build/js/applab/designElements/EventRow.jsx","./ImagePickerPropertyRow.jsx":"/home/ubuntu/staging/apps/build/js/applab/designElements/ImagePickerPropertyRow.jsx","./PropertyRow.jsx":"/home/ubuntu/staging/apps/build/js/applab/designElements/PropertyRow.jsx","./ZOrderRow.jsx":"/home/ubuntu/staging/apps/build/js/applab/designElements/ZOrderRow.jsx","./elementUtils":"/home/ubuntu/staging/apps/build/js/applab/designElements/elementUtils.js"}],"/home/ubuntu/staging/apps/build/js/applab/designElements/dropdown.jsx":[function(require,module,exports){
/* global $ */

var PropertyRow = require('./PropertyRow.jsx');
var BooleanPropertyRow = require('./BooleanPropertyRow.jsx');
var OptionsSelectRow = require('./OptionsSelectRow.jsx');
var ColorPickerPropertyRow = require('./ColorPickerPropertyRow.jsx');
var ZOrderRow = require('./ZOrderRow.jsx');
var EventHeaderRow = require('./EventHeaderRow.jsx');
var EventRow = require('./EventRow.jsx');

var elementUtils = require('./elementUtils');

var DropdownProperties = React.createClass({displayName: "DropdownProperties",
  propTypes: {
    element: React.PropTypes.instanceOf(HTMLElement).isRequired,
    handleChange: React.PropTypes.func.isRequired,
    onDepthChange: React.PropTypes.func.isRequired
  },

  render: function () {
    var element = this.props.element;

    return (
      React.createElement("div", {id: "propertyRowContainer"}, 
        React.createElement(PropertyRow, {
          desc: 'id', 
          initialValue: elementUtils.getId(element), 
          handleChange: this.props.handleChange.bind(this, 'id'), 
          isIdRow: true}), 
        React.createElement(OptionsSelectRow, {
          desc: 'options', 
          element: element, 
          handleChange: this.props.handleChange.bind(this, 'options')}), 
        React.createElement(PropertyRow, {
          desc: 'width (px)', 
          isNumber: true, 
          initialValue: parseInt(element.style.width, 10), 
          handleChange: this.props.handleChange.bind(this, 'style-width')}), 
        React.createElement(PropertyRow, {
          desc: 'height (px)', 
          isNumber: true, 
          initialValue: parseInt(element.style.height, 10), 
          handleChange: this.props.handleChange.bind(this, 'style-height')}), 
        React.createElement(PropertyRow, {
          desc: 'x position (px)', 
          isNumber: true, 
          initialValue: parseInt(element.style.left, 10), 
          handleChange: this.props.handleChange.bind(this, 'left')}), 
        React.createElement(PropertyRow, {
          desc: 'y position (px)', 
          isNumber: true, 
          initialValue: parseInt(element.style.top, 10), 
          handleChange: this.props.handleChange.bind(this, 'top')}), 
        React.createElement(ColorPickerPropertyRow, {
          desc: 'text color', 
          initialValue: elementUtils.rgb2hex(element.style.color), 
          handleChange: this.props.handleChange.bind(this, 'textColor')}), 
        React.createElement(ColorPickerPropertyRow, {
          desc: 'background color', 
          initialValue: elementUtils.rgb2hex(element.style.backgroundColor), 
          handleChange: this.props.handleChange.bind(this, 'backgroundColor')}), 
        React.createElement(PropertyRow, {
          desc: 'font size (px)', 
          isNumber: true, 
          initialValue: parseInt(element.style.fontSize, 10), 
          handleChange: this.props.handleChange.bind(this, 'fontSize')}), 
        React.createElement(BooleanPropertyRow, {
          desc: 'hidden', 
          initialValue: $(element).hasClass('design-mode-hidden'), 
          handleChange: this.props.handleChange.bind(this, 'hidden')}), 
        React.createElement(ZOrderRow, {
          element: this.props.element, 
          onDepthChange: this.props.onDepthChange})
      ));

    // TODO:
    // bold/italics/underline (p2)
    // textAlignment (p2)
    // enabled (p2)
  }
});

var DropdownEvents = React.createClass({displayName: "DropdownEvents",
  propTypes: {
    element: React.PropTypes.instanceOf(HTMLElement).isRequired,
    handleChange: React.PropTypes.func.isRequired,
    onInsertEvent: React.PropTypes.func.isRequired
  },

  getChangeEventCode: function() {
    var id = elementUtils.getId(this.props.element);
    var code =
      'onEvent("' + id + '", "change", function(event) {\n' +
      '  console.log("Selected option: " + getText("' + id + '"));\n' +
      '});\n';
    return code;
  },

  insertChange: function() {
    this.props.onInsertEvent(this.getChangeEventCode());
  },

  render: function () {
    var element = this.props.element;
    var changeName = 'Change';
    var changeDesc = 'Triggered every time an option is selected from the dropdown.';

    return (
      React.createElement("div", {id: "eventRowContainer"}, 
        React.createElement(PropertyRow, {
          desc: 'id', 
          initialValue: elementUtils.getId(element), 
          handleChange: this.props.handleChange.bind(this, 'id'), 
          isIdRow: true}), 
        React.createElement(EventHeaderRow, null), 
        React.createElement(EventRow, {
          name: changeName, 
          desc: changeDesc, 
          handleInsert: this.insertChange})
      )
    );
  }
});

module.exports = {
  PropertyTab: DropdownProperties,
  EventTab: DropdownEvents,

  create: function() {
    var element = document.createElement('select');
    element.style.width = '200px';
    element.style.height = '30px';
    element.style.fontSize = '14px';
    element.style.margin = '0';
    element.style.color = '#fff';
    element.style.backgroundColor = '#1abc9c';

    var option1 = document.createElement('option');
    option1.innerHTML = 'Option 1';
    element.appendChild(option1);

    var option2 = document.createElement('option');
    option2.innerHTML = 'Option 2';
    element.appendChild(option2);

    return element;
  }
};


},{"./BooleanPropertyRow.jsx":"/home/ubuntu/staging/apps/build/js/applab/designElements/BooleanPropertyRow.jsx","./ColorPickerPropertyRow.jsx":"/home/ubuntu/staging/apps/build/js/applab/designElements/ColorPickerPropertyRow.jsx","./EventHeaderRow.jsx":"/home/ubuntu/staging/apps/build/js/applab/designElements/EventHeaderRow.jsx","./EventRow.jsx":"/home/ubuntu/staging/apps/build/js/applab/designElements/EventRow.jsx","./OptionsSelectRow.jsx":"/home/ubuntu/staging/apps/build/js/applab/designElements/OptionsSelectRow.jsx","./PropertyRow.jsx":"/home/ubuntu/staging/apps/build/js/applab/designElements/PropertyRow.jsx","./ZOrderRow.jsx":"/home/ubuntu/staging/apps/build/js/applab/designElements/ZOrderRow.jsx","./elementUtils":"/home/ubuntu/staging/apps/build/js/applab/designElements/elementUtils.js"}],"/home/ubuntu/staging/apps/build/js/applab/designElements/OptionsSelectRow.jsx":[function(require,module,exports){
/* global $ */
var rowStyle = require('./rowStyle');

var OptionsSelectRow = React.createClass({displayName: "OptionsSelectRow",
  propTypes: {
    element: React.PropTypes.instanceOf(HTMLSelectElement).isRequired,
    handleChange: React.PropTypes.func
  },

  getInitialState: function () {
    // Pull the text out of each of our child option elements
    var element = this.props.element;
    var value = '';
    for (var i = 0; i < element.children.length; i++) {
      value += element.children[i].textContent + '\n';
    }
    return {
      value: value
    };
  },

  handleChangeInternal: function(event) {
    var value = event.target.value;
    // Extract an array of text values, 1 per line
    var optionList = value.split('\n').filter(function (val) {
      return val !== '';
    });
    this.props.handleChange(optionList);
    this.setState({value: value});
  },

  render: function() {
    var textAreaStyle = $.extend({}, rowStyle.input, {
      height: 40
    });
    return (
      React.createElement("div", {style: rowStyle.container}, 
        React.createElement("div", {style: rowStyle.description}, this.props.desc), 
        React.createElement("div", null, 
          React.createElement("textarea", {
            onChange: this.handleChangeInternal, 
            value: this.state.value, 
            style: textAreaStyle})
        )
      )
    );
  }
});

module.exports = OptionsSelectRow;


},{"./rowStyle":"/home/ubuntu/staging/apps/build/js/applab/designElements/rowStyle.js"}],"/home/ubuntu/staging/apps/build/js/applab/designElements/checkbox.jsx":[function(require,module,exports){
/* global $ */

var PropertyRow = require('./PropertyRow.jsx');
var BooleanPropertyRow = require('./BooleanPropertyRow.jsx');
var ColorPickerPropertyRow = require('./ColorPickerPropertyRow.jsx');
var ZOrderRow = require('./ZOrderRow.jsx');
var EventHeaderRow = require('./EventHeaderRow.jsx');
var EventRow = require('./EventRow.jsx');

var elementUtils = require('./elementUtils');

var CheckboxProperties = React.createClass({displayName: "CheckboxProperties",
  propTypes: {
    element: React.PropTypes.instanceOf(HTMLElement).isRequired,
    handleChange: React.PropTypes.func.isRequired,
    onDepthChange: React.PropTypes.func.isRequired
  },

  render: function () {
    var element = this.props.element;

    return (
      React.createElement("div", {id: "propertyRowContainer"}, 
        React.createElement(PropertyRow, {
          desc: 'id', 
          initialValue: elementUtils.getId(element), 
          handleChange: this.props.handleChange.bind(this, 'id'), 
          isIdRow: true}), 
        React.createElement(PropertyRow, {
          desc: 'width (px)', 
          isNumber: true, 
          initialValue: parseInt(element.style.width, 10), 
          handleChange: this.props.handleChange.bind(this, 'style-width')}), 
        React.createElement(PropertyRow, {
          desc: 'height (px)', 
          isNumber: true, 
          initialValue: parseInt(element.style.height, 10), 
          handleChange: this.props.handleChange.bind(this, 'style-height')}), 
        React.createElement(PropertyRow, {
          desc: 'x position (px)', 
          isNumber: true, 
          initialValue: parseInt(element.style.left, 10), 
          handleChange: this.props.handleChange.bind(this, 'left')}), 
        React.createElement(PropertyRow, {
          desc: 'y position (px)', 
          isNumber: true, 
          initialValue: parseInt(element.style.top, 10), 
          handleChange: this.props.handleChange.bind(this, 'top')}), 
        React.createElement(BooleanPropertyRow, {
          desc: 'hidden', 
          initialValue: $(element).hasClass('design-mode-hidden'), 
          handleChange: this.props.handleChange.bind(this, 'hidden')}), 
        React.createElement(BooleanPropertyRow, {
          desc: 'checked', 
          initialValue: element.checked, 
          handleChange: this.props.handleChange.bind(this, 'checked')}), 
        React.createElement(ZOrderRow, {
          element: this.props.element, 
          onDepthChange: this.props.onDepthChange})
      ));

    // TODO:
    // enabled (p2)
  }
});

var CheckboxEvents = React.createClass({displayName: "CheckboxEvents",
  propTypes: {
    element: React.PropTypes.instanceOf(HTMLElement).isRequired,
    handleChange: React.PropTypes.func.isRequired,
    onInsertEvent: React.PropTypes.func.isRequired
  },

  getChangeEventCode: function() {
    var id = elementUtils.getId(this.props.element);
    var code =
      'onEvent("' + id + '", "change", function(event) {\n' +
      '  console.log("' + id + ' checked? " + getChecked("' + id + '"));\n' +
      '});\n';
    return code;
  },

  insertChange: function() {
    this.props.onInsertEvent(this.getChangeEventCode());
  },

  render: function () {
    var element = this.props.element;
    var changeName = 'Change';
    var changeDesc = 'Triggered when the checkbox state changes both ' +
        'from checked to unchecked and unchecked to checked.';

    return (
      React.createElement("div", {id: "eventRowContainer"}, 
        React.createElement(PropertyRow, {
          desc: 'id', 
          initialValue: elementUtils.getId(element), 
          handleChange: this.props.handleChange.bind(this, 'id'), 
          isIdRow: true}), 
        React.createElement(EventHeaderRow, null), 
        React.createElement(EventRow, {
          name: changeName, 
          desc: changeDesc, 
          handleInsert: this.insertChange})
      )
    );
  }
});


module.exports = {
  PropertyTab: CheckboxProperties,
  EventTab: CheckboxEvents,

  create: function() {
    var element = document.createElement('input');
    element.type = 'checkbox';
    element.style.width = '12px';
    element.style.height = '12px';
    element.style.margin = '0px';

    this.onDeserialize(element);

    return element;
  },

  onDeserialize: function (element) {
    // Disable click events unless running
    $(element).on('click', function(e) {
      if (!Applab.isRunning()) {
        element.checked = !element.checked;
      }
    });
  }
};


},{"./BooleanPropertyRow.jsx":"/home/ubuntu/staging/apps/build/js/applab/designElements/BooleanPropertyRow.jsx","./ColorPickerPropertyRow.jsx":"/home/ubuntu/staging/apps/build/js/applab/designElements/ColorPickerPropertyRow.jsx","./EventHeaderRow.jsx":"/home/ubuntu/staging/apps/build/js/applab/designElements/EventHeaderRow.jsx","./EventRow.jsx":"/home/ubuntu/staging/apps/build/js/applab/designElements/EventRow.jsx","./PropertyRow.jsx":"/home/ubuntu/staging/apps/build/js/applab/designElements/PropertyRow.jsx","./ZOrderRow.jsx":"/home/ubuntu/staging/apps/build/js/applab/designElements/ZOrderRow.jsx","./elementUtils":"/home/ubuntu/staging/apps/build/js/applab/designElements/elementUtils.js"}],"/home/ubuntu/staging/apps/build/js/applab/designElements/chart.jsx":[function(require,module,exports){
/* global $ */

var PropertyRow = require('./PropertyRow.jsx');
var BooleanPropertyRow = require('./BooleanPropertyRow.jsx');
var ImagePickerPropertyRow = require('./ImagePickerPropertyRow.jsx');
var ZOrderRow = require('./ZOrderRow.jsx');
var EventHeaderRow = require('./EventHeaderRow.jsx');
var EventRow = require('./EventRow.jsx');

var elementUtils = require('./elementUtils');

var ChartProperties = React.createClass({displayName: "ChartProperties",
  propTypes: {
    element: React.PropTypes.instanceOf(HTMLElement).isRequired,
    handleChange: React.PropTypes.func.isRequired,
    onDepthChange: React.PropTypes.func.isRequired
  },

  render: function () {
    var element = this.props.element;

    return (
      React.createElement("div", {id: "propertyRowContainer"}, 
        React.createElement(PropertyRow, {
          desc: 'id', 
          initialValue: elementUtils.getId(element), 
          handleChange: this.props.handleChange.bind(this, 'id'), 
          isIdRow: true}), 
        React.createElement(PropertyRow, {
          desc: 'width (px)', 
          isNumber: true, 
          initialValue: parseInt(element.style.width, 10), 
          handleChange: this.props.handleChange.bind(this, 'style-width')}), 
        React.createElement(PropertyRow, {
          desc: 'height (px)', 
          isNumber: true, 
          initialValue: parseInt(element.style.height, 10), 
          handleChange: this.props.handleChange.bind(this, 'style-height')}), 
        React.createElement(PropertyRow, {
          desc: 'x position (px)', 
          isNumber: true, 
          initialValue: parseInt(element.style.left, 10), 
          handleChange: this.props.handleChange.bind(this, 'left')}), 
        React.createElement(PropertyRow, {
          desc: 'y position (px)', 
          isNumber: true, 
          initialValue: parseInt(element.style.top, 10), 
          handleChange: this.props.handleChange.bind(this, 'top')}), 
        React.createElement(BooleanPropertyRow, {
          desc: 'hidden', 
          initialValue: $(element).hasClass('design-mode-hidden'), 
          handleChange: this.props.handleChange.bind(this, 'hidden')}), 
        React.createElement(ZOrderRow, {
          element: this.props.element, 
          onDepthChange: this.props.onDepthChange})
      ));

    // TODO (bbuchanan):
    // chart-specific properties!
  }
});

var ChartEvents = React.createClass({displayName: "ChartEvents",
  propTypes: {
    element: React.PropTypes.instanceOf(HTMLElement).isRequired,
    handleChange: React.PropTypes.func.isRequired,
    onInsertEvent: React.PropTypes.func.isRequired
  },

  getDrawChartFromRecordsCode: function() {
    var id = elementUtils.getId(this.props.element);
    var code =
      'drawChartFromRecords("' + id + '", "bar", "tableName", ' +
      '["columnOne", "columnTwo"]);\n';
    return code;
  },

  insertDrawChartFromRecords: function() {
    this.props.onInsertEvent(this.getDrawChartFromRecordsCode());
  },

  render: function () {
    var element = this.props.element;
    var drawChartFromRecordsName = 'drawChartFromRecords';
    var drawChartFromRecordsDesc =
        "Draws the chart using App Lab's table data storage.";

    return (
      React.createElement("div", {id: "eventRowContainer"}, 
        React.createElement(PropertyRow, {
          desc: 'id', 
          initialValue: elementUtils.getId(element), 
          handleChange: this.props.handleChange.bind(this, 'id'), 
          isIdRow: true}), 
        React.createElement(EventHeaderRow, null), 
        React.createElement(EventRow, {
          name: drawChartFromRecordsName, 
          desc: drawChartFromRecordsDesc, 
          handleInsert: this.insertDrawChartFromRecords})
      )
    );
  }
});


module.exports = {
  PropertyTab: ChartProperties,
  EventTab: ChartEvents,

  create: function () {
    var element = document.createElement('div');
    element.setAttribute('class', 'chart');
    element.style.height = '100px';
    element.style.width = '100px';

    return element;

    // Note: we use CSS to make this element have a background in design mode
    // but not in code mode.
  }
};


},{"./BooleanPropertyRow.jsx":"/home/ubuntu/staging/apps/build/js/applab/designElements/BooleanPropertyRow.jsx","./EventHeaderRow.jsx":"/home/ubuntu/staging/apps/build/js/applab/designElements/EventHeaderRow.jsx","./EventRow.jsx":"/home/ubuntu/staging/apps/build/js/applab/designElements/EventRow.jsx","./ImagePickerPropertyRow.jsx":"/home/ubuntu/staging/apps/build/js/applab/designElements/ImagePickerPropertyRow.jsx","./PropertyRow.jsx":"/home/ubuntu/staging/apps/build/js/applab/designElements/PropertyRow.jsx","./ZOrderRow.jsx":"/home/ubuntu/staging/apps/build/js/applab/designElements/ZOrderRow.jsx","./elementUtils":"/home/ubuntu/staging/apps/build/js/applab/designElements/elementUtils.js"}],"/home/ubuntu/staging/apps/build/js/applab/designElements/canvas.jsx":[function(require,module,exports){

var PropertyRow = require('./PropertyRow.jsx');
var ZOrderRow = require('./ZOrderRow.jsx');
var EventHeaderRow = require('./EventHeaderRow.jsx');
var EventRow = require('./EventRow.jsx');

var elementUtils = require('./elementUtils');

var CanvasProperties = React.createClass({displayName: "CanvasProperties",
  propTypes: {
    element: React.PropTypes.instanceOf(HTMLElement).isRequired,
    handleChange: React.PropTypes.func.isRequired,
    onDepthChange: React.PropTypes.func.isRequired
  },

  render: function () {
    var element = this.props.element;

    return (
      React.createElement("div", {id: "propertyRowContainer"}, 
        React.createElement(PropertyRow, {
          desc: 'id', 
          initialValue: elementUtils.getId(element), 
          handleChange: this.props.handleChange.bind(this, 'id'), 
          isIdRow: true}), 
        React.createElement(PropertyRow, {
          desc: 'width (px)', 
          isNumber: true, 
          initialValue: parseInt(element.getAttribute('width'), 10), 
          handleChange: this.props.handleChange.bind(this, 'width')}), 
        React.createElement(PropertyRow, {
          desc: 'height (px)', 
          isNumber: true, 
          initialValue: parseInt(element.getAttribute('height'), 10), 
          handleChange: this.props.handleChange.bind(this, 'height')}), 
        React.createElement(PropertyRow, {
          desc: 'x position (px)', 
          isNumber: true, 
          initialValue: parseInt(element.style.left, 10), 
          handleChange: this.props.handleChange.bind(this, 'left')}), 
        React.createElement(PropertyRow, {
          desc: 'y position (px)', 
          isNumber: true, 
          initialValue: parseInt(element.style.top, 10), 
          handleChange: this.props.handleChange.bind(this, 'top')}), 
        React.createElement(ZOrderRow, {
          element: this.props.element, 
          onDepthChange: this.props.onDepthChange})
      ));
  }
});

var CanvasEvents = React.createClass({displayName: "CanvasEvents",
  propTypes: {
    element: React.PropTypes.instanceOf(HTMLElement).isRequired,
    handleChange: React.PropTypes.func.isRequired,
    onInsertEvent: React.PropTypes.func.isRequired
  },

  getClickEventCode: function() {
    var id = elementUtils.getId(this.props.element);
    var code =
      'onEvent("' + id + '", "click", function(event) {\n' +
      '  console.log("' + id + ' clicked at x:" + event.offsetX + " y:" + event.offsetY);\n' +
      '  setActiveCanvas("' + id + '");\n' +
      '  circle(event.offsetX, event.offsetY, 10);\n' +
      '});\n';
    return code;
  },

  insertClick: function() {
    this.props.onInsertEvent(this.getClickEventCode());
  },

  render: function () {
    var element = this.props.element;
    var clickName = 'Click';
    var clickDesc = 'Triggered when the canvas is clicked with a mouse or tapped on a screen.';

    return (
      React.createElement("div", {id: "eventRowContainer"}, 
        React.createElement(PropertyRow, {
          desc: 'id', 
          initialValue: elementUtils.getId(element), 
          handleChange: this.props.handleChange.bind(this, 'id'), 
          isIdRow: true}), 
        React.createElement(EventHeaderRow, null), 
        React.createElement(EventRow, {
          name: clickName, 
          desc: clickDesc, 
          handleInsert: this.insertClick})
      )
    );
  }
});


module.exports = {
  PropertyTab: CanvasProperties,
  EventTab: CanvasEvents,
  create: function () {
    var element = document.createElement('canvas');
    element.setAttribute('width', '100px');
    element.setAttribute('height', '100px');

    return element;

    // Note: we use CSS to make this element have a background in design mode
    // but not in code mode.
  }
};


},{"./EventHeaderRow.jsx":"/home/ubuntu/staging/apps/build/js/applab/designElements/EventHeaderRow.jsx","./EventRow.jsx":"/home/ubuntu/staging/apps/build/js/applab/designElements/EventRow.jsx","./PropertyRow.jsx":"/home/ubuntu/staging/apps/build/js/applab/designElements/PropertyRow.jsx","./ZOrderRow.jsx":"/home/ubuntu/staging/apps/build/js/applab/designElements/ZOrderRow.jsx","./elementUtils":"/home/ubuntu/staging/apps/build/js/applab/designElements/elementUtils.js"}],"/home/ubuntu/staging/apps/build/js/applab/designElements/button.jsx":[function(require,module,exports){
/* global $ */


var PropertyRow = require('./PropertyRow.jsx');
var BooleanPropertyRow = require('./BooleanPropertyRow.jsx');
var ColorPickerPropertyRow = require('./ColorPickerPropertyRow.jsx');
var ImagePickerPropertyRow = require('./ImagePickerPropertyRow.jsx');
var ZOrderRow = require('./ZOrderRow.jsx');
var EventHeaderRow = require('./EventHeaderRow.jsx');
var EventRow = require('./EventRow.jsx');

var elementUtils = require('./elementUtils');

var ButtonProperties = React.createClass({displayName: "ButtonProperties",
  propTypes: {
    element: React.PropTypes.instanceOf(HTMLElement).isRequired,
    handleChange: React.PropTypes.func.isRequired,
    onDepthChange: React.PropTypes.func.isRequired
  },

  render: function () {
    var element = this.props.element;

    return (
      React.createElement("div", {id: "propertyRowContainer"}, 
        React.createElement(PropertyRow, {
          desc: 'id', 
          initialValue: elementUtils.getId(element), 
          handleChange: this.props.handleChange.bind(this, 'id'), 
          isIdRow: true}), 
        React.createElement(PropertyRow, {
          desc: 'text', 
          initialValue: $(element).text(), 
          handleChange: this.props.handleChange.bind(this, 'text')}), 
        React.createElement(PropertyRow, {
          desc: 'width (px)', 
          isNumber: true, 
          initialValue: parseInt(element.style.width, 10), 
          handleChange: this.props.handleChange.bind(this, 'style-width')}), 
        React.createElement(PropertyRow, {
          desc: 'height (px)', 
          isNumber: true, 
          initialValue: parseInt(element.style.height, 10), 
          handleChange: this.props.handleChange.bind(this, 'style-height')}), 
        React.createElement(PropertyRow, {
          desc: 'x position (px)', 
          isNumber: true, 
          initialValue: parseInt(element.style.left, 10), 
          handleChange: this.props.handleChange.bind(this, 'left')}), 
        React.createElement(PropertyRow, {
          desc: 'y position (px)', 
          isNumber: true, 
          initialValue: parseInt(element.style.top, 10), 
          handleChange: this.props.handleChange.bind(this, 'top')}), 
        React.createElement(ColorPickerPropertyRow, {
          desc: 'text color', 
          initialValue: elementUtils.rgb2hex(element.style.color), 
          handleChange: this.props.handleChange.bind(this, 'textColor')}), 
        React.createElement(ColorPickerPropertyRow, {
          desc: 'background color', 
          initialValue: elementUtils.rgb2hex(element.style.backgroundColor), 
          handleChange: this.props.handleChange.bind(this, 'backgroundColor')}), 
        React.createElement(PropertyRow, {
          desc: 'font size (px)', 
          isNumber: true, 
          initialValue: parseInt(element.style.fontSize, 10), 
          handleChange: this.props.handleChange.bind(this, 'fontSize')}), 
        React.createElement(ImagePickerPropertyRow, {
          desc: 'image', 
          initialValue: element.getAttribute('data-canonical-image-url') || '', 
          handleChange: this.props.handleChange.bind(this, 'image')}), 
        React.createElement(BooleanPropertyRow, {
          desc: 'hidden', 
          initialValue: $(element).hasClass('design-mode-hidden'), 
          handleChange: this.props.handleChange.bind(this, 'hidden')}), 
        React.createElement(ZOrderRow, {
          element: this.props.element, 
          onDepthChange: this.props.onDepthChange})
      ));

    // TODO (brent):
    // bold/italics/underline (p2)
    // shape (p2)
    // textAlignment (p2)
    // enabled (p2)
  }
});

var ButtonEvents = React.createClass({displayName: "ButtonEvents",
  propTypes: {
    element: React.PropTypes.instanceOf(HTMLElement).isRequired,
    handleChange: React.PropTypes.func.isRequired,
    onInsertEvent: React.PropTypes.func.isRequired
  },

  getClickEventCode: function() {
    var id = elementUtils.getId(this.props.element);
    var code =
      'onEvent("' + id + '", "click", function(event) {\n' +
      '  console.log("' + id + ' clicked!");\n' +
      '});\n';
    return code;
  },

  insertClick: function() {
    this.props.onInsertEvent(this.getClickEventCode());
  },

  render: function () {
    var element = this.props.element;
    var clickName = 'Click';
    var clickDesc = 'Triggered when the button is clicked with a mouse or tapped on a screen.';

    return (
      React.createElement("div", {id: "eventRowContainer"}, 
        React.createElement(PropertyRow, {
          desc: 'id', 
          initialValue: elementUtils.getId(element), 
          handleChange: this.props.handleChange.bind(this, 'id'), 
          isIdRow: true}), 
        React.createElement(EventHeaderRow, null), 
        React.createElement(EventRow, {
          name: clickName, 
          desc: clickDesc, 
          handleInsert: this.insertClick})
      )
    );
  }
});

module.exports = {
  PropertyTab: ButtonProperties,
  EventTab: ButtonEvents,
  create: function () {
    var element = document.createElement('button');
    element.appendChild(document.createTextNode('Button'));
    element.style.padding = '0px';
    element.style.margin = '0px';
    element.style.height = '30px';
    element.style.width = '80px';
    element.style.fontSize = '14px';
    element.style.color = '#fff';
    element.style.backgroundColor = '#1abc9c';

    return element;
  },
  onDeserialize: function (element, updateProperty) {
    var url = element.getAttribute('data-canonical-image-url');
    if (url) {
      updateProperty(element, 'image', url);
    }
  }
};


},{"./BooleanPropertyRow.jsx":"/home/ubuntu/staging/apps/build/js/applab/designElements/BooleanPropertyRow.jsx","./ColorPickerPropertyRow.jsx":"/home/ubuntu/staging/apps/build/js/applab/designElements/ColorPickerPropertyRow.jsx","./EventHeaderRow.jsx":"/home/ubuntu/staging/apps/build/js/applab/designElements/EventHeaderRow.jsx","./EventRow.jsx":"/home/ubuntu/staging/apps/build/js/applab/designElements/EventRow.jsx","./ImagePickerPropertyRow.jsx":"/home/ubuntu/staging/apps/build/js/applab/designElements/ImagePickerPropertyRow.jsx","./PropertyRow.jsx":"/home/ubuntu/staging/apps/build/js/applab/designElements/PropertyRow.jsx","./ZOrderRow.jsx":"/home/ubuntu/staging/apps/build/js/applab/designElements/ZOrderRow.jsx","./elementUtils":"/home/ubuntu/staging/apps/build/js/applab/designElements/elementUtils.js"}],"/home/ubuntu/staging/apps/build/js/applab/designElements/elementUtils.js":[function(require,module,exports){
var constants = require('../constants');
var utils = require('../../utils');

// Taken from http://stackoverflow.com/a/3627747/2506748
module.exports.rgb2hex = function (rgb) {
  if (rgb === '') {
    return rgb;
  }
  var parsed = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  if (parsed === null) {
    return rgb;
  }
  function hex(x) {
    return ("0" + parseInt(x).toString(16)).slice(-2);
  }
  return "#" + hex(parsed[1]) + hex(parsed[2]) + hex(parsed[3]);
};

/**
 * Gets the element's id, stripping the prefix.
 * @param element {Element}
 * @param prefix {string} Optional. Defaults to DESIGN_ELEMENT_ID_PREFIX.
 * @returns {string} The element id with prefix stripped, or null if it had no id.
 */
var getId = module.exports.getId = function (element, prefix) {
  var elementId = element.getAttribute('id');
  if (elementId === null) {
    return null;
  }
  prefix = utils.valueOr(prefix, constants.DESIGN_ELEMENT_ID_PREFIX);
  checkId(element, prefix);
  return elementId.substr(prefix.length);
};

/**
 * Sets the element's id, adding the prefix.
 * @param element {Element}
 * @param value (string)
 * @param prefix {string} Optional. Defaults to DESIGN_ELEMENT_ID_PREFIX.
 */
var setId = module.exports.setId = function (element, value, prefix) {
  if (value === null) {
    return;
  }
  prefix = utils.valueOr(prefix, constants.DESIGN_ELEMENT_ID_PREFIX);
  element.setAttribute('id', prefix + value);
};

/**
 * Throws an error if the element's id does not start with the prefix.
 * @param element {Element}
 * @param prefix {string}
 */
function checkId(element, prefix) {
  if (element.id.substr(0, prefix.length) !== prefix) {
    throw new Error('element.id "' + element.id + '" does not start with prefix "' + prefix + '".');
  }
}

/**
 * Add the prefix to the elementId and returns the element with that id.
 * @param elementId {string}
 * @param prefix {string} Optional. Defaults to DESIGN_ELEMENT_ID_PREFIX.
 * @returns {Element}
 */
module.exports.getPrefixedElementById = function(elementId, prefix) {
  prefix = prefix === undefined ? constants.DESIGN_ELEMENT_ID_PREFIX : prefix;
  return document.getElementById(prefix + elementId);
};

/**
 * Adds the prefix to the element's id.
 * @param element {Element}
 * @param prefix {string} Optional prefix to add. Defaults to ''.
 * @returns {Element}
 */
module.exports.addIdPrefix = function (element, prefix) {
  prefix = utils.valueOr(prefix, '');
  setId(element, element.getAttribute('id'), prefix);
};

/**
 * Removes the DESIGN_ELEMENT_ID_PREFIX from the element's id.
 * @param element {Element}
 * @returns {Element}
 */
module.exports.removeIdPrefix = function (element) {
  element.setAttribute('id', getId(element));
};


},{"../../utils":"/home/ubuntu/staging/apps/build/js/utils.js","../constants":"/home/ubuntu/staging/apps/build/js/applab/constants.js"}],"/home/ubuntu/staging/apps/build/js/applab/constants.js":[function(require,module,exports){
module.exports = {
  FOOTER_HEIGHT: 30,
  DESIGN_ELEMENT_ID_PREFIX: 'design_'
};


},{}],"/home/ubuntu/staging/apps/build/js/applab/designElements/ZOrderRow.jsx":[function(require,module,exports){
var rowStyle = require('./rowStyle');

var ZOrderRow = React.createClass({displayName: "ZOrderRow",
  propTypes: {
    element: React.PropTypes.instanceOf(HTMLElement).isRequired,
    onDepthChange: React.PropTypes.func.isRequired
  },

  getInitialState: function () {
    return {
      value: this.props.initialValue
    };
  },

  componentWillReceiveProps: function (newProps) {
    this.setState({value: newProps.initialValue});
  },

  render: function() {
    var element = this.props.element;

    // Element will be wrapped in a resizable div
    var outerElement = element.parentNode;
    var index = Array.prototype.indexOf.call(outerElement.parentNode.children, outerElement);
    var isBackMost = index === 0;
    var isFrontMost = index + 1 === outerElement.parentNode.children.length;

    var squareButton = {
      width: 42,
      height: 42,
      marginLeft: 0,
      marginRight: 10,
      backgroundColor: '#0094ca' // $cyan
    };

    var squareButtonDisabled = {
      width: 42,
      height: 42,
      marginLeft: 0,
      marginRight: 10
    };

    return (
      React.createElement("div", {style: rowStyle.container}, 
        React.createElement("div", {style: rowStyle.description}, 
          "depth"
        ), 
        React.createElement("div", null, 
          React.createElement("button", {
            style: isBackMost ? squareButtonDisabled : squareButton, 
            onClick: this.props.onDepthChange.bind(this, element, 'toBack'), 
            disabled: isBackMost, 
            title: "Send to Back"}, 
            React.createElement("i", {className: "fa fa-angle-double-left"})
          ), 
          React.createElement("button", {
            style: isBackMost ? squareButtonDisabled : squareButton, 
            onClick: this.props.onDepthChange.bind(this, element, 'backward'), 
            disabled: isBackMost, 
            title: "Send Backward"}, 
            React.createElement("i", {className: "fa fa-angle-left"})
          ), 
          React.createElement("button", {
            style: isFrontMost ? squareButtonDisabled : squareButton, 
            onClick: this.props.onDepthChange.bind(this, element, 'forward'), 
            disabled: isFrontMost, 
            title: "Send Forward"}, 
            React.createElement("i", {className: "fa fa-angle-right"})
          ), 
          React.createElement("button", {
            style: isFrontMost ? squareButtonDisabled : squareButton, 
            onClick: this.props.onDepthChange.bind(this, element, 'toFront'), 
            disabled: isFrontMost, 
            title: "Send to Front"}, 
            React.createElement("i", {className: "fa fa-angle-double-right"})
          )
        )
      )
    );
  }
});

module.exports = ZOrderRow;


},{"./rowStyle":"/home/ubuntu/staging/apps/build/js/applab/designElements/rowStyle.js"}],"/home/ubuntu/staging/apps/build/js/applab/designElements/PropertyRow.jsx":[function(require,module,exports){
/* global $ */
var rowStyle = require('./rowStyle');

var LockState = {
  LOCKED: 'LOCKED',
  UNLOCKED: 'UNLOCKED'
};

var PropertyRow = React.createClass({displayName: "PropertyRow",
  propTypes: {
    desc: React.PropTypes.string.isRequired,
    initialValue: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.number
    ]).isRequired,
    isNumber: React.PropTypes.bool,
    lockState: React.PropTypes.oneOf([LockState.LOCKED, LockState.UNLOCKED, undefined]),
    isMultiLine: React.PropTypes.bool,
    handleChange: React.PropTypes.func,
    handleLockChange: React.PropTypes.func,
    isIdRow: React.PropTypes.bool
  },

  getInitialState: function () {
    return {
      value: this.props.initialValue
    };
  },

  componentWillReceiveProps: function (newProps) {
    this.setState({value: newProps.initialValue});
  },

  handleChangeInternal: function(event) {
    var value = event.target.value;
    this.props.handleChange(value);
    this.setState({value: value});
  },

  handleClickLock: function () {
    if (this.props.lockState === LockState.LOCKED) {
      this.props.handleLockChange(LockState.UNLOCKED);
    } else if (this.props.lockState === LockState.UNLOCKED) {
      this.props.handleLockChange(LockState.LOCKED);
    }
  },

  render: function() {
    var idRowStyle = $.extend({}, rowStyle.container, rowStyle.maxWidth, {
      backgroundColor: '#a69bc1',
      paddingBottom: 10
    });

    var inputElement;
    if (this.props.isMultiLine) {
      inputElement = React.createElement("textarea", {
        value: this.state.value, 
        onChange: this.handleChangeInternal});
    } else {
      inputElement = React.createElement("input", {
        type: this.props.isNumber ? 'number' : undefined, 
        value: this.state.value, 
        onChange: this.handleChangeInternal, 
        style: rowStyle.input});
    }

    var lockStyle = {
      marginLeft: '5px'
    };

    var lockIcon;
    // state is either locked/unlocked or undefined (no icon)
    if (this.props.lockState) {
      var lockClass = "fa fa-" + (this.props.lockState === LockState.LOCKED ?
        'lock' : 'unlock');
      lockIcon = (React.createElement("i", {
        className: lockClass, 
        style: lockStyle, 
        onClick: this.handleClickLock})
      );
    }

    return (
      React.createElement("div", {style: this.props.isIdRow ? idRowStyle : rowStyle.container}, 
        React.createElement("div", {style: rowStyle.description}, this.props.desc), 
        React.createElement("div", null, 
          inputElement, 
          lockIcon
        )
      )
    );
  }
});
PropertyRow.LockState = LockState;

module.exports = PropertyRow;


},{"./rowStyle":"/home/ubuntu/staging/apps/build/js/applab/designElements/rowStyle.js"}],"/home/ubuntu/staging/apps/build/js/applab/designElements/ImagePickerPropertyRow.jsx":[function(require,module,exports){
var showAssetManager = require('../assetManagement/show.js');
var rowStyle = require('./rowStyle');

var PropertyRow = React.createClass({displayName: "PropertyRow",
  propTypes: {
    initialValue: React.PropTypes.string.isRequired,
    handleChange: React.PropTypes.func
  },

  getInitialState: function () {
    return {
      value: this.props.initialValue
    };
  },

  handleChangeInternal: function (event) {
    this.changeImage(event.target.value);
  },

  handleButtonClick: function () {
    // TODO: This isn't the pure-React way of referencing the AssetManager
    // component. Ideally we'd be able to `require` it directly without needing
    // to know about `designMode`.
    //
    // However today the `createModalDialog` function and `Dialog` component
    // are intertwined with `StudioApp` which is why we have this direct call.
    showAssetManager(this.changeImage, 'image');
  },

  changeImage: function (filename) {
    this.props.handleChange(filename);
    this.setState({value: filename});
  },

  render: function() {
    return (
      React.createElement("div", {style: rowStyle.container}, 
        React.createElement("div", {style: rowStyle.description}, this.props.desc), 
        React.createElement("div", null, 
          React.createElement("input", {
            value: this.state.value, 
            onChange: this.handleChangeInternal, 
            style: rowStyle.input}), 
          " ", 
          React.createElement("a", {onClick: this.handleButtonClick}, 
            "Choose..."
          )
        )
      )
    );
  }
});

module.exports = PropertyRow;


},{"../assetManagement/show.js":"/home/ubuntu/staging/apps/build/js/applab/assetManagement/show.js","./rowStyle":"/home/ubuntu/staging/apps/build/js/applab/designElements/rowStyle.js"}],"/home/ubuntu/staging/apps/build/js/applab/assetManagement/show.js":[function(require,module,exports){
/* global Dialog, dashboard */
// TODO (josh) - don't pass `Dialog` into `createModalDialog`.

var AssetManager = require('./AssetManager.jsx');
var studioApp = require('../../StudioApp').singleton;

/**
 * Display the "Manage Assets" modal.
 * @param assetChosen {Function} Called when the user chooses an asset. The
 *   "Choose" button in the UI only appears if this optional param is provided.
 * @param typeFilter {String} The type of assets to show and allow to be
 *   uploaded.
 */
module.exports = function(assetChosen, typeFilter) {
  var codeDiv = document.createElement('div');
  var showChoseImageButton = assetChosen && typeof assetChosen === 'function';
  var dialog = studioApp.createModalDialog({
    contentDiv: codeDiv,
    defaultBtnSelector: 'again-button',
    id: 'manageAssetsModal'
  });
  React.render(React.createElement(AssetManager, {
    typeFilter: typeFilter,
    uploadsEnabled: !dashboard.project.exceedsAbuseThreshold(),
    assetChosen: showChoseImageButton ? function (fileWithPath) {
      dialog.hide();
      assetChosen(fileWithPath);
    } : null
  }), codeDiv);

  dialog.show();
};


},{"../../StudioApp":"/home/ubuntu/staging/apps/build/js/StudioApp.js","./AssetManager.jsx":"/home/ubuntu/staging/apps/build/js/applab/assetManagement/AssetManager.jsx"}],"/home/ubuntu/staging/apps/build/js/applab/assetManagement/AssetManager.jsx":[function(require,module,exports){
var assetsApi = require('../../clientApi').assets;
var AssetRow = require('./AssetRow.jsx');
var assetListStore = require('./assetListStore');

var errorMessages = {
  403: 'Quota exceeded. Please delete some files and try again.',
  413: 'The file is too large.',
  415: 'This type of file is not supported.',
  500: 'The server responded with an error.',
  unknown: 'An unknown error occurred.'
};

var errorUploadDisabled = "This project has been reported for abusive content, " +
  "so uploading new assets is disabled.";

function getErrorMessage(status) {
  return errorMessages[status] || errorMessages.unknown;
}

/**
 * A component for managing hosted assets.
 */
module.exports = React.createClass({displayName: "exports",
  propTypes: {
    assetChosen: React.PropTypes.func,
    typeFilter: React.PropTypes.string,
    uploadsEnabled: React.PropTypes.bool.isRequired
  },

  getInitialState: function () {
    return {
      assets: null,
      statusMessage: this.props.uploadsEnabled ? '' : errorUploadDisabled
    };
  },

  componentWillMount: function () {
    // TODO: Use Dave's client api when it's finished.
    assetsApi.ajax('GET', '', this.onAssetListReceived, this.onAssetListFailure);
  },

  /**
   * Called after the component mounts, when the server responds with the
   * current list of assets.
   * @param xhr
   */
  onAssetListReceived: function (xhr) {
    assetListStore.reset(JSON.parse(xhr.responseText));
    this.setState({assets: assetListStore.list(this.props.typeFilter)});
  },

  /**
   * Called after the component mounts, if the server responds with an error
   * when loading the current list of assets.
   * @param xhr
   */
  onAssetListFailure: function (xhr) {
    this.setState({statusMessage: 'Error loading asset list: ' +
        getErrorMessage(xhr.status)});
  },

  /**
   * We've hidden the <input type="file"/> and replaced it with a big button.
   * Forward clicks on the button to the hidden file input.
   */
  fileUploadClicked: function () {
    var uploader = React.findDOMNode(this.refs.uploader);
    uploader.click();
  },

  /**
   * Uploads the current file selected by the user.
   * TODO: HTML5 File API isn't available in IE9, need a fallback.
   */
  upload: function () {
    var file = React.findDOMNode(this.refs.uploader).files[0];
    if (file.type && this.props.typeFilter) {
      var type = file.type.split('/')[0];
      if (type !== this.props.typeFilter) {
        this.setState({statusMessage: 'Only ' + this.props.typeFilter +
          ' assets can be used here.'});
        return;
      }
    }

    // TODO: Use Dave's client api when it's finished.
    assetsApi.ajax('PUT', file.name, function (xhr) {
      assetListStore.add(JSON.parse(xhr.responseText));
      this.setState({
        assets: assetListStore.list(this.props.typeFilter),
        statusMessage: 'File "' + file.name + '" successfully uploaded!'
      });
    }.bind(this), function (xhr) {
      this.setState({statusMessage: 'Error uploading file: ' +
          getErrorMessage(xhr.status)});
    }.bind(this), file);

    this.setState({statusMessage: 'Uploading...'});
  },

  deleteAssetRow: function (name) {
    this.setState({
      assets: assetListStore.remove(name),
      statusMessage: 'File "' + name + '" successfully deleted!'
    });
  },

  render: function () {
    var uploadButton = (
      React.createElement("div", null, 
        React.createElement("input", {
            ref: "uploader", 
            type: "file", 
            accept: (this.props.typeFilter || '*') + '/*', 
            style: {display: 'none'}, 
            onChange: this.upload}), 
        React.createElement("button", {
            onClick: this.fileUploadClicked, 
            className: "share", 
            id: "upload-asset", 
            disabled: !this.props.uploadsEnabled}, 
          React.createElement("i", {className: "fa fa-upload"}), 
          " Upload File"
        ), 
        React.createElement("span", {style: {margin: '0 10px'}, id: "manage-asset-status"}, 
          this.state.statusMessage
        )
      )
    );

    var assetList;
    // If `this.state.assets` is null, the asset list is still loading. If it's
    // empty, the asset list has loaded and there are no assets in the current
    // channel (matching the `typeFilter`, if one was provided).
    if (this.state.assets === null) {
      assetList = (
        React.createElement("div", {style: {margin: '1em 0', textAlign: 'center'}}, 
          React.createElement("i", {className: "fa fa-spinner fa-spin", style: {fontSize: '32px'}})
        )
      );
    } else if (this.state.assets.length === 0) {
      assetList = (
        React.createElement("div", null, 
          React.createElement("div", {style: {margin: '1em 0'}}, 
            "Your assets will appear here. Click \"Upload File\" to add a new asset" + ' ' +
            "for this project."
          ), 
          uploadButton
        )
      );
    } else {
      var rows = this.state.assets.map(function (asset) {
        var choose = this.props.assetChosen && this.props.assetChosen.bind(this,
            asset.filename);

        return React.createElement(AssetRow, {
            key: asset.filename, 
            name: asset.filename, 
            type: asset.category, 
            size: asset.size, 
            onChoose: choose, 
            onDelete: this.deleteAssetRow.bind(this, asset.filename)});
      }.bind(this));

      assetList = (
        React.createElement("div", null, 
          React.createElement("div", {style: {maxHeight: '330px', overflowY: 'scroll', margin: '1em 0', paddingRight: '15px'}}, 
            React.createElement("table", {style: {width: '100%'}}, 
              React.createElement("tbody", null, 
                rows
              )
            )
          ), 
          uploadButton
        )
      );
    }

    var title = this.props.assetChosen ?
        React.createElement("p", {className: "dialog-title"}, "Choose Assets") :
        React.createElement("p", {className: "dialog-title"}, "Manage Assets");

    return (
      React.createElement("div", {className: "modal-content", style: {margin: 0}}, 
        title, 
        assetList
      )
    );
  }
});


},{"../../clientApi":"/home/ubuntu/staging/apps/build/js/clientApi.js","./AssetRow.jsx":"/home/ubuntu/staging/apps/build/js/applab/assetManagement/AssetRow.jsx","./assetListStore":"/home/ubuntu/staging/apps/build/js/applab/assetManagement/assetListStore.js"}],"/home/ubuntu/staging/apps/build/js/applab/assetManagement/assetListStore.js":[function(require,module,exports){
var assets = [];

module.exports = {
  reset: function (list) {
    assets = list.slice();
  },

  add: function (asset) {
    assets.push(asset);
    return assets.slice();
  },

  remove: function (filename) {
    assets = assets.filter(function (asset) {
      return asset.filename !== filename;
    });
    return assets.slice();
  },

  list: function (typeFilter) {
    return typeFilter ? assets.filter(function (asset) {
      return asset.category === typeFilter;
    }) : assets.slice();
  }
};


},{}],"/home/ubuntu/staging/apps/build/js/applab/assetManagement/AssetRow.jsx":[function(require,module,exports){
var assetsApi = require('../../clientApi').assets;

var defaultIcons = {
  image: 'fa fa-picture-o',
  audio: 'fa fa-music',
  video: 'fa fa-video-camera',
  unknown: 'fa fa-question'
};

/**
 * Creates a thumbnail (the image itself for images, or an icon representing the
 * filetype).
 * @param type {String} The asset type (e.g. 'audio').
 * @param name {String} The name of the asset.
 * @returns {XML}
 */
function getThumbnail(type, name) {
  switch (type) {
    case 'image':
      var src = assetsApi.basePath(name);
      var assetThumbnailStyle = {
        width: 'auto',
        maxWidth: '100%',
        height: 'auto',
        maxHeight: '100%',
        zoom: 2,
        marginTop: '50%',
        transform: 'translateY(-50%)',
        msTransform: 'translateY(-50%)',
        WebkitTransform: 'translateY(-50%)'
      };
      return React.createElement("img", {src: src, style: assetThumbnailStyle});
    default:
      var icon = defaultIcons[type] || defaultIcons.unknown;
      var assetIconStyle = {
        margin: '15px 0',
        fontSize: '32px'
      };
      return React.createElement("i", {className: icon, style: assetIconStyle});
  }
}

/**
 * A single row in the AssetManager, describing one asset.
 */
module.exports = React.createClass({displayName: "exports",
  propTypes: {
    name: React.PropTypes.string.isRequired,
    type: React.PropTypes.oneOf(['image', 'audio', 'video']).isRequired,
    size: React.PropTypes.number,
    onChoose: React.PropTypes.func,
    onDelete: React.PropTypes.func.isRequired
  },

  getInitialState: function () {
    return {
      action: 'normal',
      actionText: ''
    };
  },

  /**
   * Confirm the user actually wants to delete this asset.
   */
  confirmDelete: function () {
    this.setState({action: 'confirming delete', actionText: ''});
  },

  /**
   * This user didn't want to delete this asset.
   */
  cancelDelete: function () {
    this.setState({action: 'normal', actionText: ''});
  },

  /**
   * Delete this asset and notify the parent to remove this row. If the delete
   * fails, flip back to 'confirming delete' and display a message.
   */
  handleDelete: function () {
    this.setState({action: 'deleting', actionText: ''});

    // TODO: Use Dave's client api when it's finished.
    assetsApi.ajax('DELETE', this.props.name, this.props.onDelete, function () {
      this.setState({action: 'confirming delete',
          actionText: 'Error deleting file.'});
    }.bind(this));
  },

  render: function () {
    var actions, flex;
    // `flex` is the "Choose" button in file-choose mode, or the filesize.
    if (this.props.onChoose) {
      flex = React.createElement("button", {onClick: this.props.onChoose}, "Choose");
    } else {
      var size = (this.props.size / 1000).toFixed(2);
      flex = size + ' kb';
    }

    switch (this.state.action) {
      case 'normal':
        var src = assetsApi.basePath(this.props.name);
        actions = (
          React.createElement("td", {width: "250", style: {textAlign: 'right'}}, 
            flex, 
            React.createElement("a", {href: src, 
                target: "_blank", 
                style: {backgroundColor: 'transparent'}}, 
              React.createElement("button", null, React.createElement("i", {className: "fa fa-eye"}))
            ), 
            React.createElement("button", {className: "btn-danger", onClick: this.confirmDelete}, 
              React.createElement("i", {className: "fa fa-trash-o"})
            ), 
            this.state.actionText
          )
        );
        break;
      case 'confirming delete':
        actions = (
          React.createElement("td", {width: "250", style: {textAlign: 'right'}}, 
            React.createElement("button", {className: "btn-danger", onClick: this.handleDelete}, 
              "Delete File"
            ), 
            React.createElement("button", {onClick: this.cancelDelete}, "Cancel"), 
            this.state.actionText
          )
        );
        break;
      case 'deleting':
        actions = (
          React.createElement("td", {width: "250", style: {textAlign: 'right'}}, 
            React.createElement("i", {className: "fa fa-spinner fa-spin", style: {
              fontSize: '32px',
              marginRight: '15px'
            }})
          )
        );
        break;
    }

    return (
      React.createElement("tr", {className: "assetRow", onDoubleClick: this.props.onChoose}, 
        React.createElement("td", {width: "80"}, 
          React.createElement("div", {className: "assetThumbnail", style: {
            width: '60px',
            height: '60px',
            margin: '10px auto',
            background: '#eee',
            border: '1px solid #ccc',
            textAlign: 'center'
          }}, 
            getThumbnail(this.props.type, this.props.name)
          )
        ), 
        React.createElement("td", null, this.props.name), 
        actions
      )
    );
  }
});


},{"../../clientApi":"/home/ubuntu/staging/apps/build/js/clientApi.js"}],"/home/ubuntu/staging/apps/build/js/applab/designElements/EventRow.jsx":[function(require,module,exports){
/* global $ */
var rowStyle = require('./rowStyle');

var EventRow = module.exports = React.createClass({displayName: "exports",
  propTypes: {
    name: React.PropTypes.string.isRequired,
    desc: React.PropTypes.string.isRequired,
    handleInsert: React.PropTypes.func.isRequired
  },

  render: function() {
    var style = {
      container: $.extend({}, rowStyle.container, rowStyle.maxWidth),
      name: {
        color: '#4d575f',
        fontWeight: 'bold',
        fontSize: 15
      },
      desc: {
        color: '#949ca2',
        fontStyle: 'italic'
      }
    };

    return (
      React.createElement("div", {style: style.container}, 
        React.createElement("div", {style: style.name}, 
          this.props.name
        ), 
        React.createElement("div", {style: style.desc}, 
          this.props.desc
        ), 
        React.createElement("div", null, 
          React.createElement("a", {onClick: this.props.handleInsert, className: "hover-pointer"}, "Insert and show code")
        )
      )
    );
  }
});

},{"./rowStyle":"/home/ubuntu/staging/apps/build/js/applab/designElements/rowStyle.js"}],"/home/ubuntu/staging/apps/build/js/applab/designElements/EventHeaderRow.jsx":[function(require,module,exports){
/* global $ */
var rowStyle = require('./rowStyle');
var applabMsg = require('../locale');

var EventHeaderRow = module.exports = React.createClass({displayName: "exports",
  render: function() {
    var style = $.extend({}, rowStyle.container, rowStyle.maxWidth, {
      color: '#5b6770'
    });

    return (
      React.createElement("div", {style: style}, 
        applabMsg.addEventHeader()
      )
    );
  }
});

},{"../locale":"/home/ubuntu/staging/apps/build/js/applab/locale.js","./rowStyle":"/home/ubuntu/staging/apps/build/js/applab/designElements/rowStyle.js"}],"/home/ubuntu/staging/apps/build/js/applab/designElements/ColorPickerPropertyRow.jsx":[function(require,module,exports){
/* global $ */
var rowStyle = require('./rowStyle');

var colorPicker = require('../colpick');

var ColorPickerPropertyRow = React.createClass({displayName: "ColorPickerPropertyRow",
  propTypes: {
    initialValue: React.PropTypes.string.isRequired,
    handleChange: React.PropTypes.func
  },

  getInitialState: function () {
    return {
      value: this.props.initialValue
    };
  },

  componentDidMount: function () {
    this.ensureColorPicker();
  },

  componentDidUpdate: function () {
    this.ensureColorPicker();
  },

  /**
   * Make our button a colpick color picker, if it isn't already
   */
  ensureColorPicker: function () {
    var element = React.findDOMNode(this.refs.colorPicker);
    $(element).colpick({
      color: this.state.value,
    	layout: 'rgbhex',
    	submit: 0,
      onChange: this.handleColorChange
    });
  },

  handleChangeInternal: function(event) {
    this.changeColor(event.target.value);
  },

  handleColorChange: function (hsbColor, hexColor) {
    this.changeColor('#' + hexColor);
  },

  changeColor: function (color) {
    this.props.handleChange(color);
    this.setState({value: color});
  },

  render: function() {
    var buttonStyle = {
      backgroundColor: this.state.value,
      verticalAlign: 'top'
    };
    return (
      React.createElement("div", {style: rowStyle.container}, 
        React.createElement("div", {style: rowStyle.description}, this.props.desc), 
        React.createElement("div", null, 
          React.createElement("input", {
            value: this.state.value, 
            onChange: this.handleChangeInternal, 
            style: rowStyle.input}), 
          React.createElement("button", {style: buttonStyle, ref: "colorPicker"})
        )
      )
    );
  }
});

module.exports = ColorPickerPropertyRow;


},{"../colpick":"/home/ubuntu/staging/apps/build/js/applab/colpick.js","./rowStyle":"/home/ubuntu/staging/apps/build/js/applab/designElements/rowStyle.js"}],"/home/ubuntu/staging/apps/build/js/applab/colpick.js":[function(require,module,exports){
/*
colpick Color Picker
Copyright 2013 Jose Vargas. Licensed under GPL license. Based on Stefan Petre's Color Picker www.eyecon.ro, dual licensed under the MIT and GPL licenses

For usage and examples: colpick.com/plugin
 */

(function ($) {
	var colpick = function () {
		var
			tpl = '<div class="colpick"><div class="colpick_color"><div class="colpick_color_overlay1"><div class="colpick_color_overlay2"><div class="colpick_selector_outer"><div class="colpick_selector_inner"></div></div></div></div></div><div class="colpick_hue"><div class="colpick_hue_arrs"><div class="colpick_hue_larr"></div><div class="colpick_hue_rarr"></div></div></div><div class="colpick_new_color"></div><div class="colpick_current_color"></div><div class="colpick_hex_field"><div class="colpick_field_letter">#</div><input type="text" maxlength="6" size="6" /></div><div class="colpick_rgb_r colpick_field"><div class="colpick_field_letter">R</div><input type="text" maxlength="3" size="3" /><div class="colpick_field_arrs"><div class="colpick_field_uarr"></div><div class="colpick_field_darr"></div></div></div><div class="colpick_rgb_g colpick_field"><div class="colpick_field_letter">G</div><input type="text" maxlength="3" size="3" /><div class="colpick_field_arrs"><div class="colpick_field_uarr"></div><div class="colpick_field_darr"></div></div></div><div class="colpick_rgb_b colpick_field"><div class="colpick_field_letter">B</div><input type="text" maxlength="3" size="3" /><div class="colpick_field_arrs"><div class="colpick_field_uarr"></div><div class="colpick_field_darr"></div></div></div><div class="colpick_hsb_h colpick_field"><div class="colpick_field_letter">H</div><input type="text" maxlength="3" size="3" /><div class="colpick_field_arrs"><div class="colpick_field_uarr"></div><div class="colpick_field_darr"></div></div></div><div class="colpick_hsb_s colpick_field"><div class="colpick_field_letter">S</div><input type="text" maxlength="3" size="3" /><div class="colpick_field_arrs"><div class="colpick_field_uarr"></div><div class="colpick_field_darr"></div></div></div><div class="colpick_hsb_b colpick_field"><div class="colpick_field_letter">B</div><input type="text" maxlength="3" size="3" /><div class="colpick_field_arrs"><div class="colpick_field_uarr"></div><div class="colpick_field_darr"></div></div></div><div class="colpick_submit"></div></div>',
			defaults = {
				showEvent: 'click',
				onShow: function () {},
				onBeforeShow: function(){},
				onHide: function () {},
				onChange: function () {},
				onSubmit: function () {},
				colorScheme: 'light',
				color: '3289c7',
				livePreview: true,
				flat: false,
				layout: 'full',
				submit: 1,
				submitText: 'OK',
				height: 156
			},
			//Fill the inputs of the plugin
			fillRGBFields = function  (hsb, cal) {
				var rgb = hsbToRgb(hsb);
				$(cal).data('colpick').fields
					.eq(1).val(rgb.r).end()
					.eq(2).val(rgb.g).end()
					.eq(3).val(rgb.b).end();
			},
			fillHSBFields = function  (hsb, cal) {
				$(cal).data('colpick').fields
					.eq(4).val(Math.round(hsb.h)).end()
					.eq(5).val(Math.round(hsb.s)).end()
					.eq(6).val(Math.round(hsb.b)).end();
			},
			fillHexFields = function (hsb, cal) {
				$(cal).data('colpick').fields.eq(0).val(hsbToHex(hsb));
			},
			//Set the round selector position
			setSelector = function (hsb, cal) {
				$(cal).data('colpick').selector.css('backgroundColor', '#' + hsbToHex({h: hsb.h, s: 100, b: 100}));
				$(cal).data('colpick').selectorIndic.css({
					left: parseInt($(cal).data('colpick').height * hsb.s/100, 10),
					top: parseInt($(cal).data('colpick').height * (100-hsb.b)/100, 10)
				});
			},
			//Set the hue selector position
			setHue = function (hsb, cal) {
				$(cal).data('colpick').hue.css('top', parseInt($(cal).data('colpick').height - $(cal).data('colpick').height * hsb.h/360, 10));
			},
			//Set current and new colors
			setCurrentColor = function (hsb, cal) {
				$(cal).data('colpick').currentColor.css('backgroundColor', '#' + hsbToHex(hsb));
			},
			setNewColor = function (hsb, cal) {
				$(cal).data('colpick').newColor.css('backgroundColor', '#' + hsbToHex(hsb));
			},
			//Called when the new color is changed
			change = function (ev) {
				var cal = $(this).parent().parent(), col;
				if (this.parentNode.className.indexOf('_hex') > 0) {
					cal.data('colpick').color = col = hexToHsb(fixHex(this.value));
					fillRGBFields(col, cal.get(0));
					fillHSBFields(col, cal.get(0));
				} else if (this.parentNode.className.indexOf('_hsb') > 0) {
					cal.data('colpick').color = col = fixHSB({
						h: parseInt(cal.data('colpick').fields.eq(4).val(), 10),
						s: parseInt(cal.data('colpick').fields.eq(5).val(), 10),
						b: parseInt(cal.data('colpick').fields.eq(6).val(), 10)
					});
					fillRGBFields(col, cal.get(0));
					fillHexFields(col, cal.get(0));
				} else {
					cal.data('colpick').color = col = rgbToHsb(fixRGB({
						r: parseInt(cal.data('colpick').fields.eq(1).val(), 10),
						g: parseInt(cal.data('colpick').fields.eq(2).val(), 10),
						b: parseInt(cal.data('colpick').fields.eq(3).val(), 10)
					}));
					fillHexFields(col, cal.get(0));
					fillHSBFields(col, cal.get(0));
				}
				setSelector(col, cal.get(0));
				setHue(col, cal.get(0));
				setNewColor(col, cal.get(0));
				cal.data('colpick').onChange.apply(cal.parent(), [col, hsbToHex(col), hsbToRgb(col), cal.data('colpick').el, 0]);
			},
			//Change style on blur and on focus of inputs
			blur = function (ev) {
				$(this).parent().removeClass('colpick_focus');
			},
			focus = function () {
				$(this).parent().parent().data('colpick').fields.parent().removeClass('colpick_focus');
				$(this).parent().addClass('colpick_focus');
			},
			//Increment/decrement arrows functions
			downIncrement = function (ev) {
				ev.preventDefault ? ev.preventDefault() : ev.returnValue = false;
				var field = $(this).parent().find('input').focus();
				var current = {
					el: $(this).parent().addClass('colpick_slider'),
					max: this.parentNode.className.indexOf('_hsb_h') > 0 ? 360 : (this.parentNode.className.indexOf('_hsb') > 0 ? 100 : 255),
					y: ev.pageY,
					field: field,
					val: parseInt(field.val(), 10),
					preview: $(this).parent().parent().data('colpick').livePreview
				};
				$(document).mouseup(current, upIncrement);
				$(document).mousemove(current, moveIncrement);
			},
			moveIncrement = function (ev) {
				ev.data.field.val(Math.max(0, Math.min(ev.data.max, parseInt(ev.data.val - ev.pageY + ev.data.y, 10))));
				if (ev.data.preview) {
					change.apply(ev.data.field.get(0), [true]);
				}
				return false;
			},
			upIncrement = function (ev) {
				change.apply(ev.data.field.get(0), [true]);
				ev.data.el.removeClass('colpick_slider').find('input').focus();
				$(document).off('mouseup', upIncrement);
				$(document).off('mousemove', moveIncrement);
				return false;
			},
			//Hue slider functions
			downHue = function (ev) {
				ev.preventDefault ? ev.preventDefault() : ev.returnValue = false;
				var current = {
					cal: $(this).parent(),
					y: $(this).offset().top
				};
				$(document).on('mouseup touchend',current,upHue);
				$(document).on('mousemove touchmove',current,moveHue);
				
				var pageY = ((ev.type == 'touchstart') ? ev.originalEvent.changedTouches[0].pageY : ev.pageY );
				change.apply(
					current.cal.data('colpick')
					.fields.eq(4).val(parseInt(360*(current.cal.data('colpick').height - (pageY - current.y))/current.cal.data('colpick').height, 10))
						.get(0),
					[current.cal.data('colpick').livePreview]
				);
				return false;
			},
			moveHue = function (ev) {
				var pageY = ((ev.type == 'touchmove') ? ev.originalEvent.changedTouches[0].pageY : ev.pageY );
				change.apply(
					ev.data.cal.data('colpick')
					.fields.eq(4).val(parseInt(360*(ev.data.cal.data('colpick').height - Math.max(0,Math.min(ev.data.cal.data('colpick').height,(pageY - ev.data.y))))/ev.data.cal.data('colpick').height, 10))
						.get(0),
					[ev.data.preview]
				);
				return false;
			},
			upHue = function (ev) {
				fillRGBFields(ev.data.cal.data('colpick').color, ev.data.cal.get(0));
				fillHexFields(ev.data.cal.data('colpick').color, ev.data.cal.get(0));
				$(document).off('mouseup touchend',upHue);
				$(document).off('mousemove touchmove',moveHue);
				return false;
			},
			//Color selector functions
			downSelector = function (ev) {
				ev.preventDefault ? ev.preventDefault() : ev.returnValue = false;
				var current = {
					cal: $(this).parent(),
					pos: $(this).offset()
				};
				current.preview = current.cal.data('colpick').livePreview;
				
				$(document).on('mouseup touchend',current,upSelector);
				$(document).on('mousemove touchmove',current,moveSelector);

				var payeX,pageY;
				if(ev.type == 'touchstart') {
					pageX = ev.originalEvent.changedTouches[0].pageX,
					pageY = ev.originalEvent.changedTouches[0].pageY;
				} else {
					pageX = ev.pageX;
					pageY = ev.pageY;
				}

				change.apply(
					current.cal.data('colpick').fields
					.eq(6).val(parseInt(100*(current.cal.data('colpick').height - (pageY - current.pos.top))/current.cal.data('colpick').height, 10)).end()
					.eq(5).val(parseInt(100*(pageX - current.pos.left)/current.cal.data('colpick').height, 10))
					.get(0),
					[current.preview]
				);
				return false;
			},
			moveSelector = function (ev) {
				var payeX,pageY;
				if(ev.type == 'touchmove') {
					pageX = ev.originalEvent.changedTouches[0].pageX,
					pageY = ev.originalEvent.changedTouches[0].pageY;
				} else {
					pageX = ev.pageX;
					pageY = ev.pageY;
				}

				change.apply(
					ev.data.cal.data('colpick').fields
					.eq(6).val(parseInt(100*(ev.data.cal.data('colpick').height - Math.max(0,Math.min(ev.data.cal.data('colpick').height,(pageY - ev.data.pos.top))))/ev.data.cal.data('colpick').height, 10)).end()
					.eq(5).val(parseInt(100*(Math.max(0,Math.min(ev.data.cal.data('colpick').height,(pageX - ev.data.pos.left))))/ev.data.cal.data('colpick').height, 10))
					.get(0),
					[ev.data.preview]
				);
				return false;
			},
			upSelector = function (ev) {
				fillRGBFields(ev.data.cal.data('colpick').color, ev.data.cal.get(0));
				fillHexFields(ev.data.cal.data('colpick').color, ev.data.cal.get(0));
				$(document).off('mouseup touchend',upSelector);
				$(document).off('mousemove touchmove',moveSelector);
				return false;
			},
			//Submit button
			clickSubmit = function (ev) {
				var cal = $(this).parent();
				var col = cal.data('colpick').color;
				cal.data('colpick').origColor = col;
				setCurrentColor(col, cal.get(0));
				cal.data('colpick').onSubmit(col, hsbToHex(col), hsbToRgb(col), cal.data('colpick').el);
			},
			//Show/hide the color picker
			show = function (ev) {
				// Prevent the trigger of any direct parent
				ev.stopPropagation();
				var cal = $('#' + $(this).data('colpickId'));
				cal.data('colpick').onBeforeShow.apply(this, [cal.get(0)]);
				var pos = $(this).offset();
				var top = pos.top + this.offsetHeight;
				var left = pos.left;
				var viewPort = getViewport();
				var calW = cal.width();
				if (left + calW > viewPort.l + viewPort.w) {
					left -= calW;
				}
				cal.css({left: left + 'px', top: top + 'px'});
				if (cal.data('colpick').onShow.apply(this, [cal.get(0)]) != false) {
					cal.show();
				}
				//Hide when user clicks outside
				$('html').mousedown({cal:cal}, hide);
				cal.mousedown(function(ev){ev.stopPropagation();})
			},
			hide = function (ev) {
				if (ev.data.cal.data('colpick').onHide.apply(this, [ev.data.cal.get(0)]) != false) {
					ev.data.cal.hide();
				}
				$('html').off('mousedown', hide);
			},
			getViewport = function () {
				var m = document.compatMode == 'CSS1Compat';
				return {
					l : window.pageXOffset || (m ? document.documentElement.scrollLeft : document.body.scrollLeft),
					w : window.innerWidth || (m ? document.documentElement.clientWidth : document.body.clientWidth)
				};
			},
			//Fix the values if the user enters a negative or high value
			fixHSB = function (hsb) {
				return {
					h: Math.min(360, Math.max(0, hsb.h)),
					s: Math.min(100, Math.max(0, hsb.s)),
					b: Math.min(100, Math.max(0, hsb.b))
				};
			}, 
			fixRGB = function (rgb) {
				return {
					r: Math.min(255, Math.max(0, rgb.r)),
					g: Math.min(255, Math.max(0, rgb.g)),
					b: Math.min(255, Math.max(0, rgb.b))
				};
			},
			fixHex = function (hex) {
				var len = 6 - hex.length;
				if (len > 0) {
					var o = [];
					for (var i=0; i<len; i++) {
						o.push('0');
					}
					o.push(hex);
					hex = o.join('');
				}
				return hex;
			},
			restoreOriginal = function () {
				var cal = $(this).parent();
				var col = cal.data('colpick').origColor;
				cal.data('colpick').color = col;
				fillRGBFields(col, cal.get(0));
				fillHexFields(col, cal.get(0));
				fillHSBFields(col, cal.get(0));
				setSelector(col, cal.get(0));
				setHue(col, cal.get(0));
				setNewColor(col, cal.get(0));
			};
		return {
			init: function (opt) {
				opt = $.extend({}, defaults, opt||{});
				//Set color
				if (typeof opt.color == 'string') {
					opt.color = hexToHsb(opt.color);
				} else if (opt.color.r != undefined && opt.color.g != undefined && opt.color.b != undefined) {
					opt.color = rgbToHsb(opt.color);
				} else if (opt.color.h != undefined && opt.color.s != undefined && opt.color.b != undefined) {
					opt.color = fixHSB(opt.color);
				} else {
					return this;
				}
				
				//For each selected DOM element
				return this.each(function () {
					//If the element does not have an ID
					if (!$(this).data('colpickId')) {
						var options = $.extend({}, opt);
						options.origColor = opt.color;
						//Generate and assign a random ID
						var id = 'collorpicker_' + parseInt(Math.random() * 1000);
						$(this).data('colpickId', id);
						//Set the tpl's ID and get the HTML
						var cal = $(tpl).attr('id', id);
						//Add class according to layout
						cal.addClass('colpick_'+options.layout+(options.submit?'':' colpick_'+options.layout+'_ns'));
						//Add class if the color scheme is not default
						if(options.colorScheme != 'light') {
							cal.addClass('colpick_'+options.colorScheme);
						}
						//Setup submit button
						cal.find('div.colpick_submit').html(options.submitText).click(clickSubmit);
						//Setup input fields
						options.fields = cal.find('input').change(change).blur(blur).focus(focus);
						cal.find('div.colpick_field_arrs').mousedown(downIncrement).end().find('div.colpick_current_color').click(restoreOriginal);
						//Setup hue selector
						options.selector = cal.find('div.colpick_color').on('mousedown touchstart',downSelector);
						options.selectorIndic = options.selector.find('div.colpick_selector_outer');
						//Store parts of the plugin
						options.el = this;
						options.hue = cal.find('div.colpick_hue_arrs');
						huebar = options.hue.parent();
						//Paint the hue bar
						var UA = navigator.userAgent.toLowerCase();
						var isIE = navigator.appName === 'Microsoft Internet Explorer';
						var IEver = isIE ? parseFloat( UA.match( /msie ([0-9]{1,}[\.0-9]{0,})/ )[1] ) : 0;
						var ngIE = ( isIE && IEver < 10 );
						var stops = ['#ff0000','#ff0080','#ff00ff','#8000ff','#0000ff','#0080ff','#00ffff','#00ff80','#00ff00','#80ff00','#ffff00','#ff8000','#ff0000'];
						if(ngIE) {
							var i, div;
							for(i=0; i<=11; i++) {
								div = $('<div></div>').attr('style','height:8.333333%; filter:progid:DXImageTransform.Microsoft.gradient(GradientType=0,startColorstr='+stops[i]+', endColorstr='+stops[i+1]+'); -ms-filter: "progid:DXImageTransform.Microsoft.gradient(GradientType=0,startColorstr='+stops[i]+', endColorstr='+stops[i+1]+')";');
								huebar.append(div);
							}
						} else {
							stopList = stops.join(',');
							huebar.attr('style','background:-webkit-linear-gradient(top,'+stopList+'); background: -o-linear-gradient(top,'+stopList+'); background: -ms-linear-gradient(top,'+stopList+'); background:-moz-linear-gradient(top,'+stopList+'); -webkit-linear-gradient(top,'+stopList+'); background:linear-gradient(to bottom,'+stopList+'); ');
						}
						cal.find('div.colpick_hue').on('mousedown touchstart',downHue);
						options.newColor = cal.find('div.colpick_new_color');
						options.currentColor = cal.find('div.colpick_current_color');
						//Store options and fill with default color
						cal.data('colpick', options);
						fillRGBFields(options.color, cal.get(0));
						fillHSBFields(options.color, cal.get(0));
						fillHexFields(options.color, cal.get(0));
						setHue(options.color, cal.get(0));
						setSelector(options.color, cal.get(0));
						setCurrentColor(options.color, cal.get(0));
						setNewColor(options.color, cal.get(0));
						//Append to body if flat=false, else show in place
						if (options.flat) {
							cal.appendTo(this).show();
							cal.css({
								position: 'relative',
								display: 'block'
							});
						} else {
							cal.appendTo(document.body);
							$(this).on(options.showEvent, show);
							cal.css({
								position:'absolute'
							});
						}
					}
				});
			},
			//Shows the picker
			showPicker: function() {
				return this.each( function () {
					if ($(this).data('colpickId')) {
						show.apply(this);
					}
				});
			},
			//Hides the picker
			hidePicker: function() {
				return this.each( function () {
					if ($(this).data('colpickId')) {
						$('#' + $(this).data('colpickId')).hide();
					}
				});
			},
			//Sets a color as new and current (default)
			setColor: function(col, setCurrent) {
				setCurrent = (typeof setCurrent === "undefined") ? 1 : setCurrent;
				if (typeof col == 'string') {
					col = hexToHsb(col);
				} else if (col.r != undefined && col.g != undefined && col.b != undefined) {
					col = rgbToHsb(col);
				} else if (col.h != undefined && col.s != undefined && col.b != undefined) {
					col = fixHSB(col);
				} else {
					return this;
				}
				return this.each(function(){
					if ($(this).data('colpickId')) {
						var cal = $('#' + $(this).data('colpickId'));
						cal.data('colpick').color = col;
						cal.data('colpick').origColor = col;
						fillRGBFields(col, cal.get(0));
						fillHSBFields(col, cal.get(0));
						fillHexFields(col, cal.get(0));
						setHue(col, cal.get(0));
						setSelector(col, cal.get(0));
						
						setNewColor(col, cal.get(0));
						cal.data('colpick').onChange.apply(cal.parent(), [col, hsbToHex(col), hsbToRgb(col), cal.data('colpick').el, 1]);
						if(setCurrent) {
							setCurrentColor(col, cal.get(0));
						}
					}
				});
			}
		};
	}();
	//Color space convertions
	var hexToRgb = function (hex) {
		var hex = parseInt(((hex.indexOf('#') > -1) ? hex.substring(1) : hex), 16);
		return {r: hex >> 16, g: (hex & 0x00FF00) >> 8, b: (hex & 0x0000FF)};
	};
	var hexToHsb = function (hex) {
		return rgbToHsb(hexToRgb(hex));
	};
	var rgbToHsb = function (rgb) {
		var hsb = {h: 0, s: 0, b: 0};
		var min = Math.min(rgb.r, rgb.g, rgb.b);
		var max = Math.max(rgb.r, rgb.g, rgb.b);
		var delta = max - min;
		hsb.b = max;
		hsb.s = max != 0 ? 255 * delta / max : 0;
		if (hsb.s != 0) {
			if (rgb.r == max) hsb.h = (rgb.g - rgb.b) / delta;
			else if (rgb.g == max) hsb.h = 2 + (rgb.b - rgb.r) / delta;
			else hsb.h = 4 + (rgb.r - rgb.g) / delta;
		} else hsb.h = -1;
		hsb.h *= 60;
		if (hsb.h < 0) hsb.h += 360;
		hsb.s *= 100/255;
		hsb.b *= 100/255;
		return hsb;
	};
	var hsbToRgb = function (hsb) {
		var rgb = {};
		var h = hsb.h;
		var s = hsb.s*255/100;
		var v = hsb.b*255/100;
		if(s == 0) {
			rgb.r = rgb.g = rgb.b = v;
		} else {
			var t1 = v;
			var t2 = (255-s)*v/255;
			var t3 = (t1-t2)*(h%60)/60;
			if(h==360) h = 0;
			if(h<60) {rgb.r=t1;	rgb.b=t2; rgb.g=t2+t3}
			else if(h<120) {rgb.g=t1; rgb.b=t2;	rgb.r=t1-t3}
			else if(h<180) {rgb.g=t1; rgb.r=t2;	rgb.b=t2+t3}
			else if(h<240) {rgb.b=t1; rgb.r=t2;	rgb.g=t1-t3}
			else if(h<300) {rgb.b=t1; rgb.g=t2;	rgb.r=t2+t3}
			else if(h<360) {rgb.r=t1; rgb.g=t2;	rgb.b=t1-t3}
			else {rgb.r=0; rgb.g=0;	rgb.b=0}
		}
		return {r:Math.round(rgb.r), g:Math.round(rgb.g), b:Math.round(rgb.b)};
	};
	var rgbToHex = function (rgb) {
		var hex = [
			rgb.r.toString(16),
			rgb.g.toString(16),
			rgb.b.toString(16)
		];
		$.each(hex, function (nr, val) {
			if (val.length == 1) {
				hex[nr] = '0' + val;
			}
		});
		return hex.join('');
	};
	var hsbToHex = function (hsb) {
		return rgbToHex(hsbToRgb(hsb));
	};
	$.fn.extend({
		colpick: colpick.init,
		colpickHide: colpick.hidePicker,
		colpickShow: colpick.showPicker,
		colpickSetColor: colpick.setColor
	});
	$.extend({
		colpick:{ 
			rgbToHex: rgbToHex,
			rgbToHsb: rgbToHsb,
			hsbToHex: hsbToHex,
			hsbToRgb: hsbToRgb,
			hexToHsb: hexToHsb,
			hexToRgb: hexToRgb
		}
	});
})(jQuery);


},{}],"/home/ubuntu/staging/apps/build/js/applab/designElements/BooleanPropertyRow.jsx":[function(require,module,exports){
var rowStyle = require('./rowStyle');

var BooleanPropertyRow = React.createClass({displayName: "BooleanPropertyRow",
  propTypes: {
    initialValue: React.PropTypes.bool.isRequired,
    handleChange: React.PropTypes.func
  },

  getInitialState: function () {
    return {
      isChecked: this.props.initialValue
    };
  },

  handleClick: function () {
    var checked = !this.state.isChecked;
    this.props.handleChange(checked);
    this.setState({isChecked: checked});
  },

  render: function () {
    var classes = 'custom-checkbox fa';
    if (this.state.isChecked) {
      classes += ' fa-check-square-o';
    } else {
      classes += ' fa-square-o';
    }

    var style = {
      width: 20,
      height: 20,
      fontSize: 20
    };

    return (
      React.createElement("div", {style: rowStyle.container}, 
        React.createElement("div", {style: rowStyle.description}, this.props.desc), 
        React.createElement("div", null, 
          React.createElement("div", {
            className: classes, 
            style: style, 
            onClick: this.handleClick})
        )
      )
    );
  }
});

module.exports = BooleanPropertyRow;


},{"./rowStyle":"/home/ubuntu/staging/apps/build/js/applab/designElements/rowStyle.js"}],"/home/ubuntu/staging/apps/build/js/applab/designElements/rowStyle.js":[function(require,module,exports){
module.exports.input = {
  display: 'inline-block',
  height: 20,
  padding: '4px 6px',
  marginBottom: 0,
  marginLeft: 0,
  fontSize: 14,
  lineHeight: '20px',
  color: '#5b6770',
  WebkitBorderRadius: 4,
  MozBorderRadius: 4,
  borderRadius: 4,
  border: '1px solid #949CA2',
  verticalAlign: 'middle'
};

module.exports.container = {
  paddingLeft: 20,
  marginBottom: 8
};

module.exports.maxWidth = {
  maxWidth: 245
};

module.exports.description = {
  paddingLeft: 2
};


},{}],"/home/ubuntu/staging/apps/build/js/applab/DebugArea.js":[function(require,module,exports){
/* jshint
 funcscope: true,
 newcap: true,
 nonew: true,
 shadow: false,
 unused: true,

 maxlen: 90,
 maxparams: 3,
 maxstatements: 200
 */

var applabMsg = require('./locale');
var dom = require('../dom');
var utils = require('../utils');

/**
 * Creates the debug area controller and configures it to operate on the given
 * elements.
 *
 * @param {HTMLDivElement} debugAreaRoot
 * @param {HTMLDivElement} codeTextboxRoot
 * @constructor
 */
var DebugArea = module.exports = function (debugAreaRoot, codeTextboxRoot) {
  if (!debugAreaRoot || !codeTextboxRoot) {
    throw new Error("debugAreaRoot and codeTextboxRoot are required");
  }

  /**
   * @type {jQuery}
   * @private
   */
  this.rootDiv_ = $(debugAreaRoot);

  /**
   * @type {jQuery}
   * @private
   */
  this.codeTextbox_ = $(codeTextboxRoot);

  /**
   * @type {boolean}
   * @private
   */
  this.isOpen_ = true;

  /**
   * @type {number}
   * @private
   */
  this.lastOpenHeight_ = this.rootDiv_.height();

  DebugArea.prototype.bindHandlersForDebugCommandsHeader.call(this);
};

/**
 * Binds mouseover, mouseout, click and touch handlers for the debug commands
 * header div.
 */
DebugArea.prototype.bindHandlersForDebugCommandsHeader = function () {
  var toggleDebugIcon = this.rootDiv_.find('#show-hide-debug-icon');
  dom.addClickTouchEvent(toggleDebugIcon[0], DebugArea.prototype.slideToggle.bind(this));
};

/** @returns {boolean} */
DebugArea.prototype.isOpen = function () {
  return this.isOpen_;
};

/** @returns {boolean} */
DebugArea.prototype.isShut = function () {
  return !this.isOpen_;
};

/**
 * Open/close the debug area to the reverse of its current state, using no
 * animation.
 */
DebugArea.snapToggle = function () {
  if (this.isOpen_) {
    this.snapShut();
  } else {
    this.snapOpen();
  }
};

DebugArea.prototype.snapOpen = function () {
  this.isOpen_ = true;
  this.setContentsVisible(true);
  this.setIconPointingDown(true);
  this.setHeight(this.lastOpenHeight_);

  // Set the 'clear' button visible
  this.rootDiv_.find('#clear-console-header')
      .css('opacity', 1)
      .css('visibility', 'visible');
};

DebugArea.prototype.snapShut = function () {
  this.isOpen_ = false;
  this.lastOpenHeight_ = this.rootDiv_.height();
  this.setContentsVisible(false);
  this.setIconPointingDown(false);
  this.setHeight(this.getHeightWhenClosed());

  // Set the 'clear' button hidden (not display:none, it should take up space)
  this.rootDiv_.find('#clear-console-header')
      .css('opacity', 0)
      .css('visibility', 'hidden');
};

/**
 * Open/close the debug area to the reverse of its current state, using a
 * slide animation.
 */
DebugArea.prototype.slideToggle = function () {
  if (this.isOpen_) {
    this.slideShut();
  } else {
    this.slideOpen();
  }
};

DebugArea.prototype.slideOpen = function () {
  this.isOpen_ = true;
  this.setContentsVisible(true);

  // Manually remove hover effect at start and end of animation to get *close*
  // to the correct effect.
  this.rootDiv_.animate({
    height: this.lastOpenHeight_
  },{
    complete: function () {
      this.setIconPointingDown(true);
    }.bind(this)
  });

  // Animate the bottom of the workspace at the same time
  this.codeTextbox_.animate({
    bottom: this.lastOpenHeight_
  },{
    step: utils.fireResizeEvent
  });

  // Animate the 'clear' button appearing at the same time
  var clearButton = this.rootDiv_.find('#clear-console-header');
  clearButton.css('visibility', 'visible');
  clearButton.animate({
    opacity: 1.0
  });
};

DebugArea.prototype.slideShut = function () {
  this.isOpen_ = false;
  this.lastOpenHeight_ = this.rootDiv_.height();

  // We will leave the header and resize bar visible, so together they
  // constitute our height when closed.
  var closedHeight = this.getHeightWhenClosed();
  // Manually remove hover effect at start and end of animation to get *close*
  // to the correct effect.
  this.rootDiv_.animate({
    height: closedHeight
  },{
    complete: function () {
      this.setContentsVisible(false);
      this.setIconPointingDown(false);
    }.bind(this)
  });

  // Animate the bottom of the workspace at the same time
  this.codeTextbox_.animate({
    bottom: closedHeight
  },{
    step: utils.fireResizeEvent,
    complete: utils.fireResizeEvent
  });

  // Animate the 'clear' button vanishing at the same time
  var clearButton = this.rootDiv_.find('#clear-console-header');
  clearButton.animate({
    opacity: 0.0
  },{
    complete: function () {
      clearButton.css('visibility', 'hidden');
    }
  });
};

DebugArea.prototype.setContentsVisible = function (isVisible) {
  this.rootDiv_.find('#debug-commands').toggle(isVisible);
  this.rootDiv_.find('#debug-console').toggle(isVisible);
};

DebugArea.prototype.setIconPointingDown = function (isPointingDown) {
  var commandsHeader = this.rootDiv_.find('#debug-commands-header');

  var icon = this.rootDiv_.find('#show-hide-debug-icon');
  icon.toggleClass('fa-chevron-circle-up', !isPointingDown);
  icon.toggleClass('fa-chevron-circle-down', isPointingDown);

  var headerText = commandsHeader.find('.header-text');
  headerText.text(isPointingDown ? applabMsg.debugCommandsHeaderWhenOpen() :
      applabMsg.debugCommandsHeaderWhenClosed());

};

DebugArea.prototype.setHeight = function (newHeightInPixels) {
  this.rootDiv_.height(newHeightInPixels);
  this.codeTextbox_.css('bottom', newHeightInPixels);
  utils.fireResizeEvent();
};

DebugArea.prototype.getHeightWhenClosed = function () {
  return this.rootDiv_.find('#debug-area-header').height() +
      this.rootDiv_.find('#debugResizeBar').height();
};


},{"../dom":"/home/ubuntu/staging/apps/build/js/dom.js","../utils":"/home/ubuntu/staging/apps/build/js/utils.js","./locale":"/home/ubuntu/staging/apps/build/js/applab/locale.js"}],"/home/ubuntu/staging/apps/build/js/applab/locale.js":[function(require,module,exports){
// locale for applab

module.exports = window.blockly.applab_locale;


},{}],"/home/ubuntu/staging/apps/build/js/applab/ChartApi.js":[function(require,module,exports){
/**
 * @file Core implementation of Applab commands related to the Chart design element.
 *
 * For now, uses Google charts.
 * @see {GoogleChart}
 */
/* jshint
 funcscope: true,
 newcap: true,
 nonew: true,
 shadow: false,
 unused: true,
 eqeqeq: true,

 maxlen: 90,
 maxparams: 6,
 maxstatements: 200
 */
'use strict';

var AppStorage = require('./appStorage');
var Promise = require('es6-promise').Promise;
var GoogleChart = require('./GoogleChart');

/**
 * API for requesting/generating charts in Applab.
 *
 * @constructor
 * @param {Document} [docContext] - default is 'document'
 * @param [appStorage] - default is AppStorage
 */
var ChartApi = module.exports = function (docContext, appStorage) {
  this.document_ = docContext || document;
  this.appStorage_ = appStorage || AppStorage;

  /**
   * List of all warnings generated while performing operations through this
   * API instance.
   * @type {Error[]}
   */
  this.warnings = [];
};

/**
 * Record a runtime warning.
 * @param {string} warningMessage
 */
ChartApi.prototype.warn = function (warningMessage) {
  this.warnings.push(new Error(warningMessage));
};

/**
 * Add warnings from an array to the ChartApi instance's warnings array.
 * @param {Error[]} newWarnings
 * @private
 */
ChartApi.prototype.mergeWarnings_ = function (newWarnings) {
  Array.prototype.push.apply(this.warnings, newWarnings);
};

// When adding a new type, provide an entry in the string enum (for clean code)
// and an entry in the TypeNameToType map (allows us to easily remap different
// implementations to the same type name).

/** @enum {string} */
ChartApi.ChartType = {
  BAR: 'bar',
  PIE: 'pie',
  LINE: 'line',
  SCATTER: 'scatter'
};

/** @type {Object.<string, GoogleChart>} */
ChartApi.TypeNameToType = {
  'bar': GoogleChart.MaterialBarChart,
  'pie': GoogleChart.PieChart,
  'line': GoogleChart.MaterialLineChart,
  'scatter': GoogleChart.MaterialScatterChart
};

/**
 * Get an array of all the chart type strings.
 * @returns {string[]}
 */
ChartApi.getChartTypeNames = function () {
  return Object.getOwnPropertyNames(ChartApi.TypeNameToType);
};

/**
 * @param {ChartType} chartType
 * @returns {boolean} TRUE if the given type is in the known list of chart types.
 */
ChartApi.supportsType = function (chartType) {
  return ChartApi.getChartTypeNames().indexOf(chartType.toLowerCase()) !== -1;
};

/**
 * @return {string[]} a quoted, sorted list of chart types for use in the
 *         Droplet parameter dropdown.
 */
ChartApi.getChartTypeDropdown = function () {
  return ChartApi.getChartTypeNames().map(quote).sort();
};

function quote(str) {
  return '"' + str + '"';
}

/**
 * Render a chart into an Applab chart element.
 * @param {string} chartId - ID of the destination chart element.
 * @param {ChartType} chartType - Desired chart type.
 * @param {Object[]} chartData - Data to populate the chart.
 * @param {Object} options - passed through to the API.
 * @returns {Promise} which resolves when the chart has been rendered, or
 *          rejects if there are any problems along the way.
 */
ChartApi.prototype.drawChart = function (chartId, chartType, chartData, options) {
  try {
    var chart = this.createChart_(chartId, chartType);
    var columns = ChartApi.inferColumnsFromRawData(chartData);
    return chart.drawChart(chartData, columns, options).then(function () {
      this.mergeWarnings_(chart.warnings);
    }.bind(this));
  } catch (e) {
    return Promise.reject(e);
  }
};

/**
 * Render a chart into an Applab chart element using data from an AppStorage
 * API table.
 * @param {string} chartId - ID of the destination chart element.
 * @param {ChartType} chartType - Desired chart type.
 * @param {string} tableName - AppStorage API table name to source data from
 *                 for the chart.
 * @param {string[]} columns - Columns to use from the table data for the chart,
 *        in order (required order dependent on chart type).
 * @param {Object} options - passed through to the API.
 * @returns {Promise} resolves when the chart has been rendered, or rejects if
 *          there are any problems along the way.
 */
ChartApi.prototype.drawChartFromRecords = function (chartId, chartType,
    tableName, columns, options) {
  try {
    var chart = this.createChart_(chartId, chartType);
    return Promise.all([
      chart.loadDependencies(),
      this.fetchTableData_(tableName)
    ]).then(function (results) {
      var tableData = results[1];
      var columnsInTable = ChartApi.inferColumnsFromRawData(tableData);
      columns = this.guessColumnsIfNecessary(columns, columnsInTable, tableName);
      this.warnIfColumnsNotFound(columns, columnsInTable, tableName);
      return chart.drawChart(tableData, columns, options);
    }.bind(this)).then(function () {
      this.mergeWarnings_(chart.warnings);
    }.bind(this));
  } catch (e) {
    return Promise.reject(e);
  }
};

/**
 * Generates a warning for every requested column that is not found in the
 * columnsInTable collection.
 * @param {string[]} requestedColumns
 * @param {string[]} columnsInTable
 * @param {string} tableName
 */
ChartApi.prototype.warnIfColumnsNotFound = function (requestedColumns,
    columnsInTable, tableName) {
  // Check that specified columns exist in raw data
  requestedColumns.forEach(function (columnName) {
    if (columnsInTable.indexOf(columnName) === -1) {
      this.warn('Column ' + quote(columnName) + ' not found in table ' +
          quote(tableName) + '.');
    }
  }, this);
};

/**
 * If enough columns are requested, this function just returns the requested
 * columns.  Otherwise it guesses two columns from the columnsInTable if it
 * can, generating appropriate warnings.  If there are not enough columns in
 * the table either, throws an error since we cannot proceed.
 * @param {string[]} requestedColumns
 * @param {string[]} columnsInTable
 * @param {string} tableName
 * @returns {string[]}
 * @throws {Error} if not enough columns and unable to guess columns.
 */
ChartApi.prototype.guessColumnsIfNecessary = function (requestedColumns,
    columnsInTable, tableName) {
  if (!requestedColumns || requestedColumns.length < 2) {
    this.warn('Not enough columns specified; expected at least 2.');

    if (columnsInTable.length === 0) {
      throw new Error('No columns found in table ' + quote(tableName) +
          '. Charts require at least 2 columns.');

    } else if (columnsInTable.length < 2) {
      throw new Error('Only found ' + columnsInTable.length +
          ' columns in table ' + quote(tableName) + ': ' +
          columnsInTable.map(quote).join(', ') +
          '. Charts require at least 2 columns.');

    } else {
      // Take our best guess and continue
      requestedColumns = columnsInTable.slice(0, 2);
      this.warn('Using columns ' + requestedColumns.map(quote).join(' and ') +
          '.  Possible columns for table ' + quote(tableName) +
          ' are ' + columnsInTable.map(quote).join(', ') + '.');
    }
  }
  return requestedColumns;
};

/**
 * Create a chart object of the requested type, for the requested target element.
 * @param {string} elementId
 * @param {string} typeName
 * @returns {GoogleChart}
 * @throws {Error} if target element or chart type are not found.
 * @private
 */
ChartApi.prototype.createChart_ = function (elementId, typeName) {
  var targetElement = this.getTargetElement_(elementId);
  var FoundType = ChartApi.getChartTypeByName_(typeName);
  return new FoundType(targetElement);
};

/**
 * Get the DOM Element with the given ID.
 * @param {string} elementId
 * @returns {Element}
 * @throws {Error} if the requested element is not found, or is not a div.
 * @private
 */
ChartApi.prototype.getTargetElement_ = function (elementId) {
  var targetElement = this.document_.getElementById(elementId);
  if (!targetElement || 'div' !== targetElement.tagName.toLowerCase()) {
    throw new Error('Unable to render chart into element "' + elementId + '".');
  }
  return targetElement;
};

/**
 * Get the constructor function for the requested chart type.
 * @param {string} typeName
 * @returns {GoogleChart}
 * @throws {Error} if requested type is not found/supported.
 * @private
 */
ChartApi.getChartTypeByName_= function (typeName) {
  if (typeof typeName !== 'string') {
    throw new Error('Unknown chart type.');
  }

  var type = ChartApi.TypeNameToType[typeName.toLowerCase()];
  if (!type) {
    throw new Error('Unsupported chart type "' + typeName + '".');
  }

  return type;
};

/**
 * Get all data from the requested table.
 * Wraps AppStorage.readRecords in an ES6 Promise interface.
 * @param {string} tableName
 * @returns {Promise}
 * @private
 */
ChartApi.prototype.fetchTableData_ = function (tableName) {
  return new Promise(function (resolve, reject) {
    this.appStorage_.readRecords(tableName, {}, resolve, function (errorMsg) {
      reject(new Error(errorMsg));
    });
  }.bind(this));
};

/**
 * @param {Object[]} rawData
 * @returns {string[]} column names found as keys in the row objects in the
 *          rawData, (hopefully) in the order they were defined in the row
 *          objects.
 */
ChartApi.inferColumnsFromRawData = function (rawData) {
  return Object.getOwnPropertyNames(rawData.reduce(function (memo, row) {
    Object.getOwnPropertyNames(row).forEach(function (key) {
      memo[key] = true;
    });
    return memo;
  }, {}));
};


},{"./GoogleChart":"/home/ubuntu/staging/apps/build/js/applab/GoogleChart.js","./appStorage":"/home/ubuntu/staging/apps/build/js/applab/appStorage.js","es6-promise":"/home/ubuntu/staging/apps/node_modules/es6-promise/dist/es6-promise.js"}],"/home/ubuntu/staging/apps/build/js/applab/appStorage.js":[function(require,module,exports){
'use strict';

/* global Applab */

/**
 * Namespace for app storage.
 */
var AppStorage = module.exports;

/**
 * Reads the value associated with the key, accessible to all users of the app.
 * @param {string} key The name of the key.
 * @param {function(Object)} onSuccess Function to call on success with the
       value retrieved from storage.
 * @param {function(string)} onError Function to call on error with error msg.
 */
AppStorage.getKeyValue = function(key, onSuccess, onError) {
  var req = new XMLHttpRequest();
  req.onreadystatechange = handleGetKeyValue.bind(req, onSuccess, onError);
  var url = '/v3/shared-properties/' + Applab.channelId + '/' + key;
  req.open('GET', url, true);
  req.send();
};

var handleGetKeyValue = function(onSuccess, onError) {
  var done = XMLHttpRequest.DONE || 4;
  if (this.readyState !== done) {
    return;
  }
  if (this.status === 404) {
    onSuccess(undefined);
    return;
  }
  if (this.status < 200 || this.status >= 300) {
    onError('error reading value: unexpected http status ' + this.status);
    return;
  }
  var value = JSON.parse(this.responseText);
  onSuccess(value);
};

/**
 * Saves the value associated with the key, accessible to all users of the app.
 * @param {string} key The name of the key.
 * @param {Object} value The value to associate with the key.
 * @param {function()} onSuccess Function to call on success.
 * @param {function(string)} onError Function to call on error with error msg.
 */
AppStorage.setKeyValue = function(key, value, onSuccess, onError) {
  var req = new XMLHttpRequest();
  req.onreadystatechange = handleSetKeyValue.bind(req, onSuccess, onError);
  var url = '/v3/shared-properties/' + Applab.channelId + '/' + key;
  req.open('POST', url, true);
  req.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
  req.send(JSON.stringify(value));
};

var handleSetKeyValue = function(onSuccess, onError) {
  var done = XMLHttpRequest.DONE || 4;
  if (this.readyState !== done) {
    return;
  }
  if (this.status < 200 || this.status >= 300) {
    onError('error writing value: unexpected http status ' + this.status);
    return;
  }
  onSuccess();
};

/**
 * Creates a new record in the specified table, accessible to all users.
 * @param {string} tableName The name of the table to read from.
 * @param {Object} record Object containing other properties to store
 *     on the record.
 * @param {function(Object)} onSuccess Function to call with the new record.
 * @param {function(string)} onError Function to call with an error message
 *    in case of failure.
 */
AppStorage.createRecord = function(tableName, record, onSuccess, onError) {
  if (!tableName) {
    onError('error creating record: missing required parameter "tableName"');
    return;
  }
  if (record.id) {
    onError('error creating record: record must not have an "id" property');
    return;
  }
  var req = new XMLHttpRequest();
  req.onreadystatechange = handleCreateRecord.bind(req, onSuccess, onError);
  var url = '/v3/shared-tables/' + Applab.channelId + '/' + tableName;
  req.open('POST', url, true);
  req.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
  req.send(JSON.stringify(record));
};

var handleCreateRecord = function(onSuccess, onError) {
  var done = XMLHttpRequest.DONE || 4;
  if (this.readyState !== done) {
    return;
  }
  if (this.status < 200 || this.status >= 300) {
    onError('error creating record: unexpected http status ' + this.status);
    return;
  }
  var record = JSON.parse(this.responseText);
  onSuccess(record);
};

/**
 * Reads records which match the searchParams specified by the user,
 * and passes them to onSuccess.
 * @param {string} tableName The name of the table to read from.
 * @param {string} searchParams.id Optional id of record to read.
 * @param {Object} searchParams Other search criteria. Only records
 *     whose contents match all criteria will be returned.
 * @param {function(Array)} onSuccess Function to call with an array of record
       objects.
 * @param {function(string)} onError Function to call with an error message
 *     in case of failure.
 */
AppStorage.readRecords = function(tableName, searchParams, onSuccess, onError) {
  if (!tableName) {
    onError('error reading records: missing required parameter "tableName"');
    return;
  }
  var req = new XMLHttpRequest();
  req.onreadystatechange = handleReadRecords.bind(req,
      searchParams, onSuccess, onError);
  var url = '/v3/shared-tables/' + Applab.channelId + '/' + tableName;
  req.open('GET', url, true);
  req.send();

};

var handleReadRecords = function(searchParams, onSuccess, onError) {
  var done = XMLHttpRequest.DONE || 4;
  if (this.readyState !== done) {
    return;
  }
  if (this.status < 200 || this.status >= 300) {
    onError('error reading records: unexpected http status ' + this.status);
    return;
  }
  var records = JSON.parse(this.responseText);
  records = records.filter(function(record) {
    for (var prop in searchParams) {
      if (record[prop] !== searchParams[prop]) {
        return false;
      }
    }
    return true;
  });
  onSuccess(records);
};

/**
 * Updates a record in a table, accessible to all users.
 * @param {string} tableName The name of the table to update.
 * @param {string} record.id The id of the row to update.
 * @param {Object} record Object containing other properites to update
 *     on the record.
 * @param {function()} onSuccess Function to call on success.
 * @param {function(string)} onError Function to call with an error message
 *    in case of failure.
 */
AppStorage.updateRecord = function(tableName, record, onSuccess, onError) {
  if (!tableName) {
    onError('error updating record: missing required parameter "tableName"');
    return;
  }
  var recordId = record.id;
  if (!recordId) {
    onError('error updating record: missing required property "id"');
    return;
  }
  var req = new XMLHttpRequest();
  req.onreadystatechange = handleUpdateRecord.bind(req, tableName, record, onSuccess, onError);
  var url = '/v3/shared-tables/' + Applab.channelId + '/' +
      tableName + '/' + recordId;
  req.open('POST', url, true);
  req.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
  req.send(JSON.stringify(record));
};

var handleUpdateRecord = function(tableName, record, onSuccess, onError) {
  var done = XMLHttpRequest.DONE || 4;
  if (this.readyState !== done) {
    return;
  }
  if (this.status === 404) {
    onError('error updating record: could not find record id ' + record.id +
            ' in table ' + tableName);
    return;
  }
  if (this.status < 200 || this.status >= 300) {
    onError('error updating record: unexpected http status ' + this.status);
    return;
  }
  onSuccess(record);
};

/**
 * Deletes a record from the specified table.
 * @param {string} tableName The name of the table to delete from.
 * @param {string} record.id The id of the record to delete.
 * @param {Object} record Object whose other properties are ignored.
 * @param {function()} onSuccess Function to call on success.
 * @param {function(string)} onError Function to call with an error message
 *    in case of failure.
 */
AppStorage.deleteRecord = function(tableName, record, onSuccess, onError) {
  if (!tableName) {
    onError('error deleting record: missing required parameter "tableName"');
    return;
  }
  var recordId = record.id;
  if (!recordId) {
    onError('error deleting record: missing required property "id"');
    return;
  }
  var req = new XMLHttpRequest();
  req.onreadystatechange = handleDeleteRecord.bind(req, tableName, record, onSuccess, onError);
  var url = '/v3/shared-tables/' + Applab.channelId + '/' +
      tableName + '/' + recordId + '/delete';
  req.open('POST', url, true);
  req.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
  req.send(JSON.stringify(record));
};

var handleDeleteRecord = function(tableName, record, onSuccess, onError) {
  var done = XMLHttpRequest.DONE || 4;
  if (this.readyState !== done) {
    return;
  }
  if (this.status === 404) {
    onError('error deleting record: could not find record id ' + record.id +
        ' in table ' + tableName);
    return;
  }
  if (this.status < 200 || this.status >= 300) {
    onError('error deleting record: unexpected http status ' + this.status);
    return;
  }
  onSuccess();
};

/**
 * Populates a channel with table data for one or more tables
 * @param {string} jsonData The json data that represents the tables in the format of:
 *   {
 *     "table_name": [{ "name": "Trevor", "age": 30 }, { "name": "Hadi", "age": 72}],
 *     "table_name2": [{ "city": "Seattle", "state": "WA" }, { "city": "Chicago", "state": "IL"}]
 *   }
 * @param {bool} overwrite Whether to overwrite a table if it already exists.
 * @param {function()} onSuccess Function to call on success.
 * @param {function(string)} onError Function to call with an error message
 *    in case of failure.
 */
AppStorage.populateTable = function (jsonData, overwrite, onSuccess, onError) {
  if (!jsonData || !jsonData.length) {
    return;
  }
  var req = new XMLHttpRequest();
  req.onreadystatechange = handlePopulateTable.bind(req, onSuccess, onError);
  var url = '/v3/shared-tables/' + Applab.channelId;
  if (overwrite) {
    url += "?overwrite=1";
  }
  req.open('POST', url, true);
  req.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
  req.send(jsonData);
};

var handlePopulateTable = function (onSuccess, onError) {
  var done = XMLHttpRequest.DONE || 4;
  if (this.readyState !== done) {
    return;
  }

  if (this.status != 200) {
    if (onError) {
      onError('error populating tables: unexpected http status ' + this.status);
    }
    return;
  }
  if (onSuccess) {
    onSuccess();
  }
};

/**
 * Populates the key/value store with initial data
 * @param {string} jsonData The json data that represents the tables in the format of:
 *   {
 *     "click_count": 5,
 *     "button_color": "blue"
 *   }
 * @param {bool} overwrite Whether to overwrite a table if it already exists.
 * @param {function()} onSuccess Function to call on success.
 * @param {function(string)} onError Function to call with an error message
 *    in case of failure.
 */
AppStorage.populateKeyValue = function (jsonData, overwrite, onSuccess, onError) {
  if (!jsonData || !jsonData.length) {
    return;
  }
  var req = new XMLHttpRequest();

  req.onreadystatechange = handlePopulateKeyValue.bind(req, onSuccess, onError);
  var url = '/v3/shared-properties/' + Applab.channelId;

  if (overwrite) {
    url += "?overwrite=1";
  }
  req.open('POST', url, true);
  req.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
  req.send(jsonData);
};

var handlePopulateKeyValue = function (onSuccess, onError) {
  var done = XMLHttpRequest.DONE || 4;
  if (this.readyState !== done) {
    return;
  }

  if (this.status != 200) {
    if (onError) {
      onError('error populating kv: unexpected http status ' + this.status);
    }
    return;
  }
  if (onSuccess) {
    onSuccess();
  }
};


},{}],"/home/ubuntu/staging/apps/build/js/applab/GoogleChart.js":[function(require,module,exports){
/**
 * @file Wrapper around Google Charts API chart-drawing features
 *
 * @see https://developers.google.com/chart/
 */
/* jshint
 funcscope: true,
 newcap: true,
 nonew: true,
 shadow: false,
 unused: true,
 eqeqeq: true,

 maxlen: 90,
 maxparams: 6,
 maxstatements: 200
 */
'use strict';
/* global google */

var Promise = require('es6-promise').Promise;
require('../utils');

/**
 * Abstract base type for Google Charts API charts.
 *
 * @example
 *   var chart = new PieChart(targetDiv);
 *   chart.drawChart(data, columns[, options]);
 *
 * May optionally call loadDependencies() step to facilitiate parallel async
 * loading with other resources.
 *
 * @param {Element} targetDiv
 * @constructor
 */
var GoogleChart = module.exports = function (targetDiv) {
  // Define this late so we can overwrite it in tests.
  if (!GoogleChart.lib) {
    GoogleChart.lib = google;
  }

  /** @private {Element} */
  this.targetDiv_ = targetDiv;

  /** @private {google.visualization.DataTable} */
  this.dataTable_ = null;

  /**
   * List of all warnings logged while performing operations with this chart
   * instance.
   * @type {Error[]}
   */
  this.warnings = [];
};

/**
 * Loads the required libraries for this particular chart type.
 * Safe to call multiple times - Google's loader caches dependencies.
 * @returns {Promise} that resolves when dependencies have been loaded.
 */
GoogleChart.prototype.loadDependencies = function () {
  return new Promise(function (resolve, reject) {
    try {
      GoogleChart.lib.load('visualization', '1', {
        packages: this.getDependencies(),
        callback: resolve
      });
    } catch (e) {
      // We catch and return a different error so that we don't surface Google
      // API errors to students.
      reject(new Error('Unable to load Charts API.  Please try again later.'));
    }
  }.bind(this));
};

/**
 * Renders the chart into the target container using the specified options.
 *
 *  @param {Object[]} rawData - data to display in chart, formatted as an array
 *        of objects where each object represents a row, and the object keys
 *        are column names.
 * @param {string[]} columnList - Ordered list of column names to use as source
 *        data for the chart.  Column names must match keys in rawData.
 * @param {Object} options - Plain options object that gets passed through to
 *        the Charts API.
 * @returns {Promise} that resolves when the chart has been rendered to the
 *          target container.
 */
GoogleChart.prototype.drawChart = function (rawData, columnList, options) {
  return this.loadDependencies().then(function () {
    this.verifyData_(rawData, columnList);
    var dataTable = GoogleChart.dataTableFromRowsAndColumns(rawData, columnList);
    return this.render_(dataTable, options);
  }.bind(this));
};

/**
 * Array of packages the chart needs to load to render.
 * @returns {string[]}
 */
GoogleChart.prototype.getDependencies = function () {
  return ['corechart'];
};

/**
 * Pushes the provided warning message into a collection of warnings for this
 * chart, which can be parsed and displayed later.
 * @param {string} warningMessage
 */
GoogleChart.prototype.warn = function (warningMessage) {
  this.warnings.push(new Error(warningMessage));
};

/**
 * Makes sure data looks okay, throws errors and logs warnings as appropriate.
 * @param {string[]} columns
 * @param {Object[]} data
 * @private
 */
GoogleChart.prototype.verifyData_ = function (data, columns) {
  // Warn when no rows are present
  if (data.length === 0) {
    this.warn('No data.');
  }

  // Error when not enough columns are provided
  if (columns.length < 2) {
    throw new Error('Not enough columns for chart; expected at least 2.');
  }

  // Warn on empty columns?
  columns.forEach(function (colName) {
    var exists = data.some(function (row) {
      return row[colName] !== undefined;
    });
    if (!exists) {
      this.warn('No data found for column "' + colName + '".');
    }
  }.bind(this));
};

/**
 * @param {Object[]} rows - Rows as POJOs with keys.
 * @param {string[]} columns - Column names which must correspond to keys
 *        in the row objects.
 * @return {google.visualization.DataTable}
 */
GoogleChart.dataTableFromRowsAndColumns = function (rows, columns) {
  var dataArray = rows.map(function (row) {
    return columns.map(function (key) {
      return row[key];
    });
  });
  return GoogleChart.lib.visualization.arrayToDataTable([columns].concat(dataArray));
};

/* jshint unused: false */
/**
 * Internal 'abstract' method that subclasses should use to implement the actual
 * rendering step.
 *
 * @param {google.visualzation.DataTable} dataTable
 * @param {Object} options
 * @returns {Promise}
 * @private
 */
GoogleChart.prototype.render_ = function (dataTable, options) {
  return Promise.reject(new Error('Rendering unimplemented for chart type.'));
};
/* jshint unused: true */

/**
 * Google Charts API Pie Chart
 *
 * @see https://developers.google.com/chart/interactive/docs/gallery/piechart
 *
 * @param {Element} targetDiv
 * @constructor
 * @extends GoogleChart
 */
var PieChart = function (targetDiv) {
  GoogleChart.call(this, targetDiv);
};
PieChart.inherits(GoogleChart);
GoogleChart.PieChart = PieChart;


PieChart.prototype.render_ = function (dataTable, options) {
  var apiChart = new GoogleChart.lib.visualization.PieChart(this.targetDiv_);
  apiChart.draw(dataTable, options);
  return Promise.resolve();
};

/**
 *
 * @param {string[]} columns
 * @param {Object[]} data
 * @private
 * @override
 */
PieChart.prototype.verifyData_ = function (data, columns) {
  PieChart.superPrototype.verifyData_.call(this, data, columns);

  if (columns.length > 2) {
    this.warn('Too many columns for pie chart; only using the first 2.');
  }
};

/**
 * Google Charts API Bar Chart
 *
 * @see https://developers.google.com/chart/interactive/docs/gallery/barchart
 *
 * @param {Element} targetDiv
 * @constructor
 * @extends GoogleChart
 */
var BarChart = function (targetDiv) {
  GoogleChart.call(this, targetDiv);
};
BarChart.inherits(GoogleChart);
GoogleChart.BarChart = BarChart;

/**
 * @param {google.visualization.DataTable} dataTable
 * @param {Object} options
 * @returns {Promise}
 * @private
 * @override
 */
BarChart.prototype.render_ = function (dataTable, options) {
  var apiChart = new GoogleChart.lib.visualization.BarChart(this.targetDiv_);
  apiChart.draw(dataTable, options);
  return Promise.resolve();
};

/**
 * Google Charts API Material Design Bar Chart
 *
 * @see https://developers.google.com/chart/interactive/docs/gallery
 *      /barchart#creating-material-bar-charts
 *
 * @param {Element} targetDiv
 * @constructor
 * @extends GoogleChart
 */
var MaterialBarChart = function (targetDiv) {
  GoogleChart.call(this, targetDiv);
};
MaterialBarChart.inherits(GoogleChart);
GoogleChart.MaterialBarChart = MaterialBarChart;

/**
 * @param {google.visualization.DataTable} dataTable
 * @param {Object} options
 * @returns {Promise}
 * @private
 * @override
 */
MaterialBarChart.prototype.render_ = function (dataTable, options) {
  var apiChart = new GoogleChart.lib.charts.Bar(this.targetDiv_);
  // Material charts have a built-in options converter for now.
  var convertedOptions = GoogleChart.lib.charts.Bar.convertOptions(options);
  apiChart.draw(dataTable, convertedOptions);
  return Promise.resolve();
};

/**
 * Array of packages the chart needs to load to render.
 * @returns {string[]}
 * @override
 */
MaterialBarChart.prototype.getDependencies = function () {
  return ['bar'];
};

/**
 * Google Charts API Line Chart
 *
 * @see https://developers.google.com/chart/interactive/docs/gallery/linechart
 *
 * @param {Element} targetDiv
 * @constructor
 * @extends GoogleChart
 */
var LineChart = function (targetDiv) {
  GoogleChart.call(this, targetDiv);
};
LineChart.inherits(GoogleChart);
GoogleChart.LineChart = LineChart;

/**
 * @param {google.visualization.DataTable} dataTable
 * @param {Object} options
 * @returns {Promise}
 * @private
 * @override
 */
LineChart.prototype.render_ = function (dataTable, options) {
  var apiChart = new GoogleChart.lib.visualization.LineChart(this.targetDiv_);
  apiChart.draw(dataTable, options);
  return Promise.resolve();
};

/**
 * Google Charts API Material Design Line Chart
 *
 * @see https://developers.google.com/chart/interactive/docs/gallery
 *      /linechart#creating-material-line-charts
 *
 * @param {Element} targetDiv
 * @constructor
 * @extends GoogleChart
 */
var MaterialLineChart = function (targetDiv) {
  GoogleChart.call(this, targetDiv);
};
MaterialLineChart.inherits(GoogleChart);
GoogleChart.MaterialLineChart = MaterialLineChart;

/**
 * @param {google.visualization.DataTable} dataTable
 * @param {Object} options
 * @returns {Promise}
 * @private
 * @override
 */
MaterialLineChart.prototype.render_ = function (dataTable, options) {
  var apiChart = new GoogleChart.lib.charts.Line(this.targetDiv_);
  // Material charts have a built-in options converter for now.
  var convertedOptions = GoogleChart.lib.charts.Line.convertOptions(options);
  apiChart.draw(dataTable, convertedOptions);
  return Promise.resolve();
};

/**
 * Array of packages the chart needs to load to render.
 * @returns {string[]}
 * @override
 */
MaterialLineChart.prototype.getDependencies = function () {
  return ['line'];
};


/**
 * Google Charts API Scatter Chart
 *
 * @see https://developers.google.com/chart/interactive/docs/gallery/scatterchart
 *
 * @param {Element} targetDiv
 * @constructor
 * @extends GoogleChart
 */
var ScatterChart = function (targetDiv) {
  GoogleChart.call(this, targetDiv);
};
ScatterChart.inherits(GoogleChart);
GoogleChart.ScatterChart = ScatterChart;

/**
 * @param {google.visualization.DataTable} dataTable
 * @param {Object} options
 * @returns {Promise}
 * @private
 * @override
 */
ScatterChart.prototype.render_ = function (dataTable, options) {
  var apiChart = new GoogleChart.lib.visualization.ScatterChart(this.targetDiv_);
  apiChart.draw(dataTable, options);
  return Promise.resolve();
};

/**
 * Google Charts API Material Design Scatter Chart
 *
 * @see https://developers.google.com/chart/interactive/docs/gallery
 *      /scatterchart#creating-material-scatter-charts
 *
 * @param {Element} targetDiv
 * @constructor
 * @extends GoogleChart
 */
var MaterialScatterChart = function (targetDiv) {
  GoogleChart.call(this, targetDiv);
};
MaterialScatterChart.inherits(GoogleChart);
GoogleChart.MaterialScatterChart = MaterialScatterChart;

/**
 * @param {google.visualization.DataTable} dataTable
 * @param {Object} options
 * @returns {Promise}
 * @private
 * @override
 */
MaterialScatterChart.prototype.render_ = function (dataTable, options) {
  var apiChart = new GoogleChart.lib.charts.Scatter(this.targetDiv_);
  // Material charts have a built-in options converter for now.
  var convertedOptions = GoogleChart.lib.charts.Scatter.convertOptions(options);
  apiChart.draw(dataTable, convertedOptions);
  return Promise.resolve();
};

/**
 * Array of packages the chart needs to load to render.
 * @returns {string[]}
 * @override
 */
MaterialScatterChart.prototype.getDependencies = function () {
  return ['scatter'];
};


},{"../utils":"/home/ubuntu/staging/apps/build/js/utils.js","es6-promise":"/home/ubuntu/staging/apps/node_modules/es6-promise/dist/es6-promise.js"}],"/home/ubuntu/staging/apps/node_modules/es6-promise/dist/es6-promise.js":[function(require,module,exports){
(function (process,global){
/*!
 * @overview es6-promise - a tiny implementation of Promises/A+.
 * @copyright Copyright (c) 2014 Yehuda Katz, Tom Dale, Stefan Penner and contributors (Conversion to ES6 API by Jake Archibald)
 * @license   Licensed under MIT license
 *            See https://raw.githubusercontent.com/jakearchibald/es6-promise/master/LICENSE
 * @version   3.0.2
 */

(function() {
    "use strict";
    function lib$es6$promise$utils$$objectOrFunction(x) {
      return typeof x === 'function' || (typeof x === 'object' && x !== null);
    }

    function lib$es6$promise$utils$$isFunction(x) {
      return typeof x === 'function';
    }

    function lib$es6$promise$utils$$isMaybeThenable(x) {
      return typeof x === 'object' && x !== null;
    }

    var lib$es6$promise$utils$$_isArray;
    if (!Array.isArray) {
      lib$es6$promise$utils$$_isArray = function (x) {
        return Object.prototype.toString.call(x) === '[object Array]';
      };
    } else {
      lib$es6$promise$utils$$_isArray = Array.isArray;
    }

    var lib$es6$promise$utils$$isArray = lib$es6$promise$utils$$_isArray;
    var lib$es6$promise$asap$$len = 0;
    var lib$es6$promise$asap$$toString = {}.toString;
    var lib$es6$promise$asap$$vertxNext;
    var lib$es6$promise$asap$$customSchedulerFn;

    var lib$es6$promise$asap$$asap = function asap(callback, arg) {
      lib$es6$promise$asap$$queue[lib$es6$promise$asap$$len] = callback;
      lib$es6$promise$asap$$queue[lib$es6$promise$asap$$len + 1] = arg;
      lib$es6$promise$asap$$len += 2;
      if (lib$es6$promise$asap$$len === 2) {
        // If len is 2, that means that we need to schedule an async flush.
        // If additional callbacks are queued before the queue is flushed, they
        // will be processed by this flush that we are scheduling.
        if (lib$es6$promise$asap$$customSchedulerFn) {
          lib$es6$promise$asap$$customSchedulerFn(lib$es6$promise$asap$$flush);
        } else {
          lib$es6$promise$asap$$scheduleFlush();
        }
      }
    }

    function lib$es6$promise$asap$$setScheduler(scheduleFn) {
      lib$es6$promise$asap$$customSchedulerFn = scheduleFn;
    }

    function lib$es6$promise$asap$$setAsap(asapFn) {
      lib$es6$promise$asap$$asap = asapFn;
    }

    var lib$es6$promise$asap$$browserWindow = (typeof window !== 'undefined') ? window : undefined;
    var lib$es6$promise$asap$$browserGlobal = lib$es6$promise$asap$$browserWindow || {};
    var lib$es6$promise$asap$$BrowserMutationObserver = lib$es6$promise$asap$$browserGlobal.MutationObserver || lib$es6$promise$asap$$browserGlobal.WebKitMutationObserver;
    var lib$es6$promise$asap$$isNode = typeof process !== 'undefined' && {}.toString.call(process) === '[object process]';

    // test for web worker but not in IE10
    var lib$es6$promise$asap$$isWorker = typeof Uint8ClampedArray !== 'undefined' &&
      typeof importScripts !== 'undefined' &&
      typeof MessageChannel !== 'undefined';

    // node
    function lib$es6$promise$asap$$useNextTick() {
      // node version 0.10.x displays a deprecation warning when nextTick is used recursively
      // see https://github.com/cujojs/when/issues/410 for details
      return function() {
        process.nextTick(lib$es6$promise$asap$$flush);
      };
    }

    // vertx
    function lib$es6$promise$asap$$useVertxTimer() {
      return function() {
        lib$es6$promise$asap$$vertxNext(lib$es6$promise$asap$$flush);
      };
    }

    function lib$es6$promise$asap$$useMutationObserver() {
      var iterations = 0;
      var observer = new lib$es6$promise$asap$$BrowserMutationObserver(lib$es6$promise$asap$$flush);
      var node = document.createTextNode('');
      observer.observe(node, { characterData: true });

      return function() {
        node.data = (iterations = ++iterations % 2);
      };
    }

    // web worker
    function lib$es6$promise$asap$$useMessageChannel() {
      var channel = new MessageChannel();
      channel.port1.onmessage = lib$es6$promise$asap$$flush;
      return function () {
        channel.port2.postMessage(0);
      };
    }

    function lib$es6$promise$asap$$useSetTimeout() {
      return function() {
        setTimeout(lib$es6$promise$asap$$flush, 1);
      };
    }

    var lib$es6$promise$asap$$queue = new Array(1000);
    function lib$es6$promise$asap$$flush() {
      for (var i = 0; i < lib$es6$promise$asap$$len; i+=2) {
        var callback = lib$es6$promise$asap$$queue[i];
        var arg = lib$es6$promise$asap$$queue[i+1];

        callback(arg);

        lib$es6$promise$asap$$queue[i] = undefined;
        lib$es6$promise$asap$$queue[i+1] = undefined;
      }

      lib$es6$promise$asap$$len = 0;
    }

    function lib$es6$promise$asap$$attemptVertx() {
      try {
        var r = require;
        var vertx = r('vertx');
        lib$es6$promise$asap$$vertxNext = vertx.runOnLoop || vertx.runOnContext;
        return lib$es6$promise$asap$$useVertxTimer();
      } catch(e) {
        return lib$es6$promise$asap$$useSetTimeout();
      }
    }

    var lib$es6$promise$asap$$scheduleFlush;
    // Decide what async method to use to triggering processing of queued callbacks:
    if (lib$es6$promise$asap$$isNode) {
      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useNextTick();
    } else if (lib$es6$promise$asap$$BrowserMutationObserver) {
      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useMutationObserver();
    } else if (lib$es6$promise$asap$$isWorker) {
      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useMessageChannel();
    } else if (lib$es6$promise$asap$$browserWindow === undefined && typeof require === 'function') {
      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$attemptVertx();
    } else {
      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useSetTimeout();
    }

    function lib$es6$promise$$internal$$noop() {}

    var lib$es6$promise$$internal$$PENDING   = void 0;
    var lib$es6$promise$$internal$$FULFILLED = 1;
    var lib$es6$promise$$internal$$REJECTED  = 2;

    var lib$es6$promise$$internal$$GET_THEN_ERROR = new lib$es6$promise$$internal$$ErrorObject();

    function lib$es6$promise$$internal$$selfFulfillment() {
      return new TypeError("You cannot resolve a promise with itself");
    }

    function lib$es6$promise$$internal$$cannotReturnOwn() {
      return new TypeError('A promises callback cannot return that same promise.');
    }

    function lib$es6$promise$$internal$$getThen(promise) {
      try {
        return promise.then;
      } catch(error) {
        lib$es6$promise$$internal$$GET_THEN_ERROR.error = error;
        return lib$es6$promise$$internal$$GET_THEN_ERROR;
      }
    }

    function lib$es6$promise$$internal$$tryThen(then, value, fulfillmentHandler, rejectionHandler) {
      try {
        then.call(value, fulfillmentHandler, rejectionHandler);
      } catch(e) {
        return e;
      }
    }

    function lib$es6$promise$$internal$$handleForeignThenable(promise, thenable, then) {
       lib$es6$promise$asap$$asap(function(promise) {
        var sealed = false;
        var error = lib$es6$promise$$internal$$tryThen(then, thenable, function(value) {
          if (sealed) { return; }
          sealed = true;
          if (thenable !== value) {
            lib$es6$promise$$internal$$resolve(promise, value);
          } else {
            lib$es6$promise$$internal$$fulfill(promise, value);
          }
        }, function(reason) {
          if (sealed) { return; }
          sealed = true;

          lib$es6$promise$$internal$$reject(promise, reason);
        }, 'Settle: ' + (promise._label || ' unknown promise'));

        if (!sealed && error) {
          sealed = true;
          lib$es6$promise$$internal$$reject(promise, error);
        }
      }, promise);
    }

    function lib$es6$promise$$internal$$handleOwnThenable(promise, thenable) {
      if (thenable._state === lib$es6$promise$$internal$$FULFILLED) {
        lib$es6$promise$$internal$$fulfill(promise, thenable._result);
      } else if (thenable._state === lib$es6$promise$$internal$$REJECTED) {
        lib$es6$promise$$internal$$reject(promise, thenable._result);
      } else {
        lib$es6$promise$$internal$$subscribe(thenable, undefined, function(value) {
          lib$es6$promise$$internal$$resolve(promise, value);
        }, function(reason) {
          lib$es6$promise$$internal$$reject(promise, reason);
        });
      }
    }

    function lib$es6$promise$$internal$$handleMaybeThenable(promise, maybeThenable) {
      if (maybeThenable.constructor === promise.constructor) {
        lib$es6$promise$$internal$$handleOwnThenable(promise, maybeThenable);
      } else {
        var then = lib$es6$promise$$internal$$getThen(maybeThenable);

        if (then === lib$es6$promise$$internal$$GET_THEN_ERROR) {
          lib$es6$promise$$internal$$reject(promise, lib$es6$promise$$internal$$GET_THEN_ERROR.error);
        } else if (then === undefined) {
          lib$es6$promise$$internal$$fulfill(promise, maybeThenable);
        } else if (lib$es6$promise$utils$$isFunction(then)) {
          lib$es6$promise$$internal$$handleForeignThenable(promise, maybeThenable, then);
        } else {
          lib$es6$promise$$internal$$fulfill(promise, maybeThenable);
        }
      }
    }

    function lib$es6$promise$$internal$$resolve(promise, value) {
      if (promise === value) {
        lib$es6$promise$$internal$$reject(promise, lib$es6$promise$$internal$$selfFulfillment());
      } else if (lib$es6$promise$utils$$objectOrFunction(value)) {
        lib$es6$promise$$internal$$handleMaybeThenable(promise, value);
      } else {
        lib$es6$promise$$internal$$fulfill(promise, value);
      }
    }

    function lib$es6$promise$$internal$$publishRejection(promise) {
      if (promise._onerror) {
        promise._onerror(promise._result);
      }

      lib$es6$promise$$internal$$publish(promise);
    }

    function lib$es6$promise$$internal$$fulfill(promise, value) {
      if (promise._state !== lib$es6$promise$$internal$$PENDING) { return; }

      promise._result = value;
      promise._state = lib$es6$promise$$internal$$FULFILLED;

      if (promise._subscribers.length !== 0) {
        lib$es6$promise$asap$$asap(lib$es6$promise$$internal$$publish, promise);
      }
    }

    function lib$es6$promise$$internal$$reject(promise, reason) {
      if (promise._state !== lib$es6$promise$$internal$$PENDING) { return; }
      promise._state = lib$es6$promise$$internal$$REJECTED;
      promise._result = reason;

      lib$es6$promise$asap$$asap(lib$es6$promise$$internal$$publishRejection, promise);
    }

    function lib$es6$promise$$internal$$subscribe(parent, child, onFulfillment, onRejection) {
      var subscribers = parent._subscribers;
      var length = subscribers.length;

      parent._onerror = null;

      subscribers[length] = child;
      subscribers[length + lib$es6$promise$$internal$$FULFILLED] = onFulfillment;
      subscribers[length + lib$es6$promise$$internal$$REJECTED]  = onRejection;

      if (length === 0 && parent._state) {
        lib$es6$promise$asap$$asap(lib$es6$promise$$internal$$publish, parent);
      }
    }

    function lib$es6$promise$$internal$$publish(promise) {
      var subscribers = promise._subscribers;
      var settled = promise._state;

      if (subscribers.length === 0) { return; }

      var child, callback, detail = promise._result;

      for (var i = 0; i < subscribers.length; i += 3) {
        child = subscribers[i];
        callback = subscribers[i + settled];

        if (child) {
          lib$es6$promise$$internal$$invokeCallback(settled, child, callback, detail);
        } else {
          callback(detail);
        }
      }

      promise._subscribers.length = 0;
    }

    function lib$es6$promise$$internal$$ErrorObject() {
      this.error = null;
    }

    var lib$es6$promise$$internal$$TRY_CATCH_ERROR = new lib$es6$promise$$internal$$ErrorObject();

    function lib$es6$promise$$internal$$tryCatch(callback, detail) {
      try {
        return callback(detail);
      } catch(e) {
        lib$es6$promise$$internal$$TRY_CATCH_ERROR.error = e;
        return lib$es6$promise$$internal$$TRY_CATCH_ERROR;
      }
    }

    function lib$es6$promise$$internal$$invokeCallback(settled, promise, callback, detail) {
      var hasCallback = lib$es6$promise$utils$$isFunction(callback),
          value, error, succeeded, failed;

      if (hasCallback) {
        value = lib$es6$promise$$internal$$tryCatch(callback, detail);

        if (value === lib$es6$promise$$internal$$TRY_CATCH_ERROR) {
          failed = true;
          error = value.error;
          value = null;
        } else {
          succeeded = true;
        }

        if (promise === value) {
          lib$es6$promise$$internal$$reject(promise, lib$es6$promise$$internal$$cannotReturnOwn());
          return;
        }

      } else {
        value = detail;
        succeeded = true;
      }

      if (promise._state !== lib$es6$promise$$internal$$PENDING) {
        // noop
      } else if (hasCallback && succeeded) {
        lib$es6$promise$$internal$$resolve(promise, value);
      } else if (failed) {
        lib$es6$promise$$internal$$reject(promise, error);
      } else if (settled === lib$es6$promise$$internal$$FULFILLED) {
        lib$es6$promise$$internal$$fulfill(promise, value);
      } else if (settled === lib$es6$promise$$internal$$REJECTED) {
        lib$es6$promise$$internal$$reject(promise, value);
      }
    }

    function lib$es6$promise$$internal$$initializePromise(promise, resolver) {
      try {
        resolver(function resolvePromise(value){
          lib$es6$promise$$internal$$resolve(promise, value);
        }, function rejectPromise(reason) {
          lib$es6$promise$$internal$$reject(promise, reason);
        });
      } catch(e) {
        lib$es6$promise$$internal$$reject(promise, e);
      }
    }

    function lib$es6$promise$enumerator$$Enumerator(Constructor, input) {
      var enumerator = this;

      enumerator._instanceConstructor = Constructor;
      enumerator.promise = new Constructor(lib$es6$promise$$internal$$noop);

      if (enumerator._validateInput(input)) {
        enumerator._input     = input;
        enumerator.length     = input.length;
        enumerator._remaining = input.length;

        enumerator._init();

        if (enumerator.length === 0) {
          lib$es6$promise$$internal$$fulfill(enumerator.promise, enumerator._result);
        } else {
          enumerator.length = enumerator.length || 0;
          enumerator._enumerate();
          if (enumerator._remaining === 0) {
            lib$es6$promise$$internal$$fulfill(enumerator.promise, enumerator._result);
          }
        }
      } else {
        lib$es6$promise$$internal$$reject(enumerator.promise, enumerator._validationError());
      }
    }

    lib$es6$promise$enumerator$$Enumerator.prototype._validateInput = function(input) {
      return lib$es6$promise$utils$$isArray(input);
    };

    lib$es6$promise$enumerator$$Enumerator.prototype._validationError = function() {
      return new Error('Array Methods must be provided an Array');
    };

    lib$es6$promise$enumerator$$Enumerator.prototype._init = function() {
      this._result = new Array(this.length);
    };

    var lib$es6$promise$enumerator$$default = lib$es6$promise$enumerator$$Enumerator;

    lib$es6$promise$enumerator$$Enumerator.prototype._enumerate = function() {
      var enumerator = this;

      var length  = enumerator.length;
      var promise = enumerator.promise;
      var input   = enumerator._input;

      for (var i = 0; promise._state === lib$es6$promise$$internal$$PENDING && i < length; i++) {
        enumerator._eachEntry(input[i], i);
      }
    };

    lib$es6$promise$enumerator$$Enumerator.prototype._eachEntry = function(entry, i) {
      var enumerator = this;
      var c = enumerator._instanceConstructor;

      if (lib$es6$promise$utils$$isMaybeThenable(entry)) {
        if (entry.constructor === c && entry._state !== lib$es6$promise$$internal$$PENDING) {
          entry._onerror = null;
          enumerator._settledAt(entry._state, i, entry._result);
        } else {
          enumerator._willSettleAt(c.resolve(entry), i);
        }
      } else {
        enumerator._remaining--;
        enumerator._result[i] = entry;
      }
    };

    lib$es6$promise$enumerator$$Enumerator.prototype._settledAt = function(state, i, value) {
      var enumerator = this;
      var promise = enumerator.promise;

      if (promise._state === lib$es6$promise$$internal$$PENDING) {
        enumerator._remaining--;

        if (state === lib$es6$promise$$internal$$REJECTED) {
          lib$es6$promise$$internal$$reject(promise, value);
        } else {
          enumerator._result[i] = value;
        }
      }

      if (enumerator._remaining === 0) {
        lib$es6$promise$$internal$$fulfill(promise, enumerator._result);
      }
    };

    lib$es6$promise$enumerator$$Enumerator.prototype._willSettleAt = function(promise, i) {
      var enumerator = this;

      lib$es6$promise$$internal$$subscribe(promise, undefined, function(value) {
        enumerator._settledAt(lib$es6$promise$$internal$$FULFILLED, i, value);
      }, function(reason) {
        enumerator._settledAt(lib$es6$promise$$internal$$REJECTED, i, reason);
      });
    };
    function lib$es6$promise$promise$all$$all(entries) {
      return new lib$es6$promise$enumerator$$default(this, entries).promise;
    }
    var lib$es6$promise$promise$all$$default = lib$es6$promise$promise$all$$all;
    function lib$es6$promise$promise$race$$race(entries) {
      /*jshint validthis:true */
      var Constructor = this;

      var promise = new Constructor(lib$es6$promise$$internal$$noop);

      if (!lib$es6$promise$utils$$isArray(entries)) {
        lib$es6$promise$$internal$$reject(promise, new TypeError('You must pass an array to race.'));
        return promise;
      }

      var length = entries.length;

      function onFulfillment(value) {
        lib$es6$promise$$internal$$resolve(promise, value);
      }

      function onRejection(reason) {
        lib$es6$promise$$internal$$reject(promise, reason);
      }

      for (var i = 0; promise._state === lib$es6$promise$$internal$$PENDING && i < length; i++) {
        lib$es6$promise$$internal$$subscribe(Constructor.resolve(entries[i]), undefined, onFulfillment, onRejection);
      }

      return promise;
    }
    var lib$es6$promise$promise$race$$default = lib$es6$promise$promise$race$$race;
    function lib$es6$promise$promise$resolve$$resolve(object) {
      /*jshint validthis:true */
      var Constructor = this;

      if (object && typeof object === 'object' && object.constructor === Constructor) {
        return object;
      }

      var promise = new Constructor(lib$es6$promise$$internal$$noop);
      lib$es6$promise$$internal$$resolve(promise, object);
      return promise;
    }
    var lib$es6$promise$promise$resolve$$default = lib$es6$promise$promise$resolve$$resolve;
    function lib$es6$promise$promise$reject$$reject(reason) {
      /*jshint validthis:true */
      var Constructor = this;
      var promise = new Constructor(lib$es6$promise$$internal$$noop);
      lib$es6$promise$$internal$$reject(promise, reason);
      return promise;
    }
    var lib$es6$promise$promise$reject$$default = lib$es6$promise$promise$reject$$reject;

    var lib$es6$promise$promise$$counter = 0;

    function lib$es6$promise$promise$$needsResolver() {
      throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
    }

    function lib$es6$promise$promise$$needsNew() {
      throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
    }

    var lib$es6$promise$promise$$default = lib$es6$promise$promise$$Promise;
    /**
      Promise objects represent the eventual result of an asynchronous operation. The
      primary way of interacting with a promise is through its `then` method, which
      registers callbacks to receive either a promise's eventual value or the reason
      why the promise cannot be fulfilled.

      Terminology
      -----------

      - `promise` is an object or function with a `then` method whose behavior conforms to this specification.
      - `thenable` is an object or function that defines a `then` method.
      - `value` is any legal JavaScript value (including undefined, a thenable, or a promise).
      - `exception` is a value that is thrown using the throw statement.
      - `reason` is a value that indicates why a promise was rejected.
      - `settled` the final resting state of a promise, fulfilled or rejected.

      A promise can be in one of three states: pending, fulfilled, or rejected.

      Promises that are fulfilled have a fulfillment value and are in the fulfilled
      state.  Promises that are rejected have a rejection reason and are in the
      rejected state.  A fulfillment value is never a thenable.

      Promises can also be said to *resolve* a value.  If this value is also a
      promise, then the original promise's settled state will match the value's
      settled state.  So a promise that *resolves* a promise that rejects will
      itself reject, and a promise that *resolves* a promise that fulfills will
      itself fulfill.


      Basic Usage:
      ------------

      ```js
      var promise = new Promise(function(resolve, reject) {
        // on success
        resolve(value);

        // on failure
        reject(reason);
      });

      promise.then(function(value) {
        // on fulfillment
      }, function(reason) {
        // on rejection
      });
      ```

      Advanced Usage:
      ---------------

      Promises shine when abstracting away asynchronous interactions such as
      `XMLHttpRequest`s.

      ```js
      function getJSON(url) {
        return new Promise(function(resolve, reject){
          var xhr = new XMLHttpRequest();

          xhr.open('GET', url);
          xhr.onreadystatechange = handler;
          xhr.responseType = 'json';
          xhr.setRequestHeader('Accept', 'application/json');
          xhr.send();

          function handler() {
            if (this.readyState === this.DONE) {
              if (this.status === 200) {
                resolve(this.response);
              } else {
                reject(new Error('getJSON: `' + url + '` failed with status: [' + this.status + ']'));
              }
            }
          };
        });
      }

      getJSON('/posts.json').then(function(json) {
        // on fulfillment
      }, function(reason) {
        // on rejection
      });
      ```

      Unlike callbacks, promises are great composable primitives.

      ```js
      Promise.all([
        getJSON('/posts'),
        getJSON('/comments')
      ]).then(function(values){
        values[0] // => postsJSON
        values[1] // => commentsJSON

        return values;
      });
      ```

      @class Promise
      @param {function} resolver
      Useful for tooling.
      @constructor
    */
    function lib$es6$promise$promise$$Promise(resolver) {
      this._id = lib$es6$promise$promise$$counter++;
      this._state = undefined;
      this._result = undefined;
      this._subscribers = [];

      if (lib$es6$promise$$internal$$noop !== resolver) {
        if (!lib$es6$promise$utils$$isFunction(resolver)) {
          lib$es6$promise$promise$$needsResolver();
        }

        if (!(this instanceof lib$es6$promise$promise$$Promise)) {
          lib$es6$promise$promise$$needsNew();
        }

        lib$es6$promise$$internal$$initializePromise(this, resolver);
      }
    }

    lib$es6$promise$promise$$Promise.all = lib$es6$promise$promise$all$$default;
    lib$es6$promise$promise$$Promise.race = lib$es6$promise$promise$race$$default;
    lib$es6$promise$promise$$Promise.resolve = lib$es6$promise$promise$resolve$$default;
    lib$es6$promise$promise$$Promise.reject = lib$es6$promise$promise$reject$$default;
    lib$es6$promise$promise$$Promise._setScheduler = lib$es6$promise$asap$$setScheduler;
    lib$es6$promise$promise$$Promise._setAsap = lib$es6$promise$asap$$setAsap;
    lib$es6$promise$promise$$Promise._asap = lib$es6$promise$asap$$asap;

    lib$es6$promise$promise$$Promise.prototype = {
      constructor: lib$es6$promise$promise$$Promise,

    /**
      The primary way of interacting with a promise is through its `then` method,
      which registers callbacks to receive either a promise's eventual value or the
      reason why the promise cannot be fulfilled.

      ```js
      findUser().then(function(user){
        // user is available
      }, function(reason){
        // user is unavailable, and you are given the reason why
      });
      ```

      Chaining
      --------

      The return value of `then` is itself a promise.  This second, 'downstream'
      promise is resolved with the return value of the first promise's fulfillment
      or rejection handler, or rejected if the handler throws an exception.

      ```js
      findUser().then(function (user) {
        return user.name;
      }, function (reason) {
        return 'default name';
      }).then(function (userName) {
        // If `findUser` fulfilled, `userName` will be the user's name, otherwise it
        // will be `'default name'`
      });

      findUser().then(function (user) {
        throw new Error('Found user, but still unhappy');
      }, function (reason) {
        throw new Error('`findUser` rejected and we're unhappy');
      }).then(function (value) {
        // never reached
      }, function (reason) {
        // if `findUser` fulfilled, `reason` will be 'Found user, but still unhappy'.
        // If `findUser` rejected, `reason` will be '`findUser` rejected and we're unhappy'.
      });
      ```
      If the downstream promise does not specify a rejection handler, rejection reasons will be propagated further downstream.

      ```js
      findUser().then(function (user) {
        throw new PedagogicalException('Upstream error');
      }).then(function (value) {
        // never reached
      }).then(function (value) {
        // never reached
      }, function (reason) {
        // The `PedgagocialException` is propagated all the way down to here
      });
      ```

      Assimilation
      ------------

      Sometimes the value you want to propagate to a downstream promise can only be
      retrieved asynchronously. This can be achieved by returning a promise in the
      fulfillment or rejection handler. The downstream promise will then be pending
      until the returned promise is settled. This is called *assimilation*.

      ```js
      findUser().then(function (user) {
        return findCommentsByAuthor(user);
      }).then(function (comments) {
        // The user's comments are now available
      });
      ```

      If the assimliated promise rejects, then the downstream promise will also reject.

      ```js
      findUser().then(function (user) {
        return findCommentsByAuthor(user);
      }).then(function (comments) {
        // If `findCommentsByAuthor` fulfills, we'll have the value here
      }, function (reason) {
        // If `findCommentsByAuthor` rejects, we'll have the reason here
      });
      ```

      Simple Example
      --------------

      Synchronous Example

      ```javascript
      var result;

      try {
        result = findResult();
        // success
      } catch(reason) {
        // failure
      }
      ```

      Errback Example

      ```js
      findResult(function(result, err){
        if (err) {
          // failure
        } else {
          // success
        }
      });
      ```

      Promise Example;

      ```javascript
      findResult().then(function(result){
        // success
      }, function(reason){
        // failure
      });
      ```

      Advanced Example
      --------------

      Synchronous Example

      ```javascript
      var author, books;

      try {
        author = findAuthor();
        books  = findBooksByAuthor(author);
        // success
      } catch(reason) {
        // failure
      }
      ```

      Errback Example

      ```js

      function foundBooks(books) {

      }

      function failure(reason) {

      }

      findAuthor(function(author, err){
        if (err) {
          failure(err);
          // failure
        } else {
          try {
            findBoooksByAuthor(author, function(books, err) {
              if (err) {
                failure(err);
              } else {
                try {
                  foundBooks(books);
                } catch(reason) {
                  failure(reason);
                }
              }
            });
          } catch(error) {
            failure(err);
          }
          // success
        }
      });
      ```

      Promise Example;

      ```javascript
      findAuthor().
        then(findBooksByAuthor).
        then(function(books){
          // found books
      }).catch(function(reason){
        // something went wrong
      });
      ```

      @method then
      @param {Function} onFulfilled
      @param {Function} onRejected
      Useful for tooling.
      @return {Promise}
    */
      then: function(onFulfillment, onRejection) {
        var parent = this;
        var state = parent._state;

        if (state === lib$es6$promise$$internal$$FULFILLED && !onFulfillment || state === lib$es6$promise$$internal$$REJECTED && !onRejection) {
          return this;
        }

        var child = new this.constructor(lib$es6$promise$$internal$$noop);
        var result = parent._result;

        if (state) {
          var callback = arguments[state - 1];
          lib$es6$promise$asap$$asap(function(){
            lib$es6$promise$$internal$$invokeCallback(state, child, callback, result);
          });
        } else {
          lib$es6$promise$$internal$$subscribe(parent, child, onFulfillment, onRejection);
        }

        return child;
      },

    /**
      `catch` is simply sugar for `then(undefined, onRejection)` which makes it the same
      as the catch block of a try/catch statement.

      ```js
      function findAuthor(){
        throw new Error('couldn't find that author');
      }

      // synchronous
      try {
        findAuthor();
      } catch(reason) {
        // something went wrong
      }

      // async with promises
      findAuthor().catch(function(reason){
        // something went wrong
      });
      ```

      @method catch
      @param {Function} onRejection
      Useful for tooling.
      @return {Promise}
    */
      'catch': function(onRejection) {
        return this.then(null, onRejection);
      }
    };
    function lib$es6$promise$polyfill$$polyfill() {
      var local;

      if (typeof global !== 'undefined') {
          local = global;
      } else if (typeof self !== 'undefined') {
          local = self;
      } else {
          try {
              local = Function('return this')();
          } catch (e) {
              throw new Error('polyfill failed because global object is unavailable in this environment');
          }
      }

      var P = local.Promise;

      if (P && Object.prototype.toString.call(P.resolve()) === '[object Promise]' && !P.cast) {
        return;
      }

      local.Promise = lib$es6$promise$promise$$default;
    }
    var lib$es6$promise$polyfill$$default = lib$es6$promise$polyfill$$polyfill;

    var lib$es6$promise$umd$$ES6Promise = {
      'Promise': lib$es6$promise$promise$$default,
      'polyfill': lib$es6$promise$polyfill$$default
    };

    /* global define:true module:true window: true */
    if (typeof define === 'function' && define['amd']) {
      define(function() { return lib$es6$promise$umd$$ES6Promise; });
    } else if (typeof module !== 'undefined' && module['exports']) {
      module['exports'] = lib$es6$promise$umd$$ES6Promise;
    } else if (typeof this !== 'undefined') {
      this['ES6Promise'] = lib$es6$promise$umd$$ES6Promise;
    }

    lib$es6$promise$polyfill$$default();
}).call(this);


}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"_process":"/home/ubuntu/staging/apps/node_modules/browserify/node_modules/process/browser.js"}],"/home/ubuntu/staging/apps/build/js/applab/ChangeEventHandler.js":[function(require,module,exports){
/**
 * Helper class for generating a synthetic change event when an element's
 * contents changes between focus and blur.
 * @param {Element} element
 * @param {Function} callback
 * @constructor
 */
var ChangeEventHandler = module.exports = function (element, callback) {
  /**
   * @type {Element}
   * @private
   */
  this.element_ = element;

  /**
   * Callback to call if the element's value changes between focus and blur.
   * @type {function}
   * @private
   */
  this.callback_ = callback;

  /**
   * Value of the element when it was focused.
   * @type {string}
   * @private
   */
  this.initialValue_ = '';
};

ChangeEventHandler.prototype.onFocus = function () {
  this.initialValue_ = this.element_.textContent;
};

ChangeEventHandler.prototype.onBlur = function () {
  if (this.element_.textContent !== this.initialValue_) {
    this.callback_();
  }
};

/**
 * Attaches a synthetic change event to the element, by calling the callback
 * if the element's value changes between focus and blur.
 * @param {Element} element
 * @param {Function} callback
 */
ChangeEventHandler.addChangeEventHandler = function(element, callback) {
  var handler = new ChangeEventHandler(element, callback);
  element.addEventListener("focus", handler.onFocus.bind(handler));
  element.addEventListener("blur", handler.onBlur.bind(handler));
};


},{}]},{},["/home/ubuntu/staging/apps/build/js/applab/main.js"]);
