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
