var xml = require('./xml');
var savedAmd;
/**
 * Special functions for pulling in lodash to avoid node/requirejs issue.
 */
exports.pre_lodash_require = function() {
  if (typeof define == 'function' && typeof define.amd == 'object' && define.amd) {
    savedAmd = define.amd;
    define.amd = 'dont_call_requirejs_define';
  }
};

exports.post_lodash_require = function() {
  if (typeof define == 'function' && savedAmd) {
    define.amd = savedAmd;
    savedAmd = null;
  }
};

exports.pre_lodash_require();
var _ = require('./lodash');
exports.post_lodash_require();

exports.shallowCopy = function(source) {
  var result = {};
  for (var prop in source) {
    result[prop] = source[prop];
  }

  return result;
};

/**
 * Returns a clone of the object, stripping any functions on it.
 */
exports.cloneWithoutFunctions = function(object) {
  return JSON.parse(JSON.stringify(object));
};

/**
 * Returns a new object with the properties from defaults overriden by any
 * properties in options. Leaves defaults and options unchanged.
 */
exports.extend = function(defaults, options) {
  var finalOptions = exports.shallowCopy(defaults);
  for (var prop in options) {
    finalOptions[prop] = options[prop];
  }

  return finalOptions;
};

exports.escapeHtml = function(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

/**
 * Version of modulo which, unlike javascript's `%` operator,
 * will always return a positive remainder.
 * @param number
 * @param mod
 */
exports.mod = function(number, mod) {
  return ((number % mod) + mod) % mod;
};

/**
 * Generates an array of integers from start to end inclusive
 */
exports.range = function(start, end) {
  var ints = [];
  for (var i = start; i <= end; i++) {
    ints.push(i);
  }
  return ints;
};

/**
 * Given two functions, generates a function that returns the result of the
 * second function if and only if the first function returns true
 */
exports.executeIfConditional = function (conditional, fn) {
  return function () {
    if (conditional()) {
      return fn.apply(this, arguments);
    }
  };
};

/**
 * Removes all single and double quotes from a string
 * @param inputString
 * @returns {string} string without quotes
 */
exports.stripQuotes = function(inputString) {
  return inputString.replace(/["']/g, "");
};

/**
 * Defines an inheritance relationship between parent class and this class.
 */
Function.prototype.inherits = function (parent) {
  this.prototype = _.create(parent.prototype, { constructor: parent });
};

/**
 * Wrap a couple of our Blockly number validators to allow for ???.  This is
 * done so that level builders can specify required blocks with wildcard fields.
 */
exports.wrapNumberValidatorsForLevelBuilder = function () {
  var nonNeg = Blockly.FieldTextInput.nonnegativeIntegerValidator;
  var numVal = Blockly.FieldTextInput.numberValidator;

  Blockly.FieldTextInput.nonnegativeIntegerValidator = function (text) {
    if (text === '???') {
      return text;
    }
    return nonNeg(text);
  };

  Blockly.FieldTextInput.numberValidator = function (text) {
    if (text === '???') {
      return text;
    }
    return numVal(text);
  };
};

/**
 * Generate code aliases in Javascript based on some level data.
 */
exports.generateCodeAliases = function (codeFunctions) {
  var code = '';
  // Insert aliases from level codeBlocks into code
  if (codeFunctions) {
    for (var i = 0; i < codeFunctions.length; i++) {
      var codeFunction = codeFunctions[i];
      if (codeFunction.alias) {
        code += codeFunction.func +
            " = function() { " + codeFunction.alias + " };\n";
      }
    }
  }
  return code;
};

/**
 * Generate a palette for the droplet editor based on some level data.
 */
exports.generateDropletPalette = function (codeFunctions) {
  // TODO: figure out localization for droplet scenario
  var palette = [
    {
      name: 'Control',
      color: 'orange',
      blocks: [
        {
          block: 'for (var i = 0; i < 4; i++) {\n  __;\n}',
          title: 'Do something multiple times'
        }, {
          block: 'if (__) {\n  __;\n}',
          title: 'Do something only if a condition is true'
        }, {
          block: 'if (__) {\n  __;\n} else {\n  __;\n}',
          title: 'Do something if a condition is true, otherwise do something else'
        }, {
          block: 'while (__) {\n  __;\n}',
          title: 'Repeat something while a condition is true'
        }
      ]
    }, {
      name: 'Math',
      color: 'green',
      blocks: [
        {
          block: 'var x = __;',
          title: 'Create a variable for the first time'
        }, {
          block: 'x = __;',
          title: 'Reassign a variable'
        }, {
          block: '__ + __',
          title: 'Add two numbers'
        }, {
          block: '__ - __',
          title: 'Subtract two numbers'
        }, {
          block: '__ * __',
          title: 'Multiply two numbers'
        }, {
          block: '__ / __',
          title: 'Divide two numbers'
        }, {
          block: '__ === __',
          title: 'Compare two numbers'
        }, {
          block: '__ > __',
          title: 'Compare two numbers'
        }, {
          block: '__ < __',
          title: 'Compare two numbers'
        }, {
          block: 'random(1, 100)',
          title: 'Get a random number in a range'
        }, {
          block: 'round(__)',
          title: 'Round to the nearest integer'
        }, {
          block: 'abs(__)',
          title: 'Absolute value'
        }, {
          block: 'max(__, __)',
          title: 'Absolute value'
        }, {
          block: 'min(__, __)',
          title: 'Absolute value'
        }
      ]
    }, {
      name: 'Functions',
      color: 'violet',
      blocks: [
        {
          block: 'function myFunction() {\n  __;\n}',
          title: 'Create a function without an argument'
        }, {
          block: 'function myFunction(n) {\n  __;\n}',
          title: 'Create a function with an argument'
        }, {
          block: 'myFunction()',
          title: 'Use a function without an argument'
        }, {
          block: 'myFunction(n)',
          title: 'Use a function with argument'
        }
      ]
    }
  ];

  var appPaletteCategory = {
    name: 'Actions',
    color: 'blue',
    blocks: []
  };

  if (codeFunctions) {
    for (var i = 0; i < codeFunctions.length; i++) {
      var blockPair = {
        block: codeFunctions[i].func + "();",
        title: codeFunctions[i].alias
      };
      appPaletteCategory.blocks[i] = blockPair;
    }
  }

  palette.unshift(appPaletteCategory);

  return palette;
};
