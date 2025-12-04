import * as blockUtils from '@cdo/apps/block_utils';
import {BlockDefinition} from '@cdo/apps/blockly/types';
import danceBlocks from '@cdo/apps/dance/blockly/blocks';
import localization from '@cdo/apps/localization';

import {localizeBlockDefinition, updateLocale} from '../../blockly/utils';

import blockDefinitions from './blockDefinitions';

let isBlocklyEnvironmentSetup = false;

export function setupBlocklyEnvironment() {
  if (isBlocklyEnvironmentSetup) {
    return;
  }
  Blockly.cdoUtils.registerCustomProcedureBlocks();
  delete Blockly.Blocks.procedures_defreturn;
  delete Blockly.Blocks.procedures_ifreturn;
  Blockly.setInfiniteLoopTrap();

  const initializeBlocks = () => {
    for (const {definition, generator, extendedOptions} of blockDefinitions) {
      const localized = localizeBlockDefinition(definition);
      Blockly.Blocks[definition.type] = {
        init: function () {
          this.jsonInit(localized);
        },
        ...extendedOptions,
      };
      Blockly.getGenerator().forBlock[definition.type] = generator;
    }
  };

  // Ensure that Blockly localizes when the locale changes
  localization.on('change', info => {
    initializeBlocks();
    updateLocale(localization.rtl);
  });
  initializeBlocks();

  isBlocklyEnvironmentSetup = true;
}

export function installSharedBlocks(sharedBlocks: BlockDefinition[]): {
  [category: string]: string[];
} {
  return blockUtils.installCustomBlocks({
    blockly: Blockly,
    blockDefinitions: sharedBlocks || [],
    customInputTypes: danceBlocks.customInputTypes,
  });
}
