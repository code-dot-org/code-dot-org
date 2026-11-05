import type * as BlocklyCore from 'blockly/core';

import {makeCategory} from './factories';

/**
 * Generates a toolbox definition from a map of blocks by category.
 */
export default function (
  blocksByCategory: {[category: string]: string[]},
  kind: 'categoryToolbox' | 'flyoutToolbox'
): BlocklyCore.utils.toolbox.ToolboxInfo {
  const categories = Object.keys(blocksByCategory);
  if (kind === 'categoryToolbox') {
    return {
      kind,
      contents: categories.map(categoryName =>
        makeCategory(
          categoryName,
          blocksByCategory[categoryName].map(type => ({
            kind: 'block',
            type,
          }))
        )
      ),
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
