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
 * The blocks a scene of this type should see, flattened to a flyout.
 *
 * A toolbox naming no scene type is left as authored. One that names a type
 * is ALWAYS returned as a flyout — the matching type's blocks plus the shared
 * ones, or every block when the scene has no type — because Blockly refuses
 * to swap a category toolbox for a flyout on a live workspace, so every scene
 * the level can show has to produce the same kind.
 */
export function toolboxForSceneType(
  toolbox: BlocklyCore.utils.toolbox.ToolboxInfo | undefined,
  sceneType: SceneType | undefined
): BlocklyCore.utils.toolbox.ToolboxInfo | undefined {
  if (!toolbox || toolbox.kind !== 'categoryToolbox') {
    return toolbox;
  }
  const categories = (toolbox.contents || []) as AuthoredCategory[];
  const typeCategories: string[] = Object.values(CATEGORY_FOR_TYPE);
  if (!categories.some(entry => typeCategories.includes(entry.name ?? ''))) {
    return toolbox;
  }
  const wanted = sceneType
    ? [CATEGORY_FOR_TYPE[sceneType], SHARED_CATEGORY]
    : categories.map(entry => entry.name ?? '');
  return {
    kind: 'flyoutToolbox',
    contents: wanted.flatMap(
      name => categories.find(entry => entry.name === name)?.contents ?? []
    ),
  };
}
