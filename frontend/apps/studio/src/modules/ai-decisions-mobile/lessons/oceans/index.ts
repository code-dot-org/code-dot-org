/**
 * Oceans level kind → AppMode mapping (T055).
 *
 * AppMode strings match the values in @code-dot-org/oceans-lab internals.
 * They are not exported from the package so we define them here.
 */

/** Valid AppMode values for OceansLab.appMode prop. */
export type OceansAppMode =
  | 'fishvtrash'
  | 'creaturesvtrashdemo'
  | 'creaturesvtrash'
  | 'long';

/** Maps a level id (from unit1.json) to the OceansLab AppMode string. */
const OCEANS_LEVEL_MODE: Record<string, OceansAppMode> = {
  oceans_fishvtrash_2024: 'fishvtrash',
  oceans_creaturesvtrashdemo_2024: 'creaturesvtrashdemo',
  oceans_creaturesvtrash_2024: 'creaturesvtrash',
  oceans_long_2024: 'long',
};

/**
 * Returns the AppMode string for the given level id.
 * Falls back to 'fishvtrash' if the id is unrecognised.
 */
export function appModeForLevel(levelId: string): OceansAppMode {
  return OCEANS_LEVEL_MODE[levelId.toLowerCase()] ?? 'fishvtrash';
}
