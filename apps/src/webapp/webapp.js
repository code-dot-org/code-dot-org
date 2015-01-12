/**
 * CodeOrgApp: Webapp
 *
 * Copyright 2014 Code.org
 *
 */

'use strict';

var StudioApp = require('../base');
var commonMsg = require('../../locale/current/common');
var webappMsg = require('../../locale/current/webapp');
var skins = require('../skins');
var codegen = require('../codegen');
var api = require('./api');
var blocks = require('./blocks');
var page = require('../templates/page.html');
var dom = require('../dom');
var parseXmlElement = require('../xml').parseElement;
var utils = require('../utils');
var Slider = require('../slider');
var FormStorage = require('./formStorage');
var _ = utils.getLodash();
var Hammer = utils.getHammer();

/**
 * Create a namespace for the application.
 */
var Webapp = module.exports;

var level;
var skin;

//TODO: Make configurable.
StudioApp.CHECK_FOR_EMPTY_BLOCKS = true;

//The number of blocks to show as feedback.
StudioApp.NUM_REQUIRED_BLOCKS_TO_FLAG = 1;

var MAX_INTERPRETER_STEPS_PER_TICK = 10000;

// Default Scalings
Webapp.scale = {
  'snapRadius': 1,
  'stepSpeed': 0
};

var twitterOptions = {
  text: webappMsg.shareWebappTwitter(),
  hashtag: "WebappCode"
};

var StepType = {
  RUN:  0,
  IN:   1,
  OVER: 2,
  OUT:  3,
};

function loadLevel() {
  Webapp.timeoutFailureTick = level.timeoutFailureTick || Infinity;
  Webapp.minWorkspaceHeight = level.minWorkspaceHeight;
  Webapp.softButtons_ = level.softButtons || {};

  // Override scalars.
  for (var key in level.scale) {
    Webapp.scale[key] = level.scale[key];
  }
}

var drawDiv = function () {
  var divWebapp = document.getElementById('divWebapp');
  var divWidth = parseInt(window.getComputedStyle(divWebapp).width, 10);

  // TODO: one-time initial drawing

  // Adjust visualizationColumn width.
  var visualizationColumn = document.getElementById('visualizationColumn');
  visualizationColumn.style.width = divWidth + 'px';
};

function getCurrentTickLength() {
  var stepSpeed = Webapp.scale.stepSpeed;
  if (Webapp.speedSlider) {
    stepSpeed = 300 * Math.pow(1 - Webapp.speedSlider.getValue(), 2);
  }
  return stepSpeed;
}

function queueOnTick() {
  window.setTimeout(Webapp.onTick, getCurrentTickLength());
}

function outputWebappConsole(output) {
  // first pass through to the real browser console log if available:
  if (console.log) {
    console.log(output);
  }
  // then put it in the webapp console visible to the user:
  var debugOutput = document.getElementById('debug-output');
  if (debugOutput.value.length > 0) {
    debugOutput.value += '\n' + output;
  } else {
    debugOutput.value = output;
  }
  debugOutput.scrollTop = debugOutput.scrollHeight;
}

var Keycodes = {
  ENTER: 13,
};

function onDebugInputKeyDown(e) {
  if (e.keyCode == Keycodes.ENTER) {
    var input = e.target.textContent;
    e.target.textContent = '';
    outputWebappConsole('> ' + input);
    if (Webapp.interpreter) {
      var currentScope = Webapp.interpreter.getScope();
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
        outputWebappConsole('< ' + String(evalInterpreter.value));
      }
      catch (err) {
        outputWebappConsole('< ' + String(err));
      }
    } else {
      outputWebappConsole('< (not running)');
    }
  }
}

function selectEditorRowCol(row, col) {
  if (StudioApp.editor.currentlyUsingBlocks) {
    var style = {color: '#FFFF22'};
    StudioApp.editor.clearLineMarks();
    StudioApp.editor.markLine(row, style);
  } else {
    var selection = StudioApp.editor.aceEditor.getSelection();
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
    lineNumber = err.loc.line - Webapp.userCodeLineOffset;
    // Now select this location in the editor, since we know we didn't hit
    // this while executing (in which case, it would already have been selected)
    selectEditorRowCol(lineNumber - 1, err.loc.column);
  }
  if (lineNumber) {
    outputWebappConsole('Line ' + lineNumber + ': ' + String(err));
  } else {
    outputWebappConsole(String(err));
  }
  Webapp.executionError = err;
  Webapp.onPuzzleComplete();
}

Webapp.onTick = function() {
  if (!Webapp.running) {
    return;
  }

  Webapp.tickCount++;
  queueOnTick();

  var atInitialBreakpoint = Webapp.paused && Webapp.nextStep === StepType.IN && Webapp.tickCount === 1;
  var atMaxSpeed = getCurrentTickLength() === 0;
  Webapp.seenEmptyGetCallbackThisTick = false;

  if (Webapp.paused) {
    switch (Webapp.nextStep) {
      case StepType.RUN:
        // Bail out here if in a break state (paused), but make sure that we still
        // have the next tick queued first, so we can resume after un-pausing):
        return;
      case StepType.OUT:
        // If we haven't yet set stepOutToStackDepth, work backwards through the
        // history of callExpressionSeenAtDepth until we find the one we want to
        // step out to - and store that in stepOutToStackDepth:
        if (Webapp.interpreter && typeof Webapp.stepOutToStackDepth === 'undefined') {
          Webapp.stepOutToStackDepth = 0;
          for (var i = Webapp.interpreter.stateStack.length - 1; i > 0; i--) {
            if (Webapp.callExpressionSeenAtDepth[i]) {
              Webapp.stepOutToStackDepth = i;
              break;
            }
          }
        }
        break;
    }
  }

  if (Webapp.interpreter) {
    var doneUserLine = false;
    var reachedBreak = false;
    var unwindingAfterStep = false;
    var inUserCode;
    var userCodeRow;
    var session = StudioApp.editor.aceEditor.getSession();
    // NOTE: when running with no source visible or at max speed with blocks, we
    // call a simple function to just get the line number, otherwise we call a
    // function that also selects the code:
    var selectCodeFunc =
      (StudioApp.hideSource ||
       (atMaxSpeed && !Webapp.paused && StudioApp.editor.currentlyUsingBlocks)) ?
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
          Webapp.seenEmptyGetCallbackThisTick) {
        // stop stepping the interpreter and wait until the next tick once we:
        // (1) reached a breakpoint and are done unwinding OR
        // (2) completed a line of user code (while not running atMaxSpeed) OR
        // (3) have seen an empty event queue in nativeGetCallback (no events)
        break;
      }
      userCodeRow = selectCodeFunc(Webapp.interpreter,
                                   Webapp.cumulativeLength,
                                   Webapp.userCodeStartOffset,
                                   Webapp.userCodeLength,
                                   StudioApp.editor);
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
           (userCodeRow !== Webapp.stoppedAtBreakpointRow &&
            codegen.isAceBreakpointRow(session, userCodeRow)))) {
        // Yes, arrived at a new breakpoint:
        if (Webapp.paused) {
          // Overwrite the nextStep value. (If we hit a breakpoint during a step
          // out or step over, this will cancel that step operation early)
          Webapp.nextStep = StepType.RUN;
        } else {
          Webapp.onPauseButton();
        }
        // Store some properties about where we stopped:
        Webapp.stoppedAtBreakpointRow = userCodeRow;
        Webapp.stoppedAtBreakpointStackDepth = Webapp.interpreter.stateStack.length;

        // Mark reachedBreak to stop stepping, and start unwinding if needed:
        reachedBreak = true;
        unwindingAfterStep = codegen.isNextStepSafeWhileUnwinding(Webapp.interpreter);
        continue;
      }
      // If we've moved past the place of the last breakpoint hit without being
      // deeper in the stack, we will discard the stoppedAtBreakpoint properties:
      if (inUserCode &&
          userCodeRow !== Webapp.stoppedAtBreakpointRow &&
          Webapp.interpreter.stateStack.length <= Webapp.stoppedAtBreakpointStackDepth) {
        delete Webapp.stoppedAtBreakpointRow;
        delete Webapp.stoppedAtBreakpointStackDepth;
      }
      // If we're unwinding, continue to update the stoppedAtBreakpoint properties
      // to ensure that we have the right properties stored when the unwind completes:
      if (inUserCode && unwindingAfterStep) {
        Webapp.stoppedAtBreakpointRow = userCodeRow;
        Webapp.stoppedAtBreakpointStackDepth = Webapp.interpreter.stateStack.length;
      }
      try {
        Webapp.interpreter.step();
        doneUserLine = doneUserLine ||
          (inUserCode && Webapp.interpreter.stateStack[0] && Webapp.interpreter.stateStack[0].done);

        // Remember the stack depths of call expressions (so we can implement 'step out')

        // Truncate any history of call expressions seen deeper than our current stack position:
        Webapp.callExpressionSeenAtDepth.length = Webapp.interpreter.stateStack.length + 1;

        if (inUserCode && Webapp.interpreter.stateStack[0].node.type === "CallExpression") {
          // Store that we've seen a call expression at this depth in callExpressionSeenAtDepth:
          Webapp.callExpressionSeenAtDepth[Webapp.interpreter.stateStack.length] = true;
        }

        if (Webapp.paused) {
          // Store the first call expression stack depth seen while in this step operation:
          if (inUserCode && Webapp.interpreter.stateStack[0].node.type === "CallExpression") {
            if (typeof Webapp.firstCallStackDepthThisStep === 'undefined') {
              Webapp.firstCallStackDepthThisStep = Webapp.interpreter.stateStack.length;
            }
          }
          // For the step in case, we want to stop the interpreter as soon as we enter the callee:
          if (!doneUserLine &&
              inUserCode &&
              Webapp.nextStep === StepType.IN &&
              Webapp.interpreter.stateStack.length > Webapp.firstCallStackDepthThisStep) {
            reachedBreak = true;
          }
          // After the interpreter says a node is "done" (meaning it is time to stop), we will
          // advance a little further to the start of the next statement. We achieve this by
          // continuing to set unwindingAfterStep to true to keep the loop going:
          if (doneUserLine || reachedBreak) {
            var wasUnwinding = unwindingAfterStep;
            // step() additional times if we know it to be safe to get us to the next statement:
            unwindingAfterStep = codegen.isNextStepSafeWhileUnwinding(Webapp.interpreter);
            if (wasUnwinding && !unwindingAfterStep) {
              // done unwinding.. select code that is next to execute:
              userCodeRow = selectCodeFunc(Webapp.interpreter,
                                           Webapp.cumulativeLength,
                                           Webapp.userCodeStartOffset,
                                           Webapp.userCodeLength,
                                           StudioApp.editor);
              inUserCode = (-1 !== userCodeRow);
              if (!inUserCode) {
                // not in user code, so keep unwinding after all...
                unwindingAfterStep = true;
              }
            }
          }

          if ((reachedBreak || doneUserLine) && !unwindingAfterStep) {
            if (Webapp.nextStep === StepType.OUT &&
                Webapp.interpreter.stateStack.length > Webapp.stepOutToStackDepth) {
              // trying to step out, but we didn't get out yet... continue on.
            } else if (Webapp.nextStep === StepType.OVER &&
                typeof Webapp.firstCallStackDepthThisStep !== 'undefined' &&
                Webapp.interpreter.stateStack.length > Webapp.firstCallStackDepthThisStep) {
              // trying to step over, and we're in deeper inside a function call... continue next onTick
            } else {
              // Our step operation is complete, reset nextStep to StepType.RUN to
              // return to a normal 'break' state:
              Webapp.nextStep = StepType.RUN;
              if (inUserCode) {
                // Store some properties about where we stopped:
                Webapp.stoppedAtBreakpointRow = userCodeRow;
                Webapp.stoppedAtBreakpointStackDepth = Webapp.interpreter.stateStack.length;
              }
              delete Webapp.stepOutToStackDepth;
              delete Webapp.firstCallStackDepthThisStep;
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
      codegen.selectCurrentCode(Webapp.interpreter,
                                Webapp.cumulativeLength,
                                Webapp.userCodeStartOffset,
                                Webapp.userCodeLength,
                                StudioApp.editor);
    }
  } else {
    if (Webapp.tickCount === 1) {
      try { Webapp.whenRunFunc(StudioApp, api, Webapp.Globals); } catch (e) { }
    }
  }

  if (checkFinished()) {
    Webapp.onPuzzleComplete();
  }
};

/**
 * Initialize Blockly and Webapp for read-only (blocks feedback).
 * Called on iframe load for read-only.
 */
Webapp.initReadonly = function(config) {
  // Do some minimal level loading so that
  // we can ensure that the blocks are appropriately modified for this level
  skin = config.skin;
  level = config.level;
  loadLevel();

  // Webapp.initMinimal();

  StudioApp.initReadonly(config);
};

/**
 * Initialize Blockly and the Webapp app.  Called on page load.
 */
Webapp.init = function(config) {
  Webapp.clearEventHandlersKillTickLoop();
  skin = config.skin;
  level = config.level;

  loadLevel();

  if (StudioApp.hideSource) {
    // always run at max speed if source is hidden
    config.level.sliderSpeed = 1.0;
  }

  Webapp.canvasScale = (window.devicePixelRatio > 1) ? window.devicePixelRatio : 1;

  var showSlider = !config.hide_source && config.level.editCode;
  var showDebugButtons = !config.hide_source && config.level.editCode;
  var showDebugConsole = !config.hide_source && config.level.editCode;
  var finishButtonFirstLine = _.isEmpty(level.softButtons) && !showSlider;
  var firstControlsRow = require('./controls.html')({
    assetUrl: StudioApp.assetUrl,
    showSlider: showSlider,
    finishButton: finishButtonFirstLine
  });
  var extraControlsRow = require('./extraControlRows.html')({
    assetUrl: StudioApp.assetUrl,
    finishButton: !finishButtonFirstLine,
    debugButtons: showDebugButtons,
    debugConsole: showDebugConsole
  });

  config.html = page({
    assetUrl: StudioApp.assetUrl,
    data: {
      localeDirection: StudioApp.localeDirection(),
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
    StudioApp.loadAudio(skin.winSound, 'win');
    StudioApp.loadAudio(skin.startSound, 'start');
    StudioApp.loadAudio(skin.failureSound, 'failure');
  };

  config.afterInject = function() {
    if (StudioApp.usingBlockly) {
      /**
       * The richness of block colours, regardless of the hue.
       * MOOC blocks should be brighter (target audience is younger).
       * Must be in the range of 0 (inclusive) to 1 (exclusive).
       * Blockly's default is 0.45.
       */
      Blockly.HSV_SATURATION = 0.6;

      Blockly.SNAP_RADIUS *= Webapp.scale.snapRadius;
    } else {
      // Set up an event handler to create breakpoints when clicking in the
      // ace gutter:
      var aceEditor = StudioApp.editor.aceEditor;
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
    }
    drawDiv();
  };

  // arrangeStartBlocks(config);

  config.twitter = twitterOptions;

  // hide makeYourOwn on the share page
  config.makeYourOwn = false;

  config.varsInGlobals = true;
  config.noButtonsBelowOnMobileShare = true;

  // Webapp.initMinimal();

  StudioApp.init(config);

  if (level.editCode) {
    // Initialize the slider.
    var slider = document.getElementById('webapp-slider');
    if (slider) {
      Webapp.speedSlider = new Slider(10, 35, 130, slider);

      // Change default speed (eg Speed up levels that have lots of steps).
      if (config.level.sliderSpeed) {
        Webapp.speedSlider.setValue(config.level.sliderSpeed);
      }
    }
    var debugInput = document.getElementById('debug-input');
    if (debugInput) {
      debugInput.addEventListener('keydown', onDebugInputKeyDown);
    }
  }

  var finishButton = document.getElementById('finishButton');
  dom.addClickTouchEvent(finishButton, Webapp.onPuzzleComplete);

  if (level.editCode) {
    var pauseButton = document.getElementById('pauseButton');
    var stepInButton = document.getElementById('stepInButton');
    var stepOverButton = document.getElementById('stepOverButton');
    var stepOutButton = document.getElementById('stepOutButton');
    if (pauseButton && stepInButton && stepOverButton && stepOutButton) {
      dom.addClickTouchEvent(pauseButton, Webapp.onPauseButton);
      dom.addClickTouchEvent(stepInButton, Webapp.onStepInButton);
      dom.addClickTouchEvent(stepOverButton, Webapp.onStepOverButton);
      dom.addClickTouchEvent(stepOutButton, Webapp.onStepOutButton);
    }
    var viewDataButton = document.getElementById('viewDataButton');
    if (viewDataButton) {
      dom.addClickTouchEvent(viewDataButton, Webapp.onViewData);
    }
  }

  if (StudioApp.share) {
    // automatically run in share mode:
    window.setTimeout(StudioApp.runButtonClick, 0);
  }
};

/**
 * Clear the event handlers and stop the onTick timer.
 */
Webapp.clearEventHandlersKillTickLoop = function() {
  Webapp.whenRunFunc = null;
  Webapp.running = false;
  Webapp.tickCount = 0;

  var spinner = document.getElementById('spinner');
  if (spinner) {
    spinner.style.visibility = 'hidden';
  }

  var pauseButton = document.getElementById('pauseButton');
  var stepInButton = document.getElementById('stepInButton');
  var stepOverButton = document.getElementById('stepOverButton');
  var stepOutButton = document.getElementById('stepOutButton');
  if (pauseButton && stepInButton && stepOverButton && stepOutButton) {
    pauseButton.textContent = webappMsg.pause();
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
StudioApp.reset = function(first) {
  var i;
  Webapp.clearEventHandlersKillTickLoop();

  // Soft buttons
  var softButtonCount = 0;
  for (i = 0; i < Webapp.softButtons_.length; i++) {
    document.getElementById(Webapp.softButtons_[i]).style.display = 'inline';
    softButtonCount++;
  }
  if (softButtonCount) {
    var softButtonsCell = document.getElementById('soft-buttons');
    softButtonsCell.className = 'soft-buttons-' + softButtonCount;
  }

  // Reset configurable variables
  var divWebapp = document.getElementById('divWebapp');

  while (divWebapp.firstChild) {
    divWebapp.removeChild(divWebapp.firstChild);
  }

  // Clone and replace divWebapp (this removes all attached event listeners):
  var newDivWebapp = divWebapp.cloneNode(true);
  divWebapp.parentNode.replaceChild(newDivWebapp, divWebapp);

  // Reset goal successState:
  if (level.goal) {
    level.goal.successState = {};
  }

  if (level.editCode) {
    Webapp.paused = false;
    Webapp.nextStep = StepType.RUN;
    delete Webapp.stepOutToStackDepth;
    delete Webapp.firstCallStackDepthThisStep;
    delete Webapp.stoppedAtBreakpointRow;
    delete Webapp.stoppedAtBreakpointStackDepth;
    Webapp.callExpressionSeenAtDepth = [];
    // Reset the pause button:
    var pauseButton = document.getElementById('pauseButton');
    var stepInButton = document.getElementById('stepInButton');
    var stepOverButton = document.getElementById('stepOverButton');
    var stepOutButton = document.getElementById('stepOutButton');
    if (pauseButton && stepInButton && stepOverButton && stepOutButton) {
      pauseButton.textContent = webappMsg.pause();
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
  Webapp.Globals = {};
  Webapp.eventQueue = [];
  Webapp.executionError = null;
  Webapp.interpreter = null;
};

/**
 * Click the run button.  Start the program.
 */
// XXX This is the only method used by the templates!
StudioApp.runButtonClick = function() {
  var runButton = document.getElementById('runButton');
  var resetButton = document.getElementById('resetButton');
  // Ensure that Reset button is at least as wide as Run button.
  if (!resetButton.style.minWidth) {
    resetButton.style.minWidth = runButton.offsetWidth + 'px';
  }
  StudioApp.toggleRunReset('reset');
  if (StudioApp.usingBlockly) {
    Blockly.mainBlockSpace.traceOn(true);
  }
  StudioApp.reset(false);
  StudioApp.attempts++;
  Webapp.execute();

  if (level.freePlay && !StudioApp.hideSource) {
    var shareCell = document.getElementById('share-cell');
    shareCell.className = 'share-cell-enabled';
  }
};

/**
 * App specific displayFeedback function that calls into
 * StudioApp.displayFeedback when appropriate
 */
var displayFeedback = function() {
  if (!Webapp.waitingForReport) {
    StudioApp.displayFeedback({
      app: 'webapp', //XXX
      skin: skin.id,
      feedbackType: Webapp.testResults,
      response: Webapp.response,
      level: level,
      showingSharing: level.freePlay,
      feedbackImage: Webapp.feedbackImage,
      twitter: twitterOptions,
      // allow users to save freeplay levels to their gallery (impressive non-freeplay levels are autosaved)
      saveToGalleryUrl: level.freePlay && Webapp.response && Webapp.response.save_to_gallery_url,
      appStrings: {
        reinfFeedbackMsg: webappMsg.reinfFeedbackMsg(),
        sharingText: webappMsg.shareGame()
      }
    });
  }
};

/**
 * Function to be called when the service report call is complete
 * @param {object} JSON response (if available)
 */
Webapp.onReportComplete = function(response) {
  Webapp.response = response;
  Webapp.waitingForReport = false;
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
                         codeFunctions: level.codeFunctions,
                         StudioApp: StudioApp,
                         Studio: api,
                         Globals: Webapp.Globals } ); } catch (e) { }
};

/**
 * A miniature runtime in the interpreted world calls this function repeatedly
 * to check to see if it should invoke any callbacks from within the
 * interpreted world. If the eventQueue is not empty, we will return an object
 * that contains an interpreted callback function (stored in "fn") and,
 * optionally, callback arguments (stored in "arguments")
 */
var nativeGetCallback = function () {
  var retVal = Webapp.eventQueue.shift();
  if (typeof retVal === "undefined") {
    Webapp.seenEmptyGetCallbackThisTick = true;
  }
  return retVal;
};

var consoleApi = {};

consoleApi.log = function() {
  var nativeArgs = [];
  for (var i = 0; i < arguments.length; i++) {
    nativeArgs[i] = codegen.marshalInterpreterToNative(Webapp.interpreter,
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
  outputWebappConsole(output);
};

var JSONApi = {};

// NOTE: this version of parse does not support the reviver parameter

JSONApi.parse = function(text) {
  return JSON.parse(text);
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
Webapp.execute = function() {
  Webapp.result = StudioApp.ResultType.UNSET;
  Webapp.testResults = StudioApp.TestResults.NO_TESTS_RUN;
  Webapp.waitingForReport = false;
  Webapp.response = null;
  var i;

  StudioApp.playAudio('start');

  StudioApp.reset(false);

  // Set event handlers and start the onTick timer

  var codeWhenRun;
  if (level.editCode) {
    codeWhenRun = utils.generateCodeAliases(level.codeFunctions, 'Webapp');
    codeWhenRun += utils.generateCodeAliases(mathFunctions, 'Math');
    Webapp.userCodeStartOffset = codeWhenRun.length;
    Webapp.userCodeLineOffset = codeWhenRun.split("\n").length - 1;
    codeWhenRun += StudioApp.editor.getValue();
    Webapp.userCodeLength = codeWhenRun.length - Webapp.userCodeStartOffset;
    // Append our mini-runtime after the user's code. This will spin and process
    // callback functions:
    codeWhenRun += '\nwhile (true) { var obj = getCallback(); ' +
      'if (obj) { obj.fn.apply(null, obj.arguments ? obj.arguments : null); }}';
    var session = StudioApp.editor.aceEditor.getSession();
    Webapp.cumulativeLength = codegen.aceCalculateCumulativeLength(session);
  } else {
    // Define any top-level procedures the user may have created
    // (must be after reset(), which resets the Webapp.Globals namespace)
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
                                          StudioApp: StudioApp,
                                          Webapp: api,
                                          console: consoleApi,
                                          JSON: JSONApi,
                                          Globals: Webapp.Globals });

        var getCallbackObj = interpreter.createObject(interpreter.FUNCTION);
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
      };
      try {
        Webapp.interpreter = new window.Interpreter(codeWhenRun, initFunc);
      }
      catch(err) {
        handleExecutionError(err);
      }
    } else {
      Webapp.whenRunFunc = codegen.functionFromCode(codeWhenRun, {
                                          StudioApp: StudioApp,
                                          Webapp: api,
                                          Globals: Webapp.Globals } );
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

  Webapp.running = true;
  queueOnTick();
};

Webapp.onPauseButton = function() {
  if (Webapp.running) {
    var pauseButton = document.getElementById('pauseButton');
    var stepInButton = document.getElementById('stepInButton');
    var stepOverButton = document.getElementById('stepOverButton');
    var stepOutButton = document.getElementById('stepOutButton');
    // We have code and are either running or paused
    if (Webapp.paused) {
      Webapp.paused = false;
      Webapp.nextStep = StepType.RUN;
      pauseButton.textContent = webappMsg.pause();
    } else {
      Webapp.paused = true;
      Webapp.nextStep = StepType.RUN;
      pauseButton.textContent = webappMsg.continue();
    }
    stepInButton.disabled = !Webapp.paused;
    stepOverButton.disabled = !Webapp.paused;
    stepOutButton.disabled = !Webapp.paused;
    document.getElementById('spinner').style.visibility =
        Webapp.paused ? 'hidden' : 'visible';
  }
};

Webapp.onStepOverButton = function() {
  if (Webapp.running) {
    Webapp.paused = true;
    Webapp.nextStep = StepType.OVER;
    document.getElementById('spinner').style.visibility = 'visible';
  }
};

Webapp.onStepInButton = function() {
  if (!Webapp.running) {
    StudioApp.runButtonClick();
    Webapp.onPauseButton();
  }
  Webapp.paused = true;
  Webapp.nextStep = StepType.IN;
  document.getElementById('spinner').style.visibility = 'visible';
};

Webapp.onStepOutButton = function() {
  if (Webapp.running) {
    Webapp.paused = true;
    Webapp.nextStep = StepType.OUT;
    document.getElementById('spinner').style.visibility = 'visible';
  }
};

Webapp.feedbackImage = '';
Webapp.encodedFeedbackImage = '';

Webapp.onViewData = function() {
  window.open(
    '//' + getPegasusHost() + '/edit-csp-app/' + FormStorage.getAppSecret(),
    '_blank');
};

Webapp.onPuzzleComplete = function() {
  if (Webapp.executionError) {
    Webapp.result = StudioApp.ResultType.ERROR;
  } else if (level.freePlay) {
    Webapp.result = StudioApp.ResultType.SUCCESS;
  }

  // Stop everything on screen
  Webapp.clearEventHandlersKillTickLoop();

  // If the current level is a free play, always return the free play result
  if (level.freePlay) {
    Webapp.testResults = StudioApp.TestResults.FREE_PLAY;
  } else {
    var levelComplete = (Webapp.result === StudioApp.ResultType.SUCCESS);
    Webapp.testResults = StudioApp.getTestResults(levelComplete);
  }

  if (Webapp.testResults >= StudioApp.TestResults.FREE_PLAY) {
    StudioApp.playAudio('win');
  } else {
    StudioApp.playAudio('failure');
  }

  var program;

  if (level.editCode) {
    // If we want to "normalize" the JavaScript to avoid proliferation of nearly
    // identical versions of the code on the service, we could do either of these:

    // do an acorn.parse and then use escodegen to generate back a "clean" version
    // or minify (uglifyjs) and that or js-beautify to restore a "clean" version

    program = StudioApp.editor.getValue();
  } else {
    var xml = Blockly.Xml.blockSpaceToDom(Blockly.mainBlockSpace);
    program = Blockly.Xml.domToText(xml);
  }

  Webapp.waitingForReport = true;

  var sendReport = function() {
    StudioApp.report({
      app: 'webapp',
      level: level.id,
      result: Webapp.result === StudioApp.ResultType.SUCCESS,
      testResult: Webapp.testResults,
      program: encodeURIComponent(program),
      image: Webapp.encodedFeedbackImage,
      onComplete: Webapp.onReportComplete
    });
  };

  if (typeof document.getElementById('divWebapp').toDataURL === 'undefined') { // don't try it if function is not defined
    sendReport();
  } else {
    document.getElementById('divWebapp').toDataURL("image/png", {
      callback: function(pngDataUrl) {
        Webapp.feedbackImage = pngDataUrl;
        Webapp.encodedFeedbackImage = encodeURIComponent(Webapp.feedbackImage.split(',')[1]);

        sendReport();
      }
    });
  }
};

Webapp.executeCmd = function (id, name, opts) {
  var cmd = {
    'id': id,
    'name': name,
    'opts': opts
  };
  return Webapp.callCmd(cmd);
};

//
// Execute a command from a command queue
//
// Return false if the command is not complete (it will remain in the queue)
// and this function will be called again with the same command later
//
// Return true if the command is complete
//

Webapp.callCmd = function (cmd) {
  var retVal = true;
  switch (cmd.name) {
    /*
    case 'wait':
      if (!cmd.opts.started) {
        StudioApp.highlight(cmd.id);
      }
      return Studio.wait(cmd.opts);
    */
    case 'createHtmlBlock':
    case 'replaceHtmlBlock':
    case 'deleteHtmlBlock':
    case 'createButton':
    case 'createImage':
    case 'createCanvas':
    case 'canvasDrawLine':
    case 'canvasDrawCircle':
    case 'canvasDrawRect':
    case 'canvasSetLineWidth':
    case 'canvasSetStrokeColor':
    case 'canvasSetFillColor':
    case 'canvasDrawImage':
    case 'canvasGetImageData':
    case 'canvasPutImageData':
    case 'canvasClear':
    case 'createTextInput':
    case 'createTextLabel':
    case 'createCheckbox':
    case 'createRadio':
    case 'createDropdown':
    case 'getAttribute':
    case 'setAttribute':
    case 'getText':
    case 'setText':
    case 'getChecked':
    case 'setChecked':
    case 'getImageURL':
    case 'setImageURL':
    case 'createImageUploadButton':
    case 'setPosition':
    case 'setParent':
    case 'setStyle':
    case 'attachEventHandler':
    case 'startWebRequest':
    case 'setTimeout':
    case 'clearTimeout':
    case 'createRecord':
    case 'readRecords':
      StudioApp.highlight(cmd.id);
      retVal = Webapp[cmd.name](cmd.opts);
      break;
  }
  return retVal;
};

Webapp.createHtmlBlock = function (opts) {
  var divWebapp = document.getElementById('divWebapp');

  var newDiv = document.createElement("div");
  newDiv.id = opts.elementId;
  newDiv.innerHTML = opts.html;

  return Boolean(divWebapp.appendChild(newDiv));
};

Webapp.createButton = function (opts) {
  var divWebapp = document.getElementById('divWebapp');

  var newButton = document.createElement("button");
  var textNode = document.createTextNode(opts.text);
  newButton.id = opts.elementId;

  return Boolean(newButton.appendChild(textNode) &&
                 divWebapp.appendChild(newButton));
};

Webapp.createImage = function (opts) {
  var divWebapp = document.getElementById('divWebapp');

  var newImage = document.createElement("img");
  newImage.src = opts.src;
  newImage.id = opts.elementId;

  return Boolean(divWebapp.appendChild(newImage));
};

Webapp.createImageUploadButton = function (opts) {
  var divWebapp = document.getElementById('divWebapp');

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
                 divWebapp.appendChild(newLabel));
};

Webapp.createCanvas = function (opts) {
  var divWebapp = document.getElementById('divWebapp');

  var newElement = document.createElement("canvas");
  var ctx = newElement.getContext("2d");
  if (newElement && ctx) {
    newElement.id = opts.elementId;
    // default width/height if params are missing
    var width = opts.width || 400;
    var height = opts.height || 600;
    newElement.width = width * Webapp.canvasScale;
    newElement.height = height * Webapp.canvasScale;
    newElement.style.width = width + 'px';
    newElement.style.height = height + 'px';
    // set transparent fill by default:
    ctx.fillStyle = "rgba(255, 255, 255, 0)";

    return Boolean(divWebapp.appendChild(newElement));
  }
  return false;
};

Webapp.canvasDrawLine = function (opts) {
  var divWebapp = document.getElementById('divWebapp');
  var canvas = document.getElementById(opts.elementId);
  var ctx = canvas.getContext("2d");
  if (ctx && divWebapp.contains(canvas)) {
    ctx.beginPath();
    ctx.moveTo(opts.x1 * Webapp.canvasScale, opts.y1 * Webapp.canvasScale);
    ctx.lineTo(opts.x2 * Webapp.canvasScale, opts.y2 * Webapp.canvasScale);
    ctx.stroke();
    return true;
  }
  return false;
};

Webapp.canvasDrawCircle = function (opts) {
  var divWebapp = document.getElementById('divWebapp');
  var canvas = document.getElementById(opts.elementId);
  var ctx = canvas.getContext("2d");
  if (ctx && divWebapp.contains(canvas)) {
    ctx.beginPath();
    ctx.arc(opts.x * Webapp.canvasScale,
            opts.y * Webapp.canvasScale,
            opts.radius * Webapp.canvasScale,
            0,
            2 * Math.PI);
    ctx.fill();
    ctx.stroke();
    return true;
  }
  return false;
};

Webapp.canvasDrawRect = function (opts) {
  var divWebapp = document.getElementById('divWebapp');
  var canvas = document.getElementById(opts.elementId);
  var ctx = canvas.getContext("2d");
  if (ctx && divWebapp.contains(canvas)) {
    ctx.beginPath();
    ctx.rect(opts.x * Webapp.canvasScale,
             opts.y * Webapp.canvasScale,
             opts.width * Webapp.canvasScale,
             opts.height * Webapp.canvasScale);
    ctx.fill();
    ctx.stroke();
    return true;
  }
  return false;
};

Webapp.canvasSetLineWidth = function (opts) {
  var divWebapp = document.getElementById('divWebapp');
  var canvas = document.getElementById(opts.elementId);
  var ctx = canvas.getContext("2d");
  if (ctx && divWebapp.contains(canvas)) {
    ctx.lineWidth = opts.width * Webapp.canvasScale;
    return true;
  }
  return false;
};

Webapp.canvasSetStrokeColor = function (opts) {
  var divWebapp = document.getElementById('divWebapp');
  var canvas = document.getElementById(opts.elementId);
  var ctx = canvas.getContext("2d");
  if (ctx && divWebapp.contains(canvas)) {
    ctx.strokeStyle = String(opts.color);
    return true;
  }
  return false;
};

Webapp.canvasSetFillColor = function (opts) {
  var divWebapp = document.getElementById('divWebapp');
  var canvas = document.getElementById(opts.elementId);
  var ctx = canvas.getContext("2d");
  if (ctx && divWebapp.contains(canvas)) {
    ctx.fillStyle = String(opts.color);
    return true;
  }
  return false;
};

Webapp.canvasClear = function (opts) {
  var divWebapp = document.getElementById('divWebapp');
  var canvas = document.getElementById(opts.elementId);
  var ctx = canvas.getContext("2d");
  if (ctx && divWebapp.contains(canvas)) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    return true;
  }
  return false;
};

Webapp.canvasDrawImage = function (opts) {
  var divWebapp = document.getElementById('divWebapp');
  var canvas = document.getElementById(opts.elementId);
  var image = document.getElementById(opts.imageId);
  var ctx = canvas.getContext("2d");
  if (ctx && divWebapp.contains(canvas) && divWebapp.contains(image)) {
    var xScale, yScale;
    xScale = yScale = Webapp.canvasScale;
    if (opts.width) {
      xScale = xScale * (opts.width / image.width);
    }
    if (opts.height) {
      yScale = yScale * (opts.height / image.height);
    }
    ctx.save();
    ctx.setTransform(xScale,
                     0,
                     0,
                     yScale,
                     opts.x * Webapp.canvasScale,
                     opts.y * Webapp.canvasScale);
    ctx.drawImage(image, 0, 0);
    ctx.restore();
    return true;
  }
  return false;
};

Webapp.canvasGetImageData = function (opts) {
  var divWebapp = document.getElementById('divWebapp');
  var canvas = document.getElementById(opts.elementId);
  var ctx = canvas.getContext("2d");
  if (ctx && divWebapp.contains(canvas)) {
    return ctx.getImageData(opts.x * Webapp.canvasScale,
                            opts.y * Webapp.canvasScale,
                            opts.width * Webapp.canvasScale,
                            opts.height * Webapp.canvasScale);
  }
};

Webapp.canvasPutImageData = function (opts) {
  var divWebapp = document.getElementById('divWebapp');
  var canvas = document.getElementById(opts.elementId);
  var ctx = canvas.getContext("2d");
  if (ctx && divWebapp.contains(canvas)) {
    // Create tmpImageData and initialize it because opts.imageData is not
    // going to be a real ImageData object if it came from the interpreter
    var tmpImageData = ctx.createImageData(opts.imageData.width,
                                           opts.imageData.height);
    tmpImageData.data.set(opts.imageData.data);
    return ctx.putImageData(tmpImageData,
                            opts.x * Webapp.canvasScale,
                            opts.y * Webapp.canvasScale);
  }
};

Webapp.createTextInput = function (opts) {
  var divWebapp = document.getElementById('divWebapp');

  var newInput = document.createElement("input");
  newInput.value = opts.text;
  newInput.id = opts.elementId;

  return Boolean(divWebapp.appendChild(newInput));
};

Webapp.createTextLabel = function (opts) {
  var divWebapp = document.getElementById('divWebapp');

  var newLabel = document.createElement("label");
  var textNode = document.createTextNode(opts.text);
  newLabel.id = opts.elementId;
  var forElement = document.getElementById(opts.forId);
  if (forElement && divWebapp.contains(forElement)) {
    newLabel.setAttribute('for', opts.forId);
  }

  return Boolean(newLabel.appendChild(textNode) &&
                 divWebapp.appendChild(newLabel));
};

Webapp.createCheckbox = function (opts) {
  var divWebapp = document.getElementById('divWebapp');

  var newCheckbox = document.createElement("input");
  newCheckbox.setAttribute("type", "checkbox");
  newCheckbox.checked = opts.checked;
  newCheckbox.id = opts.elementId;

  return Boolean(divWebapp.appendChild(newCheckbox));
};

Webapp.createRadio = function (opts) {
  var divWebapp = document.getElementById('divWebapp');

  var newRadio = document.createElement("input");
  newRadio.setAttribute("type", "radio");
  newRadio.name = opts.name;
  newRadio.checked = opts.checked;
  newRadio.id = opts.elementId;

  return Boolean(divWebapp.appendChild(newRadio));
};

Webapp.createDropdown = function (opts) {
  var divWebapp = document.getElementById('divWebapp');

  var newSelect = document.createElement("select");

  if (opts.optionsArray) {
    for (var i = 0; i < opts.optionsArray.length; i++) {
      var option = document.createElement("option");
      option.text = opts.optionsArray[i];
      newSelect.add(option);
    }
  }
  newSelect.id = opts.elementId;

  return Boolean(divWebapp.appendChild(newSelect));
};

Webapp.getAttribute = function (opts) {
  var divWebapp = document.getElementById('divWebapp');
  var element = document.getElementById(opts.elementId);
  var attribute = String(opts.attribute);
  return divWebapp.contains(element) ? element[attribute] : false;
};

// Whitelist of HTML Element attributes which can be modified, to
// prevent DOM manipulation which would violate the sandbox.
Webapp.mutableAttributes = ['innerHTML', 'scrollTop'];

Webapp.setAttribute = function (opts) {
  var divWebapp = document.getElementById('divWebapp');
  var element = document.getElementById(opts.elementId);
  var attribute = String(opts.attribute);
  if (divWebapp.contains(element) &&
      Webapp.mutableAttributes.indexOf(attribute) !== -1) {
    element[attribute] = opts.value;
    return true;
  }
  return false;
};

Webapp.getText = function (opts) {
  var divWebapp = document.getElementById('divWebapp');
  var element = document.getElementById(opts.elementId);
  if (divWebapp.contains(element)) {
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

Webapp.setText = function (opts) {
  var divWebapp = document.getElementById('divWebapp');
  var element = document.getElementById(opts.elementId);
  if (divWebapp.contains(element)) {
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

Webapp.getChecked = function (opts) {
  var divWebapp = document.getElementById('divWebapp');
  var element = document.getElementById(opts.elementId);
  if (divWebapp.contains(element) && element.tagName === 'INPUT') {
    return element.checked;
  }
  return false;
};

Webapp.setChecked = function (opts) {
  var divWebapp = document.getElementById('divWebapp');
  var element = document.getElementById(opts.elementId);
  if (divWebapp.contains(element) && element.tagName === 'INPUT') {
    element.checked = opts.checked;
    return true;
  }
  return false;
};

Webapp.getImageURL = function (opts) {
  var divWebapp = document.getElementById('divWebapp');
  var element = document.getElementById(opts.elementId);
  if (divWebapp.contains(element)) {
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

Webapp.setImageURL = function (opts) {
  var divWebapp = document.getElementById('divWebapp');
  var element = document.getElementById(opts.elementId);
  if (divWebapp.contains(element) && element.tagName === 'IMG') {
    element.src = opts.src;
    return true;
  }
  return false;
};

Webapp.replaceHtmlBlock = function (opts) {
  var divWebapp = document.getElementById('divWebapp');
  var oldDiv = document.getElementById(opts.elementId);
  if (divWebapp.contains(oldDiv)) {
    var newDiv = document.createElement("div");
    newDiv.id = opts.elementId;
    newDiv.innerHTML = opts.html;

    return Boolean(oldDiv.parentElement.replaceChild(newDiv, oldDiv));
  }
  return false;
};

Webapp.deleteHtmlBlock = function (opts) {
  var divWebapp = document.getElementById('divWebapp');
  var div = document.getElementById(opts.elementId);
  if (divWebapp.contains(div)) {
    return Boolean(div.parentElement.removeChild(div));
  }
  return false;
};

Webapp.setStyle = function (opts) {
  var divWebapp = document.getElementById('divWebapp');
  var div = document.getElementById(opts.elementId);
  if (divWebapp.contains(div)) {
    div.style.cssText += opts.style;
    return true;
  }
  return false;
};

Webapp.setParent = function (opts) {
  var divWebapp = document.getElementById('divWebapp');
  var div = document.getElementById(opts.elementId);
  var divNewParent = document.getElementById(opts.parentId);
  if (divWebapp.contains(div) && divWebapp.contains(divNewParent)) {
    return Boolean(div.parentElement.removeChild(div) &&
                   divNewParent.appendChild(div));
  }
  return false;
};

Webapp.setPosition = function (opts) {
  var divWebapp = document.getElementById('divWebapp');
  var div = document.getElementById(opts.elementId);
  if (divWebapp.contains(div)) {
    div.style.position = 'absolute';
    div.style.left = String(opts.left) + 'px';
    div.style.top = String(opts.top) + 'px';
    div.style.width = String(opts.width) + 'px';
    div.style.height = String(opts.height) + 'px';
    return true;
  }
  return false;
};

Webapp.onEventFired = function (opts, e) {
  if (typeof e != 'undefined') {
    // Push a function call on the queue with an array of arguments consisting
    // of just the 'e' parameter
    Webapp.eventQueue.push({
      'fn': opts.func,
      'arguments': [e]
    });
  } else {
    Webapp.eventQueue.push({'fn': opts.func});
  }
};

Webapp.attachEventHandler = function (opts) {
  var divWebapp = document.getElementById('divWebapp');
  var domElement = document.getElementById(opts.elementId);
  if (divWebapp.contains(domElement)) {
    switch (opts.eventName) {
      /*
      Check for a specific set of Hammer v1 event names (full set below) and if
      we find a match, instantiate Hammer on that element

      TODO (cpirich): review the following:
      * whether using Hammer v1 events is the right choice
      * choose the specific list of events
      * consider instantiating Hammer just once per-element or on divWebapp
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
        var hammerElement = new Hammer(divWebapp, { 'preventDefault': true });
        hammerElement.on(opts.eventName,
                         Webapp.onEventFired.bind(this, opts));
        break;
      default:
        // For now, we're not tracking how many of these we add and we don't allow
        // the user to detach the handler. We detach all listeners by cloning the
        // divWebapp DOM node inside of reset()
        domElement.addEventListener(
            opts.eventName,
            Webapp.onEventFired.bind(this, opts));
    }
    return true;
  }
  return false;
};

Webapp.onHttpRequestEvent = function (opts) {
  if (this.readyState === 4) {
    Webapp.eventQueue.push({
      'fn': opts.func,
      'arguments': [
        Number(this.status),
        String(this.getResponseHeader('content-type')),
        String(this.responseText)]
    });
  }
};

Webapp.startWebRequest = function (opts) {
  var req = new XMLHttpRequest();
  req.onreadystatechange = Webapp.onHttpRequestEvent.bind(req, opts);
  req.open('GET', String(opts.url), true);
  req.send();
};

Webapp.onTimeoutFired = function (opts) {
  Webapp.eventQueue.push({
    'fn': opts.func
  });
};

Webapp.setTimeout = function (opts) {
  return window.setTimeout(Webapp.onTimeoutFired.bind(this, opts), opts.milliseconds);
};

Webapp.clearTimeout = function (opts) {
  // NOTE: we do not currently check to see if this is a timer created by
  // our Webapp.setTimeout() function
  window.clearTimeout(opts.timeoutId);
};

Webapp.createRecord = function (opts) {
  var record = codegen.marshalInterpreterToNative(Webapp.interpreter,
      opts.record);
  FormStorage.createRecord(record,
      Webapp.handleCreateRecord.bind(this, opts.callback));
};

Webapp.handleCreateRecord = function(interpreterCallback, record) {
  Webapp.eventQueue.push({
    'fn': interpreterCallback,
    'arguments': [record]
  });
};

Webapp.readRecords = function (opts) {
  var searchParams = codegen.marshalInterpreterToNative(Webapp.interpreter,
      opts.searchParams);
  FormStorage.readRecords(
      searchParams,
      Webapp.handleReadRecords.bind(this, opts.callback));
};

Webapp.handleReadRecords = function(interpreterCallback, records) {
  Webapp.eventQueue.push({
    'fn': interpreterCallback,
    'arguments': [records]
  });
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

Webapp.timedOut = function() {
  return Webapp.tickCount > Webapp.timeoutFailureTick;
};

var checkFinished = function () {
  // if we have a succcess condition and have accomplished it, we're done and successful
  if (level.goal && level.goal.successCondition && level.goal.successCondition()) {
    Webapp.result = StudioApp.ResultType.SUCCESS;
    return true;
  }

  // if we have a failure condition, and it's been reached, we're done and failed
  if (level.goal && level.goal.failureCondition && level.goal.failureCondition()) {
    Webapp.result = StudioApp.ResultType.FAILURE;
    return true;
  }

  /*
  if (Webapp.allGoalsVisited()) {
    Webapp.result = StudioApp.ResultType.SUCCESS;
    return true;
  }
  */

  if (Webapp.timedOut()) {
    Webapp.result = StudioApp.ResultType.FAILURE;
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
          return 'localhost.code.org:9393';
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
