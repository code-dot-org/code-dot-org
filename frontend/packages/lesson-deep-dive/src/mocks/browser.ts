import {setupWorker} from 'msw/browser';

import {handlers} from './handlers';

export const worker = setupWorker(...handlers);

export async function startMockWorker(): Promise<void> {
  await worker.start({
    onUnhandledRequest(request, print) {
      // Static assets and Vite internals pass through silently.
      const url = new URL(request.url);
      if (url.pathname.startsWith('/media/') || url.pathname.startsWith('/@')) {
        return;
      }
      print.warning();
    },
  });

  // A hard reload (Ctrl/Cmd+Shift+R) makes the browser bypass service
  // workers for the lifetime of the page, so every mocked call falls
  // through to Vite as an empty 404 ("Unexpected end of JSON input").
  // Heal with one normal reload; if the page is still uncontrolled after
  // that, say so instead of letting fetches fail obscurely.
  if (!navigator.serviceWorker.controller) {
    const RELOAD_MARKER = 'ldd-msw-reloaded';
    if (!sessionStorage.getItem(RELOAD_MARKER)) {
      sessionStorage.setItem(RELOAD_MARKER, '1');
      window.location.reload();
      await new Promise(() => {}); // halt boot; the reload takes over
    }
    const banner = document.createElement('div');
    banner.textContent =
      'Mock API worker is not controlling this page (a hard reload ' +
      'bypasses it). Reload normally (F5 / Cmd-R) to restore mocks.';
    banner.style.cssText =
      'position:fixed;top:0;left:0;right:0;z-index:9999;background:#b91c1c;' +
      'color:#fff;padding:8px 12px;font:14px sans-serif;text-align:center';
    document.body.appendChild(banner);
  } else {
    sessionStorage.removeItem('ldd-msw-reloaded');
  }
}
