/**
 * JourneyBubble — a single level bubble in the journey map.
 *
 * Wraps BubbleNode from the component library.  Derives BubbleState from
 * the seat's JourneyProgress.  No inner glyph — the bubble's job is to
 * communicate *state* (color, shape, pulse) and *position on the path*.
 * The level kind / description / action surface in `LevelPreviewDialog`
 * after the learner taps the bubble.
 *
 * State derivation rules (FR-002e):
 *   mastered  — mastery === 3
 *   completed — completions > 0 (and mastery < 3)
 *   current   — matches progress.currentLevelId (and not completed/mastered)
 *   locked    — everything else
 *
 * No padlock iconography on locked bubbles (FR-002 / panel feedback).
 * Locked bubbles are non-interactive (handled by BubbleNode).
 */

import {Box} from '@mui/material';
import {memo, useCallback, useRef, useState} from 'react';

import {BubbleNode} from '@code-dot-org/component-library/bubbleNode';
import type {BubbleState} from '@code-dot-org/component-library/bubbleNode';

import type {Level} from '../content/types';
import {useLanguage} from '../i18n/StringsProvider';
import type {JourneyProgress} from '../seats/types';

import {LevelPreviewDialog} from './LevelPreviewDialog';
import {PulseRing} from './PulseRing';

export interface JourneyBubbleProps {
  /** Level data from content bundle. */
  level: Level;
  /** Full journey progress for the active seat (may be undefined on load). */
  progress: JourneyProgress | null;
  /**
   * True when this level is on the unlock frontier — predecessor is
   * complete but this level isn't.  Computed once at JourneyPath level
   * and threaded through LessonSection.
   */
  isFrontier: boolean;
  /** Called when the learner confirms entry to a non-locked bubble. */
  onTap: (levelId: string) => void;
}

/**
 * Derives the BubbleState for a level given the current journey progress.
 *
 * A level is `current` (tappable, pulsing) iff it sits on the unlock
 * frontier — i.e. its predecessor is complete but this level isn't.
 * The frontier is computed once at JourneyPath level so the decision
 * is consistent across siblings and across re-renders.
 *
 * Mastery / completed states win over frontier: a re-tappable mastered
 * level still renders with its gold glow, not as current.
 */
function deriveBubbleState(
  levelId: string,
  progress: JourneyProgress | null,
  isFrontier: boolean,
): BubbleState {
  if (progress !== null) {
    for (const lessonProgress of Object.values(progress.lessons)) {
      const lp = lessonProgress.levels[levelId];
      if (lp !== undefined) {
        if (lp.mastery >= 3) return 'mastered';
        if (lp.completions > 0) return 'completed';
        break;
      }
    }
  }
  if (isFrontier) return 'current';
  return 'locked';
}

/**
 * Single journey bubble.  Tapping a non-locked bubble opens a preview
 * popup; confirming the popup fires onTap with the level id.
 */
function JourneyBubbleComponent({
  level,
  progress,
  isFrontier,
  onTap,
}: JourneyBubbleProps) {
  const lang = useLanguage();
  const state = deriveBubbleState(level.id, progress, isFrontier);
  const anchorRef = useRef<HTMLDivElement | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const handleBubbleTap = useCallback((e?: React.MouseEvent) => {
    // Guard against React-portal event bubbling.  MUI Popover renders its
    // backdrop in a portal, but React preserves event bubbling through the
    // virtual tree — so a backdrop click would also fire this wrapper's
    // onClick.  Skip if the click originated inside the popover.
    const target = e?.target as HTMLElement | undefined;
    if (target?.closest?.('.MuiPopover-root, .MuiModal-root')) return;
    setPreviewOpen(true);
  }, []);

  const handleConfirmStart = useCallback(() => {
    setPreviewOpen(false);
    onTap(level.id);
  }, [level.id, onTap]);

  const handleClosePreview = useCallback(() => setPreviewOpen(false), []);

  return (
    // data-level-id is read by useAutoScroll to find the scroll target.
    // onClick on the wrapper catches taps even when BubbleNode disables
    // its own onClick (locked state) — so locked bubbles still open the
    // preview popover ("Locked — finish the previous level first").
    <Box
      ref={anchorRef}
      data-level-id={level.id}
      onClick={handleBubbleTap}
      sx={{position: 'relative', display: 'inline-flex', cursor: 'pointer'}}
    >
      {state === 'current' && <PulseRing />}
      <BubbleNode
        variant={level.variant}
        state={state}
        onTap={handleBubbleTap}
        ariaLabel={lang === 'hi' ? level.title.hi : level.title.en}
      />
      <LevelPreviewDialog
        open={previewOpen}
        anchorEl={anchorRef.current}
        level={level}
        state={state}
        lang={lang}
        onStart={handleConfirmStart}
        onClose={handleClosePreview}
      />
    </Box>
  );
}

/** @see JourneyBubbleProps */
export const JourneyBubble = memo(JourneyBubbleComponent);
