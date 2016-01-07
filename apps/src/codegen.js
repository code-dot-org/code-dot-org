/* global Interpreter, CanvasPixelArray */

var dropletUtils = require('./dropletUtils');

/**
 * Evaluates a string of code parameterized with a dictionary.
 */
exports.evalWith = function(code, options) {
  if (options.StudioApp && options.StudioApp.editCode) {
    // Use JS interpreter on editCode levels
    var initFunc = function(interpreter, scope) {
      exports.initJSInterpreter(interpreter, null, null, scope, options);
    };
    var myInterpreter = new Interpreter(code, initFunc);
    // interpret the JS program all at once:
    myInterpreter.run();
  } else {
    // execute JS code "natively"
    var params = [];
    var args = [];
    for (var k in options) {
      params.push(k);
      args.push(options[k]);
    }
    params.push(code);
    var ctor = function() {
      return Function.apply(this, params);
    };
    ctor.prototype = Function.prototype;
    return new ctor().apply(null, args);
  }
};

/**
 * Returns a function based on a string of code parameterized with a dictionary.
 */
exports.functionFromCode = function(code, options) {
  if (options.StudioApp && options.StudioApp.editCode) {
    // Since this returns a new native function, it doesn't make sense in the
    // editCode case (we assume that the app will be using JSInterpreter)
    throw "Unexpected";
  } else {
    var params = [];
    var args = [];
    for (var k in options) {
      params.push(k);
      args.push(options[k]);
    }
    params.push(code);
    var ctor = function() {
      return Function.apply(this, params);
    };
    ctor.prototype = Function.prototype;
    return new ctor();
  }
};

//
// Blockly specific codegen functions:
//

var INFINITE_LOOP_TRAP = '  executionInfo.checkTimeout(); if (executionInfo.isTerminated()){return;}\n';

var LOOP_HIGHLIGHT = 'loopHighlight();\n';
var LOOP_HIGHLIGHT_RE =
    new RegExp(LOOP_HIGHLIGHT.replace(/\(.*\)/, '\\(.*\\)'), 'g');

/**
 * Returns javascript code to call a timeout check
 */
exports.loopTrap = function() {
  return INFINITE_LOOP_TRAP;
};

exports.loopHighlight = function (apiName, blockId) {
  var args = "'block_id_" + blockId + "'";
  if (blockId === undefined) {
    args = "%1";
  }
  return apiName + '.' + LOOP_HIGHLIGHT.replace('()', '(' + args + ')');
};

/**
 * Extract the user's code as raw JavaScript.
 * @param {string} code Generated code.
 * @return {string} The code without serial numbers and timeout checks.
 */
exports.strip = function(code) {
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
exports.workspaceCode = function(blockly) {
  var code = blockly.Generator.blockSpaceToCode('JavaScript');
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

function marshalNativeToInterpreterObject(interpreter, nativeObject, maxDepth) {
  var retVal = interpreter.createObject(interpreter.OBJECT);
  for (var prop in nativeObject) {
    var value = safeReadProperty(nativeObject, prop);
    interpreter.setProperty(retVal,
                            prop,
                            exports.marshalNativeToInterpreter(interpreter,
                                                               value,
                                                               nativeObject,
                                                               maxDepth));
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
exports.marshalNativeToInterpreter = function (interpreter, nativeVar, nativeParentObj, maxDepth) {
  if (typeof nativeVar === 'undefined') {
    return interpreter.UNDEFINED;
  }
  var i, retVal;
  if (typeof maxDepth === "undefined") {
    maxDepth = Infinity; // default to inifinite levels of depth
  }
  if (maxDepth === 0) {
    return interpreter.createPrimitive(undefined);
  }
  if (nativeVar instanceof Array) {
    retVal = interpreter.createObject(interpreter.ARRAY);
    for (i = 0; i < nativeVar.length; i++) {
      retVal.properties[i] = exports.marshalNativeToInterpreter(interpreter,
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
    var wrapper = exports.makeNativeMemberFunction({
        interpreter: interpreter,
        nativeFunc: nativeVar,
        nativeParentObj: nativeParentObj,
    });
    retVal = interpreter.createNativeFunction(wrapper);
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
};

exports.marshalInterpreterToNative = function (interpreter, interpreterVar) {
  if (interpreterVar.isPrimitive) {
    return interpreterVar.data;
  } else if (interpreter.isa(interpreterVar, interpreter.ARRAY)) {
    var nativeArray = [];
    nativeArray.length = interpreterVar.length;
    for (var i = 0; i < nativeArray.length; i++) {
      nativeArray[i] = exports.marshalInterpreterToNative(interpreter,
                                                          interpreterVar.properties[i]);
    }
    return nativeArray;
  } else if (interpreter.isa(interpreterVar, interpreter.OBJECT)) {
    var nativeObject = {};
    for (var prop in interpreterVar.properties) {
      nativeObject[prop] = exports.marshalInterpreterToNative(interpreter,
                                                              interpreterVar.properties[prop]);
    }
    return nativeObject;
  } else {
    // Just return the interpreter object if we can't convert it. This is needed
    // for passing interpreter callback functions into native.
    return interpreterVar;
  }
};

/**
 * Generate a native function wrapper for use with the JS interpreter.
 */
exports.makeNativeMemberFunction = function (opts) {
  if (opts.dontMarshal) {
    return function() {
      // Just call the native function and marshal the return value:
      var nativeRetVal = opts.nativeFunc.apply(opts.nativeParentObj, arguments);
      return exports.marshalNativeToInterpreter(opts.interpreter, nativeRetVal,
        null, opts.maxDepth);
    };
  } else {
    return function() {
      // Call the native function after marshalling parameters:
      var nativeArgs = [];
      for (var i = 0; i < arguments.length; i++) {
        nativeArgs[i] = exports.marshalInterpreterToNative(opts.interpreter, arguments[i]);
      }
      var nativeRetVal = opts.nativeFunc.apply(opts.nativeParentObj, nativeArgs);
      return exports.marshalNativeToInterpreter(opts.interpreter, nativeRetVal,
        null, opts.maxDepth);
    };
  }
};

function populateFunctionsIntoScope(interpreter, scope, funcsObj, parentObj) {
  for (var prop in funcsObj) {
    var func = funcsObj[prop];
    if (func instanceof Function) {
      // Populate the scope with native functions
      // NOTE: other properties are not currently passed to the interpreter
      var parent = parentObj ? parentObj : funcsObj;
      var wrapper = exports.makeNativeMemberFunction({
          interpreter: interpreter,
          nativeFunc: func,
          nativeParentObj: parent,
      });
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
      var wrapper = exports.makeNativeMemberFunction({
          interpreter: interpreter,
          nativeFunc: func,
          nativeParentObj: block.parent,
          dontMarshal: block.dontMarshal
      });
      interpreter.setProperty(funcScope,
                              funcName,
                              interpreter.createNativeFunction(wrapper));
    }
  }
}

function populateJSFunctions(interpreter) {
  // The interpreter is missing some basic JS functions. Add them as needed:
  var wrapper;

  // Add static methods from String:
  var functions = ['fromCharCode'];
  for (var i = 0; i < functions.length; i++) {
    wrapper = exports.makeNativeMemberFunction({
      interpreter: interpreter,
      nativeFunc: String[functions[i]],
      nativeParentObj: String,
    });
    interpreter.setProperty(interpreter.STRING, functions[i],
      interpreter.createNativeFunction(wrapper), false, true);
  }

  // Add String.prototype.includes
  wrapper = function(searchStr) {
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
 * options (optional): objects containing functions to placed in a new scope
 *  created beneath the supplied scope.
 */
exports.initJSInterpreter = function (interpreter, blocks, blockFilter, scope, options) {
  for (var optsObj in options) {
    // The options object contains objects that will be referenced
    // by the code we plan to execute. Since these objects exist in the native
    // world, we need to create associated objects in the interpreter's world
    // so the interpreted code can call out to these native objects

    // Create global objects in the interpreter for everything in options
    var obj = interpreter.createObject(interpreter.OBJECT);
    interpreter.setProperty(scope, optsObj.toString(), obj);
    populateFunctionsIntoScope(interpreter, obj, options[optsObj]);
  }
  populateGlobalFunctions(
      interpreter,
      dropletUtils.dropletGlobalConfigBlocks,
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
  var state = interpreter.stateStack[0];
  var type = state.node.type;
  if (state.done) {
    return true;
  }
  if (type === "ForStatement") {
    var mode = state.mode || 0;
    // Safe to skip over ForStatement's in mode 0 (init) and 3 (update),
    // but not mode 1 (test) or mode 2 (body) while unwinding...
    return mode === 0 || mode === 3;
  }
  if (type === "SwitchStatement") {
    // Safe to skip over SwitchStatement's except the very start (before a
    // switchValue has been set):
    return typeof state.switchValue !== 'undefined';
  }
  switch (type) {
    // Declarations:
    case "VariableDeclaration":
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
  return false;
};

// session is an instance of Ace editSession
// Usage
// var lengthArray = aceCalculateCumulativeLength(editor.getSession());
// Need to call this only if the document is updated after the last call.
exports.aceCalculateCumulativeLength = function (session) {
  var cumulativeLength = [];
  var cnt = session.getLength();
  var cuml = 0, nlLength = session.getDocument().getNewLineCharacter().length;
  cumulativeLength.push(cuml);
  var text = session.getLines(0, cnt);
  for (var i = 0; i < cnt; i++) {
    cuml += text[i].length + nlLength;
    cumulativeLength.push(cuml);
  }
  return cumulativeLength;
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
  } else if(pos > cumulativeLength[mid]) {
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
function clearAllHighlightedAceLines (aceEditor) {
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
function highlightAceLines (aceEditor, className, startRow, endRow) {
  var session = aceEditor.getSession();
  className = className || 'ace_step';
  if (lastHighlightMarkerIds[className]) {
    session.removeMarker(lastHighlightMarkerIds[className]);
    lastHighlightMarkerIds[className] = null;
  }
  if (typeof startRow !== 'undefined') {
    lastHighlightMarkerIds[className] = aceEditor.getSession().highlightLines(
        startRow, endRow, className).id;
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
  highlightAceLines(editor.aceEditor, "ace_error", row, row);
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

function selectAndHighlightCode (aceEditor, cumulativeLength, start, end, highlightClass) {
  var selection = aceEditor.getSelection();
  var range = selection.getRange();

  range.start.row = exports.aceFindRow(cumulativeLength, 0, cumulativeLength.length, start);
  range.start.column = start - cumulativeLength[range.start.row];
  range.end.row = exports.aceFindRow(cumulativeLength, 0, cumulativeLength.length, end);
  range.end.column = end - cumulativeLength[range.end.row];

  // calling with the backwards parameter set to true - this prevents horizontal
  // scrolling to the right while stepping through in the debugger
  selection.setSelectionRange(range, true);
  highlightAceLines(aceEditor, highlightClass || "ace_step", range.start.row,
      range.end.row);
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
  if (interpreter.stateStack[0]) {
    var node = interpreter.stateStack[0].node;
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
        // NOTE: replace markLine with this new mark() call once we have a new
        // version of droplet

        //editor.mark(userCodeRow, start - cumulativeLength[userCodeRow], style);
        editor.markLine(userCodeRow, style);
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
