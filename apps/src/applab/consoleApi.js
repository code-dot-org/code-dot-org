var codegen = require('../codegen');
var vsprintf = require('./sprintf').vsprintf;
var errorHandler = require('./errorHandler');
var outputApplabConsole = errorHandler.outputApplabConsole;

var consoleApi = module.exports;

consoleApi.log = function() {
  function argToString(arg) {
    if (typeof arg === 'string' || firstArg instanceof String) {
      return arg;
    } else {
      return JSON.stringify(arg);
    }
  }

  var nativeArgs = Array.prototype.map.call(arguments, function (item) {
    if (item === null || item === undefined) {
      return item;
    }
    return codegen.marshalInterpreterToNative(Applab.JSInterpreter.interpreter, item);
  });

  var output = '';
  var firstArg = nativeArgs[0];
  if (typeof firstArg === 'string' || firstArg instanceof String) {
    output = vsprintf(firstArg, nativeArgs.slice(1));
  } else if (nativeArgs.length === 1) {
    output = JSON.stringify(firstArg);
  } else {
    for (var i = 0; i < nativeArgs.length; i++) {
      output += argToString(nativeArgs[i]);
      if (i < nativeArgs.length - 1) {
        output += '\n';
      }
    }
  }
  outputApplabConsole(output);
};
