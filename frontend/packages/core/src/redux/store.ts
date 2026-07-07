import {configureStore, combineSlices} from '@reduxjs/toolkit';
import type {Dispatch, Reducer, Store, UnknownAction} from '@reduxjs/toolkit';
import {useDispatch, useSelector} from 'react-redux';

import reduxSlice, {setCount} from './reduxSlice';
import type {SlicesState, StoreWithState} from './types';

export type StateFor<TExtendedStore> =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TExtendedStore extends StoreWithState<any, infer S> ? S : never;

/**
 * The app-wide combined reducer, seeded with the built-in redux slice.
 * `combineSlices` owns the injection mechanics: the reducer map, caching,
 * and override semantics. Every store this module creates shares it, so an
 * injected slice's reducer is live in all of them; state remains per-store.
 */
const rootReducer = combineSlices(reduxSlice);

/** Names of the slices injected so far, backing `redux.reducerCount`. */
const injectedNames = new Set<string>();

function buildStore() {
  return configureStore({reducer: rootReducer});
}

// The store backing the module's default export; `typeof initialStore` also
// anchors MockStore's base store type.
const initialStore = buildStore();

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

export type MockStore<TSlices extends readonly SliceLike[]> = StoreWithState<
  typeof initialStore,
  SlicesState<TSlices>
>;

/**
 * Creates a fresh store over the shared root reducer. State is isolated per
 * store; the slice registry is not — a slice injected anywhere is live in
 * every store from this module. The module's default export is one of these;
 * tests create isolated ones here instead of casting a raw `configureStore`
 * result.
 */
export function createInjectableStore(): MockStore<[typeof reduxSlice]> {
  return buildStore() as unknown as MockStore<[typeof reduxSlice]>;
}

/**
 * Injects the slices into the shared root reducer and returns the store with
 * `getState` widened to include them. The store must be one of this module's
 * (the default export or `createInjectableStore()`) — injection lands in the
 * shared reducer, so a store built on any other reducer would never see it.
 */
export function injectSlices<
  TSlices extends readonly SliceLike[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TExtendedStore extends StoreWithState<any, any>,
>(
  slices: TSlices,
  store: TExtendedStore,
): StoreWithState<
  // Wrap the input store type as-is rather than trying to recover the
  // pre-wrap store from it: Omit<-, 'getState'> is idempotent, and an
  // `infer`-based recovery only works when the argument's type literally
  // carries the StoreWithState alias (a MockStore-typed value would not).
  TExtendedStore,
  StateFor<TExtendedStore> & SlicesState<TSlices>
> {
  for (const slice of slices) {
    // Key by `name`, not `reducerPath`: this module's typing (`SlicesState`)
    // keys injected state by the slice name, so the runtime must match
    // regardless of a slice's reducerPath.
    rootReducer.inject(
      {reducerPath: slice.name, reducer: slice.reducer},
      {overrideExisting: true},
    );
    injectedNames.add(slice.name);
  }

  // `inject` alone defers the new slices' state until the next dispatched
  // action; the setCount dispatch materializes it immediately, and records
  // how many distinct slices the app has loaded.
  (store as unknown as Store).dispatch(setCount(injectedNames.size));

  // refine the type of getState() to include the injected slices
  return store as unknown as StoreWithState<
    TExtendedStore,
    StateFor<TExtendedStore> & SlicesState<TSlices>
  >;
}

/**
 * Typed react-redux hooks derived from a store's own type. The argument is
 * used only for inference — the hooks read the store from the react-redux
 * Provider context at render time. A host store module exports these once:
 *
 *   export const {useAppDispatch, useAppSelector} = storeHooks(store);
 */
export function storeHooks<
  TStore extends {getState(): unknown; dispatch: Dispatch<UnknownAction>},
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
>(_store: TStore) {
  return {
    useAppDispatch: useDispatch.withTypes<TStore['dispatch']>(),
    useAppSelector: useSelector.withTypes<ReturnType<TStore['getState']>>(),
  };
}

const defaultStore = initialStore as unknown as MockStore<[typeof reduxSlice]>;

export default defaultStore;
