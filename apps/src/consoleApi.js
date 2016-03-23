var codegen = require('./codegen');
var vsprintf = require('sprintf-js').vsprintf;

var consoleApi = module.exports;
var logMethod = function () {};

consoleApi.setLogMethod = function (newLogMethod) {
  logMethod = newLogMethod;
};

consoleApi.log = function() {
  var nativeArgs = arguments;
  var output = '';
  var firstArg = nativeArgs[0];
  if (nativeArgs.length === 1) {
    output = firstArg;
  } else if (typeof firstArg === 'string' || firstArg instanceof String) {
    output = vsprintf(firstArg, Array.prototype.slice.call(nativeArgs, 1));
  } else {
    for (var i = 0; i < nativeArgs.length; i++) {
      output += JSON.stringify(nativeArgs[i]);
      if (i < nativeArgs.length - 1) {
        output += '\n';
      }
    }
  }
  logMethod(output);
};
