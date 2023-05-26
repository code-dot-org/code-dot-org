import _ from 'lodash';
import xml from './xml';
import createJsWrapperBlockCreator from './blockUtils/jsWrapperBlockCreator';
import {
  determineInputs,
  groupInputsByRow,
  interpolateInputs,
} from './blockUtils/inputHelpers';
const ATTRIBUTES_TO_CLEAN = ['uservisible', 'deletable', 'movable'];

/**
 * Create the xml for a level's toolbox
 * @param {string} blocks The xml of the blocks to go in the toolbox
 */
const createToolbox = function (blocks) {
  return '<xml id="toolbox" style="display: none;">' + blocks + '</xml>';
};

const appendBlocks = function (toolboxDom, blockTypes) {
  const root = toolboxDom.firstChild;
  blockTypes.forEach(blockName => {
    const block = toolboxDom.createElement('block');
    block.setAttribute('type', blockName);
    root.appendChild(block);
  });
  return xml.serialize(toolboxDom);
};

const appendBlocksByCategory = function (toolboxXml, blocksByCategory) {
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
const blockOfType = function (type, titles, values) {
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
          <title name="${values[key].titleName}">${values[key].titleValue}</title>
        </block>
      </value>`;
    }
  }
  return `<block type="${type}">${inputText}</block>`;
};

/*
 * Creates an XML node for an individual block. See blockOfType for params
 */
const blockAsXmlNode = function (type, inputs = {}) {
  return xml.parseElement(blockOfType(type, inputs.titles, inputs.values))
    .firstChild;
};

/**
 * Create the xml for a block of the given type, with the provided child nested
 * in a next block
 * @param {string} type The type of the block
 * @param {Object.<string,string>} [titles] Dictionary of titles mapping name to value
 * @param {string} child Xml for the child block
 */
const blockWithNext = function (type, titles, child) {
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
const blocksFromList = function (types) {
  if (types.length === 1) {
    return this.blockOfType(types[0]);
  }

  return this.blockWithNext(types[0], {}, this.blocksFromList(types.slice(1)));
};

/**
 * Create the xml for a category in a toolbox
 */
const createCategory = function (name, blocks, custom) {
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
const generateSimpleBlock = function (blockly, generator, options) {
  ['name', 'title', 'tooltip', 'functionName'].forEach(function (param) {
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
    init: function () {
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
    },
  };

  generator[name] = function () {
    // Generate JavaScript for putting dirt on to a tile.
    return functionName + "('block_id_" + this.id + "');\n";
  };
};

/**
 * Generates a single block from a <block/> DOM element, adding it to the main workspace
 * @param blockDOM {Element}
 * @returns {*}
 */
const domToBlock = function (blockDOM) {
  return Blockly.Xml.domToBlock(Blockly.mainBlockSpace, blockDOM);
};

/**
 * Generates a single block from a block XML string—e.g., <block type="testBlock"></block>,
 * and adds it to the main workspace
 * @param blockDOMString
 * @returns {*}
 */
const domStringToBlock = function (blockDOMString) {
  return domToBlock(xml.parseElement(blockDOMString).firstChild);
};

/**
 * Takes a set of start blocks, and returns them with a particular top level
 * block inserted in front of the first non-function block.  If we already have
 * this block, does nothing.
 */
const forceInsertTopBlock = function (input, blockType) {
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
const calcBlockXml = function (type, args) {
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
      arg = calcBlockGetVar(arg);
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
const calcBlockGetVar = function (variableName) {
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
const mathBlockXml = function (type, inputs, titles) {
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
 * Generate xml for a functional definition
 * @param {string} name The name of the function
 * @param {string} outputType Function's output type
 * @param {Object<string, string>[]} argList Name and type for each arg
 * @param {string} blockXml Xml for the blocks that actually define the function
 */
const functionalDefinitionXml = function (name, outputType, argList, blockXml) {
  var mutation = '<mutation>';
  argList.forEach(function (argInfo) {
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
const functionalCallXml = function (name, argList, inputContents) {
  if (argList.length !== inputContents.length) {
    throw new Error('must define contents for each arg');
  }

  var mutation = '<mutation name="' + name + '">';
  argList.forEach(function (argInfo) {
    mutation +=
      '<arg name="' + argInfo.name + '" type="' + argInfo.type + '"></arg>';
  });
  mutation += '</mutation>';

  var contents = '';
  inputContents.forEach(function (blockXml, index) {
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
const cleanBlocks = function (blocksDom) {
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
const appendNewFunctions = function (blocksXml, functionsXml) {
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

const installCustomBlocks = function ({
  blockly,
  blockDefinitions,
  customInputTypes,
}) {
  const createJsWrapperBlock = createJsWrapperBlockCreator(
    blockly,
    [
      // Strict Types
      blockly.BlockValueType.SPRITE,
      blockly.BlockValueType.BEHAVIOR,
      blockly.BlockValueType.LOCATION,
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

export default {
  createToolbox,
  appendBlocks,
  appendBlocksByCategory,
  blockOfType,
  blockAsXmlNode,
  blockWithNext,
  blocksFromList,
  createCategory,
  generateSimpleBlock,
  domToBlock,
  domStringToBlock,
  forceInsertTopBlock,
  calcBlockXml,
  calcBlockGetVar,
  mathBlockXml,
  functionalDefinitionXml,
  functionalCallXml,
  cleanBlocks,
  appendNewFunctions,
  installCustomBlocks,
  determineInputs,
  groupInputsByRow,
  interpolateInputs,
  createJsWrapperBlockCreator,
};
