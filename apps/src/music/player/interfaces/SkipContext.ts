/**
 * Describes whether a sound is inside a random block, and is currently being skipped.
 */
export interface SkipContext {
  insideRandom: boolean;
  skipSound: boolean;
}
