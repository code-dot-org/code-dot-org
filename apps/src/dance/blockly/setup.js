import danceBlocks from '@cdo/apps/dance/blockly/blocks';
import * as commonBlocks from '@cdo/apps/blocksCommon';
import {
  createJsWrapperBlockCreator,
  createJsWrapperBlock,
  appendBlocksByCategory,
} from '@cdo/apps/block_utils';
/**
 * Set up the global Blockly environment for Dance Party Lab2. This should
 * only be called once per page load, as it configures the global
 * Blockly state.
 */
export function setUpBlocklyForDanceLab(levelProperties) {
  console.log('setting up dance lab');
  const blocksModule = danceBlocks;
  const skin = levelProperties?.skin || undefined;
  const isK1 = levelProperties?.isK1 || undefined;
  const blockInstallOptions = {
    skin,
    isK1,
    level: levelProperties,
  };
  commonBlocks.install(Blockly, blockInstallOptions);
  blocksModule.install(Blockly, blockInstallOptions);
  const sharedBlocksConfig = levelProperties.sharedBlocks || [];
  if (sharedBlocksConfig.length > 0) {
    installCustomBlocks({
      blockly: Blockly,
      customInputTypes: blocksModule.customInputTypes,
    });
  }
  Blockly.setInfiniteLoopTrap();
}

function installCustomBlocks({blockly, customInputTypes}) {
  console.log('installCustomBlocks');
  createJsWrapperBlockCreator(
    blockly,
    [
      // Strict Types
      blockly.BlockValueType.SPRITE,
      blockly.BlockValueType.BEHAVIOR,
      blockly.BlockValueType.LOCATION,
    ],
    blockly.BlockValueType.SPRITE,
    customInputTypes
  );
  if (
    blockly.Blocks.gamelab_location_variable_set &&
    blockly.Blocks.gamelab_location_variable_get
  ) {
    Blockly.Variables.registerGetter(
      Blockly.BlockValueType.LOCATION,
      'gamelab_location_variable_get'
    );
    Blockly.Variables.registerSetter(
      Blockly.BlockValueType.LOCATION,
      'gamelab_location_variable_set'
    );
  }
}

// Will move function to DanceBlocklyWorkspace once it is created
// blockDefinitions: sharedBlocksConfig from levelProperties.sharedBlocks
export function getBlocksByCategory(levelProperties) {
  const blockDefinitions = levelProperties.sharedBlocks || [];
  const blocksByCategory = {};
  blockDefinitions.forEach(({name, pool, category, config, helperCode}) => {
    const blockName = createJsWrapperBlock(config, helperCode, pool);
    if (!blocksByCategory[category]) {
      blocksByCategory[category] = [];
    }
    blocksByCategory[category].push(blockName);
    if (name && blockName !== name) {
      console.error(
        `Block config ${name} generated a block named ${blockName}`
      );
    }
  });
  if (levelProperties.edit_blocks) {
    levelProperties.toolboxBlocks = appendBlocksByCategory(
      levelProperties.toolboxBlocks,
      blocksByCategory
    );
  }
}
