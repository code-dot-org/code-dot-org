/**
 * CodeOrgApp: Applab
 *
 * Copyright 2014-2015 Code.org
 *
 */

'use strict';

var studioApp = require('../StudioApp').singleton;
var commonMsg = require('../../locale/current/common');
var applabMsg = require('../../locale/current/applab');
var skins = require('../skins');
var codegen = require('../codegen');
var api = require('./api');
var blocks = require('./blocks');
var page = require('../templates/page.html');
var dom = require('../dom');
var parseXmlElement = require('../xml').parseElement;
var utils = require('../utils');
var dropletConfig = require('./dropletConfig');
var Slider = require('../slider');
var AppStorage = require('./appStorage');
var FormStorage = require('./formStorage');
var constants = require('../constants');
var KeyCodes = constants.KeyCodes;
var _ = utils.getLodash();
var Hammer = utils.getHammer();

var ResultType = studioApp.ResultType;
var TestResults = studioApp.TestResults;

/**
 * Create a namespace for the application.
 */
var Applab = module.exports;

var level;
var skin;

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
// The visualization area adjusts its size using a series of CSS rules that are
// tuned to make adjustments assuming a 400x400 visualization. Since applab
// allows its visualization size to be set on a per-level basis, the function
// below modifies the CSS rules to account for the per-level coordinates
//
// The visualization column will remain at 400 pixels wide in the max-width
// case and scale downward from there. The visualization height will be set
// to preserve the proper aspect ratio with respect to the current width.
//
// The divApplab coordinate space will be Applab.appWidth by Applab.appHeight.
// The scale values are then adjusted such that the max-width case may result
// in a scaled-up version of divApplab and the min-width case will typically
// result in a scaled-down version of divApplab
//

function adjustAppSizeStyles() {
  var vizScale = 1;
  // We assume these are listed in this order:
  var scaleFactors = [ 1.0, 0.875, 0.75, 0.675, 0.5 ];
  if (vizAppWidth !== Applab.appWidth) {
    vizScale = vizAppWidth / Applab.appWidth;
    for (var ind = 0; ind < scaleFactors.length; ind++) {
      scaleFactors[ind] *= vizScale;
    }
  }
  var vizAppHeight = Applab.appHeight * vizScale;
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
          var changedChildRules = 0;
          var scale = scaleFactors[curScaleIndex];
          for (var k = 0; k < childRules.length && changedChildRules < 3; k++) {
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
}

var drawDiv = function () {
  var divApplab = document.getElementById('divApplab');
  divApplab.style.width = Applab.appWidth + "px";
  divApplab.style.height = Applab.appHeight + "px";

  // TODO: one-time initial drawing

  // Adjust visualizationColumn width.
  var visualizationColumn = document.getElementById('visualizationColumn');
  visualizationColumn.style.width = vizAppWidth + 'px';
};

function getCurrentTickLength() {
  var stepSpeed = Applab.scale.stepSpeed;
  if (Applab.speedSlider) {
    stepSpeed = 300 * Math.pow(1 - Applab.speedSlider.getValue(), 2);
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
  if (debugOutput.value.length > 0) {
    debugOutput.value += '\n' + output;
  } else {
    debugOutput.value = output;
  }
  debugOutput.scrollTop = debugOutput.scrollHeight;
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
  if (lineNumber) {
    outputApplabConsole('Line ' + lineNumber + ': ' + String(err));
  } else {
    outputApplabConsole(String(err));
  }
  Applab.executionError = err;
  Applab.onPuzzleComplete();
}

Applab.onTick = function() {
  if (!Applab.running) {
    return;
  }

  Applab.tickCount++;
  queueOnTick();

  if (Applab.interpreter) {
    Applab.executeInterpreter();
  } else {
    if (Applab.tickCount === 1) {
      try { Applab.whenRunFunc(studioApp, api, Applab.Globals); } catch (e) { }
    }
  }

  if (checkFinished()) {
    Applab.onPuzzleComplete();
  }
};

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
          for (var i = Applab.interpreter.stateStack.length - 1; i > 0; i--) {
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
  // NOTE: when running with no source visible or at max speed with blocks, we
  // call a simple function to just get the line number, otherwise we call a
  // function that also selects the code:
  var selectCodeFunc =
    (studioApp.hideSource ||
     (atMaxSpeed && !Applab.paused && studioApp.editor.currentlyUsingBlocks)) ?
          codegen.getUserCodeLine :
          codegen.selectCurrentCode;

  // In each tick, we will step the interpreter multiple times in a tight
  // loop as long as we are interpreting code that the user can't see
  // (function aliases at the beginning, getCallback event loop at the end)
  for (var stepsThisTick = 0;
       (stepsThisTick < MAX_INTERPRETER_STEPS_PER_TICK) || unwindingAfterStep;
       stepsThisTick++) {
    if ((reachedBreak && !unwindingAfterStep) ||
        (doneUserLine && !atMaxSpeed) ||
        Applab.seenEmptyGetCallbackDuringExecution ||
        (runUntilCallbackReturn && Applab.seenReturnFromCallbackDuringExecution)) {
      // stop stepping the interpreter and wait until the next tick once we:
      // (1) reached a breakpoint and are done unwinding OR
      // (2) completed a line of user code (while not running atMaxSpeed) OR
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
    try {
      Applab.interpreter.step();
      doneUserLine = doneUserLine ||
        (inUserCode && Applab.interpreter.stateStack[0] && Applab.interpreter.stateStack[0].done);

      // Remember the stack depths of call expressions (so we can implement 'step out')

      // Truncate any history of call expressions seen deeper than our current stack position:
      Applab.callExpressionSeenAtDepth.length = Applab.interpreter.stateStack.length + 1;

      if (inUserCode && Applab.interpreter.stateStack[0].node.type === "CallExpression") {
        // Store that we've seen a call expression at this depth in callExpressionSeenAtDepth:
        Applab.callExpressionSeenAtDepth[Applab.interpreter.stateStack.length] = true;
      }

      if (Applab.paused) {
        // Store the first call expression stack depth seen while in this step operation:
        if (inUserCode && Applab.interpreter.stateStack[0].node.type === "CallExpression") {
          if (typeof Applab.firstCallStackDepthThisStep === 'undefined') {
            Applab.firstCallStackDepthThisStep = Applab.interpreter.stateStack.length;
          }
        }
        // For the step in case, we want to stop the interpreter as soon as we enter the callee:
        if (!doneUserLine &&
            inUserCode &&
            Applab.nextStep === StepType.IN &&
            Applab.interpreter.stateStack.length > Applab.firstCallStackDepthThisStep) {
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
              Applab.interpreter.stateStack.length > Applab.stepOutToStackDepth) {
            // trying to step out, but we didn't get out yet... continue on.
          } else if (Applab.nextStep === StepType.OVER &&
              typeof Applab.firstCallStackDepthThisStep !== 'undefined' &&
              Applab.interpreter.stateStack.length > Applab.firstCallStackDepthThisStep) {
            // trying to step over, and we're in deeper inside a function call... continue next onTick
          } else {
            // Our step operation is complete, reset nextStep to StepType.RUN to
            // return to a normal 'break' state:
            Applab.nextStep = StepType.RUN;
            if (inUserCode) {
              // Store some properties about where we stopped:
              Applab.stoppedAtBreakpointRow = userCodeRow;
              Applab.stoppedAtBreakpointStackDepth = Applab.interpreter.stateStack.length;
            }
            delete Applab.stepOutToStackDepth;
            delete Applab.firstCallStackDepthThisStep;
            document.getElementById('spinner').style.visibility = 'hidden';
            break;
          }
        }
      }
    }
    catch(err) {
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

  adjustAppSizeStyles();

  var showSlider = !config.hideSource && config.level.editCode;
  var showDebugButtons = !config.hideSource && config.level.editCode;
  var showDebugConsole = !config.hideSource && config.level.editCode;
  var finishButtonFirstLine = _.isEmpty(level.softButtons) && !showSlider;
  var firstControlsRow = require('./controls.html')({
    assetUrl: studioApp.assetUrl,
    showSlider: showSlider,
    finishButton: finishButtonFirstLine
  });
  var extraControlsRow = require('./extraControlRows.html')({
    assetUrl: studioApp.assetUrl,
    finishButton: !finishButtonFirstLine,
    debugButtons: showDebugButtons,
    debugConsole: showDebugConsole
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
      blockCounterClass: 'block-counter-default'
    }
  });

  config.loadAudio = function() {
    studioApp.loadAudio(skin.winSound, 'win');
    studioApp.loadAudio(skin.startSound, 'start');
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

  // Since the app width may not be 400, set this value in the config to
  // ensure that the viewport is set up properly for scaling it up/down
  config.mobileNoPaddingShareWidth = config.level.appWidth;

  // Applab.initMinimal();

  studioApp.init(config);

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
  Applab.turtle = {};
  Applab.turtle.heading = 0;
  Applab.turtle.x = Applab.appWidth / 2;
  Applab.turtle.y = Applab.appHeight / 2;

  var divApplab = document.getElementById('divApplab');

  while (divApplab.firstChild) {
    divApplab.removeChild(divApplab.firstChild);
  }

  // Clone and replace divApplab (this removes all attached event listeners):
  var newDivApplab = divApplab.cloneNode(true);
  divApplab.parentNode.replaceChild(newDivApplab, divApplab);

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

// Commented out, but available in case we want to expose the droplet/pencilcode
// style random (with a min, max value)
/*
exports.random = function (min, max)
{
    return Math.floor(Math.random()*(max-min+1)+min);
};
*/

var mathFunctions = [
  {'func': 'random', 'idArgNone': true },
  {'func': 'round', 'idArgNone': true },
  {'func': 'abs', 'idArgNone': true },
  {'func': 'max', 'idArgNone': true },
  {'func': 'min', 'idArgNone': true },
];

/**
 * Execute the app
 */
Applab.execute = function() {
  Applab.result = ResultType.UNSET;
  Applab.testResults = TestResults.NO_TESTS_RUN;
  Applab.waitingForReport = false;
  Applab.response = null;
  var i;

  studioApp.playAudio('start');

  studioApp.reset(false);

  // Set event handlers and start the onTick timer

  var codeWhenRun;
  if (level.editCode) {
    codeWhenRun = utils.generateCodeAliases(level.codeFunctions, dropletConfig, 'Applab');
    codeWhenRun += utils.generateCodeAliases(mathFunctions, null, 'Math');
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
        codegen.initJSInterpreter(interpreter, scope, {
                                          StudioApp: studioApp,
                                          Applab: api,
                                          console: consoleApi,
                                          JSON: JSONApi,
                                          Globals: Applab.Globals });

        // Only allow five levels of depth when marshalling the return value
        // since we will occasionally return DOM Event objects which contain
        // properties that recurse over and over...
        var wrapper = codegen.makeNativeMemberFunction(interpreter,
                                                       nativeGetCallback,
                                                       null,
                                                       5);
        interpreter.setProperty(scope,
                                'getCallback',
                                interpreter.createNativeFunction(wrapper));

        wrapper = codegen.makeNativeMemberFunction(interpreter,
                                                   nativeSetCallbackRetVal);
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
    '//' + getPegasusHost() + '/private/edit-csp-app/' + AppStorage.tempEncryptedAppId,
    '_blank');
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

Applab.createHtmlBlock = function (opts) {
  var divApplab = document.getElementById('divApplab');

  var newDiv = document.createElement("div");
  newDiv.id = opts.elementId;
  newDiv.innerHTML = opts.html;

  return Boolean(divApplab.appendChild(newDiv));
};

Applab.createButton = function (opts) {
  var divApplab = document.getElementById('divApplab');

  var newButton = document.createElement("button");
  var textNode = document.createTextNode(opts.text);
  newButton.id = opts.elementId;

  return Boolean(newButton.appendChild(textNode) &&
                 divApplab.appendChild(newButton));
};

Applab.createImage = function (opts) {
  var divApplab = document.getElementById('divApplab');

  var newImage = document.createElement("img");
  newImage.src = opts.src;
  newImage.id = opts.elementId;

  return Boolean(divApplab.appendChild(newImage));
};

Applab.createImageUploadButton = function (opts) {
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

function getTurtleContext() {
  var canvas = document.getElementById('turtleCanvas');

  if (!canvas) {
    var opts = { 'elementId': 'turtleCanvas' };
    Applab.createCanvas(opts);
    canvas = document.getElementById('turtleCanvas');
  }

  return canvas.getContext("2d");
}

Applab.turtleMoveTo = function (opts) {
  var ctx = getTurtleContext();
  if (ctx) {
    ctx.beginPath();
    ctx.moveTo(Applab.turtle.x, Applab.turtle.y);
    Applab.turtle.x = opts.x;
    Applab.turtle.y = opts.y;
    ctx.lineTo(Applab.turtle.x, Applab.turtle.y);
    ctx.stroke();
  }
};

Applab.turtleMove = function (opts) {
  var newOpts = {};
  newOpts.x = Applab.turtle.x + opts.x;
  newOpts.y = Applab.turtle.y + opts.y;
  Applab.turtleMoveTo(newOpts);
};

Applab.turtleMoveForward = function (opts) {
  var newOpts = {};
  newOpts.x = Applab.turtle.x +
    opts.distance * Math.sin(2 * Math.PI * Applab.turtle.heading / 360);
  newOpts.y = Applab.turtle.y -
      opts.distance * Math.cos(2 * Math.PI * Applab.turtle.heading / 360);
  Applab.turtleMoveTo(newOpts);
};

Applab.turtleMoveBackward = function (opts) {
  opts.distance = -opts.distance;
  Applab.turtleMoveForward(opts);
};

Applab.turtleTurnRight = function (opts) {
  Applab.turtle.heading += opts.degrees;
  Applab.turtle.heading = (Applab.turtle.heading + 360) % 360;
};

Applab.turtleTurnLeft = function (opts) {
  opts.degrees = -opts.degrees;
  Applab.turtleTurnRight(opts);
};

Applab.turtlePenUp = function (opts) {
  var ctx = getTurtleContext();
  if (ctx) {
    Applab.turtle.penUpColor = ctx.strokeStyle;
    ctx.strokeStyle = "rgba(255, 255, 255, 0)";
  }
};

Applab.turtlePenDown = function (opts) {
  var ctx = getTurtleContext();
  if (ctx && Applab.turtle.penUpColor) {
    ctx.strokeStyle = Applab.turtle.penUpColor;
    delete Applab.turtle.penUpColor;
  }
};

Applab.turtlePenWidth = function (opts) {
  var ctx = getTurtleContext();
  if (ctx) {
    ctx.lineWidth = opts.width;
  }
};

Applab.turtlePenColor = function (opts) {
  var ctx = getTurtleContext();
  if (ctx) {
    if (Applab.turtle.penUpColor) {
      // pen is currently up, store this color for pen down
      Applab.turtle.penUpColor = opts.color;
    } else {
      ctx.strokeStyle = opts.color;
    }
  }
};

Applab.createCanvas = function (opts) {
  var divApplab = document.getElementById('divApplab');

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
    // set transparent fill by default:
    ctx.fillStyle = "rgba(255, 255, 255, 0)";

    return Boolean(divApplab.appendChild(newElement));
  }
  return false;
};

Applab.canvasDrawLine = function (opts) {
  var divApplab = document.getElementById('divApplab');
  var canvas = document.getElementById(opts.elementId);
  var ctx = canvas.getContext("2d");
  if (ctx && divApplab.contains(canvas)) {
    ctx.beginPath();
    ctx.moveTo(opts.x1, opts.y1);
    ctx.lineTo(opts.x2, opts.y2);
    ctx.stroke();
    return true;
  }
  return false;
};

Applab.canvasDrawCircle = function (opts) {
  var divApplab = document.getElementById('divApplab');
  var canvas = document.getElementById(opts.elementId);
  var ctx = canvas.getContext("2d");
  if (ctx && divApplab.contains(canvas)) {
    ctx.beginPath();
    ctx.arc(opts.x, opts.y, opts.radius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
    return true;
  }
  return false;
};

Applab.canvasDrawRect = function (opts) {
  var divApplab = document.getElementById('divApplab');
  var canvas = document.getElementById(opts.elementId);
  var ctx = canvas.getContext("2d");
  if (ctx && divApplab.contains(canvas)) {
    ctx.beginPath();
    ctx.rect(opts.x, opts.y, opts.width, opts.height);
    ctx.fill();
    ctx.stroke();
    return true;
  }
  return false;
};

Applab.canvasSetLineWidth = function (opts) {
  var divApplab = document.getElementById('divApplab');
  var canvas = document.getElementById(opts.elementId);
  var ctx = canvas.getContext("2d");
  if (ctx && divApplab.contains(canvas)) {
    ctx.lineWidth = opts.width;
    return true;
  }
  return false;
};

Applab.canvasSetStrokeColor = function (opts) {
  var divApplab = document.getElementById('divApplab');
  var canvas = document.getElementById(opts.elementId);
  var ctx = canvas.getContext("2d");
  if (ctx && divApplab.contains(canvas)) {
    ctx.strokeStyle = String(opts.color);
    return true;
  }
  return false;
};

Applab.canvasSetFillColor = function (opts) {
  var divApplab = document.getElementById('divApplab');
  var canvas = document.getElementById(opts.elementId);
  var ctx = canvas.getContext("2d");
  if (ctx && divApplab.contains(canvas)) {
    ctx.fillStyle = String(opts.color);
    return true;
  }
  return false;
};

Applab.canvasClear = function (opts) {
  var divApplab = document.getElementById('divApplab');
  var canvas = document.getElementById(opts.elementId);
  var ctx = canvas.getContext("2d");
  if (ctx && divApplab.contains(canvas)) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    return true;
  }
  return false;
};

Applab.canvasDrawImage = function (opts) {
  var divApplab = document.getElementById('divApplab');
  var canvas = document.getElementById(opts.elementId);
  var image = document.getElementById(opts.imageId);
  var ctx = canvas.getContext("2d");
  if (ctx && divApplab.contains(canvas) && divApplab.contains(image)) {
    var xScale, yScale;
    xScale = yScale = 1;
    if (opts.width) {
      xScale = xScale * (opts.width / image.width);
    }
    if (opts.height) {
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

Applab.canvasGetImageData = function (opts) {
  var divApplab = document.getElementById('divApplab');
  var canvas = document.getElementById(opts.elementId);
  var ctx = canvas.getContext("2d");
  if (ctx && divApplab.contains(canvas)) {
    return ctx.getImageData(opts.x, opts.y, opts.width, opts.height);
  }
};

Applab.canvasPutImageData = function (opts) {
  var divApplab = document.getElementById('divApplab');
  var canvas = document.getElementById(opts.elementId);
  var ctx = canvas.getContext("2d");
  if (ctx && divApplab.contains(canvas)) {
    // Create tmpImageData and initialize it because opts.imageData is not
    // going to be a real ImageData object if it came from the interpreter
    var tmpImageData = ctx.createImageData(opts.imageData.width,
                                           opts.imageData.height);
    tmpImageData.data.set(opts.imageData.data);
    return ctx.putImageData(tmpImageData, opts.x, opts.y);
  }
};

Applab.createTextInput = function (opts) {
  var divApplab = document.getElementById('divApplab');

  var newInput = document.createElement("input");
  newInput.value = opts.text;
  newInput.id = opts.elementId;

  return Boolean(divApplab.appendChild(newInput));
};

Applab.createTextLabel = function (opts) {
  var divApplab = document.getElementById('divApplab');

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

Applab.createCheckbox = function (opts) {
  var divApplab = document.getElementById('divApplab');

  var newCheckbox = document.createElement("input");
  newCheckbox.setAttribute("type", "checkbox");
  newCheckbox.checked = opts.checked;
  newCheckbox.id = opts.elementId;

  return Boolean(divApplab.appendChild(newCheckbox));
};

Applab.createRadio = function (opts) {
  var divApplab = document.getElementById('divApplab');

  var newRadio = document.createElement("input");
  newRadio.setAttribute("type", "radio");
  newRadio.name = opts.name;
  newRadio.checked = opts.checked;
  newRadio.id = opts.elementId;

  return Boolean(divApplab.appendChild(newRadio));
};

Applab.createDropdown = function (opts) {
  var divApplab = document.getElementById('divApplab');

  var newSelect = document.createElement("select");

  if (opts.optionsArray) {
    for (var i = 0; i < opts.optionsArray.length; i++) {
      var option = document.createElement("option");
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
  var element = document.getElementById(opts.elementId);
  if (divApplab.contains(element) && element.tagName === 'INPUT') {
    return element.checked;
  }
  return false;
};

Applab.setChecked = function (opts) {
  var divApplab = document.getElementById('divApplab');
  var element = document.getElementById(opts.elementId);
  if (divApplab.contains(element) && element.tagName === 'INPUT') {
    element.checked = opts.checked;
    return true;
  }
  return false;
};

Applab.getImageURL = function (opts) {
  var divApplab = document.getElementById('divApplab');
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
  var element = document.getElementById(opts.elementId);
  if (divApplab.contains(element) && element.tagName === 'IMG') {
    element.src = opts.src;
    return true;
  }
  return false;
};

Applab.playSound = function (opts) {
  if (studioApp.cdoSounds) {
    studioApp.cdoSounds.playURL(opts.url,
                               {volume: 1.0,
                                forceHTML5: true,
                                allowHTML5Mobile: true
    });
  }
};

Applab.replaceHtmlBlock = function (opts) {
  var divApplab = document.getElementById('divApplab');
  var oldDiv = document.getElementById(opts.elementId);
  if (divApplab.contains(oldDiv)) {
    var newDiv = document.createElement("div");
    newDiv.id = opts.elementId;
    newDiv.innerHTML = opts.html;

    return Boolean(oldDiv.parentElement.replaceChild(newDiv, oldDiv));
  }
  return false;
};

Applab.deleteHtmlBlock = function (opts) {
  var divApplab = document.getElementById('divApplab');
  var div = document.getElementById(opts.elementId);
  if (divApplab.contains(div)) {
    return Boolean(div.parentElement.removeChild(div));
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
  if (this.readyState === 4) {
    Applab.eventQueue.push({
      'fn': opts.func,
      'arguments': [
        Number(this.status),
        String(this.getResponseHeader('content-type')),
        String(this.responseText)]
    });
  }
};

Applab.startWebRequest = function (opts) {
  var req = new XMLHttpRequest();
  req.onreadystatechange = Applab.onHttpRequestEvent.bind(req, opts);
  req.open('GET', String(opts.url), true);
  req.send();
};

Applab.onTimeoutFired = function (opts) {
  Applab.eventQueue.push({
    'fn': opts.func
  });
  if (Applab.interpreter) {
    // NOTE: the interpreter will not execute forever, if the event handler
    // takes too long, executeInterpreter() will return and the rest of the
    // user's code will execute in the next onTick()
    Applab.executeInterpreter(true);
  }
};

Applab.setTimeout = function (opts) {
  return window.setTimeout(Applab.onTimeoutFired.bind(this, opts), opts.milliseconds);
};

Applab.clearTimeout = function (opts) {
  // NOTE: we do not currently check to see if this is a timer created by
  // our Applab.setTimeout() function
  window.clearTimeout(opts.timeoutId);
};

Applab.createSharedRecord = function (opts) {
  var onSuccess = Applab.handleCreateSharedRecord.bind(this, opts.onSuccess);
  var onError = Applab.handleError.bind(this, opts.onError);
  AppStorage.createSharedRecord(opts.record, onSuccess, onError);
};

Applab.handleCreateSharedRecord = function(successCallback, record) {
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

Applab.readSharedValue = function(opts) {
  var onSuccess = Applab.handleReadSharedValue.bind(this, opts.onSuccess);
  var onError = Applab.handleError.bind(this, opts.onError);
  AppStorage.readSharedValue(opts.key, onSuccess, onError);
};

Applab.handleReadSharedValue = function(successCallback, value) {
  if (successCallback) {
    Applab.eventQueue.push({
      'fn': successCallback,
      'arguments': [value]
    });
  }
};

Applab.writeSharedValue = function(opts) {
  var onSuccess = Applab.handleWriteSharedValue.bind(this, opts.onSuccess);
  var onError = Applab.handleError.bind(this, opts.onError);
  AppStorage.writeSharedValue(opts.key, opts.value, onSuccess, onError);
};

Applab.handleWriteSharedValue = function(successCallback) {
  if (successCallback) {
    Applab.eventQueue.push({
      'fn': successCallback,
      'arguments': []
    });
  }
};

Applab.readSharedRecords = function (opts) {
  var onSuccess = Applab.handleReadSharedRecords.bind(this, opts.onSuccess);
  var onError = Applab.handleError.bind(this, opts.onError);
  AppStorage.readSharedRecords(opts.searchParams, onSuccess, onError);
};

Applab.handleReadSharedRecords = function(successCallback, records) {
  if (successCallback) {
    Applab.eventQueue.push({
      'fn': successCallback,
      'arguments': [records]
    });
  }
};

Applab.updateSharedRecord = function (opts) {
  var onSuccess = Applab.handleUpdateSharedRecord.bind(this, opts.onSuccess);
  var onError = Applab.handleError.bind(this, opts.onError);
  AppStorage.updateSharedRecord(opts.record, onSuccess, onError);
};

Applab.handleUpdateSharedRecord = function(successCallback) {
  if (successCallback) {
    Applab.eventQueue.push({
      'fn': successCallback,
      'arguments': []
    });
  }
};

Applab.deleteSharedRecord = function (opts) {
  var onSuccess = Applab.handleDeleteSharedRecord.bind(this, opts.onSuccess);
  var onError = Applab.handleError.bind(this, opts.onError);
  AppStorage.deleteSharedRecord(opts.record, onSuccess, onError);
};

Applab.handleDeleteSharedRecord = function(successCallback) {
  if (successCallback) {
    Applab.eventQueue.push({
      'fn': successCallback,
      'arguments': []
    });
  }
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
