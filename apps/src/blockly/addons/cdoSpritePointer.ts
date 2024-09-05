// Helper functions for pointer block logic. In our pointer blocks (a.k.a.)
// mini toolbox blocks) we "shadow" the image on the block from a source block.
// This file contains functions to get and set the image on the pointer block.

import {commonI18n} from '@cdo/apps/types/locale';

import {ExtendedBlockSvg, PointerMetadataMap} from '../types';

import CdoFieldImage from './cdoFieldImage';

/**
 * Get the image url for the given pointer block.
 * @param {Block} block pointer block to get the image url for
 * @param {PointerMetadataMap} pointerMetadataMap Object of the form {blockType: {expectedRootBlockType: <string>, imageIndex: <number>}},
 *  which maps pointer block types to the image source block type they can shadow and the index of the image to shadow.
 * @param {string} imageSourceId Optional id of the image source block.
 * @returns {string} The url of the image that the pointer block should display, or an empty string if the block should display no image
 */
export function getPointerBlockImageUrl(
  block: ExtendedBlockSvg,
  pointerMetadataMap: PointerMetadataMap,
  imageSourceId?: string
) {
  const pointerData = pointerMetadataMap[block.type];
  if (!pointerData || !block.inputList || block.inputList.length === 0) {
    return '';
  }
  let imageSourceBlock: ExtendedBlockSvg | null = null;
  const mainWorkspace = Blockly.getMainWorkspace();
  if (imageSourceId !== undefined) {
    imageSourceBlock = mainWorkspace?.getBlockById(
      imageSourceId
    ) as ExtendedBlockSvg;
  }
  if (!imageSourceBlock) {
    const rootBlock = block.getRootBlock();
    if (rootBlock.type === pointerData.expectedRootBlockType) {
      imageSourceBlock = rootBlock;
    } else if (rootBlock.id === block.id) {
      const blockWorkspace = Blockly.Workspace.getById(block.workspace.id);
      // If this block has itself as a root and is in a flyout workspace,
      // it is a in a mini toolbox. A block can't be moved from one flyout to
      // another, so if it's in a flyout, it is in its original flyout.
      if (
        mainWorkspace &&
        blockWorkspace &&
        blockWorkspace.isFlyout &&
        block.imageSourceId
      ) {
        imageSourceBlock = mainWorkspace.getBlockById(
          block.imageSourceId
        ) as ExtendedBlockSvg;
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

/**
 * Update the warning text for the given pointer block.
 * @param {Block} block pointer block to update
 * @param {PointerMetadataMap} pointerMetadataMap Object of the form {blockType: {expectedRootBlockType: <string>, imageIndex: <number>}},
 *  which maps pointer block types to the expected root block type they may be used under.
 */
export function updatePointerBlockWarning(
  block: ExtendedBlockSvg,
  pointerMetadataMap: PointerMetadataMap
) {
  let warningText = null;
  const currentRootBlock = block.getRootBlock();
  const currentRootBlockType = currentRootBlock.type;
  const expectedRootBlockType =
    pointerMetadataMap[block.type].expectedRootBlockType;
  // We only show the warning if a block is connected to a top block (e.g. events or
  // "when run"). A child block of a disabled parent can still be considered enabled,
  // so we use the current root block as the source of truth.
  const enabled = currentRootBlock.isEnabled();
  if (enabled && currentRootBlockType !== expectedRootBlockType) {
    const blockText =
      commonI18n[
        expectedRootBlockType as
          | 'gamelab_checkTouching'
          | 'gamelab_spriteClicked'
          | 'gamelab_whenSpriteCreated'
      ]();
    warningText = commonI18n.spriteLabPointerWarning({
      blockText,
    });
  }

  block.setWarningText(warningText);
}

// Given a shadow block and an optional image source block id, update the image displayed
// on the pointer block to match the image selected in the image source block. See getPointerBlockImageUrl
// for details on how we find the image source block.
export function updatePointerBlockImage(
  block: ExtendedBlockSvg,
  pointerMetadataMap: PointerMetadataMap,
  imageSourceId?: string
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
function getImageUrlFromImageSource(
  imageSourceBlock: ExtendedBlockSvg,
  imageIndexOnSource: number
) {
  const targetConnection =
    imageSourceBlock.inputList[imageIndexOnSource]?.connection
      ?.targetConnection;
  // We only want to get the image from a connection block that is not an insertion marker.
  // If the block is an insertion marker that means the block is being dragged
  // and is not yet connected to the image source block.
  const sourceBlock = targetConnection?.getSourceBlock();
  if (
    sourceBlock &&
    sourceBlock.type === 'gamelab_allSpritesWithAnimation' &&
    !sourceBlock.isInsertionMarker()
  ) {
    // Blocks of type gamelab_allSpritesWithAnimation have an input with one field (the costume
    // picker dropdown).
    // imageElement is a private property on FieldDropdown.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const imageElement = (sourceBlock.getField('ANIMATION') as any)
      ?.imageElement as SVGImageElement;
    return imageElement?.getAttribute('xlink:href') || '';
  } else {
    return '';
  }
}

// Set the given block's image input to the given imageUrl,
// or reset the image input to the default long text if the imageUrl is empty.
function changePointerImage(
  imageUrl: string | undefined,
  block: ExtendedBlockSvg
) {
  if (!imageUrl || imageUrl.length === 0) {
    resetPointerImageToLongString(block);
    return;
  }
  updatePointerImageHelper(
    block,
    block.shortString,
    imageUrl,
    block.thumbnailSize,
    block.thumbnailSize
  );
}

// Reset the block to no longer have an image input, and only
// show the long text input.
function resetPointerImageToLongString(block: ExtendedBlockSvg) {
  updatePointerImageHelper(block, block.longString, '', 1, block.thumbnailSize);
}

function updatePointerImageHelper(
  block: ExtendedBlockSvg,
  textInputValue: string | undefined,
  imageUrl: string,
  width: number | undefined,
  height: number | undefined
) {
  const textInput = block.inputList[0].fieldRow[0];
  const previewInput = block.inputList[0].fieldRow[1] as CdoFieldImage;
  textInput.setValue(textInputValue);
  previewInput.setValue(imageUrl);
  if (width !== undefined && height !== undefined) {
    previewInput.updateDimensions(width, height);
  }
  previewInput.getSize();
}
