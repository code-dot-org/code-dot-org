import {LOG, TURNSTILE_SCRIPT_URL} from './constants';

let scriptLoadPromise: Promise<void> | null = null;

export function loadTurnstileScript(): Promise<void> {
  if (scriptLoadPromise) {
    console.log(`${LOG} Script already loaded (cached)`);
    return scriptLoadPromise;
  }

  scriptLoadPromise = new Promise((resolve, reject) => {
    if (window.turnstile) {
      console.log(
        `${LOG} Turnstile already present on window (externally loaded)`
      );
      resolve();
      return;
    }

    console.log(`${LOG} Injecting Turnstile script tag`);
    const script = document.createElement('script');
    script.src = TURNSTILE_SCRIPT_URL;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      console.log(`${LOG} Script loaded successfully`);
      resolve();
    };
    script.onerror = event => {
      const err = new Error('Failed to load Turnstile script');
      console.error(`${LOG} Script load failed:`, event);
      reject(err);
    };
    document.head.appendChild(script);
  });

  return scriptLoadPromise;
}
