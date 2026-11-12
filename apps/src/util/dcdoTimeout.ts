import DCDO from '@cdo/apps/dcdo';

/**
 * A timeout flag set in DCDO in milliseconds. DCDO stores arbitrary JSON, so
 * a number or numeric text is accepted, and anything else, or a value that is
 * not positive, falls back to `defaultMs`.
 */
export function timeoutMsFromDcdo(flag: string, defaultMs: number): number {
  const value: unknown = DCDO.get(flag, defaultMs);
  const ms =
    typeof value === 'number'
      ? value
      : typeof value === 'string' && value.trim() !== ''
      ? Number(value)
      : NaN;
  return Number.isFinite(ms) && ms > 0 ? ms : defaultMs;
}

/** As timeoutMsFromDcdo, for a flag set in seconds. */
export function timeoutMsFromDcdoSeconds(
  flag: string,
  defaultSeconds: number
): number {
  return timeoutMsFromDcdo(flag, defaultSeconds) * 1000;
}
