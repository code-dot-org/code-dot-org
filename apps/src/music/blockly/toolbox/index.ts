import * as GoogleBlockly from 'blockly/core';

import {getTypedKeys, ValueOf} from '@cdo/apps/types/utils';

import appConfig from '../../appConfig';
import {BlockMode} from '../../constants';
import musicI18n from '../../locale';
import {BlockTypes} from '../blockTypes';

import {defaultMaps} from './definitions';
import toolboxBlocks from './toolboxBlocks';
import {Category, ToolboxData} from './types';

import moduleStyles from './toolbox.module.scss';

const baseCategoryCssConfig = {
  container: moduleStyles.toolboxCategoryContainer,
  row: `${moduleStyles.toolboxRow} blocklyTreeRow`, // Used to look up category labels in UI tests
  label: moduleStyles.toolboxLabel,
};

export const DEFAULT_CATEGORY_NAME = 'DEFAULT';

export const dynamicCategoryLabels: {
  [key in Category]?: string;
} = {
  [Category.Functions]: 'PROCEDURE',
  [Category.Variables]: 'VARIABLE',
};

export const dynamicCategories = getTypedKeys(dynamicCategoryLabels);

export const categoryTypeToLocalizedName: {[key in Category]: string} = {
  Control: musicI18n.blockly_toolboxCategoryControl(),
  Effects: musicI18n.blockly_toolboxCategoryEffects(),
  Events: musicI18n.blockly_toolboxCategoryEvents(),
  Functions: musicI18n.blockly_toolboxCategoryFunctions(),
  Logic: musicI18n.blockly_toolboxCategoryLogic(),
  Math: musicI18n.blockly_toolboxCategoryMath(),
  Play: musicI18n.blockly_toolboxCategoryPlay(),
  Simple: musicI18n.blockly_toolboxCategorySimple(),
  Tracks: musicI18n.blockly_toolboxCategoryTracks(),
  Variables: musicI18n.blockly_toolboxCategoryVariables(),
};

/**
 * Generates a Music Lab Blockly toolbox for the given block mode,
 * configured by the level toolbox data if provided.
 */
export function getToolbox(
  blockMode: ValueOf<typeof BlockMode>,
  levelToolbox?: ToolboxData
) {
  const categoryBlocksMap = defaultMaps[blockMode];
  const allowList = levelToolbox?.blocks;
  const type = levelToolbox?.type;

  const toolbox: GoogleBlockly.utils.toolbox.ToolboxInfo = {
    kind: type === 'flyout' ? 'flyoutToolbox' : 'categoryToolbox',
    contents: [],
  };

  for (const category of getTypedKeys<Category>(categoryBlocksMap)) {
    // Skip if we aren't allowing anything from this category.
    if (allowList && !allowList[category]) {
      continue;
    }

    if (dynamicCategories.includes(category)) {
      // Dynamic categories are not allowed in flyout toolboxes
      if (type !== 'flyout') {
        toolbox.contents.push({
          kind: 'category',
          name: categoryTypeToLocalizedName[category],
          cssconfig: baseCategoryCssConfig,
          custom: dynamicCategoryLabels[category],
          id: category,
        });
      }
      continue;
    }

    const categoryContents: GoogleBlockly.utils.toolbox.ToolboxItemInfo[] = [];

    for (const blockName of categoryBlocksMap[category] || []) {
      // Skip if we aren't allowing this block.
      if (
        allowList &&
        allowList[category] &&
        !allowList[category].includes(blockName)
      ) {
        continue;
      }

      if (
        blockName === BlockTypes.PLAY_PATTERN_AI_AT_CURRENT_LOCATION_SIMPLE2 &&
        !(
          levelToolbox?.includeAi ||
          appConfig.getValue('play-pattern-ai-block') === 'true'
        )
      ) {
        continue;
      }

      categoryContents.push(toolboxBlocks[blockName]);
    }

    if (type === 'flyout') {
      toolbox.contents = toolbox.contents.concat(categoryContents);
    } else {
      toolbox.contents.push({
        kind: 'category',
        name: categoryTypeToLocalizedName[category],
        cssconfig: baseCategoryCssConfig,
        contents: categoryContents,
        id: category,
      });
    }
  }
  return toolbox;
}

/**
 * Localizes the category names in the toolbox and adds our css configuration.
 * Required for levels with categorized toolboxes that were defined in
 * levelbuilder's toolbox mode.
 */
export function prepareToolboxCategories(
  toolbox: GoogleBlockly.utils.toolbox.ToolboxInfo
): GoogleBlockly.utils.toolbox.ToolboxInfo {
  return {
    ...toolbox,
    contents: toolbox.contents.map(toolboxItem => {
      if (toolboxItem.kind === 'category') {
        const staticCategory =
          toolboxItem as GoogleBlockly.utils.toolbox.StaticCategoryInfo;
        const localizedName =
          categoryTypeToLocalizedName[staticCategory.id as Category];

        return {
          ...staticCategory,
          name: localizedName || staticCategory.name,
          cssconfig: baseCategoryCssConfig,
        };
      }
      return toolboxItem;
    }),
  };
}

/**
 * The additional toolbox category for Toolbox mode, containing a block
 * for specifying the start of a category. Only available for levelbuilders.
 */
export const toolboxModeCategory = {
  kind: 'category',
  name: 'Categories',
  cssconfig: baseCategoryCssConfig,
  contents: [
    {kind: 'block', type: BlockTypes.CATEGORY},
    {kind: 'block', type: BlockTypes.CUSTOM_CATEGORY},
  ],
};

/**
 * Given a toolbox definition and a workspace, iterate through any
 * categories, add all blocks to the workspace. Used for levelbuilder's
 * toolbox mode.
 */
export function addToolboxBlocksToWorkspace(
  contents: GoogleBlockly.utils.toolbox.ToolboxItemInfo[],
  workspace: GoogleBlockly.WorkspaceSvg,
  clearWorkspace: boolean = true
) {
  if (clearWorkspace) {
    workspace.clear();
  }
  contents.forEach(toolboxItem => {
    if (toolboxItem.kind === 'block') {
      // Add toolbox blocks directly to the workspace.
      Blockly.serialization.blocks.append(
        toolboxItem as GoogleBlockly.serialization.blocks.State,
        workspace
      );
    } else if (toolboxItem.kind === 'category' && 'custom' in toolboxItem) {
      // For dynamic categories, create a custom category block..
      const dynamicCategoryName = (
        toolboxItem as GoogleBlockly.utils.toolbox.DynamicCategoryInfo
      ).id;
      Blockly.serialization.blocks.append(
        {
          type: BlockTypes.CUSTOM_CATEGORY,
          fields: {
            CUSTOM: dynamicCategoryName,
          },
        },
        workspace
      );
    } else if (toolboxItem.kind === 'category') {
      const categoryInfo =
        toolboxItem as GoogleBlockly.utils.toolbox.StaticCategoryInfo;
      // For a localized category, like "Sounds", get the category type, like "Play".
      const categoryName = categoryInfo.id;
      // 'DEFAULT' categories are intentionally skipped.
      if (categoryName && categoryName in Category) {
        // Create a category block
        Blockly.serialization.blocks.append(
          {
            type: BlockTypes.CATEGORY,
            fields: {
              CATEGORY: categoryName,
            },
          },
          workspace
        );
      } else {
        // We shouldn't hit this point, but theoretically could if a toolbox
        // contained unsupported items like buttons or labels.
        console.warn('Unsupported category found:', toolboxItem);
      }
      // Recursively process the contents of the static category
      addToolboxBlocksToWorkspace(
        (toolboxItem as GoogleBlockly.utils.toolbox.StaticCategoryInfo)
          .contents,
        workspace,
        false
      );
    } else {
      console.warn('Unsupported toolbox item found:', toolboxItem);
    }
  });
}

/**
 * Creates a new static category. Used to convert workspace
 * blocks into a toolbox definition in levelbuilder's toolbox mode.
 * @returns JSON representation of a new static category.
 */
export function getNewStaticCategory(
  name: string = DEFAULT_CATEGORY_NAME
): GoogleBlockly.utils.toolbox.StaticCategoryInfo {
  return {
    kind: 'category',
    // name is not localized upon saving, because levelbuilder is English only.
    // Instead, we localize the category names when loading the toolbox.
    // See prepareToolboxCategories().
    name,
    cssconfig: undefined,
    contents: [] as GoogleBlockly.utils.toolbox.ToolboxItemInfo[],
    id: name,
    categorystyle: undefined,
    colour: undefined,
    hidden: undefined,
  };
}

/**
 * Creates a new dynamic category. Used to convert workspace
 * blocks into a toolbox definition in levelbuilder's toolbox mode.
 * @returns JSON representation of a new dynamic category.
 */
export function getNewDynamicCategory(
  name: string
): GoogleBlockly.utils.toolbox.ToolboxItemInfo {
  return {
    kind: 'category',
    custom: dynamicCategoryLabels[name as Category],
    // name is not localized upon saving, because levelbuilder is English only.
    // Instead, we localize the category names when loading the toolbox.
    // See prepareToolboxCategories().
    name,
    cssconfig: undefined,
    id: name,
    categorystyle: undefined,
    colour: undefined,
    hidden: undefined,
  };
}

/**
 * Determines if a category is valid. Used to filter out
 * empty "DEFAULT" categories when saving in toolbox mode.
 * @param category
 */
export function isValidCategory(
  category: GoogleBlockly.utils.toolbox.StaticCategoryInfo
): boolean {
  return !!(
    category.contents.length || category.name !== DEFAULT_CATEGORY_NAME
  );
}
