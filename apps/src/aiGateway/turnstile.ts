import DCDO from '@cdo/apps/dcdo';

const TURNSTILE_SCRIPT_URL =
  'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
const CONTAINER_ID = 'turnstile-container';

declare global {
  interface Window {
    turnstile: {
      render: (
        container: HTMLElement,
        options: {sitekey: string; callback: (token: string) => void}
      ) => string;
      reset: (widgetId: string) => void;
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
  return (DCDO.get('ai-gateway-turnstile-site-key', undefined) as string) ?? '';
}

export async function getTurnstileToken(): Promise<string> {
  await loadTurnstileScript();

  return new Promise((resolve, reject) => {
    const container = getOrCreateContainer();

    // widgetId is assigned synchronously by render() before the async callback fires
    const widgetId = window.turnstile.render(container, {
      sitekey: getSiteKey(),
      callback: (token: string) => {
        window.turnstile.reset(widgetId);
        resolve(token);
      },
    });

    if (!widgetId) {
      reject(new Error('Turnstile failed to render widget'));
    }
  });
}
