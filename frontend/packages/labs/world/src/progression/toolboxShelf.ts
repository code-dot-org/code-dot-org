// Hiding the blocks a learner has not been given yet.
//
// The other half of "the unlock has to be real" (specs/PROGRESSION.md). The
// import libraries gate what a project may TAKE; this gates what its editor
// OFFERS. Without it the first lesson opens with twelve drawers and a hundred
// and fifty-seven blocks while its own detail pane says it unlocks the Actor
// drawer — a promise the toolbox contradicts on the same screen.
//
// ── What is earned, and what is simply there ────────────────────────────────
//
// A drawer becomes EARNED the moment the catalogue grants anything in it, and
// not before. Nothing is listed here as gated: the set is derived from what the
// tiles say they unlock, so a drawer no lesson has been written for stays
// entirely open, and gating grows as the curriculum does rather than having to
// be complete on the first day.
//
// The consequence is worth stating plainly, because it is the forcing function:
// once one Actor block is granted, every OTHER Actor block is hidden until some
// tile grants it too. A lesson that needs a block nobody has assigned is a
// lesson that cannot be done, which is why `__tests__/toolboxShelf.test.ts`
// walks each lesson's solved project and insists every block in it is offered.
//
// ── A lesson offers what it teaches ─────────────────────────────────────────
//
// `logic/if` asks the learner to add an `if`, and finishing it is what grants
// Logic. So a lesson's toolbox is the shelf PLUS that tile's own unlocks —
// otherwise no gated lesson could ever be done, which is a trap rather than a
// gate. That lending is in `shelfKeys` rather than here: it was here first,
// which left the import dialogs asking a narrower question, so a rule a lesson
// needed was one its own library refused to hand over.
//
// ── Rules are not gated here ────────────────────────────────────────────────
//
// A rule's drawer comes from a `.rule` file the project holds, and a project
// that holds Gravity has Gravity's blocks whether or not the learner earned
// them: an edge on the map means readiness, not possession, and a lesson may
// hand you anything. No tile grants a rule's individual blocks, so no rule
// drawer is ever earned, and all of them pass through untouched.

import type {Toolbox, ToolboxCategory} from '@code-dot-org/blockly';

import {TILES} from './catalogue';
import type {UnlockTarget} from './types';

/** A flyout entry's block type, when it names one. */
const typeOf = (item: unknown): string | undefined => {
  if (typeof item === 'string') {
    return item;
  }
  const named = item as {type?: unknown};
  return typeof named.type === 'string' ? named.type : undefined;
};

/**
 * Blocks a RULE generates, which are never gated — with two exceptions.
 *
 * A project that holds Gravity has Gravity's blocks whether or not the learner
 * earned them, so a tile granting one must not make that whole drawer earned
 * and hide the rest of it. `arcade/bounce` grants "the bounciness property" and
 * `story/choice` grants "go to line": both read well in a detail pane, both
 * arrive with the rule, and neither may gate anything.
 *
 * SPACE AND APPEARANCE ARE DIFFERENT. They are the engine's own two rules, in
 * every project there has ever been, and `set position` and `set sprite` are
 * core vocabulary rather than a mechanic somebody opted into. Those two drawers
 * are earned like any other.
 */
const generatedElsewhere = (type: string): boolean =>
  /^world_(do|get|set|on|query|emit)_(?!Space_|Appearance_)[A-Z]/.test(type);

/** Every block type the catalogue grants and that gating applies to. */
export const EARNED_BLOCKS: ReadonlySet<string> = new Set(
  TILES.flatMap(tile =>
    tile.unlocks
      .filter(unlock => unlock.kind === 'block')
      .map(unlock => (unlock as {type: string}).type)
      .filter(type => !generatedElsewhere(type)),
  ),
);

/** Every drawer the catalogue grants whole. */
export const EARNED_CATEGORIES: ReadonlySet<string> = new Set(
  TILES.flatMap(tile =>
    tile.unlocks
      .filter(unlock => unlock.kind === 'category')
      .map(unlock => (unlock as {name: string}).name),
  ),
);

/** Whether this drawer has anything earned in it — see the header. */
const isEarned = (category: ToolboxCategory): boolean =>
  EARNED_CATEGORIES.has(category.name) ||
  (category.blocks ?? []).some(item => {
    const type = typeOf(item);
    return type !== undefined && EARNED_BLOCKS.has(type);
  });

export interface ShelfView {
  /**
   * Whether the learner holds a thing (progression context).
   *
   * Which already accounts for the lesson being done — see `shelfKeys`.
   */
  holds: (unlock: UnlockTarget) => boolean;
}

/**
 * The toolbox as this learner should see it.
 *
 * Identity when nothing is hidden, so the common case — an ungated lab — hands
 * back the object it was given rather than a fresh one every rebuild.
 */
export function shelvedToolbox(toolbox: Toolbox, view: ShelfView): Toolbox {
  if (!Array.isArray(toolbox)) {
    return toolbox;
  }
  const kept: ToolboxCategory[] = [];
  let changed = false;
  for (const category of toolbox as ToolboxCategory[]) {
    if (EARNED_CATEGORIES.has(category.name)) {
      if (view.holds({kind: 'category', name: category.name})) {
        kept.push(category);
      } else {
        changed = true;
      }
      continue;
    }
    if (!isEarned(category)) {
      kept.push(category);
      continue;
    }
    const blocks = (category.blocks ?? []).filter(item => {
      const type = typeOf(item);
      if (type === undefined) {
        // A labeled button or a preset flyout item names no type; it belongs
        // to the drawer rather than to any lesson.
        return true;
      }
      // INSIDE AN EARNED DRAWER, a block nobody grants is HIDDEN rather than
      // shown, and that is the whole of per-block gating: an Actor drawer that
      // kept its thirty-nine unassigned blocks would still be a wall of them. A
      // block with no lesson belongs to a lesson nobody has written yet.
      //
      // Decided here rather than by `holds`, which answers yes for anything the
      // catalogue does not grant — the right answer for the import libraries,
      // where the catalogue is not a whitelist, and the wrong one here, where
      // it is. Delegating to it left the first lesson offering ninety-seven
      // blocks and looking, from the numbers, exactly like no gating at all.
      //
      // EXCEPT a block the project itself mints. A rule's blocks are safe
      // because a rule has a drawer of its own and no drawer of a rule's is
      // ever earned — but an own property's get and set land in the ACTOR
      // drawer (`blockly/ownProperties`), which is earned, and hiding those
      // would hide the very block a learner just brought into existence by
      // declaring it. Nothing here can grant them: their types are minted from
      // a file path and a name nobody knew in advance.
      if (generatedElsewhere(type)) {
        return true;
      }
      return EARNED_BLOCKS.has(type) && view.holds({kind: 'block', type});
    });
    if (blocks.length === (category.blocks ?? []).length) {
      kept.push(category);
      continue;
    }
    changed = true;
    if (blocks.length > 0) {
      kept.push({...category, blocks} as ToolboxCategory);
    }
  }
  return changed ? kept : toolbox;
}
