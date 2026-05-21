import {describe, expect, it} from 'vitest';

import {parseNeighborhoodException} from '../parseNeighborhoodException';

// The package's `commonI18n` is currently a stub that returns empty
// strings; tests assert structural behavior (matched vs. unmatched, known
// vs. unknown key) without binding to specific user-facing copy.

describe('parseNeighborhoodException', () => {
  it('returns null for a traceback with no Neighborhood marker', () => {
    const traceback = [
      'Traceback (most recent call last):',
      '  File "/Files/main.py", line 3, in <module>',
      '    1 / 0',
      'ZeroDivisionError: division by zero',
    ].join('\n');
    expect(parseNeighborhoodException(traceback)).toBeNull();
  });

  it('returns null for an empty string', () => {
    expect(parseNeighborhoodException('')).toBeNull();
  });

  it('returns a string for a known exception key (INVALID_MOVE)', () => {
    const traceback = [
      'Traceback (most recent call last):',
      '  File "/Files/main.py", line 5, in <module>',
      '    painter.move()',
      '  File "neighborhood/painter.py", line 67, in move',
      '    raise NeighborhoodRuntimeException(ExceptionKey.INVALID_MOVE)',
      'neighborhood.support.neighborhood_runtime_exception.NeighborhoodRuntimeException: INVALID_MOVE',
    ].join('\n');
    const out = parseNeighborhoodException(traceback);
    expect(out).not.toBeNull();
    expect(typeof out).toBe('string');
  });

  it('still returns a string when the key is unrecognized', () => {
    // Future-proofing: the Python side may add a key we don't yet have
    // a friendly message for. We should still surface *something* so
    // the user sees that a Neighborhood-shaped exception happened.
    const traceback =
      'NeighborhoodRuntimeException: SOME_NEW_EXCEPTION_NOT_IN_TABLE';
    const out = parseNeighborhoodException(traceback);
    expect(out).not.toBeNull();
    expect(out).toContain('SOME_NEW_EXCEPTION_NOT_IN_TABLE');
  });

  it('matches the exception line at any depth in the traceback', () => {
    // The `m` flag plus `^\s*.*` anchor lets the line surface even with
    // indentation. The line above (with the path prefix) is also valid.
    expect(
      parseNeighborhoodException(
        '   NeighborhoodRuntimeException: INVALID_DIRECTION',
      ),
    ).not.toBeNull();
  });
});
