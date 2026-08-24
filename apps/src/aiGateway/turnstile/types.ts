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

/** Whether a caller was waiting on the challenge that produced the token. */
export type TokenAcquisitionMode = 'pre-fetch' | 'on-demand';

export type TurnstileFailureReason =
  | 'timeout'
  | 'script_load_failed'
  | 'render_threw'
  | 'render_failed'
  | 'remove_failed'
  | 'unknown';

/** Carries a bounded reason so metrics aggregate without matching messages. */
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

// instanceof fails on Error subclasses under the es5 downlevel build.
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
