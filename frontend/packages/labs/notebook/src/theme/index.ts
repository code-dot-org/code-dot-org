/**
 * Visual theme variants supported by the notebook lab.
 * The spec defaults to 'dark'.
 */
export type LabTheme = 'light' | 'dark';

/**
 * Returns the given theme value, or 'dark' if none is provided.
 * Phase 12 wires this to the settings store; callers that pass a controlled
 * value get that value back unchanged.
 * @param controlled Optional theme value from the settings store.
 * @returns The active {@link LabTheme}.
 */
export function useLabTheme(controlled?: LabTheme): LabTheme {
  return controlled ?? 'dark';
}
