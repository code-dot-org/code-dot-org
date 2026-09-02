// The warning on `define block ⟨reports a …⟩` in an `.actor` file.
//
// One block designs two things: something that DOES something, and something
// that REPORTS a value (`world_rule_block`'s RETURNS dropdown). A rule can
// declare either. An actor, for now, can declare only the first — the value
// form wants a `defineQuery` beside `defineAction` and a `return` that a body
// may end with, and that is a piece of work rather than a line.
//
// SO IT SAYS SO. Everything else about the block is unchanged: the dropdown
// still offers the row, because the field is one shape wherever the block is
// written and a field that shrank in one file would be a second block wearing
// the first one's name. What changes is that a learner who picks it is told,
// on the block, rather than left with a definition that compiles to nothing
// and a call site that never appears in the palette.

import type {Block} from 'blockly';
import * as Blockly from 'blockly/core';

import {defineExtension, type Extension} from '@code-dot-org/blockly';

import {definesWorld} from '../localActors';

import {addOnChange} from './onChange';

export const ACTOR_BLOCK_REPORTS_EXTENSION = 'world_actor_block_reports';

const DEFINE_ACTOR = 'world_actor';

/**
 * Whether this definition is one an ACTOR is making.
 *
 * The top of the chain, and not merely "has a `define actor` above it": a
 * `define block` under a rule's trait has a `define rule` above it and belongs
 * to the rule. A world is excluded because a `define block` is not offered
 * there at all (`ROOT_HOMES`) — the check is what makes a pasted one quiet
 * rather than wrong.
 */
function declaredByAnActor(block: Block): boolean {
  let at: Block = block;
  for (let up = at.getParent(); up; at = up, up = at.getParent()) {
    // walk to the top of the chain
  }
  return at.type === DEFINE_ACTOR && !definesWorld(block.workspace);
}

/** Whether this block promises something an actor cannot deliver yet. */
export function reportsWhereItCannot(block: Block): boolean {
  const returns = block.getFieldValue?.('RETURNS');
  return Boolean(returns) && returns !== 'none' && declaredByAnActor(block);
}

function syncWarning(block: Block): void {
  block.setWarningText?.(
    reportsWhereItCannot(block)
      ? 'An actor’s own block can only DO something for now. Set this back to ' +
          '“does something”, or declare it in a rule, where a block that ' +
          'reports a value belongs.'
      : null,
    ACTOR_BLOCK_REPORTS_EXTENSION,
  );
}

/**
 * Warn when an actor's own block says it reports a value.
 *
 * Listens to the same events `textNeedsDrawing` does rather than to its own
 * field alone: the answer changes when the DROPDOWN changes, and also when the
 * definition is dragged out of an actor's chain and back into one.
 */
export const actorBlockReportsExtension: Extension = defineExtension(
  ACTOR_BLOCK_REPORTS_EXTENSION,
  {
    extension() {
      const block = this as unknown as Block;
      syncWarning(block);
      addOnChange(block, event => {
        if (
          event.type === Blockly.Events.FINISHED_LOADING ||
          event.type === Blockly.Events.BLOCK_CREATE ||
          event.type === Blockly.Events.BLOCK_MOVE ||
          event.type === Blockly.Events.BLOCK_CHANGE
        ) {
          syncWarning(block);
        }
      });
    },
  },
);
