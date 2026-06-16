import type {FieldErrors} from '../api/accounts.types';
import {asAccountsValidationError} from '../api/AccountsApiValidationError';

export interface ModalErrors {
  fieldErrors: FieldErrors;
  formError: string | null;
}

export interface FormErrorMessages {
  fieldErrors: FieldErrors;
  formErrors: string[];
}

export const GENERIC_ERROR = 'Something went wrong. Please try again.';

/**
 * Maps a caught mutation error to field- and form-level messages. Anything that
 * isn't a field-specific validation error — including an unparseable or empty
 * 422 — becomes a generic form-level message, so a real failure is never
 * silently swallowed. Shared by the profile SaveBar (renders all formErrors) and
 * the modals (show the first).
 */
export function toFormErrors(error: unknown): FormErrorMessages {
  const validation = asAccountsValidationError(error);
  // A specific field or form message is enough; only synthesize the generic
  // when there's nothing parseable to show (so a failure is never silent).
  if (validation && !validation.isEmpty) {
    return {
      fieldErrors: validation.fieldErrors,
      formErrors: validation.formErrors,
    };
  }
  return {fieldErrors: {}, formErrors: [GENERIC_ERROR]};
}

/**
 * Modal adapter over {@link toFormErrors}: modals keep the dialog open and show
 * a single form-level message plus per-field errors.
 */
export function modalErrors(error: unknown): ModalErrors {
  const {fieldErrors, formErrors} = toFormErrors(error);
  return {fieldErrors, formError: formErrors[0] ?? null};
}
