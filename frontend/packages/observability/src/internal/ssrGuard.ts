/**
 * Returns true when running in a browser environment.
 * Use this guard before any DOM or window access.
 */
export function isBrowser(): boolean {
  return typeof window !== 'undefined';
}
