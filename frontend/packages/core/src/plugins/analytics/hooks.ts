import {useSyncExternalStore} from 'react';

import {_subscribe, getExperiment, isEnabled, trackEvent} from './singleton';

/**
 * Returns the module-level `trackEvent`. Reference is stable across renders
 * (it's a module export, not a per-render closure) so it's safe in
 * dependency arrays.
 */
export function useTrackEvent(): typeof trackEvent {
  return trackEvent;
}

/**
 * Reactively read an experiment parameter. Re-renders when the singleton
 * transitions Noop → Deferred → live and the resolved value changes.
 *
 * **Use with primitive defaults** (string, number, boolean). If the
 * underlying provider returns a new object reference on each call, React
 * will treat the snapshot as changing every render and infinite-loop. Pass
 * objects only if your provider guarantees referentially stable returns.
 */
export function useExperiment<T>(
  experimentName: string,
  parameter: string,
  defaultValue: T,
): T {
  return useSyncExternalStore(
    _subscribe,
    () => getExperiment(experimentName, parameter, defaultValue),
    () => defaultValue,
  );
}

/**
 * Reactively read whether the analytics plugin is enabled. Re-renders when
 * the singleton transitions.
 */
export function useIsAnalyticsEnabled(): boolean {
  return useSyncExternalStore(
    _subscribe,
    () => isEnabled(),
    () => false,
  );
}
