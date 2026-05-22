/**
 * Capacitor start-path configuration for the mobile prototype.
 *
 * Redirects the Capacitor shell to the seat-picker route on cold start.
 * No-ops in the browser (Capacitor.isNativePlatform() returns false there).
 *
 * The App plugin fires `appStateChange` only for foreground/background
 * transitions; we listen for `resume` here to re-enter the seat picker
 * when the app is brought back from background if the router has no state
 * (e.g. after a process kill on low-memory Android).
 */

import {App} from '@capacitor/app';
import {Capacitor} from '@capacitor/core';
import type {AnyRouter} from '@tanstack/react-router';

/** Entry path for the mobile prototype inside the Capacitor shell. */
const MOBILE_START_PATH = '/m/seats';

/**
 * Initialises the Capacitor start-path and hardware-back guard.
 * Must be called once at app startup when running natively.
 */
export function initCapacitorStart(router: AnyRouter): void {
  if (!Capacitor.isNativePlatform()) return;

  // Redirect to the mobile start path if we're at the root.
  const currentPath = router.state.location.pathname;
  if (currentPath === '/' || currentPath === '') {
    void router.navigate({to: MOBILE_START_PATH, replace: true});
  }

  // On resume from background, stay on the current route unless we ended up
  // at the web root (which can happen if the WebView was recycled).
  App.addListener('resume', () => {
    const path = router.state.location.pathname;
    if (path === '/' || path === '') {
      void router.navigate({to: MOBILE_START_PATH, replace: true});
    }
  });
}
