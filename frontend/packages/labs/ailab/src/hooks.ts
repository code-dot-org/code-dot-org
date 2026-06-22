import {
  type TypedUseSelectorHook,
  shallowEqual,
  useDispatch,
  useSelector,
} from 'react-redux';

import type {RootState} from './redux';

// Typed react-redux hooks for use throughout the package, in place of connect().
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export const useAppDispatch = useDispatch;

// Re-exported for selectors that build a fresh object/array each call (e.g.
// derived shapes that also read non-Redux globals like I18n and so can't be
// memoized on state): pass it to useAppSelector to dedupe by value.
export {shallowEqual};
