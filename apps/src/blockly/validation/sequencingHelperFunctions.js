/**
 * @param userBlocks {BlockSvg[]} BlockSvg array from user's workspace
 * @returns array of block objects with four attributes: type, id, nextBlockType, and nextBlockId.
 */
function getUserBlocksWithNextBlock(userBlocks) {
  const userBlocksWithNextBlock = [];
  userBlocks.forEach(b => {
    let block = {type: b.type, id: b.id};
    if (b.childBlocks_[0]) {
      block.nextBlockType = b.childBlocks_[0].type;
      block.nextBlockId = b.childBlocks_[0].id;
    }
    userBlocksWithNextBlock.push(block);
  });
  return userBlocksWithNextBlock;
}

/**
 * This function is used in validation to check for sequencing of blocks in a user's workspace.
 * Specifically, it checks if the searchBlockType is a child block of the topBlockType.
 * @param searchBlockType {string} blockType to search for
 * @param topBlockType {string} blockType to start from
 * @param userBlocks array of block objects with four attributes: type, id, nextBlockType, and nextBlockId.
 * @returns  true if the searchBlockType is a child block of the topBlockType, false otherwise.
 */
function isChildBlockOfTopBlock(searchBlockType, topBlockType, userBlocks) {
  let userBlocksWithNextBlock = getUserBlocksWithNextBlock(userBlocks);
  let currentBlock = userBlocksWithNextBlock.find(b => b.type === topBlockType);
  while (currentBlock?.nextBlockType) {
    if (currentBlock.nextBlockType === searchBlockType) {
      return true;
    }
    currentBlock = userBlocksWithNextBlock.find(
      b => b.id === currentBlock.nextBlockId
    );
  }
  return false;
}

export default {
  isChildBlockOfTopBlock,
};
