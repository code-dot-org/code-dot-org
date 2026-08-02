// Leaving categories out of the toolbox.
//
// A level can name categories it does not want offered (`levelData`). What that
// removes is the WAY IN, not the blocks: every block stays defined, so a
// workspace the level ships with — or one a learner brings from an earlier
// level — still renders and still generates code. A toolbox is a menu, and
// taking a dish off the menu is not the same as emptying the kitchen.

import type {Toolbox, ToolboxCategory} from '@code-dot-org/blockly';

/**
 * `toolbox` without the categories named in `hidden`, matched on the name the
 * category shows.
 *
 * Names, because that is what a curriculum author sees and what a rule's
 * category is called ("Gravity"). A name nothing matches is not an error: a
 * level may name a category that this project has no rule for, and the toolbox
 * is simply as it was.
 */
export function withoutCategories(
  toolbox: Toolbox,
  hidden: readonly string[],
): Toolbox {
  if (hidden.length === 0 || !Array.isArray(toolbox)) {
    return toolbox;
  }
  const unwanted = new Set(hidden);
  return (toolbox as ToolboxCategory[]).filter(
    category => !unwanted.has(category.name),
  );
}
