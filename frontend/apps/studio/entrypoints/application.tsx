/// <reference types="vite-plugin-pwa/client" />
import {Capacitor} from '@capacitor/core';
import {RouterProvider} from '@tanstack/react-router';
import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';

import {initializeCore} from '@code-dot-org/core';
import {localizationPlugin} from '@code-dot-org/core/plugins/localization';
import {observabilityPlugin} from '@code-dot-org/core/plugins/observability';
import {injectFontAwesome} from '@code-dot-org/fonts';

import router from '@/modules/router';

// This root element is added to the page in dashboard/views/app/index.html.haml via rails_vite
const mount = document.getElementById('vite-root');

if (typeof window !== 'undefined') {
  initializeCore({plugins: [localizationPlugin, observabilityPlugin]});
  injectFontAwesome();
  registerServiceWorker();
}

if (mount) {
  const root = createRoot(mount);

  root.render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  );
}

/**
 * Register the PWA service worker on web only. Gated for two reasons:
 *
 * 1. WKWebView under `capacitor://localhost` won't reliably register service
 *    workers (capacitor#7069, #4122).
 * 2. Even where it would, the SW intercepts the Capacitor bridge and breaks
 *    native plugin calls.
 *
 * The dynamic import is deferred so the virtual `virtual:pwa-register` module
 * is only resolved on web platforms — keeps the Capacitor bundle clean.
 */
function registerServiceWorker(): void {
  if (Capacitor.isNativePlatform()) return;
  if (!('serviceWorker' in navigator)) return;

  import('virtual:pwa-register')
    .then(({registerSW}) => {
      registerSW({immediate: true});
    })
    .catch((error: unknown) => {
      console.warn('PWA service worker registration failed', error);
    });
}
