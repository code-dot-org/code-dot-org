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
    .replace(/(BlocklyApps|Maze|Turtle)\./g, '')
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

exports.marshalNativeToInterpreter = function (interpreter, nativeVar, nativeParentObj, maxDepth) {
  var retVal;
  if (typeof maxDepth === "undefined") {
    maxDepth = Infinity; // default to inifinite levels of depth
  }
  if (maxDepth === 0) {
    return interpreter.createPrimitive(undefined);
  }
  if (nativeVar instanceof Array) {
    retVal = interpreter.createObject(interpreter.ARRAY);
    for (var i = 0; i < nativeVar.length; i++) {
      retVal.properties[i] = exports.marshalNativeToInterpreter(interpreter,
                                                                nativeVar[i],
                                                                null,
                                                                maxDepth - 1);
    }
    retVal.length = nativeVar.length;
  } else if (nativeVar instanceof Function) {
    wrapper = exports.makeNativeMemberFunction(interpreter, nativeVar, nativeParentObj);
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
      retVal = interpreter.createObject(interpreter.OBJECT);
      for (var prop in nativeVar) {
        var value;
        try {
          value = nativeVar[prop];
        } catch (e) { }
        interpreter.setProperty(retVal,
                                prop,
                                exports.marshalNativeToInterpreter(interpreter,
                                                                   value,
                                                                   nativeVar,
                                                                   maxDepth - 1));
      }
    }
  } else {
    retVal = interpreter.createPrimitive(nativeVar);
  }
  return retVal;
};

exports.marshalInterpreterToNative = function (interpreterVar) {
  if (interpreterVar.isPrimitive) {
    return interpreterVar.data;
  } else if (Webapp.interpreter.isa(interpreterVar, Webapp.interpreter.ARRAY)) {
    var nativeArray = [];
    nativeArray.length = interpreterVar.length;
    for (var i = 0; i < nativeArray.length; i++) {
      nativeArray[i] = exports.marshalInterpreterToNative(interpreterVar.properties[i]);
    }
    return nativeArray;
  } else if (Webapp.interpreter.isa(interpreterVar, Webapp.interpreter.OBJECT)) {
    var nativeObject = {};
    for (var prop in interpreterVar.properties) {
      nativeObject[prop] = exports.marshalInterpreterToNative(interpreterVar.properties[prop]);
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
exports.makeNativeMemberFunction = function (interpreter, nativeFunc, nativeParentObj, maxDepth) {
  return function() {
    // Call the native function:
    var nativeArgs = [];
    for (var i = 0; i < arguments.length; i++) {
      nativeArgs[i] = exports.marshalInterpreterToNative(arguments[i]);
    }
    var nativeRetVal = nativeFunc.apply(nativeParentObj, nativeArgs);
    return exports.marshalNativeToInterpreter(interpreter, nativeRetVal, null, maxDepth);
  };
};

/**
 * Initialize a JS interpreter.
 */
exports.initJSInterpreter = function (interpreter, scope, options) {
  for (var optsObj in options) {
    var func, wrapper;
    // The options object contains objects that will be referenced
    // by the code we plan to execute. Since these objects exist in the native
    // world, we need to create associated objects in the interpreter's world
    // so the interpreted code can call out to these native objects

    // Create global objects in the interpreter for everything in options
    var obj = interpreter.createObject(interpreter.OBJECT);
    interpreter.setProperty(scope, optsObj.toString(), obj);
    for (var prop in options[optsObj]) {
      func = options[optsObj][prop];
      if (func instanceof Function) {
        // Populate each of the global objects with native functions
        // NOTE: other properties are not currently passed to the interpreter
        wrapper = exports.makeNativeMemberFunction(interpreter, func, options[optsObj]);
        interpreter.setProperty(obj,
                                prop,
                                interpreter.createNativeFunction(wrapper));
      }
    }
  }
};

/**
 * Check to see if it is safe to step the interpreter while we are unwinding.
 * (Called repeatedly after completing a step where the node was marked 'done')
 */
exports.isNextStepSafeWhileUnwinding = function (interpreter) {
  var state = interpreter.stateStack[0];
  if (state.done) {
    return true;
  }
  switch (state.node.type) {
    case "VariableDeclaration":
    case "BlockStatement":
    case "ForStatement": // check for state.mode ?
    case "UpdateExpression":
    case "BinaryExpression":
    case "CallExpression":
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
function aceFindRow(cumulativeLength, rows, rowe, pos) {
  if (rows > rowe) {
    return null;
  }
  if (rows + 1 === rowe) {
    return rows;
  }

  var mid = Math.floor((rows + rowe) / 2);
  
  if (pos < cumulativeLength[mid]) {
    return aceFindRow(cumulativeLength, rows, mid, pos);
  } else if(pos > cumulativeLength[mid]) {
    return aceFindRow(cumulativeLength, mid, rowe, pos);
  }
  return mid;
}

exports.isAceBreakpointRow = function (session, userCodeRow) {
  var bps = session.getBreakpoints();
  return Boolean(bps[userCodeRow]);
};

function createSelection (selection, cumulativeLength, start, end) {
  var range = selection.getRange();

  range.start.row = aceFindRow(cumulativeLength, 0, cumulativeLength.length, start);
  range.start.col = start - cumulativeLength[range.start.row];
  range.end.row = aceFindRow(cumulativeLength, 0, cumulativeLength.length, end);
  range.end.col = end - cumulativeLength[range.end.row];

  selection.setSelectionRange(range);
}

/**
 * Selects code in droplet/ace editor.
 *
 * Returns the row (line) of code highlighted. If nothing is highlighted
 * because it is outside of the userCode area, the return value is -1
 */
exports.selectCurrentCode = function (interpreter, editor, cumulativeLength,
                                      userCodeStartOffset, userCodeLength) {
  var userCodeRow = -1;
  if (interpreter.stateStack[0]) {
    var node = interpreter.stateStack[0].node;
    // Adjust start/end by Webapp.userCodeStartOffset since the code running
    // has been expanded vs. what the user sees in the editor window:
    var start = node.start - userCodeStartOffset;
    var end = node.end - userCodeStartOffset;

    // Only show selection if the node being executed is inside the user's
    // code (not inside code we inserted before or after their code that is
    // not visible in the editor):
    if (start >= 0 && start < userCodeLength) {
      userCodeRow = aceFindRow(cumulativeLength, 0, cumulativeLength.length, start);
      // Highlight the code being executed in each step:
      if (editor.currentlyUsingBlocks) {
        var style = {color: '#FFFF22'};
        editor.clearLineMarks();
        // NOTE: replace markLine with this new mark() call once we have a new
        // version of droplet
        
        // editor.mark(userCodeRow, start - cumulativeLength[userCodeRow], style);
        editor.markLine(userCodeRow, style);
      } else {
        var selection = editor.aceEditor.getSelection();
        createSelection(selection, cumulativeLength, start, end);
      }
    }
  } else {
    if (editor.currentlyUsingBlocks) {
      editor.clearLineMarks();
    } else {
      editor.aceEditor.getSelection().clearSelection();
    }
  }
  return userCodeRow;
};

/**
 * Evaluates a string of code parameterized with a dictionary.
 */
exports.evalWith = function(code, options) {
  if (options.BlocklyApps && options.BlocklyApps.editCode) {
    // Use JS interpreter on editCode levels
    var initFunc = function(interpreter, scope) {
      exports.initJSInterpreter(interpreter, scope, options);
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
  if (options.BlocklyApps && options.BlocklyApps.editCode) {
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
