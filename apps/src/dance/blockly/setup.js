import danceBlocks from '@cdo/apps/dance/blockly/blocks';
import * as commonBlocks from '@cdo/apps/blocksCommon';
import {createJsWrapperBlockCreator} from '@cdo/apps/block_utils';
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
