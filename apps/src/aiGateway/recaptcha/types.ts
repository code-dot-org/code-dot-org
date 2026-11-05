declare global {
  interface Window {
    grecaptcha?: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: {action: string}) => Promise<string>;
    };
  }
}

export type RecaptchaFailureReason =
  | 'script_load_failed'
  // The script loaded but ready() or execute() never answered.
  | 'timeout'
  | 'execute_failed'
  | 'empty_token';

/** Carries a bounded reason so metrics aggregate without matching messages. */
export class RecaptchaError extends Error {
  readonly reason: RecaptchaFailureReason;

  constructor(
    reason: RecaptchaFailureReason,
    message: string,
    options?: {cause?: unknown}
  ) {
    super(message, options);
    this.name = 'RecaptchaError';
    this.reason = reason;
  }
}

// instanceof fails on Error subclasses under the es5 downlevel build.
export const isRecaptchaError = (error: unknown): error is RecaptchaError =>
  error instanceof Error && error.name === 'RecaptchaError';
