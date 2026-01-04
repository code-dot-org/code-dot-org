import {configureStore, combineReducers} from '@reduxjs/toolkit';
import type {Slice} from  '@reduxjs/toolkit'
import {useDispatch, useSelector} from 'react-redux';
import type {AnyAction, Reducer, ReducersMapObject, Store} from 'redux';

import reduxSlice from './reduxSlice';
import type {SlicesState, StoreWithState, StoreWithAsyncReducers} from './types';

const staticReducers: ReducersMapObject = {
  redux: reduxSlice.reducer as Reducer,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type StoreFor<TExtendedStore> = TExtendedStore extends StoreWithState<infer S, any> ? S : never;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type StateFor<TExtendedStore> = TExtendedStore extends StoreWithState<any, infer S> ? S : never;

const initialStore = configureStore({
  reducer: staticReducers,
});

export function injectSlices<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TSlices extends readonly Slice<any, any, string>[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TExtendedStore extends StoreWithState<any, any>, 
>(
  slices: TSlices,
  store: TExtendedStore,
): StoreWithState<StoreFor<TExtendedStore>, StateFor<TExtendedStore> & SlicesState<TSlices>> {
  const s = store as StoreWithAsyncReducers<typeof store>;

  // start from whatever we already have (or an empty object)
  const nextReducers: ReducersMapObject = { ...staticReducers, ...(s.asyncReducers ?? {}) };

  // add/replace each slice reducer under its slice name
  for (const slice of slices) {
    nextReducers[slice.name] = slice.reducer as Reducer;
  }

  s.asyncReducers = nextReducers;

  const root = combineReducers(nextReducers);
  store.replaceReducer(root);

  // refine the type of getState() to include the injected slices
  return store as unknown as StoreWithState<
    StoreFor<TExtendedStore>,
    StateFor<TExtendedStore> & SlicesState<TSlices>
  >;
}

/** Optional convenience overload for a single slice */
export function injectSlice<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  S extends Slice<any, any, string>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TStore extends Store<any, AnyAction>,
>(slice: S, store: TStore) {
  return injectSlices([slice] as const, store);
}

const defaultStore = initialStore as unknown as StoreWithState<typeof initialStore, SlicesState<[typeof reduxSlice]>>;

export type RootState = ReturnType<typeof defaultStore['getState']>;
export type AppDispatch = typeof defaultStore.dispatch;
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AppDispatchFor<TStore extends Store<any, AnyAction>> = TStore['dispatch'];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type MockStore<TSlices extends readonly Slice<any, any, string>[]> = StoreWithState<typeof initialStore, SlicesState<TSlices>>;

export default defaultStore;
