// The warning on `use trait ⟨Shows Text⟩` when nothing draws the text.
//
// "Shows Text" declares what an actor's words ARE and paints nothing: the rule
// has no steps, and the drawing belongs to the actor that elects it
// (specs/DRAWING.md). So an actor can hold the trait, hold exactly the right
// string, and be painted as the plain rectangle the driver falls back to for a
// thing it has no picture for.
//
// THAT IS A SILENT FAILURE OF THE WORST KIND: everything a learner can see is
// correct. The trait is elected, the text is set, the handler runs, and the
// screen shows a coloured box. There is nothing to search for and no error
// anywhere. The starter's own scoreboard shipped like that.
//
// The engine cannot fix it — an actor with words and no drawing is a legal
// thing to want for a frame, and guessing a picture would be worse. So the
// answer is the one `missingRule` gives to its own silent case: the block that
// has stopped meaning anything says so, on its own face, where the learner is
// already looking.
//
// WHAT COUNTS AS DRAWING IT is `draw text`, and only that. A sprite is a
// picture and not these words; `draw text` reads the text off the actor
// running the drawing, so somebody else's cannot stand in.

import type {Block} from 'blockly';
import * as Blockly from 'blockly/core';

import {defineExtension, type Extension} from '@code-dot-org/blockly';

import {definesWorld} from '../localActors';

import {addOnChange} from './onChange';

export const TEXT_NEEDS_DRAWING_EXTENSION = 'world_text_needs_drawing';

/** The trait this is about. */
const SHOWS_TEXT = 'Writing#ShowsTextTrait';
const DRAW_TEXT = 'world_draw_text';
const DEFINE_ACTOR = 'world_actor';

/** The `define actor` this block is inside, if any. */
function actorRootOf(block: Block): Block | undefined {
  for (let at: Block | null = block; at; at = at.getParent()) {
    if (at.type === DEFINE_ACTOR) {
      return at;
    }
  }
  return undefined;
}

/**
 * Whether anything in this actor's scope draws its text.
 *
 * The scope differs by file, because a drawing lives in a different place in
 * each. In a WORLD a drawing is a row inside the `define actor` that owns it,
 * so the question is about that actor's own descendants — a second local actor
 * having a picture says nothing about this one. In an `.actor` FILE a drawing
 * is a root of its own beside the definition, so the question is about the
 * whole workspace, which holds exactly one actor.
 */
export function somethingDrawsIt(block: Block): boolean {
  const workspace = block.workspace;
  if (!workspace) {
    return true;
  }
  const scope = definesWorld(workspace)
    ? actorRootOf(block)?.getDescendants(false)
    : workspace.getAllBlocks(false);
  // No enclosing `define actor` in a world: the row is somewhere this
  // extension cannot reason about, and `traitContext` is what complains about
  // a `use trait` in the wrong place. Silence is the right answer here.
  return !scope || scope.some(one => one.type === DRAW_TEXT);
}

/**
 * Whether this block is an election of `Shows Text` that nothing answers.
 *
 * The whole decision, separated from the setting of the warning so it can be
 * asked without a live workspace.
 */
export function wordsGoUndrawn(block: Block): boolean {
  return (
    block.getFieldValue?.('TRAIT') === SHOWS_TEXT && !somethingDrawsIt(block)
  );
}

/** Put the warning on, or take it off. */
function syncWarning(block: Block): void {
  // Namespaced, so it coexists with the missing-rule warning and the
  // wrong-place one, which sit on this same block for different reasons.
  block.setWarningText?.(
    wordsGoUndrawn(block)
      ? 'This actor has words but nothing draws them, so it will appear as a ' +
          'plain box. Add “define drawing” with a “draw text” inside it.'
      : null,
    TEXT_NEEDS_DRAWING_EXTENSION,
  );
}

/** Re-check every block on a workspace. */
export function refreshTextDrawingWarnings(
  workspace: Blockly.WorkspaceSvg | null | undefined,
): void {
  for (const block of workspace?.getAllBlocks(false) ?? []) {
    syncWarning(block);
  }
}

/**
 * Warn when an actor elects `Shows Text` and nothing paints them.
 *
 * It listens WIDELY, unlike `missingRule`, which only cares about its own
 * field: the thing that clears this warning is a `draw text` block appearing
 * somewhere else entirely, and the thing that raises it is one being deleted.
 * So any create, delete or move on the workspace is a reason to look again.
 */
export const textNeedsDrawingExtension: Extension = defineExtension(
  TEXT_NEEDS_DRAWING_EXTENSION,
  {
    extension() {
      const block = this as unknown as Block;
      syncWarning(block);
      addOnChange(block, event => {
        if (
          event.type === Blockly.Events.FINISHED_LOADING ||
          event.type === Blockly.Events.BLOCK_CREATE ||
          event.type === Blockly.Events.BLOCK_DELETE ||
          event.type === Blockly.Events.BLOCK_MOVE ||
          event.type === Blockly.Events.BLOCK_CHANGE
        ) {
          syncWarning(block);
        }
      });
    },
  },
);
