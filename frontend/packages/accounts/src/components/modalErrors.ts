import type {FieldErrors} from '../api/accounts.types';
import {asAccountsValidationError} from '../api/AccountsApiValidationError';

export interface ModalErrors {
  fieldErrors: FieldErrors;
  formError: string | null;
}

const GENERIC = 'Something went wrong. Please try again.';

/**
 * Maps a caught mutation error to a modal's field- and form-level messages.
 * Anything that isn't a field-specific validation error becomes a generic
 * form-level message, keeping the modal open with the user's input preserved.
 */
export function modalErrors(error: unknown): ModalErrors {
  const validation = asAccountsValidationError(error);
  if (validation && !validation.isEmpty) {
    return {
      fieldErrors: validation.fieldErrors,
      formError: validation.formErrors[0] ?? null,
    };
  }
  return {fieldErrors: {}, formError: GENERIC};
}
