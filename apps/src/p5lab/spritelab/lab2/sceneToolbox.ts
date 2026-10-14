// Filters a level's authored toolbox down to one scene type's blocks.

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
