import {ToolboxInfo, ToolboxItemInfo} from 'blockly/core/utils/toolbox';

import {getTypedKeys, ValueOf} from '@cdo/apps/types/utils';

import {BlockMode} from '../../constants';
import musicI18n from '../../locale';

import {defaultMaps} from './definitions';
import toolboxBlocks from './toolboxBlocks';
import {Category, ToolboxData} from './types';

import moduleStyles from './toolbox.module.scss';

const baseCategoryCssConfig = {
  container: moduleStyles.toolboxCategoryContainer,
  row: `${moduleStyles.toolboxRow} blocklyTreeRow`, // Used to look up category labels in UI tests
  label: moduleStyles.toolboxLabel,
};

const dynamicCategoryLabels: {
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

  const toolbox: ToolboxInfo = {
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
        });
      }
      continue;
    }

    const categoryContents: ToolboxItemInfo[] = [];

    for (const blockName of categoryBlocksMap[category] || []) {
      // Skip if we aren't allowing this block.
      if (
        allowList &&
        allowList[category] &&
        !allowList[category].includes(blockName)
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
      });
    }
  }
  return toolbox;
}
