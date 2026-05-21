/**
 * TypeScript types for seat storage — mirrors data-model.md exactly.
 * These types are the on-device data model; nothing here ever leaves
 * the device (FR-029).
 */

export type Language = 'en' | 'hi';

export type SeatId = `seat:${string}`;

export type SeatColorToken = 'red' | 'blue' | 'green' | 'yellow';

export type AvatarId = string;

/** Registered journey identifiers. */
export type JourneyId = 'ai-decisions' | 'notebook';

/** Anonymous on-device learner profile. */
export interface Seat {
  id: SeatId;
  color: SeatColorToken;
  avatar: AvatarId | null;
  language: Language;
  /** Unix ms — used only for display ordering on the home screen. */
  createdAt: number;
  /** Per-journey progress map. Absent on seats created before this field was added. */
  journeys?: Partial<Record<JourneyId, JourneyProgress>>;
}

/** Top-level index for all seats on this device. */
export interface SeatIndex {
  seats: SeatId[];
  activeSeatId: SeatId | null;
}

/**
 * Four-state mastery dot.
 * 0 = empty, 1 = attempted, 2 = practiced, 3 = mastered.
 * Mastery never decays (FR-005).
 */
export type MasteryDot = 0 | 1 | 2 | 3;

/** Per-level mastery and completion state within a seat. */
export interface LevelProgress {
  visited: boolean;
  perfectLastRun: boolean;
  completions: number;
  mastery: MasteryDot;
}

/** Per-lesson completion state within a seat. */
export interface LessonProgress {
  visited: boolean;
  complete: boolean;
  levels: Record<string, LevelProgress>;
}

/** Full AI Decisions journey state for one seat. */
export interface AiDecisionsProgress {
  kind: 'ai-decisions';
  seatId: SeatId;
  currentLessonId: number;
  currentLevelId: string;
  lessons: Record<number, LessonProgress>;
  revision: number;
  schemaVersion: 1;
}

/** Per-seat progress for the Notebook Lab journey (four-node onboarding path). */
export interface NotebookProgress {
  kind: 'notebook';
  /** Completion flags for each of the four onboarding nodes (index-aligned). */
  nodes: boolean[];
  /** True once all four nodes are complete and the celebration has fired. */
  graduated: boolean;
}

/** Discriminated union of all per-journey progress shapes. */
export type JourneyProgress = AiDecisionsProgress | NotebookProgress;
