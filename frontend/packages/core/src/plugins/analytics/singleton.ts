// Runtime state + imperative API for the analytics plugin. Kept separate
// from `./index` and `./hooks` so the singleton + subscriber set live in
// exactly one place — both the plugin lifecycle (in `./index`) and the
// React hooks (in `./hooks`) consume this module as a pure dependency.

import {NoopAdapter} from './adapters/NoopAdapter';
import type {AnalyticsClient, AnalyticsUser, EventProps} from './types';

/** Module-level singleton — facade and hooks read from this client. */
let client: AnalyticsClient = new NoopAdapter();

/**
 * Listeners notified when the singleton swaps (Noop → Deferred → live). The
 * hooks subscribe through `_subscribe` to drive `useSyncExternalStore`.
 */
const subscribers = new Set<() => void>();

/** Test hook for swapping the active client. Notifies subscribers. */
export function _initializeSingleton(c: AnalyticsClient): void {
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

// ─── Imperative API ─────────────────────────────────────────────────────────

export function trackEvent(name: string, props?: EventProps): void {
  client.trackEvent(name, props);
}

export function setUser(user: AnalyticsUser): Promise<void> {
  return client.setUser(user);
}

export function getExperiment<T>(
  experimentName: string,
  parameter: string,
  defaultValue: T,
): T {
  return client.getExperiment(experimentName, parameter, defaultValue);
}

export function startSessionReplay(): Promise<void> {
  return client.startSessionReplay();
}

export function stopSessionReplay(): void {
  client.stopSessionReplay();
}

export function shutdown(): Promise<void> {
  return client.shutdown();
}

/**
 * Whether the live analytics provider is wired up. `false` when the plugin
 * isn't registered; `true` while the SDK is loading (events buffer) and
 * after it's live. Useful for gating expensive prep work on consumers that
 * don't always run with analytics enabled.
 */
export function isEnabled(): boolean {
  return client.isEnabled();
}
