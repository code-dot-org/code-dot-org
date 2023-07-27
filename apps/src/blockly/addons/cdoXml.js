import {PROCEDURE_DEFINITION_TYPES} from '../constants';

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

  // Decode an XML DOM and create blocks on the workspace.
  blocklyWrapper.Xml.domToBlockSpace = function (workspace, xml) {
    Blockly.Xml.createBlockOrderMap(xml);
    const sortedBlockElements = getSortedBlockElements(
      xml,
      PROCEDURE_DEFINITION_TYPES
    );
    const blocks = [];
    // To position the blocks, we first render them all to the Block Space
    //  and parse any X or Y coordinates set in the XML. Then, we store
    //  the rendered blocks and the coordinates in an array so that we can
    //  position them.
    sortedBlockElements.forEach(xmlChild => {
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
 * Creates a block order map for the given XML by sorting the block elements and
 * mapping their sorted positions to their original positions in the XML.
 * This is used to reset a list of blocks into their original order before
 * re-positioning blocks on the rendered workspace.
 *
 * @param {Element} xml - The XML element containing block elements to create the order map.
 * @returns {Map} A map with sorted block index as key and original index in the XML as value.
 */
export function createBlockOrderMap(xml) {
  // Convert XML to an array of block elements
  const unsortedBlockElements = Array.from(xml.childNodes).filter(
    node => node.nodeName.toLowerCase() === 'block'
  );
  const sortedBlockElements = getSortedBlockElements(
    xml,
    PROCEDURE_DEFINITION_TYPES
  );
  const blockOrderMap = new Map();
  unsortedBlockElements.forEach((element, index) => {
    blockOrderMap.set(sortedBlockElements.indexOf(element), index);
  });
  return blockOrderMap;
}

/**
 * Extracts block elements from the provided XML and returns them sorted based on their types.
 * If no block elements are found in the XML, an empty array is returned.
 *
 * @param {Element} xml - The XML element containing block elements.
 * @param {string[]} types - An array of strings representing block types. These types are moved to the front of the list.
 * @returns {Array} An array of sorted block elements or an empty array if no blocks are present.
 */
export function getSortedBlockElements(xml, types) {
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
  const sortedBlockElements = sortBlocksByType(blockElements, types);
  return sortedBlockElements;
}

/**
 * Sorts blocks of the specified types to the front of the list.
 *
 * @param {Element[]} blockElements - An array of block elements to be sorted.
 * @param {string[]} prioritizedBlockTypes - An array of strings representing block types.
 *    These types are moved to the front of the list.
 * @returns {Element[]} A new array of block elements sorted based on their types.
 */
export function sortBlocksByType(blockElements, prioritizedBlockTypes) {
  return blockElements.sort((a, b) => {
    const aType = a.getAttribute('type');
    const bType = b.getAttribute('type');

    // If both blocks are of specified types, maintain their original order
    if (
      prioritizedBlockTypes.includes(aType) &&
      prioritizedBlockTypes.includes(bType)
    ) {
      return 0;
    }

    // If block a is of a specified type, it should come first
    if (prioritizedBlockTypes.includes(aType)) {
      return -1;
    }

    // If block b is of a specified type, it should come first
    if (prioritizedBlockTypes.includes(bType)) {
      return 1;
    }

    // Otherwise, maintain the original order
    return 0;
  });
}
