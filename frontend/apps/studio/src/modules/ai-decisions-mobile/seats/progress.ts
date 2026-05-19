/**
 * JourneyProgress state machine.
 *
 * Owns all mastery-dot transitions per data-model.md.  Never decays mastery
 * (FR-005).  All mutations return a new object; callers persist via
 * writeSeatProgress().
 */

import type {
  JourneyProgress,
  LessonProgress,
  LevelProgress,
  MasteryDot,
  SeatId,
} from './types';

// ---------------------------------------------------------------------------
// Factory helpers
// ---------------------------------------------------------------------------

/** Creates an empty LevelProgress for a level that has never been visited. */
export function emptyLevelProgress(): LevelProgress {
  return {
    visited: false,
    perfectLastRun: false,
    completions: 0,
    mastery: 0,
  };
}

/** Creates an empty LessonProgress for a lesson that has never been visited. */
export function emptyLessonProgress(): LessonProgress {
  return {
    visited: false,
    complete: false,
    levels: {},
  };
}

/**
 * Creates the initial JourneyProgress for a brand-new seat.
 * @param seatId - The seat this progress belongs to.
 * @param firstLessonId - First lesson in the unit (always 1 for this prototype).
 * @param firstLevelId - First level id in the first lesson.
 */
export function initialProgress(
  seatId: SeatId,
  firstLessonId: number,
  firstLevelId: string,
): JourneyProgress {
  return {
    seatId,
    currentLessonId: firstLessonId,
    currentLevelId: firstLevelId,
    lessons: {},
    revision: 0,
    schemaVersion: 1,
  };
}

// ---------------------------------------------------------------------------
// Mastery transition — FR-006
// ---------------------------------------------------------------------------

/**
 * Computes the next mastery dot value given the current state of a level.
 *
 * Rules (data-model.md "Mastery transitions"):
 *   0 → 1  on first visit (visited: false → true), regardless of score.
 *   0 → 3  on first completion with perfectLastRun.
 *   1 → 3  on second completion at any state.
 *   1 → 2  on second completion without perfect score.
 *   ≥ 3    unchanged (mastery never decays).
 *   Any → 3  on perfectLastRun (shortcut to mastered).
 *
 * @param current - Level's existing progress (or emptyLevelProgress()).
 * @param perfect - Whether the completion was without errors.
 * @returns The new MasteryDot value.
 */
export function nextMastery(
  current: LevelProgress,
  perfect: boolean,
): MasteryDot {
  if (current.mastery >= 3) return 3;

  // First completion
  if (current.completions === 0) {
    return perfect ? 3 : 1;
  }

  // Second or later completion
  return 3;
}

// ---------------------------------------------------------------------------
// Progress mutation helpers (return new objects; callers persist)
// ---------------------------------------------------------------------------

/**
 * Records that the learner entered a level for the first time.
 * Only transitions mastery 0 → 1; does not count as a completion.
 */
export function recordLevelVisit(
  progress: JourneyProgress,
  lessonId: number,
  levelId: string,
): JourneyProgress {
  const lesson = progress.lessons[lessonId] ?? emptyLessonProgress();
  const level = lesson.levels[levelId] ?? emptyLevelProgress();

  if (level.visited) return progress;

  const updatedLevel: LevelProgress = {
    ...level,
    visited: true,
    mastery: level.mastery === 0 ? 1 : level.mastery,
  };

  return {
    ...progress,
    currentLessonId: lessonId,
    currentLevelId: levelId,
    lessons: {
      ...progress.lessons,
      [lessonId]: {
        ...lesson,
        visited: true,
        levels: {...lesson.levels, [levelId]: updatedLevel},
      },
    },
    revision: progress.revision + 1,
  };
}

/**
 * Records a level completion and advances the mastery dot.
 * @param lessonLevelIds - Ordered list of level ids in this lesson, used
 *   to detect lesson completion and to advance currentLevelId.
 */
export function recordLevelCompletion(
  progress: JourneyProgress,
  lessonId: number,
  levelId: string,
  perfect: boolean,
  lessonLevelIds: string[],
): JourneyProgress {
  const lesson = progress.lessons[lessonId] ?? emptyLessonProgress();
  const level = lesson.levels[levelId] ?? emptyLevelProgress();

  const newCompletions = level.completions + 1;
  const newMastery = nextMastery(
    {
      ...level,
      completions: newCompletions,
      perfectLastRun: perfect,
    },
    perfect,
  );

  const updatedLevel: LevelProgress = {
    ...level,
    visited: true,
    perfectLastRun: perfect,
    completions: newCompletions,
    mastery: newMastery,
  };

  const updatedLevels = {...lesson.levels, [levelId]: updatedLevel};

  // Lesson is complete when every level in it has at least one completion.
  const lessonComplete = lessonLevelIds.every(
    id => (updatedLevels[id]?.completions ?? 0) > 0,
  );

  // Advance to the next level id if this isn't a replay.
  const levelIdx = lessonLevelIds.indexOf(levelId);
  const nextLevelId =
    levelIdx >= 0 && levelIdx < lessonLevelIds.length - 1
      ? lessonLevelIds[levelIdx + 1]
      : levelId;

  return {
    ...progress,
    currentLessonId: lessonId,
    currentLevelId: nextLevelId ?? levelId,
    lessons: {
      ...progress.lessons,
      [lessonId]: {
        ...lesson,
        visited: true,
        complete: lessonComplete,
        levels: updatedLevels,
      },
    },
    revision: progress.revision + 1,
  };
}

/**
 * Advances currentLessonId to the next lesson (called after a lesson completes).
 * No-op if already on the last lesson.
 */
export function advanceToNextLesson(
  progress: JourneyProgress,
  orderedLessonIds: number[],
  firstLevelOfNextLesson: string,
): JourneyProgress {
  const idx = orderedLessonIds.indexOf(progress.currentLessonId);
  if (idx < 0 || idx >= orderedLessonIds.length - 1) return progress;

  const nextLessonId = orderedLessonIds[idx + 1]!;
  return {
    ...progress,
    currentLessonId: nextLessonId,
    currentLevelId: firstLevelOfNextLesson,
    revision: progress.revision + 1,
  };
}
