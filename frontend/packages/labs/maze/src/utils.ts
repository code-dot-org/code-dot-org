import {DEFAULT_PEGMAN_ID} from './constants';

/**
 * Return a random value from an array
 */
export function randomValue<T = string | number>(values: T[]): T {
  const key = Math.floor(Math.random() * values.length);
  return values[key];
}

/**
 * Generates an array of integers from start to end inclusive
 */
export function range(start: number, end: number): number[] {
  const ints = [];
  for (let i = start; i <= end; i++) {
    ints.push(i);
  }
  return ints;
}

/**
 * Generate a random identifier in a format matching the RFC-4122 specification.
 *
 * Taken from
 * {@link http://byronsalau.com/blog/how-to-create-a-guid-uuid-in-javascript/}
 *
 * @see RFC-4122 standard {@link http://www.ietf.org/rfc/rfc4122.txt}
 *
 * @returns RFC4122-compliant UUID
 */
export function createUuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Get html id for a pegman-specific element
export function getPegmanElementId(
  elementPrefix: string,
  pegmanId?: string,
): string {
  let pegmanSuffix = '';

  // if pegmanId is not null, undefined, or DEFAULT_PEGMAN_ID, append it to the elementPrefix
  if (pegmanId && pegmanId !== DEFAULT_PEGMAN_ID) {
    pegmanSuffix = `-${pegmanId}`;
  }

  return `${elementPrefix}${pegmanSuffix}`;
}
