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

export function getShadowedBlockImageUrl(block, checkWorkspaceId, parentId) {
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
      // If the root block type is this block, this block is not connected
      // to a root. It could either be out by itself, or it could be inside a
      // mini toolbox. If it's in a mini toolbox, we want to shadow the image in the
      // root block of the mini toolbox. Therefore, we search here for any mini toolbox
      // parents that have this block in their workspace.
      const potentialParents = Blockly.getMainWorkspace()
        .getTopBlocks()
        .filter(block => block.type === blockShadowData.parent);
      potentialParents.forEach(potentialParent => {
        if (
          !potentialParent.inputList ||
          potentialParent.inputList.length === 0
        ) {
          return;
        }
        // The parent needs to have a flyout_input.
        const inputs = potentialParent.inputList.filter(
          input => input.name === 'flyout_input'
        );
        if (inputs.length > 0) {
          const flyoutWorkspace = inputs[0].fieldRow[0]?.flyout_?.workspace_;
          // If the block id is in the flyout workspace, and if we are checking workspace
          // id and the block's workspace id matches the flout workspace id,
          // then we have found the parent.
          if (
            flyoutWorkspace &&
            flyoutWorkspace
              .getAllBlocks()
              .filter(childBlock => block.id === childBlock.id).length > 0 &&
            (!checkWorkspaceId || flyoutWorkspace.id === block.workspace.id)
          ) {
            parent = potentialParent;
          }
        }
      });
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

export function updateShadowedBlockImage(block, checkWorkspaceId, parentId) {
  const url = getShadowedBlockImageUrl(block, checkWorkspaceId, parentId);
  changeShadowedImage(url, block);
}

function getImageUrlFromParent(parentBlock, imageIndexOnParent) {
  return parentBlock
    .getChildren(true)
    [
      imageIndexOnParent
    ]?.inputList[0]?.fieldRow[0]?.imageElement_?.getAttribute('xlink:href');
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
