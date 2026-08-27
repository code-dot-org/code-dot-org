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

import {useMaybeProgression} from './progressionContext';
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
  className?: string;
}

export const LessonLink = ({
  unlock,
  onNavigate,
  className,
}: LessonLinkProps) => {
  const progression = useMaybeProgression();
  const tile = progression?.grantedBy(unlock);
  if (!progression || !tile) {
    return null;
  }
  const title = TILES_BY_ID.get(tile)?.title ?? tile;

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
        progression.openTree(tile);
      }}
    >
      How this works: {title}
    </Button>
  );
};
