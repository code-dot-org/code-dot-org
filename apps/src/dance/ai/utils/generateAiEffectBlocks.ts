import * as GoogleBlockly from 'blockly/core';

// returns an array with the foreground/background effect blocks
export const generateAiEffectBlocks = (
  workspace: GoogleBlockly.Workspace
): [GoogleBlockly.BlockSvg, GoogleBlockly.BlockSvg] => {
  return [
    workspace.newBlock(
      'Dancelab_setForegroundEffectExtended'
    ) as GoogleBlockly.BlockSvg,
    workspace.newBlock(
      'Dancelab_setBackgroundEffectWithPaletteAI'
    ) as GoogleBlockly.BlockSvg,
  ];
};
