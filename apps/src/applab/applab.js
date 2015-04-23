/**
 * CodeOrgApp: Applab
 *
 * Copyright 2014-2015 Code.org
 *
 */
/* global $ */

'use strict';
require('./acemode/mode-javascript_codeorg');
var studioApp = require('../StudioApp').singleton;
var commonMsg = require('../../locale/current/common');
var applabMsg = require('../../locale/current/applab');
var skins = require('../skins');
var codegen = require('../codegen');
var api = require('./api');
var dontMarshalApi = require('./dontMarshalApi');
var blocks = require('./blocks');
var page = require('../templates/page.html');
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
var Hammer = utils.getHammer();
var apiTimeoutList = require('../timeoutList');
var RGBColor = require('./rgbcolor.js');
var annotationList = require('./acemode/annotationList');

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

          var changedChildRules = 0;
          var scale = scaleFactors[curScaleIndex];
          for (var k = 0; k < childRules.length && changedChildRules < 6; k++) {
            if (childRules[k].selectorText === "div#visualization.responsive") {
              // For this scale factor...
              // set the max-height and max-width for the visualization
              childRules[k].style.cssText = "max-height: " +
                  Applab.appHeight * scale + "px; max-width: " +
                  Applab.appWidth * scale + "px;";
              changedChildRules++;
            } else if (childRules[k].selectorText === "div#visualizationColumn.responsive") {
              // set the max-width for the parent visualizationColumn
              childRules[k].style.cssText = "max-width: " +
                  Applab.appWidth * scale + "px;";
              changedChildRules++;
            } else if (childRules[k].selectorText === "div#visualizationColumn.responsive.with_padding") {
              // set the max-width for the parent visualizationColumn (with_padding)
              childRules[k].style.cssText = "max-width: " +
                  (Applab.appWidth * scale + 2) + "px;";
              changedChildRules++;
            } else if (childRules[k].selectorText === "div#codeWorkspace") {
              // set the left for the codeWorkspace
              childRules[k].style.cssText = "left: " +
                  Applab.appWidth * scale + "px;";
              changedChildRules++;
            } else if (childRules[k].selectorText === "html[dir='rtl'] div#codeWorkspace") {
              // set the right for the codeWorkspace (RTL mode)
              childRules[k].style.cssText = "right: " +
                  Applab.appWidth * scale + "px;";
              changedChildRules++;
            } else if (childRules[k].selectorText === "div#visualization.responsive > *") {
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
  return scaleFactors;
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
    if (debugOutput.value.length > 0) {
      debugOutput.value += '\n' + output;
    } else {
      debugOutput.value = output;
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
    } else if (expectedType === 'function') {
      // Special handling for functions, it must be an interpreter function:
      properType = (typeof varValue === 'object') && (varValue.type === 'function');
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
                                 expectedType, minValue, maxValue) {
  var validatedTypeKey = 'validated_type_' + varName;
  var validatedRangeKey = 'validated_range_' + varName;
  apiValidateType(opts, funcName, varName, varValue, expectedType);
  if (opts[validatedTypeKey] && typeof opts[validatedRangeKey] === 'undefined') {
    var inRange = (typeof minValue === 'undefined') || (varValue >= minValue);
    if (inRange) {
      inRange = (typeof maxValue === 'undefined') || (varValue <= maxValue);
    }
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
    range.start.col = col;
    range.end.row = row;
    range.end.col = col + 1;

    selection.setSelectionRange(range);
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
  Applab.onPuzzleComplete();
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
    try { Applab.whenRunFunc(studioApp, api, Applab.Globals); } catch (e) { }
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
      } else {
        Applab.onPauseButton();
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
        // If we've arrived at a BlockStatement, set doneUserLine even though the
        // the stateStack doesn't have "done" set, so that stepping in the debugger makes
        // sense (otherwise we'll skip over the first line in loops):
        doneUserLine = doneUserLine ||
          (inUserCode && Applab.interpreter.stateStack[0].node.type === "BlockStatement");
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
  Applab.clearEventHandlersKillTickLoop();
  skin = config.skin;
  level = config.level;
  user = {
    applabUserId: config.applabUserId,
    isAdmin: !!config.isAdmin
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

  Applab.vizScaleFactors = adjustAppSizeStyles(document.getElementById(config.containerId));

  var showSlider = !config.hideSource && config.level.editCode;
  var showDebugButtons = !config.hideSource && config.level.editCode;
  var showDebugConsole = !config.hideSource && config.level.editCode;
  var firstControlsRow = require('./controls.html')({
    assetUrl: studioApp.assetUrl,
    showSlider: showSlider,
    finishButton: true
  });
  var extraControlsRow = require('./extraControlRows.html')({
    assetUrl: studioApp.assetUrl,
    debugButtons: showDebugButtons,
    debugConsole: showDebugConsole
  });
  var designProperties = require('./designProperties.html')({tagName:null});
  var designModeBox = require('./designModeBox.html')({
    designProperties: designProperties
  });

  config.html = page({
    assetUrl: studioApp.assetUrl,
    data: {
      localeDirection: studioApp.localeDirection(),
      visualization: require('./visualization.html')(),
      controls: firstControlsRow,
      extraControlRows: extraControlsRow,
      blockUsed: undefined,
      idealBlockNumber: undefined,
      editCode: level.editCode,
      blockCounterClass: 'block-counter-default',
      pinWorkspaceToBottom: true,
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
      window.setTimeout(studioApp.runButtonClick.bind(studioApp), 0);
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
      Applab.speedSlider = new Slider(10, 35, 130, slider);

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

  var finishButton = document.getElementById('finishButton');
  dom.addClickTouchEvent(finishButton, Applab.onPuzzleComplete);

  if (level.editCode) {
    var pauseButton = document.getElementById('pauseButton');
    var stepInButton = document.getElementById('stepInButton');
    var stepOverButton = document.getElementById('stepOverButton');
    var stepOutButton = document.getElementById('stepOutButton');
    if (pauseButton && stepInButton && stepOverButton && stepOutButton) {
      dom.addClickTouchEvent(pauseButton, Applab.onPauseButton);
      dom.addClickTouchEvent(stepInButton, Applab.onStepInButton);
      dom.addClickTouchEvent(stepOverButton, Applab.onStepOverButton);
      dom.addClickTouchEvent(stepOutButton, Applab.onStepOutButton);
    }
    var viewDataButton = document.getElementById('viewDataButton');
    if (viewDataButton) {
      dom.addClickTouchEvent(viewDataButton, Applab.onViewData);
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
      dom.addClickTouchEvent(designModeClear, Applab.onDesignModeClear);
    }

    // Allow elements to be dragged and dropped from the design mode
    // element tray to the play space.
    if (window.$) {
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
      var scale = vizAppWidth / Applab.appWidth;
      var gridSize = 20;
      $('#visualization').droppable({
        accept: '.new-design-element',
        drop: function (event, ui) {
          var elementType = ui.draggable[0].dataset.elementType;

          var left = ui.position.left / scale;
          left = Math.round(left - left % gridSize);
          var top = ui.position.top / scale;
          top = Math.round(top - top % gridSize);

          Applab.createElement(elementType, left, top);
        }
      });
    }

  }
};

/**
 * The types of acceptable HTML elements in the levelHtml.
 * @type {{BUTTON: string, LABEL: string, INPUT: string}}
 */
var ElementType = {
  BUTTON: 'button',
  LABEL: 'label',
  INPUT: 'input'
};
Applab.ElementType = ElementType;

/**
 * A map from prefix to the next numerical suffix to try to
 * use as an id in the applab app's DOM.
 * @type {Object.<string, number>}
 */
Applab.nextElementIdMap = {};

/**
 * Returns an element id with the given prefix which is unused within
 * the applab app's DOM.
 * @param {string} prefix
 * @returns {string}
 */
Applab.getUnusedElementId = function (prefix) {
  var divApplab = $('#divApplab');
  var i = Applab.nextElementIdMap[prefix] || 1;
  while (divApplab.find("#" + prefix + i).length !== 0) {
    i++;
  }
  Applab.nextElementIdMap[prefix] = i + 1;
  return prefix + i;
};

/**
 * Create a new element of the specified type within the play space.
 * @param {ElementType} elementType HTML element type to create.
 * @param {number} left Position from left.
 * @param {number} top Position from top.
 */
Applab.createElement = function (elementType, left, top) {
  var el = document.createElement(elementType);
  switch (elementType) {
    case ElementType.BUTTON:
      el.appendChild(document.createTextNode('Button'));
      el.style.margin = 0;
      break;
    case ElementType.LABEL:
      el.appendChild(document.createTextNode("text"));
      el.style.margin = '10px';
      break;
    case ElementType.INPUT:
      el.style.margin = '10px';
      break;
    default:
      throw "unrecognized element type " + elementType;
  }
  el.id = Applab.getUnusedElementId(elementType);
  el.style.position = 'absolute';
  el.style.left = left + 'px';
  el.style.top = top + 'px';

  var divApplab = document.getElementById('divApplab');
  divApplab.appendChild(el);
  Applab.makeDraggable($(el));
  Applab.levelHtml = Applab.serializeToLevelHtml();
};

/**
 *
 * @param {jQuery} jq jQuery object containing DOM elements to make draggable.
 */
Applab.makeDraggable = function (jq) {
  var gridSize = 20;
  jq.draggable({
    cancel: false,  // allow buttons and inputs to be dragged
    drag: function(event, ui) {
      // draggables are not compatible with CSS transform-scale,
      // so adjust the position in various ways here.

      // dragging
      var scale = Applab.getVizScaleFactor();
      var changeLeft = ui.position.left - ui.originalPosition.left;
      var newLeft  = (ui.originalPosition.left + changeLeft) / scale;
      var changeTop = ui.position.top - ui.originalPosition.top;
      var newTop = (ui.originalPosition.top + changeTop) / scale;

      // containment
      var container = $('#divApplab');
      var maxLeft = container.width() - ui.helper.outerWidth(true);
      var maxTop = container.height() - ui.helper.outerHeight(true);
      newLeft = Math.min(newLeft, maxLeft);
      newLeft = Math.max(newLeft, 0);
      newTop = Math.min(newTop, maxTop);
      newTop = Math.max(newTop, 0);

      // grid
      newLeft -= newLeft % gridSize;
      newTop -= newTop % gridSize;

      ui.position.left = newLeft;
      ui.position.top = newTop;
    },
    stop: function(event, ui) {
      Applab.levelHtml = Applab.serializeToLevelHtml();
    }
  });
};

Applab.getVizScaleFactor = function () {
  var width = $('body').width();
  var vizScaleBreakpoints = [1150, 1100, 1050, 1000, 0];
  if (vizScaleBreakpoints.length !== Applab.vizScaleFactors.length) {
    throw 'Wrong number of elements in Applab.vizScaleFactors ' +
        Applab.vizScaleFactors;
  }
  for (var i = 0; i < vizScaleBreakpoints.length; i++) {
    if (width > vizScaleBreakpoints[i]) {
      return Applab.vizScaleFactors[i];
    }
  }
  throw 'Unexpected body width: ' + width;
};

Applab.onDivApplabClick = function (event) {
  if (!window.$ || $('#designModeButton').is(':visible') ||
      $('#resetButton').is(':visible')) {
    return;
  }
  event.preventDefault();
  Applab.editElementProperties(event.target);
};

// Currently there is a 1:1 mapping between applab element types and HTML tag names
// (input, label, button, ...), so elements are simply identified by tag name.
Applab.editElementProperties = function(el) {
  var tagName = el.tagName.toLowerCase();
  if (!Applab.isValidElementType(tagName)) {
   Applab.clearProperties();
   return;
  }

  var designPropertiesEl = document.getElementById('design-properties');
  designPropertiesEl.innerHTML = require('./designProperties.html')({
    tagName: tagName,
    props: {
      id: el.id,
      left: el.style.left,
      top: el.style.top,
      width: el.style.width,
      height: el.style.height,
      text: $(el).text()
    }
  });
  var savePropertiesButton = document.getElementById('savePropertiesButton');
  var onSave = Applab.onSavePropertiesButton.bind(this, el);
  if (savePropertiesButton) {
    dom.addClickTouchEvent(savePropertiesButton, onSave);
  }
  var deletePropertiesButton = document.getElementById('deletePropertiesButton');
  var onDelete = Applab.onDeletePropertiesButton.bind(this, el);
  if (deletePropertiesButton) {
    dom.addClickTouchEvent(deletePropertiesButton, onDelete);
  }
};

Applab.clearProperties = function () {
  var designPropertiesEl = document.getElementById('design-properties');
  designPropertiesEl.innerHTML = require('./designProperties.html')({
    tagName: null
  });
};

Applab.isValidElementType = function (type) {
  for (var prop in Applab.ElementType) {
    if (type === Applab.ElementType[prop]) {
      return true;
    }
  }
  return false;
};

Applab.onSavePropertiesButton = function(el, event) {
  el.id = document.getElementById('design-property-id').value;
  el.style.left = document.getElementById('design-property-left').value;
  el.style.top = document.getElementById('design-property-top').value;
  el.style.width = document.getElementById('design-property-width').value;
  el.style.height = document.getElementById('design-property-height').value;
  $(el).text(document.getElementById('design-property-text').value);
  Applab.levelHtml = Applab.serializeToLevelHtml();
};

Applab.onDeletePropertiesButton = function(el, event) {
  el.parentNode.removeChild(el);
  Applab.levelHtml = Applab.serializeToLevelHtml();
  Applab.clearProperties();
};

Applab.serializeToLevelHtml = function () {
  var s = new XMLSerializer();
  var divApplab = document.getElementById('divApplab');
  var clone = divApplab.cloneNode(true);
  // Remove unwanted classes added by jQuery.draggable.
  $(clone).find('*').removeAttr('class');
  return s.serializeToString(clone);
};

Applab.parseFromLevelHtml = function(rootEl, isDesignMode) {
  if (!Applab.levelHtml) {
    return;
  }
  var levelDom = $.parseHTML(Applab.levelHtml);
  var children = $(levelDom).children();
  children.appendTo(rootEl);
  if (isDesignMode) {
    Applab.makeDraggable(children);
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
  var stepInButton = document.getElementById('stepInButton');
  var stepOverButton = document.getElementById('stepOverButton');
  var stepOutButton = document.getElementById('stepOutButton');
  if (pauseButton && stepInButton && stepOverButton && stepOutButton) {
    pauseButton.textContent = applabMsg.pause();
    pauseButton.disabled = true;
    stepInButton.disabled = true;
    stepOverButton.disabled = true;
    stepOutButton.disabled = true;
  }
};

/**
 * Reset the app to the start position and kill any pending animation tasks.
 * @param {boolean} first True if an opening animation is to be played.
 */
studioApp.reset = function(first) {
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

  var isDesignMode = window.$ && $('#codeModeButton').is(':visible');
  Applab.parseFromLevelHtml(newDivApplab, isDesignMode);

  newDivApplab.addEventListener('click', Applab.onDivApplabClick);


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
    var stepInButton = document.getElementById('stepInButton');
    var stepOverButton = document.getElementById('stepOverButton');
    var stepOutButton = document.getElementById('stepOutButton');
    if (pauseButton && stepInButton && stepOverButton && stepOutButton) {
      pauseButton.textContent = applabMsg.pause();
      pauseButton.disabled = true;
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
      debugOutput.value = '';
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

/**
 * Click the run button.  Start the program.
 */
// XXX This is the only method used by the templates!
studioApp.runButtonClick = function() {
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

  // Show view data button now that channel id is available.
  var viewDataButton = document.getElementById('viewDataButton');
  if (viewDataButton) {
    viewDataButton.style.display = "inline-block";
  }

  if (level.freePlay && !studioApp.hideSource) {
    var shareCell = document.getElementById('share-cell');
    shareCell.className = 'share-cell-enabled';
    var designCell = document.getElementById('design-cell');
    if (designCell) {
      designCell.className = 'design-cell-enabled';
    }
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
                         Applab: api,
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

var JSONApi = {};

// NOTE: this version of parse does not support the reviver parameter

JSONApi.parse = function(text) {
  return JSON.parse(text);
};

JSONApi.stringify = function(object) {
  return JSON.stringify(object);
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
    codeWhenRun = dropletUtils.generateCodeAliases(dropletConfig, 'Applab');
    Applab.userCodeStartOffset = codeWhenRun.length;
    Applab.userCodeLineOffset = codeWhenRun.split("\n").length - 1;
    codeWhenRun += studioApp.editor.getValue();
    Applab.userCodeLength = codeWhenRun.length - Applab.userCodeStartOffset;
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
                                  scope,
                                  { Applab: api,
                                    console: consoleApi,
                                    JSON: JSONApi });

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
                                          Applab: api,
                                          Globals: Applab.Globals } );
    }
  }

  if (level.editCode) {
    var pauseButton = document.getElementById('pauseButton');
    var stepInButton = document.getElementById('stepInButton');
    var stepOverButton = document.getElementById('stepOverButton');
    var stepOutButton = document.getElementById('stepOutButton');
    if (pauseButton && stepInButton && stepOverButton && stepOutButton) {
      pauseButton.disabled = false;
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

Applab.onPauseButton = function() {
  if (Applab.running) {
    var pauseButton = document.getElementById('pauseButton');
    var stepInButton = document.getElementById('stepInButton');
    var stepOverButton = document.getElementById('stepOverButton');
    var stepOutButton = document.getElementById('stepOutButton');
    // We have code and are either running or paused
    if (Applab.paused) {
      Applab.paused = false;
      Applab.nextStep = StepType.RUN;
      pauseButton.textContent = applabMsg.pause();
    } else {
      Applab.paused = true;
      Applab.nextStep = StepType.RUN;
      pauseButton.textContent = applabMsg.continue();
    }
    stepInButton.disabled = !Applab.paused;
    stepOverButton.disabled = !Applab.paused;
    stepOutButton.disabled = !Applab.paused;
    document.getElementById('spinner').style.visibility =
        Applab.paused ? 'hidden' : 'visible';
  }
};

Applab.onStepOverButton = function() {
  if (Applab.running) {
    Applab.paused = true;
    Applab.nextStep = StepType.OVER;
    document.getElementById('spinner').style.visibility = 'visible';
  }
};

Applab.onStepInButton = function() {
  if (!Applab.running) {
    studioApp.runButtonClick();
    Applab.onPauseButton();
  }
  Applab.paused = true;
  Applab.nextStep = StepType.IN;
  document.getElementById('spinner').style.visibility = 'visible';
};

Applab.onStepOutButton = function() {
  if (Applab.running) {
    Applab.paused = true;
    Applab.nextStep = StepType.OUT;
    document.getElementById('spinner').style.visibility = 'visible';
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
  studioApp.resetButtonClick();
  Applab.toggleDesignMode(true);
};

Applab.onCodeModeButton = function() {
  Applab.toggleDesignMode(false);
};

Applab.onDesignModeClear = function() {
  document.getElementById('divApplab').innerHTML = Applab.levelHtml = "";
};

Applab.toggleDesignMode = function(enable) {
  var codeModeHeaders = document.getElementById('codeModeHeaders');
  codeModeHeaders.style.display = enable ? 'none' : 'block';
  var designModeHeaders = document.getElementById('designModeHeaders');
  designModeHeaders.style.display = enable ? 'block' : 'none';

  var codeTextbox = document.getElementById('codeTextbox');
  codeTextbox.style.display = enable ? 'none' : 'block';
  var designModeBox = document.getElementById('designModeBox');
  designModeBox.style.display = enable ? 'block' : 'none';

  var designModeButton = document.getElementById('designModeButton');
  designModeButton.style.display = enable ? 'none' : 'block';
  var codeModeButton = document.getElementById('codeModeButton');
  codeModeButton.style.display = enable ? 'block' : 'none';

  var debugArea = document.getElementById('debug-area');
  debugArea.style.display = enable ? 'none' : 'block';

  var children = $('#divApplab').children();
  if (enable) {
    Applab.makeDraggable(children);
  } else if (children.data('uiDraggable')) {
    children.draggable('destroy');
  }
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
  // TODO: cpirich: may need to update param name
  apiValidateType(opts, 'write', 'html', opts.html, 'string');
  return Applab.container(opts);
};

Applab.button = function (opts) {
  var divApplab = document.getElementById('divApplab');

  // TODO: cpirich: may need to update param name
  apiValidateDomIdExistence(divApplab, opts, 'button', 'id', opts.elementId, false);
  apiValidateType(opts, 'button', 'text', opts.text, 'string');

  var newButton = document.createElement("button");
  var textNode = document.createTextNode(opts.text);
  newButton.id = opts.elementId;

  return Boolean(newButton.appendChild(textNode) &&
                 divApplab.appendChild(newButton));
};

Applab.image = function (opts) {
  // TODO: cpirich: may need to update param name
  apiValidateType(opts, 'image', 'id', opts.elementId, 'string');
  apiValidateType(opts, 'image', 'src', opts.src, 'string');

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
  var newOpts = {};
  var distance = 25;
  if (typeof opts.distance !== 'undefined') {
    apiValidateType(opts, 'moveForward', 'pixels', opts.distance, 'number');
    distance = opts.distance;
  }
  newOpts.x = Applab.turtle.x +
    distance * Math.sin(2 * Math.PI * Applab.turtle.heading / 360);
  newOpts.y = Applab.turtle.y -
    distance * Math.cos(2 * Math.PI * Applab.turtle.heading / 360);
  Applab.moveTo(newOpts);
};

Applab.moveBackward = function (opts) {
  var distance = -25;
  if (typeof opts.distance !== 'undefined') {
    apiValidateType(opts, 'moveBackward', 'pixels', opts.distance, 'number');
    distance = -opts.distance;
  }
  Applab.moveForward({'distance': distance });
};

Applab.turnRight = function (opts) {
  // call this first to ensure there is a turtle (in case this is the first API)
  getTurtleContext();

  var degrees = 90;
  if (typeof opts.degrees !== 'undefined') {
    // TODO: cpirich: may need to update param name
    apiValidateType(opts, 'turnRight', 'degrees', opts.degrees, 'number');
    degrees = opts.degrees;
  }

  Applab.turtle.heading += degrees;
  Applab.turtle.heading = (Applab.turtle.heading + 360) % 360;
  updateTurtleImage();
};

Applab.turnLeft = function (opts) {
  var degrees = -90;
  if (typeof opts.degrees !== 'undefined') {
    // TODO: cpirich: may need to update param name
    apiValidateType(opts, 'turnLeft', 'degrees', opts.degrees, 'number');
    degrees = -opts.degrees;
  }
  Applab.turnRight({'degrees': degrees });
};

Applab.turnTo = function (opts) {
  // TODO: cpirich: may need to update param name
  apiValidateType(opts, 'turnTo', 'degrees', opts.direction, 'number');
  var degrees = opts.direction - Applab.turtle.heading;
  Applab.turnRight({'degrees': degrees });
};

// Turn along an arc with a specified radius (by default, turn clockwise, so
// the center of the arc is 90 degrees clockwise of the current heading)
// if opts.counterclockwise, the center point is 90 degrees counterclockwise

Applab.arcRight = function (opts) {
  // TODO: cpirich: may need to update param name
  apiValidateType(opts, 'arcRight', 'degrees', opts.degrees, 'number');
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
  // TODO: cpirich: may need to update param name
  apiValidateType(opts, 'arcLeft', 'degrees', opts.degrees, 'number');
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
  if (ctx) {
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
  // TODO: cpirich: may need to update param name
  apiValidateTypeAndRange(opts, 'penWidth', 'width', opts.width, 'number', 0.0001);
  var ctx = getTurtleContext();
  if (ctx) {
    ctx.lineWidth = opts.width;
  }
};

Applab.penColor = function (opts) {
  apiValidateType(opts, 'penColor', 'color', opts.color, 'color');
  var ctx = getTurtleContext();
  if (ctx) {
    if (Applab.turtle.penUpColor) {
      // pen is currently up, store this color for pen down
      Applab.turtle.penUpColor = opts.color;
    } else {
      ctx.strokeStyle = opts.color;
    }
    ctx.fillStyle = opts.color;
  }
};

Applab.speed = function (opts) {
  // TODO: cpirich: may need to update param name
  apiValidateTypeAndRange(opts, 'speed', 'percent', opts.percent, 'number', 0, 100);
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
  apiValidateDomIdExistence(divApplab, opts, 'createCanvas', 'canvasId', opts.elementId, false);

  var newElement = document.createElement("canvas");
  var ctx = newElement.getContext("2d");
  if (newElement && ctx) {
    newElement.id = opts.elementId;
    // default width/height if params are missing
    var width = opts.width || Applab.appWidth;
    var height = opts.height || Applab.appHeight;
    apiValidateType(opts, 'createCanvas', 'width', width, 'number');
    apiValidateType(opts, 'createCanvas', 'height', height, 'number');
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
  // TODO: cpirich: may need to update param name
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
  // TODO: cpirich: may need to update param name
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
  // TODO: cpirich: may need to update param name
  apiValidateActiveCanvas(opts, 'drawImage');
  apiValidateDomIdExistence(divApplab, opts, 'drawImage', 'imageId', opts.imageId, true);
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
  // TODO: cpirich: may need to update param name
  apiValidateActiveCanvas(opts, 'putImageData');
  apiValidateType(opts, 'putImageData', 'imageData', opts.imageData, 'object');
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
  // TODO: cpirich: may need to update param name
  apiValidateDomIdExistence(divApplab, opts, 'textInput', 'id', opts.elementId, false);
  apiValidateType(opts, 'textInput', 'text', opts.text, 'string');

  var newInput = document.createElement("input");
  newInput.value = opts.text;
  newInput.id = opts.elementId;

  return Boolean(divApplab.appendChild(newInput));
};

Applab.textLabel = function (opts) {
  var divApplab = document.getElementById('divApplab');
  // TODO: cpirich: may need to update param name
  apiValidateDomIdExistence(divApplab, opts, 'textLabel', 'id', opts.elementId, false);
  apiValidateType(opts, 'textLabel', 'text', opts.text, 'string');
  apiValidateType(opts, 'textLabel', 'forId', opts.forId, 'string', OPTIONAL);

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
  // TODO: cpirich: may need to update param name
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
  // TODO: cpirich: may need to update param name
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
  // TODO: cpirich: may need to update param name
  apiValidateDomIdExistence(divApplab, opts, 'dropdown', 'id', opts.elementId, false);

  var newSelect = document.createElement("select");

  if (opts.optionsArray) {
    for (var i = 0; i < opts.optionsArray.length; i++) {
      var option = document.createElement("option");
      apiValidateType(opts, 'dropdown', 'option_' + (i + 1), opts.optionsArray[i], 'string');
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
  // TODO: cpirich: may need to update param name
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
  // TODO: cpirich: may need to update param name
  apiValidateDomIdExistence(divApplab, opts, 'setText', 'id', opts.elementId, true);
  apiValidateType(opts, 'setText', 'text', opts.text, 'string');

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
  // TODO: cpirich: may need to update param name
  apiValidateDomIdExistence(divApplab, opts, 'getChecked', 'id', opts.elementId, true);

  var element = document.getElementById(opts.elementId);
  if (divApplab.contains(element) && element.tagName === 'INPUT') {
    return element.checked;
  }
  return false;
};

Applab.setChecked = function (opts) {
  var divApplab = document.getElementById('divApplab');
  // TODO: cpirich: may need to update param name
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
  // TODO: cpirich: may need to update param name
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
  // TODO: cpirich: may need to update param name
  apiValidateDomIdExistence(divApplab, opts, 'setImageURL', 'id', opts.elementId, true);
  apiValidateType(opts, 'setImageURL', 'src', opts.src, 'string');

  var element = document.getElementById(opts.elementId);
  if (divApplab.contains(element) && element.tagName === 'IMG') {
    element.src = opts.src;
    return true;
  }
  return false;
};

Applab.playSound = function (opts) {
  // TODO: cpirich: may need to update param name
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
  // TODO: cpirich: may need to update param name
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
  // TODO: cpirich: may need to update param name
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
  // TODO: cpirich: may need to update param name
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
  // TODO: cpirich: may need to update param name
  apiValidateDomIdExistence(divApplab, opts, 'setPosition', 'id', opts.elementId, true);
  apiValidateType(opts, 'setPosition', 'left', opts.left, 'number');
  apiValidateType(opts, 'setPosition', 'top', opts.top, 'number');
  apiValidateType(opts, 'setPosition', 'width', opts.width, 'number');
  apiValidateType(opts, 'setPosition', 'height', opts.height, 'number');

  var div = document.getElementById(opts.elementId);
  if (divApplab.contains(div)) {
    div.style.position = 'absolute';
    div.style.left = String(opts.left) + 'px';
    div.style.top = String(opts.top) + 'px';
    div.style.width = String(opts.width) + 'px';
    div.style.height = String(opts.height) + 'px';
    return true;
  }
  return false;
};

Applab.getXPosition = function (opts) {
  var divApplab = document.getElementById('divApplab');
  // TODO: cpirich: may need to update param name
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
  // TODO: cpirich: may need to update param name
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
    // Push a function call on the queue with an array of arguments consisting
    // of just the 'e' parameter
    Applab.eventQueue.push({
      'fn': opts.func,
      'arguments': [e].concat(opts.extraArgs)
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
  apiValidateDomIdExistence(divApplab, opts, 'onEvent', 'id', opts.elementId, true);
  apiValidateType(opts, 'onEvent', 'event', opts.eventName, 'string');
  apiValidateType(opts, 'onEvent', 'function', opts.func, 'function');
  // Special case the id of 'body' to mean the app's container (divApplab)
  // TODO (cpirich): apply this logic more broadly (setStyle, etc.)
  if (opts.elementId === 'body') {
    opts.elementId = 'divApplab';
  }
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
      */
      case 'pinch':
      case 'pinchin':
      case 'pinchout':
        var hammerElement = new Hammer(divApplab, { 'preventDefault': true });
        hammerElement.on(opts.eventName,
                         Applab.onEventFired.bind(this, opts));
        break;
      default:
        // For now, we're not tracking how many of these we add and we don't allow
        // the user to detach the handler. We detach all listeners by cloning the
        // divApplab DOM node inside of reset()
        domElement.addEventListener(
            opts.eventName,
            Applab.onEventFired.bind(this, opts));
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
  apiValidateType(opts, 'startWebRequest', 'function', opts.func, 'function');
  opts.interpreter = Applab.interpreter;
  var req = new XMLHttpRequest();
  req.onreadystatechange = Applab.onHttpRequestEvent.bind(req, opts);
  req.open('GET', String(opts.url), true);
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
  apiValidateType(opts, 'setTimeout', 'function', opts.func, 'function');
  apiValidateType(opts, 'setTimeout', 'milliseconds', opts.milliseconds, 'number');

  return apiTimeoutList.setTimeout(Applab.onTimerFired.bind(this, opts), opts.milliseconds);
};

Applab.clearTimeout = function (opts) {
  // TODO: cpirich: may need to update param name
  apiValidateType(opts, 'clearTimeout', 'timeoutId', opts.timeoutId, 'number');
  // NOTE: we do not currently check to see if this is a timer created by
  // our Applab.setTimeout() function
  apiTimeoutList.clearTimeout(opts.timeoutId);
};

Applab.setInterval = function (opts) {
  apiValidateType(opts, 'setInterval', 'function', opts.func, 'function');
  apiValidateType(opts, 'setInterval', 'milliseconds', opts.milliseconds, 'number');

  return apiTimeoutList.setInterval(Applab.onTimerFired.bind(this, opts), opts.milliseconds);
};

Applab.clearInterval = function (opts) {
  // TODO: cpirich: may need to update param name
  apiValidateType(opts, 'clearInterval', 'intervalId', opts.intervalId, 'number');
  // NOTE: we do not currently check to see if this is a timer created by
  // our Applab.setInterval() function
  apiTimeoutList.clearInterval(opts.intervalId);
};

Applab.createRecord = function (opts) {
  var onSuccess = Applab.handleCreateRecord.bind(this, opts.onSuccess);
  var onError = Applab.handleError.bind(this, opts.onError);
  AppStorage.createRecord(opts.table, opts.record, onSuccess, onError);
};

Applab.handleCreateRecord = function(successCallback, record) {
  if (successCallback) {
    Applab.eventQueue.push({
      'fn': successCallback,
      'arguments': [record]
    });
  }
};

Applab.handleError = function(errorCallback, message) {
  if (errorCallback) {
    Applab.eventQueue.push({
      'fn': errorCallback,
      'arguments': [message]
    });
  } else {
    outputApplabConsole(message);
  }
};

Applab.getKeyValue = function(opts) {
  var onSuccess = Applab.handleReadValue.bind(this, opts.onSuccess);
  var onError = Applab.handleError.bind(this, opts.onError);
  AppStorage.getKeyValue(opts.key, onSuccess, onError);
};

Applab.handleReadValue = function(successCallback, value) {
  if (successCallback) {
    Applab.eventQueue.push({
      'fn': successCallback,
      'arguments': [value]
    });
  }
};

Applab.setKeyValue = function(opts) {
  var onSuccess = Applab.handleSetKeyValue.bind(this, opts.onSuccess);
  var onError = Applab.handleError.bind(this, opts.onError);
  AppStorage.setKeyValue(opts.key, opts.value, onSuccess, onError);
};

Applab.handleSetKeyValue = function(successCallback) {
  if (successCallback) {
    Applab.eventQueue.push({
      'fn': successCallback,
      'arguments': []
    });
  }
};

Applab.readRecords = function (opts) {
  var onSuccess = Applab.handleReadRecords.bind(this, opts.onSuccess);
  var onError = Applab.handleError.bind(this, opts.onError);
  AppStorage.readRecords(opts.table, opts.searchParams, onSuccess, onError);
};

Applab.handleReadRecords = function(successCallback, records) {
  if (successCallback) {
    Applab.eventQueue.push({
      'fn': successCallback,
      'arguments': [records]
    });
  }
};

Applab.updateRecord = function (opts) {
  var onSuccess = Applab.handleUpdateRecord.bind(this, opts.onSuccess);
  var onError = Applab.handleError.bind(this, opts.onError);
  AppStorage.updateRecord(opts.table, opts.record, onSuccess, onError);
};

Applab.handleUpdateRecord = function(successCallback, record) {
  if (successCallback) {
    Applab.eventQueue.push({
      'fn': successCallback,
      'arguments': [record]
    });
  }
};

Applab.deleteRecord = function (opts) {
  var onSuccess = Applab.handleDeleteRecord.bind(this, opts.onSuccess);
  var onError = Applab.handleError.bind(this, opts.onError);
  AppStorage.deleteRecord(opts.table, opts.record, onSuccess, onError);
};

Applab.handleDeleteRecord = function(successCallback) {
  if (successCallback) {
    Applab.eventQueue.push({
      'fn': successCallback,
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
        default:
          return null;
      }
  }
};

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
