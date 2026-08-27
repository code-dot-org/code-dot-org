import type {CurriculumChange} from '@code-dot-org/authoring';

import type {CurriculumChangeInput} from './api';
import {buildRevertChangeBody} from './revert';

export interface UndoTarget {
  /** The log entry Undo would compensate for. */
  change: CurriculumChange;
  /** What Undo actually sends to POST /changes. */
  revertBody: CurriculumChangeInput;
}

/**
 * The most recent entry in the whole session log that
 * {@link buildRevertChangeBody} can compensate for, walking back from the
 * end and skipping every op that function declines (see its own doc comment
 * for the excluded set and why).
 *
 * Deliberately global, not scoped to the open course/lesson: the log is one
 * flat, session-wide stream (agent and author changes interleaved), and
 * scoping Undo to "whatever course happens to be open" would silently skip
 * over a more recent edit made elsewhere — worse than a single shared
 * Undo/Redo pair, not better.
 *
 * Note this walk does not distinguish "an ordinary edit" from "a change that
 * was itself produced by a previous Undo/Redo" — both are just
 * CurriculumChange entries of the same shape. Pressing Undo repeatedly
 * therefore toggles the same field back and forth once the first Undo's own
 * compensating entry becomes the new most-recent log entry, rather than
 * walking further back through unrelated history. This is an accepted,
 * documented limitation of building Undo directly on the append-only log
 * rather than a separate client-side history stack.
 */
export function findUndoTarget(
  changes: CurriculumChange[],
): UndoTarget | undefined {
  for (let i = changes.length - 1; i >= 0; i--) {
    const change = changes[i];
    const revertBody = buildRevertChangeBody(change);
    if (revertBody) {
      return {change, revertBody};
    }
  }
  return undefined;
}

/**
 * Whether reverting `change` (Undo) leaves behind a change that can itself
 * be reverted (Redo). True for overrideLevelInstructions/
 * overrideLevelDefinition: the server re-captures `previous` on every apply
 * of those ops, including a revert's own apply, so the compensating entry
 * is exactly as revertible as the original. False for
 * insertExperience/createLevel/attachExistingLevel: their compensating
 * change is always `removeExperience`, which buildRevertChangeBody never
 * offers a revert for (removing an experience doesn't retain what it
 * removed) — so Undo works once, but Redo has nothing safe to replay.
 */
export function isRedoable(change: CurriculumChange): boolean {
  return (
    change.op === 'overrideLevelInstructions' ||
    change.op === 'overrideLevelDefinition'
  );
}
