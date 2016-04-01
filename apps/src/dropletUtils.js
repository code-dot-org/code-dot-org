var utils = require('./utils');
var _ = utils.getLodash();

/**
 * @name DropletBlock
 * @description Definition of a block to be used in Droplet
 * @property {string} func identifying the function this block runs
 * @property {string} blockPrefix Prepend this string before the normal block name in the palette
 * @property {Object} parent object within which this function is defined as a property, keyed by the func name
 * @property {String} category category within which to place the block
 * @property {String} type type of the block (e.g. value, either, property, readonlyproperty)
 * @property {string[]} paletteParams
 * @property {string[]} params
 * @property {Object.<number, function>} dropdown
 * @property {Object.<number, function>} assetTooltip
 * @property {bool} dontMarshal API expects params in interpreter form and will return an interpreter value
 * @property {bool} noAutocomplete Do not include this function in our ace completer
 * @property {bool} nativeIsAsync The native function is internally async and will call a callback function to resume the interpreter
 * @property {string} tipPrefix Prepend this string before the tooltip formed from the function name and (optionally) parameters
 * @property {string} docFunc Use the provided func as the key for our documentation.
 * @property {string} modeOptionName Alternate name to be used when generating droplet mode options
 */

/**
 * @name DropletConfig
 * @description Configuration information for Droplet
 * @property {DropletBlock[]} blocks list of blocks
 * @property {Object} categories configuration of categories within which to place blocks
 */

var COLOR_PINK = '#F57AC6';
var COLOR_PURPLE = '#BB77C7';
var COLOR_GREEN = '#68D995';
var COLOR_LIGHT_GREEN = '#D3E965';
var COLOR_WHITE = '#FFFFFF';
var COLOR_BLUE = '#64B5F6';
var COLOR_ORANGE = '#FFB74D';

exports.randomNumber = function (min, max) {
  if (typeof max === 'undefined') {
    // If only one parameter is specified, use it as the max with zero as min:
    max = min;
    min = 0;
  }
  // Use double-tilde to ensure we are dealing with integers:
  return Math.floor(Math.random() * (~~max - ~~min + 1)) + ~~min;
};

exports.getTime = function () {
  return (new Date()).getTime();
};

/**
 * Use native window.prompt to ask for a value, but continue prompting until we
 * get a numerical value.
 * @returns {number} User value, converted to a number
 */
exports.promptNum = function (text) {
  var val;
  do {
    val = parseInt(window.prompt(text), 10);
  } while (isNaN(val));
  return val;
};

/**
 * @type {DropletBlock[]}
 */
exports.dropletGlobalConfigBlocks = [
  {func: 'getTime', parent: exports, category: 'Control', type: 'value'},
  {func: 'randomNumber', parent: exports, category: 'Math', type: 'value'},
  {func: 'prompt', parent: window, category: 'Variables', type: 'value'},
  {func: 'promptNum', parent: exports, category: 'Variables', type: 'value'}
];

/**
 * @type {DropletBlock[]}
 */
exports.dropletBuiltinConfigBlocks = [
  {func: 'Math.round', category: 'Math', type: 'value', docFunc: 'mathRound'},
  {func: 'Math.abs', category: 'Math', type: 'value', docFunc: 'mathAbs'},
  {func: 'Math.max', category: 'Math', type: 'value', docFunc: 'mathMax'},
  {func: 'Math.min', category: 'Math', type: 'value', docFunc: 'mathMin'},
  {func: 'Math.random', category: 'Math', type: 'value', docFunc: 'mathRandom'}
];

/**
 * @type {DropletConfig|*}}
 */
var standardConfig = {};

standardConfig.blocks = [
  // Control
  {func: 'forLoop_i_0_4', block: 'for (var i = 0; i < 4; i++) {\n  __;\n}', category: 'Control'},
  {func: 'whileBlock', block: 'while (__) {\n  __;\n}', category: 'Control'},
  {func: 'ifBlock', block: 'if (__) {\n  __;\n}', category: 'Control'},
  {func: 'ifElseBlock', block: 'if (__) {\n  __;\n} else {\n  __;\n}', category: 'Control'},
  {func: 'getTime', block: 'getTime()', category: 'Control', type: 'value'},

  // Math
  {func: 'addOperator', block: '__ + __', category: 'Math'},
  {func: 'subtractOperator', block: '__ - __', category: 'Math'},
  {func: 'multiplyOperator', block: '__ * __', category: 'Math'},
  {func: 'divideOperator', block: '__ / __', category: 'Math'},
  {func: 'equalityOperator', block: '__ == __', category: 'Math'},
  {func: 'inequalityOperator', block: '__ != __', category: 'Math'},
  {func: 'greaterThanOperator', block: '__ > __', category: 'Math'},
  {func: 'greaterThanOrEqualOperator', block: '__ >= __', category: 'Math'},
  {func: 'lessThanOperator', block: '__ < __', category: 'Math'},
  {func: 'lessThanOrEqualOperator', block: '__ <= __', category: 'Math'},
  {func: 'andOperator', block: '__ && __', category: 'Math'},
  {func: 'orOperator', block: '__ || __', category: 'Math'},
  {func: 'notOperator', block: '!__', category: 'Math'},
  // randomNumber_max has been deprecated
  // {func: 'randomNumber_max', block: 'randomNumber(__)', category: 'Math' },
  // Note: We use randomNumber as our base docFunc here so that we get the benefits of param descriptions
  {func: 'randomNumber_min_max', block: 'randomNumber(__, __)', category: 'Math', docFunc: 'randomNumber'},
  {func: 'mathRound', block: 'Math.round(__)', category: 'Math'},
  {func: 'mathAbs', block: 'Math.abs(__)', category: 'Math'},
  {func: 'mathMax', block: 'Math.max(__)', category: 'Math'},
  {func: 'mathMin', block: 'Math.min(__)', category: 'Math'},
  {func: 'mathRandom', block: 'Math.random()', category: 'Math'},

  // Variables
  {func: 'declareAssign_x', block: 'var x = __;', category: 'Variables'},
  {func: 'declareNoAssign_x', block: 'var x;', category: 'Variables'},
  {func: 'assign_x', block: 'x = __;', category: 'Variables'},
  {func: 'declareAssign_x_array_1_4', block: 'var x = [1, 2, 3, 4];', category: 'Variables'},
  {func: 'declareAssign_x_prompt', block: 'var x = prompt("Enter a value");', category: 'Variables'},
  {func: 'declareAssign_x_promptNum', block: 'var x = promptNum("Enter a value");', category: 'Variables'},

  // Functions
  {func: 'functionParams_none', block: 'function myFunction() {\n  __;\n}', category: 'Functions'},
  {func: 'functionParams_n', block: 'function myFunction(n) {\n  __;\n}', category: 'Functions'},
  {func: 'callMyFunction', block: 'myFunction()', category: 'Functions'},
  {func: 'callMyFunction_n', block: 'myFunction(n)', category: 'Functions'},
  {func: 'return', block: 'return __;', category: 'Functions'},
  {func: 'comment', block: '// Comment', category: 'Functions'}
];

standardConfig.categories = {
  Control: {
    color: 'blue',
    rgb: COLOR_BLUE,
    blocks: []
  },
  Math: {
    color: 'orange',
    rgb: COLOR_ORANGE,
    blocks: []
  },
  Variables: {
    color: 'purple',
    rgb: COLOR_PURPLE,
    blocks: []
  },
  Functions: {
    color: 'green',
    rgb: COLOR_GREEN,
    blocks: []
  },
  // create blank category in case level builders want to move all blocks here
  // (which will cause the palette header to disappear)
  '': {'blocks': []},
};

/**
 * Given a collection of code functions and a set of dropletteConfig, returns a
 * a list of blocks.
 * @param codeFunctions {object} A collection of named key/value pairs
 *   key is a block name from dropletBlocks or standardBlocks
 *   value is an object that can be used to override block defaults
 * @param {DropletConfig} dropletConfig
 * @param {DropletConfig} otherConfig optionally used to supply a standardConfig
 *  object which is not app specific. It will be used first, then overriden
 *  by the primary dropletConfig if there is overlap between the two.
 * @param {Object} options
 * @param {boolean} options.paletteOnly ignore blocks not in codeFunctions palette
 * @param {boolean} options.ignoreDocFunc don't include based on block.docFunc
 * @returns {Array<DropletBlock>}
 */
function filteredBlocksFromConfig(codeFunctions, dropletConfig, otherConfig, options) {
  if (!codeFunctions || !dropletConfig || !dropletConfig.blocks) {
    return [];
  }

  options = options || {};

  var blocks = [];
  if (otherConfig) {
    blocks = blocks.concat(otherConfig.blocks);
  }
  blocks = blocks.concat(dropletConfig.blocks);

  var docFunctions = {};
  blocks.forEach(function (block) {
    if (!(block.func in codeFunctions)) {
      return;
    }

    if (!options.ignoreDocFunc) {
      // For cases where we use a different block for our tooltips, make sure that
      // the target block ends up in the list of blocks we want
      var docFunc = block.docFunc;
      if (docFunc && !(docFunc in codeFunctions)) {
        docFunctions[docFunc] = null;
      }
    }
  });

  return blocks.filter(function (block) {
    return !options.paletteOnly || block.func in codeFunctions || block.func in docFunctions;
  }).map(function (block) {
    // We found this particular block, now override the defaults with extend
    return $.extend({}, block, codeFunctions[block.func]);
  });
}

/**
 * Return a new categories object with the categories from dropletConfig (app
 * specific configuration) merged with the ones in standardConfig (global
 * configuration). App configuration takes precendence
 */
function mergeCategoriesWithConfig(dropletConfig) {
  // Clone our merged categories so that as we mutate it, we're not mutating
  // our original config
  var dropletCategories = dropletConfig && dropletConfig.categories;
  // We include dropletCategories twice so that (a) it's ordering of categories
  // gets preference and (b) it's value override anything in standardConfig
  return _.cloneDeep($.extend({}, dropletCategories, standardConfig.categories,
    dropletCategories));
}

/**
 * Generate code aliases in Javascript based on some level data.
 * @param {DropletConfig} dropletConfig
 * @param {String} parentObjName string reference to object upon which func is
 *  a property
 * @returns {String} code
 */
exports.generateCodeAliases = function (dropletConfig, parentObjName) {
  var code = '';
  var aliasFunctions = dropletConfig.blocks;

  // Insert aliases from aliasFunctions into code
  for (var i = 0; i < aliasFunctions.length; i++) {
    var cf = aliasFunctions[i];
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

function buildFunctionPrototype(prefix, params) {
  var proto = prefix + "(";
  if (params) {
    for (var i = 0; i < params.length; i++) {
      if (i !== 0) {
        proto += ", ";
      }
      proto += params[i];
    }
  }
  return proto + ")";
}

// Generate a read-write property expansion function:
function generatePropertyExpansion(propname) {
  return function (block) {
    if (!block || block.type === 'socket') {
      return propname;
    } else {
      return propname + ' = __;';
    }
  };
}

/**
 * Generate a palette for the droplet editor based on some level data.
 * @param {object} codeFunctions The set of functions we want to use for this level
 * @param {object} dropletConfig
 * @param {function} dropletConfig.getBlocks
 * @param {object} dropletConfig.categories
 */
exports.generateDropletPalette = function (codeFunctions, dropletConfig) {
  var mergedCategories = mergeCategoriesWithConfig(dropletConfig);
  var mergedFunctions = filteredBlocksFromConfig(
      codeFunctions,
      dropletConfig,
      standardConfig,
      {paletteOnly: true, ignoreDocFunc: true}
  );

  for (var i = 0; i < mergedFunctions.length; i++) {
    var funcInfo = mergedFunctions[i];
    var block = funcInfo.block;
    var expansion = funcInfo.expansion;
    if (!block) {
      var nameWithPrefix = funcInfo.func;
      if (funcInfo.blockPrefix) {
        nameWithPrefix = funcInfo.blockPrefix + nameWithPrefix;
      }
      if (funcInfo.type === 'property' || funcInfo.type === 'readonlyproperty') {
        block = nameWithPrefix;
      } else {
        var paletteParams = funcInfo.paletteParams || funcInfo.params;
        block = buildFunctionPrototype(nameWithPrefix, paletteParams);
        if (funcInfo.paletteParams) {
          // If paletteParams were specified and used for the 'block', then use
          // the regular params for the 'expansion' which appears when the block
          // is dragged out of the palette:
          expansion = buildFunctionPrototype(nameWithPrefix, funcInfo.params);
        }
      }
    }

    // For properties that aren't read-only, we automatically generate an
    // expansion function so the block can morph to be a setter and a getter:
    if (!expansion && funcInfo.type === 'property') {
      expansion = generatePropertyExpansion(block);
    }

    /**
     * Here we set the title attribute to the function shortname,
     * this is later used as a key for function documentation and tooltips
     */
    var blockPair = {
      block: block,
      expansion: expansion,
      title: funcInfo.modeOptionName || funcInfo.func
    };
    mergedCategories[funcInfo.category].blocks.push(blockPair);
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

function populateCompleterApisFromConfigBlocks(opts, apis, methodsAndProperties, configBlocks) {
  for (var i = 0; i < configBlocks.length; i++) {
    var block = configBlocks[i];
    if (!block.noAutocomplete) {
      // Use score value of 100 to ensure that our APIs are not replaced by
      // other completers that are suggesting the same name
      var newApi = {
        name: 'api',
        value: block.modeOptionName || block.func,
        score: 100,
        meta: block.category
      };
      if (opts.autocompleteFunctionsWithParens) {
        newApi.completer = {
          insertMatch: function (value, editor) {
            // Remove the filterText that was already typed (ace's built-in
            // insertMatch would normally do this automatically)
            if (editor.completer.completions.filterText) {
              var ranges = editor.selection.getAllRanges();
              for (var i = 0, range; !!(range = ranges[i]); i++) {
                range.start.column -= editor.completer.completions.filterText.length;
                editor.session.remove(range);
              }
            }
            // Insert the function name plus parentheses and semicolon:
            editor.execCommand("insertstring", value + '();');
            if (this.params) {
              // Move the selection back so parameters can be entered:
              var curRange = editor.selection.getRange();
              curRange.start.column -= 2;
              curRange.end.column -= 2;
              editor.selection.setSelectionRange(curRange);
            }
          }.bind(block, newApi.value)
        };
      }
      if (newApi.value.indexOf('*.') === 0 || newApi.value.indexOf('?.') === 0) {
        // Populate this in a special methodsAndProperties collection:

        // Store the original name in a docFunc property for the
        // benefit of our DropletAutocompletePopupTooltipManager:
        newApi.docFunc = newApi.value;
        // Update the value to skip over the '*.' or '?.' at the beginning:
        newApi.value = newApi.value.substring(2);
        methodsAndProperties.push(newApi);
        
      } else {
        // Populate this in the "normal" apis collection:
        apis.push(newApi);
      }
    }
  }
}

function populateCompleterFromPredefValues(apis, predefValues) {
  if (predefValues) {
    predefValues.forEach(function (val) {
      // Use score value of 100 to ensure that our APIs are not replaced by
      // other completers that are suggesting the same name
      apis.push({
        name: 'api',
        value: val,
        score: 100,
        meta: 'constants'
      });
    });
  }
}

/**
 * Determines if the ace editor cursor position is at the beginning of a method
 * or property (after a dot).
 * @param {Object} session Ace editor session
 * @param {Object} pos Ace editor position
 * @return {boolean} true if position is at the start of a method or property
 */
function isPositionAfterDot(session, pos) {
  var acUtil = window.ace.require("ace/autocomplete/util");
  var line = session.getLine(pos.row);
  var identifier = acUtil.retrievePrecedingIdentifier(line, pos.column);
  // If we're typing a valid identifier, inspect the preceeding
  // character to see if it is a period and ensure there's at least one
  // character before
  if (identifier.length > 0 && identifier.length < pos.column) {
    // We have an identifier and it is shorter than our column position in
    // this line, which means it is safe to check the line[] before the
    // identifier
    var posBeforeIdentifier = pos.column - identifier.length - 1;
    return line[posBeforeIdentifier] === '.';
  }
  return false;
}

/**
 * Generate an Ace editor completer for a set of APIs based on some level data.
 *
 * If functionFilter is non-null, use it to filter the dropletConfig
 * APIs to be set in autocomplete and create no other autocomplete entries
 */
exports.generateAceApiCompleter = function (functionFilter, dropletConfig) {
  var apis = [];
  var methodsAndProperties = [];
  var opts = {};

  // If autocompleteFunctionsWithParens is set, we will append "();" after functions
  opts.autocompleteFunctionsWithParens = dropletConfig.autocompleteFunctionsWithParens;

  if (functionFilter) {
    var mergedBlocks = filteredBlocksFromConfig(functionFilter, dropletConfig, null, {paletteOnly: true});
    populateCompleterApisFromConfigBlocks(opts, apis, methodsAndProperties, mergedBlocks);
  } else {
    populateCompleterApisFromConfigBlocks(opts, apis, methodsAndProperties, exports.dropletGlobalConfigBlocks);
    populateCompleterApisFromConfigBlocks(opts, apis, methodsAndProperties, exports.dropletBuiltinConfigBlocks);
    populateCompleterApisFromConfigBlocks(opts, apis, methodsAndProperties, dropletConfig.blocks);
    populateCompleterFromPredefValues(apis, dropletConfig.additionalPredefValues);
  }

  return {
    getCompletions: function (editor, session, pos, prefix, callback) {
      if (prefix.length === 0) {
        callback(null, []);
        return;
      }
      if (isPositionAfterDot(session, pos)) {
        // Following a dot, we autocomplete from methodsAndProperties:
        callback(null, methodsAndProperties);
      } else {
        callback(null, apis);
      }
    }
  };
};

/**
 * Given a droplet config, create a mode option functions object
 * @param {object} config
 * @param {object[]} config.blocks
 * @param {object[]} config.categories
 */
function getModeOptionFunctionsFromConfig(config) {
  var mergedCategories = mergeCategoriesWithConfig(config);

  var modeOptionFunctions = {};

  for (var i = 0; i < config.blocks.length; i++) {
    var newFunc = {};

    switch (config.blocks[i].type) {
      case 'value':
        newFunc.value = true;
        break;
      case 'either':
        newFunc.value = true;
        newFunc.command = true;
        break;
      case 'property':
      case 'readonlyproperty':
        newFunc.property = true;
        newFunc.value = true;
        break;
    }

    var category = mergedCategories[config.blocks[i].category];
    if (category) {
      newFunc.color = category.rgb || category.color;
    }

    newFunc.dropdown = config.blocks[i].dropdown;

    var modeOptionName = config.blocks[i].modeOptionName || config.blocks[i].func;
    newFunc.title = modeOptionName;

    modeOptionFunctions[modeOptionName] = newFunc;
  }
  return modeOptionFunctions;
}

/**
 * Generate modeOptions for the droplet editor based on some level data.
 */
exports.generateDropletModeOptions = function (config) {
  var modeOptions = {
    functions: {
    },
    categories: {
      arithmetic: {color: COLOR_ORANGE},
      logic: {color: COLOR_ORANGE},
      conditionals: {color: COLOR_BLUE},
      loops: {
        color: COLOR_BLUE,
        beginner: config.level.beginnerMode || false
      },
      functions: {color: COLOR_GREEN},
      returns: {color: COLOR_GREEN},
      comments: {color: COLOR_WHITE},
      containers: {color: COLOR_PURPLE},
      value: {color: COLOR_PURPLE},
      command: {color: COLOR_GREEN},
      assignments: {color: COLOR_PURPLE}
      // errors: { },
    },
    lockZeroParamFunctions: config.level.lockZeroParamFunctions
  };

  $.extend(modeOptions.functions,
    getModeOptionFunctionsFromConfig({blocks: exports.dropletGlobalConfigBlocks}),
    getModeOptionFunctionsFromConfig({blocks: exports.dropletBuiltinConfigBlocks}),
    getModeOptionFunctionsFromConfig(config.dropletConfig)
  );

  return modeOptions;
};

/**
 * Returns a set of all blocks
 * @param {DropletConfig|null} dropletConfig custom configuration, may be null
 * @param {codeFunctions|null} codeFunctions with block overrides, may be null
 * @param paletteOnly boolean: filter to only those blocks that are in codeFunctions
 *   palette, or who share documentation (via docFunc) with other blocks that are
 * @returns {DropletBlock[]} a list of all available Droplet blocks,
 *      including the given config's blocks
 */
exports.getAllAvailableDropletBlocks = function (dropletConfig, codeFunctions, paletteOnly) {
  var hasConfiguredBlocks = dropletConfig && dropletConfig.blocks;
  var configuredBlocks = hasConfiguredBlocks ? dropletConfig.blocks : [];
  if (codeFunctions && hasConfiguredBlocks) {
    configuredBlocks = filteredBlocksFromConfig(
        codeFunctions,
        dropletConfig,
        null,
        {paletteOnly: paletteOnly}
    );
  }
  return exports.dropletGlobalConfigBlocks
    .concat(exports.dropletBuiltinConfigBlocks)
    .concat(standardConfig.blocks)
    .concat(configuredBlocks);
};

exports.__TestInterface = {
  mergeCategoriesWithConfig: mergeCategoriesWithConfig,
  filteredBlocksFromConfig: filteredBlocksFromConfig
};
