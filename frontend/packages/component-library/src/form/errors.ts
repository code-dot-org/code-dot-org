import type {FieldErrors} from './saveState';

export interface ValidationErrors {
  fieldErrors: FieldErrors;
  formErrors: string[];
}

export const GENERIC_ERROR = 'Something went wrong. Please try again.';

/**
 * A consumer-supplied parser: turn a caught error into field- and form-level
 * messages, or `null` when the error is not a validation failure this parser
 * recognizes. The form kit stays API-shape-generic — the consumer owns the wire
 * format (Rails 422/400 bodies, a GraphQL error array, etc.).
 */
export type ValidationErrorParser = (error: unknown) => ValidationErrors | null;

function isEmpty(errors: ValidationErrors): boolean {
  return (
    errors.formErrors.length === 0 &&
    Object.keys(errors.fieldErrors).length === 0
  );
}

/**
 * Maps a caught save error to field- and form-level messages, ready for
 * `dispatch({type: 'saveFailed', ...})`. Delegates wire parsing to `parse`;
 * anything `parse` can't turn into a specific message — including an
 * unparseable body or a non-validation failure (network, 5xx) — becomes a
 * generic form-level message, so a real failure is never silently swallowed.
 */
export function toFormErrors(
  error: unknown,
  parse: ValidationErrorParser,
): ValidationErrors {
  const parsed = parse(error);
  // A specific field or form message is enough; only synthesize the generic
  // when there's nothing parseable to show (so a failure is never silent).
  if (parsed && !isEmpty(parsed)) {
    return parsed;
  }
  return {fieldErrors: {}, formErrors: [GENERIC_ERROR]};
}
