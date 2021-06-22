import {dropletGlobalConfigBlocks} from '../../../dropletUtils';
import * as utils from '../../../utils';

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

//
// Blockly specific codegen functions:
//

var INFINITE_LOOP_TRAP =
  '  executionInfo.checkTimeout(); if (executionInfo.isTerminated()){return;}\n';

var LOOP_HIGHLIGHT = 'loopHighlight();\n';
var LOOP_HIGHLIGHT_RE = new RegExp(
  LOOP_HIGHLIGHT.replace(/\(.*\)/, '\\(.*\\)') + '\\s*',
  'g'
);

/**
 * Returns javascript code to call a timeout check
 */
exports.loopTrap = function() {
  return INFINITE_LOOP_TRAP;
};

exports.loopHighlight = function(apiName, blockId) {
  var args = "'block_id_" + blockId + "'";
  if (blockId === undefined) {
    args = '%1';
  }
  return '  ' + apiName + '.' + LOOP_HIGHLIGHT.replace('()', '(' + args + ')');
};

/**
 * Extract the user's code as raw JavaScript.
 * @param {string} code Generated code.
 * @return {string} The code without serial numbers and timeout checks.
 */
exports.strip = function(code) {
  return (
    code
      // Strip out serial numbers.
      .replace(/(,\s*)?'block_id_\d+'\)/g, ')')
      // Remove timeouts.
      .replace(new RegExp(utils.escapeRegExp(INFINITE_LOOP_TRAP), 'g'), '')
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

function populateFunctionsIntoScope(
  interpreter,
  scope,
  funcsObj,
  parentObj,
  options
) {
  for (var prop in funcsObj) {
    var func = funcsObj[prop];
    if (func instanceof Function) {
      // Populate the scope with native functions
      // NOTE: other properties are not currently passed to the interpreter
      var parent = parentObj ? parentObj : funcsObj;
      var wrapper = interpreter.makeNativeMemberFunction(
        utils.extend(options, {
          nativeFunc: func,
          nativeParentObj: parent
        })
      );
      interpreter.setProperty(
        scope,
        prop,
        interpreter.createNativeFunction(wrapper)
      );
    }
  }
}

function populateGlobalFunctions(interpreter, blocks, blockFilter, scope) {
  for (var i = 0; i < blocks.length; i++) {
    var block = blocks[i];
    if (
      block.parent &&
      (!blockFilter || typeof blockFilter[block.func] !== 'undefined')
    ) {
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
      const {dontMarshal, nativeIsAsync, nativeCallsBackInterpreter} = block;
      var wrapper = interpreter.makeNativeMemberFunction({
        nativeFunc: func,
        nativeParentObj: block.parent,
        dontMarshal,
        nativeIsAsync,
        nativeCallsBackInterpreter
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
  var wrapper = function(searchStr) {
    // Polyfill based off of https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/includes
    return interpreter.createPrimitive(
      String.prototype.indexOf.apply(this, arguments) !== -1
    );
  };
  interpreter.setProperty(
    interpreter.STRING.properties.prototype,
    'includes',
    interpreter.createNativeFunction(wrapper),
    false,
    true
  );
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
exports.initJSInterpreter = function(
  interpreter,
  blocks,
  blockFilter,
  scope,
  globalObjects
) {
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
      {maxDepth: 2}
    );
  }
  populateGlobalFunctions(
    interpreter,
    dropletGlobalConfigBlocks,
    blockFilter,
    scope
  );
  if (blocks) {
    populateGlobalFunctions(interpreter, blocks, blockFilter, scope);
  }
  populateJSFunctions(interpreter);
};

/**
 * Check to see if it is safe to step the interpreter while we are unwinding.
 * (Called repeatedly after completing a step where the node was marked 'done')
 */
exports.isNextStepSafeWhileUnwinding = function(interpreter) {
  var state = interpreter.peekStackFrame();
  var type = state.node.type;
  if (state.done_) {
    return true;
  }
  if (type === 'SwitchStatement') {
    // Safe to skip over SwitchStatement's except the very start (before a
    // switchValue has been set):
    return typeof state.switchValue_ !== 'undefined';
  }
  if (type === 'VariableDeclaration') {
    // Only stop the first time this VariableDeclaration is processed (the
    // interpreter will stop on this node multiple times, but with different
    // `state.n` representing which VariableDeclarator is being executed).
    return state.n_ > 0;
  }
  /* eslint-disable no-fallthrough */
  switch (type) {
    // Declarations:
    case 'VariableDeclarator':
    // Statements:
    case 'BlockStatement':
    case 'BreakStatement':
    // All Expressions:
    case 'ThisExpression':
    case 'ArrayExpression':
    case 'ObjectExpression':
    case 'ArrowExpression':
    case 'SequenceExpression':
    case 'UnaryExpression':
    case 'BinaryExpression':
    case 'UpdateExpression':
    case 'LogicalExpression':
    case 'ConditionalExpression':
    case 'NewExpression':
    case 'CallExpression':
    case 'MemberExpression':
    case 'FunctionExpression':
    case 'AssignmentExpression':
    // Other:
    case 'Identifier':
    case 'Literal':
    case 'Program':
      return true;
  }
  /* eslint-enable  no-fallthrough */
  return false;
};

// session is an instance of Ace editSession
// Usage
// var lengthArray = calculateCumulativeLength(editor.getSession());
// Need to call this only if the document is updated after the last call.
exports.calculateCumulativeLength = function(code) {
  var regex = /\n/g,
    result = [];
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
exports.aceFindRow = function(cumulativeLength, rows, rowe, pos) {
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

exports.isAceBreakpointRow = function(session, userCodeRow) {
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
function highlightAceLines(
  aceEditor,
  className,
  startRow,
  startColumn,
  endRow,
  endColumn
) {
  var session = aceEditor.getSession();
  className = className || 'ace_step';
  if (lastHighlightMarkerIds[className]) {
    session.removeMarker(lastHighlightMarkerIds[className]);
    lastHighlightMarkerIds[className] = null;
  }
  if (typeof startRow !== 'undefined') {
    lastHighlightMarkerIds[className] = session.addMarker(
      new (window.ace.require('ace/range')).Range(
        startRow,
        startColumn,
        endRow,
        endColumn
      ),
      className,
      'text'
    );
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
exports.selectEditorRowColError = function(editor, row, col) {
  if (!editor) {
    return;
  }
  if (editor.session && editor.session.currentlyUsingBlocks) {
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
  lastHighlightMarkerIds.ace_error = editor.aceEditor
    .getSession()
    .highlightLines(row, row, 'ace_error').id;
};

/**
 * Removes highlights (for the default ace_step class) and selection in
 * droplet and ace editors.
 *
 * @param {boolean} allClasses When set to true, remove all classes of
 * highlights (including ace_step, ace_error, and anything else)
 */
exports.clearDropletAceHighlighting = function(editor, allClasses) {
  if (editor.session && editor.session.currentlyUsingBlocks) {
    editor.clearLineMarks();
  }
  if (allClasses) {
    clearAllHighlightedAceLines(editor.aceEditor);
  } else {
    // when calling without a class or rows, highlightAceLines() will clear
    // everything highlighted with the default highlight class
    highlightAceLines(editor.aceEditor);
  }
};

function highlightCode(
  aceEditor,
  cumulativeLength,
  start,
  end,
  highlightClass
) {
  var selection = aceEditor.getSelection();
  var range = selection.getRange();

  range.start.row = exports.aceFindRow(
    cumulativeLength,
    0,
    cumulativeLength.length,
    start
  );
  range.start.column = start - cumulativeLength[range.start.row];
  range.end.row = exports.aceFindRow(
    cumulativeLength,
    0,
    cumulativeLength.length,
    end
  );
  range.end.column = end - cumulativeLength[range.end.row];

  highlightAceLines(
    aceEditor,
    highlightClass || 'ace_step',
    range.start.row,
    range.start.column,
    range.end.row,
    range.end.column
  );
}

/**
 * Selects code in droplet/ace editor.
 *
 * Returns the row (line) of code highlighted. If nothing is highlighted
 * because it is outside of the userCode area, the return value is -1
 *
 * @param {string} highlightClass CSS class to use when highlighting in ACE
 */
exports.selectCurrentCode = function(
  interpreter,
  cumulativeLength,
  userCodeStartOffset,
  userCodeLength,
  editor,
  highlightClass
) {
  var userCodeRow = -1;
  if (interpreter && interpreter.peekStackFrame()) {
    var node = interpreter.peekStackFrame().node;

    if (node.type === 'ForStatement') {
      var mode = interpreter.peekStackFrame().mode_ || 0,
        subNode;
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
        default:
          throw new Error('unknown mode', mode);
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
      userCodeRow = exports.aceFindRow(
        cumulativeLength,
        0,
        cumulativeLength.length,
        start
      );
      // Highlight the code being executed in each step:
      if (editor.session && editor.session.currentlyUsingBlocks) {
        var style = {color: '#FFFF22'};
        editor.clearLineMarks();
        editor.mark(
          {
            row: userCodeRow,
            col: start - cumulativeLength[userCodeRow],
            type: 'block'
          },
          style
        );
      } else {
        highlightCode(
          editor.aceEditor,
          cumulativeLength,
          start,
          end,
          highlightClass
        );
      }
    } else {
      exports.clearDropletAceHighlighting(editor);
    }
  } else {
    exports.clearDropletAceHighlighting(editor);
  }
  return userCodeRow;
};
