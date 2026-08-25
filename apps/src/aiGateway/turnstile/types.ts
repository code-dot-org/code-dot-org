declare global {
  interface Window {
    turnstile: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          // Fires once per failed attempt. Turnstile retries on its own
          // (`retry` defaults to auto, `retry-interval` to 8s), so a later
          // attempt may still succeed -- this reports, it does not decide.
          'error-callback'?: (errorCode: string) => void;
          // Fires when Turnstile cannot run in this browser at all. Retrying
          // cannot help, so this one is terminal.
          'unsupported-callback'?: () => void;
        }
      ) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

/** Whether a caller was waiting on the challenge that produced the token. */
export type TokenAcquisitionMode = 'pre-fetch' | 'on-demand';

export type TurnstileFailureReason =
  // Nothing ever responded -- no error, no token. The widget is broken or
  // unreachable, as distinct from Cloudflare deciding against us.
  | 'timeout'
  // Cloudflare reported an error and its own retries never recovered. Turnstile
  // working as designed, which is the opposite conclusion from a timeout.
  | 'challenge_failed'
  // Turnstile does not support this browser. No amount of retrying helps, and
  // under `enforce` this user cannot use the feature at all.
  | 'unsupported'
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
