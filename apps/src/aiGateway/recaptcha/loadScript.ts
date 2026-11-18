import {LOG, RECAPTCHA_SCRIPT_URL} from './constants';
import {RecaptchaError} from './types';

let scriptLoadPromise: Promise<void> | null = null;

export function loadRecaptchaScript(): Promise<void> {
  if (scriptLoadPromise) {
    return scriptLoadPromise;
  }

  scriptLoadPromise = new Promise((resolve, reject) => {
    console.log(`${LOG} Injecting reCAPTCHA script tag`);
    const script = document.createElement('script');
    script.src = RECAPTCHA_SCRIPT_URL;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      console.log(`${LOG} Script loaded successfully`);
      resolve();
    };
    script.onerror = event => {
      console.error(`${LOG} Script load failed:`, event);
      // Forgotten, so a later request can try again once the network recovers.
      script.remove();
      scriptLoadPromise = null;
      reject(
        new RecaptchaError(
          'script_load_failed',
          'Failed to load reCAPTCHA script'
        )
      );
    };
    document.head.appendChild(script);
  });

  return scriptLoadPromise;
}
