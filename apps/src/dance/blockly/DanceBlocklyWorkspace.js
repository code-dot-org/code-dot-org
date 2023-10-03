import {
  createJsWrapperBlock,
  appendBlocksByCategory,
} from '@cdo/apps/block_utils';

// Will convert to .ts soon.
/**
 * Wraps the Blockly workspace for Dance Party Lab2. Provides functions to setup the
 * workspace view, execute code, and save/load projects.
 */
export default class DanceBlocklyWorkspace {
  // Will move function to DanceBlocklyWorkspace once it is created
  // blockDefinitions: sharedBlocksConfig from levelProperties.sharedBlocks
  getBlocksByCategoryForEditBlocks(levelProperties) {
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
}
