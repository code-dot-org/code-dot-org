import danceBlocks from '@cdo/apps/dance/blockly/blocks';
import * as commonBlocks from '@cdo/apps/blocksCommon';
import {LevelProperties} from '@cdo/apps/lab2/types';

const blockUtils = require('@cdo/apps/block_utils');

// Install common blocks for Dance Party Lab2.
export function installCommonBlocks(
  skin: string | undefined,
  isK1: boolean | undefined
) {
  const blockInstallOptions = {
    skin,
    isK1,
  };
  commonBlocks.install(Blockly, blockInstallOptions);
  Blockly.setInfiniteLoopTrap();
}

// Install custom blocks for Dance Party Lab2.
export function installDanceBlocks(
  levelProperties: LevelProperties | undefined
) {
  danceBlocks.install(Blockly);
  const blocksByCategory = blockUtils.installCustomBlocks({
    blockly: Blockly,
    blockDefinitions: levelProperties?.sharedBlocks,
    customInputTypes: danceBlocks.customInputTypes,
  });
  return blocksByCategory; // TODO: use when implementing pathway for toolbox editing for levelbuilders
}
