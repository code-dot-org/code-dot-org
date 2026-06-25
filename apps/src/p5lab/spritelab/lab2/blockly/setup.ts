import * as blockUtils from '@cdo/apps/block_utils';
import {BlockDefinition, CustomInputTypes} from '@cdo/apps/blockly/types';
import * as blocksCommonModule from '@cdo/apps/blocksCommon';
import spritelabBlocks from '@cdo/apps/p5lab/spritelab/blocks';

// blocksCommon is a plain CommonJS module (exports.install = ...); give it a
// minimal typed view.
const blocksCommon = blocksCommonModule as unknown as {
  install: (blockly: unknown, options: object) => void;
};

// Installs the Sprite Lab block definitions and their JS generators into the
// global Blockly once per page. This is the StudioApp-free equivalent of the
// install performed in appMain.js (blocksCommon.install + blocksModule.install).
// Sprite Lab's own install() also wires up the behavior FunctionEditor and
// custom procedure blocks, so we rely on it rather than re-registering blocks
// individually the way dance/blockly/setup.ts does.
let isSetup = false;

export function setupSpriteLab2BlocklyEnvironment(
  skin: object = {},
  level: object = {}
): void {
  if (isSetup) {
    return;
  }
  const blockInstallOptions = {skin, isK1: false, level};
  blocksCommon.install(Blockly, blockInstallOptions);
  spritelabBlocks.install(Blockly, blockInstallOptions);
  isSetup = true;
}

/**
 * Installs the level's shared/custom block definitions (the DB-backed Sprite Lab
 * block pool, e.g. GamelabJr) and returns a map of category -> block type names
 * for toolbox construction. Mirrors dance/blockly/setup.ts installSharedBlocks.
 */
export function installSharedBlocks(sharedBlocks: BlockDefinition[]): {
  [category: string]: string[];
} {
  return blockUtils.installCustomBlocks({
    blockly: Blockly,
    blockDefinitions: sharedBlocks || [],
    customInputTypes:
      spritelabBlocks.customInputTypes as unknown as CustomInputTypes,
  });
}
