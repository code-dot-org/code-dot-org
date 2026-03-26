import DCDO from '@cdo/apps/dcdo';

const TURNSTILE_SCRIPT_URL =
  'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
const CONTAINER_ID = 'turnstile-container';
const CHALLENGE_TIMEOUT_MS = 30_000;
// Any elapsed time above this means a human had to click "Resume" in DevTools.
const DEBUGGER_PAUSE_THRESHOLD_MS = 100;

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
 * Detects whether a `debugger` statement inside an anonymous (eval'd) script
 * would pause execution — the same context Turnstile uses for its own
 * anti-bot debugger call. If this returns true, Turnstile's challenge will
 * also be paused and the request will hang or time out.
 *
 * Returns false when:
 *   - DevTools is closed
 *   - Breakpoints are deactivated (Ctrl+F8)
 *   - "Anonymous scripts from eval or console" is enabled in DevTools Ignore List
 *   - new Function() is blocked by CSP (can't detect → assume safe)
 */
function debuggerWillPauseInAnonymousScope(): boolean {
  try {
    // new Function() produces a sourceless anonymous script, matching
    // the Web Worker context Turnstile uses. The Ignore List setting only
    // suppresses debugger pauses in scripts with no source URL, so running
    // the probe here gives us an accurate signal for Turnstile specifically.
    const elapsedMs = (
      new Function(`
        var t = performance.now();
        debugger;
        return performance.now() - t;
      `) as () => number
    )();
    return elapsedMs > DEBUGGER_PAUSE_THRESHOLD_MS;
  } catch {
    // new Function() blocked by CSP — cannot probe, assume Turnstile is safe.
    return false;
  }
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

class TurnstileManager {
  private widgetId: string | null = null;
  // All calls are serialized through this chain — only one challenge runs at a time.
  private chain: Promise<unknown> = Promise.resolve();

  getToken(): Promise<string> {
    const result = this.chain.then(
      () => loadTurnstileScript().then(() => this.runChallenge()),
      () => loadTurnstileScript().then(() => this.runChallenge())
    );
    // Absorb to keep the chain always advancing for subsequent callers.
    this.chain = result.then(
      () => {},
      () => {}
    );
    return result;
  }

  private runChallenge(): Promise<string> {
    // Probe before touching the Turnstile widget. If DevTools would pause
    // Turnstile's own debugger call, fail fast with an actionable error
    // instead of hanging for 30 s.
    if (debuggerWillPauseInAnonymousScope()) {
      console.error(
        '[Turnstile] Challenge blocked: DevTools breakpoints are active on ' +
          'anonymous scripts. Cloudflare Turnstile uses anonymous Web Worker ' +
          'scripts that trigger a debugger statement — if breakpoints are ' +
          'active for these, the challenge cannot complete.'
      );
      console.group('How to fix the Turnstile / DevTools conflict');
      console.log(
        'Option 1: Close DevTools entirely and reload the page.'
      );
      console.groupCollapsed(
        'Option 2: Keep DevTools open — ignore anonymous scripts (recommended for developers)'
      );
      console.log('Step 1: Open DevTools Settings — press F1 or click the ⚙ gear icon in the top-right of DevTools.');
      console.log('Step 2: Select "Ignore List" in the left sidebar.');
      console.log('Step 3: Make sure "Enable Ignore Listing" is checked (this is the master switch).');
      console.log('Step 4: Check "Anonymous scripts from eval or console".');
      console.log('Step 5: Close Settings and retry sending your message.');
      console.groupEnd();
      console.log(
        'Option 3: Deactivate breakpoints temporarily — press Ctrl+F8 (Windows/Linux) or Cmd+F8 (Mac).'
      );
      console.groupEnd();
      throw new TurnstileDevToolsError();
    }

    return new Promise((resolve, reject) => {
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

      // Always remove the previous widget and render a fresh one, matching
      // the behavior of the prior implementation that was known to work.
      if (this.widgetId) {
        window.turnstile.remove(this.widgetId);
        this.widgetId = null;
      }

      const container = getOrCreateContainer();

      // widgetId is assigned synchronously by render() before the async callback fires
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
  return manager.getToken();
}
