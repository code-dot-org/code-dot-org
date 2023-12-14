import danceBlocks from '@cdo/apps/dance/blockly/blocks';
import * as commonBlocks from '@cdo/apps/blocksCommon';
import {LevelProperties} from '@cdo/apps/lab2/types';

const blockUtils = require('@cdo/apps/block_utils');

// Set up the global Blockly environment for Dance Party Lab2.
export function setUpBlocklyForDanceLab(
  levelProperties: LevelProperties | undefined
) {
  const blocksModule = danceBlocks;
  const skin = levelProperties?.skin || undefined;
  const isK1 = levelProperties?.isK1 || undefined;
  const blockInstallOptions = {
    skin,
    isK1,
    level: levelProperties,
  };
  commonBlocks.install(Blockly, blockInstallOptions);
  blocksModule.install(Blockly);
  const blocksByCategory = blockUtils.installCustomBlocks({
    blockly: Blockly,
    blockDefinitions: levelProperties?.sharedBlocks,
    customInputTypes: blocksModule.customInputTypes,
  });
  Blockly.setInfiniteLoopTrap();
  return blocksByCategory; // TODO: use when implementing pathway for toolbox editing for levelbuilders
}
