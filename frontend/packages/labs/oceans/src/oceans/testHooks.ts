/**
 * Visual-test deterministic-mode flag. Math.random and Date.now are patched
 * by the inline bootstrap in `index.html` (which runs before any module
 * loads, so lodash captures the seeded PRNG). The renderer reads this flag
 * to stop the RAF loop after one non-Loading paint.
 */

/** True when `?testFreeze=1` is set on the URL. */
export function isFreezeActive(): boolean {
  return (
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('testFreeze') === '1'
  );
}
