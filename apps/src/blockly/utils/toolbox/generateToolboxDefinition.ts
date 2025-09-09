import type * as GoogleBlockly from 'blockly/core';

/**
 * Generates a toolbox definition from a map of blocks by category.
 */
export default function (
  blocksByCategory: {[category: string]: string[]},
  kind: 'categoryToolbox' | 'flyoutToolbox'
): GoogleBlockly.utils.toolbox.ToolboxInfo {
  const categories = Object.keys(blocksByCategory);
  if (kind === 'categoryToolbox') {
    return {
      kind,
      contents: categories.map(categoryName => ({
        kind: 'category',
        name: categoryName,
        contents: blocksByCategory[categoryName].map(type => ({
          kind: 'block',
          type,
        })),
      })),
    };
  }

  return {
    kind,
    contents: categories.flatMap(categoryName =>
      blocksByCategory[categoryName].map(type => ({
        kind: 'block',
        type,
      }))
    ),
  };
}
