import {BlockSvg, Workspace} from 'blockly';

// returns an array with the foreground/background effect blocks
export const generateAiEffectBlocks = (
  workspace: Workspace
): [BlockSvg, BlockSvg] => {
  return [
    workspace.newBlock('Dancelab_setForegroundEffectExtended') as BlockSvg,
    workspace.newBlock('Dancelab_setBackgroundEffectWithPaletteAI') as BlockSvg,
  ];
};
