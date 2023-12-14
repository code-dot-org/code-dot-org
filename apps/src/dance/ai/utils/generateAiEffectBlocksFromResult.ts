import {BlockSvg, Workspace, FieldDropdown} from 'blockly';
import {FieldKey, GeneratedEffect} from '../types';
import Lab2MetricsReporter from '@cdo/apps/lab2/Lab2MetricsReporter';

import {getValidateAndSetFieldValueWithInvalidValueLogger} from './validateAndSetFieldValue';
import {generateAiEffectBlocks} from './generateAiEffectBlocks';

const validateAndSetFieldValue =
  getValidateAndSetFieldValueWithInvalidValueLogger(
    ({message, value, logValues}) =>
      Lab2MetricsReporter.logWarning({message, value, field: logValues})
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
