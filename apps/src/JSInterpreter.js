var codegen = require('./codegen');
var ObservableEvent = require('./ObservableEvent');
var utils = require('./utils');

/**
 * Create a JSInterpreter object. This object wraps an Interpreter object and
 * adds stepping, batching of steps, code highlighting, error handling,
 * breakpoints, general debug capabilities (step in, step out, step over), and
 * an optional event queue.
 * @constructor
 * @param {!Object} options
 * @param {!StudioApp} options.studioApp
 * @param {function} [options.shouldRunAtMaxSpeed]
 * @param {number} [options.maxInterpreterStepsPerTick]
 * @param {Object} [options.customMarshalGlobalProperties]
 * @param {boolean} [options.logExecution] if true, executionLog[] be populated
 */
var JSInterpreter = module.exports = function (options) {
  this.studioApp = options.studioApp;
  this.shouldRunAtMaxSpeed = options.shouldRunAtMaxSpeed || function () { return true; };
  this.maxInterpreterStepsPerTick = options.maxInterpreterStepsPerTick || 10000;
  this.customMarshalGlobalProperties = options.customMarshalGlobalProperties || {};
  this.customMarshalBlockedProperties = options.customMarshalBlockedProperties || [];

  // Publicly-exposed events that anyone with access to the JSInterpreter can
  // observe and respond to.

  /** @type {ObservableEvent} */
  this.onNextStepChanged = new ObservableEvent();

  /** @type {ObservableEvent} */
  this.onPause = new ObservableEvent();

  /** @type {ObservableEvent} */
  this.onExecutionError = new ObservableEvent();

  /** @type {ObservableEvent} */
  this.onExecutionWarning = new ObservableEvent();

  this.paused = false;
  this.yieldExecution = false;
  this.startedHandlingEvents = false;
  this.executionError = null;
  this.nextStep = StepType.RUN;
  this.maxValidCallExpressionDepth = 0;
  this.isExecuting = false;
  this.callExpressionSeenAtDepth = [];
  this.stoppedAtBreakpointRows = [];
  this.logExecution = options.logExecution;
  this.executionLog = [];
};

/**
 * Initialize the JSInterpreter, parsing the provided code and preparing to
 * execute it one step at a time.
 *
 * @param {!Object} options - for now, same options passed to the constructor
 * @param {!string} options.code - Code to be executed by the interpreter.
 * @param {Array} [options.blocks] - in dropletConfig.blocks format.  If a block
 *        has a parent property, we will populate that function into the
 *        interpreter global scope.
 * @param {Object} [options.blockFilter] - an object with block-name keys that
 *        should be used to filter which blocks are populated.
 * @param {Array} [options.globalFunctions] - objects containing functions to
 *        place in the interpreter global scope.
 * @param {boolean} [options.enableEvents] - allow the interpreter to define
 *        event handlers that can be invoked by native code. (default false)
 */
JSInterpreter.prototype.parse = function (options) {
  if (!this.studioApp.hideSource) {
    this.calculateCodeInfo(options.code);

    var session = this.studioApp.editor.aceEditor.getSession();
    this.isBreakpointRow = codegen.isAceBreakpointRow.bind(null, session);
  } else {
    this.isBreakpointRow = function () { return false; };
  }

  var self = this;
  if (options.enableEvents) {
    this.eventQueue = [];
    // Append our mini-runtime after the user's code. This will spin and process
    // callback functions:
    options.code += '\nwhile (true) { var obj = getCallback(); ' +
      'if (obj) { var ret = obj.fn.apply(null, obj.arguments ? obj.arguments : null);' +
                 'setCallbackRetVal(ret); }}';

    codegen.createNativeFunctionFromInterpreterFunction = function (intFunc) {
      return function () {
        if (self.initialized()) {

          // Convert arguments to array in fastest way possible and avoid
          // "Bad value context for arguments variable" de-optimization
          // http://jsperf.com/array-with-and-without-length/5
          var args = new Array(arguments.length);
          for (var i = 0; i < arguments.length; i++) {
            args[i] = arguments[i];
          }

          self.eventQueue.push({
            fn: intFunc,
            arguments: args
          });

          if (!self.isExecuting) {
            // Execute the interpreter and if a return value is sent back from the
            // interpreter's event handler, pass that back in the native world

            // NOTE: the interpreter will not execute forever, if the event handler
            // takes too long, executeInterpreter() will return and the native side
            // will just see 'undefined' as the return value. The rest of the interpreter
            // event handler will run in the next onTick(), but the return value will
            // no longer have any effect.
            self.executeInterpreter(false, true);
            return self.lastCallbackRetVal;
          }
        }
      };
    };
  }

  var initFunc = function (interpreter, scope) {
    // Store Interpreter on JSInterpreter
    self.interpreter = interpreter;
    // Store globalScope on JSInterpreter
    self.globalScope = scope;
    // Override Interpreter's get/has/set Property functions with JSInterpreter
    interpreter.getProperty = self.getProperty.bind(
        self,
        interpreter,
        interpreter.getProperty);
    interpreter.hasProperty = self.hasProperty.bind(
        self,
        interpreter,
        interpreter.hasProperty);
    // Store this for later because we need to bypass our overriden function
    // in createGlobalProperty()
    self.baseSetProperty = interpreter.setProperty;
    interpreter.setProperty = self.setProperty.bind(
        self,
        interpreter,
        interpreter.setProperty);
    codegen.initJSInterpreter(
        interpreter,
        options.blocks,
        options.blockFilter,
        scope,
        options.globalFunctions);

    // Only allow five levels of depth when marshalling the return value
    // since we will occasionally return DOM Event objects which contain
    // properties that recurse over and over...
    var wrapper = codegen.makeNativeMemberFunction({
        interpreter: interpreter,
        nativeFunc: self.nativeGetCallback.bind(self),
        maxDepth: 5
    });
    interpreter.setProperty(scope,
                            'getCallback',
                            interpreter.createNativeFunction(wrapper));

    wrapper = codegen.makeNativeMemberFunction({
        interpreter: interpreter,
        nativeFunc: self.nativeSetCallbackRetVal.bind(self),
    });
    interpreter.setProperty(scope,
                            'setCallbackRetVal',
                            interpreter.createNativeFunction(wrapper));
  };

  try {
    // Return value will be stored as this.interpreter inside the supplied
    // initFunc() (other code in initFunc() depends on this.interpreter, so
    // we can't wait until the constructor returns)
    new window.Interpreter(options.code, initFunc);
  } catch (err) {
    this.executionError = err;
    this.handleError();
  }

};

/**
 * Init `this.codeInfo` with cumulative length info (used to locate breakpoints).
 * @param code
 */
JSInterpreter.prototype.calculateCodeInfo = function (code) {
  this.codeInfo = {};
  this.codeInfo.userCodeStartOffset = 0;
  this.codeInfo.userCodeLength = code.length;
  this.codeInfo.cumulativeLength = codegen.calculateCumulativeLength(code);
};

/**
 * Returns true if the JSInterpreter instance initialized successfully. This
 * would typically fail when the program contains a syntax error.
 */
JSInterpreter.prototype.initialized = function () {
  return !!this.interpreter;
};

/**
 * Detech the Interpreter instance. Call before releasing references to
 * JSInterpreter so any async callbacks will not execute.
 */
JSInterpreter.prototype.deinitialize = function () {
  this.interpreter = null;
};

JSInterpreter.StepType = {
  RUN:  0,
  IN:   1,
  OVER: 2,
  OUT:  3,
};

/**
 * A miniature runtime in the interpreted world calls this function repeatedly
 * to check to see if it should invoke any callbacks from within the
 * interpreted world. If the eventQueue is not empty, we will return an object
 * that contains an interpreted callback function (stored in "fn") and,
 * optionally, callback arguments (stored in "arguments")
 */
JSInterpreter.prototype.nativeGetCallback = function () {
  this.startedHandlingEvents = true;
  var retVal = this.eventQueue.shift();
  if (typeof retVal === "undefined") {
    this.yield();
  }
  return retVal;
};

JSInterpreter.prototype.nativeSetCallbackRetVal = function (retVal) {
  if (this.eventQueue.length === 0) {
    // If nothing else is in the event queue, then store this return value
    // away so it can be returned in the native event handler
    this.seenReturnFromCallbackDuringExecution = true;
    this.lastCallbackRetVal = retVal;
  }
  // Provide warnings to the user if this function has been called with a
  // meaningful return value while we are no longer in the native event handler

  // TODO (cpirich): Check to see if the DOM event object was modified
  // (preventDefault(), stopPropagation(), returnValue) and provide a similar
  // warning since these won't work as expected unless running atMaxSpeed
  if (!this.runUntilCallbackReturn &&
      typeof this.lastCallbackRetVal !== 'undefined') {
    this.onExecutionWarning.notifyObservers("Function passed to onEvent() " +
        "has taken too long - the return value was ignored.");
    if (!this.shouldRunAtMaxSpeed()) {
      this.onExecutionWarning.notifyObservers("  (try moving the speed " +
          "slider to its maximum value)");
    }
  }
};

/**
 * Yield execution (causes executeInterpreter loop to break out if this is
 * called by APIs called by interpreted code)
 */
JSInterpreter.prototype.yield = function () {
  this.yieldExecution = true;
};


var StepType = JSInterpreter.StepType;

/**
 * Small helper to step the interpreter so that exception handler can exist outside
 * of the core executeInterpeter() function (improves browser JS engine performance)
 */
function safeStepInterpreter(jsi) {
  try {
    jsi.interpreter.step();
  } catch (err) {
    return err;
  }
}

/**
 * Find a bpRow from the "stopped at breakpoint" array by matching the scope
 *
 * @param {!Object} scope to match from the list
 * @param {number} [row] to match from the list - in addition to scope
 */
JSInterpreter.prototype.findStoppedAtBreakpointRow = function (scope, row) {
  for (var i = 0; i < this.stoppedAtBreakpointRows.length; i++) {
    var bpRow = this.stoppedAtBreakpointRows[i];
    if (bpRow.scope === scope) {
      if (typeof row === 'undefined' || row === bpRow.row) {
        return bpRow;
      }
    }
  }
};

/**
 * Replace a bpRow from the "stopped at breakpoint" array by matching
 * the scope.
 *
 * If no rows are found matching the given scope, a new one is introduced.
 *
 * @param {!Object} scope to match from the list
 * @param {!number} row to replace in the list.
 * @throws {TypeError} when given an invalid row.
 */
JSInterpreter.prototype.replaceStoppedAtBreakpointRowForScope = function (scope, row) {
  if (typeof row !== 'number' || row < 0) {
    throw new TypeError('Row ' + row + ' is not a valid row in user code.');
  }

  for (var i = 0; i < this.stoppedAtBreakpointRows.length; i++) {
    var bpRow = this.stoppedAtBreakpointRows[i];
    if (bpRow.scope === scope) {
      // Update row number
      bpRow.row = row;
      return;
    }
  }
  // Scope not found, insert new object in array:
  this.stoppedAtBreakpointRows.unshift({
    row: row,
    scope: scope
  });
};

/**
 * Remove a bpRow from the "stopped at breakpoint" array by matching
 * the scope.
 *
 * Does nothing if no rows are found matching the given scope.
 *
 * @param {!Object} scope to match from the list
 */
JSInterpreter.prototype.removeStoppedAtBreakpointRowForScope = function (scope) {
  for (var i = 0; i < this.stoppedAtBreakpointRows.length; i++) {
    var bpRow = this.stoppedAtBreakpointRows[i];
    if (bpRow.scope === scope) {
        // Remove from array
        this.stoppedAtBreakpointRows.splice(i, 1);
        return;
    }
  }
};

/**
 * Determines if the program is done executing.
 *
 * @return {boolean} true if program is complete (or an error has occurred).
 */
JSInterpreter.prototype.isProgramDone = function () {
  return this.executionError ||
      !this.interpreter ||
      !this.interpreter.stateStack.length;
};

/**
 * Nodes that are visited between expressions, signifying the previous
 * expression is done.
 */
var INTERSTITIAL_NODES = {
  Program: true,
  BlockStatement: true,
  SwitchStatement: true
};

/**
 * Execute the interpreter
 */
JSInterpreter.prototype.executeInterpreter = function (firstStep, runUntilCallbackReturn) {
  if (this.isExecuting) {
    console.error('Attempt to call executeInterpreter while already executing ignored');
    return;
  }
  this.isExecuting = true;
  this.runUntilCallbackReturn = runUntilCallbackReturn;
  if (runUntilCallbackReturn) {
    delete this.lastCallbackRetVal;
  }
  this.yieldExecution = false;
  this.seenReturnFromCallbackDuringExecution = false;

  var atInitialBreakpoint = this.paused &&
                            this.nextStep === StepType.IN &&
                            firstStep;
  var atMaxSpeed = false;

  if (this.paused) {
    switch (this.nextStep) {
      case StepType.RUN:
        // Bail out here if in a break state (paused), but make sure that we still
        // have the next tick queued first, so we can resume after un-pausing):
        this.isExecuting = false;
        return;
      case StepType.OUT:
        // If we haven't yet set stepOutToStackDepth, work backwards through the
        // history of callExpressionSeenAtDepth until we find the one we want to
        // step out to - and store that in stepOutToStackDepth:
        if (this.interpreter && typeof this.stepOutToStackDepth === 'undefined') {
          this.stepOutToStackDepth = 0;
          for (var i = this.maxValidCallExpressionDepth; i > 0; i--) {
            if (this.callExpressionSeenAtDepth[i]) {
              this.stepOutToStackDepth = i;
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

  // In each tick, we will step the interpreter multiple times in a tight
  // loop as long as we are interpreting code that the user can't see
  // (function aliases at the beginning, getCallback event loop at the end)
  for (var stepsThisTick = 0;
       (stepsThisTick < this.maxInterpreterStepsPerTick) || unwindingAfterStep;
       stepsThisTick++) {
    // Check this every time because the speed is allowed to change...
    atMaxSpeed = this.shouldRunAtMaxSpeed();
    // NOTE:
    // (1) When running with no source visible AND at max speed, always set
    //   `userCodeRow` to -1. We'll never hit a breakpoint or need to add delay.
    // (2) When running with no source visible OR at max speed, call a simple
    //   function to just get the line number. Need to check `inUserCode` to
    //   maybe stop at a breakpoint, or add a `speed(n)` delay.
    // (3) Otherwise call a function that also highlights the code.
    var selectCodeFunc;
    if (this.studioApp.hideSource && atMaxSpeed) {
      selectCodeFunc = function () { return -1; };
    } else if (this.studioApp.hideSource || atMaxSpeed) {
      selectCodeFunc = this.getUserCodeLine;
    } else {
      selectCodeFunc = this.selectCurrentCode;
    }
    var currentScope = this.interpreter.getScope();

    if ((reachedBreak && !unwindingAfterStep) ||
        (doneUserLine && !unwindingAfterStep && !atMaxSpeed) ||
        this.yieldExecution ||
        this.interpreter.paused_ ||
        (runUntilCallbackReturn && this.seenReturnFromCallbackDuringExecution)) {
      // stop stepping the interpreter and wait until the next tick once we:
      // (1) reached a breakpoint and are done unwinding OR
      // (2) completed a line of user code and are are done unwinding
      //     (while not running atMaxSpeed) OR
      // (3) we've been asked to yield our executeInterpeter() loop OR
      // (4) the interpreter is paused (handling a native async func that is
      //     going to block to return a value synchronously in the interpreter) OR
      // (5) have seen an empty event queue in nativeGetCallback (no events) OR
      // (6) have seen a nativeSetCallbackRetVal call in runUntilCallbackReturn mode
      break;
    }
    userCodeRow = selectCodeFunc.call(this);
    inUserCode = (-1 !== userCodeRow);
    // Check to see if we've arrived at a new breakpoint:
    //  (1) should be in user code
    //  (2) should never happen while unwinding
    //  (3) should never happen when revisiting an interstitial node
    //  (4) requires either
    //   (a) atInitialBreakpoint OR
    //   (b) isAceBreakpointRow() AND not still at the same line number where
    //       we have already stopped from the last step/breakpoint
    if (inUserCode && !unwindingAfterStep && !this.atInterstitialNode &&
        (atInitialBreakpoint ||
         (this.isBreakpointRow(userCodeRow) &&
          !this.findStoppedAtBreakpointRow(currentScope, userCodeRow)))) {
      // Yes, arrived at a new breakpoint:
      if (this.paused) {
        // Overwrite the nextStep value. (If we hit a breakpoint during a step
        // out or step over, this will cancel that step operation early)
        this.nextStep = StepType.RUN;
        this.onNextStepChanged.notifyObservers();
      } else {
        this.onPause.notifyObservers();
      }
      // Store some properties about where we stopped:
      this.replaceStoppedAtBreakpointRowForScope(currentScope, userCodeRow);

      // Mark reachedBreak to stop stepping, and start unwinding if needed:
      reachedBreak = true;
      unwindingAfterStep = codegen.isNextStepSafeWhileUnwinding(this.interpreter);
      continue;
    }
    // If we've moved past the place of the last breakpoint hit without being
    // deeper in the stack, we will discard the stoppedAtBreakpoint properties:
    if (inUserCode && !this.findStoppedAtBreakpointRow(currentScope, userCodeRow)) {
      this.removeStoppedAtBreakpointRowForScope(currentScope);
    }
    // If we're unwinding, continue to update the stoppedAtBreakpoint properties
    // to ensure that we have the right properties stored when the unwind completes:
    if (inUserCode && unwindingAfterStep) {
      this.replaceStoppedAtBreakpointRowForScope(currentScope, userCodeRow);
    }
    if (this.logExecution) {
      this.logStep_();
    }
    this.executionError = safeStepInterpreter(this);
    if (!this.executionError && this.interpreter.stateStack.length) {
      var state = this.interpreter.stateStack[0], nodeType = state.node.type;
      this.atInterstitialNode = INTERSTITIAL_NODES.hasOwnProperty(nodeType);
      if (inUserCode) {
        doneUserLine = doneUserLine || (state.done || this.atInterstitialNode);
      }

      var stackDepth = this.interpreter.stateStack.length;
      // Remember the stack depths of call expressions (so we can implement 'step out')

      // Truncate any history of call expressions seen deeper than our current stack position:
      for (var depth = stackDepth + 1;
            depth <= this.maxValidCallExpressionDepth;
            depth++) {
        this.callExpressionSeenAtDepth[depth] = false;
      }
      this.maxValidCallExpressionDepth = stackDepth;

      if (inUserCode && this.interpreter.stateStack[0].node.type === "CallExpression") {
        // Store that we've seen a call expression at this depth in callExpressionSeenAtDepth:
        this.callExpressionSeenAtDepth[stackDepth] = true;
      }

      if (this.paused) {
        // Store the first call expression stack depth seen while in this step operation:
        if (inUserCode && this.interpreter.stateStack[0].node.type === "CallExpression") {
          if (typeof this.firstCallStackDepthThisStep === 'undefined') {
            this.firstCallStackDepthThisStep = stackDepth;
          }
        }

        // For the step in case, we want to stop the interpreter as soon as we enter the callee:
        if (!doneUserLine &&
            inUserCode &&
            this.nextStep === StepType.IN &&
            stackDepth > this.firstCallStackDepthThisStep) {
          reachedBreak = true;
        }
        // After the interpreter says a node is "done" (meaning it is time to stop), we will
        // advance a little further to the start of the next statement. We achieve this by
        // continuing to set unwindingAfterStep to true to keep the loop going:
        if (doneUserLine || reachedBreak) {
          var wasUnwinding = unwindingAfterStep;
          // step() additional times if we know it to be safe to get us to the next statement:
          unwindingAfterStep = codegen.isNextStepSafeWhileUnwinding(this.interpreter);
          if (wasUnwinding && !unwindingAfterStep) {
            // done unwinding.. select code that is next to execute:
            userCodeRow = selectCodeFunc.call(this);
            inUserCode = (-1 !== userCodeRow);
            if (!inUserCode) {
              // not in user code, so keep unwinding after all...
              unwindingAfterStep = true;
            }
          }
        }

        if ((reachedBreak || doneUserLine) && !unwindingAfterStep) {
          if (this.nextStep === StepType.OUT &&
              stackDepth > this.stepOutToStackDepth) {
            // trying to step out, but we didn't get out yet... continue on.
          } else if (this.nextStep === StepType.OVER &&
              typeof this.firstCallStackDepthThisStep !== 'undefined' &&
              stackDepth > this.firstCallStackDepthThisStep) {
            // trying to step over, and we're in deeper inside a function call... continue next onTick
          } else {
            // Our step operation is complete, reset nextStep to StepType.RUN to
            // return to a normal 'break' state:
            this.nextStep = StepType.RUN;
            this.onNextStepChanged.notifyObservers();
            if (inUserCode) {
              // Store some properties about where we stopped:
              this.replaceStoppedAtBreakpointRowForScope(this.interpreter.getScope(), userCodeRow);
            }
            delete this.stepOutToStackDepth;
            delete this.firstCallStackDepthThisStep;
            break;
          }
        }
      }
    } else {
      if (this.executionError) {
        this.handleError(inUserCode ? (userCodeRow + 1) : undefined);
      }
      this.isExecuting = false;
      return;
    }
  }
  if (reachedBreak && atMaxSpeed) {
    // If we were running atMaxSpeed and just reached a breakpoint, the
    // code may not be selected in the editor, so do it now:
    this.selectCurrentCode();
  }
  this.isExecuting = false;
};

/**
 * Checks to the see if the character offset is from the user code range.
 *
 * @param {number} offset index of a character from program
 * @return {boolean} true if the character offset is in user code.
 * @private
 */
JSInterpreter.prototype.isOffsetInUserCode_ = function (offset) {
  if (typeof offset === 'undefined' || typeof this.codeInfo === 'undefined') {
    return false;
  }
  var start = offset - this.codeInfo.userCodeStartOffset;

  return start >= 0 && start < this.codeInfo.userCodeLength;
};

/**
 * Convert MemberExpression node to a string
 *
 * @param {!Object} node supplied by acorn parse.
 * @return {string} Name.
 * @private
 */
JSInterpreter.getMemberExpressionName_ = function (node) {
  var objectString;
  switch (node.object.type) {
    case "MemberExpression":
      objectString = this.getMemberExpressionName_(node.object);
      break;
    case "Identifier":
      objectString = node.object.name;
      break;
    default:
      throw "Unexpected MemberExpression node object type: " + node.object.type;
  }
  var propString;
  switch (node.property.type) {
    case "Identifier":
      propString = "." + node.property.name;
      break;
    case "Literal":
      propString = "[" + node.property.value + "]";
      break;
    default:
      throw "Unexpected MemberExpression node property type: " + node.object.type;
  }
  return objectString + propString;
};

/**
 * If necessary, add information to the executionLog about the upcoming
 * interpreter step operation.
 *
 * @private
 */
JSInterpreter.prototype.logStep_ = function () {
  var state = this.interpreter.stateStack[0];
  var node = state.node;

  if (!this.isOffsetInUserCode_(node.start)) {
    return;
  }

  // Log call and new expressions just before we step into a function (after the
  // last argument has been processed). (NOTE: as a result, a single stateful
  // async function call may appear multiple times in the log)
  if ((node.type === "CallExpression" || node.type === "NewExpression") &&
      state.doneCallee_ &&
      !state.doneExec &&
      !node.arguments[state.n_ || 0]) {
    switch (node.callee.type) {
      case "Identifier":
        this.executionLog.push(node.callee.name + ':' + node.arguments.length);
        break;
      case "MemberExpression":
        this.executionLog.push(JSInterpreter.getMemberExpressionName_(node.callee) +
            ':' + node.arguments.length);
        break;
      default:
        throw "Unexpected callee node property type: " + node.object.type;
    }
  } else if (node.type === "ForStatement") {
    var mode = state.mode || 0;
    switch (mode) {
      case codegen.ForStatementMode.INIT:
        this.executionLog.push("[forInit]");
        break;
      case codegen.ForStatementMode.TEST:
        this.executionLog.push("[forTest]");
        break;
      case codegen.ForStatementMode.UPDATE:
        this.executionLog.push("[forUpdate]");
        break;
    }
  }
};

/**
 * Helper that wraps some error preprocessing before we notify observers that
 * an execution error has occurred. Operates on the current error that is
 * already saved as this.executionError
 *
 * @param {number} [lineNumber]
 */
JSInterpreter.prototype.handleError = function (lineNumber) {
  if (!lineNumber && this.executionError instanceof SyntaxError) {
    // syntax errors came before execution (during parsing), so we need
    // to determine the proper line number by looking at the exception
    lineNumber = this.executionError.loc.line;
    // Now select this location in the editor, since we know we didn't hit
    // this while executing (in which case, it would already have been selected)
    codegen.selectEditorRowColError(
        this.studioApp.editor,
        lineNumber - 1,
        this.executionError.loc.column);
  }

  // Select code that just executed:
  this.selectCurrentCode("ace_error");
  // Grab line number if we don't have one already:
  if (!lineNumber) {
    lineNumber = 1 + this.getNearestUserCodeLine();
  }

  this.onExecutionError.notifyObservers(this.executionError, lineNumber);
};

/**
 * Helper to create an interpeter primitive value. Useful when extending the
 * interpreter without relying on codegen marshalling helpers.
 */
JSInterpreter.prototype.createPrimitive = function (data) {
  if (this.interpreter) {
    return this.interpreter.createPrimitive(data);
  }
};

/**
 * Wrapper to Interpreter's getProperty (extended for custom marshaling)
 *
 * Fetch a property value from a data object.
 * @param {!Object} interpeter Interpreter instance.
 * @param {!Function} baseGetProperty Original getProperty() implementation.
 * @param {!Object} obj Data object.
 * @param {*} name Name of property.
 * @return {!Object} Property value (may be UNDEFINED).
 */
JSInterpreter.prototype.getProperty = function (
    interpreter,
    baseGetProperty,
    obj,
    name) {
  name = name.toString();
  var nativeParent;
  if (obj.isCustomMarshal ||
      (obj === this.globalScope &&
          (!!(nativeParent = this.customMarshalGlobalProperties[name])))) {
    var value;
    if (-1 !== this.customMarshalBlockedProperties.indexOf(name)) {
      return baseGetProperty.call(interpreter, obj, name);
    }
    if (obj.isCustomMarshal) {
      value = obj.data[name];
    } else {
      value = nativeParent[name];
    }
    var type = typeof value;
    if (type === 'number' || type === 'boolean' || type === 'string' ||
        type === 'undefined' || value === null) {
      return interpreter.createPrimitive(value);
    } else {
      return codegen.marshalNativeToInterpreter(interpreter, value, obj.data);
    }
  } else {
    return baseGetProperty.call(interpreter, obj, name);
  }
};

/**
 * Wrapper to Interpreter's hasProperty (extended for custom marshaling)
 *
 * Does the named property exist on a data object.
 * @param {!Object} interpeter Interpreter instance.
 * @param {!Function} baseHasProperty Original hasProperty() implementation.
 * @param {!Object} obj Data object.
 * @param {*} name Name of property.
 * @return {boolean} True if property exists.
 */
JSInterpreter.prototype.hasProperty = function (
    interpreter,
    baseHasProperty,
    obj,
    name) {
  name = name.toString();
  var nativeParent;
  if (obj.isCustomMarshal ||
      (obj === this.globalScope &&
          (!!(nativeParent = this.customMarshalGlobalProperties[name])))) {
    if (-1 !== this.customMarshalBlockedProperties.indexOf(name)) {
      return baseHasProperty.call(interpreter, obj, name);
    } else if (obj.isCustomMarshal) {
      return name in obj.data;
    } else {
      return name in nativeParent;
    }
  } else {
    return baseHasProperty.call(interpreter, obj, name);
  }
};

/**
 * Wrapper to Interpreter's setProperty (extended for custom marshaling)
 *
 * Set a property value on a data object.
 * @param {!Object} interpeter Interpreter instance.
 * @param {!Function} baseSetProperty Original setProperty() implementation.
 * @param {!Object} obj Data object.
 * @param {*} name Name of property.
 * @param {*} value New property value.
 * @param {boolean} opt_fixed Unchangeable property if true.
 * @param {boolean} opt_nonenum Non-enumerable property if true.
 */
JSInterpreter.prototype.setProperty = function (
    interpreter,
    baseSetProperty,
    obj,
    name,
    value,
    opt_fixed,
    opt_nonenum) {
  name = name.toString();
  var nativeParent;
  if (obj.isCustomMarshal) {
    if (-1 !== this.customMarshalBlockedProperties.indexOf(name)) {
      return baseSetProperty.call(
          interpreter, obj, name, value, opt_fixed, opt_nonenum);
    }
    obj.data[name] = codegen.marshalInterpreterToNative(interpreter, value);
  } else if (obj === this.globalScope &&
      (!!(nativeParent = this.customMarshalGlobalProperties[name]))) {
    if (-1 !== this.customMarshalBlockedProperties.indexOf(name)) {
      return baseSetProperty.call(
          interpreter, obj, name, value, opt_fixed, opt_nonenum);
    }
    nativeParent[name] = codegen.marshalInterpreterToNative(interpreter, value);
  } else {
    return baseSetProperty.call(
        interpreter, obj, name, value, opt_fixed, opt_nonenum);
  }
};

/**
 * Selects code in droplet/ace editor.
 *
 * Returns the row (line) of code highlighted. If nothing is highlighted
 * because it is outside of the userCode area, the return value is -1
 */
JSInterpreter.prototype.selectCurrentCode = function (highlightClass) {
  if (this.studioApp.hideSource) {
    return -1;
  }
  return codegen.selectCurrentCode(this.interpreter,
                                   this.codeInfo.cumulativeLength,
                                   this.codeInfo.userCodeStartOffset,
                                   this.codeInfo.userCodeLength,
                                   this.studioApp.editor,
                                   highlightClass);
};

/**
 * Finds the current line of code in droplet/ace editor.
 *
 * Returns the line of code where the interpreter is at. If it is outside
 * of the userCode area, the return value is -1
 */
JSInterpreter.prototype.getUserCodeLine = function () {
  var userCodeRow = -1;
  if (this.interpreter.stateStack[0]) {
    var node = this.interpreter.stateStack[0].node;
    // Adjust start/end by userCodeStartOffset since the code running
    // has been expanded vs. what the user sees in the editor window:
    var start = node.start - this.codeInfo.userCodeStartOffset;

    // Only return a valid userCodeRow if the node being executed is inside the
    // user's code (not inside code we inserted before or after their code that
    // is not visible in the editor):
    if (start >= 0 && start < this.codeInfo.userCodeLength) {
      userCodeRow = codegen.aceFindRow(this.codeInfo.cumulativeLength,
                                       0,
                                       this.codeInfo.cumulativeLength.length,
                                       start);
    }
  }
  return userCodeRow;
};

/**
 * Finds the current line of code in droplet/ace editor. Walks up the stack if
 * not currently in the user code area.
 */
JSInterpreter.prototype.getNearestUserCodeLine = function () {
  if (this.studioApp.hideSource) {
    return -1;
  }
  var userCodeRow = -1;
  for (var i = 0; i < this.interpreter.stateStack.length; i++) {
    var node = this.interpreter.stateStack[i].node;
    // Adjust start/end by userCodeStartOffset since the code running
    // has been expanded vs. what the user sees in the editor window:
    var start = node.start - this.codeInfo.userCodeStartOffset;

    // Only return a valid userCodeRow if the node being executed is inside the
    // user's code (not inside code we inserted before or after their code that
    // is not visible in the editor):
    if (start >= 0 && start < this.codeInfo.userCodeLength) {
      userCodeRow = codegen.aceFindRow(this.codeInfo.cumulativeLength,
                                       0,
                                       this.codeInfo.cumulativeLength.length,
                                       start);
      break;
    }
  }
  return userCodeRow;
};

/**
 * Creates a property in the interpreter's global scope. When a parent is
 * supplied and that parent object is in codegen's customMarshalObjectList,
 * property gets/sets in the interpreter will be reflected on the native parent
 * object. Functions can also be inserted into the global namespace using this
 * method. If a parent is supplied, they will be invoked natively with that
 * parent as the this parameter.
 *
 * @param {String} name Name for the property in the global scope.
 * @param {*} value Native value that will be marshalled to the interpreter.
 * @param {Object} parent (Optional) parent for the native value.
 */
JSInterpreter.prototype.createGlobalProperty = function (name, value, parent) {

  var interpreterVal;
  if (typeof value === 'function') {
    var wrapper = codegen.makeNativeMemberFunction({
        interpreter: this.interpreter,
        nativeFunc: value,
        nativeParentObj: parent
    });
    interpreterVal = this.interpreter.createNativeFunction(wrapper);
  } else {
    interpreterVal = codegen.marshalNativeToInterpreter(
        this.interpreter,
        value,
        utils.valueOr(parent, window));
  }

  // Bypass setProperty since we've hooked it and it will not create the
  // property if it is in customMarshalGlobalProperties
  this.baseSetProperty.call(
      this.interpreter,
      this.globalScope,
      name,
      interpreterVal);
};

/**
 * Slightly modified version of interpreter's getValueFromScope. Does not
 * throw an exception that can be caught by the interpreted program.
 */
JSInterpreter.prototype.getValueFromScope = function (name) {
  var scope = this.interpreter.getScope();
  while (scope) {
    if (this.interpreter.hasProperty(scope, name)) {
      return this.interpreter.getProperty(scope, name);
    }
    scope = scope.parentScope;
  }
  throw new ReferenceError('Unknown identifier: ' + name);
};

/**
 * Returns an interpreter object representing a specific node (parsed by acorn
 * for the purpose of displaying a watch value).
 * @private
 */
JSInterpreter.prototype.getWatchValueFromNode_ = function (node) {
  if (node.type === 'MemberExpression') {
    return this.getValueFromMemberExpression_(node);
  } else if (node.type === 'Identifier') {
    return this.getValueFromScope(node.name);
  } else {
    throw new Error("Invalid");
  }
};

/**
 * Returns an interpreter object representing the member expression.
 * @private
 */
JSInterpreter.prototype.getValueFromMemberExpression_ = function (expression) {
  var object = this.getWatchValueFromNode_(expression.object);

  if (expression.property.type === 'Identifier') {
    return this.interpreter.getValue([object, expression.property.name]);
  } else if (expression.property.type === 'Literal') {
    return this.interpreter.getValue(
        [object, this.interpreter.createPrimitive(expression.property.value)]);
  }
};

/**
 * Evaluate watch expression based on current scope.
 */
JSInterpreter.prototype.evaluateWatchExpression = function (watchExpression) {
  var value;
  try {
    var ast = window.acorn.parse(watchExpression);
    if (ast.type === 'Program' &&
        ast.body[0].type === 'ExpressionStatement') {
      value = this.getWatchValueFromNode_(ast.body[0].expression);
    } else {
      throw new Error("Invalid");
    }
  } catch (err) {
    if (err instanceof Error) {
      return err;
    } else {
      return new Error(err);
    }
  }
  return codegen.marshalInterpreterToNative(this.interpreter, value);
};

/**
 * Returns the interpreter function object corresponding to 'funcName' if a
 * function with that name is found in the interpreter's global scope.
 */
JSInterpreter.prototype.findGlobalFunction = function (funcName) {
  var funcObj = this.interpreter.getProperty(this.globalScope, funcName);
  if (funcObj.type === 'function') {
    return funcObj;
  }
};

/**
 * Returns an array containing the names of all of the global functions
 * in the interpreter's global scope. Built-in global functions are excluded.
 */
JSInterpreter.prototype.getGlobalFunctionNames = function () {
  var builtInExclusionList = ["eval", "getCallback", "setCallbackRetVal"];

  var names = [];
  for (var objName in this.globalScope.properties) {
    var object = this.globalScope.properties[objName];
    if (object.type === 'function' &&
        !object.nativeFunc &&
        builtInExclusionList.indexOf(objName) === -1) {
      names.push(objName);
    }
  }
  return names;
};

/**
 * Returns an array containing the names of all of the functions defined
 * inside other functions.
 */
JSInterpreter.prototype.getLocalFunctionNames = function (scope) {
  if (!scope) {
    scope = this.globalScope;
  }
  var names = [];
  for (var objName in scope.properties) {
    var object = scope.properties[objName];
    if (object.type === 'function' && !object.nativeFunc && object.node) {
      if (scope !== this.globalScope) {
        names.push(objName);
      }
      var localScope = this.interpreter.createScope(object.node.body, object.parentScope);
      var localNames = this.getLocalFunctionNames(localScope);
      names = names.concat(localNames);
    }
  }
  return names;
};

/**
 * Returns the current interpreter state object.
 */
JSInterpreter.prototype.getCurrentState = function () {
  return this.interpreter && this.interpreter.stateStack[0];
};

/**
 * Evaluate an expression in the interpreter's current scope, and return the
 * value of the evaluated expression.
 * @param {!string} expression
 * @returns {?} value of the expression
 * @throws if there's a problem evaluating the expression
 */
JSInterpreter.prototype.evalInCurrentScope = function (expression) {
  var currentScope = this.interpreter.getScope();
  var evalInterpreter = new window.Interpreter(expression);
  // Set scope to the current scope of the running program
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
    'UNDEFINED'].forEach(function (prop) {
    evalInterpreter[prop] = this.interpreter[prop];
  }, this);

  // Patch getProperty, hasProperty, and setProperty to enable custom marshalling
  evalInterpreter.getProperty = this.getProperty.bind(
      this,
      evalInterpreter,
      evalInterpreter.getProperty);
  evalInterpreter.hasProperty = this.hasProperty.bind(
      this,
      evalInterpreter,
      evalInterpreter.hasProperty);
  evalInterpreter.setProperty = this.setProperty.bind(
      this,
      evalInterpreter,
      evalInterpreter.setProperty);

  // run() may throw if there's a problem in the expression
  evalInterpreter.run();
  return evalInterpreter.value;
};
