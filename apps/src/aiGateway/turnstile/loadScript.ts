import {LOG, TURNSTILE_SCRIPT_URL} from './constants';
import {TurnstileChallengeError} from './types';

let scriptLoadPromise: Promise<void> | null = null;

export function loadTurnstileScript(): Promise<void> {
  if (scriptLoadPromise) {
    console.log(`${LOG} Reusing in-flight or completed script load`);
    return scriptLoadPromise;
  }

  const pending = new Promise<void>((resolve, reject) => {
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
      console.error(`${LOG} Script load failed:`, event);
      script.remove();
      reject(
        new TurnstileChallengeError(
          'script_load_failed',
          'Failed to load Turnstile script'
        )
      );
    };
    document.head.appendChild(script);
  });

  // Caching a rejection would make one failed load permanent: every later caller
  // replays it in microseconds and no retry ever reaches the network again.
  pending.catch(() => {
    if (scriptLoadPromise === pending) {
      scriptLoadPromise = null;
    }
  });

  scriptLoadPromise = pending;
  return pending;
}
