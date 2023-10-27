import {BlockSvg, Workspace} from 'blockly';

/**
 * Generates blocks from the AI result in a given workspace,
 * and attaches them to each other.
 */
export const generateBlocksFromResult = (
  workspace: Workspace,
  resultJsonString: string
): [BlockSvg, BlockSvg] => {
  const params = JSON.parse(resultJsonString);

  const blocksSvg: [BlockSvg, BlockSvg] = [
    workspace.newBlock('Dancelab_setForegroundEffectExtended') as BlockSvg,
    workspace.newBlock('Dancelab_setBackgroundEffectWithPaletteAI') as BlockSvg,
  ];

  // Foreground block.
  blocksSvg[0].setFieldValue(params.foregroundEffect, 'EFFECT');

  // Background block.
  blocksSvg[1].setFieldValue(params.backgroundEffect, 'EFFECT');
  blocksSvg[1].setFieldValue(params.backgroundColor, 'PALETTE');

  // Connect the blocks.
  blocksSvg[0].nextConnection.connect(blocksSvg[1].previousConnection);

  return blocksSvg;
};
