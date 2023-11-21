import {BlockSvg, Workspace, FieldDropdown} from 'blockly';
import {FieldKey, GeneratedEffect} from '@cdo/apps/dance/ai/types';

import {validateAndSetFieldValue} from './validateAndSetFieldValue';
import {generateBlocks} from './generateBlocks';

/**
 * Generates blocks from the AI result in a given workspace,
 * and attaches them to each other.
 */
export const generateBlocksFromResult = (
  workspace: Workspace,
  effect: GeneratedEffect
): [BlockSvg, BlockSvg] => {
  const blocksSvg = generateBlocks(workspace);

  // Foreground block.
  validateAndSetFieldValue(
    blocksSvg[0].getField('EFFECT') as FieldDropdown,
    effect.foregroundEffect,
    FieldKey.FOREGROUND_EFFECT
  );

  // Background block.
  validateAndSetFieldValue(
    blocksSvg[1].getField('EFFECT') as FieldDropdown,
    effect.backgroundEffect,
    FieldKey.BACKGROUND_EFFECT
  );
  validateAndSetFieldValue(
    blocksSvg[1].getField('PALETTE') as FieldDropdown,
    effect.backgroundColor,
    FieldKey.BACKGROUND_PALETTE
  );

  // Connect the blocks.
  blocksSvg[0].nextConnection.connect(blocksSvg[1].previousConnection);

  return blocksSvg;
};
