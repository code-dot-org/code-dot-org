import {
  NeighborhoodExceptionMessage,
  NeighborhoodExceptionTypes,
  commonI18n,
} from './constants';
import type {NeighborhoodExceptionType} from './types';

/**
 * Regex against a Pyodide traceback for the marker line emitted by
 * `NeighborhoodRuntimeException` in the Python `neighborhood` package.
 * The `m` flag matches across lines; the capture is the all-caps key
 * (`INVALID_MOVE`, `INVALID_COLOR`, …).
 */
const EXCEPTION_RE = /^\s*.*NeighborhoodRuntimeException:\s+([A-Z_]+)$/m;

/**
 * Translate a Python traceback into a friendly Neighborhood-specific
 * message, or null when the traceback is not from this mini-app.
 *
 * Known keys map to a localized message via `NeighborhoodExceptionMessage`;
 * unrecognized keys produce a generic-unknown message so the user still
 * sees that *something* neighborhood-shaped happened.
 */
export function parseNeighborhoodException(traceback: string): string | null {
  const match = traceback.match(EXCEPTION_RE);
  if (!match) return null;

  const key = match[1];
  if (key in NeighborhoodExceptionTypes) {
    const message =
      NeighborhoodExceptionMessage[key as NeighborhoodExceptionType];
    return `${commonI18n.exceptionTag()} ${message}`;
  }
  return `${commonI18n.exceptionTag()} ${commonI18n.errorNeighborhoodUnknown()} ${key}`;
}
