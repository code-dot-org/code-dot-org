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
 * Where the delivered token came from: 'pre-fetch' when a challenge started in
 * the background after the previous delivery had already produced it,
 * 'on-demand' when the caller had to wait for a challenge started for it.
 *
 * Reported separately in metrics because a pre-fetch failure is invisible to
 * the user and self-healing, while an on-demand failure is a broken request.
 */
export type TokenAcquisitionMode = 'pre-fetch' | 'on-demand';

export type TurnstileFailureReason =
  | 'timeout'
  | 'script_load_failed'
  | 'render_threw'
  | 'render_failed'
  | 'remove_failed'
  | 'unknown';

/**
 * A challenge failure carrying the reason it failed, so metrics and logs can
 * aggregate on a bounded enum rather than string-matching error messages.
 */
export class TurnstileChallengeError extends Error {
  readonly reason: TurnstileFailureReason;

  constructor(
    reason: TurnstileFailureReason,
    message: string,
    options?: {cause?: unknown}
  ) {
    super(message, options);
    this.name = 'TurnstileChallengeError';
    this.reason = reason;
  }
}

// Subclassed Errors do not survive `instanceof` under the es5 downlevel build,
// so the tag is read from `name` instead.
export const isTurnstileChallengeError = (
  error: unknown
): error is TurnstileChallengeError =>
  error instanceof Error && error.name === 'TurnstileChallengeError';

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
