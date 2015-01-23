require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({12:[function(require,module,exports){
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
},{"../appMain":3,"./applab":6,"./blocks":7,"./levels":11,"./skins":13}],13:[function(require,module,exports){
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

},{"../skins":108}],11:[function(require,module,exports){
/*jshint multistr: true */

var msg = require('../../locale/current/applab');
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
      tb('<block type="applab_createHtmlBlock" inline="true"> \
        <value name="ID"><block type="text"><title name="TEXT">id</title></block></value> \
        <value name="HTML"><block type="text"><title name="TEXT">html</title></block></value></block>'),
  'startBlocks':
   '<block type="when_run" deletable="false" x="20" y="20"></block>'
};

levels.ec_simple = {
  'freePlay': true,
  'editCode': true,
  'sliderSpeed': 0.95,
  'codeFunctions': [
    {'func': 'onEvent', 'title': 'Execute code in response to an event for the specified element', 'category': 'General', 'params': ["'id'", "'click'", "function() {\n  \n}"] },
    {'func': 'startWebRequest', 'title': 'Request data from the internet and execute code when the request is complete', 'category': 'General', 'params': ["'http://api.openweathermap.org/data/2.5/weather?q=London,uk'", "function(status, type, content) {\n  \n}"] },
    {'func': 'setTimeout', 'title': 'Set a timer and execute code when that number of milliseconds has elapsed', 'category': 'General', 'params': ["function() {\n  \n}", "1000"] },
    {'func': 'clearTimeout', 'title': 'Clear an existing timer by passing in the value returned from setTimeout()', 'category': 'General', 'params': ["0"] },
    {'func': 'createHtmlBlock', 'title': 'Create a block of HTML and assign it an element id', 'category': 'General', 'params': ["'id'", "'html'"] },
    {'func': 'replaceHtmlBlock', 'title': 'Replace a block of HTML associated with the specified id', 'category': 'General', 'params': ["'id'", "'html'"] },
    {'func': 'deleteHtmlBlock', 'title': 'Delete the element with the specified id', 'category': 'General', 'params': ["'id'"] },
    {'func': 'setParent', 'title': 'Set an element to become a child of a parent element', 'category': 'General', 'params': ["'id'", "'parentId'"] },
    {'func': 'setPosition', 'title': 'Position an element with x, y, width, and height coordinates', 'category': 'General', 'params': ["'id'", "0", "0", "100", "100"] },
    {'func': 'setStyle', 'title': 'Add CSS style text to an element', 'category': 'General', 'params': ["'id'", "'color:red;'"] },
    {'func': 'getAttribute', 'category': 'General', 'params': ["'id'", "'scrollHeight'"], 'type': 'value' },
    {'func': 'setAttribute', 'category': 'General', 'params': ["'id'", "'scrollHeight'", "200"]},
    {'func': 'createButton', 'title': 'Create a button and assign it an element id', 'category': 'UI Controls', 'params': ["'id'", "'text'"] },
    {'func': 'createTextInput', 'title': 'Create a text input and assign it an element id', 'category': 'UI Controls', 'params': ["'id'", "'text'"] },
    {'func': 'createTextLabel', 'title': 'Create a text label, assign it an element id, and bind it to an associated element', 'category': 'UI Controls', 'params': ["'id'", "'text'", "'forId'"] },
    {'func': 'createDropdown', 'title': 'Create a dropdown, assign it an element id, and populate it with a list of items', 'category': 'UI Controls', 'params': ["'id'", "'option1'", "'etc'"] },
    {'func': 'getText', 'title': 'Get the text from the specified element', 'category': 'UI Controls', 'params': ["'id'"], 'type': 'value' },
    {'func': 'setText', 'title': 'Set the text for the specified element', 'category': 'UI Controls', 'params': ["'id'", "'text'"] },
    {'func': 'createCheckbox', 'title': 'Create a checkbox and assign it an element id', 'category': 'UI Controls', 'params': ["'id'", "false"] },
    {'func': 'createRadio', 'title': 'Create a radio button and assign it an element id', 'category': 'UI Controls', 'params': ["'id'", "false", "'group'"] },
    {'func': 'getChecked', 'title': 'Get the state of a checkbox or radio button', 'category': 'UI Controls', 'params': ["'id'"], 'type': 'value' },
    {'func': 'setChecked', 'title': 'Set the state of a checkbox or radio button', 'category': 'UI Controls', 'params': ["'id'", "true"] },
    {'func': 'createImage', 'title': 'Create an image and assign it an element id', 'category': 'UI Controls', 'params': ["'id'", "'http://code.org/images/logo.png'"] },
    {'func': 'getImageURL', 'title': 'Get the URL associated with an image or image upload button', 'category': 'UI Controls', 'params': ["'id'"], 'type': 'value' },
    {'func': 'setImageURL', 'title': 'Set the URL for the specified image element id', 'category': 'UI Controls', 'params': ["'id'", "'http://code.org/images/logo.png'"] },
    {'func': 'createImageUploadButton', 'title': 'Create an image upload button and assign it an element id', 'category': 'UI Controls', 'params': ["'id'", "'text'"] },
    {'func': 'createCanvas', 'title': 'Create a canvas with width, height dimensions', 'category': 'Canvas', 'params': ["'id'", "400", "600"] },
    {'func': 'canvasDrawLine', 'title': 'Draw a line on a canvas from x1, y1 to x2, y2', 'category': 'Canvas', 'params': ["'id'", "0", "0", "400", "600"] },
    {'func': 'canvasDrawCircle', 'title': 'Draw a circle on a canvas with the specified coordinates for center (x, y) and radius', 'category': 'Canvas', 'params': ["'id'", "200", "300", "100"] },
    {'func': 'canvasDrawRect', 'title': 'Draw a rectangle on a canvas with x, y, width, and height coordinates', 'category': 'Canvas', 'params': ["'id'", "100", "200", "200", "200"] },
    {'func': 'canvasSetLineWidth', 'title': 'Set the line width for a canvas', 'category': 'Canvas', 'params': ["'id'", "3"] },
    {'func': 'canvasSetStrokeColor', 'title': 'Set the stroke color for a canvas', 'category': 'Canvas', 'params': ["'id'", "'red'"] },
    {'func': 'canvasSetFillColor', 'title': 'Set the fill color for a canvas', 'category': 'Canvas', 'params': ["'id'", "'yellow'"] },
    {'func': 'canvasDrawImage', 'title': 'Draw an image on a canvas with the specified image element and x, y as the top left coordinates', 'category': 'Canvas', 'params': ["'id'", "'imageId'", "0", "0"] },
    {'func': 'canvasGetImageData', 'title': 'Get the ImageData for a rectangle (x, y, width, height) within a canvas', 'category': 'Canvas', 'params': ["'id'", "0", "0", "400", "600"], 'type': 'value' },
    {'func': 'canvasPutImageData', 'title': 'Set the ImageData for a rectangle within a canvas with x, y as the top left coordinates', 'category': 'Canvas', 'params': ["'id'", "imageData", "0", "0"] },
    {'func': 'canvasClear', 'title': 'Clear all data on a canvas', 'category': 'Canvas', 'params': ["'id'"] },
    {'func': 'createSharedRecord', 'category': 'General', 'params': ["{tableName: 'abc',name:'Alice',age:7,male:false}", "function() {\n  \n}"] },
    {'func': 'readSharedRecords', 'category': 'General', 'params': ["{tableName: 'abc'}", "function(records) {\n  for (var i =0; i < records.length; i++) {\n    for (var prop in records[i]) {\n      createHtmlBlock('id2', 'records[' + i + '].' + prop + ': ' + records[i][prop]);\n    }\n  }\n}"] },
  ],
  'categoryInfo': {
    'General': {
      'color': 'blue',
      'blocks': []
    },
    'UI Controls': {
      'color': 'red',
      'blocks': []
    },
    'Canvas': {
      'color': 'yellow',
      'blocks': []
    },
  },
};

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

},{"../../locale/current/applab":150,"../block_utils":15,"../utils":148}],6:[function(require,module,exports){
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

function loadLevel() {
  Applab.timeoutFailureTick = level.timeoutFailureTick || Infinity;
  Applab.minWorkspaceHeight = level.minWorkspaceHeight;
  Applab.softButtons_ = level.softButtons || {};

  // Override scalars.
  for (var key in level.scale) {
    Applab.scale[key] = level.scale[key];
  }
}

var drawDiv = function () {
  var divApplab = document.getElementById('divApplab');
  var divWidth = parseInt(window.getComputedStyle(divApplab).width, 10);

  // TODO: one-time initial drawing

  // Adjust visualizationColumn width.
  var visualizationColumn = document.getElementById('visualizationColumn');
  visualizationColumn.style.width = divWidth + 'px';
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

  var atInitialBreakpoint = Applab.paused && Applab.nextStep === StepType.IN && Applab.tickCount === 1;
  var atMaxSpeed = getCurrentTickLength() === 0;
  Applab.seenEmptyGetCallbackThisTick = false;

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

  if (Applab.interpreter) {
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
          Applab.seenEmptyGetCallbackThisTick) {
        // stop stepping the interpreter and wait until the next tick once we:
        // (1) reached a breakpoint and are done unwinding OR
        // (2) completed a line of user code (while not running atMaxSpeed) OR
        // (3) have seen an empty event queue in nativeGetCallback (no events)
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
  } else {
    if (Applab.tickCount === 1) {
      try { Applab.whenRunFunc(studioApp, api, Applab.Globals); } catch (e) { }
    }
  }

  if (checkFinished()) {
    Applab.onPuzzleComplete();
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

  Applab.canvasScale = (window.devicePixelRatio > 1) ? window.devicePixelRatio : 1;

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
  };

  // arrangeStartBlocks(config);

  config.twitter = twitterOptions;

  // hide makeYourOwn on the share page
  config.makeYourOwn = false;

  config.varsInGlobals = true;
  config.noButtonsBelowOnMobileShare = true;

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

  if (studioApp.share) {
    // automatically run in share mode:
    window.setTimeout(studioApp.runButtonClick, 0);
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
                         codeFunctions: level.codeFunctions,
                         studioApp: studioApp,
                         Studio: api,
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
    Applab.seenEmptyGetCallbackThisTick = true;
  }
  return retVal;
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
    codeWhenRun = utils.generateCodeAliases(level.codeFunctions, 'Applab');
    codeWhenRun += utils.generateCodeAliases(mathFunctions, 'Math');
    Applab.userCodeStartOffset = codeWhenRun.length;
    Applab.userCodeLineOffset = codeWhenRun.split("\n").length - 1;
    codeWhenRun += studioApp.editor.getValue();
    Applab.userCodeLength = codeWhenRun.length - Applab.userCodeStartOffset;
    // Append our mini-runtime after the user's code. This will spin and process
    // callback functions:
    codeWhenRun += '\nwhile (true) { var obj = getCallback(); ' +
      'if (obj) { obj.fn.apply(null, obj.arguments ? obj.arguments : null); }}';
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
    '//' + getPegasusHost() + '/private/edit-csp-app/' + AppStorage.tempAppId,
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
// Execute a command from a command queue
//
// Return false if the command is not complete (it will remain in the queue)
// and this function will be called again with the same command later
//
// Return true if the command is complete
//

Applab.callCmd = function (cmd) {
  var retVal = true;
  switch (cmd.name) {
    /*
    case 'wait':
      if (!cmd.opts.started) {
        studioApp.highlight(cmd.id);
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
    case 'onEvent':
    case 'startWebRequest':
    case 'setTimeout':
    case 'clearTimeout':
    case 'createSharedRecord':
    case 'readSharedRecords':
      studioApp.highlight(cmd.id);
      retVal = Applab[cmd.name](cmd.opts);
      break;
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

Applab.createCanvas = function (opts) {
  var divApplab = document.getElementById('divApplab');

  var newElement = document.createElement("canvas");
  var ctx = newElement.getContext("2d");
  if (newElement && ctx) {
    newElement.id = opts.elementId;
    // default width/height if params are missing
    var width = opts.width || 400;
    var height = opts.height || 600;
    newElement.width = width * Applab.canvasScale;
    newElement.height = height * Applab.canvasScale;
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
    ctx.moveTo(opts.x1 * Applab.canvasScale, opts.y1 * Applab.canvasScale);
    ctx.lineTo(opts.x2 * Applab.canvasScale, opts.y2 * Applab.canvasScale);
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
    ctx.arc(opts.x * Applab.canvasScale,
            opts.y * Applab.canvasScale,
            opts.radius * Applab.canvasScale,
            0,
            2 * Math.PI);
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
    ctx.rect(opts.x * Applab.canvasScale,
             opts.y * Applab.canvasScale,
             opts.width * Applab.canvasScale,
             opts.height * Applab.canvasScale);
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
    ctx.lineWidth = opts.width * Applab.canvasScale;
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
    xScale = yScale = Applab.canvasScale;
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
                     opts.x * Applab.canvasScale,
                     opts.y * Applab.canvasScale);
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
    return ctx.getImageData(opts.x * Applab.canvasScale,
                            opts.y * Applab.canvasScale,
                            opts.width * Applab.canvasScale,
                            opts.height * Applab.canvasScale);
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
    return ctx.putImageData(tmpImageData,
                            opts.x * Applab.canvasScale,
                            opts.y * Applab.canvasScale);
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
      'arguments': [e]
    });
  } else {
    Applab.eventQueue.push({'fn': opts.func});
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
  var record = codegen.marshalInterpreterToNative(Applab.interpreter,
      opts.record);
  AppStorage.createSharedRecord(record,
      Applab.handleCreateSharedRecord.bind(this, opts.callback));
};

Applab.handleCreateSharedRecord = function(interpreterCallback, record) {
  Applab.eventQueue.push({
    'fn': interpreterCallback,
    'arguments': [record]
  });
};

Applab.readSharedRecords = function (opts) {
  var searchParams = codegen.marshalInterpreterToNative(Applab.interpreter,
      opts.searchParams);
  AppStorage.readSharedRecords(
      searchParams,
      Applab.handleReadSharedRecords.bind(this, opts.callback));
};

Applab.handleReadSharedRecords = function(interpreterCallback, records) {
  Applab.eventQueue.push({
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

},{"../../locale/current/applab":150,"../../locale/current/common":153,"../StudioApp":2,"../codegen":38,"../constants":39,"../dom":40,"../skins":108,"../slider":109,"../templates/page.html":128,"../utils":148,"../xml":149,"./api":4,"./appStorage":5,"./blocks":7,"./controls.html":8,"./extraControlRows.html":9,"./formStorage":10,"./visualization.html":14}],14:[function(require,module,exports){
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
 buf.push('<div id="divApplab">\n</div>\n'); })();
} 
return buf.join('');
};
  return function(locals) {
    return t(locals, require("ejs").filters);
  }
}());
},{"ejs":168}],10:[function(require,module,exports){
/**
 * CodeOrgApp: Applab
 *
 * Copyright 2014-2015 Code.org
 *
 */

'use strict';

/**
 * Namespace for form storage.
 */ 
var FormStorage = module.exports;


/**
 * Creates a new record in the specified table.
 * @param {string} record.tableName The name of the table to read from.
 * @param {Object} record Object containing other properties to store
 *     on the record.
 * @param {Function} callback Function to call with the resulting record.
 */
FormStorage.createRecord = function(record, callback) {
  var tableName = record.tableName;
  if (!tableName) {
    // TODO(dave): remove console.log for IE9 compatability, here and below.
    console.log('readRecords: missing required property "tableName"');
    return;
  }
  FormStorage.fetchTableSecret(
      tableName, 
      putRecord.bind(this, record, callback));
};

var putRecord = function(record, callback, tableSecret) {
  var req = new XMLHttpRequest();
  req.onreadystatechange = handlePutRecord.bind(req, record, callback, tableSecret);
  var url = '//' + getFormDataHost() + '/v2/forms/CspTable/' + tableSecret +
      '/children/CspRecord';
  delete record.tableName;
  var postData = {record_data_s: JSON.stringify(record)};
  req.open('POST', url, true);
  req.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
  req.send(JSON.stringify(postData));
};

var handlePutRecord = function(record, callback, tableSecret) {
  if (this.readyState !== 4) {
    return;
  }
  if (this.status !== 201) {
    console.log('unexpected http status ' + this.status);
    return;
  }
  
  // TODO(dave): merge tableSecret into record once XSS issues are resolved.
  callback(record);
};

/**
 * Reads records which match the searchParams specified by the user,
 * and passes them to the callback.
 * @param {string} searchParams.tableName The name of the table to read from.
 * @param {string} searchParams.recordId Optional id of record to read.
 * @param {Object} searchParams Other search criteria. Only records
 *     whose contents match all criteria will be returned.
 * @param {Function} callback Function to call with an array of record objects.
 */
FormStorage.readRecords = function(searchParams, callback) {
  var tableName = searchParams.tableName;
  if (!tableName) {
    console.log('readRecords: missing required property "tableName"');
    return;
  }
  // TODO(dave): optimization: call fetchRecords here if table data is cached.
  FormStorage.fetchTableSecret(
      tableName, 
      fetchRecords.bind(this, tableName, searchParams, callback));
};

var fetchRecords = function(tableName, searchParams, callback, tableSecret) {
  var req = new XMLHttpRequest();
  req.onreadystatechange = handleFetchRecords.bind(req, tableName,
      searchParams, callback);
  var url = '//' + getFormDataHost() + '/v2/forms/CspTable/' + tableSecret +
      '/children/CspRecord';
  req.open('GET', url, true);
  req.send();
};

var handleFetchRecords = function(tableName, searchParams, callback) {
  if (this.readyState !== 4) {
    return;
  }
  if (this.status !== 200) {
    console.log('readRecords failed with status ' + this.status);
    return;
  }
  var forms = JSON.parse(this.responseText);
  var records = forms.map(function(form) {
    var record = JSON.parse(form.record_data_s);
    record.tableName = tableName;
    record.recordId = form.secret;
    return record;
  });
  records = records.filter(function(record) {
    for (var prop in searchParams) {
      if (record[prop] !== searchParams[prop]) {
        return false;
      }
    }
    return true;
  });
  callback(records);
};

// Helper methods

/**
 * Retrieves the table secret for a given table name.
 * @param {string} tableName Table name.
 * @param {function(string)} callback Callback to call with the table secret.
 */
FormStorage.fetchTableSecret = function(tableName, callback) {
  var req = new XMLHttpRequest();
  req.onreadystatechange =
      handleFetchTableSecret.bind(req, tableName, callback);
  var url = '//' + getFormDataHost() + '/v2/forms/CspApp/' + 
      FormStorage.getAppSecret() + '/children/CspTable';
  req.open('GET', url, true);
  req.send();
};

var handleFetchTableSecret = function(tableName, callback) {
  if (this.readyState !== 4) {
    return;
  }
  if (this.status !== 200) {
    console.log('unexpected http status ' + this.status);
    return;
  }
  var formData = JSON.parse(this.responseText);
  if (!(formData instanceof Array)) {
    console.log('formData is not an array');
    return;
  }

  var tableData = formData.filter(function(table) {
    return table.table_name_s === tableName;
  });
  var tableSecret = tableData[0] && tableData[0].secret;
  if (!tableSecret) {
    console.log('table not found: ' + tableName);
    console.log(tableData);
    return;
  }
  callback(tableSecret);
};

// TODO(dave): move this logic to dashboard.
var getFormDataHost = function() {
  // Forms api is already mapped to pegasus on all non-local deployments.
  // Caveat: local api access only works with temporary hacks in place
  // to set dashboard_user cookie and access-control-allow-origin header.
  return window.location.hostname.split('.')[0] === 'localhost' ?
      'localhost.code.org:9393' : window.location.hostname;
};

// TODO(dave): store secret with the app in the database.
FormStorage.getAppSecret = function() {
  var name = window.location.hostname.split('.')[0];
  switch(name) {
    case 'localhost':
      return 'ededb6d4a8ced65f8a011ce0e194094e';
    case 'staging':
      return 'b0a06b8bbd7352a3fdb1b6738262defd';
    default:
      return null;
  }
};


},{}],9:[function(require,module,exports){
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
 buf.push('');1; var msg = require('../../locale/current/common') ; buf.push('\n');2; var applabMsg = require('../../locale/current/applab') ; buf.push('\n\n');4; if (debugButtons) { ; buf.push('\n<div>\n  <div id="debug-buttons" style="display:inline;">\n    <button id="pauseButton" class="share">\n      ', escape((8,  applabMsg.pause() )), '\n    </button>\n    <button id="stepInButton" class="share">\n      ', escape((11,  applabMsg.stepIn() )), '\n    </button>\n    <button id="stepOverButton" class="share">\n      ', escape((14,  applabMsg.stepOver() )), '\n    </button>\n    <button id="stepOutButton" class="share">\n      ', escape((17,  applabMsg.stepOut() )), '\n    </button>\n    <button id="viewDataButton" class="share">\n      ', escape((20,  applabMsg.viewData() )), '\n    </button>\n  </div>\n');23; } ; buf.push('\n\n');25; if (debugConsole) { ; buf.push('\n  <div id="debug-console" class="debug-console">\n    <textarea id="debug-output" readonly disabled tabindex=-1 class="debug-output"></textarea>\n    <span class="debug-input-prompt">\n      &gt;\n    </span>\n    <div contenteditable id="debug-input" class="debug-input"></div>\n  </div>\n');33; } ; buf.push('\n\n');35; if (finishButton) { ; buf.push('\n  <div id="share-cell" class="share-cell-none">\n    <button id="finishButton" class="share">\n      <img src="', escape((38,  assetUrl('media/1x1.gif') )), '">', escape((38,  msg.finish() )), '\n    </button>\n  </div>\n');41; } ; buf.push('\n\n');43; if (debugButtons) { ; buf.push('\n</div>\n');45; } ; buf.push('\n'); })();
} 
return buf.join('');
};
  return function(locals) {
    return t(locals, require("ejs").filters);
  }
}());
},{"../../locale/current/applab":150,"../../locale/current/common":153,"ejs":168}],8:[function(require,module,exports){
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
 buf.push('');1; var msg = require('../../locale/current/common') ; buf.push('\n\n');3; if (showSlider) { ; buf.push('\n  <div id="slider-cell">\n    <svg id="applab-slider"\n         xmlns="http://www.w3.org/2000/svg"\n         xmlns:svg="http://www.w3.org/2000/svg"\n         xmlns:xlink="http://www.w3.org/1999/xlink"\n         version="1.1"\n         width="150"\n         height="50">\n        <!-- Slow icon. -->\n        <clipPath id="slowClipPath">\n          <rect width=26 height=12 x=5 y=14 />\n        </clipPath>\n        <image xlink:href="', escape((16,  assetUrl('media/applab/turtle_icons.png') )), '" height=42 width=84 x=-21 y=-10\n            clip-path="url(#slowClipPath)" />\n        <!-- Fast icon. -->\n        <clipPath id="fastClipPath">\n          <rect width=26 height=16 x=120 y=10 />\n        </clipPath>\n        <image xlink:href="', escape((22,  assetUrl('media/applab/turtle_icons.png') )), '" height=42 width=84 x=120 y=-11\n            clip-path="url(#fastClipPath)" />\n    </svg>\n    <img id="spinner" style="visibility: hidden;" src="', escape((25,  assetUrl('media/applab/loading.gif') )), '" height=15 width=15>\n  </div>\n');27; } ; buf.push('\n\n<div id="soft-buttons" class="soft-buttons-none">\n  <button id="leftButton" class="arrow">\n    <img src="', escape((31,  assetUrl('media/1x1.gif') )), '" class="left-btn icon21">\n  </button>\n  <button id="rightButton" class="arrow">\n    <img src="', escape((34,  assetUrl('media/1x1.gif') )), '" class="right-btn icon21">\n  </button>\n  <button id="upButton" class="arrow">\n    <img src="', escape((37,  assetUrl('media/1x1.gif') )), '" class="up-btn icon21">\n  </button>\n  <button id="downButton" class="arrow">\n    <img src="', escape((40,  assetUrl('media/1x1.gif') )), '" class="down-btn icon21">\n  </button>\n</div>\n\n');44; if (finishButton) { ; buf.push('\n  <div id="share-cell" class="share-cell-none">\n    <button id="finishButton" class="share">\n      <img src="', escape((47,  assetUrl('media/1x1.gif') )), '">', escape((47,  msg.finish() )), '\n    </button>\n  </div>\n');50; } ; buf.push('\n'); })();
} 
return buf.join('');
};
  return function(locals) {
    return t(locals, require("ejs").filters);
  }
}());
},{"../../locale/current/common":153,"ejs":168}],7:[function(require,module,exports){
/**
 * CodeOrgApp: Applab
 *
 * Copyright 2014-2015 Code.org
 *
 */
'use strict';

var msg = require('../../locale/current/applab');
var commonMsg = require('../../locale/current/common');
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

  installCreateHtmlBlock(blockly, generator, blockInstallOptions);
};

function installCreateHtmlBlock(blockly, generator, blockInstallOptions) {
  blockly.Blocks.applab_createHtmlBlock = {
    helpUrl: '',
    init: function() {
      this.setHSV(184, 1.00, 0.74);
      this.appendDummyInput().appendTitle(msg.createHtmlBlock());
      this.appendValueInput('ID');
      this.appendValueInput('HTML');
      this.setPreviousStatement(true);
      this.setInputsInline(true);
      this.setNextStatement(true);
      this.setTooltip(msg.createHtmlBlockTooltip());
    }
  };

  generator.applab_createHtmlBlock = function() {
    var idParam = Blockly.JavaScript.valueToCode(this, 'ID',
        Blockly.JavaScript.ORDER_NONE) || '';
    var htmlParam = Blockly.JavaScript.valueToCode(this, 'HTML',
        Blockly.JavaScript.ORDER_NONE) || '';
    return 'Applab.createHtmlBlock(\'block_id_' + this.id +
               '\', ' + idParam + ', ' + htmlParam + ');\n';
  };
}

},{"../../locale/current/applab":150,"../../locale/current/common":153,"../codegen":38,"../utils":148}],150:[function(require,module,exports){
/*applab*/ module.exports = window.blockly.appLocale;
},{}],5:[function(require,module,exports){
'use strict';

/**
 * Namespace for app storage.
 */
var AppStorage = module.exports;

// TODO(dave): remove once we can store ids for each app.
AppStorage.tempEncryptedAppId =
    window.location.hostname.split('.')[0] === 'localhost' ?
        "SmwVmYVl1V5UCCw1Ec6Dtw==" : "DvTw9X3pDcyDyil44S6qbw==";
AppStorage.tempAppId = 1337;

/**
 * Creates a new record in the specified table, accessible to all users.
 * @param {string} record.tableName The name of the table to read from.
 * @param {Object} record Object containing other properties to store
 *     on the record.
 * @param {Function} callback Function to call with the resulting record.
 */
AppStorage.createSharedRecord = function(record, callback) {
  var tableName = record.tableName;
  if (!tableName) {
    console.log('readRecords: missing required property "tableName"');
    return;
  }
  var req = new XMLHttpRequest();
  req.onreadystatechange = handleCreateSharedRecord.bind(req, record, callback);
  var url = "/v3/apps/" + AppStorage.tempEncryptedAppId + "/shared-tables/" + tableName;
  req.open('POST', url, true);
  req.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
  req.send(JSON.stringify(record));
};

var handleCreateSharedRecord = function(record, callback) {
  if (this.readyState !== 4) {
    return;
  }
  if (this.status < 200 || this.status > 300) {
    console.log('unexpected http status ' + this.status);
    return;
  }
  callback(record);
};

/**
 * Reads records which match the searchParams specified by the user,
 * and passes them to the callback.
 * @param {string} searchParams.tableName The name of the table to read from.
 * @param {string} searchParams.recordId Optional id of record to read.
 * @param {Object} searchParams Other search criteria. Only records
 *     whose contents match all criteria will be returned.
 * @param {Function} callback Function to call with an array of record objects.
 */
AppStorage.readSharedRecords = function(searchParams, callback) {
  var tableName = searchParams.tableName;
  if (!tableName) {
    console.log('readRecords: missing required property "tableName"');
    return;
  }
  var req = new XMLHttpRequest();
  req.onreadystatechange = handleReadSharedRecords.bind(req, tableName,
      searchParams, callback);
  var url = '/v3/apps/' + AppStorage.tempEncryptedAppId + "/shared-tables/" + tableName;
  req.open('GET', url, true);
  req.send();
  
};

var handleReadSharedRecords = function(tableName, searchParams, callback) {
  if (this.readyState !== 4) {
    return;
  }
  if (this.status !== 200) {
    console.log('readRecords failed with status ' + this.status);
    return;
  }
  var records = JSON.parse(this.responseText);
  console.log(records);
  records = records.filter(function(record) {
    for (var prop in searchParams) {
      if (record[prop] !== searchParams[prop]) {
        return false;
      }
    }
    return true;
  });
  callback(records);
};

},{}],4:[function(require,module,exports){

exports.randomFromArray = function (values) {
  var key = Math.floor(Math.random() * values.length);
  return values[key];
};

// APIs needed for droplet and/or blockly (must include blockId):

exports.createHtmlBlock = function (blockId, elementId, html) {
  return Applab.executeCmd(blockId,
                          'createHtmlBlock',
                          {'elementId': elementId,
                           'html': html });
};

exports.replaceHtmlBlock = function (blockId, elementId, html) {
  return Applab.executeCmd(blockId,
                          'replaceHtmlBlock',
                          {'elementId': elementId,
                           'html': html });
};

exports.deleteHtmlBlock = function (blockId, elementId) {
  return Applab.executeCmd(blockId,
                          'deleteHtmlBlock',
                          {'elementId': elementId });
};

exports.createButton = function (blockId, elementId, text) {
  return Applab.executeCmd(blockId,
                          'createButton',
                          {'elementId': elementId,
                           'text': text });
};

exports.createImage = function (blockId, elementId, src) {
  return Applab.executeCmd(blockId,
                          'createImage',
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

exports.createCanvas = function (blockId, elementId, width, height) {
  return Applab.executeCmd(blockId,
                          'createCanvas',
                          {'elementId': elementId,
                           'width': width,
                           'height': height });
};

exports.canvasDrawLine = function (blockId, elementId, x1, y1, x2, y2) {
  return Applab.executeCmd(blockId,
                          'canvasDrawLine',
                          {'elementId': elementId,
                           'x1': x1,
                           'y1': y1,
                           'x2': x2,
                           'y2': y2 });
};

exports.canvasDrawCircle = function (blockId, elementId, x, y, radius) {
  return Applab.executeCmd(blockId,
                          'canvasDrawCircle',
                          {'elementId': elementId,
                           'x': x,
                           'y': y,
                           'radius': radius });
};

exports.canvasDrawRect = function (blockId, elementId, x, y, width, height) {
  return Applab.executeCmd(blockId,
                          'canvasDrawRect',
                          {'elementId': elementId,
                           'x': x,
                           'y': y,
                           'width': width,
                           'height': height });
};

exports.canvasSetLineWidth = function (blockId, elementId, width) {
  return Applab.executeCmd(blockId,
                          'canvasSetLineWidth',
                          {'elementId': elementId,
                           'width': width });
};

exports.canvasSetStrokeColor = function (blockId, elementId, color) {
  return Applab.executeCmd(blockId,
                          'canvasSetStrokeColor',
                          {'elementId': elementId,
                           'color': color });
};

exports.canvasSetFillColor = function (blockId, elementId, color) {
  return Applab.executeCmd(blockId,
                          'canvasSetFillColor',
                          {'elementId': elementId,
                           'color': color });
};

exports.canvasClear = function (blockId, elementId) {
  return Applab.executeCmd(blockId,
                          'canvasClear',
                          {'elementId': elementId });
};

exports.canvasDrawImage = function (blockId, elementId, imageId, x, y, width, height) {
  return Applab.executeCmd(blockId,
                          'canvasDrawImage',
                          {'elementId': elementId,
                           'imageId': imageId,
                           'x': x,
                           'y': y,
                           'width': width,
                           'height': height });
};

exports.canvasGetImageData = function (blockId, elementId, x, y, width, height) {
  return Applab.executeCmd(blockId,
                          'canvasGetImageData',
                          {'elementId': elementId,
                           'x': x,
                           'y': y,
                           'width': width,
                           'height': height });
};

exports.canvasPutImageData = function (blockId, elementId, imageData, x, y) {
  return Applab.executeCmd(blockId,
                          'canvasPutImageData',
                          {'elementId': elementId,
                           'imageData': imageData,
                           'x': x,
                           'y': y });
};

exports.createTextInput = function (blockId, elementId, text) {
  return Applab.executeCmd(blockId,
                          'createTextInput',
                          {'elementId': elementId,
                           'text': text });
};

exports.createTextLabel = function (blockId, elementId, text, forId) {
  return Applab.executeCmd(blockId,
                          'createTextLabel',
                          {'elementId': elementId,
                           'text': text,
                           'forId': forId });
};

exports.createCheckbox = function (blockId, elementId, checked) {
  return Applab.executeCmd(blockId,
                          'createCheckbox',
                          {'elementId': elementId,
                           'checked': checked });
};

exports.createRadio = function (blockId, elementId, checked, name) {
  return Applab.executeCmd(blockId,
                          'createRadio',
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

exports.createDropdown = function (blockId, elementId) {
  var optionsArray = Array.prototype.slice.call(arguments, 2);
  return Applab.executeCmd(blockId,
                          'createDropdown',
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

exports.createImageUploadButton = function (blockId, elementId, text) {
  return Applab.executeCmd(blockId,
                           'createImageUploadButton',
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
  return Applab.executeCmd(blockId,
                          'onEvent',
                          {'elementId': elementId,
                           'eventName': eventName,
                           'func': func });
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

exports.createSharedRecord = function (blockId, record, callback) {
  return Applab.executeCmd(blockId,
                          'createSharedRecord',
                          {'record': record,
                           'callback': callback });
};

exports.readSharedRecords = function (blockId, searchParams, callback) {
  return Applab.executeCmd(blockId,
                          'readSharedRecords',
                          {'searchParams': searchParams,
                           'callback': callback });
};

},{}]},{},[12]);
