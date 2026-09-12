// Scenes declare what they are, and a level that authors one category per
// scene type shows only the matching blocks — as a flyout, so a student
// never meets a category they are meant to ignore.

import * as BlocklyCore from 'blockly/core';

import {SceneType} from './types';

/** The authored category each scene type draws from. */
const CATEGORY_FOR_TYPE: Record<SceneType, string> = {
  story: 'Story',
  platform: 'Platform',
};

/** Offered in every scene: jumping between scenes belongs to neither type. */
const SHARED_CATEGORY = 'Link';

// The authored shape of a toolbox category; Blockly's own CategoryInfo is a
// union that does not carry these directly.
interface AuthoredCategory {
  name?: string;
  contents?: BlocklyCore.utils.toolbox.ToolboxItemInfo[];
}

/**
 * The blocks a scene of this type should see, flattened to a flyout. Returns
 * the definition unchanged when it has no categories to choose between, or
 * when the scene's type is unknown — an untyped scene keeps every block
 * rather than losing some.
 */
export function toolboxForSceneType(
  toolbox: BlocklyCore.utils.toolbox.ToolboxInfo | undefined,
  sceneType: SceneType | undefined
): BlocklyCore.utils.toolbox.ToolboxInfo | undefined {
  if (!toolbox || !sceneType || toolbox.kind !== 'categoryToolbox') {
    return toolbox;
  }
  const wanted = [CATEGORY_FOR_TYPE[sceneType], SHARED_CATEGORY];
  const categories = (toolbox.contents || []) as AuthoredCategory[];
  if (!categories.some(entry => entry.name === CATEGORY_FOR_TYPE[sceneType])) {
    return toolbox;
  }
  return {
    kind: 'flyoutToolbox',
    contents: wanted.flatMap(
      name => categories.find(entry => entry.name === name)?.contents ?? []
    ),
  };
}
