// Runtime state + imperative API for the GTM plugin. Kept separate from
// `./index` and `./hooks` so the singleton + subscriber set live in exactly
// one place — both the plugin lifecycle (in `./index`) and the React hooks
// (in `./hooks`) consume this module as a pure dependency.

import {NoopClient} from './client';
import type {GtmClientApi} from './types';

/** Module-level singleton — facade and hooks read from this client. */
let client: GtmClientApi = new NoopClient();

/** Listeners notified when the singleton swaps from Noop to the live client. */
const subscribers = new Set<() => void>();

/** Test hook for swapping the active client. Notifies subscribers. */
export function _initializeSingleton(c: GtmClientApi): void {
  client = c;
  subscribers.forEach(fn => fn());
}

/**
 * @internal — consumed by `./hooks` to drive `useSyncExternalStore`.
 * Returns the unsubscribe function. Not part of the public API.
 */
export function _subscribe(onChange: () => void): () => void {
  subscribers.add(onChange);
  return () => {
    subscribers.delete(onChange);
  };
}

/** Forward an event through the active client. No-op until init. */
export function trackEvent(
  name: string,
  props?: Record<string, string | number | boolean>,
): void {
  client.trackEvent(name, props);
}

/**
 * Whether the live GTM client is currently active (i.e. the plugin was
 * registered and `gtmId` was present in the runtime config). Useful for
 * gating expensive prep work on consumers that don't always run with GTM.
 */
export function isEnabled(): boolean {
  return client.isEnabled();
}
