/* Generic helper functions. */

export const compareText = new Intl.Collator('en', {numeric: true}).compare;

export function getKeyByValue(
  object: Record<string, number>,
  value: number
): string | undefined {
  return Object.keys(object).find(key => object[key] === value);
}

export function isEmpty(object: Record<string, unknown>): boolean {
  return Object.keys(object).length === 0;
}

export function areArraysEqual<T>(array1: T[], array2: T[]): boolean {
  return (
    array1.length === array2.length &&
    array1.every((value, index) => {
      return value === array2[index];
    })
  );
}

export function arrayIntersection<T>(array1: T[], array2: T[]): T[] {
  return array1.filter(value => array2.includes(value));
}

// Returns a random integer from 0 (inclusive) to max (exclusive).
export function getRandomInt(max: number): number {
  return Math.floor(Math.random() * Math.floor(max));
}

const NICE_STEP_MULTIPLIERS = [1, 2, 5, 10];

// The smallest step in 1, 2, 5, 10, 20, 50, (powers of 10, including 10^0)
// that splits `max` into at most `intervals` steps.
export function getNiceAxisStep(max: number, intervals: number): number {
  if (max <= 0) {
    return 1;
  }
  const rawStep = max / intervals;
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const multiplier =
    NICE_STEP_MULTIPLIERS.find(m => m * magnitude >= rawStep) ?? 10;
  return Math.max(1, multiplier * magnitude);
}

export function prefersReducedMotion(): boolean {
  return !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}
