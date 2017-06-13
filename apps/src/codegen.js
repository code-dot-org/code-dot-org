/* global CanvasPixelArray, Uint8ClampedArray */
import Interpreter from '@code-dot-org/js-interpreter';
import {dropletGlobalConfigBlocks} from './dropletUtils';
import * as utils from './utils';
import CustomMarshaler from './lib/tools/jsinterpreter/CustomMarshaler';

/*
 * Note: These are defined to match the state.mode of the interpreter. The
 * values must stay in sync with interpreter.js
 */

exports.ForStatementMode = {
  INIT: 0,
  TEST: 1,
  BODY: 2,
  UPDATE: 3
};

exports.asyncFunctionList = [];

/**
 * Evaluates a string of code parameterized with a dictionary.
 * Note that this does not currently support custom marshaling.
 *
 * @param code {string} - the code to evaluation
 * @param globals {Object} - An object of globals to be added to the scope of code being executed
 * @param legacy {boolean} - If true, code will be run natively via an eval-like method,
 *     otherwise it will use the js interpreter.
 * @returns the interpreter instance unless legacy=true, in which case, it returns whatever the given code returns.
 */
export function evalWith(code, globals, legacy) {
  if (legacy) {
    // execute JS code "natively"
    var params = [];
    var args = [];
    for (var k in globals) {
      params.push(k);
      args.push(globals[k]);
    }
    params.push(code);
    var ctor = function () {
      return Function.apply(this, params);
    };
    ctor.prototype = Function.prototype;
    return new ctor().apply(null, args);
  } else {
    const interpreter = new Interpreter(
      `(function () { ${code} })()`,
      (interpreter, scope) => {
        marshalNativeToInterpreterObject(interpreter, globals, 5, scope);
      }
    );
    interpreter.run();
    return interpreter;
  }
}

/**
 * Generate code for each of the given events, and evaluate it using the
 * provided APIs as context. Note that this does not currently support custom marshaling.
 *
 * @param {Object} apis - Context to be set as globals in the interpreted runtime.
 * @param {Object} events - Mapping of hook names to the corresponding handler code.
 *     The handler code is of the form {code: string|Array<string>, args: ?Array<string>}
 * @param {string} [evalCode] - Optional extra code to evaluate.
 * @return {{hooks: Array<{name: string, func: Function}>, interpreter: CustomMarshalingInterpreter}} Mapping of
 *     hook names to the corresponding event handler, and the interpreter that was created to evaluate the code.
 */
export function evalWithEvents(apis, events, evalCode = '') {
  let interpreter, currentCallback, lastReturnValue;
  const hooks = [];

  Object.keys(events).forEach(event => {
    let {code, args} = events[event];
    if (typeof code === 'string') {
      code = [code];
    }
    code.forEach((c, index) => {
      const eventId = `${event}-${index}`;
      // Create a hook that triggers an event inside the interpreter.
      hooks.push({name: event, func: (...args) => {
        const eventArgs = {name: eventId, args};
        currentCallback(marshalNativeToInterpreter(interpreter, eventArgs, null, 5));
        interpreter.run();
        return lastReturnValue;
      }});
      evalCode += `this['${eventId}']=function(${args ? args.join() : ''}){${c}};`;
    });
  });

  // The event loop pauses the interpreter until the native async function
  // `currentCallback` returns a value. The value contains the name of the event
  // to call, and any arguments.
  const eventLoop = ';while(true){var event=wait();setReturnValue(this[event.name].apply(null,event.args));}';

  // TODO (pcardune): remove circular dependency
  const CustomMarshalingInterpreter = require('./lib/tools/jsinterpreter/CustomMarshalingInterpreter');
  interpreter = new CustomMarshalingInterpreter(
    evalCode + eventLoop,
    new CustomMarshaler({}),
    (interpreter, scope) => {
      marshalNativeToInterpreterObject(interpreter, apis, 5, scope);
      interpreter.setProperty(scope, 'wait', interpreter.createAsyncFunction(callback => {
        currentCallback = callback;
      }));
      interpreter.setProperty(scope, 'setReturnValue', interpreter.createNativeFunction(returnValue => {
        lastReturnValue = exports.marshalInterpreterToNative(interpreter, returnValue);
      }));
    }
  );
  interpreter.run();

  return {hooks, interpreter};
}

//
// Blockly specific codegen functions:
//

var INFINITE_LOOP_TRAP = '  executionInfo.checkTimeout(); if (executionInfo.isTerminated()){return;}\n';

var LOOP_HIGHLIGHT = 'loopHighlight();\n';
var LOOP_HIGHLIGHT_RE =
    new RegExp(LOOP_HIGHLIGHT.replace(/\(.*\)/, '\\(.*\\)') + '\\s*', 'g');

/**
 * Returns javascript code to call a timeout check
 */
exports.loopTrap = function () {
  return INFINITE_LOOP_TRAP;
};

exports.loopHighlight = function (apiName, blockId) {
  var args = "'block_id_" + blockId + "'";
  if (blockId === undefined) {
    args = "%1";
  }
  return '  ' + apiName + '.' + LOOP_HIGHLIGHT.replace('()', '(' + args + ')');
};

/**
 * Extract the user's code as raw JavaScript.
 * @param {string} code Generated code.
 * @return {string} The code without serial numbers and timeout checks.
 */
exports.strip = function (code) {
  return (code
    // Strip out serial numbers.
    .replace(/(,\s*)?'block_id_\d+'\)/g, ')')
    // Remove timeouts.
    .replace(INFINITE_LOOP_TRAP, '')
    // Strip out loop highlight
    .replace(LOOP_HIGHLIGHT_RE, '')
    // Strip out class namespaces.
    .replace(/(StudioApp|Maze|Turtle)\./g, '')
    // Strip out particular helper functions.
    .replace(/^function (colour_random)[\s\S]*?^}/gm, '')
    // Collapse consecutive blank lines.
    .replace(/\n\n+/gm, '\n\n')
    // Trim.
    .replace(/^\s+|\s+$/g, '')
  );
};

/**
 * Extract the user's code as raw JavaScript.
 */
exports.workspaceCode = function (blockly) {
  var code = blockly.Generator.blockSpaceToCode('JavaScript', null, false);
  return exports.strip(code);
};

//
// Property access wrapped in try/catch. This is in an indepedendent function
// so the JIT compiler can optimize the calling function.
//

function safeReadProperty(object, property) {
  try {
    return object[property];
  } catch (e) { }
}

//
// Marshal a single native object from native to interpreter. This is in an
// indepedendent function so the JIT compiler can optimize the calling function.
// (Chrome V8 says ForInStatement is not fast case)
//

/**
 * Marshal a native object to an interpreter object.
 *
 * @param {Interpreter} interpreter Interpreter instance
 * @param {Object} nativeObject Object to marshal
 * @param {Number} maxDepth Optional maximum depth to traverse in properties
 * @param {Object} interpreterObject Optional existing interpreter object
 * @return {!Object} The interpreter object, which was created if needed.
 */
function marshalNativeToInterpreterObject(
    interpreter,
    nativeObject,
    maxDepth,
    interpreterObject) {
  var retVal = interpreterObject || interpreter.createObject(interpreter.OBJECT);
  var isFunc = interpreter.isa(retVal, interpreter.FUNCTION);
  for (var prop in nativeObject) {
    var value = safeReadProperty(nativeObject, prop);
    if (isFunc &&
        (value === Function.prototype.trigger ||
            value === Function.prototype.inherits)) {
      // Don't marshal these that were added by jquery or else we will recurse
      continue;
    }
    interpreter.setProperty(
      retVal,
      prop,
      marshalNativeToInterpreter(
        interpreter,
        value,
        nativeObject,
        maxDepth
      )
    );
  }
  return retVal;
}

function isCanvasImageData(nativeVar) {
  // IE 9/10 don't know about Uint8ClampedArray and call it CanvasPixelArray instead
  if (typeof(Uint8ClampedArray) !== "undefined") {
    return nativeVar instanceof Uint8ClampedArray;
  }
  return nativeVar instanceof CanvasPixelArray;
}

//
// Droplet/JavaScript/Interpreter codegen functions:
//
/**
 * @param {CustomMarshalingInterpreter} interpreter - instance of the interpreter to marshal objects to
 * @param {boolean|string|number|Object|Array|Function} [nativeVar] - the native object to marshal into the interpreter.
 * @param {Object} [nativeParentObj] - optional native parent object that the given nativeVar is a member of
 * @param {number} [maxDepth] - optional maximum depth to recurse down when marhsaling the given object. Defaults to Infinity
 * @returns The interpreter's representation of the marshaled object.
 */
export function marshalNativeToInterpreter(interpreter, nativeVar, nativeParentObj, maxDepth) {
  if (maxDepth === 0 || typeof nativeVar === 'undefined') {
    return interpreter.UNDEFINED;
  }
  var i, retVal;
  if (typeof maxDepth === "undefined") {
    maxDepth = Infinity; // default to infinite levels of depth
  }
  // TODO (pcardune): remove circular dependency
  const CustomMarshalingInterpreter = require('./lib/tools/jsinterpreter/CustomMarshalingInterpreter');
  if (interpreter instanceof CustomMarshalingInterpreter) {
    if (interpreter.customMarshaler.shouldCustomMarshalObject(nativeVar, nativeParentObj)) {
      return interpreter.customMarshaler.createCustomMarshalObject(nativeVar, nativeParentObj);
    }
  }
  if (nativeVar instanceof Array) {
    retVal = interpreter.createObject(interpreter.ARRAY);
    for (i = 0; i < nativeVar.length; i++) {
      retVal.properties[i] = marshalNativeToInterpreter(interpreter,
        nativeVar[i], null, maxDepth - 1);
    }
    retVal.length = nativeVar.length;
  } else if (isCanvasImageData(nativeVar)) {
    // Special case for canvas image data - could expand to support TypedArray
    retVal = interpreter.createObject(interpreter.ARRAY);
    for (i = 0; i < nativeVar.length; i++) {
      retVal.properties[i] = interpreter.createPrimitive(nativeVar[i]);
    }
    retVal.length = nativeVar.length;
  } else if (nativeVar instanceof Function) {
    var makeNativeOpts = {
      interpreter: interpreter,
      nativeFunc: nativeVar,
      nativeParentObj: nativeParentObj,
    };
    if (exports.asyncFunctionList.indexOf(nativeVar) !== -1) {
      // Mark if this should be nativeIsAsync:
      makeNativeOpts.nativeIsAsync = true;
    }
    if (interpreter instanceof CustomMarshalingInterpreter) {
      var extraOpts = interpreter.customMarshaler.getCustomMarshalMethodOptions(interpreter, nativeParentObj);
      // Add extra options if the parent of this function is in our custom marshal
      // modified object list:
      for (var prop in extraOpts) {
        makeNativeOpts[prop] = extraOpts[prop];
      }
    }
    var wrapper = makeNativeMemberFunction(makeNativeOpts);
    if (makeNativeOpts.nativeIsAsync) {
      retVal = interpreter.createAsyncFunction(wrapper);
    } else {
      retVal = interpreter.createNativeFunction(wrapper);
    }
    // Also marshal properties on the native function object:
    marshalNativeToInterpreterObject(interpreter, nativeVar, maxDepth - 1, retVal);
  } else if (nativeVar instanceof Object) {
    // note Object must be checked after Function and Array (since they are also Objects)
    if (interpreter.isa(nativeVar, interpreter.FUNCTION)) {
      // Special case to see if we are trying to marshal an interpreter object
      // (this currently happens when we store interpreter function objects in native
      //  and return them back in nativeGetCallback)

      // NOTE: this check could be expanded to check for other interpreter object types
      // if we have reason to believe that we may be passing those back

      retVal = nativeVar;
    } else {
      retVal = marshalNativeToInterpreterObject(interpreter, nativeVar, maxDepth - 1);
    }
  } else {
    retVal = interpreter.createPrimitive(nativeVar);
  }
  return retVal;
}

exports.createNativeFunctionFromInterpreterFunction = null;

exports.marshalInterpreterToNative = function (interpreter, interpreterVar) {
  if (interpreterVar.isPrimitive || interpreterVar.isCustomMarshal) {
    return interpreterVar.data;
  } else if (interpreter.isa(interpreterVar, interpreter.ARRAY)) {
    var nativeArray = [];
    nativeArray.length = interpreterVar.length;
    for (var i = 0; i < nativeArray.length; i++) {
      nativeArray[i] = exports.marshalInterpreterToNative(interpreter,
                                                          interpreterVar.properties[i]);
    }
    return nativeArray;
  } else if (interpreter.isa(interpreterVar, interpreter.OBJECT) ||
             interpreterVar.type === 'object') {
    var nativeObject = {};
    for (var prop in interpreterVar.properties) {
      nativeObject[prop] = exports.marshalInterpreterToNative(interpreter,
                                                              interpreterVar.properties[prop]);
    }
    return nativeObject;
  } else if (interpreter.isa(interpreterVar, interpreter.FUNCTION)) {
    if (exports.createNativeFunctionFromInterpreterFunction) {
      return exports.createNativeFunctionFromInterpreterFunction(interpreterVar);
    } else {
      // Just return the interpreter object if we can't convert it. This is needed
      // for passing interpreter callback functions into native.

      return interpreterVar;
    }
  } else {
    throw "Can't marshal type " + typeof interpreterVar;
  }
};

/**
 * Generate a function wrapper for an interpreter async function callback.
 * The interpreter async function callback takes a single parameter, which
 * becomes the return value of the synchronous function in the interpreter
 * world. Here, we wrap the supplied callback to marshal the single parameter
 * from native to interpreter before calling the supplied callback.
 *
 * @param {Object} opts Options block with interpreter and maxDepth provided
 * @param {function} callback The interpreter supplied callback function
 */
function createNativeCallbackForAsyncFunction(opts, callback) {
  return nativeValue => {
    callback(
      marshalNativeToInterpreter(
        opts.interpreter,
        nativeValue,
        null,
        opts.maxDepth
      )
    );
  };
}

/**
 * Generate a function wrapper for an interpreter callback that will be
 * invoked by a special native function that can execute these callbacks inline
 * on the interpreter stack.
 *
 * @param {!Object} opts Options block
 * @param {!Interpreter} opts.interpreter Interpreter instance
 * @param {number} [opts.maxDepth] Maximum depth to marshal objects
 * @param {Object} [opts.callbackState] callback state object, which will
 *        hold the unmarshaled return value as a 'value' property later.
 * @param {Function} intFunc The interpreter supplied callback function
 */
function createNativeInterpreterCallback(opts, intFunc) {
  return function (...args) {
    const intArgs = args.map(arg => marshalNativeToInterpreter(
      opts.interpreter,
      arg,
      null,
      opts.maxDepth
    ));
    // Shift a CallExpression node on the stack that already has its func_,
    // arguments, and other state populated:
    var state = opts.callbackState || {};
    state.node = {
      type: 'CallExpression',
      arguments: intArgs /* this just needs to be an array of the same size */
    };
    state.doneCallee_ = true;
    state.func_ = intFunc;
    state.arguments = intArgs;
    state.n_ = intArgs.length;

    // remove the last argument because stepCallExpression always wants to push it back on.
    if (state.arguments.length > 0) {
      state.value = state.arguments.pop();
    }

    opts.interpreter.pushStackFrame(state);
  };
}

/**
 * Generate a native function wrapper for use with the JS interpreter.
 * @param {Object} opts - configuration options. See below.
 * @param {boolean} opts.dontMarshal - Whether or not to marshal the arguments passed to
 *     the native function from interpreter objects to native objects.
 * @param {Function} opts.nativeFunc - The native function that you want to make available
 *     to the interpreter via a wrapped interpreter function.
 * @param {Object} opts.nativeParentObj - The parent object that the native function
 *     should be bound to when it is called.
 * @param {CustomMarshalingInterpreter} opts.interpreter - the interpreter instance to use
 *     to perform custom marshaling.
 * @param {number} opts.maxDepth - The maximum depth of objects that should be custom
 *     marshaled.
 * @param {boolean} opts.nativeIsAsync - When true, the return value of the native function
 *     is not marshaled back to the interpreter. Rather, a callback is given allowing
 *     the native function to perform asynchronous tasks before returning control back
 *     to the interpreter by calling the callback with the return value.
 * @param {boolean} opts.nativeCallsBackInterpreter - When true, the native function
 *     can receive wrapped interpreter functions as arguments, which it can then call
 *     to return control back to the interpreter.
 * @returns a wrapped version of native func that performs appropriate custom marshaling
 *     on all the arguments that it is called with. This is expected to be used with
 *     Interpreter.createAsyncFunction and Interpreter.createNativeFunction to give
 *     interpreted code safe access to native functions.
 */
export function makeNativeMemberFunction(opts) {
  const {
    dontMarshal,
    nativeFunc,
    nativeParentObj,
    interpreter,
    maxDepth,
    nativeIsAsync,
    nativeCallsBackInterpreter,
  } = opts;
  return (...args) => {
    let nativeArgs = [];
    if (dontMarshal) {
      nativeArgs = args;
    } else {
      // Call the native function after marshalling parameters:
      for (var i = 0; i < args.length; i++) {
        if (nativeIsAsync && (i === args.length - 1)) {
          // Async functions receive a native callback method as their last
          // parameter, and we want to wrap that callback to ease marshalling:
          nativeArgs[i] = createNativeCallbackForAsyncFunction(opts, args[i]);
        } else if (nativeCallsBackInterpreter &&
                   typeof args[i] === 'object' &&
                   interpreter.isa(args[i], interpreter.FUNCTION)) {
          // A select class of native functions is aware of the interpreter and
          // capable of calling the interpreter on the stack immediately. We
          // marshal these differently:
          nativeArgs[i] = createNativeInterpreterCallback(opts, args[i]);
        } else {
          nativeArgs[i] = exports.marshalInterpreterToNative(interpreter, args[i]);
        }
      }
    }
    var nativeRetVal = nativeFunc.apply(nativeParentObj, nativeArgs);
    return marshalNativeToInterpreter(
      interpreter,
      nativeRetVal,
      null,
      maxDepth
    );
  };
}

function populateFunctionsIntoScope(interpreter, scope, funcsObj, parentObj, options) {
  for (var prop in funcsObj) {
    var func = funcsObj[prop];
    if (func instanceof Function) {
      // Populate the scope with native functions
      // NOTE: other properties are not currently passed to the interpreter
      var parent = parentObj ? parentObj : funcsObj;
      var wrapper = makeNativeMemberFunction(utils.extend(options, {
          interpreter: interpreter,
          nativeFunc: func,
          nativeParentObj: parent,
      }));
      interpreter.setProperty(scope,
                              prop,
                              interpreter.createNativeFunction(wrapper));
    }
  }
}

function populateGlobalFunctions(interpreter, blocks, blockFilter, scope) {
  for (var i = 0; i < blocks.length; i++) {
    var block = blocks[i];
    if (block.parent &&
        (!blockFilter || typeof blockFilter[block.func] !== 'undefined')) {
      var funcScope = scope;
      var funcName = block.func;
      var funcComponents = funcName.split('.');
      if (funcComponents.length === 2) {
        // Special accommodation for Object.function syntax (2 components only):
        var objName = funcComponents[0];
        // Find or create global object named 'objName' and make it the scope:
        funcScope = interpreter.getProperty(scope, objName);
        if (interpreter.UNDEFINED === funcScope) {
          funcScope = interpreter.createObject(interpreter.OBJECT);
          interpreter.setProperty(scope, objName, funcScope);
        }
        funcName = funcComponents[1];
      }
      var func = block.parent[funcName];
      var wrapper = makeNativeMemberFunction({
          interpreter: interpreter,
          nativeFunc: func,
          nativeParentObj: block.parent,
          dontMarshal: block.dontMarshal,
          nativeIsAsync: block.nativeIsAsync
      });
      var intFunc;
      if (block.nativeIsAsync) {
        intFunc = interpreter.createAsyncFunction(wrapper);
      } else {
        intFunc = interpreter.createNativeFunction(wrapper);
      }
      interpreter.setProperty(funcScope, funcName, intFunc);
    }
  }
}

function populateJSFunctions(interpreter) {
  // The interpreter is missing some basic JS functions. Add them as needed:

  // Add String.prototype.includes
  var wrapper = function (searchStr) {
    // Polyfill based off of https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/includes
    return interpreter.createPrimitive(
      String.prototype.indexOf.apply(this, arguments) !== -1);
  };
  interpreter.setProperty(interpreter.STRING.properties.prototype, 'includes',
    interpreter.createNativeFunction(wrapper), false, true);
}

/**
 * Initialize a JS interpreter.
 *
 * interpreter (required): JS interpreter instance.
 * blocks (optional): blocks in dropletConfig.blocks format. If a block has
 *  a parent property, we will populate that function into the specified scope.
 * blockFilter (optional): an object with block-name keys that should be used
 *  to filter which blocks are populated.
 * scope (required): interpreter's global scope.
 * globalObjects (optional): objects containing functions to placed in a new scope
 *  created beneath the supplied scope.
 */
exports.initJSInterpreter = function (interpreter, blocks, blockFilter, scope, globalObjects) {
  for (var globalObj in globalObjects) {
    // The globalObjects object contains objects that will be referenced
    // by the code we plan to execute. Since these objects exist in the native
    // world, we need to create associated objects in the interpreter's world
    // so the interpreted code can call out to these native objects

    // Create global objects in the interpreter for everything in options
    var obj = interpreter.createObject(interpreter.OBJECT);
    interpreter.setProperty(scope, globalObj.toString(), obj);
    // Marshal return values with a maxDepth of 2 (just an object and its child
    // methods and properties only)
    populateFunctionsIntoScope(
        interpreter,
        obj,
        globalObjects[globalObj],
        null,
        { maxDepth: 2 });
  }
  populateGlobalFunctions(
      interpreter,
      dropletGlobalConfigBlocks,
      blockFilter,
      scope);
  if (blocks) {
    populateGlobalFunctions(
        interpreter,
        blocks,
        blockFilter,
        scope);
  }
  populateJSFunctions(interpreter);
};

/**
 * Check to see if it is safe to step the interpreter while we are unwinding.
 * (Called repeatedly after completing a step where the node was marked 'done')
 */
exports.isNextStepSafeWhileUnwinding = function (interpreter) {
  var state = interpreter.peekStackFrame();
  var type = state.node.type;
  if (state.done) {
    return true;
  }
  if (type === "SwitchStatement") {
    // Safe to skip over SwitchStatement's except the very start (before a
    // switchValue has been set):
    return typeof state.switchValue !== 'undefined';
  }
  if (type === "VariableDeclaration") {
    // Only stop the first time this VariableDeclaration is processed (the
    // interpreter will stop on this node multiple times, but with different
    // `state.n` representing which VariableDeclarator is being executed).
    return state.n > 0;
  }
  /* eslint-disable no-fallthrough */
  switch (type) {
    // Declarations:
    case "VariableDeclarator":
    // Statements:
    case "BlockStatement":
    case "BreakStatement":
    // All Expressions:
    case "ThisExpression":
    case "ArrayExpression":
    case "ObjectExpression":
    case "ArrowExpression":
    case "SequenceExpression":
    case "UnaryExpression":
    case "BinaryExpression":
    case "UpdateExpression":
    case "LogicalExpression":
    case "ConditionalExpression":
    case "NewExpression":
    case "CallExpression":
    case "MemberExpression":
    case "FunctionExpression":
    case "AssignmentExpression":
    // Other:
    case "Identifier":
    case "Literal":
    case "Program":
      return true;
  }
  /* eslint-enable  no-fallthrough */
  return false;
};

// session is an instance of Ace editSession
// Usage
// var lengthArray = calculateCumulativeLength(editor.getSession());
// Need to call this only if the document is updated after the last call.
exports.calculateCumulativeLength = function (code) {
  var regex = /\n/g, result = [];
  do {
    result.push(regex.lastIndex);
    regex.exec(code);
  } while (regex.lastIndex !== 0);

  result.push(code.length + 1);
  return result;
};

// Fast binary search implementation
// Pass the cumulative length array here.
// Usage
// var row = aceFindRow(lengthArray, 0, lengthArray.length, 2512);
// tries to find 2512th character lies in which row.
exports.aceFindRow = function (cumulativeLength, rows, rowe, pos) {
  if (rows > rowe) {
    return null;
  }
  if (rows + 1 === rowe) {
    return rows;
  }

  var mid = Math.floor((rows + rowe) / 2);

  if (pos < cumulativeLength[mid]) {
    return exports.aceFindRow(cumulativeLength, rows, mid, pos);
  } else if (pos > cumulativeLength[mid]) {
    return exports.aceFindRow(cumulativeLength, mid, rowe, pos);
  }
  return mid;
};

exports.isAceBreakpointRow = function (session, userCodeRow) {
  if (!session) {
    return false;
  }
  var bps = session.getBreakpoints();
  return Boolean(bps[userCodeRow]);
};

var lastHighlightMarkerIds = {};

/**
 * Clears all highlights that we have added in the ace editor.
 */
function clearAllHighlightedAceLines(aceEditor) {
  var session = aceEditor.getSession();
  for (var hlClass in lastHighlightMarkerIds) {
    session.removeMarker(lastHighlightMarkerIds[hlClass]);
  }
  lastHighlightMarkerIds = {};
}

/**
 * Highlights lines in the ace editor. Always moves the previous highlight with
 * the same class to the new location.
 *
 * If the row parameters are not supplied, just clear the last highlight.
 */
function highlightAceLines(aceEditor, className, startRow, startColumn, endRow, endColumn) {
  var session = aceEditor.getSession();
  className = className || 'ace_step';
  if (lastHighlightMarkerIds[className]) {
    session.removeMarker(lastHighlightMarkerIds[className]);
    lastHighlightMarkerIds[className] = null;
  }
  if (typeof startRow !== 'undefined') {
    lastHighlightMarkerIds[className] = session.addMarker(
        new (window.ace.require('ace/range').Range)(
            startRow, startColumn, endRow, endColumn), className, 'text');
    if (!aceEditor.isRowFullyVisible(startRow)) {
      aceEditor.scrollToLine(startRow, true);
    }
  }
}

/**
 * Selects and highlights code in droplet/ace editor to indicate an error.
 *
 * This function simply highlights one spot, not a range. It is typically used
 * to highlight where an error has occurred.
 */
exports.selectEditorRowColError = function (editor, row, col) {
  if (!editor) {
    return;
  }
  if (editor.currentlyUsingBlocks) {
    var style = {color: '#FFFF22'};
    editor.clearLineMarks();
    editor.markLine(row, style);
  } else {
    var selection = editor.aceEditor.getSelection();
    var range = selection.getRange();

    range.start.row = row;
    range.start.column = col;
    range.end.row = row;
    range.end.column = col + 1;

    // setting with the backwards parameter set to true - this prevents horizontal
    // scrolling to the right
    selection.setSelectionRange(range, true);
  }
  lastHighlightMarkerIds.ace_error = editor.aceEditor.getSession()
      .highlightLines(row, row, 'ace_error').id;
};

/**
 * Removes highlights (for the default ace_step class) and selection in
 * droplet and ace editors.
 *
 * @param {boolean} allClasses When set to true, remove all classes of
 * highlights (including ace_step, ace_error, and anything else)
 */
exports.clearDropletAceHighlighting = function (editor, allClasses) {
  if (editor.currentlyUsingBlocks) {
    editor.clearLineMarks();
  } else {
    editor.aceEditor.getSelection().clearSelection();
  }
  if (allClasses) {
    clearAllHighlightedAceLines(editor.aceEditor);
  } else {
    // when calling without a class or rows, highlightAceLines() will clear
    // everything highlighted with the default highlight class
    highlightAceLines(editor.aceEditor);
  }
};

function selectAndHighlightCode(aceEditor, cumulativeLength, start, end, highlightClass) {
  var selection = aceEditor.getSelection();
  var range = selection.getRange();

  range.start.row = exports.aceFindRow(cumulativeLength, 0, cumulativeLength.length, start);
  range.start.column = start - cumulativeLength[range.start.row];
  range.end.row = exports.aceFindRow(cumulativeLength, 0, cumulativeLength.length, end);
  range.end.column = end - cumulativeLength[range.end.row];

  highlightAceLines(aceEditor, highlightClass || "ace_step", range.start.row,
      range.start.column, range.end.row, range.end.column);
}

/**
 * Selects code in droplet/ace editor.
 *
 * Returns the row (line) of code highlighted. If nothing is highlighted
 * because it is outside of the userCode area, the return value is -1
 *
 * @param {string} highlightClass CSS class to use when highlighting in ACE
 */
exports.selectCurrentCode = function (interpreter,
                                      cumulativeLength,
                                      userCodeStartOffset,
                                      userCodeLength,
                                      editor,
                                      highlightClass) {
  var userCodeRow = -1;
  if (interpreter && interpreter.peekStackFrame()) {
    var node = interpreter.peekStackFrame().node;

    if (node.type === 'ForStatement') {
      var mode = interpreter.peekStackFrame().mode || 0, subNode;
      switch (mode) {
        case exports.ForStatementMode.INIT:
          subNode = node.init;
          break;
        case exports.ForStatementMode.TEST:
          subNode = node.test;
          break;
        case exports.ForStatementMode.BODY:
          subNode = node.body;
          break;
        case exports.ForStatementMode.UPDATE:
          subNode = node.update;
          break;
      }
      node = subNode || node;
    }

    // Adjust start/end by userCodeStartOffset since the code running
    // has been expanded vs. what the user sees in the editor window:
    var start = node.start - userCodeStartOffset;
    var end = node.end - userCodeStartOffset;

    // Only show selection if the node being executed is inside the user's
    // code (not inside code we inserted before or after their code that is
    // not visible in the editor):
    if (start >= 0 && start < userCodeLength && end <= userCodeLength) {
      userCodeRow = exports.aceFindRow(cumulativeLength, 0, cumulativeLength.length, start);
      // Highlight the code being executed in each step:
      if (editor.currentlyUsingBlocks) {
        var style = {color: '#FFFF22'};
        editor.clearLineMarks();
        editor.mark({row: userCodeRow, col: start - cumulativeLength[userCodeRow]}, style);
      } else {
        selectAndHighlightCode(editor.aceEditor, cumulativeLength, start, end,
            highlightClass);
      }
    } else {
      exports.clearDropletAceHighlighting(editor);
    }
  } else {
    exports.clearDropletAceHighlighting(editor);
  }
  return userCodeRow;
};
