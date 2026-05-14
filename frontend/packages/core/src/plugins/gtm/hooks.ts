import {useSyncExternalStore} from 'react';

import {_subscribe, isEnabled, trackEvent} from './singleton';

/**
 * Returns the module-level `trackEvent`. Reference is stable across renders
 * so it's safe in dependency arrays.
 */
export function useTrackEvent(): typeof trackEvent {
  return trackEvent;
}

/**
 * Reactively read whether the GTM plugin is enabled. Re-renders when the
 * singleton transitions Noop → live.
 */
export function useIsGtmEnabled(): boolean {
  return useSyncExternalStore(
    _subscribe,
    () => isEnabled(),
    () => false,
  );
}
