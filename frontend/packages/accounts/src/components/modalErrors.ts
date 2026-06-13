import type {FieldErrors} from '../api/accounts.types';
import {AccountsApiValidationError} from '../api/AccountsApiValidationError';

export interface ModalErrors {
  fieldErrors: FieldErrors;
  /** A form-level message shown at the top of the modal (network/base errors). */
  formError: string | null;
}

const GENERIC = 'Something went wrong. Please try again.';

/**
 * Maps a caught mutation error to a modal's field- and form-level messages. A
 * validation error with specific fields surfaces them per field; anything else
 * (network failure, empty body) becomes a generic form-level message so the
 * modal stays open with the user's input preserved.
 */
export function modalErrors(error: unknown): ModalErrors {
  if (error instanceof AccountsApiValidationError && !error.isEmpty) {
    return {
      fieldErrors: error.fieldErrors,
      formError: error.formErrors[0] ?? null,
    };
  }
  return {fieldErrors: {}, formError: GENERIC};
}
