import xml from '../xml';
import createJsWrapperBlockCreator from './jsWrapperBlockCreator';

/**
 * Create the xml for a block of the given type
 * @param {string} type The type of the block
 * @param {Object.<string,string>} [titles] Dictionary of titles mapping name to value
 * @param {Object} [values] Dictionary of values mapping name to value
 * @param {string} values.type Type of the value input
 * @param {string} values.titleName Name of the title block
 * @param {string} values.titleValue Input value
 */
export const blockOfType = function (type, titles, values) {
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
export const blockAsXmlNode = function (type, inputs = {}) {
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
export const blockWithNext = function (type, titles, child) {
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
export const blocksFromList = function (types) {
  if (types.length === 1) {
    return this.blockOfType(types[0]);
  }

  return this.blockWithNext(types[0], {}, this.blocksFromList(types.slice(1)));
};

/**
 * Generate a simple block with a plain title and next/previous connectors.
 */
export const generateSimpleBlock = function (blockly, generator, options) {
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
export const domStringToBlock = function (blockDOMString) {
  return domToBlock(xml.parseElement(blockDOMString).firstChild);
};

/**
 * Takes a set of start blocks, and returns them with a particular top level
 * block inserted in front of the first non-function block.  If we already have
 * this block, does nothing.
 */
export const forceInsertTopBlock = function (input, blockType) {
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

const ATTRIBUTES_TO_CLEAN = ['uservisible', 'deletable', 'movable'];

/**
 * Removes all the deletable, movable, and uservisible attributes from the
 * blocks in blocksDom.
 */
export const cleanBlocks = function (blocksDom) {
  xml.visitAll(blocksDom, block => {
    if (!block.getAttribute) {
      return;
    }
    ATTRIBUTES_TO_CLEAN.forEach(attr => block.removeAttribute(attr));
  });
};

export const installCustomBlocks = function ({
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
