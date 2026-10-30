import {ApiError} from '@code-dot-org/core/api';

import type {FieldErrors} from './users.types';

// A server error key in this set becomes a field error; everything else (Rails
// `base`, dotted paths like `authentication_options.email`, unknown keys) is
// form-level.
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
  'parent_email',
]);

// Server attribute names the SPA folds onto one of its fields. set_parent_email
// maps parent_email -> parent_email_preference_email, so a validation error
// comes back under that key; surface it on the parent_email field, not as a
// form-level message.
const FIELD_ALIASES: Record<string, string> = {
  parent_email_preference_email: 'parent_email',
};

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
 * Typed validation failure from a Rails mutation, carrying field- and
 * form-level messages separately. Parses wire shapes captured from the real
 * controllers.
 */
export class UsersApiValidationError extends Error {
  readonly status: number;
  readonly fieldErrors: FieldErrors;
  readonly formErrors: string[];
  name = 'UsersApiValidationError' as const;

  constructor(status: number, fieldErrors: FieldErrors, formErrors: string[]) {
    super('Account update failed validation');
    this.status = status;
    this.fieldErrors = fieldErrors;
    this.formErrors = formErrors;
  }

  get isEmpty(): boolean {
    return (
      this.formErrors.length === 0 && Object.keys(this.fieldErrors).length === 0
    );
  }

  // Messages are de-duplicated; a field can fire two validators and repeat.
  static fromApiError(error: ApiError): UsersApiValidationError {
    const entries = Object.entries(unwrapErrors(error))
      .map(
        ([key, value]) =>
          [FIELD_ALIASES[key] ?? key, toMessages(value)] as const,
      )
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

    return new UsersApiValidationError(error.status, fieldErrors, formErrors);
  }
}

// PATCH endpoints reject with 422, DELETE /users with 400. Other failures
// (network, 5xx) are not field-level and stay generic.
export function asUsersValidationError(
  error: unknown,
): UsersApiValidationError | null {
  if (
    error instanceof ApiError &&
    (error.status === 422 || error.status === 400)
  ) {
    return UsersApiValidationError.fromApiError(error);
  }
  return null;
}
