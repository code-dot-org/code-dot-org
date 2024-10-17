import * as GoogleBlockly from 'blockly/core';

import {GeneratedEffect} from '../types';

import {generateAiEffectBlocksFromResult} from './generateAiEffectBlocksFromResult';

/**
 * Generate code that can be executed to preview the output of the AI-generated blocks.
 */
export const generatePreviewCode = (
  workspace: GoogleBlockly.Workspace,
  effect: GeneratedEffect
): string => {
  const blocks = generateAiEffectBlocksFromResult(workspace, effect);
  // Create a temporary setup block
  const setup: GoogleBlockly.BlockSvg = workspace.newBlock(
    'Dancelab_whenSetup'
  ) as GoogleBlockly.BlockSvg;

  // Attach the blocks to the setup block
  setup.getInput('DO')?.connection?.connect(blocks[0].previousConnection);

  if (!Blockly.getGenerator().isInitialized) {
    Blockly.getGenerator().init(workspace);
  }

  return Blockly.getGenerator().blockToCode(setup);
};
