/**
 * Android hardware-back button handler for the mobile prototype.
 *
 * Navigation rules:
 *   from in-lesson  → /m/journey  (never exit or pop to non-prototype screens)
 *   from journey    → /m/seats    (never exit to home screen)
 *   from seat picker → no-op      (no further back; we don't exit the app)
 *
 * Call registerHardwareBack() once from the root mobile route on mount.
 * Call the returned cleanup function on unmount.
 */

import {App} from '@capacitor/app';
import {Capacitor} from '@capacitor/core';
import type {AnyRouter} from '@tanstack/react-router';

/** Route patterns used to decide navigation direction. */
const JOURNEY_PATH = '/m/journey';
const SEATS_PATH = '/m/seats';
const LESSON_PATH_PREFIX = '/m/lesson/';

/**
 * Returns the navigation target when the hardware back button is pressed,
 * given the current pathname.  Returns null to mean "no navigation" (stay
 * on seat picker without exiting).
 */
function resolveBackTarget(pathname: string): string | null {
  if (pathname.startsWith(LESSON_PATH_PREFIX)) return JOURNEY_PATH;
  if (pathname === JOURNEY_PATH) return SEATS_PATH;
  return null;
}

/**
 * Registers the Capacitor App `backButton` listener.
 * Safe to call on non-native platforms — returns a no-op cleanup.
 *
 * @param router - TanStack router instance used for programmatic navigation.
 * @returns Cleanup function that removes the listener on call.
 */
export function registerHardwareBack(router: AnyRouter): () => void {
  if (!Capacitor.isNativePlatform()) return () => undefined;

  let handle: {remove: () => void} | null = null;

  // App.addListener returns a Promise<PluginListenerHandle>.
  void App.addListener('backButton', () => {
    const pathname = router.state.location.pathname;
    const target = resolveBackTarget(pathname);
    if (target !== null) {
      void router.navigate({to: target, replace: false});
    }
    // seat picker: ignore — do not exit the app
  }).then(h => {
    handle = h;
  });

  return () => {
    handle?.remove();
  };
}
