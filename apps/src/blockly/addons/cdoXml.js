import {PROCEDURE_DEFINITION_TYPES} from '../constants';
import {partitionBlocksByType} from './cdoUtils';

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
    const partitionedBlockElements = getPartitionedBlockElements(
      xml,
      PROCEDURE_DEFINITION_TYPES
    );
    const blocks = [];
    // To position the blocks, we first render them all to the Block Space
    //  and parse any X or Y coordinates set in the XML. Then, we store
    //  the rendered blocks and the coordinates in an array so that we can
    //  position them.
    partitionedBlockElements.forEach(xmlChild => {
      processAllBlocks(xmlChild);
      addMutationToBehaviorDefBlocks(xmlChild);
      addMutationToMiniToolboxBlocks(xmlChild);
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

  blocklyWrapper.Xml.createBlockOrderMap = createBlockOrderMap;
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
 * Adds a mutation element to a block if it is a behavior definition.
 * CDO Blockly uses an unsupported method for serializing state
 * where arbitrary XML attributes could hold important information.
 * Mainline Blockly expects a mutator. The presence of the mutation element
 * will trigger the block's domToMutation function to run, if it exists.
 *
 * @param {Element} blockElement - The XML element for a single block.
 */
export function addMutationToBehaviorDefBlocks(blockElement) {
  if (blockElement.getAttribute('type') !== 'behavior_definition') {
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
  const usercreatedAttribute = blockElement.getAttribute('usercreated');
  const userCreated = usercreatedAttribute === 'true';
  mutationElement.setAttribute('userCreated', userCreated);

  // In CDO Blockly, behavior ids were stored on the field. Google Blockly
  // expects this kind of extra state in a mutator.
  const nameField = blockElement.querySelector('field[name="NAME"]');
  const idAttribute = nameField && nameField.getAttribute('id');
  if (idAttribute) {
    // Create new mutation attribute based on original block attribute.
    mutationElement.setAttribute('behaviorId', idAttribute);
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
export function addMutationToTextJoinBlocks(blockElement) {
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
  // If not, it needs a static behavior id in order to be translatable
  // (e.g. shared behaviors).
  // In CDO Blockly, the 'usercreated' flag was set on the block. Google Blockly
  // expects this kind of extra state in a mutator.
  const inputCount = blockElement.getAttribute('inputcount');
  mutationElement.setAttribute('items', inputCount);
  // Remove the inputcount attribute from the parent block element.
  blockElement.removeAttribute('inputcount');
}

/**
 * A helper function designed to process each individual block in an XML tree.
 * @param {Element} block - The XML element for a single block.
 */
function processAllBlocks(block) {
  processIndividualBlock(block);

  // Blocks can contain other blocks so we must process them recursively.
  const childBlocks = block.querySelectorAll('block');
  childBlocks.forEach(childBlock => {
    processAllBlocks(childBlock);
  });
}

/**
 * Perform any need manipulations for a given XML block element.
 * @param {Element} block - The XML element for a single block.
 */
function processIndividualBlock(block) {
  // Convert unsupported can_disconnect_from_parent attributes.
  makeLockedBlockImmovable(block);
  addMutationToTextJoinBlocks(block);
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
 * Creates a block order map for the given XML by partitioning the block
 * elements based on their types and mapping their partitioned positions to
 * their original positions in the XML. This is used to reset a list of
 * blocks into their original order before re-positioning blocks on the
 * rendered workspace.
 *
 * @param {Element} xml - The XML element containing block elements to create the order map.
 * @returns {Map} A map with partitioned block index as key and original index in the XML as value.
 */
export function createBlockOrderMap(xml) {
  // Convert XML to an array of block elements
  const blockElements = Array.from(xml.childNodes).filter(
    node => node.nodeName.toLowerCase() === 'block'
  );
  const partitionedBlockElements = getPartitionedBlockElements(
    xml,
    PROCEDURE_DEFINITION_TYPES
  );
  const blockOrderMap = new Map();
  blockElements.forEach((element, index) => {
    blockOrderMap.set(partitionedBlockElements.indexOf(element), index);
  });
  return blockOrderMap;
}

/**
 * Extracts block elements from the provided XML and returns them partitioned based on their types.
 * If no block elements are found in the XML, an empty array is returned.
 *
 * @param {Element} xml - The XML element containing block elements.
 * @param {string[]} prioritizedBlockTypes - An array of strings representing block types.
 *    These types are moved to the front of the list while maintaining the order of non-prioritized types.
 * @returns {Element[]} An array of partitioned block elements or an empty array if no blocks are present.
 */
export function getPartitionedBlockElements(xml, prioritizedBlockTypes) {
  // Convert XML to an array of block elements
  const blockElements = Array.from(xml.querySelectorAll('xml > block'));

  // Check if any block elements were found
  if (blockElements.length === 0) {
    return [];
  }

  // Procedure definitions should be loaded ahead of call
  // blocks, so that the procedures map is updated correctly.
  const partitionedBlockElements = partitionBlocksByType(
    blockElements,
    prioritizedBlockTypes,
    true
  );
  return partitionedBlockElements;
}
