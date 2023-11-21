import {BlockSvg, Workspace} from 'blockly';

export const generateBlocks = (workspace: Workspace): [BlockSvg, BlockSvg] => {
  return [
    workspace.newBlock('Dancelab_setForegroundEffectExtended') as BlockSvg,
    workspace.newBlock('Dancelab_setBackgroundEffectWithPaletteAI') as BlockSvg,
  ];
};
