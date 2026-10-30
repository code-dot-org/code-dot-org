import * as BlocklyCore from 'blockly/core';

import {BLOCK_TYPES} from '@cdo/apps/blockly/constants';

/**
 * Adds a warning to blocks that are not positioned under a static category block,
 * except when there are no categories at all. If warnings are ignored, we will
 * still save the blocks into a "DEFAULT" category.
 */
export function validateBlockCategories(workspace: BlocklyCore.WorkspaceSvg) {
  const topBlocks = workspace.getTopBlocks(true);

  const noCategoryBlocks =
    !workspace.getBlocksByType(BLOCK_TYPES.category).length &&
    !workspace.getBlocksByType(BLOCK_TYPES.categoryDynamic).length;

  let currentCategoryBlock: BlocklyCore.BlockSvg | null = null;
  let warningText = 'This block is not positioned under a category.';

  topBlocks.forEach(block => {
    // If there are no categories, remove all warnings.
    if (noCategoryBlocks) {
      block.setWarningText(null);
      return;
    }
    if (block.type === BLOCK_TYPES.category) {
      // Update the current category to this block
      currentCategoryBlock = block;
    } else if (block.type === BLOCK_TYPES.categoryDynamic) {
      // Reset the current category since dynamic categories can't include static blocks
      currentCategoryBlock = null;
      warningText = 'Auto-populated categories cannot include static blocks.';
    } else {
      // All non-category blocks
      if (!currentCategoryBlock) {
        // No static category block above this block
        block.setWarningText(warningText);
      } else {
        // Valid placement under a static category block
        block.setWarningText(null);
      }
    }
  });
}
