import {configureStore, combineReducers} from '@reduxjs/toolkit';
import type {Slice} from  '@reduxjs/toolkit'
import {useDispatch, useSelector} from 'react-redux';
import type {Reducer, ReducersMapObject} from 'redux';

import reduxSlice from './reducers/redux';
import type {SlicesState, StateFromStore, StoreWithState, StoreWithAsyncReducers} from './types';

const staticReducers: ReducersMapObject = {
  redux: reduxSlice.reducer as Reducer,
};

const store = configureStore({
  reducer: staticReducers,
   
});

export function injectSlices<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TSlices extends readonly Slice<any, any, string>[]
>(
  slices: TSlices
): StoreWithState<typeof store, StateFromStore<typeof store> & SlicesState<TSlices>> {
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
    typeof store,
    StateFromStore<typeof store> & SlicesState<TSlices>
  >;
}

/** Optional convenience overload for a single slice */
export function injectSlice<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  S extends Slice<any, any, string>
>(slice: S) {
  return injectSlices([slice] as const);
}

export type RootState = ReturnType<typeof store['getState']>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type RootStateFor<TSlices extends readonly Slice<any, any, string>[]> = ReturnType<(StoreWithState<typeof store, StateFromStore<typeof store> & SlicesState<TSlices>>)['getState']>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AppDispatchFor<TSlices extends readonly Slice<any, any, string>[]> = (StoreWithState<typeof store, StateFromStore<typeof store> & SlicesState<TSlices>>)['dispatch'];

export default store;
