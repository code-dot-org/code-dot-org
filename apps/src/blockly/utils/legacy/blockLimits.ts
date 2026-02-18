/**
 * Creates a map of block types and limits, based on limit attributes found
 * in the block XML for the current toolbox.
 * @returns {Map<string, number>} A map of block limits
 */
export function createBlockLimitMap() {
  const parser = new DOMParser();
  // This method only works for string toolboxes.
  if (!Blockly.toolboxBlocks || typeof Blockly.toolboxBlocks !== 'string') {
    return;
  }

  const xmlDoc = parser.parseFromString(Blockly.toolboxBlocks, 'text/xml');
  // Define blockLimitMap
  const blockLimitMap = new Map<string, number>();

  // Select all block elements and convert NodeList to array
  const toolboxBlockElements = Array.from(xmlDoc.querySelectorAll('block'));

  // Iterate over each block element using forEach
  toolboxBlockElements.forEach(blockElement => {
    const limit = parseInt(blockElement.getAttribute('limit') ?? '');

    if (!isNaN(limit)) {
      // Extract type and add to blockLimitMap
      const type = blockElement.getAttribute('type');
      if (type !== null) {
        blockLimitMap.set(type, limit);
      }
    }
  });
  return blockLimitMap;
}
/**
 * Checks if any block type's usage count exceeds its defined limit and returns
 * the type of the first block found to exceed.
 * @returns {string | null} The type of the first block that exceeds its limit,
 * or null if no block exceeds the limit.
 */
export function blockLimitExceeded(): string | null {
  const {blockLimitMap, blockCountMap} = Blockly;

  // Ensure both maps are defined
  if (!blockLimitMap || !blockCountMap) {
    return null;
  }

  // Find the first instance where the limit is exceeded for a block type.
  for (const [type, count] of blockCountMap) {
    const limit = blockLimitMap.get(type);
    if (limit !== undefined && count > limit) {
      return type;
    }
  }

  // If no count exceeds the limit, return null.
  return null;
}

/**
 * Retrieves the block limit for a given block type from the block limit map.
 * @param {string} type The type of the block to check the limit for.
 * @returns {number | null} The limit for the specified block type, or null if not found.
 */
export function getBlockLimit(type: string): number | null {
  const limit = Blockly.blockLimitMap?.get(type);
  return limit !== undefined ? limit : null;
}
