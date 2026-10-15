import {describe, expect, it} from 'vitest';

import {ApiError} from '@code-dot-org/core/api';

import {GENERIC_ERROR, modalErrors, toFormErrors} from '../modalErrors';

function apiError(status: number, body: unknown): ApiError {
  return new ApiError(`Request failed -> ${status}`, {
    status,
    statusText: '',
    type: 'default',
    url: '/x',
    method: 'PATCH',
    headers: new Headers(),
    body,
  });
}

describe('toFormErrors', () => {
  it('surfaces field errors when the 422 names known fields', () => {
    const {fieldErrors, formErrors} = toFormErrors(
      apiError(422, {username: ['Username has already been taken']}),
    );
    expect(fieldErrors.username).toEqual(['Username has already been taken']);
    expect(formErrors).toEqual([]);
  });

  it('falls back to a generic message for an unparseable 422 (never silent)', () => {
    // A 422 whose body the transport could not parse as JSON must not vanish.
    const {fieldErrors, formErrors} = toFormErrors(
      apiError(422, 'Unprocessable Entity'),
    );
    expect(fieldErrors).toEqual({});
    expect(formErrors).toEqual([GENERIC_ERROR]);
  });

  it('falls back to generic for non-validation failures (5xx, network)', () => {
    expect(toFormErrors(apiError(500, {})).formErrors).toEqual([GENERIC_ERROR]);
    expect(toFormErrors(new Error('network')).formErrors).toEqual([
      GENERIC_ERROR,
    ]);
  });
});

describe('modalErrors', () => {
  it('shows the first form-level message and per-field errors', () => {
    const result = modalErrors(apiError(422, {base: ['Boom'], age: ['bad']}));
    expect(result.formError).toBe('Boom');
    expect(result.fieldErrors.age).toEqual(['bad']);
  });

  it('shows the generic message when nothing is parseable', () => {
    expect(modalErrors(apiError(422, 'oops')).formError).toBe(GENERIC_ERROR);
  });
});
