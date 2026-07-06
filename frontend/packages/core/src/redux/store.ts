import {configureStore, combineSlices} from '@reduxjs/toolkit';
import type {Dispatch, Reducer, Store, UnknownAction} from '@reduxjs/toolkit';
import {useDispatch, useSelector} from 'react-redux';

import reduxSlice, {setCount} from './reduxSlice';
import type {SlicesState, StoreWithState} from './types';

export type StateFor<TExtendedStore> =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TExtendedStore extends StoreWithState<any, infer S> ? S : never;

/**
 * Every store starts from the built-in redux slice; injected slices are added
 * to this combined reducer over time. `combineSlices` owns the injection
 * mechanics: the reducer map, caching, and override semantics.
 */
function createRootReducer() {
  return combineSlices(reduxSlice);
}

interface InjectableEntry {
  root: ReturnType<typeof createRootReducer>;
  /** Names of the slices injected so far, backing `redux.reducerCount`. */
  names: Set<string>;
}

/**
 * The injectable combined reducer backing each store. Keyed weakly by store
 * so `injectSlices` can keep injecting into the same reducer across calls
 * without decorating the store object itself.
 */
const injectables = new WeakMap<Store, InjectableEntry>();

function buildStore() {
  const root = createRootReducer();
  const store = configureStore({reducer: root});
  injectables.set(store, {root, names: new Set()});
  return store;
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
 * Creates a fresh injectable store, seeded with the built-in redux slice and
 * pre-registered so `injectSlices` extends it in place. The module's default
 * export is one of these; tests create isolated stores here instead of
 * casting a raw `configureStore` result.
 */
export function createInjectableStore(): MockStore<[typeof reduxSlice]> {
  return buildStore() as unknown as MockStore<[typeof reduxSlice]>;
}

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
  const s = store as unknown as Store;

  let entry = injectables.get(s);
  if (!entry) {
    entry = {root: createRootReducer(), names: new Set()};
    injectables.set(s, entry);
  }

  for (const slice of slices) {
    // Key by `name`, not `reducerPath`: this module's typing (`SlicesState`)
    // keys injected state by the slice name, so the runtime must match
    // regardless of a slice's reducerPath.
    entry.root.inject(
      {reducerPath: slice.name, reducer: slice.reducer},
      {overrideExisting: true},
    );
    entry.names.add(slice.name);
  }

  // `inject` alone defers the new slice's state until the next dispatched
  // action; `replaceReducer` dispatches a REPLACE action, which both wires the
  // combined reducer into the store (first call) and materializes the freshly
  // injected slice state immediately.
  s.replaceReducer(entry.root as Reducer);
  s.dispatch(setCount(entry.names.size));

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
