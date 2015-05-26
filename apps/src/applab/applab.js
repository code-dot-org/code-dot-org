/**
 * CodeOrgApp: Applab
 *
 * Copyright 2014-2015 Code.org
 *
 */
/* global $ */
/* global dashboard */

'use strict';
require('./acemode/mode-javascript_codeorg');
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
var keyEvent = require('./keyEvent');
var apiTimeoutList = require('../timeoutList');
var RGBColor = require('./rgbcolor.js');
var annotationList = require('./acemode/annotationList');
var designMode = require('./designMode');

var vsprintf = require('./sprintf').vsprintf;

var ResultType = studioApp.ResultType;
var TestResults = studioApp.TestResults;

/**
 * Create a namespace for the application.
 */
var Applab = module.exports;

var level;
var skin;
var user;

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

var StepType = {
  RUN:  0,
  IN:   1,
  OVER: 2,
  OUT:  3,
};

var ErrorLevel = {
  WARNING: 'WARNING',
  ERROR: 'ERROR'
};

var MIN_DEBUG_AREA_HEIGHT = 70;
var MAX_DEBUG_AREA_HEIGHT = 400;

// The typical width of the visualization area (indepdendent of appWidth)
var vizAppWidth = 400;
// The default values for appWidth and appHeight (if not specified in the level)
var defaultAppWidth = 400;
var defaultAppHeight = 400;

function loadLevel() {
  Applab.timeoutFailureTick = level.timeoutFailureTick || Infinity;
  Applab.minWorkspaceHeight = level.minWorkspaceHeight;
  Applab.softButtons_ = level.softButtons || {};
  Applab.appWidth = level.appWidth || defaultAppWidth;
  Applab.appHeight = level.appHeight || defaultAppHeight;

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
// The divApplab coordinate space will be Applab.appWidth by Applab.appHeight.
// The scale values are then adjusted such that the max-width case may result
// in a scaled-up version of divApplab and the min-width case will typically
// result in a scaled-down version of divApplab.
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
  var vizAppHeight = Applab.appHeight * vizScale;

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
          var scale = scaleFactors[curScaleIndex];
          for (var k = 0; k < childRules.length && changedChildRules < 8; k++) {
            if (childRules[k].selectorText === "div#visualization.responsive" ||
                childRules[k].selectorText === "div.responsive#visualization") {
              // For this scale factor...
              // set the max-height and max-width for the visualization
              childRules[k].style.cssText = "max-height: " +
                  Applab.appHeight * scale + "px; max-width: " +
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
                  Applab.appWidth * scale + "px;";
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
              // (importantly, the divApplab element)
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
  divApplab.style.height = Applab.appHeight + "px";
};

function stepSpeedFromSliderSpeed(sliderSpeed) {
  return 300 * Math.pow(1 - sliderSpeed, 2);
}

function getCurrentTickLength() {
  var stepSpeed = Applab.scale.stepSpeed;
  if (Applab.speedSlider) {
    stepSpeed = stepSpeedFromSliderSpeed(Applab.speedSlider.getValue());
  }
  return stepSpeed;
}

function queueOnTick() {
  window.setTimeout(Applab.onTick, getCurrentTickLength());
}

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
      debugOutput.textContent = output;
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

var OPTIONAL = true;

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
      var line = 1 + codegen.getNearestUserCodeLine(Applab.interpreter,
                                                    Applab.cumulativeLength,
                                                    Applab.userCodeStartOffset,
                                                    Applab.userCodeLength);
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
      var line = 1 + codegen.getNearestUserCodeLine(Applab.interpreter,
                                                    Applab.cumulativeLength,
                                                    Applab.userCodeStartOffset,
                                                    Applab.userCodeLength);
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
      var line = 1 + codegen.getNearestUserCodeLine(Applab.interpreter,
                                                    Applab.cumulativeLength,
                                                    Applab.userCodeStartOffset,
                                                    Applab.userCodeLength);
      var errorString = funcName + "() called without an active canvas. Call " +
        "createCanvas() first.";
      outputError(errorString, ErrorLevel.WARNING, line);
    }
    if (opts) {
      opts[validatedActiveCanvasKey] = activeCanvas;
    }
  }
}

function apiValidateDomIdExistence(divApplab, opts, funcName, varName, id, shouldExist) {
  var validatedTypeKey = 'validated_type_' + varName;
  var validatedDomKey = 'validated_id_' + varName;
  apiValidateType(opts, funcName, varName, id, 'string');
  if (opts[validatedTypeKey] && typeof opts[validatedDomKey] === 'undefined') {
    var element = document.getElementById(id);
    var exists = Boolean(element && divApplab.contains(element));
    var valid = exists == shouldExist;
    if (!valid) {
      var line = 1 + codegen.getNearestUserCodeLine(Applab.interpreter,
                                                    Applab.cumulativeLength,
                                                    Applab.userCodeStartOffset,
                                                    Applab.userCodeLength);
      var errorString = funcName + "() " + varName +
        " parameter refers to an id (" +id + ") which " +
        (exists ? "already exists." : "does not exist.");
      outputError(errorString, ErrorLevel.WARNING, line);
    }
    opts[validatedDomKey] = valid;
  }
}

function onDebugInputKeyDown(e) {
  if (e.keyCode == KeyCodes.ENTER) {
    var input = e.target.textContent;
    e.target.textContent = '';
    outputApplabConsole('> ' + input);
    if (Applab.interpreter) {
      var currentScope = Applab.interpreter.getScope();
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
          evalInterpreter[prop] = Applab.interpreter[prop];
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
}

function selectEditorRowCol(row, col) {
  if (studioApp.editor.currentlyUsingBlocks) {
    var style = {color: '#FFFF22'};
    studioApp.editor.clearLineMarks();
    studioApp.editor.markLine(row, style);
  } else {
    var selection = studioApp.editor.aceEditor.getSelection();
    var range = selection.getRange();

    range.start.row = row;
    range.start.column = col;
    range.end.row = row;
    range.end.column = col + 1;

    // setting with the backwards parameter set to true - this prevents horizontal
    // scrolling to the right
    selection.setSelectionRange(range, true);
  }
}

function handleExecutionError(err, lineNumber) {
  if (!lineNumber && err instanceof SyntaxError) {
    // syntax errors came before execution (during parsing), so we need
    // to determine the proper line number by looking at the exception
    lineNumber = err.loc.line - Applab.userCodeLineOffset;
    // Now select this location in the editor, since we know we didn't hit
    // this while executing (in which case, it would already have been selected)
    selectEditorRowCol(lineNumber - 1, err.loc.column);
  }
  if (!lineNumber && Applab.interpreter) {
    lineNumber = 1 + codegen.getNearestUserCodeLine(Applab.interpreter,
                                                    Applab.cumulativeLength,
                                                    Applab.userCodeStartOffset,
                                                    Applab.userCodeLength);
  }
  outputError(String(err), ErrorLevel.ERROR, lineNumber);
  Applab.executionError = err;
  if (!level.freePlay) {
    Applab.onPuzzleComplete();
  }
}

Applab.getCode = function () {
  return studioApp.editor.getValue();
};

Applab.getHtml = function () {
  return Applab.levelHtml;
};

Applab.onTick = function() {
  if (!Applab.running) {
    return;
  }

  Applab.tickCount++;
  queueOnTick();

  if (Applab.interpreter) {
    Applab.executeInterpreter();
  } else {
    Applab.executeNativeJS();
  }

  if (checkFinished()) {
    Applab.onPuzzleComplete();
  }
};

Applab.executeNativeJS = function () {
  if (Applab.tickCount === 1) {
    try { Applab.whenRunFunc(studioApp, apiBlockly, Applab.Globals); } catch (e) { }
  }
};

function safeStepInterpreter() {
  try {
    Applab.interpreter.step();
  } catch (err) {
    return err;
  }
}

Applab.executeInterpreter = function (runUntilCallbackReturn) {
  Applab.runUntilCallbackReturn = runUntilCallbackReturn;
  if (runUntilCallbackReturn) {
    delete Applab.lastCallbackRetVal;
  }
  Applab.seenEmptyGetCallbackDuringExecution = false;
  Applab.seenReturnFromCallbackDuringExecution = false;

  var atInitialBreakpoint = Applab.paused &&
                            Applab.nextStep === StepType.IN &&
                            Applab.tickCount === 1;
  var atMaxSpeed = getCurrentTickLength() === 0;

  if (Applab.paused) {
    switch (Applab.nextStep) {
      case StepType.RUN:
        // Bail out here if in a break state (paused), but make sure that we still
        // have the next tick queued first, so we can resume after un-pausing):
        return;
      case StepType.OUT:
        // If we haven't yet set stepOutToStackDepth, work backwards through the
        // history of callExpressionSeenAtDepth until we find the one we want to
        // step out to - and store that in stepOutToStackDepth:
        if (Applab.interpreter && typeof Applab.stepOutToStackDepth === 'undefined') {
          Applab.stepOutToStackDepth = 0;
          for (var i = Applab.maxValidCallExpressionDepth; i > 0; i--) {
            if (Applab.callExpressionSeenAtDepth[i]) {
              Applab.stepOutToStackDepth = i;
              break;
            }
          }
        }
        break;
    }
  }

  var doneUserLine = false;
  var reachedBreak = false;
  var unwindingAfterStep = false;
  var inUserCode;
  var userCodeRow;
  var session = studioApp.editor.aceEditor.getSession();

  // In each tick, we will step the interpreter multiple times in a tight
  // loop as long as we are interpreting code that the user can't see
  // (function aliases at the beginning, getCallback event loop at the end)
  for (var stepsThisTick = 0;
       (stepsThisTick < MAX_INTERPRETER_STEPS_PER_TICK) || unwindingAfterStep;
       stepsThisTick++) {
    // Re-check this because the speed may have changed...
    atMaxSpeed = getCurrentTickLength() === 0;
    // NOTE: when running with no source visible or at max speed, we
    // call a simple function to just get the line number, otherwise we call a
    // function that also selects the code:
    var selectCodeFunc = (studioApp.hideSource || (atMaxSpeed && !Applab.paused)) ?
            codegen.getUserCodeLine :
            codegen.selectCurrentCode;

    if ((reachedBreak && !unwindingAfterStep) ||
        (doneUserLine && !unwindingAfterStep && !atMaxSpeed) ||
        Applab.seenEmptyGetCallbackDuringExecution ||
        (runUntilCallbackReturn && Applab.seenReturnFromCallbackDuringExecution)) {
      // stop stepping the interpreter and wait until the next tick once we:
      // (1) reached a breakpoint and are done unwinding OR
      // (2) completed a line of user code and are are done unwinding
      //     (while not running atMaxSpeed) OR
      // (3) have seen an empty event queue in nativeGetCallback (no events) OR
      // (4) have seen a nativeSetCallbackRetVal call in runUntilCallbackReturn mode
      break;
    }
    userCodeRow = selectCodeFunc(Applab.interpreter,
                                 Applab.cumulativeLength,
                                 Applab.userCodeStartOffset,
                                 Applab.userCodeLength,
                                 studioApp.editor);
    inUserCode = (-1 !== userCodeRow);
    // Check to see if we've arrived at a new breakpoint:
    //  (1) should be in user code
    //  (2) should never happen while unwinding
    //  (3) requires either
    //   (a) atInitialBreakpoint OR
    //   (b) isAceBreakpointRow() AND not still at the same line number where
    //       we have already stopped from the last step/breakpoint
    if (inUserCode && !unwindingAfterStep &&
        (atInitialBreakpoint ||
         (userCodeRow !== Applab.stoppedAtBreakpointRow &&
          codegen.isAceBreakpointRow(session, userCodeRow)))) {
      // Yes, arrived at a new breakpoint:
      if (Applab.paused) {
        // Overwrite the nextStep value. (If we hit a breakpoint during a step
        // out or step over, this will cancel that step operation early)
        Applab.nextStep = StepType.RUN;
        Applab.updatePauseUIState();
      } else {
        Applab.onPauseContinueButton();
      }
      // Store some properties about where we stopped:
      Applab.stoppedAtBreakpointRow = userCodeRow;
      Applab.stoppedAtBreakpointStackDepth = Applab.interpreter.stateStack.length;

      // Mark reachedBreak to stop stepping, and start unwinding if needed:
      reachedBreak = true;
      unwindingAfterStep = codegen.isNextStepSafeWhileUnwinding(Applab.interpreter);
      continue;
    }
    // If we've moved past the place of the last breakpoint hit without being
    // deeper in the stack, we will discard the stoppedAtBreakpoint properties:
    if (inUserCode &&
        userCodeRow !== Applab.stoppedAtBreakpointRow &&
        Applab.interpreter.stateStack.length <= Applab.stoppedAtBreakpointStackDepth) {
      delete Applab.stoppedAtBreakpointRow;
      delete Applab.stoppedAtBreakpointStackDepth;
    }
    // If we're unwinding, continue to update the stoppedAtBreakpoint properties
    // to ensure that we have the right properties stored when the unwind completes:
    if (inUserCode && unwindingAfterStep) {
      Applab.stoppedAtBreakpointRow = userCodeRow;
      Applab.stoppedAtBreakpointStackDepth = Applab.interpreter.stateStack.length;
    }
    var err = safeStepInterpreter();
    if (!err) {
      doneUserLine = doneUserLine ||
        (inUserCode && Applab.interpreter.stateStack[0] && Applab.interpreter.stateStack[0].done);

      var stackDepth = Applab.interpreter.stateStack.length;
      // Remember the stack depths of call expressions (so we can implement 'step out')

      // Truncate any history of call expressions seen deeper than our current stack position:
      for (var depth = stackDepth + 1;
            depth <= Applab.maxValidCallExpressionDepth;
            depth++) {
        Applab.callExpressionSeenAtDepth[depth] = false;
      }
      Applab.maxValidCallExpressionDepth = stackDepth;

      if (inUserCode && Applab.interpreter.stateStack[0].node.type === "CallExpression") {
        // Store that we've seen a call expression at this depth in callExpressionSeenAtDepth:
        Applab.callExpressionSeenAtDepth[stackDepth] = true;
      }

      if (Applab.paused) {
        // Store the first call expression stack depth seen while in this step operation:
        if (inUserCode && Applab.interpreter.stateStack[0].node.type === "CallExpression") {
          if (typeof Applab.firstCallStackDepthThisStep === 'undefined') {
            Applab.firstCallStackDepthThisStep = stackDepth;
          }
        }
        // If we've arrived at a BlockStatement or SwitchStatement, set doneUserLine even
        // though the the stateStack doesn't have "done" set, so that stepping in the
        // debugger makes sense (otherwise we'll skip over the beginning of these nodes):
        var nodeType = Applab.interpreter.stateStack[0].node.type;
        doneUserLine = doneUserLine ||
          (inUserCode && (nodeType === "BlockStatement" || nodeType === "SwitchStatement"));

        // For the step in case, we want to stop the interpreter as soon as we enter the callee:
        if (!doneUserLine &&
            inUserCode &&
            Applab.nextStep === StepType.IN &&
            stackDepth > Applab.firstCallStackDepthThisStep) {
          reachedBreak = true;
        }
        // After the interpreter says a node is "done" (meaning it is time to stop), we will
        // advance a little further to the start of the next statement. We achieve this by
        // continuing to set unwindingAfterStep to true to keep the loop going:
        if (doneUserLine || reachedBreak) {
          var wasUnwinding = unwindingAfterStep;
          // step() additional times if we know it to be safe to get us to the next statement:
          unwindingAfterStep = codegen.isNextStepSafeWhileUnwinding(Applab.interpreter);
          if (wasUnwinding && !unwindingAfterStep) {
            // done unwinding.. select code that is next to execute:
            userCodeRow = selectCodeFunc(Applab.interpreter,
                                         Applab.cumulativeLength,
                                         Applab.userCodeStartOffset,
                                         Applab.userCodeLength,
                                         studioApp.editor);
            inUserCode = (-1 !== userCodeRow);
            if (!inUserCode) {
              // not in user code, so keep unwinding after all...
              unwindingAfterStep = true;
            }
          }
        }

        if ((reachedBreak || doneUserLine) && !unwindingAfterStep) {
          if (Applab.nextStep === StepType.OUT &&
              stackDepth > Applab.stepOutToStackDepth) {
            // trying to step out, but we didn't get out yet... continue on.
          } else if (Applab.nextStep === StepType.OVER &&
              typeof Applab.firstCallStackDepthThisStep !== 'undefined' &&
              stackDepth > Applab.firstCallStackDepthThisStep) {
            // trying to step over, and we're in deeper inside a function call... continue next onTick
          } else {
            // Our step operation is complete, reset nextStep to StepType.RUN to
            // return to a normal 'break' state:
            Applab.nextStep = StepType.RUN;
            Applab.updatePauseUIState();
            if (inUserCode) {
              // Store some properties about where we stopped:
              Applab.stoppedAtBreakpointRow = userCodeRow;
              Applab.stoppedAtBreakpointStackDepth = stackDepth;
            }
            delete Applab.stepOutToStackDepth;
            delete Applab.firstCallStackDepthThisStep;
            document.getElementById('spinner').style.visibility = 'hidden';
            break;
          }
        }
      }
    } else {
      handleExecutionError(err, inUserCode ? (userCodeRow + 1) : undefined);
      return;
    }
  }
  if (reachedBreak && atMaxSpeed) {
    // If we were running atMaxSpeed and just reached a breakpoint, the
    // code may not be selected in the editor, so do it now:
    codegen.selectCurrentCode(Applab.interpreter,
                              Applab.cumulativeLength,
                              Applab.userCodeStartOffset,
                              Applab.userCodeLength,
                              studioApp.editor);
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

  Applab.clearEventHandlersKillTickLoop();
  skin = config.skin;
  level = config.level;
  user = {
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
  var showDebugButtons = !config.hideSource && config.level.editCode;
  var showDebugConsole = !config.hideSource && config.level.editCode;
  var firstControlsRow = require('./controls.html.ejs')({
    assetUrl: studioApp.assetUrl,
    showSlider: showSlider,
    finishButton: true
  });
  var extraControlsRow = require('./extraControlRows.html.ejs')({
    assetUrl: studioApp.assetUrl,
    debugButtons: showDebugButtons,
    debugConsole: showDebugConsole
  });
  var designModeBox = require('./designModeBox.html.ejs')({});

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
      hasDesignMode: user.isAdmin,
      designModeBox: designModeBox
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
  };

  config.afterEditorReady = function() {
    // Set up an event handler to create breakpoints when clicking in the
    // ace gutter:
    var aceEditor = studioApp.editor.aceEditor;
    if (aceEditor) {
      aceEditor.on("guttermousedown", function(e) {
        var target = e.domEvent.target;
        if (target.className.indexOf("ace_gutter-cell") == -1) {
          return;
        }
        var row = e.getDocumentPosition().row;
        var bps = e.editor.session.getBreakpoints();
        if (bps[row]) {
          e.editor.session.clearBreakpoint(row);
        } else {
          e.editor.session.setBreakpoint(row);
        }
        e.stop();
      });
    }

    if (studioApp.share) {
      // automatically run in share mode:
      window.setTimeout(Applab.runButtonClick.bind(studioApp), 0);
    }
  };

  // arrangeStartBlocks(config);

  config.twitter = twitterOptions;

  // hide makeYourOwn on the share page
  config.makeYourOwn = false;

  config.varsInGlobals = true;
  config.noButtonsBelowOnMobileShare = true;

  config.dropletConfig = dropletConfig;
  config.pinWorkspaceToBottom = true;

  config.vizAspectRatio = Applab.appWidth / Applab.appHeight;
  config.nativeVizWidth = Applab.appWidth;

  // Since the app width may not be 400, set this value in the config to
  // ensure that the viewport is set up properly for scaling it up/down
  config.mobileNoPaddingShareWidth = config.level.appWidth;

  // Applab.initMinimal();

  Applab.levelHtml = level.levelHtml || "";

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

  if (level.editCode) {
    // Initialize the slider.
    var slider = document.getElementById('applab-slider');
    if (slider) {
      Applab.speedSlider = new Slider(10, 27, 130, slider);

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
  dom.addClickTouchEvent(finishButton, Applab.onPuzzleComplete);

  if (level.editCode) {
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
    var viewDataButton = document.getElementById('viewDataButton');
    if (viewDataButton) {
      // Simulate a run button click, to load the channel id.
      var viewDataClick = studioApp.runButtonClickWrapper.bind(
          studioApp, Applab.onViewData);
      var throttledViewDataClick = _.debounce(viewDataClick, 250, true);
      dom.addClickTouchEvent(viewDataButton, throttledViewDataClick);
    }
    var designModeButton = document.getElementById('designModeButton');
    if (designModeButton) {
      dom.addClickTouchEvent(designModeButton, Applab.onDesignModeButton);
    }
    var codeModeButton = document.getElementById('codeModeButton');
    if (codeModeButton) {
      dom.addClickTouchEvent(codeModeButton, Applab.onCodeModeButton);
    }
    var designModeClear = document.getElementById('designModeClear');
    if (designModeClear) {
      dom.addClickTouchEvent(designModeClear, designMode.onClear);
    }

    // Allow elements to be dragged and dropped from the design mode
    // element tray to the play space.
    $('.new-design-element').draggable({
      containment:"#codeApp",
      helper:"clone",
      appendTo:"#codeApp",
      revert: 'invalid',
      zIndex: 2,
      start: function() {
        studioApp.resetButtonClick();
      }
    });
    var GRID_SIZE = 5;
    $('#visualization').droppable({
      accept: '.new-design-element',
      drop: function (event, ui) {
        var elementType = ui.draggable[0].dataset.elementType;

        var div = document.getElementById('divApplab');
        var xScale = div.getBoundingClientRect().width / div.offsetWidth;
        var yScale = div.getBoundingClientRect().height / div.offsetHeight;

        var left = ui.position.left / xScale;
        var top = ui.position.top / yScale;

        // snap top-left corner to nearest location in the grid
        left -= (left + GRID_SIZE / 2) % GRID_SIZE - GRID_SIZE / 2;
        top -= (top + GRID_SIZE / 2) % GRID_SIZE - GRID_SIZE / 2;

        designMode.createElement(elementType, left, top);
      }
    });
  }
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

  codeTextbox.style.bottom = newDbgHeight + 'px';
  debugArea.style.height = newDbgHeight + 'px';

  // Prevent the codeTextbox from being shrunk too small vertically
  // (half for code, half for debug-area, minus half toolbar height + 1px border)
  //
  // (we would do this in CSS, but for precedence rules to work properly, if
  //  we explicitly set bottom/height styles on the elements above, we need to
  //  do the same for these styles as well)

  codeTextbox.style.minHeight = 'calc(50% - 21px)';
  debugArea.style.maxHeight = 'calc(50% - 21px)';

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
  Applab.tickCount = 0;

  var spinner = document.getElementById('spinner');
  if (spinner) {
    spinner.style.visibility = 'hidden';
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
  return $('#resetButton').is(':visible');
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

  if (level.showTurtleBeforeRun) {
    turtleSetVisibility(true);
  }

  var isDesignMode = $('#codeModeButton').is(':visible');

  var allowDragging = isDesignMode && !Applab.isRunning();
  designMode.parseFromLevelHtml(newDivApplab, allowDragging);
  if (isDesignMode) {
    designMode.clearProperties();
    designMode.resetElementTray(allowDragging);
  }

  newDivApplab.addEventListener('click', designMode.onDivApplabClick);

  // Reset goal successState:
  if (level.goal) {
    level.goal.successState = {};
  }

  if (level.editCode) {
    Applab.paused = false;
    Applab.nextStep = StepType.RUN;
    delete Applab.stepOutToStackDepth;
    delete Applab.firstCallStackDepthThisStep;
    delete Applab.stoppedAtBreakpointRow;
    delete Applab.stoppedAtBreakpointStackDepth;
    Applab.maxValidCallExpressionDepth = 0;
    Applab.callExpressionSeenAtDepth = [];
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
    var spinner = document.getElementById('spinner');
    if (spinner) {
      spinner.style.visibility = 'hidden';
    }
    var debugOutput = document.getElementById('debug-output');
    if (debugOutput) {
      debugOutput.textContent = '';
    }
    var debugInput = document.getElementById('debug-input');
    if (debugInput) {
      debugInput.textContent = '';
    }
  }

  // Reset the Globals object used to contain program variables:
  Applab.Globals = {};
  Applab.eventQueue = [];
  Applab.executionError = null;
  Applab.interpreter = null;
};

// TODO(dave): remove once channel id is passed in appOptions.
/**
 * If channel id has not yet been loaded, delays calling of the callback
 * until the saveProject response comes back. Otherwise, calls the callback
 * directly.
 * @param callback {Function}
 */
studioApp.runButtonClickWrapper = function (callback) {
  // Behave like other apps when not editing a project or channel id is present.
  if (window.dashboard && (!dashboard.project.isEditing ||
      (dashboard.project.current && dashboard.project.current.id))) {
    $(window).trigger('run_button_pressed');
    callback();
  } else {
    $(window).trigger('run_button_pressed', callback);
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

  if (level.freePlay && !studioApp.hideSource) {
    var shareCell = document.getElementById('share-cell');
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
 * A miniature runtime in the interpreted world calls this function repeatedly
 * to check to see if it should invoke any callbacks from within the
 * interpreted world. If the eventQueue is not empty, we will return an object
 * that contains an interpreted callback function (stored in "fn") and,
 * optionally, callback arguments (stored in "arguments")
 */
var nativeGetCallback = function () {
  var retVal = Applab.eventQueue.shift();
  if (typeof retVal === "undefined") {
    Applab.seenEmptyGetCallbackDuringExecution = true;
  }
  return retVal;
};

var nativeSetCallbackRetVal = function (retVal) {
  if (Applab.eventQueue.length === 0) {
    // If nothing else is in the event queue, then store this return value
    // away so it can be returned in the native event handler
    Applab.seenReturnFromCallbackDuringExecution = true;
    Applab.lastCallbackRetVal = retVal;
  }
  // Provide warnings to the user if this function has been called with a
  // meaningful return value while we are no longer in the native event handler

  // TODO (cpirich): Check to see if the DOM event object was modified
  // (preventDefault(), stopPropagation(), returnValue) and provide a similar
  // warning since these won't work as expected unless running atMaxSpeed
  if (!Applab.runUntilCallbackReturn &&
      typeof Applab.lastCallbackRetVal !== 'undefined') {
    outputApplabConsole("Function passed to onEvent() has taken too long - the return value was ignored.");
    if (getCurrentTickLength() !== 0) {
      outputApplabConsole("  (try moving the speed slider to its maximum value)");
    }
  }
};

var consoleApi = {};

consoleApi.log = function() {
  var nativeArgs = [];
  for (var i = 0; i < arguments.length; i++) {
    nativeArgs[i] = codegen.marshalInterpreterToNative(Applab.interpreter,
                                                       arguments[i]);
  }
  var output = '';
  var firstArg = nativeArgs[0];
  if (typeof firstArg === 'string' || firstArg instanceof String) {
    output = vsprintf(firstArg, nativeArgs.slice(1));
  } else {
    for (i = 0; i < nativeArgs.length; i++) {
      output += nativeArgs[i].toString();
      if (i < nativeArgs.length - 1) {
        output += '\n';
      }
    }
  }
  outputApplabConsole(output);
};

function populateNonMarshalledFunctions(interpreter, scope, parent) {
  for (var i = 0; i < dropletConfig.blocks.length; i++) {
    var block = dropletConfig.blocks[i];
    if (block.dontMarshal) {
      var func = parent[block.func];
      // 4th param is false to indicate: don't marshal params
      var wrapper = codegen.makeNativeMemberFunction({
          interpreter: interpreter,
          nativeFunc: func,
          nativeParentObj: parent,
          dontMarshal: true
      });
      interpreter.setProperty(scope,
                              block.func,
                              interpreter.createNativeFunction(wrapper));
    }
  }
}

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
    Applab.userCodeStartOffset = 0;
    Applab.userCodeLineOffset = 0;
    Applab.userCodeLength = codeWhenRun.length;
    // Append our mini-runtime after the user's code. This will spin and process
    // callback functions:
    codeWhenRun += '\nwhile (true) { var obj = getCallback(); ' +
      'if (obj) { var ret = obj.fn.apply(null, obj.arguments ? obj.arguments : null);' +
                 'setCallbackRetVal(ret); }}';
    var session = studioApp.editor.aceEditor.getSession();
    annotationList.attachToSession(session);
    Applab.cumulativeLength = codegen.aceCalculateCumulativeLength(session);
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
      var initFunc = function(interpreter, scope) {
        codegen.initJSInterpreter(interpreter,
                                  dropletConfig.blocks,
                                  scope,
                                  { console: consoleApi });

        populateNonMarshalledFunctions(interpreter, scope, dontMarshalApi);

        // Only allow five levels of depth when marshalling the return value
        // since we will occasionally return DOM Event objects which contain
        // properties that recurse over and over...
        var wrapper = codegen.makeNativeMemberFunction({
            interpreter: interpreter,
            nativeFunc: nativeGetCallback,
            maxDepth: 5
        });
        interpreter.setProperty(scope,
                                'getCallback',
                                interpreter.createNativeFunction(wrapper));

        wrapper = codegen.makeNativeMemberFunction({
            interpreter: interpreter,
            nativeFunc: nativeSetCallbackRetVal,
        });
        interpreter.setProperty(scope,
                                'setCallbackRetVal',
                                interpreter.createNativeFunction(wrapper));
      };
      try {
        Applab.interpreter = new window.Interpreter(codeWhenRun, initFunc);
      }
      catch(err) {
        handleExecutionError(err);
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
    var spinner = document.getElementById('spinner');
    if (spinner) {
      spinner.style.visibility = 'visible';
    }
  }

  // Set focus on divApplab so key events can be handled right from the start
  // without requiring the user to adjust focus:
  var divApplab = document.getElementById('divApplab');
  divApplab.focus();

  Applab.running = true;
  queueOnTick();
};

Applab.onPauseContinueButton = function() {
  if (Applab.running) {
    // We have code and are either running or paused
    if (Applab.paused && Applab.nextStep === StepType.RUN) {
      Applab.paused = false;
    } else {
      Applab.paused = true;
      Applab.nextStep = StepType.RUN;
    }
    Applab.updatePauseUIState();
    var stepInButton = document.getElementById('stepInButton');
    var stepOverButton = document.getElementById('stepOverButton');
    var stepOutButton = document.getElementById('stepOutButton');
    stepInButton.disabled = !Applab.paused;
    stepOverButton.disabled = !Applab.paused;
    stepOutButton.disabled = !Applab.paused;
  }
};

Applab.updatePauseUIState = function() {
  var pauseButton = document.getElementById('pauseButton');
  var continueButton = document.getElementById('continueButton');
  var spinner = document.getElementById('spinner');

  if (pauseButton && continueButton && spinner) {
    if (Applab.paused && Applab.nextStep === StepType.RUN) {
      pauseButton.style.display = "none";
      continueButton.style.display = "inline-block";
      spinner.style.visibility = 'hidden';
    } else {
      pauseButton.style.display = "inline-block";
      continueButton.style.display = "none";
      spinner.style.visibility = 'visible';
    }
  }
};

Applab.onStepOverButton = function() {
  if (Applab.running) {
    Applab.paused = true;
    Applab.nextStep = StepType.OVER;
    Applab.updatePauseUIState();
  }
};

Applab.onStepInButton = function() {
  if (!Applab.running) {
    Applab.runButtonClick();
    Applab.onPauseContinueButton();
  }
  Applab.paused = true;
  Applab.nextStep = StepType.IN;
  Applab.updatePauseUIState();
};

Applab.onStepOutButton = function() {
  if (Applab.running) {
    Applab.paused = true;
    Applab.nextStep = StepType.OUT;
    Applab.updatePauseUIState();
  }
};

Applab.feedbackImage = '';
Applab.encodedFeedbackImage = '';

Applab.onViewData = function() {
  window.open(
    '//' + getPegasusHost() + '/edit-csp-app/' + AppStorage.getChannelId(),
    '_blank');
};

Applab.onDesignModeButton = function() {
  designMode.toggleDesignMode(true);
  studioApp.resetButtonClick();
};

Applab.onCodeModeButton = function() {
  designMode.toggleDesignMode(false);
};

Applab.onPuzzleComplete = function() {
  if (Applab.executionError) {
    Applab.result = ResultType.ERROR;
  } else if (level.freePlay) {
    Applab.result = ResultType.SUCCESS;
  }

  // Stop everything on screen
  Applab.clearEventHandlersKillTickLoop();

  // If the current level is a free play, always return the free play result
  if (level.freePlay) {
    Applab.testResults = TestResults.FREE_PLAY;
  } else {
    var levelComplete = (Applab.result === ResultType.SUCCESS);
    Applab.testResults = studioApp.getTestResults(levelComplete);
  }

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
      result: Applab.result === ResultType.SUCCESS,
      testResult: Applab.testResults,
      program: encodeURIComponent(program),
      image: Applab.encodedFeedbackImage,
      onComplete: Applab.onReportComplete
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
  if (Applab[cmd.name] instanceof Function) {
    studioApp.highlight(cmd.id);
    retVal = Applab[cmd.name](cmd.opts);
  }
  return retVal;
};

Applab.container = function (opts) {
  var divApplab = document.getElementById('divApplab');

  var newDiv = document.createElement("div");
  if (typeof opts.elementId !== "undefined") {
    newDiv.id = opts.elementId;
  }
  newDiv.innerHTML = opts.html;

  return Boolean(divApplab.appendChild(newDiv));
};

Applab.write = function (opts) {
  apiValidateType(opts, 'write', 'text', opts.html, 'uistring');
  return Applab.container(opts);
};

Applab.button = function (opts) {
  var divApplab = document.getElementById('divApplab');

  // PARAMNAME: button: id vs. buttonId
  apiValidateDomIdExistence(divApplab, opts, 'button', 'id', opts.elementId, false);
  apiValidateType(opts, 'button', 'text', opts.text, 'uistring');

  var newButton = document.createElement("button");
  var textNode = document.createTextNode(opts.text);
  newButton.id = opts.elementId;

  return Boolean(newButton.appendChild(textNode) &&
                 divApplab.appendChild(newButton));
};

Applab.image = function (opts) {
  apiValidateType(opts, 'image', 'id', opts.elementId, 'string');
  apiValidateType(opts, 'image', 'url', opts.src, 'string');

  var divApplab = document.getElementById('divApplab');

  var newImage = document.createElement("img");
  newImage.src = opts.src;
  newImage.id = opts.elementId;

  return Boolean(divApplab.appendChild(newImage));
};

Applab.imageUploadButton = function (opts) {
  var divApplab = document.getElementById('divApplab');

  // To avoid showing the ugly fileupload input element, we create a label
  // element with an img-upload class that will ensure it looks like a button
  var newLabel = document.createElement("label");
  var textNode = document.createTextNode(opts.text);
  newLabel.id = opts.elementId;
  newLabel.className = 'img-upload';

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
                 divApplab.appendChild(newLabel));
};

// These offset are used to ensure that the turtle image is centered over
// its x,y coordinates. The image is currently 48x48, rendered at 24x24.
var TURTLE_WIDTH = 24;
var TURTLE_HEIGHT = 24;
var TURTLE_ROTATION_OFFSET = -45;

function getTurtleContext() {
  var canvas = document.getElementById('turtleCanvas');

  if (!canvas) {
    // If there is not yet a turtleCanvas, create it:
    Applab.createCanvas({ 'elementId': 'turtleCanvas', 'turtleCanvas': true });
    canvas = document.getElementById('turtleCanvas');

    // And create the turtle (defaults to visible):
    Applab.turtle.visible = true;
    var divApplab = document.getElementById('divApplab');
    var turtleImage = document.createElement("img");
    turtleImage.src = studioApp.assetUrl('media/applab/723-location-arrow-toolbar-48px-centered.png');
    turtleImage.id = 'turtleImage';
    updateTurtleImage(turtleImage);
    turtleImage.ondragstart = function () { return false; };
    divApplab.appendChild(turtleImage);
  }

  return canvas.getContext("2d");
}

function updateTurtleImage(turtleImage) {
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
}

function turtleSetVisibility (visible) {
  // call this first to ensure there is a turtle (in case this is the first API)
  getTurtleContext();
  var turtleImage = document.getElementById('turtleImage');
  turtleImage.style.visibility = visible ? 'visible' : 'hidden';
}

Applab.show = function (opts) {
  turtleSetVisibility(true);
};

Applab.hide = function (opts) {
  turtleSetVisibility(false);
};

Applab.moveTo = function (opts) {
  apiValidateType(opts, 'moveTo', 'x', opts.x, 'number');
  apiValidateType(opts, 'moveTo', 'y', opts.y, 'number');
  var ctx = getTurtleContext();
  if (ctx) {
    ctx.beginPath();
    ctx.moveTo(Applab.turtle.x, Applab.turtle.y);
    Applab.turtle.x = opts.x;
    Applab.turtle.y = opts.y;
    ctx.lineTo(Applab.turtle.x, Applab.turtle.y);
    ctx.stroke();
    updateTurtleImage();
  }
};

Applab.move = function (opts) {
  apiValidateType(opts, 'move', 'x', opts.x, 'number');
  apiValidateType(opts, 'move', 'y', opts.y, 'number');
  opts.x += Applab.turtle.x;
  opts.y += Applab.turtle.y;
  Applab.moveTo(opts);
};

Applab.moveForward = function (opts) {
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
  Applab.moveTo(newOpts);
};

Applab.moveBackward = function (opts) {
  apiValidateType(opts, 'moveBackward', 'pixels', opts.distance, 'number', OPTIONAL);
  var distance = -25;
  if (typeof opts.distance !== 'undefined') {
    distance = -opts.distance;
  }
  Applab.moveForward({'distance': distance });
};

Applab.turnRight = function (opts) {
  apiValidateType(opts, 'turnRight', 'angle', opts.degrees, 'number', OPTIONAL);
  // call this first to ensure there is a turtle (in case this is the first API)
  getTurtleContext();

  var degrees = 90;
  if (typeof opts.degrees !== 'undefined') {
    degrees = opts.degrees;
  }

  Applab.turtle.heading += degrees;
  Applab.turtle.heading = (Applab.turtle.heading + 360) % 360;
  updateTurtleImage();
};

Applab.turnLeft = function (opts) {
  apiValidateType(opts, 'turnLeft', 'angle', opts.degrees, 'number', OPTIONAL);
  var degrees = -90;
  if (typeof opts.degrees !== 'undefined') {
    degrees = -opts.degrees;
  }
  Applab.turnRight({'degrees': degrees });
};

Applab.turnTo = function (opts) {
  apiValidateType(opts, 'turnTo', 'angle', opts.direction, 'number');
  var degrees = opts.direction - Applab.turtle.heading;
  Applab.turnRight({'degrees': degrees });
};

// Turn along an arc with a specified radius (by default, turn clockwise, so
// the center of the arc is 90 degrees clockwise of the current heading)
// if opts.counterclockwise, the center point is 90 degrees counterclockwise

Applab.arcRight = function (opts) {
  apiValidateType(opts, 'arcRight', 'angle', opts.degrees, 'number');
  apiValidateType(opts, 'arcRight', 'radius', opts.radius, 'number');

  // call this first to ensure there is a turtle (in case this is the first API)
  var centerAngle = opts.counterclockwise ? -90 : 90;
  var clockwiseDegrees = opts.counterclockwise ? -opts.degrees : opts.degrees;
  var ctx = getTurtleContext();
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
    updateTurtleImage();
  }
};

Applab.arcLeft = function (opts) {
  apiValidateType(opts, 'arcLeft', 'angle', opts.degrees, 'number');
  apiValidateType(opts, 'arcLeft', 'radius', opts.radius, 'number');

  opts.counterclockwise = true;
  Applab.arcRight(opts);
};

Applab.getX = function (opts) {
  var ctx = getTurtleContext();
  return Applab.turtle.x;
};

Applab.getY = function (opts) {
  var ctx = getTurtleContext();
  return Applab.turtle.y;
};

Applab.getDirection = function (opts) {
  var ctx = getTurtleContext();
  return Applab.turtle.heading;
};

Applab.dot = function (opts) {
  apiValidateTypeAndRange(opts, 'dot', 'radius', opts.radius, 'number', 0.0001);
  var ctx = getTurtleContext();
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

Applab.penUp = function (opts) {
  var ctx = getTurtleContext();
  if (ctx) {
    if (ctx.strokeStyle !== "rgba(255, 255, 255, 0)") {
      Applab.turtle.penUpColor = ctx.strokeStyle;
      ctx.strokeStyle = "rgba(255, 255, 255, 0)";
    }
  }
};

Applab.penDown = function (opts) {
  var ctx = getTurtleContext();
  if (ctx && Applab.turtle.penUpColor) {
    ctx.strokeStyle = Applab.turtle.penUpColor;
    delete Applab.turtle.penUpColor;
  }
};

Applab.penWidth = function (opts) {
  apiValidateTypeAndRange(opts, 'penWidth', 'width', opts.width, 'number', 0.0001);
  var ctx = getTurtleContext();
  if (ctx) {
    ctx.lineWidth = opts.width;
  }
};

Applab.penColorInternal = function (rgbstring) {
  var ctx = getTurtleContext();
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

Applab.penColor = function (opts) {
  apiValidateType(opts, 'penColor', 'color', opts.color, 'color');
  Applab.penColorInternal(opts.color);
};

Applab.penRGB = function (opts) {
  // PARAMNAME: penRGB: red vs. r
  // PARAMNAME: penRGB: green vs. g
  // PARAMNAME: penRGB: blue vs. b
  apiValidateTypeAndRange(opts, 'penRGB', 'r', opts.r, 'number', 0, 255);
  apiValidateTypeAndRange(opts, 'penRGB', 'g', opts.g, 'number', 0, 255);
  apiValidateTypeAndRange(opts, 'penRGB', 'b', opts.b, 'number', 0, 255);
  apiValidateTypeAndRange(opts, 'penRGB', 'a', opts.a, 'number', 0, 1, OPTIONAL);
  var alpha = (typeof opts.a === 'undefined') ? 1 : opts.a;
  var rgbstring = "rgba(" + opts.r + "," + opts.g + "," + opts.b + "," + alpha + ")";
  Applab.penColorInternal(rgbstring);
};

Applab.speed = function (opts) {
  // DOCBUG: range is 0-100, not 1-100
  apiValidateTypeAndRange(opts, 'speed', 'value', opts.percent, 'number', 0, 100);
  if (opts.percent >= 0 && opts.percent <= 100) {
    var sliderSpeed = opts.percent / 100;
    if (Applab.speedSlider) {
      Applab.speedSlider.setValue(sliderSpeed);
    }
    Applab.scale.stepSpeed = stepSpeedFromSliderSpeed(sliderSpeed);
  }
};

Applab.createCanvas = function (opts) {
  var divApplab = document.getElementById('divApplab');
  // PARAMNAME: createCanvas: id vs. canvasId
  apiValidateDomIdExistence(divApplab, opts, 'createCanvas', 'canvasId', opts.elementId, false);
  apiValidateType(opts, 'createCanvas', 'width', width, 'number', OPTIONAL);
  apiValidateType(opts, 'createCanvas', 'height', height, 'number', OPTIONAL);

  var newElement = document.createElement("canvas");
  var ctx = newElement.getContext("2d");
  if (newElement && ctx) {
    newElement.id = opts.elementId;
    // default width/height if params are missing
    var width = opts.width || Applab.appWidth;
    var height = opts.height || Applab.appHeight;
    newElement.width = width;
    newElement.height = height;
    newElement.style.width = width + 'px';
    newElement.style.height = height + 'px';
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

    return Boolean(divApplab.appendChild(newElement));
  }
  return false;
};

Applab.setActiveCanvas = function (opts) {
  var divApplab = document.getElementById('divApplab');
  // PARAMNAME: setActiveCanvas: id vs. canvasId
  apiValidateDomIdExistence(divApplab, opts, 'setActiveCanvas', 'canvasId', opts.elementId, true);
  var canvas = document.getElementById(opts.elementId);
  if (divApplab.contains(canvas)) {
    Applab.activeCanvas = canvas;
    return true;
  }
  return false;
};

Applab.line = function (opts) {
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

Applab.circle = function (opts) {
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

Applab.rect = function (opts) {
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

Applab.setStrokeWidth = function (opts) {
  apiValidateActiveCanvas(opts, 'setStrokeWidth');
  apiValidateTypeAndRange(opts, 'setStrokeWidth', 'width', opts.width, 'number', 0.0001);
  var ctx = Applab.activeCanvas && Applab.activeCanvas.getContext("2d");
  if (ctx) {
    ctx.lineWidth = opts.width;
    return true;
  }
  return false;
};

Applab.setStrokeColor = function (opts) {
  apiValidateActiveCanvas(opts, 'setStrokeColor');
  apiValidateType(opts, 'setStrokeColor', 'color', opts.color, 'color');
  var ctx = Applab.activeCanvas && Applab.activeCanvas.getContext("2d");
  if (ctx) {
    ctx.strokeStyle = String(opts.color);
    return true;
  }
  return false;
};

Applab.setFillColor = function (opts) {
  apiValidateActiveCanvas(opts, 'setFillColor');
  apiValidateType(opts, 'setFillColor', 'color', opts.color, 'color');
  var ctx = Applab.activeCanvas && Applab.activeCanvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = String(opts.color);
    return true;
  }
  return false;
};

Applab.clearCanvas = function (opts) {
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

Applab.drawImage = function (opts) {
  var divApplab = document.getElementById('divApplab');
  // PARAMNAME: drawImage: imageId vs. id
  apiValidateActiveCanvas(opts, 'drawImage');
  apiValidateDomIdExistence(divApplab, opts, 'drawImage', 'id', opts.imageId, true);
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

Applab.getImageData = function (opts) {
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

Applab.putImageData = function (opts) {
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

Applab.textInput = function (opts) {
  var divApplab = document.getElementById('divApplab');
  // PARAMNAME: textInput: id vs. inputId
  apiValidateDomIdExistence(divApplab, opts, 'textInput', 'id', opts.elementId, false);
  apiValidateType(opts, 'textInput', 'text', opts.text, 'uistring');

  var newInput = document.createElement("input");
  newInput.value = opts.text;
  newInput.id = opts.elementId;

  return Boolean(divApplab.appendChild(newInput));
};

Applab.textLabel = function (opts) {
  var divApplab = document.getElementById('divApplab');
  // PARAMNAME: textLabel: id vs. labelId
  apiValidateDomIdExistence(divApplab, opts, 'textLabel', 'id', opts.elementId, false);
  apiValidateType(opts, 'textLabel', 'text', opts.text, 'uistring');
  if (typeof opts.forId !== 'undefined') {
    apiValidateDomIdExistence(divApplab, opts, 'textLabel', 'forId', opts.forId, true);
  }

  var newLabel = document.createElement("label");
  var textNode = document.createTextNode(opts.text);
  newLabel.id = opts.elementId;
  var forElement = document.getElementById(opts.forId);
  if (forElement && divApplab.contains(forElement)) {
    newLabel.setAttribute('for', opts.forId);
  }

  return Boolean(newLabel.appendChild(textNode) &&
                 divApplab.appendChild(newLabel));
};

Applab.checkbox = function (opts) {
  var divApplab = document.getElementById('divApplab');
  // PARAMNAME: checkbox: id vs. checkboxId
  apiValidateDomIdExistence(divApplab, opts, 'checkbox', 'id', opts.elementId, false);
  // apiValidateType(opts, 'checkbox', 'checked', opts.checked, 'boolean');

  var newCheckbox = document.createElement("input");
  newCheckbox.setAttribute("type", "checkbox");
  newCheckbox.checked = opts.checked;
  newCheckbox.id = opts.elementId;

  return Boolean(divApplab.appendChild(newCheckbox));
};

Applab.radioButton = function (opts) {
  var divApplab = document.getElementById('divApplab');
  apiValidateDomIdExistence(divApplab, opts, 'radioButton', 'id', opts.elementId, false);
  // apiValidateType(opts, 'radioButton', 'checked', opts.checked, 'boolean');
  apiValidateType(opts, 'radioButton', 'group', opts.name, 'string', OPTIONAL);

  var newRadio = document.createElement("input");
  newRadio.setAttribute("type", "radio");
  newRadio.name = opts.name;
  newRadio.checked = opts.checked;
  newRadio.id = opts.elementId;

  return Boolean(divApplab.appendChild(newRadio));
};

Applab.dropdown = function (opts) {
  var divApplab = document.getElementById('divApplab');
  // PARAMNAME: dropdown: id vs. dropdownId
  apiValidateDomIdExistence(divApplab, opts, 'dropdown', 'id', opts.elementId, false);

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

  return Boolean(divApplab.appendChild(newSelect));
};

Applab.getAttribute = function (opts) {
  var divApplab = document.getElementById('divApplab');
  var element = document.getElementById(opts.elementId);
  var attribute = String(opts.attribute);
  return divApplab.contains(element) ? element[attribute] : false;
};

// Whitelist of HTML Element attributes which can be modified, to
// prevent DOM manipulation which would violate the sandbox.
Applab.mutableAttributes = ['innerHTML', 'scrollTop'];

Applab.setAttribute = function (opts) {
  var divApplab = document.getElementById('divApplab');
  var element = document.getElementById(opts.elementId);
  var attribute = String(opts.attribute);
  if (divApplab.contains(element) &&
      Applab.mutableAttributes.indexOf(attribute) !== -1) {
    element[attribute] = opts.value;
    return true;
  }
  return false;
};

Applab.getText = function (opts) {
  var divApplab = document.getElementById('divApplab');
  apiValidateDomIdExistence(divApplab, opts, 'getText', 'id', opts.elementId, true);

  var element = document.getElementById(opts.elementId);
  if (divApplab.contains(element)) {
    if (element.tagName === 'INPUT' || element.tagName === 'SELECT') {
      return String(element.value);
    } else if (element.tagName === 'IMG') {
      return String(element.alt);
    } else {
      return element.innerText;
    }
  }
  return false;
};

Applab.setText = function (opts) {
  var divApplab = document.getElementById('divApplab');
  apiValidateDomIdExistence(divApplab, opts, 'setText', 'id', opts.elementId, true);
  apiValidateType(opts, 'setText', 'text', opts.text, 'uistring');

  var element = document.getElementById(opts.elementId);
  if (divApplab.contains(element)) {
    if (element.tagName === 'INPUT' || element.tagName === 'SELECT') {
      element.value = opts.text;
    } else if (element.tagName === 'IMG') {
      element.alt = opts.text;
    } else {
      element.innerText = opts.text;
    }
    return true;
  }
  return false;
};

Applab.getChecked = function (opts) {
  var divApplab = document.getElementById('divApplab');
  apiValidateDomIdExistence(divApplab, opts, 'getChecked', 'id', opts.elementId, true);

  var element = document.getElementById(opts.elementId);
  if (divApplab.contains(element) && element.tagName === 'INPUT') {
    return element.checked;
  }
  return false;
};

Applab.setChecked = function (opts) {
  var divApplab = document.getElementById('divApplab');
  apiValidateDomIdExistence(divApplab, opts, 'setChecked', 'id', opts.elementId, true);
  // apiValidateType(opts, 'setChecked', 'checked', opts.checked, 'boolean');

  var element = document.getElementById(opts.elementId);
  if (divApplab.contains(element) && element.tagName === 'INPUT') {
    element.checked = opts.checked;
    return true;
  }
  return false;
};

Applab.getImageURL = function (opts) {
  var divApplab = document.getElementById('divApplab');
  // PARAMNAME: getImageURL: id vs. imageId
  apiValidateDomIdExistence(divApplab, opts, 'getImageURL', 'id', opts.elementId, true);

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

Applab.setImageURL = function (opts) {
  var divApplab = document.getElementById('divApplab');
  apiValidateDomIdExistence(divApplab, opts, 'setImageURL', 'id', opts.elementId, true);
  apiValidateType(opts, 'setImageURL', 'url', opts.src, 'string');

  var element = document.getElementById(opts.elementId);
  if (divApplab.contains(element) && element.tagName === 'IMG') {
    element.src = opts.src;
    return true;
  }
  return false;
};

Applab.playSound = function (opts) {
  apiValidateType(opts, 'playSound', 'url', opts.url, 'string');

  if (studioApp.cdoSounds) {
    studioApp.cdoSounds.playURL(opts.url,
                               {volume: 1.0,
                                forceHTML5: true,
                                allowHTML5Mobile: true
    });
  }
};

Applab.innerHTML = function (opts) {
  var divApplab = document.getElementById('divApplab');
  var div = document.getElementById(opts.elementId);
  if (divApplab.contains(div)) {
    div.innerHTML = opts.html;
    return true;
  }
  return false;
};

Applab.deleteElement = function (opts) {
  var divApplab = document.getElementById('divApplab');
  apiValidateDomIdExistence(divApplab, opts, 'deleteElement', 'id', opts.elementId, true);

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

Applab.showElement = function (opts) {
  var divApplab = document.getElementById('divApplab');
  apiValidateDomIdExistence(divApplab, opts, 'showElement', 'id', opts.elementId, true);

  var div = document.getElementById(opts.elementId);
  if (divApplab.contains(div)) {
    div.style.visibility = 'visible';
    return true;
  }
  return false;
};

Applab.hideElement = function (opts) {
  var divApplab = document.getElementById('divApplab');
  apiValidateDomIdExistence(divApplab, opts, 'hideElement', 'id', opts.elementId, true);

  var div = document.getElementById(opts.elementId);
  if (divApplab.contains(div)) {
    div.style.visibility = 'hidden';
    return true;
  }
  return false;
};

Applab.setStyle = function (opts) {
  var divApplab = document.getElementById('divApplab');
  var div = document.getElementById(opts.elementId);
  if (divApplab.contains(div)) {
    div.style.cssText += opts.style;
    return true;
  }
  return false;
};

Applab.setParent = function (opts) {
  var divApplab = document.getElementById('divApplab');
  var div = document.getElementById(opts.elementId);
  var divNewParent = document.getElementById(opts.parentId);
  if (divApplab.contains(div) && divApplab.contains(divNewParent)) {
    return Boolean(div.parentElement.removeChild(div) &&
                   divNewParent.appendChild(div));
  }
  return false;
};

Applab.setPosition = function (opts) {
  var divApplab = document.getElementById('divApplab');
  apiValidateDomIdExistence(divApplab, opts, 'setPosition', 'id', opts.elementId, true);
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
        el.style.width = opts.width + 'px';
        el.style.height = opts.height + 'px';
    }
    return true;
  }
  return false;
};

Applab.getXPosition = function (opts) {
  var divApplab = document.getElementById('divApplab');
  apiValidateDomIdExistence(divApplab, opts, 'getXPosition', 'id', opts.elementId, true);

  var div = document.getElementById(opts.elementId);
  if (divApplab.contains(div)) {
    var x = div.offsetLeft;
    while (div !== divApplab) {
      div = div.offsetParent;
      x += div.offsetLeft;
    }
    return x;
  }
  return 0;
};

Applab.getYPosition = function (opts) {
  var divApplab = document.getElementById('divApplab');
  apiValidateDomIdExistence(divApplab, opts, 'getYPosition', 'id', opts.elementId, true);

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

Applab.onEventFired = function (opts, e) {
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
    Applab.eventQueue.push({
      'fn': opts.func,
      'arguments': [applabEvent].concat(opts.extraArgs)
    });
  } else {
    Applab.eventQueue.push({'fn': opts.func});
  }
  if (Applab.interpreter) {
    // Execute the interpreter and if a return value is sent back from the
    // interpreter's event handler, pass that back in the native world

    // NOTE: the interpreter will not execute forever, if the event handler
    // takes too long, executeInterpreter() will return and the native side
    // will just see 'undefined' as the return value. The rest of the interpreter
    // event handler will run in the next onTick(), but the return value will
    // no longer have any effect.
    Applab.executeInterpreter(true);
    return Applab.lastCallbackRetVal;
  }
};

Applab.onEvent = function (opts) {
  var divApplab = document.getElementById('divApplab');
  // Special case the id of 'body' to mean the app's container (divApplab)
  // TODO (cpirich): apply this logic more broadly (setStyle, etc.)
  if (opts.elementId === 'body') {
    opts.elementId = 'divApplab';
  } else {
    apiValidateDomIdExistence(divApplab, opts, 'onEvent', 'id', opts.elementId, true);
  }
  apiValidateType(opts, 'onEvent', 'type', opts.eventName, 'string');
  // PARAMNAME: onEvent: callback vs. callbackFunction
  apiValidateType(opts, 'onEvent', 'callback', opts.func, 'function');
  var domElement = document.getElementById(opts.elementId);
  if (divApplab.contains(domElement)) {
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
                         Applab.onEventFired.bind(this, opts));
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
            Applab.onEventFired.bind(this, opts));
        break;
      default:
        return false;
    }
    return true;
  }
  return false;
};

Applab.onHttpRequestEvent = function (opts) {
  // Ensure that this event was requested by the same instance of the interpreter
  // that is currently active before proceeding...
  if (opts.interpreter === Applab.interpreter) {
    if (this.readyState === 4) {
      Applab.eventQueue.push({
        'fn': opts.func,
        'arguments': [
          Number(this.status),
          String(this.getResponseHeader('content-type')),
          String(this.responseText)]
      });
    }
  }
};

Applab.startWebRequest = function (opts) {
  apiValidateType(opts, 'startWebRequest', 'url', opts.url, 'string');
  apiValidateType(opts, 'startWebRequest', 'callback', opts.func, 'function');
  opts.interpreter = Applab.interpreter;
  var req = new XMLHttpRequest();
  req.onreadystatechange = Applab.onHttpRequestEvent.bind(req, opts);
  req.open('GET', opts.url, true);
  req.send();
};

Applab.onTimerFired = function (opts) {
  // ensure that this event came from the active interpreter instance:
  Applab.eventQueue.push({
    'fn': opts.func
  });
  // NOTE: the interpreter will not execute forever, if the event handler
  // takes too long, executeInterpreter() will return and the rest of the
  // user's code will execute in the next onTick()
  Applab.executeInterpreter(true);
};

Applab.setTimeout = function (opts) {
  // PARAMNAME: setTimeout: callback vs. function
  // PARAMNAME: setTimeout: ms vs. milliseconds
  apiValidateType(opts, 'setTimeout', 'callback', opts.func, 'function');
  apiValidateType(opts, 'setTimeout', 'milliseconds', opts.milliseconds, 'number');

  return apiTimeoutList.setTimeout(Applab.onTimerFired.bind(this, opts), opts.milliseconds);
};

Applab.clearTimeout = function (opts) {
  apiValidateType(opts, 'clearTimeout', 'timeout', opts.timeoutId, 'number');
  // NOTE: we do not currently check to see if this is a timer created by
  // our Applab.setTimeout() function
  apiTimeoutList.clearTimeout(opts.timeoutId);
};

Applab.setInterval = function (opts) {
  // PARAMNAME: setInterval: callback vs. function
  // PARAMNAME: setInterval: ms vs. milliseconds
  apiValidateType(opts, 'setInterval', 'callback', opts.func, 'function');
  apiValidateType(opts, 'setInterval', 'milliseconds', opts.milliseconds, 'number');

  return apiTimeoutList.setInterval(Applab.onTimerFired.bind(this, opts), opts.milliseconds);
};

Applab.clearInterval = function (opts) {
  apiValidateType(opts, 'clearInterval', 'interval', opts.intervalId, 'number');
  // NOTE: we do not currently check to see if this is a timer created by
  // our Applab.setInterval() function
  apiTimeoutList.clearInterval(opts.intervalId);
};

Applab.createRecord = function (opts) {
  // PARAMNAME: createRecord: table vs. tableName
  // PARAMNAME: createRecord: callback vs. callbackFunction
  apiValidateType(opts, 'createRecord', 'table', opts.table, 'string');
  apiValidateType(opts, 'createRecord', 'record', opts.record, 'object');
  apiValidateType(opts, 'createRecord', 'record.id', opts.record.id, 'undefined');
  apiValidateType(opts, 'createRecord', 'callback', opts.onSuccess, 'function', OPTIONAL);
  apiValidateType(opts, 'createRecord', 'onError', opts.onError, 'function', OPTIONAL);
  opts.interpreter = Applab.interpreter;
  var onSuccess = Applab.handleCreateRecord.bind(this, opts);
  var onError = Applab.handleError.bind(this, opts);
  AppStorage.createRecord(opts.table, opts.record, onSuccess, onError);
};

Applab.handleCreateRecord = function(opts, record) {
  // Ensure that this event was requested by the same instance of the interpreter
  // that is currently active before proceeding...
  if (opts.onSuccess && opts.interpreter === Applab.interpreter) {
    Applab.eventQueue.push({
      'fn': opts.onSuccess,
      'arguments': [record]
    });
  }
};

Applab.handleError = function(opts, message) {
  // Ensure that this event was requested by the same instance of the interpreter
  // that is currently active before proceeding...
  if (opts.onError && opts.interpreter === Applab.interpreter) {
    Applab.eventQueue.push({
      'fn': opts.onError,
      'arguments': [message]
    });
  } else {
    outputApplabConsole(message);
  }
};

Applab.getKeyValue = function(opts) {
  // PARAMNAME: getKeyValue: callback vs. callbackFunction
  apiValidateType(opts, 'getKeyValue', 'key', opts.key, 'string');
  apiValidateType(opts, 'getKeyValue', 'callback', opts.onSuccess, 'function');
  apiValidateType(opts, 'getKeyValue', 'onError', opts.onError, 'function', OPTIONAL);
  opts.interpreter = Applab.interpreter;
  var onSuccess = Applab.handleReadValue.bind(this, opts);
  var onError = Applab.handleError.bind(this, opts);
  AppStorage.getKeyValue(opts.key, onSuccess, onError);
};

Applab.handleReadValue = function(opts, value) {
  // Ensure that this event was requested by the same instance of the interpreter
  // that is currently active before proceeding...
  if (opts.onSuccess && opts.interpreter === Applab.interpreter) {
    Applab.eventQueue.push({
      'fn': opts.onSuccess,
      'arguments': [value]
    });
  }
};

Applab.setKeyValue = function(opts) {
  // PARAMNAME: setKeyValue: callback vs. callbackFunction
  apiValidateType(opts, 'setKeyValue', 'key', opts.key, 'string');
  apiValidateType(opts, 'setKeyValue', 'value', opts.value, 'primitive');
  apiValidateType(opts, 'setKeyValue', 'callback', opts.onSuccess, 'function', OPTIONAL);
  apiValidateType(opts, 'setKeyValue', 'onError', opts.onError, 'function', OPTIONAL);
  opts.interpreter = Applab.interpreter;
  var onSuccess = Applab.handleSetKeyValue.bind(this, opts);
  var onError = Applab.handleError.bind(this, opts);
  AppStorage.setKeyValue(opts.key, opts.value, onSuccess, onError);
};

Applab.handleSetKeyValue = function(opts) {
  // Ensure that this event was requested by the same instance of the interpreter
  // that is currently active before proceeding...
  if (opts.onSuccess && opts.interpreter === Applab.interpreter) {
    Applab.eventQueue.push({
      'fn': opts.onSuccess,
      'arguments': []
    });
  }
};

Applab.readRecords = function (opts) {
  // PARAMNAME: readRecords: table vs. tableName
  // PARAMNAME: readRecords: callback vs. callbackFunction
  // PARAMNAME: readRecords: terms vs. searchTerms
  apiValidateType(opts, 'readRecords', 'table', opts.table, 'string');
  apiValidateType(opts, 'readRecords', 'searchTerms', opts.searchParams, 'object');
  apiValidateType(opts, 'readRecords', 'callback', opts.onSuccess, 'function');
  apiValidateType(opts, 'readRecords', 'onError', opts.onError, 'function', OPTIONAL);
  opts.interpreter = Applab.interpreter;
  var onSuccess = Applab.handleReadRecords.bind(this, opts);
  var onError = Applab.handleError.bind(this, opts);
  AppStorage.readRecords(opts.table, opts.searchParams, onSuccess, onError);
};

Applab.handleReadRecords = function(opts, records) {
  // Ensure that this event was requested by the same instance of the interpreter
  // that is currently active before proceeding...
  if (opts.onSuccess && opts.interpreter === Applab.interpreter) {
    Applab.eventQueue.push({
      'fn': opts.onSuccess,
      'arguments': [records]
    });
  }
};

Applab.updateRecord = function (opts) {
  // PARAMNAME: updateRecord: table vs. tableName
  // PARAMNAME: updateRecord: callback vs. callbackFunction
  apiValidateType(opts, 'updateRecord', 'table', opts.table, 'string');
  apiValidateType(opts, 'updateRecord', 'record', opts.record, 'object');
  apiValidateTypeAndRange(opts, 'updateRecord', 'record.id', opts.record.id, 'number', 1, Infinity);
  apiValidateType(opts, 'updateRecord', 'callback', opts.onSuccess, 'function', OPTIONAL);
  apiValidateType(opts, 'updateRecord', 'onError', opts.onError, 'function', OPTIONAL);
  opts.interpreter = Applab.interpreter;
  var onSuccess = Applab.handleUpdateRecord.bind(this, opts);
  var onError = Applab.handleError.bind(this, opts);
  AppStorage.updateRecord(opts.table, opts.record, onSuccess, onError);
};

Applab.handleUpdateRecord = function(opts, record) {
  // Ensure that this event was requested by the same instance of the interpreter
  // that is currently active before proceeding...
  if (opts.onSuccess && opts.interpreter === Applab.interpreter) {
    Applab.eventQueue.push({
      'fn': opts.onSuccess,
      'arguments': [record]
    });
  }
};

Applab.deleteRecord = function (opts) {
  // PARAMNAME: deleteRecord: table vs. tableName
  // PARAMNAME: deleteRecord: callback vs. callbackFunction
  apiValidateType(opts, 'deleteRecord', 'table', opts.table, 'string');
  apiValidateType(opts, 'deleteRecord', 'record', opts.record, 'object');
  apiValidateTypeAndRange(opts, 'deleteRecord', 'record.id', opts.record.id, 'number', 1, Infinity);
  apiValidateType(opts, 'deleteRecord', 'callback', opts.onSuccess, 'function', OPTIONAL);
  apiValidateType(opts, 'deleteRecord', 'onError', opts.onError, 'function', OPTIONAL);
  opts.interpreter = Applab.interpreter;
  var onSuccess = Applab.handleDeleteRecord.bind(this, opts);
  var onError = Applab.handleError.bind(this, opts);
  AppStorage.deleteRecord(opts.table, opts.record, onSuccess, onError);
};

Applab.handleDeleteRecord = function(opts) {
  // Ensure that this event was requested by the same instance of the interpreter
  // that is currently active before proceeding...
  if (opts.onSuccess && opts.interpreter === Applab.interpreter) {
    Applab.eventQueue.push({
      'fn': opts.onSuccess,
      'arguments': []
    });
  }
};

Applab.getUserId = function (opts) {
  if (!user.applabUserId) {
    throw new Error("User ID failed to load.");
  }
  return user.applabUserId;
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

// TODO(dave): move this logic to dashboard.
var getPegasusHost = function() {
  switch (window.location.hostname) {
    case 'studio.code.org':
    case 'learn.code.org':
      return 'code.org';
    default:
      var name = window.location.hostname.split('.')[0];
      switch(name) {
        case 'localhost':
          return 'localhost.code.org:3000';
        case 'development':
        case 'staging':
        case 'test':
        case 'levelbuilder':
          return name + '.code.org';
        case 'staging-studio':
          return 'staging.code.org';
        case 'test-studio':
          return 'test.code.org';
        case 'levelbuilder-studio':
          return 'levelbuilder.code.org';
        default:
          return null;
      }
  }
};
