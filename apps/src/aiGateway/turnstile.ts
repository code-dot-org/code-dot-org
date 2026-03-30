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
        'To fix: close DevTools, or press Ctrl+F8 / Cmd+F8 to deactivate breakpoints.'
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

/**
 * Manages Turnstile widget lifecycle with three goals:
 *
 * 1. Serialization — only one widget renders at a time (via promise chain),
 *    so widgetId is always owned by exactly one execution context.
 *
 * 2. Pre-fetch — after each token is delivered, a new challenge starts
 *    immediately in the background. The next call (e.g. main generation
 *    after a safety-check call) receives an already-completing token rather
 *    than waiting for a fresh challenge from scratch.
 *
 * 3. Double-settle prevention — a `settled` flag inside each runChallenge()
 *    ensures the timeout and the token callback can never both fire.
 */
class TurnstileManager {
  private widgetId: string | null = null;

  // Serializes all widget renders — ensures only one challenge runs at a time.
  // The chain always advances even on rejection so queued callers are never
  // permanently blocked.
  private chain: Promise<unknown> = Promise.resolve();

  // Speculatively started challenge from the previous token delivery.
  // Cleared to null immediately when taken so a concurrent synchronous caller
  // cannot claim the same one-time-use token.
  private nextToken: Promise<string> | null = null;

  getToken(): Promise<string> {
    if (this.nextToken) {
      const p = this.nextToken;
      this.nextToken = null;
      // Start the next speculative challenge now that this one is consumed.
      this.schedulePrefetch();
      return p;
    }

    // No pre-fetch ready — enqueue a challenge and pre-fetch once it delivers.
    const result = this.runSerializedChallenge();
    result.then(() => this.schedulePrefetch(), () => {});
    return result;
  }

  private schedulePrefetch(): void {
    if (this.nextToken) return; // already one in flight
    const p = this.runSerializedChallenge();
    this.nextToken = p;
    // Don't cache a rejected promise — clear so the next real call retries cleanly.
    p.catch(() => {
      if (this.nextToken === p) this.nextToken = null;
    });
  }

  private runSerializedChallenge(): Promise<string> {
    const result = this.chain.then(
      () => loadTurnstileScript().then(() => this.runChallenge()),
      () => loadTurnstileScript().then(() => this.runChallenge())
    );
    // Absorb so the chain always advances for subsequent callers.
    this.chain = result.then(
      () => {},
      () => {}
    );
    return result;
  }

  private runChallenge(): Promise<string> {
    return new Promise((resolve, reject) => {
      // Prevents the timeout and the token callback from both firing if they
      // race (e.g. token arrives at the exact moment the 30 s timer fires).
      let settled = false;
      const settle = (fn: () => void) => {
        if (settled) return;
        settled = true;
        fn();
      };

      const timeout = setTimeout(() => {
        settle(() => {
          if (this.widgetId) {
            window.turnstile.remove(this.widgetId);
            this.widgetId = null;
          }
          reject(new Error('Turnstile challenge timed out'));
        });
      }, CHALLENGE_TIMEOUT_MS);

      if (this.widgetId) {
        window.turnstile.remove(this.widgetId);
        this.widgetId = null;
      }

      const container = getOrCreateContainer();
      // widgetId is assigned synchronously by render() before the async callback fires.
      const widgetId = window.turnstile.render(container, {
        sitekey: getSiteKey(),
        callback: (token: string) => {
          settle(() => {
            clearTimeout(timeout);
            resolve(token);
          });
        },
      });

      if (!widgetId) {
        settle(() => {
          clearTimeout(timeout);
          reject(new Error('Turnstile failed to render widget'));
        });
      } else {
        this.widgetId = widgetId;
      }
    });
  }
}

const manager = new TurnstileManager();

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
    console.log('Option 2: Keep DevTools open — deactivate breakpoints in the Sources panel.');
    console.log('          Click the "Deactivate breakpoints" button in the Sources panel toolbar');
    console.log('          (it looks like a breakpoint circle with a slash through it).');
    console.log('          This disables all breakpoints including debugger statements. Click again to re-enable.');
    console.log('          Keyboard shortcut: Ctrl+F8 on Windows/Linux.');
    console.log('          On Mac: Cmd+F8 requires Fn key (Fn+Cmd+F8) unless you have "Use F1, F2 etc. as');
    console.log('          standard function keys" enabled — clicking the button directly is more reliable.');
    console.log('');
    console.log('NOTE: The DevTools Ignore List does NOT help here. It only applies to the main thread,');
    console.log('      not to Web Worker contexts. Cloudflare Turnstile (and our probe) run inside Blob');
    console.log('      Workers which are isolated contexts — no Ignore List pattern can suppress their');
    console.log('      debugger statements.');
    console.groupEnd();
    throw new TurnstileDevToolsError();
  }

  return manager.getToken();
}
