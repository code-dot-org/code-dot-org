import type {CSSProperties} from 'react';

/**
 * Shallow-merge React CSSProperties objects, dropping falsy entries.
 *
 * The lab's Radium-era code uses array-style props (`style={[a, b && c]}`)
 * to compose static and conditional inline styles.  Radium handles arrays
 * via its HOC at runtime, but React's intrinsic-element style prop is
 * typed against `csstype.Properties` and rejects arrays at compile time.
 * This helper reproduces the array-merge for the static-styles case
 * (every entry the lab actually passes) without losing the conditional
 * pattern.  Pseudo-selector keys (`:hover`, etc.) are still handled by
 * Radium when present; for callers this helper just produces the merged
 * base style.
 *
 * @param styles - Style objects to merge.  Falsy entries are skipped.
 * @returns A single merged CSSProperties object.
 */
export function mergeStyles(
  ...styles: Array<CSSProperties | false | null | undefined>
): CSSProperties {
  return Object.assign({}, ...styles.filter(Boolean));
}
