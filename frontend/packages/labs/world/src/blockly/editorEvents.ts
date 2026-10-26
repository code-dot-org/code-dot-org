// Which of Blockly's change events are a PERSON's, and which the editor's own.
//
// A workspace reports everything that happens in it the same way, and the file
// editor saves what it hears. Most of that is right — a block dropped, a field
// typed into, a stack pulled apart are all edits — but some of it is the
// editor tidying after itself, and saving those writes the file back for
// something nobody did.
//
// The cost is not a wasted write. A save marks the project dirty, which copies
// every file, recompiles and RESTARTS the running world — so a layout Blockly
// chose for itself threw away the game the reader was looking at.
//
// Pure, and here rather than in the component, so it can be tested without
// injecting a workspace: what an event MEANS is arithmetic on the event.

import {Blockly} from '@code-dot-org/blockly';

/**
 * The reasons Blockly gives for a move that nobody made.
 *
 * `bump` is a block pushed out of the way or back into bounds, `snap` is one
 * pulled onto a connection, `cleanup` is the workspace tidied wholesale.
 */
const MOVED_BY_THE_EDITOR = new Set(['bump', 'snap', 'cleanup']);

/**
 * Whether the EDITOR moved this block rather than a person.
 *
 * A MOVE MAY HAVE SEVERAL REASONS — Blockly's own note says merging can
 * produce `['drag', 'bump', 'snap']` — so the test is that NONE of them is a
 * person's. A drag that caused a bump is still a drag, and still an edit.
 *
 * A move with NO reason given is treated as a person's, which is the safe way
 * round: a save missed is work lost, and a save made needlessly is only slow.
 */
export function movedItself(event: Blockly.Events.Abstract): boolean {
  if (event.type !== Blockly.Events.BLOCK_MOVE) {
    return false;
  }
  const {reason} = event as Blockly.Events.BlockMove;
  return (
    reason !== undefined &&
    reason.length > 0 &&
    reason.every(why => MOVED_BY_THE_EDITOR.has(why))
  );
}
