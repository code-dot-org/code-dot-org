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
      // CdoBlockFlyout initializes workspaces with a sourceBlockId option.
      // This allows us to find the source block for a flyout workspace, and get
      // the image from that block. If the block's workspace is not a flyout or
      // does not have a sourceBlockId, this isn't a CdoBlockFlyout workspace,
      // and we can ignore it.
      const workspace = Blockly.Workspace.getById(block.workspace.id);
      if (workspace && workspace.isFlyout && workspace.options.sourceBlockId) {
        parent = Blockly.getMainWorkspace().getBlockById(
          workspace.options.sourceBlockId
        );
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

export function updateShadowedBlockImage(block, parentId) {
  const url = getShadowedBlockImageUrl(block, parentId);
  changeShadowedImage(url, block);
}

function getImageUrlFromParent(parentBlock, imageIndexOnParent) {
  return (
    parentBlock
      .getChildren(true)
      [
        imageIndexOnParent
      ]?.inputList[0]?.fieldRow[0]?.imageElement_?.getAttribute('xlink:href') ||
    ''
  );
}

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

function resetShadowedImageToLongString(childBlock) {
  const textInput = childBlock.inputList[0].fieldRow[0];
  const previewInput = childBlock.inputList[0].fieldRow[1];
  textInput.setValue(childBlock.longString);
  previewInput.setValue('');
  previewInput.updateDimensions(1, childBlock.thumbnailSize);
  previewInput.getSize();
}
