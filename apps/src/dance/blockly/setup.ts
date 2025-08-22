import * as blockUtils from '@cdo/apps/block_utils';
import {BlockDefinition} from '@cdo/apps/blockly/types';
import danceBlocks from '@cdo/apps/dance/blockly/blocks';

let isBlocklyEnvironmentSetup = false;

export function setupBlocklyEnvironment() {
  if (isBlocklyEnvironmentSetup) {
    return;
  }
  Blockly.cdoUtils.registerCustomProcedureBlocks();
  delete Blockly.Blocks.procedures_defreturn;
  delete Blockly.Blocks.procedures_ifreturn;
  Blockly.setInfiniteLoopTrap();
  isBlocklyEnvironmentSetup = true;
}

export function installSharedBlocks(sharedBlocks: BlockDefinition[]) {
  // @ts-expect-error needed to handle CommonJS export. Eventually this may be replaced by using Blockly JSON directly
  blockUtils.installCustomBlocks({
    blockly: Blockly,
    blockDefinitions: sharedBlocks,
    customInputTypes: danceBlocks.customInputTypes,
  });
}
