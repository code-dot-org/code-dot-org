import {BlockSvg, Workspace, FieldDropdown} from 'blockly';

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

// The keys are English-only (eg, "blooming_petals"),
// and values is user readable / translated string (eg, "Blooming Petals").
// Example: {'blooming_petals': 'Blooming Petals'}
export const getLabelMap = (
  dropdown: FieldDropdown
): {[id: string]: string} => {
  const options = dropdown.getOptions();

  const map: {[id: string]: string} = {};
  options.forEach(option => {
    if (!(typeof option[0] === 'string')) {
      return;
    }

    // Keys from blockly are surrounded in double quotes
    // eg, '"blooming_petals"'. Remove them for easier use.
    const id = option[1].replace(/"/g, '');

    map[id] = option[0];
  });
  return map;
};

/**
 * Generate code that can be executed to preview the output of the AI-generated blocks.
 */
export const generatePreviewCode = (
  workspace: Workspace,
  resultJsonString: string
): string => {
  const blocks = generateBlocksFromResult(workspace, resultJsonString);
  // Create a temporary setup block
  const setup: BlockSvg = workspace.newBlock('Dancelab_whenSetup') as BlockSvg;

  // Attach the blocks to the setup block
  setup.getInput('DO')?.connection?.connect(blocks[0].previousConnection);

  if (!Blockly.getGenerator().isInitialized) {
    Blockly.getGenerator().init(workspace);
  }

  return Blockly.getGenerator().blockToCode(setup);
};
