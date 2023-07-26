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

export function getShadowedBlockImageUrl(block, checkWorkspaceId) {
  const blockShadowData = blockShadowingPairs[block.type];
  if (!blockShadowData || !block.inputList || block.inputList.length === 0) {
    return;
  }
  const rootBlock = block.getRootBlock();
  let parent = undefined;
  if (rootBlock.type === blockShadowData.parent) {
    parent = rootBlock;
  } else if (block.getRootBlock().type === block.type) {
    // Look for all potential mini toolbox parents for block block
    const potentialParents = Blockly.getMainWorkspace()
      .getTopBlocks()
      .filter(block => block.type === blockShadowData.parent);
    // These parents need to have a flyout_input input.
    potentialParents.forEach(potentialParent => {
      if (
        !potentialParent.inputList ||
        potentialParent.inputList.length === 0
      ) {
        return;
      }
      const inputs = potentialParent.inputList.filter(
        input => input.name === 'flyout_input'
      );
      if (inputs.length > 0) {
        const flyoutWorkspace = inputs[0].fieldRow[0]?.flyout_?.workspace_;
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
  if (parent) {
    return getImageUrlFromParent(parent, blockShadowData.imageIndex);
  } else {
    // The block is probably disconnected from the root or toolbox. Reset to
    // default text.
    return '';
  }
}

export function updateShadowedBlockImage(block) {
  const url = getShadowedBlockImageUrl(block, true);
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
