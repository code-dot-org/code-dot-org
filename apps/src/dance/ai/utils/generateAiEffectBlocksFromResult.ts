import {BlockSvg, Workspace, FieldDropdown} from 'blockly';

import danceMetricsReporter from '../../danceMetricsReporter';
import {FieldKey, GeneratedEffect} from '../types';

import {generateAiEffectBlocks} from './generateAiEffectBlocks';
import {getValidateAndSetFieldValueWithInvalidValueLogger} from './validateAndSetFieldValue';

const validateAndSetFieldValue =
  getValidateAndSetFieldValueWithInvalidValueLogger(
    ({message, value, logValues}) =>
      danceMetricsReporter.logWarning({message, value, field: logValues})
  );

/**
 * Generates blocks from the AI result in a given workspace,
 * and attaches them to each other.
 */
export const generateAiEffectBlocksFromResult = (
  workspace: Workspace,
  effect: GeneratedEffect
): [BlockSvg, BlockSvg] => {
  const blocksSvg = generateAiEffectBlocks(workspace);

  // Foreground block.
  validateAndSetFieldValue(
    blocksSvg[0].getField('EFFECT') as FieldDropdown,
    effect.foregroundEffect,
    {logValues: FieldKey.FOREGROUND_EFFECT}
  );

  // Background block.
  validateAndSetFieldValue(
    blocksSvg[1].getField('EFFECT') as FieldDropdown,
    effect.backgroundEffect,
    {logValues: FieldKey.BACKGROUND_EFFECT}
  );
  validateAndSetFieldValue(
    blocksSvg[1].getField('PALETTE') as FieldDropdown,
    effect.backgroundColor,
    {logValues: FieldKey.BACKGROUND_PALETTE}
  );

  // Connect the blocks.
  blocksSvg[0].nextConnection.connect(blocksSvg[1].previousConnection);

  return blocksSvg;
};
