import {configureStore, combineSlices} from '@reduxjs/toolkit';
import {useDispatch, useSelector} from 'react-redux';
import type {AnyAction, Reducer, Store} from 'redux';

import reduxSlice from './reduxSlice';
import type {SlicesState, StoreWithState} from './types';

export type StoreFor<TExtendedStore> =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TExtendedStore extends StoreWithState<infer S, any> ? S : never;
export type StateFor<TExtendedStore> =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TExtendedStore extends StoreWithState<any, infer S> ? S : never;

/**
 * Every store starts from the built-in redux slice; injected slices are added
 * to this combined reducer over time. `combineSlices` owns the injection
 * mechanics (the reducer map, caching, override semantics) that were
 * previously hand-rolled here with `combineReducers` + an `asyncReducers` bag
 * mutated onto the store.
 */
function createRootReducer() {
  return combineSlices(reduxSlice);
}

/**
 * The injectable combined reducer backing each store. Keyed weakly by store
 * so `injectSlices` can keep injecting into the same reducer across calls
 * without decorating the store object itself.
 */
const rootReducers = new WeakMap<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Store<any, AnyAction>,
  ReturnType<typeof createRootReducer>
>();

const initialRootReducer = createRootReducer();

const initialStore = configureStore({
  reducer: initialRootReducer,
});

rootReducers.set(initialStore, initialRootReducer);

/**
 * Slice-like shape we accept everywhere a real `Slice` would do. Structural
 * matching avoids the assignability hazards of `@reduxjs/toolkit` v2's
 * `Slice<State, CaseReducers, Name>` — that type makes the `actions` map
 * invariant, which prevents passing slices with different reducer shapes
 * through a single tuple even when only `name` and the state matter here.
 */
interface SliceLike {
  name: string;
  reducer: Reducer;
  getInitialState: () => unknown;
}

export function injectSlices<
  TSlices extends readonly SliceLike[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TExtendedStore extends StoreWithState<any, any>,
>(
  slices: TSlices,
  store: TExtendedStore,
): StoreWithState<
  StoreFor<TExtendedStore>,
  StateFor<TExtendedStore> & SlicesState<TSlices>
> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const s = store as unknown as Store<any, AnyAction>;

  let root = rootReducers.get(s);
  if (!root) {
    root = createRootReducer();
    rootReducers.set(s, root);
  }

  for (const slice of slices) {
    // Key by `name`, not `reducerPath`: this module's typing (`SlicesState`)
    // and its pre-combineSlices runtime both keyed injected state by the
    // slice name, so keep that contract regardless of a slice's reducerPath.
    root.inject(
      {reducerPath: slice.name, reducer: slice.reducer},
      {overrideExisting: true},
    );
  }

  // `inject` alone defers the new slice's state until the next dispatched
  // action; `replaceReducer` dispatches a REPLACE action, which both wires the
  // combined reducer into the store (first call) and materializes the freshly
  // injected slice state immediately.
  s.replaceReducer(root as Reducer);

  // refine the type of getState() to include the injected slices
  return store as unknown as StoreWithState<
    StoreFor<TExtendedStore>,
    StateFor<TExtendedStore> & SlicesState<TSlices>
  >;
}

/** Optional convenience overload for a single slice */
export function injectSlice<
  S extends SliceLike,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TStore extends Store<any, AnyAction>,
>(slice: S, store: TStore) {
  return injectSlices([slice] as const, store);
}

const defaultStore = initialStore as unknown as StoreWithState<
  typeof initialStore,
  SlicesState<[typeof reduxSlice]>
>;

export type RootState = ReturnType<(typeof defaultStore)['getState']>;
export type AppDispatch = typeof defaultStore.dispatch;
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AppDispatchFor<TStore extends Store<any, AnyAction>> =
  TStore['dispatch'];

export type MockStore<TSlices extends readonly SliceLike[]> = StoreWithState<
  typeof initialStore,
  SlicesState<TSlices>
>;

export default defaultStore;
