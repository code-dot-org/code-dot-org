import DCDO from '@cdo/apps/dcdo';

const TURNSTILE_SCRIPT_URL =
  'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
const CONTAINER_ID = 'turnstile-container';
const CHALLENGE_TIMEOUT_MS = 30_000;
// How long to wait for the probe Worker to respond before concluding it was
// paused by the DevTools debugger. The Worker posts a message in microseconds
// when not paused, so 100 ms is an unambiguous signal — and short enough
// that the user never perceives it on the happy path.
const DEBUGGER_PROBE_TIMEOUT_MS = 100;

declare global {
  interface Window {
    turnstile: {
      render: (
        container: HTMLElement,
        options: {sitekey: string; callback: (token: string) => void}
      ) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

/**
 * Thrown when DevTools is open with breakpoints active in anonymous scripts.
 * Callers can instanceof-check this to show a targeted help message rather
 * than a generic error.
 */
export class TurnstileDevToolsError extends Error {
  constructor() {
    super(
      'Turnstile challenge blocked by active DevTools breakpoints. ' +
        'To fix: press Ctrl+F8 / Cmd+F8 to deactivate breakpoints, or in ' +
        'DevTools Settings → Ignore List enable ' +
        '"Anonymous scripts from eval or console".'
    );
    this.name = 'TurnstileDevToolsError';
  }
}

/**
 * Detects whether a `debugger` statement inside an anonymous Web Worker script
 * would be paused by DevTools — the same context Turnstile uses for its own
 * anti-bot debugger call.
 *
 * The probe Worker fires `debugger` then immediately posts a message. If
 * DevTools is pausing on anonymous scripts the Worker will be suspended and
 * the message will never arrive within the timeout. When the timeout fires we
 * terminate the Worker (which clears the DevTools pause automatically) and
 * resolve true. The main thread is never blocked — the user never has to click
 * Resume for our probe.
 *
 * Returns false (safe to proceed) when:
 *   - DevTools is closed
 *   - Breakpoints are deactivated (Ctrl+F8)
 *   - "Anonymous scripts from eval or console" is enabled in DevTools Ignore List
 *   - Worker / Blob URL creation is blocked by CSP (can't detect → assume safe)
 */
function debuggerWillPauseInAnonymousScope(): Promise<boolean> {
  return new Promise(resolve => {
    let worker: Worker | null = null;
    let blobUrl: string | null = null;
    let settled = false;

    const settle = (willPause: boolean) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      worker?.terminate();
      if (blobUrl) URL.revokeObjectURL(blobUrl);
      resolve(willPause);
    };

    // If the Worker doesn't respond within the timeout, it was paused.
    const timer = setTimeout(() => settle(true), DEBUGGER_PROBE_TIMEOUT_MS);

    try {
      // Blob Workers have no source URL, so they match the anonymous-script
      // context that the "Ignore List → Anonymous scripts" setting targets —
      // giving us an accurate signal for whether Turnstile's Worker will also
      // be paused.
      blobUrl = URL.createObjectURL(
        new Blob(['debugger; postMessage("ok");'], {
          type: 'application/javascript',
        })
      );
      worker = new Worker(blobUrl);
      worker.onmessage = () => settle(false); // responded before timeout → no pause
      worker.onerror = () => settle(false); // Worker error → assume safe
    } catch {
      // Worker or Blob URL creation blocked (CSP or unsupported) → assume safe.
      settle(false);
    }
  });
}

let scriptLoadPromise: Promise<void> | null = null;
let activeWidgetId: string | null = null;

function loadTurnstileScript(): Promise<void> {
  if (scriptLoadPromise) return scriptLoadPromise;

  scriptLoadPromise = new Promise((resolve, reject) => {
    if (window.turnstile) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = TURNSTILE_SCRIPT_URL;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error('Failed to load Turnstile script'));
    document.head.appendChild(script);
  });

  return scriptLoadPromise;
}

function getOrCreateContainer(): HTMLElement {
  let container = document.getElementById(CONTAINER_ID);
  if (!container) {
    container = document.createElement('div');
    container.id = CONTAINER_ID;
    document.body.appendChild(container);
  }
  return container;
}

function getSiteKey(): string {
  return (
    (DCDO.get('ai-gateway-turnstile-site-key', undefined) as unknown as string) ?? ''
  );
}

export async function getTurnstileToken(): Promise<string> {
  if (await debuggerWillPauseInAnonymousScope()) {
    console.error(
      '[Turnstile] Challenge blocked: DevTools breakpoints are active on ' +
        'anonymous scripts. Cloudflare Turnstile uses anonymous Web Worker ' +
        'scripts that trigger a debugger statement — if breakpoints are ' +
        'active for these, the challenge cannot complete.'
    );
    console.group('How to fix the Turnstile / DevTools conflict');
    console.log('Option 1: Close DevTools entirely and reload the page.');
    console.groupCollapsed(
      'Option 2: Keep DevTools open — ignore anonymous scripts (recommended for developers)'
    );
    console.log('Step 1: Open DevTools Settings — the most reliable way is to press F1 while DevTools is focused.');
    console.log('        (Alternatively: click the three-dot ⋮ menu at the top-right of DevTools, then "Settings".)');
    console.log('Step 2: In the Settings panel, look at the LEFT sidebar and scroll down until you see "Ignore List".');
    console.log('        (In older Chrome versions this was called "Blackboxing" — same setting, different name.)');
    console.log('Step 3: Make sure "Enable Ignore Listing" is checked (this is the master switch).');
    console.log('Step 4: Check "Anonymous scripts from eval or console".');
    console.log('Step 5: Close Settings (Escape or click ✕) and retry sending your message.');
    console.groupEnd();
    console.log(
      'Option 3: Deactivate breakpoints temporarily — press Ctrl+F8 (Windows/Linux) or Cmd+F8 (Mac).'
    );
    console.groupEnd();
    throw new TurnstileDevToolsError();
  }

  await loadTurnstileScript();

  return new Promise((resolve, reject) => {
    const container = getOrCreateContainer();

    if (activeWidgetId) {
      window.turnstile.remove(activeWidgetId);
      activeWidgetId = null;
    }

    const timeout = setTimeout(() => {
      reject(new Error('Turnstile challenge timed out'));
    }, CHALLENGE_TIMEOUT_MS);

    // widgetId is assigned synchronously by render() before the async callback fires
    const widgetId = window.turnstile.render(container, {
      sitekey: getSiteKey(),
      callback: (token: string) => {
        clearTimeout(timeout);
        resolve(token);
      },
    });

    if (!widgetId) {
      clearTimeout(timeout);
      reject(new Error('Turnstile failed to render widget'));
    } else {
      activeWidgetId = widgetId;
    }
  });
}
