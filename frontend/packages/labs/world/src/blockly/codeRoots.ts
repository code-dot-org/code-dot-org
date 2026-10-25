// An actor's code rows as roots of its code workspace
// (specs/ACTOR_EDITOR_PLAN.md, step 4c).
//
// A data-shaped actor keeps its drawing, its own blocks and events and its
// every-frame steps as roots of its workspace, beside its handlers; under a
// `define actor` they are rows. The block types are the rows' own — every
// part of the lab that finds one by its type finds it here too — and what
// makes one a root is that it has nothing to attach above or below it.
//
// So a top-level one has its previous and next connections taken away when
// the workspace is loaded and whenever one arrives in it. The orphan rule and
// the section layout ask whether a block has those connections, not what it
// is, and see a root. A connection is not saved: the file holds the same
// blocks either way, and the compiler reads them under the root of the
// actor's view (`actors/actorData`).

import * as Blockly from 'blockly/core';

import {CODE_ROWS} from '../actors/actorData';

import type {EventChoice} from './eventChoices';

/** Make each top-level code row in the workspace a root. */
export function rootCodeRows(workspace: Blockly.Workspace): void {
  for (const block of workspace.getTopBlocks(false)) {
    if (!CODE_ROWS.has(block.type) || block.getParent()) {
      continue;
    }
    let changed = false;
    if (block.previousConnection) {
      block.setPreviousStatement(false);
      changed = true;
    }
    if (block.nextConnection && !block.getNextBlock()) {
      block.setNextStatement(false);
      changed = true;
    }
    if (changed) {
      // …and the orphan rule's mark taken off. It looks at a block as it
      // arrives, which is before this has made it a root, and a disabled
      // block generates nothing: the Label's drawing came back from its
      // first save disabled, and the Label drew as a square.
      block.setDisabledReason(false, Blockly.constants.MANUALLY_DISABLED);
      (block as unknown as {queueRender?: () => void}).queueRender?.();
    }
  }
}

/**
 * What the "+" offers besides the events in an actor's code: what it does
 * (SIMPLE_INTERFACE.md, "An actor is data and events").
 */
export const ACTOR_CODE_CHOICES: readonly EventChoice[] = [
  {type: 'world_trait_step', label: 'every frame', drawer: 'What it does'},
  {
    type: 'world_rule_block',
    label: 'a block of its own',
    drawer: 'What it does',
  },
  {
    type: 'world_rule_event',
    label: 'an event of its own',
    drawer: 'What it does',
  },
  {type: 'world_define_drawing', label: 'its drawing', drawer: 'What it does'},
];
