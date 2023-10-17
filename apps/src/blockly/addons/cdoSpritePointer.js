// Helper functions for pointer block logic. In our pointer blocks (a.k.a.)
// mini toolbox blocks) we "shadow" the image on the block from a source block.
// This file contains functions to get and set the image on the pointer block.

/**
 * Get the image url for the given pointer block.
 * @param {Block} block pointer block to get the image url for
 * @param {*} pointerMetadataMap Object of the form {blockType: {imageSourceType: <string>, imageIndex: <number>}},
 *  which maps pointer block types to the image source block type they can shadow and the index of the image to shadow.
 * @param {string} imageSourceId Optional id of the image source block.
 * @returns The url of the image that the pointer block should display, or an empty string if the block should display no image
 */
export function getPointerBlockImageUrl(
  block,
  pointerMetadataMap,
  imageSourceId
) {
  const pointerData = pointerMetadataMap[block.type];
  if (!pointerData || !block.inputList || block.inputList.length === 0) {
    return '';
  }
  let imageSourceBlock = undefined;
  const mainWorkspace = Blockly.getMainWorkspace();
  if (imageSourceId !== undefined) {
    imageSourceBlock = mainWorkspace.getBlockById(imageSourceId);
  }
  if (!imageSourceBlock) {
    const rootBlock = block.getRootBlock();
    if (rootBlock.type === pointerData.imageSourceType) {
      imageSourceBlock = rootBlock;
    } else if (rootBlock.id === block.id) {
      const blockWorkspace = Blockly.Workspace.getById(block.workspace.id);
      // If this block has itself as a root and is in a flyout workspace,
      // it is a in a mini toolbox. A block can't be moved from one flyout to
      // another, so if it's in a flyout, it is in its original flyout.
      if (blockWorkspace && blockWorkspace.isFlyout && block.imageSourceId) {
        imageSourceBlock = mainWorkspace.getBlockById(block.imageSourceId);
      }
    }
  }
  if (imageSourceBlock) {
    return getImageUrlFromImageSource(imageSourceBlock, pointerData.imageIndex);
  } else {
    // The block is probably disconnected from any root or toolbox. Reset to
    // default text.
    return '';
  }
}

// Given a shadow block and an optional image source block id, update the image displayed
// on the pointer block to match the image selected in the image source block. See getPointerBlockImageUrl
// for details on how we find the image source block.
export function updatePointerBlockImage(
  block,
  pointerMetadataMap,
  imageSourceId
) {
  const url = getPointerBlockImageUrl(block, pointerMetadataMap, imageSourceId);
  changePointerImage(url, block);
}

/**
 * Get the image url from the image source block's inputList at the given index.
 * We find the image url by looking at the connection to the input at the given index.
 *
 * @param {Block} imageSourceBlock Image source block to get image url from.
 * @param {number} imageIndexOnSource index of the source block's input list to get the image url from. This index
 *  should have a connection to a block of type gamelab_allSpritesWithAnimation, or we will return an empty string.
 * @returns Image url or empty string if the image source block does not have an image at the given index.
 */
function getImageUrlFromImageSource(imageSourceBlock, imageIndexOnSource) {
  const targetConnection =
    imageSourceBlock.inputList[imageIndexOnSource]?.connection
      ?.targetConnection;
  // We only want to get the image from a connection block that is not an insertion marker.
  // If the block is an insertion marker that means the block is being dragged
  // and is not yet connected to the image source block.
  if (
    targetConnection &&
    targetConnection.sourceBlock_ &&
    targetConnection.sourceBlock_.type === 'gamelab_allSpritesWithAnimation' &&
    !targetConnection.sourceBlock_.isInsertionMarker()
  ) {
    // Blocks of type gamelab_allSpritesWithAnimation have an input with one field (the costume
    // picker dropdown).
    return (
      targetConnection.sourceBlock_.inputList[0].fieldRow[0].imageElement_.getAttribute(
        'xlink:href'
      ) || ''
    );
  } else {
    return '';
  }
}

// Set the given block's image input to the given imageUrl,
// or reset the image input to the default long text if the imageUrl is empty.
function changePointerImage(imageUrl, block) {
  if (!imageUrl || imageUrl.length === 0) {
    resetPointerImageToLongString(block);
    return;
  }
  const textInput = block.inputList[0].fieldRow[0];
  const previewInput = block.inputList[0].fieldRow[1];
  textInput.setValue(block.shortString);
  previewInput.setValue(imageUrl);
  previewInput.updateDimensions(block.thumbnailSize, block.thumbnailSize);
  previewInput.getSize();
}

// Reset the block to no longer have an image input, and only
// show the long text input.
function resetPointerImageToLongString(block) {
  const textInput = block.inputList[0].fieldRow[0];
  const previewInput = block.inputList[0].fieldRow[1];
  textInput.setValue(block.longString);
  previewInput.setValue('');
  previewInput.updateDimensions(1, block.thumbnailSize);
  previewInput.getSize();
}
