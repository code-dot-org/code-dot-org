/**
 * Whether the page's consent source has come to rest. Settling means the wait
 * is over, not that a category was granted: a CMP that loads and reports
 * nothing usable still settles.
 *
 * Kept dependency-free so consumers can gate on settlement without pulling a
 * CMP provider, and its observability graph, into their bundle.
 */

let settled = false;
let resolveSettled: (() => void) | undefined;
let settledPromise = newSettledPromise();

function newSettledPromise(): Promise<void> {
  return new Promise<void>(resolve => {
    resolveSettled = resolve;
  });
}

/** Record that the consent source has settled. Idempotent. */
export function markConsentSettled(): void {
  if (settled) return;
  settled = true;
  resolveSettled?.();
}

/** Whether the consent source has already settled. */
export function isConsentSettled(): boolean {
  return settled;
}

/**
 * Resolves once the consent source settles. A CMP that is present but never
 * reports never resolves this, leaving callers blocked by design.
 */
export function whenConsentSettled(): Promise<void> {
  return settledPromise;
}

/** Test hook: return to the pre-settlement state. */
export function _resetConsentSettled(): void {
  settled = false;
  settledPromise = newSettledPromise();
}
