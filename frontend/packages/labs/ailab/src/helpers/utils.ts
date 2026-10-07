/* Generic helper functions. */

export function getKeyByValue(
  object: Record<string, number>,
  value: number,
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

export function getRandomInt(
  max: number,
  random: () => number = Math.random,
): number {
  return Math.floor(random() * Math.floor(max));
}

const MAX_SEED = 2 ** 32;

export function newSeed(): number {
  return getRandomInt(MAX_SEED);
}

// mulberry32: a small 32-bit PRNG; the same seed always yields the same sequence.
export function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let mixed = state;
    mixed = Math.imul(mixed ^ (mixed >>> 15), mixed | 1);
    mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);
    return ((mixed ^ (mixed >>> 14)) >>> 0) / MAX_SEED;
  };
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
