import * as Blockly from 'blockly/core';

import type {
  CategoryBlocks,
  Toolbox,
  ToolboxCategory,
  ToolboxStaticCategory,
} from './types';

export * from './types';

/**
 * Builds a {@link Toolbox} directly from a level-defined `{category: blockTypes}`
 * map. This is an override, not a filter: the category names are taken as given
 * (whether they match existing categories or are bespoke).
 *
 * - `type: 'flyout'` (the common single-flyout case) flattens every category's
 *   blocks into one flyout; category names do not render there.
 * - `type: 'category'` (the default) keeps the categories in the given order.
 * - Categories mapped to `undefined` are skipped.
 * - `pool` (optional, e.g. the mode's default toolbox) resolves each block id
 *   against it so blocks with toolbox-seeded fields keep them. A type with
 *   several pooled entries (e.g. an Effects block seeded once per effect)
 *   expands to all of them; a type absent from the pool is a bare block.
 *
 * Pass the result to {@link buildToolbox} (or a component that does) to get the
 * Blockly-native toolbox.
 */
export function toolboxFromCategoryBlocks(
  categoryBlocks: CategoryBlocks,
  type: 'flyout' | 'category' = 'category',
  pool?: ToolboxCategory[],
): Toolbox {
  const poolByType = pool ? buildBlockPool(pool) : undefined;
  const resolveId = (
    id: string,
  ): (string | Blockly.utils.toolbox.FlyoutItemInfo)[] =>
    poolByType?.get(id) ?? [id];

  const categories: ToolboxStaticCategory[] = Object.entries(
    categoryBlocks,
  ).flatMap(([name, blocks]) =>
    blocks === undefined ? [] : [{name, blocks: blocks.flatMap(resolveId)}],
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
 * Indexes a pool of toolbox categories by block type, preserving each entry's
 * seeded fields. A block type may map to several entries (e.g. one Effects
 * block per effect).
 */
function buildBlockPool(
  pool: ToolboxCategory[],
): Map<string, (string | Blockly.utils.toolbox.FlyoutItemInfo)[]> {
  const byType = new Map<
    string,
    (string | Blockly.utils.toolbox.FlyoutItemInfo)[]
  >();
  for (const category of pool) {
    for (const block of category.blocks ?? []) {
      // Index by block type, keeping each entry as-is (a bare id stays bare; a
      // field-seeded entry keeps its fields). Non-block items are skipped.
      const type =
        typeof block === 'string'
          ? block
          : block.kind === 'block'
            ? (block as Blockly.utils.toolbox.BlockInfo).type
            : undefined;
      if (typeof type !== 'string') {
        continue;
      }
      const existing = byType.get(type) ?? [];
      existing.push(block);
      byType.set(type, existing);
    }
  }
  return byType;
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
              // `id: type` gives each palette block a stable, type-based
              // `data-id`, which UI targeting (e.g. instruction callouts)
              // relies on. Dragging into the workspace assigns a fresh id, so
              // this only affects the palette copy.
              ...(typeof type === 'string'
                ? {
                    kind: 'block',
                    type,
                    id: type,
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
          // See the category branch: `id: type` gives palette blocks a stable,
          // type-based `data-id` for UI targeting (instruction callouts).
          ...(typeof type === 'string'
            ? {
                kind: 'block',
                type,
                id: type,
              }
            : type),
        }),
      ),
    };
  }
};
