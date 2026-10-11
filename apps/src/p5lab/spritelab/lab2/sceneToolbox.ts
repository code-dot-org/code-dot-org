// Filters a level's authored toolbox down to one scene type's blocks, and
// gives its flyout leading room when a control floats over the pane.

import * as BlocklyCore from 'blockly/core';

import {SceneType} from './types';

/** The authored category each scene type draws from. */
const CATEGORY_FOR_TYPE: Record<SceneType, string> = {
  story: 'Story',
  platform: 'Platform',
};

/** Offered in every scene: jumping between scenes belongs to neither type. */
const SHARED_CATEGORY = 'Link';

// Blockly's own CategoryInfo is a union that does not carry these directly.
interface AuthoredCategory {
  name?: string;
  contents?: BlocklyCore.utils.toolbox.ToolboxItemInfo[];
}

/**
 * The type's own category plus the shared one, flattened to a flyout so a
 * student never meets a category they are meant to ignore. An untyped scene
 * keeps the authored categories, as does a toolbox naming no scene type.
 */
export function toolboxForSceneType(
  toolbox: BlocklyCore.utils.toolbox.ToolboxInfo | undefined,
  sceneType: SceneType | undefined
): BlocklyCore.utils.toolbox.ToolboxInfo | undefined {
  if (!toolbox || !sceneType || toolbox.kind !== 'categoryToolbox') {
    return toolbox;
  }
  const categories = (toolbox.contents || []) as AuthoredCategory[];
  if (!categories.some(entry => entry.name === CATEGORY_FOR_TYPE[sceneType])) {
    return toolbox;
  }
  const wanted = [CATEGORY_FOR_TYPE[sceneType], SHARED_CATEGORY];
  return {
    kind: 'flyoutToolbox',
    contents: wanted.flatMap(
      name => categories.find(entry => entry.name === name)?.contents ?? []
    ),
  };
}

/**
 * The toolbox with empty room at the top of every flyout, so the first
 * block starts clear of a control floating over the pane's top-left while
 * the blocks still scroll under it. A leading separator is that room in
 * Blockly's own terms.
 */
export function withLeadingRoom(
  toolbox: BlocklyCore.utils.toolbox.ToolboxInfo | undefined,
  gap: number
): BlocklyCore.utils.toolbox.ToolboxInfo | undefined {
  if (!toolbox || !gap) {
    return toolbox;
  }
  const room = {kind: 'sep', gap} as BlocklyCore.utils.toolbox.ToolboxItemInfo;
  if (toolbox.kind === 'categoryToolbox') {
    return {
      ...toolbox,
      contents: (toolbox.contents as AuthoredCategory[]).map(category =>
        category.contents
          ? {...category, contents: [room, ...category.contents]}
          : category
      ) as BlocklyCore.utils.toolbox.ToolboxItemInfo[],
    };
  }
  return {...toolbox, contents: [room, ...(toolbox.contents || [])]};
}
