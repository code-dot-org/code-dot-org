/**
 * TypeScript types mirroring the unit1.json content bundle schema.
 *
 * These are the static, read-only content types.  They never change at
 * runtime (content is a build-time snapshot).  Progress state lives in
 * seats/types.ts, not here.
 */

/** All level kinds surfaced in the journey map. */
export type LevelKind =
  | 'multi'
  | 'match'
  | 'survey'
  | 'reading'
  | 'video'
  | 'oceans-labeling'
  | 'oceans-video'
  | 'dance-intro-video'
  | 'dance-emoji-pick'
  | 'bubble-choice';

/** Shape variant for BubbleNode rendering. */
export type NodeVariant = 'concept' | 'activity' | 'headline' | 'capstone';

/** Localised string in both supported languages. */
export interface LocalisedString {
  en: string;
  hi: string;
}

/** A single level in the content bundle. */
export interface Level {
  id: string;
  kind: LevelKind;
  variant: NodeVariant;
  title: LocalisedString;
  /** Kind-specific payload — opaque to the journey map layer. */
  payload: unknown;
}

/** A lesson (section) in the unit. */
export interface Lesson {
  id: number;
  name: LocalisedString;
  /** Display order (0-based) within the unit. */
  pathIndex: number;
  /** Design-system color token for the section background tint. */
  sectionTint: string;
  levels: Level[];
}

/** Top-level unit bundle (mirrors unit1.json root). */
export interface Unit {
  id: string;
  name: LocalisedString;
  units: Array<{
    id: number;
    name: LocalisedString;
    lessons: Lesson[];
  }>;
}
