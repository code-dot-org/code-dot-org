import type {ApiError} from '@code-dot-org/core/api';

import type {FieldErrors} from './accounts.types';

// Form fields the server keys validation errors by (Rails snake_case). A key
// whose leaf segment is in this set becomes a field error; everything else
// (Rails `base`, dotted association paths like `authentication_options.email`,
// unknown keys) becomes a form-level error.
const KNOWN_FIELDS = new Set([
  'given_name',
  'family_name',
  'name',
  'username',
  'email',
  'current_password',
  'password',
  'password_confirmation',
  'user_type',
  'age',
  'us_state',
]);

function dedupe(messages: string[]): string[] {
  return [...new Set(messages)];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function toMessages(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((message): message is string => typeof message === 'string')
    : [];
}

// 422 bodies are flat `{field: [messages]}`; DELETE's 400 wraps them in an
// extra `{error: {...}}` envelope.
function unwrapErrors(error: ApiError): Record<string, unknown> {
  const body = error.body;
  if (!isRecord(body)) return {};
  if (error.status === 400 && isRecord(body.error)) return body.error;
  return body;
}

/**
 * Typed validation failure surfaced from a Rails mutation. Carries field-level
 * messages (mapped to form fields) and form-level messages separately. The
 * wire shapes this parses were captured from the real Rails controllers.
 */
export class AccountsApiValidationError extends Error {
  readonly status: number;
  readonly fieldErrors: FieldErrors;
  readonly formErrors: string[];
  name = 'AccountsApiValidationError' as const;

  constructor(status: number, fieldErrors: FieldErrors, formErrors: string[]) {
    super('Account update failed validation');
    this.status = status;
    this.fieldErrors = fieldErrors;
    this.formErrors = formErrors;
  }

  /** True when the server returned a failure with no specific messages. */
  get isEmpty(): boolean {
    return (
      this.formErrors.length === 0 && Object.keys(this.fieldErrors).length === 0
    );
  }

  // Messages are de-duplicated (some fields fire two validators and repeat).
  // Exact-match known fields become field errors; `base`, dotted association
  // paths (`authentication_options.email`), and unknown keys are form-level.
  static fromApiError(error: ApiError): AccountsApiValidationError {
    const entries = Object.entries(unwrapErrors(error))
      .map(([key, value]) => [key, toMessages(value)] as const)
      .filter(([, messages]) => messages.length > 0);

    const fieldErrors: FieldErrors = Object.fromEntries(
      entries
        .filter(([key]) => KNOWN_FIELDS.has(key))
        .map(([key, messages]) => [key, dedupe(messages)]),
    );
    const formErrors = dedupe(
      entries
        .filter(([key]) => !KNOWN_FIELDS.has(key))
        .flatMap(([, messages]) => messages),
    );

    return new AccountsApiValidationError(
      error.status,
      fieldErrors,
      formErrors,
    );
  }
}
