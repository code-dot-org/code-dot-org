import _ from 'lodash';
import color from './util/color';
import {singleton as studioApp} from './StudioApp';
import {globalFunctions} from './dropletUtilsGlobalFunctions';

/**
 * @name DropletBlock
 * @description Definition of a block to be used in Droplet
 * @property {string} func identifying the function this block runs
 * @property {string} blockPrefix Prepend this string before the normal block name in the palette
 * @property {Object} parent object within which this function is defined as a property, keyed by the func name
 * @property {String} category category within which to place the block
 * @property {String} color block color, overriding category and type if present
 * @property {String} type type of the block (e.g. value, either, property, readonlyproperty)
 * @property {Object[]} dropdown array of dropdown info for arguments (see Droplet docs)
 * @property {Object|string[]|Function} objectDropdown dropdown info for object on the left side of member expression (assumes wildcard in name)
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
 * @property {Object} paramButtons The function block should render with buttons to add or remove parameters if minArgs or maxArgs are populated
 * @property {number} [paramButtons.minArgs] Minimum number of arguments (implies that buttons should appear)
 * @property {number} [paramButtons.maxArgs] Maximum number of arguments (implies that buttons should appear)
 */

/**
 * @name DropletConfig
 * @description Configuration information for Droplet
 * @property {DropletBlock[]} blocks list of blocks
 * @property {Object} categories configuration of categories within which to
 *   place blocks
 * @property {boolean} autocompleteFunctionsWithSemicolon If set, we will append
 *   "();" after functions (vs. the "()" we always append)
 * @property {string[]} additionalPredefValues Additional keywords to add to
 *   autocomplete and consider 'defined' for linting purposes.
 */

const COLOR_PURPLE = '#BB77C7';
const COLOR_GREEN = '#68D995';
const COLOR_WHITE = '#FFFFFF';
const COLOR_BLUE = '#64B5F6';
const COLOR_ORANGE = '#FFB74D';

/**
 * @type {DropletBlock[]}
 */
export const dropletGlobalConfigBlocks = [
  {
    func: 'getTime',
    parent: globalFunctions,
    category: 'Control',
    type: 'value'
  },
  {
    func: 'randomNumber',
    parent: globalFunctions,
    category: 'Math',
    type: 'value',
    params: ['1', '10']
  },
  {
    func: 'prompt',
    parent: window,
    category: 'Variables',
    type: 'value',
    params: ['__']
  },
  {
    func: 'promptNum',
    parent: globalFunctions,
    category: 'Variables',
    type: 'value',
    params: ['__']
  }
];

/**
 * @type {DropletBlock[]}
 */
export const dropletBuiltinConfigBlocks = [
  {
    func: 'Math.round',
    category: 'Math',
    type: 'value',
    params: ['__'],
    docFunc: 'mathRound'
  },
  {
    func: 'Math.abs',
    category: 'Math',
    type: 'value',
    params: ['__'],
    docFunc: 'mathAbs'
  },
  {
    func: 'Math.max',
    category: 'Math',
    type: 'value',
    params: ['__'],
    docFunc: 'mathMax'
  },
  {
    func: 'Math.min',
    category: 'Math',
    type: 'value',
    params: ['__'],
    docFunc: 'mathMin'
  },
  {func: 'Math.random', category: 'Math', type: 'value', docFunc: 'mathRandom'},
  {
    func: 'Math.pow',
    category: 'Math',
    type: 'value',
    params: ['__'],
    docFunc: 'mathPow'
  },
  {
    func: 'Math.sqrt',
    category: 'Math',
    type: 'value',
    params: ['__'],
    docFunc: 'mathSqrt'
  }
];

/**
 * @type {DropletConfig|*}}
 */
let standardConfig = {};

standardConfig.blocks = [
  // Control
  {
    func: 'forLoop_i_0_4',
    block: 'for (var i = 0; i < 4; i++) {\n  __;\n}',
    category: 'Control'
  },
  {func: 'whileBlock', block: 'while (__) {\n  __;\n}', category: 'Control'},
  {func: 'ifBlock', block: 'if (__) {\n  __;\n}', category: 'Control'},
  {
    func: 'ifElseBlock',
    block: 'if (__) {\n  __;\n} else {\n  __;\n}',
    category: 'Control'
  },
  {func: 'getTime', block: 'getTime()', category: 'Control', type: 'value'},

  // Math
  {func: 'addOperator', block: '__ + __', category: 'Math'},
  {func: 'subtractOperator', block: '__ - __', category: 'Math'},
  {func: 'multiplyOperator', block: '__ * __', category: 'Math'},
  {func: 'divideOperator', block: '__ / __', category: 'Math'},
  {func: 'moduloOperator', block: '__ % __', category: 'Math'},
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
  {
    func: 'randomNumber_min_max',
    block: 'randomNumber(1, 10)',
    category: 'Math'
  },
  {func: 'mathRound', block: 'Math.round(__)', category: 'Math'},
  {func: 'mathAbs', block: 'Math.abs(__)', category: 'Math'},
  {func: 'mathMax', block: 'Math.max(__)', category: 'Math'},
  {func: 'mathMin', block: 'Math.min(__)', category: 'Math'},
  {func: 'mathRandom', block: 'Math.random()', category: 'Math'},
  {func: 'mathPow', block: 'Math.pow(__, __)', category: 'Math'},
  {func: 'mathSqrt', block: 'Math.sqrt(__)', category: 'Math'},
  {func: 'mathIncrement', block: '__++', category: 'Math'},
  {func: 'mathDecrement', block: '__--', category: 'Math'},

  // Variables
  {func: 'declareAssign_x', block: 'var x = __;', category: 'Variables'},
  {func: 'declareNoAssign_x', block: 'var x;', category: 'Variables'},
  {func: 'assign_x', block: 'x = __;', category: 'Variables'},
  {
    func: 'declareAssign_x_array_1_4',
    block: 'var x = [1, 2, 3, 4];',
    category: 'Variables'
  },
  {
    func: 'declareAssign_x_prompt',
    block: 'var x = prompt("Enter a value");',
    category: 'Variables'
  },
  {
    func: 'declareAssign_x_promptNum',
    block: 'var x = promptNum("Enter a value");',
    category: 'Variables'
  },

  // Functions
  {
    func: 'functionParams_none',
    block: 'function myFunction() {\n  __;\n}',
    category: 'Functions'
  },
  {
    func: 'functionParams_n',
    block: 'function myFunction(n) {\n  __;\n}',
    category: 'Functions'
  },
  {func: 'callMyFunction', block: 'myFunction()', category: 'Functions'},
  {func: 'callMyFunction_n', block: 'myFunction(n)', category: 'Functions'},
  {func: 'return', block: 'return __;', category: 'Functions'},
  {
    func: 'comment',
    block: '// Comment',
    expansion: '// ',
    category: 'Functions'
  }
];

standardConfig.categories = {
  Control: {
    id: 'control',
    color: 'blue',
    rgb: COLOR_BLUE,
    blocks: []
  },
  Math: {
    id: 'math',
    color: 'orange',
    rgb: COLOR_ORANGE,
    blocks: []
  },
  Variables: {
    id: 'variables',
    color: 'purple',
    rgb: COLOR_PURPLE,
    blocks: []
  },
  Functions: {
    id: 'functions',
    color: 'green',
    rgb: COLOR_GREEN,
    blocks: []
  },
  // create blank category in case level builders want to move all blocks here
  // (which will cause the palette header to disappear)
  '': {
    id: 'default',
    blocks: []
  }
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
function filteredBlocksFromConfig(
  codeFunctions,
  dropletConfig,
  otherConfig,
  options
) {
  if (!codeFunctions || !dropletConfig || !dropletConfig.blocks) {
    return [];
  }

  options = options || {};

  let blocks = [];
  if (otherConfig) {
    blocks = blocks.concat(otherConfig.blocks);
  }
  blocks = blocks.concat(dropletConfig.blocks);

  const docFunctions = {};
  blocks.forEach(block => {
    if (!(block.func in codeFunctions)) {
      return;
    }

    if (!options.ignoreDocFunc) {
      // For cases where we use a different block for our tooltips, make sure that
      // the target block ends up in the list of blocks we want
      const docFunc = block.docFunc;
      if (docFunc && !(docFunc in codeFunctions)) {
        docFunctions[docFunc] = null;
      }
    }
  });

  return blocks
    .filter(
      block =>
        !options.paletteOnly ||
        block.func in codeFunctions ||
        block.func in docFunctions
    )
    .map(block =>
      // We found this particular block, now override the defaults with extend
      ({...block, ...codeFunctions[block.func]})
    );
}

/**
 * Return a new categories object with the categories from dropletConfig (app
 * specific configuration) merged with the ones in standardConfig (global
 * configuration). App configuration takes precendence
 */
function mergeCategoriesWithConfig(dropletConfig) {
  // Clone our merged categories so that as we mutate it, we're not mutating
  // our original config
  const dropletCategories = dropletConfig && dropletConfig.categories;
  // We include dropletCategories twice so that (a) it's ordering of categories
  // gets preference and (b) it's value override anything in standardConfig
  return _.cloneDeep({
    ...dropletCategories,
    ...standardConfig.categories,
    ...dropletCategories
  });
}

/**
 * Generate code aliases in Javascript based on some level data.
 * @param {DropletConfig} dropletConfig
 * @param {String} parentObjName string reference to object upon which func is
 *  a property
 * @returns {String} code
 */
export function generateCodeAliases(dropletConfig, parentObjName) {
  let code = '';
  const aliasFunctions = dropletConfig.blocks;

  // Insert aliases from aliasFunctions into code
  for (let i = 0; i < aliasFunctions.length; i++) {
    const cf = aliasFunctions[i];
    code += 'var ' + cf.func + ' = function() { ';
    if (cf.idArgNone) {
      code +=
        'return ' +
        parentObjName +
        '.' +
        cf.func +
        '.apply(' +
        parentObjName +
        ', arguments); };\n';
    } else {
      code +=
        'var newArgs = ' +
        (cf.idArgLast ? "arguments.concat(['']);" : "[''].concat(arguments);") +
        ' return ' +
        parentObjName +
        '.' +
        cf.func +
        '.apply(' +
        parentObjName +
        ', newArgs); };\n';
    }
  }
  return code;
}

function buildFunctionPrototype(prefix, params) {
  let proto = prefix + '(';
  if (params) {
    for (let i = 0; i < params.length; i++) {
      if (i !== 0) {
        proto += ', ';
      }
      proto += params[i];
    }
  }
  return proto + ')';
}

// Generate a read-write property expansion function:
function generatePropertyExpansion(propname) {
  return block => {
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
export function generateDropletPalette(codeFunctions, dropletConfig) {
  const mergedCategories = mergeCategoriesWithConfig(dropletConfig);
  const mergedFunctions = filteredBlocksFromConfig(
    codeFunctions,
    dropletConfig,
    standardConfig,
    {paletteOnly: true, ignoreDocFunc: true}
  );

  for (let i = 0; i < mergedFunctions.length; i++) {
    const funcInfo = mergedFunctions[i];
    let block = funcInfo.block;
    let expansion = funcInfo.expansion;
    if (funcInfo.category === 'Goals' && funcInfo.goal) {
      block = '// ' + funcInfo.goal;
    } else if (!block) {
      let nameWithPrefix = funcInfo.func;
      if (funcInfo.blockPrefix) {
        nameWithPrefix = funcInfo.blockPrefix + nameWithPrefix;
      }
      if (
        funcInfo.type === 'property' ||
        funcInfo.type === 'readonlyproperty'
      ) {
        block = nameWithPrefix;
      } else {
        const paletteParams = funcInfo.paletteParams || funcInfo.params;
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
    const blockPair = {
      block: block,
      expansion: expansion,
      title: funcInfo.modeOptionName || funcInfo.func
    };
    mergedCategories[funcInfo.category].blocks.push(blockPair);
  }

  // Convert to droplet's expected palette format:
  const addedPalette = [];
  for (let category in mergedCategories) {
    if (mergedCategories[category].blocks.length > 0) {
      mergedCategories[category].name = category;
      addedPalette.push(mergedCategories[category]);
    }
  }

  return addedPalette;
}

function populateCompleterApisFromConfigBlocks(
  opts,
  apis,
  methodsAndProperties,
  configBlocks
) {
  const acUtil = window.ace.require('ace/autocomplete/util');

  for (let i = 0; i < configBlocks.length; i++) {
    const block = configBlocks[i];
    if (!block.noAutocomplete) {
      // Use score value of 100 to ensure that our APIs are not replaced by
      // other completers that are suggesting the same name
      const newApi = {
        name: 'api',
        value: block.modeOptionName || block.func,
        score: 100,
        meta: block.category
      };
      const methodOrProperty =
        newApi.value.indexOf('*.') === 0 || newApi.value.indexOf('?.') === 0;
      if (methodOrProperty) {
        // Store the original name in a docFunc property for the
        // benefit of our DropletAutocompletePopupTooltipManager:
        newApi.docFunc = newApi.value;
        // Update the value to skip over the '*.' or '?.' at the beginning:
        newApi.value = newApi.value.substring(2);
      }

      newApi.completer = {
        insertMatch: function(value, editor) {
          // Remove the filterText that was already typed (ace's built-in
          // insertMatch would normally do this automatically) plus the rest of
          // the identifier after the filterText...
          let modifyingExistingFunctionCall = false;
          if (editor.completer.completions.filterText) {
            const ranges = editor.selection.getAllRanges();
            for (let i = 0, range; !!(range = ranges[i]); i++) {
              range.start.column -=
                editor.completer.completions.filterText.length;
              const line = editor.session.getLine(range.end.row);
              const lengthOfRestOfIdentifier = acUtil.retrieveFollowingIdentifier(
                line,
                range.end.column
              ).length;
              range.end.column += lengthOfRestOfIdentifier;
              modifyingExistingFunctionCall = line[range.end.column] === '(';
              editor.session.remove(range);
            }
          }
          // Insert the function name plus parentheses and semicolon:
          const isProp =
            block.type === 'property' || block.type === 'readonlyproperty';
          if (isProp) {
            editor.execCommand('insertstring', value);
          } else {
            const suffix = modifyingExistingFunctionCall
              ? ''
              : opts.autocompleteFunctionsWithSemicolon
              ? '();'
              : '()';
            editor.execCommand('insertstring', value + suffix);
            if (this.params) {
              // Move the selection back so parameters can be entered:
              const curRange = editor.selection.getRange();
              let moveSelectionCharCount;
              if (modifyingExistingFunctionCall) {
                moveSelectionCharCount = 1;
              } else {
                moveSelectionCharCount = -(suffix.length - 1);
              }
              curRange.start.column += moveSelectionCharCount;
              curRange.end.column += moveSelectionCharCount;
              editor.selection.setSelectionRange(curRange);
            }
          }
        }.bind(block, newApi.value)
      };
      if (methodOrProperty) {
        // Populate this in a special methodsAndProperties collection:
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
    predefValues.forEach(val => {
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
  const acUtil = window.ace.require('ace/autocomplete/util');
  const line = session.getLine(pos.row);
  const identifier = acUtil.retrievePrecedingIdentifier(line, pos.column);
  // If we're typing a valid identifier, inspect the preceeding
  // character to see if it is a period and ensure there's at least one
  // character before
  if (identifier.length > 0 && identifier.length < pos.column) {
    // We have an identifier and it is shorter than our column position in
    // this line, which means it is safe to check the line[] before the
    // identifier
    const posBeforeIdentifier = pos.column - identifier.length - 1;
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
export function generateAceApiCompleter(functionFilter, dropletConfig) {
  const apis = [];
  const methodsAndProperties = [];
  const opts = {};

  // If autocompleteFunctionsWithSemicolon is set, we will append "();" after
  // functions, instead of the "()" we normally append
  opts.autocompleteFunctionsWithSemicolon =
    dropletConfig.autocompleteFunctionsWithSemicolon;

  if (functionFilter) {
    const mergedBlocks = filteredBlocksFromConfig(
      functionFilter,
      dropletConfig,
      null,
      {paletteOnly: true}
    );
    populateCompleterApisFromConfigBlocks(
      opts,
      apis,
      methodsAndProperties,
      mergedBlocks
    );
  } else {
    populateCompleterApisFromConfigBlocks(
      opts,
      apis,
      methodsAndProperties,
      dropletGlobalConfigBlocks
    );
    populateCompleterApisFromConfigBlocks(
      opts,
      apis,
      methodsAndProperties,
      dropletBuiltinConfigBlocks
    );
    populateCompleterApisFromConfigBlocks(
      opts,
      apis,
      methodsAndProperties,
      dropletConfig.blocks
    );
    populateCompleterFromPredefValues(
      apis,
      dropletConfig.additionalPredefValues
    );
  }

  return {
    getCompletions(editor, session, pos, prefix, callback) {
      // Ensure our updateCompletionsOverride is installed - note that we must wait
      // until a completor object has been created to install the hook. This
      // getCompletions() function will be called from within the original
      // updateCompletions() call, which is ok to run without our hook. We need
      // to make sure subsequent calls to updateCompletions() are overriden
      installAceUpdateCompletionsHook(editor);
      const token = editor.session.getTokenAt(pos.row, pos.column);
      // Ignore cases where:
      // * the prefix is empty
      // * we are in a comment
      // * the prefix is a number with less than 3 digits (matches Atom semantics)
      if (
        prefix.length === 0 ||
        token.type === 'comment' ||
        (prefix.length < 3 && !isNaN(Number(prefix)))
      ) {
        callback(null, []);
        return;
      }
      // Following a dot, we autocomplete from methodsAndProperties:
      const list = isPositionAfterDot(session, pos)
        ? methodsAndProperties
        : apis;

      // Filter our list to contain substring word matches:
      const filteredList = filterListBasedOnWordMatches(prefix, list);
      callback(null, filteredList);
    }
  };
}

function filterListBasedOnWordMatches(prefix, list) {
  // Filter our list to contain substring word matches based on camelCase,
  // snake_case or Global.method:
  const modifiedPrefix = prefix.replace(/_|\./g, '').toLowerCase();
  return list.filter(completion => {
    const {value} = completion;
    // https://stackoverflow.com/a/34680912
    const edges = /([A-Z](?=[A-Z][a-z])|[^A-Z](?=[A-Z])|[a-zA-Z](?=[^a-zA-Z]))/g;
    const words = value
      .replace('.', '_')
      .replace(edges, '$1_')
      .split('_');
    // Transform words into phrases that we consider to be "matches": e.g.
    // words ['get', 'Time'] become phrases ['getTime', 'Time']
    const phrases = words.map((word, index) => words.slice(index).join(''));
    for (const phrase of phrases) {
      if (phrase.toLowerCase().indexOf(modifiedPrefix) === 0) {
        return completion;
      }
    }
  });
}

/**
 * Install our own updateCompletions method to override the default ace
 * behavior so that we can modify the filtering behavior
 * @param {AceEditor} editor
 */
function installAceUpdateCompletionsHook(editor) {
  if (editor.completer.updateCompletions !== updateCompletionsOverride) {
    originalUpdateCompletions = editor.completer.updateCompletions;
    editor.completer.updateCompletions = updateCompletionsOverride;
  }
}

var originalUpdateCompletions;

/**
 * Our overridden updateCompletions method, installed so that we can modify the
 * filtering behavior
 * @param {completor} this
 * @param {boolean} keepPopupPosition
 */
function updateCompletionsOverride(keepPopupPosition) {
  if (keepPopupPosition && this.base && this.completions) {
    const pos = this.editor.getCursorPosition();
    const prefix = this.editor.session.getTextRange({
      start: this.base,
      end: pos
    });

    // Repopulate all 3 properties of the FilteredList (stored in this.completions)
    // with a new list, filtered by our algorithm, but not yet filtered by ace's
    // algorithm. Ensure that filterText is blank so that the original
    // updateCompletions() won't just return immediately

    this.completions.all = filterListBasedOnWordMatches(
      prefix,
      this.completions.all
    );
    this.completions.filtered = this.completions.all;
    this.completions.filterText = '';
  }
  return originalUpdateCompletions.call(this, keepPopupPosition);
}

/**
 * Given a droplet config, create a mode option functions object
 * @param {object} config
 * @param {object[]} config.blocks
 * @param {object[]} config.categories
 * @param {codeFunctions|null} codeFunctions with block overrides, may be null
 */
function getModeOptionFunctionsFromConfig(config, codeFunctions) {
  const mergedCategories = mergeCategoriesWithConfig(config);
  const mergedFuncs = filteredBlocksFromConfig(
    codeFunctions,
    config,
    null,
    null
  );

  const modeOptionFunctions = {};

  for (let i = 0; i < mergedFuncs.length; i++) {
    const block = mergedFuncs[i];
    const newFunc = {};

    switch (block.type) {
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

    const category = mergedCategories[block.category];
    if (typeof block.color === 'string' && block.color.length > 0) {
      newFunc.color = block.color;
    } else if (category) {
      newFunc.color = category.rgb || category.color;
    }

    newFunc.dropdown = block.dropdown;
    newFunc.objectDropdown = block.objectDropdown;
    newFunc.allowFunctionDrop = block.allowFunctionDrop;
    if (block.paramButtons) {
      newFunc.minArgs = block.paramButtons.minArgs;
      newFunc.maxArgs = block.paramButtons.maxArgs;
    }

    const modeOptionName = block.modeOptionName || block.func;
    newFunc.title = modeOptionName;

    modeOptionFunctions[modeOptionName] = newFunc;
  }
  return modeOptionFunctions;
}

/**
 * Generate modeOptions for the droplet editor based on some level data.
 */
export function generateDropletModeOptions(config) {
  return {
    functions: {
      ...getModeOptionFunctionsFromConfig(
        {blocks: dropletGlobalConfigBlocks},
        config.level.codeFunctions
      ),
      ...getModeOptionFunctionsFromConfig(
        {blocks: dropletBuiltinConfigBlocks},
        config.level.codeFunctions
      ),
      ...getModeOptionFunctionsFromConfig(
        config.dropletConfig,
        config.level.codeFunctions
      )
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
    lockZeroParamFunctions: config.level.lockZeroParamFunctions,
    lockFunctionDropIntoKnownParams: config.lockFunctionDropIntoKnownParams,
    paramButtonsForUnknownFunctions: true
  };
}

/**
 * Returns a set of all blocks
 * @param {DropletConfig|null} dropletConfig custom configuration, may be null
 * @param {codeFunctions|null} codeFunctions with block overrides, may be null
 * @param paletteOnly boolean: filter to only those blocks that are in codeFunctions
 *   palette, or who share documentation (via docFunc) with other blocks that are
 * @returns {DropletBlock[]} a list of all available Droplet blocks,
 *      including the given config's blocks
 */
export function getAllAvailableDropletBlocks(
  dropletConfig,
  codeFunctions,
  paletteOnly
) {
  const hasConfiguredBlocks = dropletConfig && dropletConfig.blocks;
  let configuredBlocks = hasConfiguredBlocks ? dropletConfig.blocks : [];
  if (codeFunctions && hasConfiguredBlocks) {
    configuredBlocks = filteredBlocksFromConfig(
      codeFunctions,
      dropletConfig,
      null,
      {paletteOnly: paletteOnly}
    );
  }
  return dropletGlobalConfigBlocks
    .concat(dropletBuiltinConfigBlocks)
    .concat(standardConfig.blocks)
    .concat(configuredBlocks);
}

/**
 * Gets the first parameter of the given function name, given either that
 * function's DropletBlock or an AceEditor instance with its current cursor
 * set to after the method.
 *
 *
 * @param {string} methodName name of method to get first param of
 * @param {DropletBlock} block Droplet block, or undefined if in text mode
 * @param {AceEditor} editor
 * @return {string|null} found parameter (without quotes) or null if none found
 * @throws {Error} encountered unexpected Droplet token
 */
export function getFirstParam(methodName, block, editor) {
  return getParamAtIndex(0, methodName, block, editor);
}

/**
 * Gets the second parameter of the given function name, given either that
 * function's DropletBlock or an AceEditor instance with its current cursor
 * set to after the method.
 * @param {string} methodName name of method to get first param of
 * @param {DropletBlock} block Droplet block, or undefined if in text mode
 * @param {AceEditor} editor
 * @return {string|null} found parameter (without quotes) or null if none found
 * @throws {Error} encountered unexpected Droplet token
 */
export function getSecondParam(methodName, block, editor) {
  return getParamAtIndex(1, methodName, block, editor);
}

/**
 * Gets the parameter at a given index of a given function name, given either that
 * function's DropletBlock or an AceEditor instance with its current cursor
 * set to after the method.
 *
 * @param {number} index of the parameter requested
 * @param {string} methodName name of method to get first param of
 * @param {DropletBlock} block Droplet block, or undefined if in text mode
 * @param {AceEditor} editor
 * @return {string|null} found parameter (without quotes) or null if none found
 * @throws {Error} encountered unexpected Droplet token
 */
function getParamAtIndex(index, methodName, block, editor) {
  if (!block) {
    // If we're not given a block, assume that we're in text mode
    const cursor = editor.session.selection.getCursor();
    const contents = editor.session
      .getLine(cursor.row)
      .substring(0, cursor.column);

    return getParamFromCodeAtIndex(index, methodName, contents);
  }
  // We have a block. Parse it to find our first socket.
  let token = block.start;
  let paramNumber = -1;
  do {
    if (token.type === 'socketStart') {
      paramNumber++;
      if (paramNumber !== index) {
        token = token.next;
        continue;
      }
      const textToken = token.next;
      if (textToken.type === 'text') {
        return textToken.value;
      } else if (textToken.type === 'blockStart') {
        return textToken.next.value;
      } else {
        throw new Error('unexpected');
      }
    }
    token = token.next;
  } while (token);
  return null;
}

/**
 * Sets the parameter at a given index of a given function name, given that
 * function's DropletBlock (AceEditor not supported).
 *
 * @param {number} index of the parameter requested
 * @param {string} value the new parameter value
 * @param {DropletBlock} block Droplet block, or undefined if in text mode
 */
export function setParamAtIndex(index, value, block) {
  let editor = studioApp().editor;
  if (!block || !editor) {
    // If we're not given a block, assume that we're in text mode and do nothing
    return;
  }
  // We have a block. Parse it to find our first socket.
  let token = block.start;
  let paramNumber = -1;
  // Accounts for the additional socket depth from using arrays and indices as
  // parameters
  let socketDepth = 0;
  do {
    if (token.type === 'socketStart') {
      if (socketDepth === 0) {
        paramNumber++;
      }
      socketDepth++;
      if (paramNumber !== index) {
        token = token.next;
        continue;
      }
      let socket = token.container;
      editor.undoCapture();
      editor.populateSocket(socket, value);
      editor.redrawPalette();
      editor.redrawMain();
      break;
    }
    if (token.type === 'socketEnd') {
      socketDepth--;
      if (socketDepth < 0) {
        break;
      }
    }
    token = token.next;
  } while (token);
}

/**
 * Take a string like "'param1', 'param2'" and an index and return
 * the param at the given index without extra quotes, commas or spaces.
 */
function formatParamString(index, params) {
  // Use encodeURIComponent to encode everything except commas outside
  // of quoted strings (which we will remove with the split() call below)
  const splitQuotedStrings = params.split(/("[^"]*"|'[^']*')/);
  const escaped = splitQuotedStrings.reduce((acc, cur) => {
    const encodedString = encodeURIComponent(cur);
    if (cur.startsWith('"') || cur.startsWith("'")) {
      return acc + encodedString;
    }
    return acc + encodedString.replace(/%2C/g, ',');
  }, '');
  // Split apart on only the real (not encoded) commas:
  params = escaped.split(',');
  // Decode the string for the requested parameter and remove all single
  // quotes, double quotes, and whitespace:
  return decodeURIComponent(params[index])
    .split('"')
    .join('')
    .split("'")
    .join('')
    .trim();
}

function getParamFromCodeAtIndex(index, methodName, code) {
  const prefix = `${methodName}(`;
  code = code.slice(code.lastIndexOf(prefix));

  // Everything after left paren except right paren, with optional whitespace afterwards
  // Handles simplistic cases of single quotes, double quotes, and matches parens within
  // each parameter

  const paramsRegex = `^${methodName}\\(((?:(?:\\([^\\)]*\\))|(?:"[^"]*")|(?:\'[^\']*\')|[^)]*)*)\\)?\\s*$`;
  const matchParams = new RegExp(paramsRegex).exec(code);
  if (matchParams) {
    return formatParamString(index, matchParams[1]);
  }
  return null;
}

/**
 * Given a stating config, generates a "disabled" droplet config that has the
 * following properties:
 *  - Removes all categories
 *  - Removes all blocks from categories
 *  - Turns all blocks gray
 *  - Removes all blocks from autocomplete
 *  - Removes all additional defines
 * @param {DropletConfig} originalConfig
 */
export function makeDisabledConfig(originalConfig) {
  return {
    // Start with existing config
    ...originalConfig,

    // No categories
    categories: {},

    // No extra predefined values
    additionalPredefValues: [],

    // Turn all blocks gray and disable autocomplete
    blocks: originalConfig.blocks.map(block => ({
      ...block,
      category: undefined,
      color: color.light_gray,
      noAutocomplete: true
    }))
  };
}

export const __TestInterface = {
  mergeCategoriesWithConfig: mergeCategoriesWithConfig,
  filteredBlocksFromConfig: filteredBlocksFromConfig,
  getParamFromCodeAtIndex: getParamFromCodeAtIndex
};
