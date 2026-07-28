import {
  GENERIC_ERROR,
  toFormErrors as toValidationErrors,
  type ValidationErrors,
} from '@code-dot-org/component-library/form';

import type {FieldErrors} from '../api/users.types';
import {asUsersValidationError} from '../api/UsersApiValidationError';

export {GENERIC_ERROR};

export interface ModalErrors {
  fieldErrors: FieldErrors;
  formError: string | null;
}

// A users-API 422 parses into field/form messages; anything else (including an
// unparseable or empty 422) returns null, and the shared mapper falls back to a
// generic form-level message so a real failure is never silently swallowed.
const parseUsersError = (error: unknown): ValidationErrors | null => {
  const validation = asUsersValidationError(error);
  return validation && !validation.isEmpty
    ? {fieldErrors: validation.fieldErrors, formErrors: validation.formErrors}
    : null;
};

/**
 * Maps a caught mutation error to field- and form-level messages via the shared
 * form-error mapper. Shared by the profile SaveBar (renders all formErrors) and
 * the modals (show the first).
 */
export function toFormErrors(error: unknown): ValidationErrors {
  return toValidationErrors(error, parseUsersError);
}

/**
 * Modal adapter over {@link toFormErrors}: modals keep the dialog open and show
 * a single form-level message plus per-field errors.
 */
export function modalErrors(error: unknown): ModalErrors {
  const {fieldErrors, formErrors} = toFormErrors(error);
  return {fieldErrors, formError: formErrors[0] ?? null};
}
