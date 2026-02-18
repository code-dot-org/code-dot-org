import * as BlocklyCore from 'blockly/core';

// returns an array with the foreground/background effect blocks
export const generateAiEffectBlocks = (
  workspace: BlocklyCore.Workspace
): [BlocklyCore.BlockSvg, BlocklyCore.BlockSvg] => {
  return [
    workspace.newBlock(
      'Dancelab_setForegroundEffectExtended'
    ) as BlocklyCore.BlockSvg,
    workspace.newBlock(
      'Dancelab_setBackgroundEffectWithPaletteAI'
    ) as BlocklyCore.BlockSvg,
  ];
};
