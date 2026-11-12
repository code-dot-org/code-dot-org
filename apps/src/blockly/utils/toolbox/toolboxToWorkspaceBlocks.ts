import type * as BlocklyCore from 'blockly/core';

import {BLOCK_TYPES, DYNAMIC_CATEGORY_OPTIONS} from '../../constants';
import {JsonBlockConfig} from '../../types';

import {DEFAULT_CATEGORY_NAME} from './workspaceToToolboxDefinition';

/**
 * The key a dynamic category block's CUSTOM dropdown expects, which is also
 * the category's display name.
 */
function dynamicCategoryKey(
  item: BlocklyCore.utils.toolbox.DynamicCategoryInfo
): string | undefined {
  return Object.keys(DYNAMIC_CATEGORY_OPTIONS).find(
    key => DYNAMIC_CATEGORY_OPTIONS[key] === item.custom
  );
}

/**
 * Converts a toolbox definition into workspace blocks for toolbox editing mode.
 *
 * Adapted from {@link @cdo/apps/music/blockly/toolbox} addToolboxBlocksToWorkspace().
 * TODO: Consolidate
 */
export default function (
  toolbox: BlocklyCore.utils.toolbox.ToolboxInfo | undefined
) {
  if (!toolbox) {
    return {};
  }

  return {blocks: {blocks: contentsToBlocks(toolbox.contents)}};
}

function contentsToBlocks(
  contents: BlocklyCore.utils.toolbox.ToolboxItemInfo[]
) {
  const blocks: Partial<JsonBlockConfig>[] = [];
  for (const item of contents) {
    if (item.kind === 'block') {
      // Add toolbox blocks directly to the workspace.
      const blockInfo = item as BlocklyCore.utils.toolbox.BlockInfo;
      if (!blockInfo.type) {
        console.warn('Missing block type: ', item);
      } else {
        blocks.push(blockInfo as JsonBlockConfig);
      }
    } else if (item.kind === 'category' && 'custom' in item) {
      // For dynamic categories, create a custom category block..
      const dynamicCategoryName = dynamicCategoryKey(
        item as BlocklyCore.utils.toolbox.DynamicCategoryInfo
      );
      if (!dynamicCategoryName) {
        console.warn('Unsupported dynamic category, dropped: ', item);
      } else {
        blocks.push({
          type: BLOCK_TYPES.categoryDynamic,
          fields: {
            CUSTOM: dynamicCategoryName,
          },
        });
      }
    } else if (item.kind === 'category') {
      const categoryInfo = item as BlocklyCore.utils.toolbox.StaticCategoryInfo;
      // For a localized category, like "Sounds", get the category type, like "Play".
      // A hand-authored toolbox may carry only the name.
      const categoryName = categoryInfo.id || categoryInfo.name;
      // 'DEFAULT' categories are intentionally skipped.
      if (categoryName && categoryName !== DEFAULT_CATEGORY_NAME) {
        blocks.push({
          type: BLOCK_TYPES.category,
          fields: {
            CATEGORY: categoryName,
          },
        });
      } else {
        // We shouldn't hit this point, but theoretically could if a toolbox
        // contained unsupported items like buttons or labels.
        console.warn('Unsupported category found:', item);
      }

      if (categoryInfo.contents) {
        blocks.push(...contentsToBlocks(categoryInfo.contents));
      }
    }
  }

  return blocks;
}
