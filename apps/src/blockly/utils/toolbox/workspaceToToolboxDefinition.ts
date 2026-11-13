import type * as BlocklyCore from 'blockly/core';

import {BLOCK_TYPES, DYNAMIC_CATEGORY_OPTIONS} from '../../constants';

import {makeDynamicCategory, NamedDynamicCategoryInfo} from './factories';

export const DEFAULT_CATEGORY_NAME = 'DEFAULT';

/**
 * Determines if a category is valid. Used to filter out
 * empty "DEFAULT" categories when saving in toolbox mode.
 * @param category
 */
export function isValidCategory(
  category:
    | BlocklyCore.utils.toolbox.StaticCategoryInfo
    | NamedDynamicCategoryInfo
): boolean {
  return !!(
    category.contents?.length || category.name !== DEFAULT_CATEGORY_NAME
  );
}

/**
 * Creates a new static category. Used to convert workspace
 * blocks into a toolbox definition in levelbuilder's toolbox mode.
 * @returns JSON representation of a new static category.
 */
export function getNewStaticCategory(
  name: string = DEFAULT_CATEGORY_NAME
): BlocklyCore.utils.toolbox.StaticCategoryInfo {
  return {
    kind: 'category',
    name,
    cssconfig: undefined,
    contents: [] as BlocklyCore.utils.toolbox.ToolboxItemInfo[],
    id: name,
    categorystyle: undefined,
    colour: undefined,
    hidden: undefined,
  };
}

/**
 * Serialize the top blocks of the workspace as a toolbox. Pass
 * `dynamicCategoriesHoldBlocks` to save blocks under an auto-populated
 * category into it; otherwise they go to a "DEFAULT" category.
 * @returns a toolbox definition that can be handled directly by Blockly.
 *
 * Adapted from {@link @cdo/apps/music/blockly/MusicBlocklyWorkspace} workspaceToToolboxDefinition().
 * TODO: Consolidate
 */
export default function (
  workspace: BlocklyCore.WorkspaceSvg,
  {dynamicCategoriesHoldBlocks = false} = {}
) {
  const topBlocks = workspace.getTopBlocks(true);

  // This will be the final toolbox returned by this function, either a
  // flyout toolbox or a category toolbox.
  const fullToolbox: BlocklyCore.utils.toolbox.ToolboxInfo = {
    contents: [],
  };
  // Temporary storage for blocks that will be added to the next category,
  // if categories exist, or the final flyout toolbox.
  let flyoutItems: BlocklyCore.utils.toolbox.FlyoutItemInfo[] = [];

  // Temporary storage for a category, containing a name, type, list of contents.
  let currentCategory:
    | BlocklyCore.utils.toolbox.StaticCategoryInfo
    | NamedDynamicCategoryInfo = getNewStaticCategory();

  topBlocks.forEach(block => {
    if (block.type === BLOCK_TYPES.category) {
      fullToolbox.kind = 'categoryToolbox';
      if (isValidCategory(currentCategory)) {
        // Add the previous category to toolbox.
        fullToolbox.contents.push({...currentCategory});
      }

      // Begin a new category for the blocks that follow.
      currentCategory = getNewStaticCategory(block.getFieldValue('CATEGORY'));
      flyoutItems = [];
    } else if (block.type === BLOCK_TYPES.categoryDynamic) {
      fullToolbox.kind = 'categoryToolbox';
      if (isValidCategory(currentCategory)) {
        // Add previous category to toolbox
        fullToolbox.contents.push({...currentCategory});
      }
      const name = block.getFieldValue('CUSTOM');
      const dynamicCategory = makeDynamicCategory(
        name,
        DYNAMIC_CATEGORY_OPTIONS[name]
      );
      if (dynamicCategoriesHoldBlocks) {
        // Blocks that follow join the generated flyout, after its own blocks.
        currentCategory = dynamicCategory;
      } else {
        fullToolbox.contents.push(dynamicCategory);
        currentCategory = getNewStaticCategory();
      }
      flyoutItems = [];
    } else {
      // Add the current block to the flyout and category.
      flyoutItems.push({
        kind: 'block',
        ...Blockly.serialization.blocks.save(block, {saveIds: false}),
        id: Blockly.blockIdOverrides?.[block.id] || block.id,
        enabled: true,
      });
      currentCategory.contents = flyoutItems;
    }
  });

  // Finalize the toolbox.
  if (
    !fullToolbox.contents.length &&
    currentCategory.name === DEFAULT_CATEGORY_NAME
  ) {
    // If no categories have been used, create a flyout toolbox.
    fullToolbox.kind = 'flyoutToolbox';
    fullToolbox.contents = flyoutItems;
  } else if (isValidCategory(currentCategory)) {
    // Add the final category to the toolbox.
    fullToolbox.contents.push({...currentCategory});
  }
  return fullToolbox;
}
