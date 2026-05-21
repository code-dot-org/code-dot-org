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

export function getRandomInt(max: number): number {
  return Math.floor(Math.random() * Math.floor(max));
}
