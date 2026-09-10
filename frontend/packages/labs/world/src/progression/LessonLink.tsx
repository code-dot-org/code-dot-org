// "How this works" — the way back from a thing to the lesson that taught it.
//
// specs/PROGRESSION_UI.md makes this half of the design's second claim: a
// learner who unlocked Collection four weeks ago and cannot remember what
// `Can Be Collected` does should find the lesson from the TRAIT, not by
// hunting for it on a map. So every place a rule, an actor or a block is
// offered can carry one of these, and the reverse index (`GRANTED_BY`) is what
// makes that a one-liner rather than a table somebody maintains.
//
// Renders NOTHING when no tile grants the thing, and nothing when there is no
// progression mounted to open — an affordance that opens nothing is worse than
// no affordance, and both cases are ordinary rather than exceptional.

import {Button} from '@mui/material';

import {useMaybeProgression, type Progression} from './progressionContext';
import type {UnlockTarget} from './types';

import {TILES_BY_ID} from './index';

export interface LessonLinkProps {
  /** What the learner is looking at. */
  unlock: UnlockTarget;
  /**
   * Called before the map opens.
   *
   * Every caller so far is inside a dialog of its own, and two modals on screen
   * at once is the thing the accessibility checklist says to avoid rather than
   * manage. So a caller passes its own `onClose` here and the map replaces it.
   */
  onNavigate?: () => void;
  /**
   * Whether the thing this is beside is LOCKED — not yet unlocked, in a lab
   * that gates the libraries (./shelf).
   *
   * It changes the sentence rather than the destination. A locked row is not
   * an apology; it is a reason to go and do a lesson, and the only useful
   * thing to say beside it is which one.
   */
  locked?: boolean;
  className?: string;
}

/** The lesson a thing comes from: what it is called, and the way to it. */
export interface UnlockLesson {
  readonly title: string;
  readonly open: () => void;
}

/**
 * The lesson that grants `unlock`, or nothing when none does.
 *
 * NOT a hook, though it is only ever called with what one returned: a caller
 * showing a GRID of these asks about each tile inside a `map`, which is the one
 * place a hook may not be called. `LessonLink` below is this plus a button.
 */
export function unlockLesson(
  progression: Progression | undefined,
  unlock: UnlockTarget,
): UnlockLesson | undefined {
  const tile = progression?.grantedBy(unlock);
  if (!progression || !tile) {
    return undefined;
  }
  return {
    title: TILES_BY_ID.get(tile)?.title ?? tile,
    open: () => progression.openTree(tile),
  };
}

export const LessonLink = ({
  unlock,
  onNavigate,
  locked = false,
  className,
}: LessonLinkProps) => {
  const lesson = unlockLesson(useMaybeProgression(), unlock);
  if (!lesson) {
    return null;
  }
  const title = lesson.title;

  return (
    <Button
      className={className}
      variant="text"
      size="small"
      // The lesson's own name, not "learn more": a learner deciding whether to
      // spend twenty minutes is deciding about THAT lesson, and the title is
      // the only thing on this control that says which.
      onClick={event => {
        // Inside a row that is itself clickable, in both dialogs that use this.
        event.stopPropagation();
        onNavigate?.();
        lesson.open();
      }}
    >
      {locked ? `Unlocked by: ${title}` : `How this works: ${title}`}
    </Button>
  );
};
