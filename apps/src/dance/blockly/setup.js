import danceBlocks from '@cdo/apps/dance/blockly/blocks';
import * as commonBlocks from '@cdo/apps/blocksCommon';
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
  Blockly.setInfiniteLoopTrap();
}
