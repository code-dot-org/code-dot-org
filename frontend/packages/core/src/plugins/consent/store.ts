import mitt from 'mitt';

import type {ConsentCategory, ConsentSource, ConsentState} from './types';

/** Consent state used before any CMP has reported in: necessary cookies only. */
export const DEFAULT_STATE: ConsentState = {
  categories: new Set<ConsentCategory>(['strictly-necessary']),
};

let state: ConsentState = DEFAULT_STATE;
const emitter = mitt<{change: ConsentState}>();

function setsEqual<T>(a: ReadonlySet<T>, b: ReadonlySet<T>): boolean {
  if (a.size !== b.size) return false;
  for (const value of a) {
    if (!b.has(value)) return false;
  }
  return true;
}

/** Module-level consent store: deny-until-known, notifies on every accepted change. */
export const consent: ConsentSource = {
  current: () => state,
  subscribe: listener => {
    // Per-subscription wrapper: mitt stores handlers in a plain array, so
    // registering the same listener reference twice would otherwise let one
    // unsubscribe (called twice) remove the sibling registration.
    const handler = (next: ConsentState) => listener(next);
    emitter.on('change', handler);
    let subscribed = true;
    return () => {
      if (!subscribed) return;
      subscribed = false;
      emitter.off('change', handler);
    };
  },
};

/** Install a new consent state; a no-op if the category set is unchanged. */
export function pushConsentState(next: ConsentState): void {
  if (setsEqual(next.categories, state.categories)) return;
  state = next;
  emitter.emit('change', state);
}
