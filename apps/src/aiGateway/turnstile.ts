import DCDO from '@cdo/apps/dcdo';

const TURNSTILE_SCRIPT_URL =
  'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
const CONTAINER_ID = 'turnstile-container';
const CHALLENGE_TIMEOUT_MS = 30_000;

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
  private pendingResolve: ((token: string) => void) | null = null;
  private pendingReject: ((err: Error) => void) | null = null;
  // All calls are serialized through this chain — only one challenge runs at a time,
  // which means widgetId/pendingResolve/pendingReject are always owned by exactly one
  // execution context and never need additional locking.
  private chain: Promise<unknown> = Promise.resolve();

  getToken(): Promise<string> {
    // Ensure the script is loaded before queuing, so script errors propagate to callers.
    const result = this.chain.then(
      () => loadTurnstileScript().then(() => this.runChallenge()),
      () => loadTurnstileScript().then(() => this.runChallenge())
    );
    // Absorb resolve/reject so the chain always advances for the next caller.
    this.chain = result.then(
      () => {},
      () => {}
    );
    return result;
  }

  // Called by Turnstile's callback — the only external entry point besides getToken.
  handleToken(token: string) {
    this.pendingResolve?.(token);
  }

  private runChallenge(): Promise<string> {
    return new Promise((resolve, reject) => {
      let settled = false;

      const settle = (fn: () => void) => {
        if (settled) return;
        settled = true;
        this.pendingResolve = null;
        this.pendingReject = null;
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

      this.pendingResolve = (token: string) =>
        settle(() => {
          clearTimeout(timeout);
          resolve(token);
        });
      this.pendingReject = (err: Error) =>
        settle(() => {
          clearTimeout(timeout);
          reject(err);
        });

      if (this.widgetId) {
        // Verify the widget is still live in the DOM before attempting a reset.
        const container = document.getElementById(CONTAINER_ID);
        if (container?.hasChildNodes()) {
          window.turnstile.reset(this.widgetId);
          return;
        }
        // Widget was detached (e.g. DOM was cleared) — fall through to re-render.
        this.widgetId = null;
      }

      const container = getOrCreateContainer();
      // Evict any orphaned Turnstile content we don't have a handle on.
      container.innerHTML = '';

      const widgetId = window.turnstile.render(container, {
        sitekey: getSiteKey(),
        callback: (token: string) => this.handleToken(token),
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
