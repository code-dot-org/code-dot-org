import {DEFAULT_STATE} from '@/plugins/consent/store';
import type {ConsentCategory, ConsentState} from '@/plugins/consent/types';
import * as Observability from '@/plugins/observability';

import {CATEGORY_MAP} from './config';

export interface OneTrust {
  OnConsentChanged: (cb: () => void) => void;
}

declare global {
  interface Window {
    // Resolves undefined when the host page's OptanonWrapper fires without
    // the SDK having loaded (blocked or unserved OneTrust assets).
    oneTrustPromise?: Promise<OneTrust | undefined>;
    OneTrust?: OneTrust;
    OnetrustActiveGroups?: string;
    OptanonWrapper?: () => void;
  }
}

/** Map OneTrust's raw `OnetrustActiveGroups` string to semantic categories. */
export function parseActiveGroups(raw: string | undefined): ConsentState {
  if (!raw) return DEFAULT_STATE;

  // Seeded, not parsed: strictly-necessary is granted by definition, and the
  // C0001 marker cannot be trusted to survive a partial or mid-write read of
  // the global string.
  const categories = new Set<ConsentCategory>(['strictly-necessary']);
  for (const group of raw.split(',')) {
    const category = CATEGORY_MAP[group.trim()];
    if (category) categories.add(category);
  }

  return {categories};
}

/**
 * Adopt the host page's OneTrust promise, if any, pushing initial and
 * mid-session state through `push`. Never injects scripts; a host page
 * with no `oneTrustPromise` leaves consent at its default state.
 */
export function connectOneTrust(push: (state: ConsentState) => void): void {
  if (!window.oneTrustPromise) return;

  window.oneTrustPromise
    .then(oneTrust => {
      // Registered before the initial push: a throwing subscriber must not
      // cost the session its mid-session change delivery.
      oneTrust?.OnConsentChanged?.(() => {
        push(parseActiveGroups(window.OnetrustActiveGroups));
      });
      push(parseActiveGroups(window.OnetrustActiveGroups));
    })
    .catch(err => Observability.recordError(err));
}
