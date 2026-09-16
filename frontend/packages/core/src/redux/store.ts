import {configureStore, combineSlices} from '@reduxjs/toolkit';
import type {
  Dispatch,
  Reducer,
  ThunkDispatch,
  UnknownAction,
} from '@reduxjs/toolkit';
import {useDispatch, useSelector} from 'react-redux';

import reduxSlice, {setCount} from './reduxSlice';
import type {SlicesState, StoreWithState} from './types';

// `StoreWithState<unknown, S>` reduces to exactly `{getState(): S}`:
// Omit over `unknown` contributes no keys, so only the getState overlay
// remains to match against.
export type StateFor<TExtendedStore> =
  TExtendedStore extends StoreWithState<unknown, infer S> ? S : never;

/**
 * The app-wide combined reducer, seeded with the built-in redux slice.
 * `combineSlices` owns the injection mechanics: the reducer map, caching,
 * and override semantics.
 */
const rootReducer = combineSlices(reduxSlice);

/** Names of the slices injected so far, backing `redux.reducerCount`. */
const injectedNames = new Set<string>();

// The one store. `injectSlices` grows it in place; `RootStateProvider`
// provides it; `typeof initialStore` anchors MockStore's base store type.
const initialStore = configureStore({reducer: rootReducer});

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
 * Injects the slices into the app store and returns that store with
 * `getState` widened to include them.
 *
 * A host layering onto a store type another host already widened supplies
 * both type arguments explicitly — the slices tuple first, then the prior
 * store type:
 *
 *   const store = injectSlices<[typeof musicSlice], typeof labStore>([
 *     musicSlice,
 *   ]);
 *
 * TSlices deliberately has no default: TypeScript does not partially infer
 * type arguments, so a lone explicit store type would silently collapse the
 * slices tuple (and the state it contributes) to the default instead of
 * inferring it from the argument.
 */
export function injectSlices<
  TSlices extends readonly SliceLike[],
  // The constraint reduces to `{getState(): unknown}`; it exists so StateFor
  // can extract the state type.
  TExtendedStore extends StoreWithState<unknown, unknown> = typeof defaultStore,
>(
  slices: TSlices,
): StoreWithState<
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
  initialStore.dispatch(setCount(injectedNames.size));

  // refine the type of getState() to include the injected slices
  return initialStore as unknown as StoreWithState<
    TExtendedStore,
    StateFor<TExtendedStore> & SlicesState<TSlices>
  >;
}

/**
 * Typed react-redux hooks derived from a store type. The hooks read the
 * store from the react-redux Provider context at render time; the type
 * argument only shapes their typings. A host store module exports these
 * once:
 *
 *   export const {useAppDispatch, useAppSelector} = storeHooks<typeof store>();
 */
export function storeHooks<
  TStore extends {getState(): unknown; dispatch: Dispatch<UnknownAction>},
>() {
  // Stores from this module carry redux-thunk (configureStore's default
  // middleware), so type dispatch against the store's *widened* state:
  // TStore['dispatch'] alone still carries the pre-injection thunk state,
  // which would reject thunks written for the injected store.
  type AppDispatch = TStore['dispatch'] &
    ThunkDispatch<ReturnType<TStore['getState']>, undefined, UnknownAction>;
  return {
    useAppDispatch: useDispatch.withTypes<AppDispatch>(),
    useAppSelector: useSelector.withTypes<ReturnType<TStore['getState']>>(),
  };
}

const defaultStore = initialStore as unknown as MockStore<[typeof reduxSlice]>;

export default defaultStore;
