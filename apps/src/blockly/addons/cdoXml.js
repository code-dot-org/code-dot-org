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
  if (!miniflyoutAttribute) {
    return; // Not a miniflyout block
  }
  // The default icon is a '+' symbol which represents a currently-closed flyout.
  const useDefaultIcon = miniflyoutAttribute === 'open' ? 'false' : 'true';
  // We don't expect a mutation to exist yet, but check just in case.
  const existingMutationElement = blockElement.querySelector('mutation');

  if (!existingMutationElement) {
    // The mutation element does not exist, so create it.
    const newMutationElement =
      blockElement.ownerDocument.createElement('mutation');

    // Create new mutation attribute based on original block attribute.
    newMutationElement.setAttribute('useDefaultIcon', useDefaultIcon);

    // Place mutator before fields, values, and other nested blocks.
    blockElement.insertBefore(newMutationElement, blockElement.firstChild);
  } else {
    // The mutation element already exists, inspect it.
    const existingUseDefaultIcon =
      existingMutationElement.getAttribute('useDefaultIcon');

    // If the useDefaultIcon attribute is not set, set it based on the block attribute.
    if (existingUseDefaultIcon === null) {
      existingMutationElement.setAttribute('useDefaultIcon', useDefaultIcon);
    }
  }

  // Remove the miniflyout attribute from the parent block element.
  blockElement.removeAttribute('miniflyout');
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
  const blockElements = Array.from(xml.childNodes).filter(
    node => node.nodeName.toLowerCase() === 'block'
  );

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
