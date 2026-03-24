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
