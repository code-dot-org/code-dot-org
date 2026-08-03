import {
  type TypedUseSelectorHook,
  shallowEqual,
  useDispatch,
  useSelector,
} from 'react-redux';

import type {RootState} from './redux';
import type {AppDispatch} from './store';

// Typed react-redux hooks for use throughout the package, in place of connect().
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export const useAppDispatch: () => AppDispatch = useDispatch;

// Re-exported for selectors that build a fresh object/array each call (e.g.
// derived shapes that also read non-Redux globals like I18n and so can't be
// memoized on state): pass it to useAppSelector to dedupe by value.
export {shallowEqual};

// Structural equality for useAppSelector, for selectors whose result is nested
// (arrays of objects, or objects with array fields) and so isn't deduped by
// shallowEqual. Like shallowEqual it lets a selector that rebuilds an equal
// value each call avoid spurious rerenders without being memoized on state.
export function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) {
    return true;
  }
  if (
    typeof a !== 'object' ||
    typeof b !== 'object' ||
    a === null ||
    b === null
  ) {
    return false;
  }
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) {
    return false;
  }
  return keysA.every(
    key =>
      Object.prototype.hasOwnProperty.call(b, key) &&
      deepEqual(
        (a as Record<string, unknown>)[key],
        (b as Record<string, unknown>)[key],
      ),
  );
}
