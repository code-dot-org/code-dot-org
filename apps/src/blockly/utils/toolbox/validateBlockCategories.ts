import * as BlocklyCore from 'blockly/core';

import {BLOCK_TYPES} from '@cdo/apps/blockly/constants';

/**
 * Adds a warning to blocks that are not positioned under a static category block,
 * except when there are no categories at all. If warnings are ignored, we will
 * still save the blocks into a "DEFAULT" category. Pass
 * `dynamicCategoriesHoldBlocks` where blocks under an auto-populated category
 * join its flyout.
 */
export function validateBlockCategories(
  workspace: BlocklyCore.WorkspaceSvg,
  {dynamicCategoriesHoldBlocks = false} = {}
) {
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
      currentCategoryBlock = dynamicCategoriesHoldBlocks ? block : null;
      warningText = 'Auto-populated categories cannot include static blocks.';
    } else {
      // All non-category blocks
      if (!currentCategoryBlock) {
        block.setWarningText(warningText);
      } else {
        block.setWarningText(null);
      }
    }
  });
}
