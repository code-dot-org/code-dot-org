import _ from 'lodash';
import xml from './xml';

const ATTRIBUTES_TO_CLEAN = ['uservisible', 'deletable', 'movable'];
const DEFAULT_COLOR = [184, 1.0, 0.74];

// Used for custom field type ClampedNumber(,)
// Captures two optional arguments from the type string
// Allows:
//   ClampedNumber(x,y)
//   ClampedNumber( x , y )
//   ClampedNumber(,y)
//   ClampedNumber(x,)
//   ClampedNumber(,)
const CLAMPED_NUMBER_REGEX = /^ClampedNumber\(\s*([\d.]*)\s*,\s*([\d.]*)\s*\)$/;

/**
 * Create the xml for a level's toolbox
 * @param {string} blocks The xml of the blocks to go in the toolbox
 */
exports.createToolbox = function(blocks) {
  return '<xml id="toolbox" style="display: none;">' + blocks + '</xml>';
};

const appendBlocks = function(toolboxDom, blockTypes) {
  const root = toolboxDom.firstChild;
  blockTypes.forEach(blockName => {
    const block = toolboxDom.createElement('block');
    block.setAttribute('type', blockName);
    root.appendChild(block);
  });
  return xml.serialize(toolboxDom);
};
exports.appendBlocks = appendBlocks;

exports.appendBlocksByCategory = function(toolboxXml, blocksByCategory) {
  const parser = new DOMParser();
  const toolboxDom = parser.parseFromString(toolboxXml, 'text/xml');
  if (!toolboxDom.querySelector('category')) {
    // Uncategorized toolbox, just add blocks to the end
    const allBlocks = _.flatten(Object.values(blocksByCategory));
    return appendBlocks(toolboxDom, allBlocks);
  }
  Object.keys(blocksByCategory).forEach(categoryName => {
    let category = toolboxDom.querySelector(`category[name="${categoryName}"]`);
    let existingCategory = true;
    if (!category) {
      category = toolboxDom.createElement('category');
      existingCategory = false;
    }
    category.setAttribute('name', categoryName);
    blocksByCategory[categoryName].forEach(blockName => {
      if (category.querySelector(`block[type="${blockName}"]`)) {
        return;
      }
      const block = toolboxDom.createElement('block');
      block.setAttribute('type', blockName);
      category.appendChild(block);
    });
    if (!existingCategory) {
      toolboxDom.firstChild.appendChild(category);
    }
  });
  return xml.serialize(toolboxDom);
};

/**
 * Create the xml for a block of the given type
 * @param {string} type The type of the block
 * @param {Object.<string,string>} [titles] Dictionary of titles mapping name to value
 * @param {Object} [values] Dictionary of values mapping name to value
 * @param {string} values.type Type of the value input
 * @param {string} values.titleName Name of the title block
 * @param {string} values.titleValue Input value
 */
exports.blockOfType = function(type, titles, values) {
  let inputText = '';
  if (titles) {
    for (let key in titles) {
      inputText += `<title name="${key}">${titles[key]}</title>`;
    }
  }
  if (values) {
    for (let key in values) {
      inputText += `<value name="${key}">
        <block type="${values[key].type}">
          <title name="${values[key].titleName}">${
        values[key].titleValue
      }</title>
        </block>
      </value>`;
    }
  }
  return `<block type="${type}">${inputText}</block>`;
};

/*
 * Creates an XML node for an individual block. See blockOfType for params
 */
exports.blockAsXmlNode = function(type, inputs = {}) {
  return xml.parseElement(
    exports.blockOfType(type, inputs.titles, inputs.values)
  ).firstChild;
};

/**
 * Create the xml for a block of the given type, with the provided child nested
 * in a next block
 * @param {string} type The type of the block
 * @param {Object.<string,string>} [titles] Dictionary of titles mapping name to value
 * @param {string} child Xml for the child block
 */
exports.blockWithNext = function(type, titles, child) {
  var titleText = '';
  if (titles) {
    for (var key in titles) {
      titleText += '<title name="' + key + '">' + titles[key] + '</title>';
    }
  }
  return (
    '<block type="' +
    type +
    '">' +
    titleText +
    '<next>' +
    child +
    '</next></block>'
  );
};

/**
 * Give a list of types, returns the xml assuming each block is a child of
 * the previous block.
 */
exports.blocksFromList = function(types) {
  if (types.length === 1) {
    return this.blockOfType(types[0]);
  }

  return this.blockWithNext(types[0], {}, this.blocksFromList(types.slice(1)));
};

/**
 * Create the xml for a category in a toolbox
 */
exports.createCategory = function(name, blocks, custom) {
  return (
    '<category name="' +
    name +
    '"' +
    (custom ? ' custom="' + custom + '"' : '') +
    '>' +
    blocks +
    '</category>'
  );
};

/**
 * Generate a simple block with a plain title and next/previous connectors.
 */
exports.generateSimpleBlock = function(blockly, generator, options) {
  ['name', 'title', 'tooltip', 'functionName'].forEach(function(param) {
    if (!options[param]) {
      throw new Error('generateSimpleBlock requires param "' + param + '"');
    }
  });

  var name = options.name;
  var helpUrl = options.helpUrl || ''; // optional param
  var title = options.title;
  var titleImage = options.titleImage;
  var tooltip = options.tooltip;
  var functionName = options.functionName;

  blockly.Blocks[name] = {
    helpUrl: helpUrl,
    init: function() {
      // Note: has a fixed HSV.  Could make this customizable if need be
      Blockly.cdoUtils.setHSV(this, 184, 1.0, 0.74);
      var input = this.appendDummyInput();
      if (title) {
        input.appendField(title);
      }
      if (titleImage) {
        input.appendField(new blockly.FieldImage(titleImage));
      }
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(tooltip);
    }
  };

  generator[name] = function() {
    // Generate JavaScript for putting dirt on to a tile.
    return functionName + "('block_id_" + this.id + "');\n";
  };
};

/**
 * Generates a single block from a <block/> DOM element, adding it to the main workspace
 * @param blockDOM {Element}
 * @returns {*}
 */
exports.domToBlock = function(blockDOM) {
  return Blockly.Xml.domToBlock(Blockly.mainBlockSpace, blockDOM);
};

/**
 * Generates a single block from a block XML string—e.g., <block type="testBlock"></block>,
 * and adds it to the main workspace
 * @param blockDOMString
 * @returns {*}
 */
exports.domStringToBlock = function(blockDOMString) {
  return exports.domToBlock(xml.parseElement(blockDOMString).firstChild);
};

/**
 * Takes a set of start blocks, and returns them with a particular top level
 * block inserted in front of the first non-function block.  If we already have
 * this block, does nothing.
 */
exports.forceInsertTopBlock = function(input, blockType) {
  input = input || '';

  if (blockType === null || input.indexOf(blockType) !== -1) {
    return input;
  }

  var root = xml.parseElement(input);

  // Extract the document from the root. The reason I do this instead of just
  // using document.createElement elsewhere is
  var doc = root.parentNode;

  var topBlock = doc.createElement('block');
  topBlock.setAttribute('type', blockType);
  topBlock.setAttribute('movable', 'false');
  topBlock.setAttribute('deletable', 'false');

  var numChildren = root.childNodes ? root.childNodes.length : 0;

  // find the first non-function definition block and extract it
  var firstBlock = null,
    i = 0;
  while (i < numChildren && firstBlock === null) {
    var child = root.childNodes[i];
    // only look at element nodes
    if (child.nodeType === 1) {
      var type = child.getAttribute('type');
      if (
        type !== 'procedures_defnoreturn' &&
        type !== 'procedures_defreturn'
      ) {
        firstBlock = root.removeChild(child);
        numChildren--;
      }
    }
    i++;
  }

  if (firstBlock !== null) {
    // when run -> next -> firstBlock
    var next;
    if (/^functional/.test(blockType)) {
      next = doc.createElement('functional_input');
      next.setAttribute('name', 'ARG1');
    } else {
      next = doc.createElement('next');
    }
    next.appendChild(firstBlock);
    topBlock.appendChild(next);
  }

  if (numChildren > 0) {
    root.insertBefore(topBlock, root.childNodes[0]);
  } else {
    root.appendChild(topBlock);
  }
  return xml.serialize(root);
};

/**
 * Generate the xml for a block for the calc app.
 * @param {string} type Type for this block
 * @param {number[]|string[]} args List of args, where each arg is either the
 *   xml for a child block, a number, or the name of a variable.
 */
exports.calcBlockXml = function(type, args) {
  var str = '<block type="' + type + '" inline="false">';
  for (var i = 1; i <= args.length; i++) {
    str += '<functional_input name="ARG' + i + '">';
    var arg = args[i - 1];
    if (typeof arg === 'number') {
      arg =
        '<block type="functional_math_number"><title name="NUM">' +
        arg +
        '</title></block>';
    } else if (/^<block/.test(arg)) {
      // we have xml, dont make any changes
    } else {
      // we think we have a variable
      arg = exports.calcBlockGetVar(arg);
    }
    str += arg;
    str += '</functional_input>';
  }
  str += '</block>';

  return str;
};

/**
 * @returns the xml for a functional_parameters_get block with the given
 *   variableName
 */
exports.calcBlockGetVar = function(variableName) {
  return (
    '' +
    '<block type="functional_parameters_get" uservisible="false">' +
    '  <mutation>' +
    '    <outputtype>Number</outputtype>' +
    '  </mutation>' +
    '  <title name="VAR">' +
    variableName +
    '</title>' +
    '</block>'
  );
};

/**
 * Generate the xml for a math block (either calc or eval apps).
 * @param {string} type Type for this block
 * @param {Object.<string,string>} inputs Dictionary mapping input name to the
     xml for that input
 * @param {Object.<string.string>} [titles] Dictionary of titles mapping name to value
 */
exports.mathBlockXml = function(type, inputs, titles) {
  var str = '<block type="' + type + '" inline="false">';
  for (var title in titles) {
    str += '<title name="' + title + '">' + titles[title] + '</title>';
  }

  for (var input in inputs) {
    str +=
      '<functional_input name="' +
      input +
      '">' +
      inputs[input] +
      '</functional_input>';
  }

  str += '</block>';

  return str;
};

/**
 * Generate xml for a functional defintion
 * @param {string} name The name of the function
 * @param {string} outputType Function's output type
 * @param {Object<string, string>[]} argList Name and type for each arg
 * @param {string} blockXml Xml for the blocks that actually define the function
 */
exports.functionalDefinitionXml = function(
  name,
  outputType,
  argList,
  blockXml
) {
  var mutation = '<mutation>';
  argList.forEach(function(argInfo) {
    mutation +=
      '<arg name="' + argInfo.name + '" type="' + argInfo.type + '"></arg>';
  });
  mutation += '<outputtype>' + outputType + '</outputtype></mutation>';

  return (
    '<block type="functional_definition" inline="false">' +
    mutation +
    '<field name="NAME">' +
    name +
    '</field>' +
    '<functional_input name="STACK">' +
    blockXml +
    '</functional_input>' +
    '</block>'
  );
};

/**
 * Generate xml for a calling a functional function
 * @param {string} name The name of the function
 * @param {Object<string, string>[]} argList Name and type for each arg
 */
exports.functionalCallXml = function(name, argList, inputContents) {
  if (argList.length !== inputContents.length) {
    throw new Error('must define contents for each arg');
  }

  var mutation = '<mutation name="' + name + '">';
  argList.forEach(function(argInfo) {
    mutation +=
      '<arg name="' + argInfo.name + '" type="' + argInfo.type + '"></arg>';
  });
  mutation += '</mutation>';

  var contents = '';
  inputContents.forEach(function(blockXml, index) {
    contents +=
      '<functional_input name="ARG' +
      index +
      '">' +
      blockXml +
      '</functional_input>';
  });

  return '<block type="functional_call">' + mutation + contents + '</block>';
};

/**
 * Removes all the deletable, movable, and uservisible attributes from the
 * blocks in blocksDom.
 */
exports.cleanBlocks = function(blocksDom) {
  xml.visitAll(blocksDom, block => {
    if (!block.getAttribute) {
      return;
    }
    ATTRIBUTES_TO_CLEAN.forEach(attr => block.removeAttribute(attr));
  });
};

/**
 * Adds any functions from functionsXml to blocksXml. If a function with the
 * same id is already present in blocksXml, it won't be added again.
 */
exports.appendNewFunctions = function(blocksXml, functionsXml) {
  const startBlocksDom = xml.parseElement(blocksXml);
  const sharedFunctionsDom = xml.parseElement(functionsXml);
  const functions = [...sharedFunctionsDom.ownerDocument.firstChild.childNodes];
  for (let func of functions) {
    let ownerDocument = func.ownerDocument.evaluate
      ? func.ownerDocument
      : document;
    let startBlocksDocument = startBlocksDom.ownerDocument.evaluate
      ? startBlocksDom.ownerDocument
      : document;
    const node = ownerDocument.evaluate(
      'field[@name="NAME"]',
      func,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null
    ).singleNodeValue;
    const name = node && node.id;
    const type = ownerDocument.evaluate(
      '@type',
      func,
      null,
      XPathResult.STRING_TYPE,
      null
    ).stringValue;
    const alreadyPresent =
      startBlocksDocument.evaluate(
        `//block[@type="${type}"]/field[@id="${name}"]`,
        startBlocksDom,
        null,
        XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,
        null
      ).snapshotLength > 0;
    if (!alreadyPresent) {
      startBlocksDom.ownerDocument.firstChild.appendChild(func);
    }
  }
  return xml.serialize(startBlocksDom);
};

/**
 * Definition of an input type. Must have either addInputRow or addInput
 * defined, but not both.
 *
 * @typedef {Object} InputType
 * @property {?function(Blockly, Blockly.Block, InputConfig): Blockly.Input} addInputRow
 *   Adds a potentially line-ending input to the provided block and returns the
 *   new input.
 * @property {?function(Blockly, Blockly.Block, InputConfig, Blockly.Input)} addInput
 *   Adds an inline input by appending fields or titles to the provided input
 * @property {function(Blockly.Block, InputConfig): string} generateCode
 *   Return the code to be inserted as an argument to the function call
 *   generated for the give block.
 */

/**
 * @typedef {Object} InputConfig
 * @property {string} name Input name, conventionally all-caps
 * @property {string[][]|Function} options For dropdowns, the list of options.
 *   Each entry is a 2-element string array with the display name first, and the
 *   codegen-compatible value second (i.e. strings should be doubly-quoted).
 *   Also accepts a zero-argument function to generate these options.
 * @property {Blockly.BlockValueType} type For value inputs, the type required.
 *   Use Blockly.BlockValueType.NONE to accept any block.
 * @property {boolean} statement Indicates that an input is a statement input,
 *   which is passed as a callback function.
 * @property {string} customInput Use the customInput type under this name to
 *   add this input to the block.
 * @property {boolean} field Indicates that an input is a field input, i.e. a
 *   textbox. The generated code will be wrapped in quotes if the arg has type
 *   "String".
 * @property {boolean} dummy Indicates that an input should be a dummy input, i.e. does
 * not render a connection or generate code. Useful as a line break or to add an
 * image to a block.
 * @property {boolean} assignment Indicates that this block should generate
 *   an assignment statement, with this input yielding the variable name.
 * @property {boolean} defer Indicates that this input should be wrapped in a
 *   function before being passed into func, so that evaluation can be deferred
 *   until later.
 * @property {boolean} variableInput Indicates that an input is a variable. The block
 *   will have a dropown selector populated with all the variables in the program.
 *   The generated code will be the variable, which will be defined as a global variable in the program.
 */

/**
 * @typedef {Object} LabeledInputConfig
 * @augments InputConfig
 * @property {string} mode Name of the input type used for this input, either a
 *   key from STANDARD_INPUT_TYPES or one defined as a customInputType.
 * @property {string} label Text to display to the left of the input.
 */

const DROPDOWN_INPUT = 'dropdown';
const VALUE_INPUT = 'value';
const INLINE_DUMMY_INPUT = 'inlineDummy';
const DUMMY_INPUT = 'dummy';
const STATEMENT_INPUT = 'statement';
const FIELD_INPUT = 'field';
const VARIABLE_INPUT = 'variable';

/**
 * Splits a blockText into labelled inputs, each match will a label followed by
 * an input. The label is an arbitrary (possibly empty) string. The input is
 * either a real named input like '{VALUE}', a newline, or if it matched a
 * trailing label, nothing.
 */
const LABELED_INPUTS_REGEX = /.*?({[^}]*}|\n|$)/gm;

/**
 * Splits a labeled input into its parts. The resulting groups are:
 * 1: the label
 * 2: the input (a named input like '{VALUE}', a newline, or nothing)
 * 3: the input's name (e.g. 'VALUE')
 */
const LABELED_INPUT_PARTS_REGEX = /(.*?)({([^}]*)}|\n|$)/m;

/**
 * Finds the input config for the given input name, and removes it from args.
 * @param {InputConfig[]} args List of configs to search through
 * @param {string} inputName name of input to find and remove
 * @returns InputConfig the input config with name `inputName`
 */
const findAndRemoveInputConfig = (args, inputName) => {
  const argIndex = args.findIndex(arg => arg.name === inputName);
  if (argIndex !== -1) {
    return args.splice(argIndex, 1)[0];
  }
  throw new Error(`${inputName} not found in args`);
};

/**
 * Given block text with input names specified in curly braces, returns a list
 * of labeled inputs that should be added to the block.
 *
 * @param {string} text The complete message shown on the block with inputs in
 *   curly braces, e.g. "Move the {SPRITE} {PIXELS} to the {DIR}"
 * @param {InputConfig[]} args Define the type/options of the block's inputs.
 * @params {string[]} strictTypes Input/output types that are always configerd
 *   with strict type checking.
 *
 * @returns {LabeledInputConfig[]} a list of labeled inputs
 */
const determineInputs = function(text, args, strictTypes = []) {
  const tokens = text.match(LABELED_INPUTS_REGEX);
  if (tokens.length && tokens[tokens.length - 1] === '') {
    tokens.pop();
  }
  const inputs = tokens.map(token => {
    const parts = token.match(LABELED_INPUT_PARTS_REGEX);
    const label = parts[1];
    const inputName = parts[3];
    if (inputName) {
      const arg = findAndRemoveInputConfig(args, inputName);
      const strict = arg.strict || strictTypes.includes(arg.type);
      let mode;
      if (arg.options) {
        mode = DROPDOWN_INPUT;
      } else if (arg.field) {
        mode = FIELD_INPUT;
      } else if (arg.customInput) {
        mode = arg.customInput;
      } else if (arg.statement) {
        mode = STATEMENT_INPUT;
      } else if (arg.dummy) {
        mode = arg.inline ? INLINE_DUMMY_INPUT : DUMMY_INPUT;
      } else if (arg.variableInput) {
        mode = VARIABLE_INPUT;
      } else {
        mode = VALUE_INPUT;
      }
      const labeledInput = {
        name: arg.name,
        mode,
        label,
        strict,
        type: arg.type,
        options: arg.options,
        assignment: arg.assignment,
        defer: arg.defer,
        customOptions: arg.customOptions
      };
      Object.keys(labeledInput).forEach(key => {
        if (labeledInput[key] === undefined) {
          delete labeledInput[key];
        }
      });
      return labeledInput;
    } else {
      return {
        mode: DUMMY_INPUT,
        label
      };
    }
  });
  const statementInputs = args
    .filter(arg => arg.statement)
    .map(arg => ({
      mode: STATEMENT_INPUT,
      name: arg.name
    }));
  inputs.push(...statementInputs);
  args = args.filter(arg => !arg.statement);

  if (args.length > 0) {
    console.warn('Unexpected args in block definition:');
    console.warn(args);
  }
  return inputs;
};
exports.determineInputs = determineInputs;

/**
 * @type {Object.<string, InputType>}
 */
const STANDARD_INPUT_TYPES = {
  [VALUE_INPUT]: {
    addInputRow(blockly, block, inputConfig) {
      const inputRow = block
        .appendValueInput(inputConfig.name)
        .setAlign(blockly.ALIGN_RIGHT);
      if (inputConfig.strict) {
        inputRow.setStrictCheck(inputConfig.type);
      } else {
        inputRow.setCheck(inputConfig.type);
      }
      return inputRow;
    },
    generateCode(block, inputConfig) {
      return Blockly.JavaScript.valueToCode(
        block,
        inputConfig.name,
        Blockly.JavaScript.ORDER_COMMA
      );
    }
  },
  [STATEMENT_INPUT]: {
    addInputRow(blockly, block, inputConfig) {
      return block.appendStatementInput(inputConfig.name);
    },
    generateCode(block, inputConfig) {
      const code = Blockly.JavaScript.statementToCode(block, inputConfig.name);
      return `function () {\n${code}}`;
    }
  },
  [INLINE_DUMMY_INPUT]: {
    addInput(blockly, block, inputConfig, currentInputRow) {
      if (inputConfig.customOptions && inputConfig.customOptions.assetUrl) {
        currentInputRow
          .appendField(inputConfig.label)
          .appendField(
            new Blockly.FieldImage(
              Blockly.assetUrl(inputConfig.customOptions.assetUrl),
              inputConfig.customOptions.width,
              inputConfig.customOptions.height
            )
          );
      }
    },
    generateCode(block, inputConfig) {
      return null;
    }
  },
  [DUMMY_INPUT]: {
    addInputRow(blockly, block, inputConfig) {
      return block.appendDummyInput();
    },
    generateCode(block, inputConfig) {
      return null;
    }
  },
  [DROPDOWN_INPUT]: {
    addInput(blockly, block, inputConfig, currentInputRow) {
      const options = sanitizeOptions(inputConfig.options);
      const dropdown = new blockly.FieldDropdown(options);
      currentInputRow
        .appendField(inputConfig.label)
        .appendField(dropdown, inputConfig.name);
    },
    generateCode(block, inputConfig) {
      let code = block.getFieldValue(inputConfig.name);
      if (
        inputConfig.type === Blockly.BlockValueType.STRING &&
        !code.startsWith('"') &&
        !code.startsWith("'")
      ) {
        // Wraps the value in quotes, and escapes quotes/newlines
        code = JSON.stringify(code);
      }
      return code;
    }
  },
  [VARIABLE_INPUT]: {
    addInput(blockly, block, inputConfig, currentInputRow) {
      // Make sure the variable name gets declared at the top of the program
      block.getVars = function() {
        return {
          [Blockly.Variables.DEFAULT_CATEGORY]: [
            block.getFieldValue(inputConfig.name)
          ]
        };
      };

      // The following functions make sure that the variable naming/renaming options work for this block
      block.renameVar = function(oldName, newName) {
        if (
          Blockly.Names.equals(oldName, block.getFieldValue(inputConfig.name))
        ) {
          block.setTitleValue(newName, inputConfig.name);
        }
      };
      block.removeVar = function(oldName) {
        if (
          Blockly.Names.equals(oldName, block.getFieldValue(inputConfig.name))
        ) {
          block.dispose(true, true);
        }
      };
      block.superSetTitleValue = block.setTitleValue;
      block.setTitleValue = function(newValue, name) {
        if (name === inputConfig.name && block.blockSpace.isFlyout) {
          newValue = Blockly.Variables.generateUniqueName(newValue);
        }
        block.superSetTitleValue(newValue, name);
      };

      // Add the variable field to the block
      currentInputRow
        .appendField(inputConfig.label)
        .appendField(new Blockly.FieldVariable(null), inputConfig.name);
    },
    generateCode(block, inputConfig) {
      return Blockly.JavaScript.translateVarName(
        block.getFieldValue(inputConfig.name)
      );
    }
  },
  [FIELD_INPUT]: {
    addInput(blockly, block, inputConfig, currentInputRow) {
      const BlocklyField = Blockly.getFieldForInputType(inputConfig.type);
      const field = new BlocklyField(
        '',
        getFieldInputChangeHandler(blockly, inputConfig.type)
      );
      currentInputRow
        .appendField(inputConfig.label)
        .appendField(field, inputConfig.name);
    },
    generateCode(block, inputConfig) {
      let code = block.getFieldValue(inputConfig.name);
      if (inputConfig.type === Blockly.BlockValueType.STRING) {
        // Wraps the value in quotes, and escapes quotes/newlines
        code = JSON.stringify(code);
      }
      return code;
    }
  }
};

/**
 * Given a type string for a field input, returns an appropriate change handler function
 * for that type, which customizes the input field and provides validation on blur.
 * @param {Blockly} blockly
 * @param {string} type
 * @returns {?function}
 */
function getFieldInputChangeHandler(blockly, type) {
  const clampedNumberMatch = type.match(CLAMPED_NUMBER_REGEX);
  if (clampedNumberMatch) {
    const min = parseFloat(clampedNumberMatch[1]);
    const max = parseFloat(clampedNumberMatch[2]);
    return Blockly.FieldTextInput.clampedNumberValidator(min, max);
  } else if ('Number' === type) {
    return blockly.FieldTextInput.numberValidator;
  } else {
    return undefined;
  }
}

const groupInputsByRow = function(inputs, inputTypes = STANDARD_INPUT_TYPES) {
  const inputRows = [];
  let lastGroup = [];
  inputRows.push(lastGroup);
  inputs.forEach(input => {
    lastGroup.push(input);
    if (inputTypes[input.mode].addInputRow) {
      lastGroup = [];
      inputRows.push(lastGroup);
    }
  });
  const lastRow = inputRows[inputRows.length - 1];
  if (inputRows[inputRows.length - 1].length) {
    lastRow.push({mode: DUMMY_INPUT});
  } else {
    inputRows.pop();
  }
  return inputRows;
};
exports.groupInputsByRow = groupInputsByRow;

/**
 * Adds the specified inputs to the block
 * @param {Blockly} blockly The Blockly object provided to install()
 * @param {Block} block The block to add the inputs to
 * @param {LabeledInputConfig[][]} inputs The list of inputs to interpolate,
 *   grouped by row.
 * @param {Object.<string, InputType>} inputTypes A map of input type names to
 *   their definitions,
 * @param {boolean} inline Whether inputs are being rendered inline
 */
const interpolateInputs = function(
  blockly,
  block,
  inputRows,
  inputTypes = STANDARD_INPUT_TYPES,
  inline
) {
  inputRows.forEach(inputRow => {
    // Create the last input in the row first
    const lastInputConfig = inputRow[inputRow.length - 1];
    const lastInput = inputTypes[lastInputConfig.mode].addInputRow(
      blockly,
      block,
      lastInputConfig
    );

    // Append the rest of the inputs onto that
    inputRow.slice(0, -1).forEach(inputConfig => {
      inputTypes[inputConfig.mode].addInput(
        blockly,
        block,
        inputConfig,
        lastInput
      );
    });

    // Finally append the last input's label
    lastInput.appendField(lastInputConfig.label);
  });
};
exports.interpolateInputs = interpolateInputs;

/**
 * Create a block generator that creats blocks that directly map to a javascript
 * function call, method call, or other (hopefully simple) expression.
 *
 * @params {Blockly} blockly The Blockly object provided to install()
 * @params {string[]} strictTypes Input/output types that are always configerd
 *   with strict type checking.
 * @params {string} defaultObjectType Default type used for the 'THIS' input in
 *   method call blocks.
 * @param {Object.<string,InputType>} customInputTypes customType input
 *   definitions.
 * @returns {function} A function that takes a bunch of block properties and
 *   adds a block to the blockly.Blocks object. See param documentation below.
 */
exports.createJsWrapperBlockCreator = function(
  blockly,
  strictTypes,
  defaultObjectType,
  customInputTypes
) {
  const {ORDER_FUNCTION_CALL, ORDER_MEMBER, ORDER_NONE} = Blockly.JavaScript;

  const generator = blockly.getGenerator();

  const inputTypes = {
    ...STANDARD_INPUT_TYPES,
    ...customInputTypes
  };

  /**
   * Create a block that directly maps to a javascript function call, method
   * call, or other (hopefully simple) expression.
   *
   * @param {Object} opts Block options
   * @param {number[]} opts.color HSV block color as a 3-element number array
   * @param {string} opts.func For function/method calls, the function name
   * @param {string} opts.expression Instead of specifying func, use this param
   *   to specify an arbitrary javascript expression instead
   * @param {number} opts.orderPrecedence For expressions, the minimum binding
   *   strength of any operators in the expression. You can omit this, and the
   *   code generator code will just wrap the expression in parens, see:
   *   https://developers.google.com/blockly/guides/create-custom-blocks/operator-precedence
   * @param {string} opts.name Block name, defaults to func.
   * @param {string} opts.blockText Human-readable text to show on the block,
   *   with params specified in curly braces, see determineInputs()
   * @param {InputConfig[]} opts.args List of block inputs.
   * @param {BlockValueType} opts.returnType Type of value returned by this
   *   block, omit if you want a block with no output.
   * @param {boolean} opts.strictOutput Whether to enforce strict type checking
   *   on the output.
   * @param {boolean} opts.methodCall Generate a method call. The blockText
   *   should contain '{THIS}' in order to create an input for the instance
   * @params {string} opts.objectType Type used for the 'THIS' input in a method
   *   call block.
   * @param {string} opts.thisObject Specify an explicit `this` for method call.
   * @param {boolean} opts.eventBlock Generate an event block, which is just a
   *   block without a previous statement connector.
   * @param {boolean} opts.eventLoopBlock Generate an "event loop" block, which
   *   looks like a loop block but without previous or next statement connectors
   * @param {boolean} opts.inline Render inputs inline, defaults to false
   * @param {boolean} opts.simpleValue Just return the field value of the block.
   * @param {string[]} opts.extraArgs Additional arguments to pass into the generated function.
   * @param {string[]} opts.callbackParams Parameters to add to the generated callback function.
   * @param {string[]} opts.miniToolboxBlocks
   * @param {?string} helperCode The block's helper code, to verify the func.
   *
   * @returns {string} the name of the generated block
   */
  return (
    {
      color,
      func,
      expression,
      orderPrecedence,
      name,
      blockText,
      args,
      returnType,
      strictOutput,
      methodCall,
      objectType,
      thisObject,
      eventBlock,
      eventLoopBlock,
      inline,
      simpleValue,
      extraArgs,
      callbackParams,
      miniToolboxBlocks
    },
    helperCode,
    pool
  ) => {
    if (!pool || pool === 'GamelabJr') {
      pool = 'gamelab'; // Fix for users who already have the old blocks saved in their solutions.
      // TODO: when we nuke per-level custom blocks, `throw new Error('No block pool specified');`
    }
    if (!!func + !!expression + !!simpleValue !== 1) {
      throw new Error(
        'Provide exactly one of func, expression, or simpleValue'
      );
    }
    if (
      func &&
      helperCode &&
      !new RegExp(`function ${func}\\W`).test(helperCode)
    ) {
      throw new Error(`func '${func}' not found in helper code`);
    }
    if ((expression || simpleValue) && !name) {
      throw new Error('This block requires a name');
    }
    if (blockText === undefined) {
      throw new Error('blockText must be specified');
    }
    if (
      simpleValue &&
      (!args || args.filter(arg => !arg.assignment).length !== 1)
    ) {
      throw new Error(
        'simpleValue blocks must have exactly one non-assignment argument'
      );
    }
    if (simpleValue && !returnType && !args.some(arg => arg.assignment)) {
      throw new Error(
        'simpleValue blocks must specify a return type or have ' +
          'an assignment input'
      );
    }
    if (inline === undefined) {
      inline = true;
    }
    args = args || [];
    if (args.filter(arg => arg.statement).length > 1 && inline) {
      console.warn('blocks with multiple statement inputs cannot be inlined');
      inline = false;
    }
    args.forEach(arg => {
      if (arg.customInput && inputTypes[arg.customInput] === undefined) {
        throw new Error(
          `${arg.customInput} is not a valid input type, ` +
            `choose one of [${Object.keys(customInputTypes).join(', ')}]`
        );
      }
    });
    const blockName = `${pool}_${name || func}`;
    if (eventLoopBlock && args.filter(arg => arg.statement).length === 0) {
      // If the eventloop block doesn't explicitly list its statement inputs,
      // just tack one onto the end
      args.push({
        name: 'DO',
        statement: true
      });
    }
    const inputs = [...args];
    if (methodCall && !thisObject) {
      const thisType =
        objectType || defaultObjectType || Blockly.BlockValueType.NONE;
      inputs.push({
        name: 'THIS',
        type: thisType,
        strict: strictTypes.includes(thisType)
      });
    }
    const inputConfigs = determineInputs(blockText, inputs, strictTypes);
    const inputRows = groupInputsByRow(inputConfigs, inputTypes);
    if (inputRows.length === 1) {
      inline = false;
    }

    blockly.Blocks[blockName] = {
      helpUrl: '',
      init: function() {
        if (color) {
          Blockly.cdoUtils.setHSV(this, ...color);
        } else if (!returnType) {
          Blockly.cdoUtils.setHSV(this, ...DEFAULT_COLOR);
        }

        if (returnType) {
          this.setOutput(
            true,
            returnType,
            strictOutput || strictTypes.includes(returnType)
          );
        } else if (eventLoopBlock) {
          // No previous or next statement connector
        } else if (eventBlock) {
          this.setNextStatement(true);
          this.skipNextBlockGeneration = true;
        } else {
          this.setNextStatement(true);
          this.setPreviousStatement(true);
        }

        // Use window.appOptions, not global appOptions, because the levelbuilder
        // block page doesn't have appOptions, but we *do* want to show the mini-toolbox
        // there
        if (
          miniToolboxBlocks &&
          (!window.appOptions || window.appOptions.level.miniToolbox)
        ) {
          var toggle = new Blockly.FieldIcon('+');
          if (Blockly.cdoUtils.isWorkspaceReadOnly(this.blockSpace)) {
            toggle.setReadOnly();
          }

          var miniToolboxXml = '<xml>';
          miniToolboxBlocks.forEach(block => {
            miniToolboxXml += `\n <block type="${block}"></block>`;
          });
          miniToolboxXml += '\n</xml>';
          // Block.isMiniFlyoutOpen is used in the blockly repo to track whether or not the horizontal flyout is open.
          this.isMiniFlyoutOpen = false;
          // On button click, open/close the horizontal flyout, toggle button text between +/-, and re-render the block.
          Blockly.cdoUtils.bindBrowserEvent(
            toggle.fieldGroup_,
            'mousedown',
            this,
            () => {
              if (Blockly.cdoUtils.isWorkspaceReadOnly(this.blockSpace)) {
                return;
              }

              if (this.isMiniFlyoutOpen) {
                toggle.setValue('+');
              } else {
                toggle.setValue('-');
              }
              this.isMiniFlyoutOpen = !this.isMiniFlyoutOpen;
              this.render();
              // If the mini flyout just opened, make sure mini-toolbox blocks are updated with the right thumbnails.
              // This has to happen after render() because some browsers don't render properly if the elements are not
              // visible. The root cause is that getComputedTextLength returns 0 if a text element is not visible, so
              // the thumbnail image overlaps the label in Firefox, Edge, and IE.
              if (this.isMiniFlyoutOpen) {
                let miniToolboxBlocks = this.miniFlyout.blockSpace_.topBlocks_;
                let rootInputBlocks = this.getConnections_(true /* all */)
                  .filter(function(connection) {
                    return connection.type === Blockly.INPUT_VALUE;
                  })
                  .map(function(connection) {
                    return connection.targetBlock();
                  });
                miniToolboxBlocks.forEach(function(block, index) {
                  block.shadowBlockValue_(rootInputBlocks[index]);
                });
              }
            }
          );

          this.appendDummyInput()
            .appendField(toggle, 'toggle')
            .appendField(' ');

          this.initMiniFlyout(miniToolboxXml);
        }

        // Set block to shadow for preview field if needed
        switch (this.type) {
          case 'gamelab_clickedSpritePointer':
            this.setBlockToShadow(
              root =>
                root.type === 'gamelab_spriteClicked' &&
                root.getConnections_()[1] &&
                root.getConnections_()[1].targetBlock()
            );
            break;
          case 'gamelab_newSpritePointer':
            this.setBlockToShadow(
              root =>
                root.type === 'gamelab_whenSpriteCreated' &&
                root.getConnections_()[1] &&
                root.getConnections_()[1].targetBlock()
            );
            break;
          case 'gamelab_subjectSpritePointer':
            this.setBlockToShadow(
              root =>
                root.type === 'gamelab_checkTouching' &&
                root.getConnections_()[1] &&
                root.getConnections_()[1].targetBlock()
            );
            break;
          case 'gamelab_objectSpritePointer':
            this.setBlockToShadow(
              root =>
                root.type === 'gamelab_checkTouching' &&
                root.getConnections_()[2] &&
                root.getConnections_()[2].targetBlock()
            );
            break;
          default:
            // Not a pointer block, so no block to shadow
            break;
        }

        interpolateInputs(blockly, this, inputRows, inputTypes, inline);
        this.setInputsInline(inline);
      }
    };

    generator[blockName] = function() {
      let prefix = '';
      const values = args
        .map(arg => {
          const inputConfig = inputConfigs.find(
            input => input.name === arg.name
          );
          if (!inputConfig) {
            return;
          }
          let inputCode = inputTypes[inputConfig.mode].generateCode(
            this,
            inputConfig
          );
          if (inputConfig.assignment) {
            prefix += `${inputCode} = `;
          }
          if (inputCode === '') {
            // Missing inputs should be passed into func as undefined
            inputCode = 'undefined';
          }
          if (inputConfig.defer) {
            inputCode = `function () {\n  return ${inputCode};\n}`;
          }
          return inputCode;
        })
        .filter(value => value !== null);

      if (extraArgs) {
        values.push(...extraArgs);
      }

      if (simpleValue) {
        const code = prefix + values[args.findIndex(arg => !arg.assignment)];
        if (returnType !== undefined) {
          return [
            code,
            orderPrecedence === undefined ? ORDER_NONE : orderPrecedence
          ];
        } else {
          return code + ';\n';
        }
      }

      if (methodCall) {
        const object =
          thisObject ||
          Blockly.JavaScript.valueToCode(this, 'THIS', ORDER_MEMBER);
        prefix += `${object}.`;
      }

      if (eventBlock) {
        const nextBlock =
          this.nextConnection && this.nextConnection.targetBlock();
        let handlerCode = Blockly.JavaScript.blockToCode(nextBlock, false);
        handlerCode = Blockly.Generator.prefixLines(handlerCode, '  ');
        if (callbackParams) {
          let params = callbackParams.join(',');
          values.push(`function (${params}) {\n${handlerCode}}`);
        } else {
          values.push(`function () {\n${handlerCode}}`);
        }
      }

      if (
        this.type === 'gamelab_setPrompt' ||
        this.type === 'gamelab_setPromptWithChoices'
      ) {
        const input = this.getInput('VAR');
        if (input) {
          const targetBlock = input.connection.targetBlock();
          if (targetBlock && targetBlock.type === 'variables_get') {
            const varName = Blockly.JavaScript.blockToCode(targetBlock)[0];
            values.push(`function(val) {${varName} = val;}`);
          }
        }
      }

      if (expression) {
        // If the original expression has a value placeholder, replace it
        // with the selected value.
        let valueExpression = expression.replace('VALUE', values[0]);
        if (returnType !== undefined) {
          return [
            `${prefix}${valueExpression}`,
            orderPrecedence === undefined ? ORDER_NONE : orderPrecedence
          ];
        } else {
          return `${prefix}${valueExpression}`;
        }
      }

      if (returnType !== undefined) {
        return [`${prefix}${func}(${values.join(', ')})`, ORDER_FUNCTION_CALL];
      } else {
        return `${prefix}${func}(${values.join(', ')});\n`;
      }
    };

    return blockName;
  };
};

exports.installCustomBlocks = function({
  blockly,
  blockDefinitions,
  customInputTypes
}) {
  const createJsWrapperBlock = exports.createJsWrapperBlockCreator(
    blockly,
    [
      // Strict Types
      blockly.BlockValueType.SPRITE,
      blockly.BlockValueType.BEHAVIOR,
      blockly.BlockValueType.LOCATION
    ],
    blockly.BlockValueType.SPRITE,
    customInputTypes
  );

  const blocksByCategory = {};
  blockDefinitions.forEach(({name, pool, category, config, helperCode}) => {
    const blockName = createJsWrapperBlock(config, helperCode, pool);
    if (!blocksByCategory[category]) {
      blocksByCategory[category] = [];
    }
    blocksByCategory[category].push(blockName);
    if (name && blockName !== name) {
      console.error(
        `Block config ${name} generated a block named ${blockName}`
      );
    }
  });

  // TODO: extract Sprite-Lab-specific logic.
  if (
    blockly.Blocks.gamelab_location_variable_set &&
    blockly.Blocks.gamelab_location_variable_get
  ) {
    Blockly.Variables.registerGetter(
      Blockly.BlockValueType.LOCATION,
      'gamelab_location_variable_get'
    );
    Blockly.Variables.registerSetter(
      Blockly.BlockValueType.LOCATION,
      'gamelab_location_variable_set'
    );
  }

  return blocksByCategory;
};

/**
 * Adds a second value to options array elements if a second one does not exist.
 * The second value is used as the generated code for that option.
 * Required for backwards compatibility with existing blocks that are missing the second value.
 *
 * @param  {string[][]| string[]} dropdownOptions
 * @returns {string[][]} Sanitized array of dropdownOptions, ensuring that both a first and second value exist
 */
const sanitizeOptions = function(dropdownOptions) {
  return dropdownOptions.map(option =>
    option.length === 1 ? [option[0], option[0]] : option
  );
};
