var utils = require('./utils');

exports.randomNumber = function (min, max) {
  if (typeof max === 'undefined') {
    // If only one parameter is specified, use it as the max with zero as min:
    max = min;
    min = 0;
  }
  // Use double-tilde to ensure we are dealing with integers:
  return Math.floor(Math.random() * (~~max - ~~min + 1)) + ~~min;
};

exports.dropletGlobalConfigBlocks = [
  {'func': 'randomNumber', 'parent': exports, 'category': 'Math', 'type': 'value' },
  {'func': 'prompt', 'parent': window, 'category': 'Variables', 'type': 'value' },
];

exports.dropletBuiltinConfigBlocks = [
  {'func': 'Math.round', 'category': 'Math', 'type': 'value' },
  {'func': 'Math.abs', 'category': 'Math', 'type': 'value' },
  {'func': 'Math.max', 'category': 'Math', 'type': 'value' },
  {'func': 'Math.min', 'category': 'Math', 'type': 'value' },
];

var standardConfig = {};

standardConfig.blocks = [
  // Control
  {'func': 'forLoop_i_0_4', 'block': 'for (var i = 0; i < 4; i++) {\n  __;\n}', 'title': 'Do something multiple times', 'category': 'Control' },
  {'func': 'ifBlock', 'block': 'if (__) {\n  __;\n}', 'title': 'Do something only if a condition is true', 'category': 'Control' },
  {'func': 'ifElseBlock', 'block': 'if (__) {\n  __;\n} else {\n  __;\n}', 'title': 'Do something if a condition is true, otherwise do something else', 'category': 'Control' },
  {'func': 'whileBlock', 'block': 'while (__) {\n  __;\n}', 'title': 'Repeat something while a condition is true', 'category': 'Control' },

  // Math
  {'func': 'addOperator', 'block': '__ + __', 'title': 'Add two numbers', 'category': 'Math' },
  {'func': 'subtractOperator', 'block': '__ - __', 'title': 'Subtract two numbers', 'category': 'Math' },
  {'func': 'multiplyOperator', 'block': '__ * __', 'title': 'Multiply two numbers', 'category': 'Math' },
  {'func': 'divideOperator', 'block': '__ / __', 'title': 'Divide two numbers', 'category': 'Math' },
  {'func': 'equalityOperator', 'block': '__ == __', 'title': 'Test for equality', 'category': 'Math' },
  {'func': 'inequalityOperator', 'block': '__ != __', 'title': 'Test for inequality', 'category': 'Math' },
  {'func': 'greaterThanOperator', 'block': '__ > __', 'title': 'Compare two numbers', 'category': 'Math' },
  {'func': 'lessThanOperator', 'block': '__ < __', 'title': 'Compare two numbers', 'category': 'Math' },
  {'func': 'andOperator', 'block': '__ && __', 'title': 'Logical AND of two booleans', 'category': 'Math' },
  {'func': 'orOperator', 'block': '__ || __', 'title': 'Logical OR of two booleans', 'category': 'Math' },
  {'func': 'notOperator', 'block': '!__', 'title': 'Logical NOT of a boolean', 'category': 'Math' },
  {'func': 'randomNumber_max', 'block': 'randomNumber(__)', 'title': 'Get a random number between 0 and the specified maximum value', 'category': 'Math' },
  {'func': 'randomNumber_min_max', 'block': 'randomNumber(__, __)', 'title': 'Get a random number between the specified minimum and maximum values', 'category': 'Math' },
  {'func': 'mathRound', 'block': 'Math.round(__)', 'title': 'Round to the nearest integer', 'category': 'Math' },
  {'func': 'mathAbs', 'block': 'Math.abs(__)', 'title': 'Absolute value', 'category': 'Math' },
  {'func': 'mathMax', 'block': 'Math.max(__)', 'title': 'Maximum value', 'category': 'Math' },
  {'func': 'mathMin', 'block': 'Math.min(__)', 'title': 'Minimum value', 'category': 'Math' },

  // Variables
  {'func': 'declareAssign_x', 'block': 'var x = __;', 'title': 'Create a variable for the first time', 'category': 'Variables' },
  {'func': 'assign_x', 'block': 'x = __;', 'title': 'Reassign a variable', 'category': 'Variables' },
  {'func': 'declareAssign_x_array_1_4', 'block': 'var x = [1, 2, 3, 4];', 'title': 'Create a variable and initialize it as an array', 'category': 'Variables' },
  {'func': 'declareAssign_x_prompt', 'block': 'var x = prompt("Enter a value");', 'title': 'Create a variable and assign it a value by displaying a prompt', 'category': 'Variables' },

  // Functions
  {'func': 'functionParams_none', 'block': 'function myFunction() {\n  __;\n}', 'title': 'Create a function without an argument', 'category': 'Functions' },
  {'func': 'functionParams_n', 'block': 'function myFunction(n) {\n  __;\n}', 'title': 'Create a function with an argument', 'category': 'Functions' },
  {'func': 'callMyFunction', 'block': 'myFunction()', 'title': 'Use a function without an argument', 'category': 'Functions' },
  {'func': 'callMyFunction_n', 'block': 'function myFunction(n) {\n  __;\n}', 'title': 'Use a function with argument', 'category': 'Functions' },
];

standardConfig.categories = {
  'Control': {
    'color': 'orange',
    'blocks': []
  },
  'Math': {
    'color': 'green',
    'blocks': []
  },
  'Variables': {
    'color': 'blue',
    'blocks': []
  },
  'Functions': {
    'color': 'violet',
    'blocks': []
  },
};


function mergeFunctionsWithConfig(codeFunctions, dropletConfig) {
  var merged = [];

  if (codeFunctions && dropletConfig && dropletConfig.blocks) {
    var blockSets = [ standardConfig.blocks, dropletConfig.blocks ];
    // codeFunctions is an object with named key/value pairs
    //  key is a block name from dropletBlocks or standardBlocks
    //  value is an object that can be used to override block defaults
    for (var s = 0; s < blockSets.length; s++) {
      var blocks = blockSets[s];
      for (var i = 0; i < blocks.length; i++) {
        var block = blocks[i];
        if (blocks[i].func in codeFunctions) {
          // We found this particular block, now override the defaults with extend
          merged.push(utils.extend(blocks[i], codeFunctions[blocks[i].func]));
        }
      }
    }
  }
  return merged;
}

//
// Return a new categories object with the categories from dropletConfig
// merged with the ones in standardConfig
//

function mergeCategoriesWithConfig(dropletConfig) {
  var merged = {};

  if (dropletConfig && dropletConfig.categories) {
    var categorySets = [ dropletConfig.categories, standardConfig.categories ];
    for (var s = 0; s < categorySets.length; s++) {
      var categories = categorySets[s];
      for (var catName in categories) {
        if (!(catName in merged)) {
          merged[catName] = utils.shallowCopy(categories[catName]);
        }
      }
    }
  } else {
    merged = standardConfig.categories;
  }
  return merged;
}

/**
 * Generate code aliases in Javascript based on some level data.
 */
exports.generateCodeAliases = function (dropletConfig, parentObjName) {
  var code = '';
  var aliasFunctions = dropletConfig.blocks;

  // Insert aliases from aliasFunctions into code
  for (var i = 0; i < aliasFunctions.length; i++) {
    var cf = aliasFunctions[i];
    if (cf.dontAlias) {
      continue;
    }
    code += "var " + cf.func + " = function() { ";
    if (cf.idArgNone) {
      code += "return " + parentObjName + "." + cf.func + ".apply(" +
              parentObjName + ", arguments); };\n";
    } else {
      code += "var newArgs = " +
        (cf.idArgLast ? "arguments.concat(['']);" : "[''].concat(arguments);") +
        " return " + parentObjName + "." + cf.func +
        ".apply(" + parentObjName + ", newArgs); };\n";
    }
  }
  return code;
};

/**
 * Generate a palette for the droplet editor based on some level data.
 */
exports.generateDropletPalette = function (codeFunctions, dropletConfig) {
  var mergedCategories = mergeCategoriesWithConfig(dropletConfig);
  var mergedFunctions = mergeFunctionsWithConfig(codeFunctions, dropletConfig);
  var i, j;

  for (i = 0; i < mergedFunctions.length; i++) {
    var cf = mergedFunctions[i];
    var block = cf.block;
    if (!block) {
      block = cf.func + "(";
      if (cf.params) {
        for (j = 0; j < cf.params.length; j++) {
          if (j !== 0) {
            block += ", ";
          }
          block += cf.params[j];
        }
      }
      block += ")";
    }
    var blockPair = {
      block: block,
      title: cf.title || cf.func
    };
    mergedCategories[cf.category].blocks.push(blockPair);
  }

  // Convert to droplet's expected palette format:
  var addedPalette = [];
  for (var category in mergedCategories) {
    if (mergedCategories[category].blocks.length > 0) {
      mergedCategories[category].name = category;
      addedPalette.push(mergedCategories[category]);
    }
  }

  return addedPalette;
};

function populateCompleterApisFromConfigBlocks(apis, configBlocks) {
  for (var i = 0; i < configBlocks.length; i++) {
    var cf = configBlocks[i];
    apis.push({
      name: 'api',
      value: cf.func,
      meta: cf.category
    });
  }
}

/**
 * Generate an Ace editor completer for a set of APIs based on some level data.
 */
exports.generateAceApiCompleter = function (dropletConfig) {
  var apis = [];

  populateCompleterApisFromConfigBlocks(apis, exports.dropletGlobalConfigBlocks);
  populateCompleterApisFromConfigBlocks(apis, exports.dropletBuiltinConfigBlocks);
  populateCompleterApisFromConfigBlocks(apis, dropletConfig.blocks);

  return {
    getCompletions: function(editor, session, pos, prefix, callback) {
      if (prefix.length === 0) {
        callback(null, []);
        return;
      }
      callback(null, apis);
    }
  };
};

function populateModeOptionsFromConfigBlocks(modeOptions, configBlocks) {
  for (var i = 0; i < configBlocks.length; i++) {
    if (configBlocks[i].type === 'value') {
      modeOptions.valueFunctions.push(configBlocks[i].func);
    }
    else if (configBlocks[i].type === 'either') {
      modeOptions.eitherFunctions.push(configBlocks[i].func);
    }
    else if (configBlocks[i].type !== 'hidden') {
      modeOptions.blockFunctions.push(configBlocks[i].func);
    }
  }
}

/**
 * Generate modeOptions for the droplet editor based on some level data.
 */
exports.generateDropletModeOptions = function (dropletConfig) {
  var modeOptions = {
    blockFunctions: [],
    valueFunctions: [],
    eitherFunctions: [],
  };

  // BLOCK, VALUE, and EITHER functions that are normally used in droplet
  // are included here in comments for reference. When we return our own
  // modeOptions from this function, it overrides and replaces the list below.
/*
  BLOCK_FUNCTIONS = ['fd', 'bk', 'rt', 'lt', 'slide', 'movexy', 'moveto', 'jump', 'jumpto', 'turnto', 'home', 'pen', 'fill', 'dot', 'box', 'mirror', 'twist', 'scale', 'pause', 'st', 'ht', 'cs', 'cg', 'ct', 'pu', 'pd', 'pe', 'pf', 'play', 'tone', 'silence', 'speed', 'wear', 'write', 'drawon', 'label', 'reload', 'see', 'sync', 'send', 'recv', 'click', 'mousemove', 'mouseup', 'mousedown', 'keyup', 'keydown', 'keypress', 'alert'];
  VALUE_FUNCTIONS = ['abs', 'acos', 'asin', 'atan', 'atan2', 'cos', 'sin', 'tan', 'ceil', 'floor', 'round', 'exp', 'ln', 'log10', 'pow', 'sqrt', 'max', 'min', 'random', 'pagexy', 'getxy', 'direction', 'distance', 'shown', 'hidden', 'inside', 'touches', 'within', 'notwithin', 'nearest', 'pressed', 'canvas', 'hsl', 'hsla', 'rgb', 'rgba', 'cell'];
  EITHER_FUNCTIONS = ['button', 'read', 'readstr', 'readnum', 'table', 'append', 'finish', 'loadscript'];
*/

  populateModeOptionsFromConfigBlocks(modeOptions, exports.dropletGlobalConfigBlocks);
  populateModeOptionsFromConfigBlocks(modeOptions, exports.dropletBuiltinConfigBlocks);
  populateModeOptionsFromConfigBlocks(modeOptions, dropletConfig.blocks);

  return modeOptions;
};

