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
  return (removeJSNumbersCode(code)
    // Strip out serial numbers.
    .replace(/(,\s*)?'block_id_\d+'\)/g, ')')
    // Remove timeouts.
    .replace(INFINITE_LOOP_TRAP, '')
    // Strip out loop highlight.
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
  var code = blockly.Generator.workspaceToCode('JavaScript');
  return exports.strip(code);
};

/**
 * Evaluates a string of code parameterized with a dictionary.
 */
exports.evalWith = function(code, options) {
  if (options.BlocklyApps && options.BlocklyApps.editCode) {
    // Use JS interpreter on editCode levels
    var initFunc = function(interpreter, scope) {
      // helper function used below..
      function makeNativeMemberFunction(nativeFunc, parentObj) {
        return function() {
          return interpreter.createPrimitive(
                                nativeFunc.apply(parentObj, arguments));
        };
      }
      for (var optsObj in options) {
        // Create global objects in the interpreter for everything in options
        var obj = this.createObject(interpreter.OBJECT);
        this.setProperty(scope, optsObj.toString(), obj);
        for (var prop in options[optsObj]) {
          var func = options[optsObj][prop];
          if (func instanceof Function) {
            // Populate each of the global objects with native functions
            // NOTE: other properties are not passed to the interpreter
            var wrapper = makeNativeMemberFunction(func, options[optsObj]);
            interpreter.setProperty(obj,
                                    prop,
                                    interpreter.createNativeFunction(wrapper));
          }
        }
      }
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
    var fn = new ctor();
    return fn.apply(null, args);
  }
};

/**
 * Returns a function based on a string of code parameterized with a dictionary.
 */
exports.functionFromCode = function(code, options) {
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
};

/**
 * Removes js-numbers library calls from the given code string and returns the result.
 */
function removeJSNumbersCode(code) {
  var openParenStack = [];
  // These statements will be removed, along with their closing parenthesis.
  var statements = {
    'jsnums.ensureExact(' : '',
    '.add(' : '+',
    '.subtact(' : '-',
    '.multiply(' : '*',
    '.divide(' : '/'
  };
  // RegExp to split code on the statements listed above. Capture groups are used to keep split tokens.
  var tokenizeRegExp = new RegExp(Object.getOwnPropertyNames(statements).map(function (statement) {
    return '(' + statement.replace(/(\.|\(|\))/g, '\\$1') + ')';
  }).join('|') + '|(\()|(\))');

  // Tokenize, map individual statement & parenthsis tokens, then rejoin.
  return code.split(tokenizeRegExp).map(function (token) {
    if (token in statements) {
      // When the corresponding parenthesis is found, it should be removed.
      openParenStack.push('removed');
      return statements[token];
    }
    if (token === '(') {
      // When the corresponding parenthesis is found, it should be kept.
      openParenStack.push('kept');
    }
    if (token === ')') {
      // Pop 'removed' or 'kept' off the openParenStack and remove or keep the closing parenthesis.
      return openParenStack.pop() === 'removed' ? '' : ')';
    }
    return token;
  }).join('');
}
