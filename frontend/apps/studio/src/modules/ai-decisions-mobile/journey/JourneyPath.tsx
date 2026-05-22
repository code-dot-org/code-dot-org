/**
 * JourneyPath — full vertical scroll canvas of the unit journey map.
 *
 * Renders all 21 bubbles across 5 lessons in an S-curve vertical layout.
 * Each lesson is wrapped in a LessonSection (tinted background + banner).
 *
 * The AnticipationCue (soft fish-silhouette gradient behind lessons 1's
 * last 3 bubbles) is layered here as a decoration only.
 *
 * This component is scroll-only; JourneyScreen owns the chrome and
 * `useAutoScroll` handles the auto-scroll-to-current behaviour.
 */

import {Box} from '@mui/material';
import {useMemo} from 'react';

import type {Lesson} from '../content/types';
import type {JourneyProgress} from '../seats/types';

import {AnticipationCue} from './AnticipationCue';
import {LessonSection} from './LessonSection';

export interface JourneyPathProps {
  /** Ordered list of lessons from unit1.json. */
  lessons: Lesson[];
  /** Active language code. */
  lang: 'en' | 'hi';
  /** Journey progress for bubble state derivation. */
  progress: JourneyProgress | null;
  /** Called when learner taps a bubble. */
  onBubbleTap: (levelId: string) => void;
}

/**
 * Compute the unlock frontier — the set of level IDs that are NOT yet
 * completed but should be tappable.  Standard Duolingo-style rule: a
 * level is on the frontier iff its predecessor (in unit-wide level
 * order, including lesson-to-lesson transitions) is completed.  The
 * very first level of the unit is always on the frontier.
 *
 * Why this exists: `progress.currentLevelId` is the most-recently-
 * advanced-to level — a single id.  But after completing ch1, both
 * "ch2 should be tappable" AND "any later already-completed level
 * should re-render as such".  The frontier is the proper "next-up"
 * generalisation.
 */
function computeFrontier(
  lessons: Lesson[],
  progress: JourneyProgress | null,
): Set<string> {
  const frontier = new Set<string>();
  let prevCompleted = true; // unit's first level is always on the frontier
  for (const lesson of lessons) {
    const lessonProgress = progress?.lessons?.[lesson.id];
    for (const level of lesson.levels) {
      const lp = lessonProgress?.levels?.[level.id];
      const isComplete = (lp?.completions ?? 0) > 0;
      if (prevCompleted && !isComplete) {
        // Frontier: predecessor done, this one not yet.
        frontier.add(level.id);
      }
      prevCompleted = isComplete;
    }
  }
  return frontier;
}

/**
 * Scrollable journey path.  The outer Box is the scroll container;
 * callers pass a ref for useAutoScroll to target.
 */
export function JourneyPath({
  lessons,
  lang,
  progress,
  onBubbleTap,
}: JourneyPathProps) {
  const frontier = useMemo(
    () => computeFrontier(lessons, progress),
    [lessons, progress],
  );
  return (
    <Box
      sx={{
        flex: 1,
        overflowY: 'auto',
        padding: 2,
        position: 'relative',
      }}
    >
      {lessons.map((lesson, idx) => (
        <Box key={lesson.id} sx={{position: 'relative'}}>
          {/* Anticipation cue: fish silhouette behind the last section of lesson 1 */}
          {idx === 0 && <AnticipationCue />}
          <LessonSection
            lesson={lesson}
            lang={lang}
            progress={progress}
            frontier={frontier}
            onBubbleTap={onBubbleTap}
          />
        </Box>
      ))}
    </Box>
  );
}
