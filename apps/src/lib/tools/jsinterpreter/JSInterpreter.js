import * as codegen from './codegen';
import ObservableEventDEPRECATED from '../../../ObservableEventDEPRECATED';
import * as utils from '../../../utils';
import acorn from '@code-dot-org/js-interpreter/acorn';
import {getStore} from '../../../redux';
import CustomMarshalingInterpreter from './CustomMarshalingInterpreter';
import CustomMarshaler from './CustomMarshaler';
import {generateAST} from '@code-dot-org/js-interpreter';
import i18n from '@cdo/locale';

import {setIsDebuggerPaused} from '../../../redux/runState';

const MAX_CALL_STACK_SIZE = 10000;

const StepType = {
  RUN: 0,
  IN: 1,
  OVER: 2,
  OUT: 3
};

/**
 * Nodes that are visited between expressions, signifying the previous
 * expression is done.
 */
const INTERSTITIAL_NODES = {
  Program: true,
  BlockStatement: true,
  SwitchStatement: true
};

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
 * User code is code the user has written in the editor. We could be outside
 * the user's code if we are in system-generated code or if we are in
 * user-imported library code.
 */
function isInUserCode(userCodeRow, libraryName) {
  return -1 !== userCodeRow && !libraryName;
}

/**
 * If and only if we are within a library, the 'source' field will be set on
 * the node's location object (this is set in the 'parse' function when it
 * parses the library).
 */
function isNodeFromLibrary(node) {
  return node.loc && !!node.loc.source;
}

/**
 * In some cases, we prepend or append system-generated code to a user's code.
 * This checks if the starting value of a node is within the defined boundrary
 * of a user's code.
 */
function isNodeWithinUserCode(start, userCodeLength) {
  return start >= 0 && start < userCodeLength;
}

export default class JSInterpreter {
  static StepType = StepType;

  /**
   * Create a JSInterpreter object. This object wraps an Interpreter object and
   * adds stepping, batching of steps, code highlighting, error handling,
   * breakpoints, general debug capabilities (step in, step out, step over), and
   * an optional event queue.
   * @constructor
   * @param {!StudioApp} studioApp
   * @param {function} [shouldRunAtMaxSpeed]
   * @param {number} [maxInterpreterStepsPerTick]
   * @param {Object} [customMarshalGlobalProperties]
   * @param {Array} [customMarshalBlockedProperties]
   * @param {Array} [customMarshalObjectList]
   * @param {boolean} [logExecution] if true, executionLog[] be populated
   */
  constructor({
    studioApp,
    shouldRunAtMaxSpeed,
    maxInterpreterStepsPerTick,
    customMarshalGlobalProperties,
    customMarshalBlockedProperties,
    customMarshalObjectList,
    logExecution
  }) {
    this.studioApp = studioApp;
    this.shouldRunAtMaxSpeed =
      shouldRunAtMaxSpeed ||
      function() {
        return true;
      };
    this.maxInterpreterStepsPerTick = maxInterpreterStepsPerTick || 10000;
    this.customMarshaler = new CustomMarshaler({
      globalProperties: customMarshalGlobalProperties,
      blockedProperties: customMarshalBlockedProperties,
      objectList: customMarshalObjectList
    });

    // Publicly-exposed events that anyone with access to the JSInterpreter can
    // observe and respond to.

    /** @type {ObservableEventDEPRECATED} */
    this.onNextStepChanged = new ObservableEventDEPRECATED();
    this._runStateUpdater = this.onNextStepChanged.register(() => {
      getStore().dispatch(setIsDebuggerPaused(this.paused, this.nextStep));
    });

    /** @type {ObservableEventDEPRECATED} */
    this.onPause = new ObservableEventDEPRECATED();

    /** @type {ObservableEventDEPRECATED} */
    this.onExecutionError = new ObservableEventDEPRECATED();

    /** @type {ObservableEventDEPRECATED} */
    this.onExecutionWarning = new ObservableEventDEPRECATED();

    this.paused = false;
    this.yieldExecution = false;
    this.startedHandlingEvents = false;
    this.executionError = null;
    this.nextStep = StepType.RUN;
    this.maxValidCallExpressionDepth = 0;
    this.isExecuting = false;
    this.callExpressionSeenAtDepth = [];
    this.stoppedAtBreakpointRows = [];
    this.logExecution = logExecution;
    this.executionLog = [];
  }

  addCustomMarshalObject(config) {
    // TODO (pcardune): validate config format.
    this.customMarshaler.objectList.push(config);
  }

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
   * @param {Object} [options.globalFunctions] - objects containing functions to
   *        place in the interpreter global scope.
   * @param {boolean} [options.enableEvents] - allow the interpreter to define
   *        event handlers that can be invoked by native code. (default false)
   * @param {Function} [options.initGlobals] when supplied, this function will
   *        be called during interpreter initialization so that additional globals
   *        can be added with calls to createGlobalProperty()
   * @param {number} [options.userCodeStartOffset] - offset in the code string where
   *        the user's created code begins. Allows other code to be injected before
   *        the user's program without disrupting line number calculations for
   *        debugging (default 0)
   */
  parse(options) {
    this.calculateCodeInfo(options);

    if (!this.studioApp.hideSource && this.studioApp.editor) {
      const session = this.studioApp.editor.aceEditor.getSession();
      this.isBreakpointRow = row => codegen.isAceBreakpointRow(session, row);
    } else {
      this.isBreakpointRow = () => false;
    }

    if (options.enableEvents) {
      this.eventQueue = [];
      // Append our mini-runtime after the user's code. This will spin and process
      // callback functions:
      options.code +=
        '\n;while(true){var __jsCB=getCallback();' +
        'if(__jsCB){setCallbackRetVal(__jsCB.fn.apply(null,__jsCB.arguments || null));}}';

      CustomMarshalingInterpreter.createNativeFunctionFromInterpreterFunction = intFunc => {
        let retFunc = (...args) => {
          if (this.initialized()) {
            this.eventQueue.push({
              fn: intFunc,
              arguments: args
            });

            if (!this.isExecuting) {
              // Execute the interpreter and if a return value is sent back from the
              // interpreter's event handler, pass that back in the native world

              // NOTE: the interpreter will not execute forever, if the event handler
              // takes too long, executeInterpreter() will return and the native side
              // will just see 'undefined' as the return value. The rest of the interpreter
              // event handler will run in the next onTick(), but the return value will
              // no longer have any effect.
              this.executeInterpreter(false, true);
              return this.lastCallbackRetVal;
            }
          }
        };
        if (intFunc && intFunc.node && intFunc.node.id) {
          retFunc.funcName = intFunc.node.id.name;
        }
        return retFunc;
      };
    }

    try {
      // Return value will be stored as this.interpreter inside the supplied
      // initFunc() (other code in initFunc() depends on this.interpreter, so
      // we can't wait until the constructor returns)
      new CustomMarshalingInterpreter(
        '',
        this.customMarshaler,
        (interpreter, scope) => {
          // Store Interpreter on JSInterpreter
          this.interpreter = interpreter;
          // Store globalScope on JSInterpreter
          this.globalScope = scope;
          codegen.initJSInterpreter(
            interpreter,
            options.blocks,
            options.blockFilter,
            scope,
            options.globalFunctions
          );

          if (options.initGlobals) {
            options.initGlobals();
          }

          // Only allow five levels of depth when marshalling the return value
          // since we will occasionally return DOM Event objects which contain
          // properties that recurse over and over...
          interpreter.setProperty(
            scope,
            'getCallback',
            interpreter.createNativeFunction(
              interpreter.makeNativeMemberFunction({
                nativeFunc: this.nativeGetCallback,
                maxDepth: 5
              })
            )
          );

          interpreter.setProperty(
            scope,
            'setCallbackRetVal',
            interpreter.createNativeFunction(
              interpreter.makeNativeMemberFunction({
                nativeFunc: this.nativeSetCallbackRetVal
              })
            )
          );
        }
      );
      // We initialize with an empty program so that all of our global functions
      // can be injected before the user code is processed (thus allowing user
      // code to override globals of the same names)

      // Setting libraryAST to null as that is acorn's default value for the
      // program option
      let libraryAST = null;
      if (Array.isArray(options.projectLibraries)) {
        options.projectLibraries.forEach(library => {
          try {
            libraryAST = acorn.parse(library.code, {
              ecmaVersion: 5,
              // locations: adds information about row/col number and allows us to use the sourceFile option.
              locations: true,
              sourceFile: library.name,
              program: libraryAST
            });
          } catch (err) {
            err.message = i18n.errorParsingLibrary({
              libraryName: library.name,
              errorMessage: err.message
            });
            throw err;
          }
        });
      }
      // Now append the user code:
      this.interpreter.appendCode(options.code, {program: libraryAST});
      // And repopulate scope since appendCode() doesn't do this automatically:
      this.interpreter.populateScope_(this.interpreter.ast, this.globalScope);
    } catch (err) {
      this.executionError = err;
      this.handleError();
    }
  }

  /**
   * Builds a list of objects that contain all metadata about any functions in
   * the given code string. Each object in the returned list has the following
   * properties:
   * functionName - the name of the function
   * parameters - the names of the parameters passed into the function
   * comment - the comment describing the function. This could be in a JSDoc,
   * multiline, singleline, or multiple singlelines format.
   *
   * @param {string} code - The code to be parsed for functions
   * @return {array} functionsAndMetadata - all functions from the input 'code'
   *         along with their relevant metadata
   */
  static getFunctionsAndMetadata(code) {
    // Private helper functions
    function getPrecedingComment(allComments, startingLocation) {
      return allComments.find(comment => {
        return comment.endLocation === startingLocation - 1;
      });
    }

    function trimWhitespaceFromLineEndings(code) {
      return code
        .split('\n')
        .map(line => {
          // The regex /\s+$/gm detects whitespace at the end of a line
          return line.replace(/\s+$/gm, '');
        })
        .join('\n');
    }

    let functionsAndMetadata = [];
    let allComments = [];
    let parserOptions = {
      // Tell the AST parser to push comments into our allComments array
      onComment: (isBlockComment, text, startLocation, endLocation) => {
        allComments.push({isBlockComment, text, startLocation, endLocation});
      }
    };

    // trim whitespace to ensure we correctly detect comments
    code = trimWhitespaceFromLineEndings(code);
    let ast = generateAST(code, parserOptions);
    let codeFunctions = ast.body.filter(node => {
      return node.type === 'FunctionDeclaration';
    });

    codeFunctions.forEach(codeFunction => {
      let fullComment = '';
      let comment = getPrecedingComment(allComments, codeFunction.start);
      if (comment && comment.isBlockComment) {
        fullComment = comment.text;
        if (fullComment[0] === '*') {
          // For a JSDoc style comment, acorn doesn't strip the * that starts
          // each line, so we do that here.
          fullComment = fullComment
            .substr(1)
            .split('\n * ')
            .join('\n');
        }
      } else {
        while (comment) {
          // Find all adjacent singleline comments preceding the function
          fullComment = comment.text.trim() + '\n' + fullComment;
          comment = getPrecedingComment(allComments, comment.startLocation);
        }
      }
      fullComment = fullComment.trim();

      let params = codeFunction.params.map(param => {
        return param.name;
      });

      functionsAndMetadata.push({
        functionName: codeFunction.id.name,
        parameters: params,
        comment: fullComment
      });
    });

    return functionsAndMetadata;
  }

  /**
   * Init `this.codeInfo` with cumulative length info (used to locate breakpoints).
   * @param {!Object} options
   * @param {!string} options.code - Code to be executed by the interpreter.
   * @param {number} [options.userCodeStartOffset] - offset in the code string where
   *        the user's created code begins. Allows other code to be injected before
   *        the user's program without disrupting line number calculations for
   *        debugging (default 0)
   */
  calculateCodeInfo(options) {
    const {code, userCodeStartOffset = 0} = options;
    this.codeInfo = {};
    this.codeInfo.code = code;
    this.codeInfo.userCodeStartOffset = userCodeStartOffset;
    this.codeInfo.userCodeLength = code.length - userCodeStartOffset;
    this.codeInfo.cumulativeLength = codegen.calculateCumulativeLength(
      code.slice(userCodeStartOffset)
    );
  }

  /**
   * Returns true if the JSInterpreter instance initialized successfully. This
   * would typically fail when the program contains a syntax error.
   */
  initialized() {
    return !!this.interpreter;
  }

  /**
   * Detech the Interpreter instance. Call before releasing references to
   * JSInterpreter so any async callbacks will not execute.
   */
  deinitialize() {
    this.onNextStepChanged.unregister(this._runStateUpdater);
    this.interpreter = null;
  }

  /**
   * A miniature runtime in the interpreted world calls this function repeatedly
   * to check to see if it should invoke any callbacks from within the
   * interpreted world. If the eventQueue is not empty, we will return an object
   * that contains an interpreted callback function (stored in "fn") and,
   * optionally, callback arguments (stored in "arguments")
   */
  nativeGetCallback = () => {
    this.startedHandlingEvents = true;
    const retVal = this.eventQueue.shift();
    if (typeof retVal === 'undefined') {
      this.yield();
    }
    return retVal;
  };

  nativeSetCallbackRetVal = retVal => {
    if (this.eventQueue.length === 0) {
      // If nothing else is in the event queue, then store this return value
      // away so it can be returned in the native event handler
      this.seenReturnFromCallbackDuringExecution = true;
      this.lastCallbackRetVal = retVal;

      // If we were stepping in the debugger, go back to running state:
      if (this.paused) {
        this.nextStep = StepType.RUN;
        this.onNextStepChanged.notifyObservers();
        this.handlePauseContinue();
      }
    }
    // Provide warnings to the user if this function has been called with a
    // meaningful return value while we are no longer in the native event handler

    // TODO (cpirich): Check to see if the DOM event object was modified
    // (preventDefault(), stopPropagation(), returnValue) and provide a similar
    // warning since these won't work as expected unless running atMaxSpeed
    if (
      !this.runUntilCallbackReturn &&
      typeof this.lastCallbackRetVal !== 'undefined'
    ) {
      this.onExecutionWarning.notifyObservers(
        'Function passed to onEvent() ' +
          'has taken too long - the return value was ignored.'
      );
      if (!this.shouldRunAtMaxSpeed()) {
        this.onExecutionWarning.notifyObservers(
          '  (try moving the speed ' + 'slider to its maximum value)'
        );
      }
    }
  };

  /**
   * Yield execution (causes executeInterpreter loop to break out if this is
   * called by APIs called by interpreted code)
   */
  yield() {
    this.yieldExecution = true;
  }

  /**
   * Find a bpRow from the "stopped at breakpoint" array by matching the scope
   *
   * @param {!Object} scope to match from the list
   * @param {number} [row] to match from the list - in addition to scope
   */
  findStoppedAtBreakpointRow(scope, row) {
    for (let i = 0; i < this.stoppedAtBreakpointRows.length; i++) {
      const bpRow = this.stoppedAtBreakpointRows[i];
      if (bpRow.scope === scope) {
        if (typeof row === 'undefined' || row === bpRow.row) {
          return bpRow;
        }
      }
    }
  }

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
  replaceStoppedAtBreakpointRowForScope(scope, row) {
    if (typeof row !== 'number' || row < 0) {
      throw new TypeError('Row ' + row + ' is not a valid row in user code.');
    }

    for (let i = 0; i < this.stoppedAtBreakpointRows.length; i++) {
      const bpRow = this.stoppedAtBreakpointRows[i];
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
  }

  /**
   * Remove a bpRow from the "stopped at breakpoint" array by matching
   * the scope.
   *
   * Does nothing if no rows are found matching the given scope.
   *
   * @param {!Object} scope to match from the list
   */
  removeStoppedAtBreakpointRowForScope(scope) {
    for (let i = 0; i < this.stoppedAtBreakpointRows.length; i++) {
      const bpRow = this.stoppedAtBreakpointRows[i];
      if (bpRow.scope === scope) {
        // Remove from array
        this.stoppedAtBreakpointRows.splice(i, 1);
        return;
      }
    }
  }

  /**
   * Determines if the program is done executing.
   *
   * @return {boolean} true if program is complete (or an error has occurred).
   */
  isProgramDone() {
    if (!this.interpreter) {
      return true;
    }
    const topStackFrame = this.interpreter.peekStackFrame();
    return (
      this.executionError ||
      !topStackFrame ||
      (topStackFrame.node.type === 'Program' && topStackFrame.done)
    );
  }

  /**
   * Execute the interpreter
   *
   * @param {boolean} firstStep Pass true only on the first call
   * @param {boolean} runUntilCallbackReturn Exit after processing event callback
   */
  executeInterpreter(firstStep, runUntilCallbackReturn) {
    if (this.isExecuting) {
      console.error(
        'Attempt to call executeInterpreter while already executing ignored'
      );
      return;
    }
    this.isExecuting = true;
    this.runUntilCallbackReturn = runUntilCallbackReturn;
    if (runUntilCallbackReturn) {
      delete this.lastCallbackRetVal;
    }
    this.yieldExecution = false;
    this.seenReturnFromCallbackDuringExecution = false;

    const atInitialBreakpoint =
      this.paused && this.nextStep === StepType.IN && firstStep;
    let atMaxSpeed = false;

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
          if (
            this.interpreter &&
            typeof this.stepOutToStackDepth === 'undefined'
          ) {
            this.stepOutToStackDepth = 0;
            for (let i = this.maxValidCallExpressionDepth; i > 0; i--) {
              if (this.callExpressionSeenAtDepth[i]) {
                this.stepOutToStackDepth = i;
                break;
              }
            }
          }
          break;
      }
    }

    let doneUserLine = false;
    let reachedBreak = false;
    let unwindingAfterStep = false;
    let inUserCode;
    let userCodeRow;

    // In each tick, we will step the interpreter multiple times in a tight
    // loop as long as we are interpreting code that the user can't see
    // (function aliases at the beginning, getCallback event loop at the end)
    for (
      let stepsThisTick = 0;
      stepsThisTick < this.maxInterpreterStepsPerTick || unwindingAfterStep;
      stepsThisTick++
    ) {
      // Check this every time because the speed is allowed to change...
      atMaxSpeed = this.shouldRunAtMaxSpeed();
      // NOTE:
      // (1) When running with no source visible AND at max speed, always set
      //   `userCodeRow` to -1. We'll never hit a breakpoint or need to add delay.
      // (2) When running with no source visible OR at max speed, call a simple
      //   function to just get the line number. Need to check `inUserCode` to
      //   maybe stop at a breakpoint, or add a `speed(n)` delay.
      // (3) Otherwise call a function that also highlights the code.
      let selectCodeFunc;
      let libraryName;
      if (this.studioApp.hideSource && atMaxSpeed) {
        selectCodeFunc = function() {
          return -1;
        };
      } else if (this.studioApp.hideSource || atMaxSpeed) {
        selectCodeFunc = this.getUserCodeLine;
      } else {
        selectCodeFunc = this.selectCurrentCode;
      }
      const currentScope = this.interpreter.getScope();

      if (
        (reachedBreak && !unwindingAfterStep) ||
        (doneUserLine && !unwindingAfterStep && !atMaxSpeed) ||
        this.yieldExecution ||
        this.interpreter.paused_ ||
        (runUntilCallbackReturn && this.seenReturnFromCallbackDuringExecution)
      ) {
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
      libraryName = this.getLibraryName();
      inUserCode = isInUserCode(userCodeRow, libraryName);

      // Check to see if we've arrived at a new breakpoint:
      //  (1) should be in user code
      //  (2) should never happen while unwinding
      //  (3) should never happen when revisiting an interstitial node
      //  (4) requires either
      //   (a) atInitialBreakpoint OR
      //   (b) isAceBreakpointRow() AND not still at the same line number where
      //       we have already stopped from the last step/breakpoint
      if (
        inUserCode &&
        !unwindingAfterStep &&
        !this.atInterstitialNode &&
        (atInitialBreakpoint ||
          (this.isBreakpointRow(userCodeRow) &&
            !this.findStoppedAtBreakpointRow(currentScope, userCodeRow)))
      ) {
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
        unwindingAfterStep = codegen.isNextStepSafeWhileUnwinding(
          this.interpreter
        );
        continue;
      }
      // If we've moved past the place of the last breakpoint hit without being
      // deeper in the stack, we will discard the stoppedAtBreakpoint properties:
      if (
        inUserCode &&
        !this.findStoppedAtBreakpointRow(currentScope, userCodeRow)
      ) {
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
      if (this.interpreter.getStackDepth() > MAX_CALL_STACK_SIZE) {
        this.executionError = new Error('Maximum call stack size exceeded.');
      }
      if (!this.executionError && this.interpreter.getStackDepth()) {
        const state = this.interpreter.peekStackFrame(),
          nodeType = state.node.type;

        // Determine whether we are done executing a line of user code. This is detected by checking
        // that one of the following conditions are true:
        //   1. We've reached an "interstitial" node, which gets placed onto the stack
        //      once an earlier expression has finished
        //   2. The node on the stack has been explicitly marked as done by the interpreter
        //   3. In the case of "update expression" nodes, like i++ or i--, the done state is tracked
        //      in the doneLeft value, because the expression kind of looks like i = i + 1 which
        //      has a left (i = ) and a right (i + 1) side, and the left side is where the assignment
        //      actually takes place.
        this.atInterstitialNode = INTERSTITIAL_NODES.hasOwnProperty(nodeType);
        if (inUserCode && !doneUserLine) {
          doneUserLine =
            this.atInterstitialNode ||
            state.done_ ||
            (state.node.type === 'UpdateExpression' && state.doneLeft_);
        }

        const stackDepth = this.interpreter.getStackDepth();
        // Remember the stack depths of call expressions (so we can implement 'step out')

        // Truncate any history of call expressions seen deeper than our current stack position:
        for (
          let depth = stackDepth + 1;
          depth <= this.maxValidCallExpressionDepth;
          depth++
        ) {
          this.callExpressionSeenAtDepth[depth] = false;
        }
        this.maxValidCallExpressionDepth = stackDepth;

        const inUserCallExpression =
          inUserCode &&
          this.interpreter.peekStackFrame().node.type === 'CallExpression';
        if (inUserCallExpression) {
          // Store that we've seen a call expression at this depth in callExpressionSeenAtDepth:
          this.callExpressionSeenAtDepth[stackDepth] = true;
        }

        if (this.paused) {
          // Store the first call expression stack depth seen while in this step operation:
          if (inUserCallExpression) {
            if (typeof this.firstCallStackDepthThisStep === 'undefined') {
              this.firstCallStackDepthThisStep = stackDepth;
            }
          }

          // For the step in case, we want to stop the interpreter as soon as we enter the callee:
          if (
            !doneUserLine &&
            inUserCode &&
            this.nextStep === StepType.IN &&
            stackDepth > this.firstCallStackDepthThisStep
          ) {
            reachedBreak = true;
          }
          // After the interpreter says a node is "done" (meaning it is time to stop), we will
          // advance a little further to the start of the next statement. We achieve this by
          // continuing to set unwindingAfterStep to true to keep the loop going:
          if (doneUserLine || reachedBreak) {
            const wasUnwinding = unwindingAfterStep;
            // step() additional times if we know it to be safe to get us to the next statement:
            unwindingAfterStep = codegen.isNextStepSafeWhileUnwinding(
              this.interpreter
            );
            if (wasUnwinding && !unwindingAfterStep) {
              // done unwinding.. select code that is next to execute:
              userCodeRow = selectCodeFunc.call(this);
              libraryName = this.getLibraryName();
              inUserCode = isInUserCode(userCodeRow, libraryName);
              if (!inUserCode) {
                // not in user code, so keep unwinding after all...
                unwindingAfterStep = true;
              }
            }
          }

          if ((reachedBreak || doneUserLine) && !unwindingAfterStep) {
            if (
              this.nextStep === StepType.OUT &&
              stackDepth > this.stepOutToStackDepth
            ) {
              // trying to step out, but we didn't get out yet... continue on.
            } else if (
              this.nextStep === StepType.OVER &&
              typeof this.firstCallStackDepthThisStep !== 'undefined' &&
              stackDepth > this.firstCallStackDepthThisStep
            ) {
              // trying to step over, and we're in deeper inside a function call... continue next onTick
            } else {
              // Our step operation is complete, set reachedBreak to ensure the
              // current code will be selected before returning from this function.
              reachedBreak = true;
              // Reset nextStep to StepType.RUN to return to a normal 'break' state:
              this.nextStep = StepType.RUN;
              this.onNextStepChanged.notifyObservers();
              if (inUserCode) {
                // Store some properties about where we stopped:
                this.replaceStoppedAtBreakpointRowForScope(
                  this.interpreter.getScope(),
                  userCodeRow
                );
              }
              delete this.stepOutToStackDepth;
              delete this.firstCallStackDepthThisStep;
              break;
            }
          }
        }
      } else {
        if (this.executionError) {
          const shouldUseCodeRow = inUserCode || !!libraryName;
          const row = shouldUseCodeRow ? userCodeRow + 1 : undefined;
          this.handleError(row, libraryName);
        }
        this.isExecuting = false;
        return;
      }
    }
    if (atMaxSpeed) {
      if (reachedBreak) {
        // If we were running atMaxSpeed and just reached a breakpoint, the
        // code may not be selected in the editor, so do it now:
        this.selectCurrentCode();
      } else if (this.studioApp.editor) {
        codegen.clearDropletAceHighlighting(this.studioApp.editor);
      }
    }
    this.isExecuting = false;
  }

  /**
   * Checks to the see if the character offset is from the user code range.
   *
   * @param {number} offset index of a character from program
   * @return {boolean} true if the character offset is in user code.
   * @private
   */
  isOffsetInUserCode_(offset) {
    if (typeof offset === 'undefined' || typeof this.codeInfo === 'undefined') {
      return false;
    }
    const start = offset - this.codeInfo.userCodeStartOffset;

    return isNodeWithinUserCode(start, this.codeInfo.userCodeLength);
  }

  /**
   * Convert MemberExpression node to a string
   *
   * @param {!Object} node supplied by acorn parse.
   * @return {string} Name.
   * @private
   */
  static getMemberExpressionName_(node) {
    let objectString;
    switch (node.object.type) {
      case 'MemberExpression':
        objectString = this.getMemberExpressionName_(node.object);
        break;
      case 'Identifier':
        objectString = node.object.name;
        break;
      default:
        throw 'Unexpected MemberExpression node object type: ' +
          node.object.type;
    }
    let propString;
    switch (node.property.type) {
      case 'Identifier':
        propString = '.' + node.property.name;
        break;
      case 'Literal':
        propString = '[' + node.property.value + ']';
        break;
      default:
        throw 'Unexpected MemberExpression node property type: ' +
          node.object.type;
    }
    return objectString + propString;
  }

  /**
   * If necessary, add information to the executionLog about the upcoming
   * interpreter step operation.
   *
   * @private
   */
  logStep_() {
    const state = this.interpreter.peekStackFrame();
    const node = state.node;

    if (!(this.isOffsetInUserCode_(node.start) || isNodeFromLibrary(node))) {
      return;
    }

    // Log call and new expressions just before we step into a function (after the
    // last argument has been processed). (NOTE: as a result, a single stateful
    // async function call may appear multiple times in the log)
    if (
      (node.type === 'CallExpression' || node.type === 'NewExpression') &&
      state.doneCallee_ &&
      !state.doneExec_ &&
      !node.arguments[state.n_ || 0]
    ) {
      switch (node.callee.type) {
        case 'Identifier':
          this.executionLog.push(
            node.callee.name + ':' + node.arguments.length
          );
          break;
        case 'MemberExpression':
          this.executionLog.push(
            JSInterpreter.getMemberExpressionName_(node.callee) +
              ':' +
              node.arguments.length
          );
          break;
        default:
          throw 'Unexpected callee node property type: ' + node.object.type;
      }
    } else if (node.type === 'ForStatement') {
      const mode = state.mode_ || 0;
      switch (mode) {
        case codegen.ForStatementMode.INIT:
          this.executionLog.push('[forInit]');
          break;
        case codegen.ForStatementMode.TEST:
          this.executionLog.push('[forTest]');
          break;
        case codegen.ForStatementMode.UPDATE:
          this.executionLog.push('[forUpdate]');
          break;
      }
    }
  }

  /**
   * Gets the library's name, if it exists, from the current node
   */
  getLibraryName() {
    let libraryName;
    if (this.interpreter.peekStackFrame()) {
      const node = this.interpreter.peekStackFrame().node;

      if (node.loc) {
        libraryName = node.loc.source;
      }
    }
    return libraryName;
  }

  /**
   * Helper that wraps some error preprocessing before we notify observers that
   * an execution error has occurred. Operates on the current error that is
   * already saved as this.executionError
   *
   * @param {number} [lineNumber]
   */
  handleError(lineNumber, libraryName) {
    if (!lineNumber && this.executionError instanceof SyntaxError) {
      // syntax errors came before execution (during parsing), so we need
      // to determine the proper line number by looking at the exception
      lineNumber = this.executionError.loc.line;
      // Now select this location in the editor, since we know we didn't hit
      // this while executing (in which case, it would already have been selected)
      codegen.selectEditorRowColError(
        this.studioApp.editor,
        lineNumber - 1,
        this.executionError.loc.column
      );
    }

    // Select code that just executed:
    this.selectCurrentCode('ace_error');
    // Grab line number if we don't have one already:
    if (!lineNumber) {
      lineNumber = 1 + this.getNearestUserCodeLine();
    }

    var msg = String(this.executionError);
    if (libraryName) {
      msg = i18n.library() + ': ' + libraryName + ': ' + msg;
    }

    if (
      this.executionError instanceof ReferenceError &&
      this.executionError.message
    ) {
      const re = /(.*) is not defined/;
      const execResult = re.exec(this.executionError.message);
      if (execResult && execResult[1]) {
        const varName = execResult[1];
        if (varName === '__') {
          msg = 'It looks like you left one of the parameters empty.';
        } else {
          msg =
            `Oops, we can’t figure out what ${varName} is - perhaps you ` +
            `meant the string “${varName}” with quotes? If this is meant to be a ` +
            `variable, make sure you declared a variable: var ${varName}`;
        }
      }
    }
    this.onExecutionError.notifyObservers(
      this.executionError,
      lineNumber,
      msg,
      libraryName
    );
  }

  /**
   * Helper to create an interpeter primitive value. Useful when extending the
   * interpreter without relying on codegen marshalling helpers.
   */
  createPrimitive(data) {
    if (this.interpreter) {
      return this.interpreter.createPrimitive(data);
    }
  }

  /**
   * Selects code in droplet/ace editor.
   *
   * Returns the row (line) of code highlighted. If nothing is highlighted
   * because it is outside of the userCode area, the return value is -1
   */
  selectCurrentCode(highlightClass) {
    if (this.studioApp.hideSource || !this.studioApp.editCode) {
      return -1;
    }
    return codegen.selectCurrentCode(
      this.interpreter,
      this.codeInfo.cumulativeLength,
      this.codeInfo.userCodeStartOffset,
      this.codeInfo.userCodeLength,
      this.studioApp.editor,
      highlightClass
    );
  }

  /**
   * Finds the current line of code in droplet/ace editor.
   *
   * Returns the line of code where the interpreter is at. If it is outside
   * of the userCode area, the return value is -1
   */
  getUserCodeLine() {
    let userCodeRow = -1;
    if (this.interpreter.peekStackFrame()) {
      const node = this.interpreter.peekStackFrame().node;
      // Adjust start/end by userCodeStartOffset since the code running
      // has been expanded vs. what the user sees in the editor window:

      if (isNodeFromLibrary(node)) {
        return node.loc.start.line - 1;
      }
      const start = node.start - this.codeInfo.userCodeStartOffset;

      // Only return a valid userCodeRow if the node being executed is inside the
      // user's code (not inside code we inserted before or after their code that
      // is not visible in the editor):
      if (isNodeWithinUserCode(start, this.codeInfo.userCodeLength)) {
        userCodeRow = codegen.aceFindRow(
          this.codeInfo.cumulativeLength,
          0,
          this.codeInfo.cumulativeLength.length,
          start
        );
      }
    }
    return userCodeRow;
  }

  /**
   * Finds the current line of code in droplet/ace editor. Walks up the stack if
   * not currently in the user code area.
   */
  getNearestUserCodeLine() {
    if (this.studioApp.hideSource) {
      return -1;
    }
    let userCodeRow = -1;
    for (let i = 0; i < this.interpreter.getStackDepth(); i++) {
      const node = this.interpreter.peekStackFrame(i).node;
      // Adjust start/end by userCodeStartOffset since the code running
      // has been expanded vs. what the user sees in the editor window:
      if (isNodeFromLibrary(node)) {
        return node.loc.start.line - 1;
      }

      const start = node.start - this.codeInfo.userCodeStartOffset;

      // Only return a valid userCodeRow if the node being executed is inside the
      // user's code (not inside code we inserted before or after their code that
      // is not visible in the editor):
      if (isNodeWithinUserCode(start, this.codeInfo.userCodeLength)) {
        userCodeRow = codegen.aceFindRow(
          this.codeInfo.cumulativeLength,
          0,
          this.codeInfo.cumulativeLength.length,
          start
        );
        break;
      }
    }
    return userCodeRow;
  }

  /**
   * Creates a property in the interpreter's global scope. When a parent is
   * supplied and that parent object is in customMarshalObjectList,
   * property gets/sets in the interpreter will be reflected on the native parent
   * object. Functions can also be inserted into the global namespace using this
   * method. If a parent is supplied, they will be invoked natively with that
   * parent as the this parameter.
   *
   * @param {String} name Name for the property in the global scope.
   * @param {*} value Native value that will be marshalled to the interpreter.
   * @param {Object} parent (Optional) parent for the native value.
   */
  createGlobalProperty(name, value, parent) {
    let interpreterVal;
    if (typeof value === 'function') {
      const wrapper = this.interpreter.makeNativeMemberFunction({
        nativeFunc: value,
        nativeParentObj: parent
      });
      interpreterVal = this.interpreter.createNativeFunction(wrapper);
    } else {
      interpreterVal = this.interpreter.marshalNativeToInterpreter(
        value,
        utils.valueOr(parent, window)
      );
    }

    // Bypass setProperty since we've hooked it and it will not create the
    // property if it is in customMarshalGlobalProperties
    this.interpreter.setPropertyWithoutCustomMarshaling(
      this.globalScope,
      name,
      interpreterVal
    );
  }

  /**
   * Slightly modified version of interpreter's getValueFromScope. Does not
   * throw an exception that can be caught by the interpreted program.
   */
  getValueFromScope(name) {
    let scope = this.interpreter.getScope();
    while (scope) {
      if (this.interpreter.hasProperty(scope, name)) {
        return this.interpreter.getProperty(scope, name);
      }
      scope = scope.parentScope;
    }
    throw new ReferenceError('Unknown identifier: ' + name);
  }

  /**
   * Returns an interpreter object representing a specific node (parsed by acorn
   * for the purpose of displaying a watch value).
   * @private
   */
  getWatchValueFromNode_(node) {
    if (node.type === 'MemberExpression') {
      return this.getValueFromMemberExpression_(node);
    } else if (node.type === 'Identifier') {
      return this.getValueFromScope(node.name);
    } else {
      throw new Error('Invalid');
    }
  }

  /**
   * Returns an interpreter object representing the member expression.
   * @private
   */
  getValueFromMemberExpression_(expression) {
    const object = this.getWatchValueFromNode_(expression.object);

    if (expression.property.type === 'Identifier') {
      return this.interpreter.getValue([object, expression.property.name]);
    } else if (expression.property.type === 'Literal') {
      return this.interpreter.getValue([
        object,
        this.interpreter.createPrimitive(expression.property.value)
      ]);
    }
  }

  /**
   * Evaluate watch expression based on current scope.
   */
  evaluateWatchExpression(watchExpression) {
    let value;
    try {
      const ast = acorn.parse(watchExpression);
      if (
        ast.type === 'Program' &&
        ast.body[0].type === 'ExpressionStatement'
      ) {
        value = this.getWatchValueFromNode_(ast.body[0].expression);
      } else {
        throw new Error('Invalid');
      }
    } catch (err) {
      if (err instanceof Error) {
        return err;
      } else {
        return new Error(err);
      }
    }
    return this.interpreter.marshalInterpreterToNative(value);
  }

  /**
   * Returns the interpreter function object corresponding to 'funcName' if a
   * function with that name is found in the interpreter's global scope.
   */
  findGlobalFunction(funcName) {
    const funcObj = this.interpreter.getProperty(this.globalScope, funcName);
    if (funcObj.type === 'function') {
      return funcObj;
    }
  }

  /**
   * Returns an array containing the names of all of the global functions
   * in the interpreter's global scope. Built-in global functions are excluded.
   */
  getGlobalFunctionNames() {
    const builtInExclusionList = ['eval', 'getCallback', 'setCallbackRetVal'];

    const names = [];
    for (const objName in this.globalScope.properties) {
      const object = this.globalScope.properties[objName];
      if (
        object.type === 'function' &&
        !object.nativeFunc &&
        builtInExclusionList.indexOf(objName) === -1
      ) {
        names.push(objName);
      }
    }
    return names;
  }

  /**
   * Returns an array containing the names of all of the functions defined
   * inside other functions.
   */
  getLocalFunctionNames(scope) {
    if (!scope) {
      scope = this.globalScope;
    }
    let names = [];
    for (const objName in scope.properties) {
      const object = scope.properties[objName];
      if (object.type === 'function' && !object.nativeFunc && object.node) {
        if (scope !== this.globalScope) {
          names.push(objName);
        }
        const localScope = this.interpreter.createScope(
          object.node.body,
          object.parentScope
        );
        const localNames = this.getLocalFunctionNames(localScope);
        names = names.concat(localNames);
      }
    }
    return names;
  }

  /**
   * Returns the current interpreter state object.
   */
  getCurrentState() {
    const currentInterpreter = this.currentEvalInterpreter || this.interpreter;
    return currentInterpreter && currentInterpreter.peekStackFrame();
  }

  /**
   * Evaluate an expression in the interpreter's current scope, and return the
   * value of the evaluated expression.
   * @param {!string} expression
   * @returns {?} value of the expression
   * @throws if there's a problem evaluating the expression
   */
  evalInCurrentScope(expression) {
    const currentScope = this.interpreter.getScope();
    const evalInterpreter = new CustomMarshalingInterpreter(
      expression,
      this.customMarshaler
    );
    // Set scope to the current scope of the running program
    // NOTE: we are being a little tricky here (we are re-running
    // part of the Interpreter constructor with a different interpreter's
    // scope)
    evalInterpreter.global = this.interpreter.global;
    evalInterpreter.populateScope_(evalInterpreter.ast, currentScope);
    evalInterpreter.setStack([
      {
        node: evalInterpreter.ast,
        scope: currentScope,
        thisExpression: currentScope
      }
    ]);
    // Copy these properties directly into the evalInterpreter so the .isa()
    // method behaves as expected
    [
      'ARRAY',
      'BOOLEAN',
      'DATE',
      'FUNCTION',
      'NUMBER',
      'OBJECT',
      'STRING',
      'UNDEFINED'
    ].forEach(function(prop) {
      evalInterpreter[prop] = this.interpreter[prop];
    }, this);

    // run() may throw if there's a problem in the expression
    try {
      this.currentEvalInterpreter = evalInterpreter;
      evalInterpreter.run();
    } finally {
      this.currentEvalInterpreter = null;
    }
    return evalInterpreter.value;
  }

  handlePauseContinue() {
    // We have code and are either running or paused
    if (this.paused && this.nextStep === StepType.RUN) {
      this.paused = false;
    } else {
      this.paused = true;
      this.nextStep = StepType.RUN;
    }
    getStore().dispatch(setIsDebuggerPaused(this.paused, this.nextStep));
  }

  handleStepOver() {
    this.paused = true;
    this.nextStep = StepType.OVER;
    getStore().dispatch(setIsDebuggerPaused(this.paused, this.nextStep));
  }

  handleStepIn() {
    this.paused = true;
    this.nextStep = StepType.IN;
    getStore().dispatch(setIsDebuggerPaused(this.paused, this.nextStep));
  }

  handleStepOut() {
    this.paused = true;
    this.nextStep = StepType.OUT;
    getStore().dispatch(setIsDebuggerPaused(this.paused, this.nextStep));
  }
}
