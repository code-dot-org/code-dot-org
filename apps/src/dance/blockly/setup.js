import danceBlocks from '@cdo/apps/dance/blockly/blocks';
import * as commonBlocks from '@cdo/apps/blocksCommon';
import * as blockUtils from '@cdo/apps/block_utils';
import {valueOr} from '@cdo/apps/utils';

/**
 * Set up the global Blockly environment for Dance Party Lab2. This should
 * only be called once per page load, as it configures the global
 * Blockly state.
 */
export function setUpBlocklyForDanceLab(blockInstallOptions, levelProperties) {
  const blocksModule = danceBlocks;
  commonBlocks.install(Blockly, blockInstallOptions);
  blocksModule.install(Blockly, blockInstallOptions);
  const sharedBlocksConfig = levelProperties.sharedBlocks || [];
  if (sharedBlocksConfig.length > 0) {
    const blocksByCategory = blockUtils.installCustomBlocks({
      blockly: Blockly,
      blockDefinitions: sharedBlocksConfig,
      customInputTypes: blocksModule.customInputTypes,
    });

    if (
      !valueOr(levelProperties.hideCustomBlocks, true) ||
      levelProperties.edit_blocks
    ) {
      levelProperties.toolboxBlocks = blockUtils.appendBlocksByCategory(
        levelProperties.toolboxBlocks,
        blocksByCategory
      );
    }
  }
  Blockly.setInfiniteLoopTrap();
  return levelProperties.toolboxBlocks;
}
