var codegen = require('./codegen');

/**
 * Create a JSInterpreter object. This object wraps an Interpreter object and
 * adds stepping, batching of steps, code highlighting, error handling,
 * breakpoints, and general debug capabilities (step in, step out, step over)
 */
var JSInterpreter = module.exports = function (options) {

  this.interpreter = options.interpreter;
  this.studioApp = options.studioApp;
  this.codeInfo = options.codeInfo;
  this.shouldRunAtMaxSpeed = options.shouldRunAtMaxSpeed || function() { return false; };
  this.maxInterpreterStepsPerTick = options.maxInterpreterStepsPerTick || 10000;
  this.onNextStepChanged = options.onNextStepChanged || function() {};
  this.onPause = options.onPause || function() {};
  this.onExecutionError = options.onExecutionError || function() {};

  this.paused = false;
  this.nextStep = StepType.RUN;
  this.maxValidCallExpressionDepth = 0;
  this.callExpressionSeenAtDepth = [];

};

JSInterpreter.StepType = {
  RUN:  0,
  IN:   1,
  OVER: 2,
  OUT:  3,
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
 * Execute the interpreter
 */
JSInterpreter.prototype.executeInterpreter = function (firstStep, runUntilCallbackReturn) {
  this.runUntilCallbackReturn = runUntilCallbackReturn;
  if (runUntilCallbackReturn) {
    delete this.lastCallbackRetVal;
  }
  this.seenEmptyGetCallbackDuringExecution = false;
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
  var session = this.studioApp.editor.aceEditor.getSession();

  // In each tick, we will step the interpreter multiple times in a tight
  // loop as long as we are interpreting code that the user can't see
  // (function aliases at the beginning, getCallback event loop at the end)
  for (var stepsThisTick = 0;
       (stepsThisTick < this.maxInterpreterStepsPerTick) || unwindingAfterStep;
       stepsThisTick++) {
    // Check this every time because the speed is allowed to change...
    atMaxSpeed = this.shouldRunAtMaxSpeed();
    // NOTE: when running with no source visible or at max speed, we
    // call a simple function to just get the line number, otherwise we call a
    // function that also selects the code:
    var selectCodeFunc = (this.studioApp.hideSource || (atMaxSpeed && !this.paused)) ?
            codegen.getUserCodeLine :
            codegen.selectCurrentCode;

    if ((reachedBreak && !unwindingAfterStep) ||
        (doneUserLine && !unwindingAfterStep && !atMaxSpeed) ||
        this.seenEmptyGetCallbackDuringExecution ||
        (runUntilCallbackReturn && this.seenReturnFromCallbackDuringExecution)) {
      // stop stepping the interpreter and wait until the next tick once we:
      // (1) reached a breakpoint and are done unwinding OR
      // (2) completed a line of user code and are are done unwinding
      //     (while not running atMaxSpeed) OR
      // (3) have seen an empty event queue in nativeGetCallback (no events) OR
      // (4) have seen a nativeSetCallbackRetVal call in runUntilCallbackReturn mode
      break;
    }
    userCodeRow = selectCodeFunc(this.interpreter,
                                 this.codeInfo.cumulativeLength,
                                 this.codeInfo.userCodeStartOffset,
                                 this.codeInfo.userCodeLength,
                                 this.studioApp.editor);
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
         (userCodeRow !== this.stoppedAtBreakpointRow &&
          codegen.isAceBreakpointRow(session, userCodeRow)))) {
      // Yes, arrived at a new breakpoint:
      if (this.paused) {
        // Overwrite the nextStep value. (If we hit a breakpoint during a step
        // out or step over, this will cancel that step operation early)
        this.nextStep = StepType.RUN;
        this.onNextStepChanged();
      } else {
        this.onPause();
      }
      // Store some properties about where we stopped:
      this.stoppedAtBreakpointRow = userCodeRow;
      this.stoppedAtBreakpointStackDepth = this.interpreter.stateStack.length;

      // Mark reachedBreak to stop stepping, and start unwinding if needed:
      reachedBreak = true;
      unwindingAfterStep = codegen.isNextStepSafeWhileUnwinding(this.interpreter);
      continue;
    }
    // If we've moved past the place of the last breakpoint hit without being
    // deeper in the stack, we will discard the stoppedAtBreakpoint properties:
    if (inUserCode &&
        userCodeRow !== this.stoppedAtBreakpointRow &&
        this.interpreter.stateStack.length <= this.stoppedAtBreakpointStackDepth) {
      delete this.stoppedAtBreakpointRow;
      delete this.stoppedAtBreakpointStackDepth;
    }
    // If we're unwinding, continue to update the stoppedAtBreakpoint properties
    // to ensure that we have the right properties stored when the unwind completes:
    if (inUserCode && unwindingAfterStep) {
      this.stoppedAtBreakpointRow = userCodeRow;
      this.stoppedAtBreakpointStackDepth = this.interpreter.stateStack.length;
    }
    var err = safeStepInterpreter(this);
    if (!err) {
      doneUserLine = doneUserLine ||
        (inUserCode && this.interpreter.stateStack[0] && this.interpreter.stateStack[0].done);

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
        // If we've arrived at a BlockStatement or SwitchStatement, set doneUserLine even
        // though the the stateStack doesn't have "done" set, so that stepping in the
        // debugger makes sense (otherwise we'll skip over the beginning of these nodes):
        var nodeType = this.interpreter.stateStack[0].node.type;
        doneUserLine = doneUserLine ||
          (inUserCode && (nodeType === "BlockStatement" || nodeType === "SwitchStatement"));

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
          unwindingAfterStep = codegen.isNextStepSafeWhileUnwinding(Applab.interpreter);
          if (wasUnwinding && !unwindingAfterStep) {
            // done unwinding.. select code that is next to execute:
            userCodeRow = selectCodeFunc(this.interpreter,
                                         this.codeInfo.cumulativeLength,
                                         this.codeInfo.userCodeStartOffset,
                                         this.codeInfo.userCodeLength,
                                         this.studioApp.editor);
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
            this.onNextStepChanged();
            if (inUserCode) {
              // Store some properties about where we stopped:
              this.stoppedAtBreakpointRow = userCodeRow;
              this.stoppedAtBreakpointStackDepth = stackDepth;
            }
            delete this.stepOutToStackDepth;
            delete this.firstCallStackDepthThisStep;
            break;
          }
        }
      }
    } else {
      this.onExecutionError(err, inUserCode ? (userCodeRow + 1) : undefined);
      return;
    }
  }
  if (reachedBreak && atMaxSpeed) {
    // If we were running atMaxSpeed and just reached a breakpoint, the
    // code may not be selected in the editor, so do it now:
    codegen.selectCurrentCode(this.interpreter,
                              this.codeInfo.cumulativeLength,
                              this.codeInfo.userCodeStartOffset,
                              this.codeInfo.userCodeLength,
                              this.studioApp.editor);
  }
};