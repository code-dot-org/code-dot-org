import {BLOCK_TYPES, PROCEDURE_DEFINITION_TYPES} from '../constants';
import {FALSEY_DEFAULT, TRUTHY_DEFAULT, readBooleanAttribute} from '../utils';

// The user created attribute needs to be read from XML start blocks as 'usercreated'.
// Once this has been done, all subsequent steps in the serialization use userCreated.
const USER_CREATED_XML_ATTRIBUTE = 'usercreated';

export default function initializeBlocklyXml(blocklyWrapper) {
  // Clear xml namespace
  blocklyWrapper.utils.xml.NAME_SPACE = '';

  // Aliasing Google's domToBlock() so that we can override it, but still be able
  // to call Google's domToBlock() in the override function.
  blocklyWrapper.Xml.originalDomToBlock = blocklyWrapper.Xml.domToBlock;
  // Override domToBlock so that we can gracefully handle unknown blocks.
  blocklyWrapper.Xml.domToBlock = function (
    xmlBlock,
    workspace,
    parentConnection,
    connectedToParentNext
  ) {
    let block;
    try {
      block = blocklyWrapper.Xml.originalDomToBlock(
        xmlBlock,
        workspace,
        parentConnection,
        connectedToParentNext
      );
    } catch (e) {
      console.warn(`Creating "unknown block". ${e.message}`);
      block = blocklyWrapper.Xml.originalDomToBlock(
        blocklyWrapper.Xml.textToDom('<block type="unknown" />'),
        workspace,
        parentConnection,
        connectedToParentNext
      );
      block
        .getField('NAME')
        .setValue(`unknown block: ${xmlBlock.getAttribute('type')}`);
    }
    return block;
  };

  /**
   * Decode an XML DOM and create blocks on the workspace while preserving the original order of blocks.
   *
   * @param {Blockly.Workspace} workspace - The Blockly workspace where blocks will be created.
   * @param {Element} xml - The XML DOM containing block elements to be created on the workspace.
   * @returns {Object[]} An array of objects containing the created blocks and their positions.
   */
  blocklyWrapper.Xml.domToBlockSpace = function (workspace, xml) {
    const partitionedBlockElements = getBlockElements(xml);
    const blocks = [];
    // To position the blocks, we first render them all to the Block Space
    //  and parse any X or Y coordinates set in the XML. Then, we store
    //  the rendered blocks and the coordinates in an array so that we can
    //  position them.
    partitionedBlockElements.forEach(xmlChild => {
      // Recursively check blocks for XML attributes that need to be manipulated.
      processBlockAndChildren(xmlChild);

      // Further manipulate the XML for specific top block types.
      addNameToBlockFunctionDefinitionBlock(xmlChild);
      addMutationToProcedureDefBlocks(xmlChild);
      addMutationToBehaviorDefBlocks(xmlChild);
      addMutationToMiniToolboxBlocks(xmlChild);
      makeWhenRunUndeletable(xmlChild);

      const blockly_block = Blockly.Xml.domToBlock(xmlChild, workspace);
      const x = parseInt(xmlChild.getAttribute('x'), 10);
      const y = parseInt(xmlChild.getAttribute('y'), 10);
      blocks.push({
        blockly_block: blockly_block,
        x: x,
        y: y,
      });
    });

    return blocks;
  };

  blocklyWrapper.Xml.blockSpaceToDom = blocklyWrapper.Xml.workspaceToDom;
}

/**
 * Adds a mutation element to a block if it should have an open miniflyout.
 * CDO Blockly uses an unsupported method for serializing miniflyout state
 * where arbitrary block attribute could be used to manage extra state.
 * Mainline Blockly expects a mutator. The presence of the mutation element
 * will trigger the block's domToMutation function to run, if it exists.
 *
 * @param {Element} blockElement - The XML element for a single block.
 */
export function addMutationToMiniToolboxBlocks(blockElement) {
  const miniflyoutAttribute = blockElement.getAttribute('miniflyout');
  const existingMutationElement = blockElement.querySelector('mutation');
  if (!miniflyoutAttribute || existingMutationElement) {
    // The block is the wrong type or has somehow already been processed.
    return;
  }
  // The default icon is a '+' symbol which represents a currently-closed flyout.
  const useDefaultIcon = miniflyoutAttribute === 'open' ? 'false' : 'true';

  // The mutation element does not exist, so create it.
  const newMutationElement =
    blockElement.ownerDocument.createElement('mutation');

  // Create new mutation attribute based on original block attribute.
  newMutationElement.setAttribute('useDefaultIcon', useDefaultIcon);

  // Place mutator before fields, values, and other nested blocks.
  blockElement.insertBefore(newMutationElement, blockElement.firstChild);

  // Remove the miniflyout attribute from the parent block element.
  blockElement.removeAttribute('miniflyout');
}

/**
 * Sets the deletable attribute on when_run blocks to false.
 *
 * @param {Element} blockElement - The XML element for a single block.
 */
export function makeWhenRunUndeletable(blockElement) {
  if (blockElement.getAttribute('type') !== BLOCK_TYPES.whenRun) {
    return;
  }
  blockElement.setAttribute('deletable', false);
}

/**
 * Adds a mutation element to a block if it is a behavior definition.
 * CDO Blockly uses an unsupported method for serializing state
 * where arbitrary XML attributes could hold important information.
 * Mainline Blockly expects a mutator. The presence of the mutation element
 * will trigger the block's domToMutation function to run, if it exists.
 *
 * @param {Element} blockElement - The XML element for a single block.
 */
export function addMutationToBehaviorDefBlocks(blockElement) {
  if (blockElement.getAttribute('type') !== BLOCK_TYPES.behaviorDefinition) {
    return;
  }
  const mutationElement =
    blockElement.querySelector('mutation') ||
    blockElement.ownerDocument.createElement('mutation');
  // Place mutator before fields, values, and other nested blocks.
  blockElement.insertBefore(mutationElement, blockElement.firstChild);

  // We need to keep track of whether the user created the behavior or not.
  // If not, it needs a static behavior id in order to be translatable
  // (e.g. shared behaviors).
  // In CDO Blockly, the 'usercreated' flag was set on the block. Google Blockly
  // expects this kind of extra state in a mutator.
  const userCreated = readBooleanAttribute(
    blockElement,
    USER_CREATED_XML_ATTRIBUTE,
    FALSEY_DEFAULT
  );
  mutationElement.setAttribute('userCreated', userCreated);

  // In CDO Blockly, behavior ids were stored on the field. Google Blockly
  // expects this kind of extra state in a mutator.
  const nameField = getFieldOrTitle(blockElement, 'NAME');
  const idAttribute = nameField && nameField.getAttribute('id');
  if (idAttribute) {
    // Create new mutation attribute based on original block attribute.
    mutationElement.setAttribute('behaviorId', idAttribute);
  }
}

/**
 * Adds a mutation element to a block if it is a procedure definition.
 * Currently, the only reason to have a mutator for procedures is to store
 * the 'usercreated' property. Behavior definition mutators are more complicated,
 * see addMutationToBehaviorDefBlocks.
 *
 * @param {Element} blockElement - The XML element for a single block.
 */
export function addMutationToProcedureDefBlocks(blockElement) {
  if (blockElement.getAttribute('type') !== BLOCK_TYPES.procedureDefinition) {
    return;
  }
  const mutationElement =
    blockElement.querySelector('mutation') ||
    blockElement.ownerDocument.createElement('mutation');
  // Place mutator before fields, values, and other nested blocks.
  blockElement.insertBefore(mutationElement, blockElement.firstChild);

  // We need to keep track of whether the user created the procedure definition.
  // In CDO Blockly, the 'usercreated' flag was set on the block. Google Blockly
  // expects this kind of extra state in a mutator.
  const userCreated = readBooleanAttribute(
    blockElement,
    USER_CREATED_XML_ATTRIBUTE,
    FALSEY_DEFAULT
  );
  mutationElement.setAttribute('userCreated', userCreated);
}

/**
 * Adds a mutation element to a block if it should be invisible.
 * These blocks will be loaded onto the hidden workspace for procedure definitions.
 *
 * @param {Element} blockElement - The XML element for a single block.
 */
export function addMutationToInvisibleBlocks(blockElement) {
  if (PROCEDURE_DEFINITION_TYPES.includes(blockElement.getAttribute('type'))) {
    return;
  }

  const invisible = !readBooleanAttribute(
    blockElement,
    'uservisible',
    TRUTHY_DEFAULT
  );

  if (!invisible) {
    return;
  }
  const mutationElement =
    blockElement.querySelector('mutation') ||
    blockElement.ownerDocument.createElement('mutation');
  // Place mutator before fields, values, and other nested blocks.
  blockElement.insertBefore(mutationElement, blockElement.firstChild);
  mutationElement.setAttribute('invisible', invisible);
}

/**
 * In the event that a legacy project has functions without names, add a name
 * to the definition block's NAME field.
 * @param {Element} blockElement - The XML element for a single block.
 */
export function addNameToBlockFunctionDefinitionBlock(blockElement) {
  const blockType = blockElement.getAttribute('type');
  if (blockType !== BLOCK_TYPES.procedureDefinition) {
    return;
  }
  const fieldElement = getFieldOrTitle(blockElement, 'NAME');
  if (!fieldElement) {
    return;
  }

  if (fieldElement.textContent === '') {
    fieldElement.textContent = Blockly.Msg.UNNAMED_KEY;
  }
}

/**
 * In the event that a legacy project has functions without names, add a name
 * to a call block's mutator.
 *
 * @param {Element} blockElement - The XML element for a single block.
 */
export function addNameToBlockFunctionCallBlock(blockElement) {
  const blockType = blockElement.getAttribute('type');
  if (blockType !== BLOCK_TYPES.procedureCall) {
    return;
  }
  const mutationElement =
    blockElement.querySelector('mutation') ||
    blockElement.ownerDocument.createElement('mutation');
  // Place mutator before fields, values, and other nested blocks.
  blockElement.insertBefore(mutationElement, blockElement.firstChild);
  if (!mutationElement.getAttribute('name')) {
    mutationElement.setAttribute('name', Blockly.Msg.UNNAMED_KEY);
  }
}

/**
 * If a field should was serialized before we had behavior ids, manually add
 * one based on the behavior name found in the field.
 *
 * @param {Element} blockElement - The XML element for a single block.
 */
function addMissingBehaviorId(blockElement) {
  const blockType = blockElement.getAttribute('type');
  if (blockType === BLOCK_TYPES.behaviorGet) {
    setIdFromTextContent(getFieldOrTitle(blockElement, 'VAR'));
  } else if (blockType === BLOCK_TYPES.behaviorDefinition) {
    setIdFromTextContent(getFieldOrTitle(blockElement, 'NAME'));
  }
}

/**
 * If a field should was serialized before we had behavior ids, manually add
 * one based on the behavior name found in the field.
 *
 * @param {Element} element - The XML element (title or field) for a block.
 */
function setIdFromTextContent(element) {
  if (!element.getAttribute('id')) {
    element.setAttribute('id', element.textContent);
  }
}
/**
 * Adds a mutation element to a block if it's a text join block with an input count.
 * CDO Blockly uses an unsupported method for serializing input count state
 * where an arbitrary block attribute could be used to manage extra state.
 * Mainline Blockly expects a mutator. The presence of the mutation element
 * will trigger the block's domToMutation function to run, if it exists.
 *
 * @param {Element} blockElement - The XML element for a single block.
 */
export function addMutationToTextJoinBlock(blockElement) {
  if (
    !['text_join', 'text_join_simple'].includes(
      blockElement.getAttribute('type')
    )
  ) {
    return;
  }
  const mutationElement =
    blockElement.querySelector('mutation') ||
    blockElement.ownerDocument.createElement('mutation');
  // Place mutator before fields, values, and other nested blocks.
  blockElement.insertBefore(mutationElement, blockElement.firstChild);

  // We need to keep track of the expected number of inputs in order to create them all.
  // Google Blockly expects this kind of extra state to be in a mutator.
  const inputCount = blockElement.getAttribute('inputcount');
  mutationElement.setAttribute('items', inputCount);
}

function getFieldOrTitle(blockElement, name) {
  // Title is the legacy name for field, we support getting name from
  // either field or title.
  return (
    blockElement.querySelector(`field[name="${name}"]`) ||
    blockElement.querySelector(`title[name="${name}"]`)
  );
}

/**
 * A helper function designed to process each individual block in an XML tree.
 * @param {Element} block - The XML element for a single block.
 */
function processBlockAndChildren(block) {
  processIndividualBlock(block);

  // Blocks can contain other blocks so we must process them recursively.
  const childBlocks = block.querySelectorAll('block');
  childBlocks.forEach(childBlock => {
    processBlockAndChildren(childBlock);
  });
}

/**
 * Perform any need manipulations for a given XML block element.
 * @param {Element} block - The XML element for a single block.
 */
function processIndividualBlock(block) {
  addNameToBlockFunctionCallBlock(block);
  addMissingBehaviorId(block);
  // Convert unsupported can_disconnect_from_parent attributes.
  makeLockedBlockImmovable(block);
  addMutationToTextJoinBlock(block);
  addMutationToInvisibleBlocks(block);
}

/**
 * CDO Blockly supported a can_disconnect_from_parent attribute that
 * effectively worked like the modern movable property. To prevent
 * unintended movability changes to student code, we convert the unsupported
 * can_disconnect_from_parentto movable.
 * @param {Element} block - The XML element for a single block.
 */
function makeLockedBlockImmovable(block) {
  const canDisconnectValue = block.getAttribute('can_disconnect_from_parent');
  // If present, value will be either "true" or "false" (string, not boolean)
  if (canDisconnectValue) {
    block.setAttribute('movable', canDisconnectValue);
    block.removeAttribute('can_disconnect_from_parent');
  }
}

/**
 * Extracts block elements from the provided XML and returns them.
 * If no block elements are found in the XML, an empty array is returned.
 *
 * @param {Element} xml - The XML element containing block elements.
 * @param {string[]} prioritizedBlockTypes - An array of strings representing block types.
 *    These types are moved to the front of the list while maintaining the order of non-prioritized types.
 * @returns {Element[]} An array of partitioned block elements or an empty array if no blocks are present.
 */
export function getBlockElements(xml) {
  // Convert XML to an array of block elements
  const blockElements = Array.from(xml.querySelectorAll('xml > block'));

  // Check if any block elements were found
  if (blockElements.length === 0) {
    return [];
  }

  return blockElements;
}
