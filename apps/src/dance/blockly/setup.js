import danceBlocks from '@cdo/apps/dance/blockly/blocks';
import * as commonBlocks from '@cdo/apps/blocksCommon';
import {createJsWrapperBlockCreator} from '@cdo/apps/block_utils';

/**
 * Set up the global Blockly environment for Dance Party Lab2. This should
 * only be called once per page load, as it configures the global
 * Blockly state.
 */
export function setUpBlocklyForDanceLab(levelProperties) {
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
  installSharedBlocks({
    blockly: Blockly,
    blockDefinitions: levelProperties.sharedBlocks,
    customInputTypes: blocksModule.customInputTypes,
  });

  Blockly.setInfiniteLoopTrap();
}

function installSharedBlocks({blockly, blockDefinitions, customInputTypes}) {
  const createJsWrapperBlock = createJsWrapperBlockCreator(
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
  blockDefinitions.forEach(({name, pool, category, config, helperCode}) => {
    createJsWrapperBlock(config, helperCode, pool);
  });
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
