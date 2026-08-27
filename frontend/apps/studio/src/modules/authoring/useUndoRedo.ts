import {useState} from 'react';

import type {CourseModel, CurriculumChange} from '@code-dot-org/authoring';

import {authoringApi} from './api';
import {summarizeChange} from './changeHistory';
import {buildRevertChangeBody} from './revert';
import {findUndoTarget, isRedoable} from './undoRedo';

interface PendingRedo {
  /** The Undo-produced compensating change Redo would itself revert — its
   * server-captured `previous` (for override* ops) is what makes a second
   * revert exact, so this has to be the server's response, not the body we
   * sent it. */
  change: CurriculumChange;
  /** Guards staleness: valid only while the log hasn't grown since this
   * change was appended — any further edit (this author, elsewhere, or the
   * agent) clears Redo, the same way a fresh edit clears a normal redo
   * stack. */
  expectedLength: number;
  label: string;
}

export interface UndoRedoState {
  canUndo: boolean;
  undoLabel: string | undefined;
  canRedo: boolean;
  redoLabel: string | undefined;
  busy: boolean;
  /** Set on a failed Undo/Redo apply — e.g. the moved-experience edge, where
   * the target has since moved to a different lesson and the compensating
   * removeExperience can no longer find it there. Cleared on the next
   * attempt. */
  error: string | undefined;
  undo: () => void;
  redo: () => void;
}

/** Top-bar Undo/Redo, driven directly by the session's CurriculumChange log
 * — see undoRedo.ts for the target-selection and redo-eligibility rules. */
export function useUndoRedo(
  changes: CurriculumChange[],
  courses: CourseModel[],
): UndoRedoState {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [pendingRedo, setPendingRedo] = useState<PendingRedo | undefined>();

  const undoTarget = findUndoTarget(changes);
  const canRedo =
    pendingRedo !== undefined && changes.length === pendingRedo.expectedLength;

  const undo = () => {
    if (busy || !undoTarget) {
      return;
    }
    const target = undoTarget;
    const priorLength = changes.length;
    setBusy(true);
    setError(undefined);
    void authoringApi
      .applyChange(target.revertBody)
      .then(({change}) => {
        setPendingRedo(
          isRedoable(change)
            ? {
                change,
                expectedLength: priorLength + 1,
                label: summarizeChange(target.change, courses),
              }
            : undefined,
        );
      })
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : 'That undo failed to apply.');
      })
      .finally(() => setBusy(false));
  };

  const redo = () => {
    if (busy || !canRedo || !pendingRedo) {
      return;
    }
    const revertBody = buildRevertChangeBody(pendingRedo.change);
    if (!revertBody) {
      // isRedoable already checked this at Undo time; nothing changed the
      // op's shape in between, so this shouldn't happen — but a silent no-op
      // is safer than sending a malformed body.
      return;
    }
    setBusy(true);
    setError(undefined);
    void authoringApi
      .applyChange(revertBody)
      .then(() => setPendingRedo(undefined))
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : 'That redo failed to apply.');
      })
      .finally(() => setBusy(false));
  };

  return {
    canUndo: Boolean(undoTarget),
    undoLabel: undoTarget
      ? summarizeChange(undoTarget.change, courses)
      : undefined,
    canRedo,
    redoLabel: pendingRedo?.label,
    busy,
    error,
    undo,
    redo,
  };
}
