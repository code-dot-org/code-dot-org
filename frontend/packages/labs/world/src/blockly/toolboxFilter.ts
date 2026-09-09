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
    category =>
      // A row that says what it is — the heading over the rules
      // (`blockly/toolboxStyle`) — is not a category and cannot be hidden by
      // naming one. Its words are a heading's, and a level that happened to
      // hide a category sharing them would take the divider with it.
      typeof (category as {kind?: string}).kind === 'string' ||
      !unwanted.has(category.name),
  );
}

/** A row that says what the rows under it are, rather than being one. */
const isHeading = (row: ToolboxCategory): boolean =>
  typeof (row as {kind?: string}).kind === 'string';

/**
 * `toolbox` without a heading that has nothing left under it.
 *
 * The headings are decided while the toolbox is BUILT, where each one is
 * conditional on its group having members (`domainBlocks`). Everything above
 * filters the result afterwards — a level's hidden categories, the rules a
 * `.rule` may not reach (`rulesInScope`), the shelf a lesson gates
 * (`progression/toolboxShelf`) — and any of them can empty a group that was
 * not empty when the heading over it was decided.
 *
 * What that looks like is a word with a horizontal rule above it and nothing
 * after it, which reads as a list that failed to load. It became easy to hit
 * the moment the open file's own drawer was hoisted out of its group: a
 * `.rule` whose only sibling rule is out of scope now empties the Rules group
 * on its own.
 *
 * A heading's group runs until the NEXT heading, so "has nothing under it" is
 * exactly "the row after it is another heading, or there is no row after it".
 * Identity when nothing was dropped, like the filter above.
 */
export function withoutEmptyHeadings(toolbox: Toolbox): Toolbox {
  if (!Array.isArray(toolbox)) {
    return toolbox;
  }
  const rows = toolbox as ToolboxCategory[];
  const kept = rows.filter((row, at) => {
    if (!isHeading(row)) {
      return true;
    }
    const next = rows[at + 1];
    return next !== undefined && !isHeading(next);
  });
  return kept.length === rows.length ? toolbox : kept;
}
