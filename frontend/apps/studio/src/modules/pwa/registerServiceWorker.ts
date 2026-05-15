import {Workbox} from 'workbox-window';

// Service worker registration is intentionally narrow:
//
//   - Only when VITE_MOBILE was set at build time (the PWA / Capacitor target).
//     `yarn build` for Rails-served studio does not include this SW and so
//     this function no-ops at runtime.
//   - Only in production builds. `vite dev` never registers a SW even in
//     mobile mode; SW caching against an HMR dev server is a debugging trap.
//   - Only when the runtime exposes `serviceWorker`. Capacitor's WebView and
//     iOS Safari standalone mode both qualify.
//
// We use workbox-window so that we can react to update events; the strategy
// configured in vite.config.ts is autoUpdate, so the new SW takes effect on
// the next full launch with no in-session prompt.
export function registerServiceWorker(): void {
  if (!import.meta.env.PROD) return;
  if (import.meta.env.VITE_MOBILE !== '1') return;
  if (typeof window === 'undefined') return;
  if (!('serviceWorker' in navigator)) return;

  const wb = new Workbox('./sw.js');
  wb.register().catch(err => {
    // SW registration failures are non-fatal — the app still works online.
    // Log so a developer poking at devtools sees what happened.
    console.warn('[pwa] service worker registration failed', err);
  });
}
