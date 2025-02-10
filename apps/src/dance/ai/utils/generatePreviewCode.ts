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

  // blockToCode returns a string of generated code for statement blocks, or an array of
  // generated code and an operator order value for value blocks. Because the setup
  // block is a statement block, we can safely cast this to a string.
  return Blockly.getGenerator().blockToCode(setup) as string;
};
