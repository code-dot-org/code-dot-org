import * as Blockly from 'blockly/core';

import type {Toolbox, ToolboxStaticCategory} from './types';

export * from './types';

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
