// Helper functions for block shadowing logic. We use block shadowing for
// our "mini toolbox" blocks, which are blocks that contain their own toolbox.
// The blocks in the toolbox (or the blocks pulled from the toolbox)
// need to shadow the image selected in the parent
// block.

// This object maps the block types that shadow parents to the parent block type they can shadow.
// It also includes the index of the image to shadow in the parent's inputList.
export const blockShadowingPairs = {
  gamelab_clickedSpritePointer: {
    parent: 'gamelab_spriteClicked',
    imageIndex: 0,
  },
  gamelab_newSpritePointer: {
    parent: 'gamelab_whenSpriteCreated',
    imageIndex: 0,
  },
  gamelab_subjectSpritePointer: {
    parent: 'gamelab_checkTouching',
    imageIndex: 0,
  },
  gamelab_objectSpritePointer: {
    parent: 'gamelab_checkTouching',
    imageIndex: 1,
  },
};

// Given a shadow block and an optional parent block id, return the url of the image
// that the shadow block should display, or an empty string if the block should display
// no image. If given a parent id, use that block as the parent, otherwise try to find the parent.
// The parent block will either be the root block of the shadow block (if the shadow block is not inside
// a mini toolbox), or the source block of the block's workspace (if the shadow block is inside a mini toolbox).
export function getShadowedBlockImageUrl(block, parentId) {
  const blockShadowData = blockShadowingPairs[block.type];
  if (!blockShadowData || !block.inputList || block.inputList.length === 0) {
    return '';
  }
  let parent = undefined;
  if (parentId !== undefined) {
    parent = Blockly.getMainWorkspace().getBlockById(parentId);
  }
  if (!parent) {
    const rootBlock = block.getRootBlock();
    if (rootBlock.type === blockShadowData.parent) {
      parent = rootBlock;
    } else if (block.getRootBlock().type === block.type) {
      const workspace = Blockly.Workspace.getById(block.workspace.id);
      // If this block has itself as a parent and is in a flyout workspace,
      // it may be a in a mini toolbox. We check the parentBlockId on the block to
      // confirm it is still inside the parent flyout workspace.
      if (workspace && workspace.isFlyout && block.parentBlockId) {
        const potentialParent = Blockly.getMainWorkspace().getBlockById(
          block.parentBlockId
        );
        // Confirm potential parent is the correct type and it
        // does contain this block's current workspace.
        if (potentialParent.type === blockShadowData.parent) {
          const inputs = potentialParent.inputList.filter(
            input => input.name === 'flyout_input'
          );
          if (inputs.length > 0) {
            const flyoutWorkspace = inputs[0].fieldRow[0]?.flyout_?.workspace_;
            // If tthis block's workspace id matches the flyout workspace id,
            // then we have found the parent.
            if (flyoutWorkspace && flyoutWorkspace.id === block.workspace.id) {
              parent = potentialParent;
            }
          }
        }
      }
    }
  }
  if (parent) {
    return getImageUrlFromParent(parent, blockShadowData.imageIndex);
  } else {
    // The block is probably disconnected from any root or toolbox. Reset to
    // default text.
    return '';
  }
}

// Given a shadow block and an optional parent block id, update the image displayed
// on the shadow block to match the image selected in the parent block. See getShadowedBlockImageUrl
// for details on how we find the parent block.
export function updateShadowedBlockImage(block, parentId) {
  const url = getShadowedBlockImageUrl(block, parentId);
  changeShadowedImage(url, block);
}

// Get the image url from the parent block's inputList at the given index.
// We find the image url by looking at the connection to the input at the given index.
// If the parent does not have an image at the given index, return an empty string.
function getImageUrlFromParent(parentBlock, imageIndexOnParent) {
  const targetConnection =
    parentBlock.inputList[imageIndexOnParent]?.connection?.targetConnection;
  // We only want to get the image from a connection block that is not an insertion marker.
  // If the block is an insertion marker that means the block is being dragged
  // and is not yet connected to the parent block.
  if (
    targetConnection &&
    targetConnection.sourceBlock_ &&
    !targetConnection.sourceBlock_.isInsertionMarker()
  ) {
    return (
      targetConnection.sourceBlock_.inputList[0]?.fieldRow[0]?.imageElement_?.getAttribute(
        'xlink:href'
      ) || ''
    );
  } else {
    return '';
  }
}

// Set the given childBlock's image input to the given imageUrl,
// or reset the image input to the default long text if the imageUrl is empty.
function changeShadowedImage(imageUrl, childBlock) {
  if (!imageUrl || imageUrl.length === 0) {
    resetShadowedImageToLongString(childBlock);
    return;
  }
  const textInput = childBlock.inputList[0].fieldRow[0];
  const previewInput = childBlock.inputList[0].fieldRow[1];
  textInput.setValue(childBlock.shortString);
  previewInput.setValue(imageUrl);
  previewInput.updateDimensions(
    childBlock.thumbnailSize,
    childBlock.thumbnailSize
  );
  previewInput.getSize();
}

// Reset the child block to no longer have an image input, and only
// show the long text input.
function resetShadowedImageToLongString(childBlock) {
  const textInput = childBlock.inputList[0].fieldRow[0];
  const previewInput = childBlock.inputList[0].fieldRow[1];
  textInput.setValue(childBlock.longString);
  previewInput.setValue('');
  previewInput.updateDimensions(1, childBlock.thumbnailSize);
  previewInput.getSize();
}
