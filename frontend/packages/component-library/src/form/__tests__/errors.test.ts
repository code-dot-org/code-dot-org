import {
  GENERIC_ERROR,
  toFormErrors,
  type ValidationErrorParser,
} from '../errors';

// A trivial parser standing in for a consumer's wire-format parser: it treats a
// plain object as {fieldErrors, formErrors} and everything else as unparseable.
const parse: ValidationErrorParser = error =>
  error && typeof error === 'object' && 'fieldErrors' in error
    ? (error as ReturnType<ValidationErrorParser>)
    : null;

describe('toFormErrors', () => {
  it('passes through parsed field and form errors', () => {
    const result = toFormErrors(
      {fieldErrors: {username: ['taken']}, formErrors: []},
      parse,
    );
    expect(result.fieldErrors.username).toEqual(['taken']);
    expect(result.formErrors).toEqual([]);
  });

  it('falls back to a generic message when the parser returns null', () => {
    expect(toFormErrors(new Error('network'), parse)).toEqual({
      fieldErrors: {},
      formErrors: [GENERIC_ERROR],
    });
  });

  it('falls back to generic when the parser yields an empty result (never silent)', () => {
    // A recognized-but-empty validation error must not vanish.
    expect(toFormErrors({fieldErrors: {}, formErrors: []}, parse)).toEqual({
      fieldErrors: {},
      formErrors: [GENERIC_ERROR],
    });
  });
});
