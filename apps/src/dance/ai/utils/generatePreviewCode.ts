import {BlockSvg, Workspace} from 'blockly';

import {GeneratedEffect} from '../types';

import {generateAiEffectBlocksFromResult} from './generateAiEffectBlocksFromResult';

/**
 * Generate code that can be executed to preview the output of the AI-generated blocks.
 */
export const generatePreviewCode = (
  workspace: Workspace,
  effect: GeneratedEffect
): string => {
  const blocks = generateAiEffectBlocksFromResult(workspace, effect);
  // Create a temporary setup block
  const setup: BlockSvg = workspace.newBlock('Dancelab_whenSetup') as BlockSvg;

  // Attach the blocks to the setup block
  setup.getInput('DO')?.connection?.connect(blocks[0].previousConnection);

  if (!Blockly.getGenerator().isInitialized) {
    Blockly.getGenerator().init(workspace);
  }

  return Blockly.getGenerator().blockToCode(setup);
};
