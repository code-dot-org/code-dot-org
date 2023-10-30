import {BlockSvg, Workspace, FieldDropdown} from 'blockly';
import {DropdownLabels} from '@cdo/apps/dance/types';

/**
 * Generates blocks from the AI result in a given workspace,
 * and attaches them to each other.
 */
export const generateBlocksFromResult = (
  workspace: Workspace,
  resultJsonString: string
): [BlockSvg, BlockSvg] => {
  const params = JSON.parse(resultJsonString);
  const blocksSvg = generateBlocks(workspace);

  // Foreground block.
  blocksSvg[0].setFieldValue(params.foregroundEffect, 'EFFECT');

  // Background block.
  blocksSvg[1].setFieldValue(params.backgroundEffect, 'EFFECT');
  blocksSvg[1].setFieldValue(params.backgroundColor, 'PALETTE');

  // Connect the blocks.
  blocksSvg[0].nextConnection.connect(blocksSvg[1].previousConnection);

  return blocksSvg;
};

export const generateBlocks = (workspace: Workspace): [BlockSvg, BlockSvg] => {
  return [
    workspace.newBlock('Dancelab_setForegroundEffectExtended') as BlockSvg,
    workspace.newBlock('Dancelab_setBackgroundEffectWithPaletteAI') as BlockSvg,
  ];
};

export const getTranslationsMap = (dropdown: FieldDropdown): DropdownLabels => {
  const options = dropdown.getOptions() as [string, string][];

  const map: DropdownLabels = {};
  options.forEach(option => {
    // Keys from blockly are surrounded in double quotes
    // eg, '"blooming_petals"'. Remove them for easier use.
    const id = option[1].replace(/"/g, '');

    map[id] = option[0];
  });
  return map;
};
