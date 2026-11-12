import DCDO from '@cdo/apps/dcdo';

// DCDO stores arbitrary JSON, so a number or numeric text is accepted, and
// anything else, or a value that is not positive, falls back to `fallback`.
function positiveNumberFromDcdo(flag: string, fallback: number): number {
  const value: unknown = DCDO.get(flag);
  const number =
    typeof value === 'number'
      ? value
      : typeof value === 'string' && value.trim() !== ''
      ? Number(value)
      : NaN;
  return Number.isFinite(number) && number > 0 ? number : fallback;
}

/** A timeout flag set in DCDO in milliseconds. */
export function timeoutMsFromDcdo(flag: string, defaultMs: number): number {
  return positiveNumberFromDcdo(flag, defaultMs);
}

/** A timeout flag set in DCDO in seconds, returned in milliseconds. */
export function timeoutMsFromDcdoSeconds(
  flag: string,
  defaultSeconds: number
): number {
  return positiveNumberFromDcdo(flag, defaultSeconds) * 1000;
}
