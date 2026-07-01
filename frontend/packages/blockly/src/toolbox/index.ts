import * as Blockly from 'blockly/core';

import type {CategoryBlocks, Toolbox, ToolboxStaticCategory} from './types';

export * from './types';

/**
 * Builds a {@link Toolbox} directly from a level-defined `{category: blockTypes}`
 * map. This is an override, not a filter: the category names are taken as given
 * (whether they match existing categories or are bespoke), and each block type
 * is included as-is — Blockly renders it with its own defaults.
 *
 * - `type: 'flyout'` (the common single-flyout case) flattens every category's
 *   blocks into one flyout; category names do not render there.
 * - `type: 'category'` (the default) keeps the categories in the given order.
 * - Categories mapped to `undefined` are skipped.
 *
 * Pass the result to {@link buildToolbox} (or a component that does) to get the
 * Blockly-native toolbox.
 */
export function toolboxFromCategoryBlocks(
  categoryBlocks: CategoryBlocks,
  type: 'flyout' | 'category' = 'category',
): Toolbox {
  const categories: ToolboxStaticCategory[] = Object.entries(
    categoryBlocks,
  ).flatMap(([name, blocks]) =>
    blocks === undefined ? [] : [{name, blocks: [...blocks]}],
  );

  if (type === 'flyout') {
    return {
      name: '',
      blocks: categories.flatMap(category => category.blocks),
    };
  }

  return categories;
}

/**
 * Converts our dynamic configuration of a toolbox into one that can be
 * directly supplied to the Workspace on injection.
 */
export const buildToolbox: (
  toolbox: Toolbox,
) => Blockly.utils.toolbox.ToolboxInfo = toolbox => {
  if (typeof (toolbox as Blockly.utils.toolbox.ToolboxInfo).kind === 'string') {
    // This is a normally defined Blockly toolbox already
    return toolbox as Blockly.utils.toolbox.ToolboxInfo;
  } else if (Array.isArray(toolbox)) {
    // Categories (set of categories given)
    return {
      kind: 'categoryToolbox',
      contents: toolbox.map(({name, cssconfig, blocks, onLoad, key}) => ({
        kind: 'category',
        name,
        cssconfig,
        ...(onLoad ? {custom: key} : {}),
        contents:
          blocks?.map(
            (type: string | Blockly.utils.toolbox.FlyoutItemInfo) => ({
              ...(typeof type === 'string'
                ? {
                    kind: 'block',
                    type,
                  }
                : type),
            }),
          ) || [],
      })),
    } as Blockly.utils.toolbox.ToolboxInfo;
  } else {
    // Flyout (just one category directly supplied)
    const flyout = toolbox as ToolboxStaticCategory;
    return {
      kind: 'flyoutToolbox',
      contents: flyout.blocks.map(
        (type: string | Blockly.utils.toolbox.BlockInfo) => ({
          ...(typeof type === 'string'
            ? {
                kind: 'block',
                type,
              }
            : type),
        }),
      ),
    };
  }
};
